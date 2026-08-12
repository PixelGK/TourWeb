import "server-only";

import { createHash, randomBytes } from "node:crypto";

import {
  AddonPricingMode,
  BookingStatus,
  PaymentProviderName,
  PaymentStatus,
  Prisma,
  type Booking,
} from "@/generated/prisma/client";
import type { CheckoutRequest } from "@/lib/checkout-validation";
import { getPrisma } from "@/lib/db";
import { TERMS_VERSION } from "@/lib/legal";
import type { PaymentState } from "@/lib/payments/types";

export class BookingError extends Error {
  constructor(message: string, public readonly code: "NOT_FOUND" | "SOLD_OUT" | "CONFLICT" | "INVALID", public readonly status = 400) {
    super(message);
  }
}

function requestHash(input: CheckoutRequest) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function bookingReference(date: string) {
  return `BX-${date.replaceAll("-", "")}-${randomBytes(12).toString("hex").toUpperCase()}`;
}

async function retrySerializable<T>(operation: () => Promise<T>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error("Transaction retry exhausted");
}

export async function reserveBooking(input: CheckoutRequest, idempotencyKey: string) {
  const prisma = getPrisma();
  const fingerprint = requestHash(input);
  const date = new Date(`${input.date}T00:00:00.000Z`);

  return retrySerializable(() => prisma.$transaction(async (tx) => {
    const existing = await tx.booking.findUnique({ where: { idempotencyKey }, include: { tour: true, availability: true } });
    if (existing) {
      if (existing.idempotencyRequestHash !== fingerprint) throw new BookingError("This retry key was already used for different booking details", "CONFLICT", 409);
      return { booking: existing, created: false };
    }

    const tour = await tx.tour.findUnique({
      where: { slug: input.tourSlug },
      include: {
        pricingTiers: { orderBy: { minPax: "asc" } },
        addons: { where: { active: true, code: { in: input.addonCodes } } },
        availability: { where: { date, isOpen: true }, take: 1 },
      },
    });
    if (!tour?.published) throw new BookingError("This tour is not available for online booking", "NOT_FOUND", 404);
    if (input.pax > tour.maxGroupSize) throw new BookingError(`This tour accepts up to ${tour.maxGroupSize} travelers`, "INVALID");
    if (tour.addons.length !== input.addonCodes.length) throw new BookingError("One or more selected add-ons are unavailable", "INVALID");

    const availability = tour.availability[0];
    if (!availability) throw new BookingError("That date is not open for booking", "SOLD_OUT", 409);

    await tx.$queryRaw(Prisma.sql`select id from public.availability where id = ${availability.id}::uuid for update`);

    const expired = await tx.booking.findMany({
      where: { availabilityId: availability.id, status: BookingStatus.PENDING, heldUntil: { lte: new Date() } },
      select: { id: true, paxCount: true },
    });
    if (expired.length) {
      const expiredIds = expired.map((booking) => booking.id);
      const releasedPax = expired.reduce((sum, booking) => sum + booking.paxCount, 0);
      await tx.booking.updateMany({
        where: { id: { in: expiredIds }, status: BookingStatus.PENDING },
        data: { status: BookingStatus.CANCELLED, paymentStatus: PaymentStatus.EXPIRED, cancelledAt: new Date() },
      });
      await tx.availability.update({ where: { id: availability.id }, data: { spotsRemaining: { increment: releasedPax } } });
    }

    const tier = tour.pricingTiers.find((item) => input.pax >= item.minPax && input.pax <= item.maxPax);
    const perPersonIdr = tier?.perPersonIdr ?? tour.basePriceIdr;
    const addonRows = tour.addons.map((addon) => ({
      addonId: addon.id,
      quantity: addon.pricingMode === AddonPricingMode.PER_PERSON ? input.pax : 1,
      unitPriceIdr: addon.priceIdr,
    }));
    const addonTotal = addonRows.reduce((sum, addon) => sum + addon.quantity * addon.unitPriceIdr, 0);
    const totalAmountIdr = perPersonIdr * input.pax + addonTotal;

    const reserved = await tx.availability.updateMany({
      where: { id: availability.id, isOpen: true, spotsRemaining: { gte: input.pax } },
      data: { spotsRemaining: { decrement: input.pax } },
    });
    if (reserved.count !== 1) throw new BookingError("Those spots were just taken. Please choose another date or group size.", "SOLD_OUT", 409);

    const reference = bookingReference(input.date);
    const booking = await tx.booking.create({
      data: {
        reference,
        tourId: tour.id,
        availabilityId: availability.id,
        paxCount: input.pax,
        customerName: input.traveler.name,
        customerEmail: input.traveler.email,
        customerPhone: input.traveler.phone,
        customerCountry: input.traveler.country,
        hotelName: input.traveler.hotelName || null,
        notes: input.traveler.notes || null,
        totalAmountIdr,
        paymentProvider: PaymentProviderName.MIDTRANS,
        paymentTransactionId: reference,
        idempotencyKey,
        idempotencyRequestHash: fingerprint,
        heldUntil: new Date(Date.now() + 15 * 60 * 1000),
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
        addons: { create: addonRows },
      },
      include: { tour: true, availability: true },
    });
    return { booking, created: true };
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5_000,
    timeout: 8_000,
  }));
}

export async function releasePendingBooking(reference: string, paymentStatus: PaymentStatus = PaymentStatus.FAILED) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { reference }, select: { id: true, availabilityId: true, paxCount: true } });
    if (!booking) return false;
    await tx.$queryRaw(Prisma.sql`select id from public.availability where id = ${booking.availabilityId}::uuid for update`);
    const cancelled = await tx.booking.updateMany({
      where: { id: booking.id, status: BookingStatus.PENDING },
      data: { status: BookingStatus.CANCELLED, paymentStatus, cancelledAt: new Date() },
    });
    if (cancelled.count === 1) await tx.availability.update({ where: { id: booking.availabilityId }, data: { spotsRemaining: { increment: booking.paxCount } } });
    return cancelled.count === 1;
  });
}

function toDbPaymentStatus(state: PaymentState) {
  const statuses: Record<PaymentState, PaymentStatus> = {
    pending: PaymentStatus.PENDING,
    paid: PaymentStatus.PAID,
    failed: PaymentStatus.FAILED,
    cancelled: PaymentStatus.CANCELLED,
    expired: PaymentStatus.EXPIRED,
    refunded: PaymentStatus.REFUNDED,
  };
  return statuses[state];
}

export async function applyVerifiedPaymentStatus(transactionId: string, state: PaymentState, grossAmountIdr: number) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const initial = await tx.booking.findUnique({ where: { paymentTransactionId: transactionId }, select: { id: true, availabilityId: true } });
    if (!initial) throw new BookingError("Booking transaction was not found", "NOT_FOUND", 404);
    await tx.$queryRaw(Prisma.sql`select id from public.availability where id = ${initial.availabilityId}::uuid for update`);

    const booking = await tx.booking.findUnique({ where: { id: initial.id }, include: { tour: true, availability: true } });
    if (!booking) throw new BookingError("Booking was not found", "NOT_FOUND", 404);
    if (booking.totalAmountIdr !== grossAmountIdr || booking.currency !== "IDR") throw new BookingError("Payment amount does not match the booking", "INVALID", 409);

    const paymentStatus = toDbPaymentStatus(state);
    let released = false;
    if (state === "paid") {
      await tx.booking.updateMany({
        where: { id: booking.id, status: BookingStatus.PENDING },
        data: { status: BookingStatus.PAID, paymentStatus, paidAt: new Date() },
      });
    } else if (state === "refunded") {
      const changed = await tx.booking.updateMany({
        where: { id: booking.id, status: BookingStatus.PAID },
        data: { status: BookingStatus.REFUNDED, paymentStatus, cancelledAt: new Date() },
      });
      released = changed.count === 1;
    } else if (state === "failed" || state === "cancelled" || state === "expired") {
      const changed = await tx.booking.updateMany({
        where: { id: booking.id, status: BookingStatus.PENDING },
        data: { status: BookingStatus.CANCELLED, paymentStatus, cancelledAt: new Date() },
      });
      released = changed.count === 1;
    } else if (booking.status === BookingStatus.PENDING) {
      await tx.booking.update({ where: { id: booking.id }, data: { paymentStatus } });
    }

    if (released) await tx.availability.update({ where: { id: booking.availabilityId }, data: { spotsRemaining: { increment: booking.paxCount } } });
    return tx.booking.findUniqueOrThrow({ where: { id: booking.id }, include: { tour: true, availability: true } });
  });
}

export type BookingWithTour = Awaited<ReturnType<typeof applyVerifiedPaymentStatus>>;

export async function markConfirmationEmailSent(bookingId: string) {
  return getPrisma().booking.updateMany({
    where: { id: bookingId, confirmationEmailSentAt: null },
    data: { confirmationEmailSentAt: new Date() },
  });
}

export function toPaymentBooking(booking: Booking & { tour: { title: string } }) {
  return {
    reference: booking.reference,
    tourTitle: booking.tour.title,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    paxCount: booking.paxCount,
    totalAmountIdr: booking.totalAmountIdr,
  };
}
