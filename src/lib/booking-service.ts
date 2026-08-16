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
import type { BookingFlowMode } from "@/lib/booking-mode";
import { getPrisma } from "@/lib/db";
import { TERMS_VERSION } from "@/lib/legal";
import type { PaymentState } from "@/lib/payments/types";
import { calculatePackageTotal } from "@/lib/tour-pricing";

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

export async function reserveBooking(input: CheckoutRequest, idempotencyKey: string, mode: BookingFlowMode = "payment") {
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
        itinerary: { orderBy: { position: "asc" }, take: 1, select: { timeLabel: true } },
      },
    });
    if (!tour?.published) throw new BookingError("This tour is not available for online booking", "NOT_FOUND", 404);
    if (input.pax > tour.maxGroupSize) throw new BookingError(`This tour accepts up to ${tour.maxGroupSize} travelers`, "INVALID");
    if (tour.addons.length !== input.addonCodes.length) throw new BookingError("One or more selected add-ons are unavailable", "INVALID");
    if (tour.addons.filter((addon) => addon.code.startsWith("pickup-")).length > 1) throw new BookingError("Choose only one pickup area", "INVALID");

    const pickupTime = tour.itinerary[0]?.timeLabel.match(/(?:^|\D)([01]\d|2[0-3]):([0-5]\d)(?:\D|$)/);
    const pickupHour = pickupTime?.[1] ?? "08";
    const pickupMinute = pickupTime?.[2] ?? "00";
    const pickupAt = new Date(`${input.date}T${pickupHour}:${pickupMinute}:00+08:00`);
    if (pickupAt.getTime() - Date.now() < 12 * 60 * 60 * 1000) {
      throw new BookingError("Online booking closes 12 hours before pickup. Please ask us on WhatsApp for a last-minute request.", "INVALID", 409);
    }

    const blackout = await tx.globalBlackoutDate.findUnique({ where: { date }, select: { reason: true } });
    if (blackout) throw new BookingError(`${input.date} is unavailable: ${blackout.reason}`, "INVALID", 409);

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
      const expiredDiscounts = await tx.booking.groupBy({
        by: ["discountCodeId"],
        where: { id: { in: expiredIds }, discountCodeId: { not: null } },
        _count: { _all: true },
      });
      for (const item of expiredDiscounts) {
        if (item.discountCodeId) await tx.discountCode.update({ where: { id: item.discountCodeId }, data: { timesUsed: { decrement: item._count._all } } });
      }
      await tx.availability.update({ where: { id: availability.id }, data: { spotsRemaining: { increment: releasedPax } } });
    }

    const tier = tour.pricingTiers.find((item) => input.pax >= item.minPax && input.pax <= item.maxPax);
    const perPersonIdr = tier?.perPersonIdr ?? tour.basePriceIdr;
    const childPriceIdr = tour.childPriceIdr ?? perPersonIdr;
    const addonRows = tour.addons.map((addon) => ({
      addonId: addon.id,
      quantity: addon.pricingMode === AddonPricingMode.PER_PERSON ? input.pax : 1,
      unitPriceIdr: addon.priceIdr,
      unitCostIdr: addon.costPriceIdr,
    }));
    const addonTotal = addonRows.reduce((sum, addon) => sum + addon.quantity * addon.unitPriceIdr, 0);
    const packageTotalIdr = calculatePackageTotal({
      pricingMode: tour.pricingMode,
      pricingTiers: tour.pricingTiers,
      pax: input.pax,
      adultCount: input.adultCount,
      childCount: input.childCount,
      childPriceIdr,
    });
    const subtotalIdr = packageTotalIdr + addonTotal;

    let enteredDiscount: { id: string; percentOff: number } | null = null;
    if (input.discountCode) {
      const candidate = await tx.discountCode.findUnique({
        where: { code: input.discountCode },
        include: { tours: { where: { tourId: tour.id }, select: { tourId: true } } },
      });
      const now = new Date();
      if (!candidate || candidate.automatic || !candidate.active || (candidate.startsAt && candidate.startsAt > now) || (candidate.endsAt && candidate.endsAt < now) || (!candidate.appliesToAll && candidate.tours.length === 0)) {
        throw new BookingError("That discount code is not valid for this package", "INVALID");
      }
      enteredDiscount = { id: candidate.id, percentOff: candidate.percentOff };
    }
    const automaticDiscount = await tx.discountCode.findFirst({
      where: {
        automatic: true, active: true, startsAt: { lte: date }, endsAt: { gte: date },
        OR: [{ appliesToAll: true }, { tours: { some: { tourId: tour.id } } }],
      },
      orderBy: { percentOff: "desc" },
      select: { id: true, percentOff: true },
    });
    const discount = enteredDiscount && (!automaticDiscount || enteredDiscount.percentOff >= automaticDiscount.percentOff)
      ? enteredDiscount
      : automaticDiscount;
    if (discount) {
      await tx.$queryRaw(Prisma.sql`select id from public.discount_codes where id = ${discount.id}::uuid for update`);
      const locked = await tx.discountCode.findUniqueOrThrow({ where: { id: discount.id } });
      if (!locked.active) throw new BookingError("That discount is no longer active", "INVALID");
      if (locked.usageLimit !== null && locked.timesUsed >= locked.usageLimit) throw new BookingError("That discount has reached its usage limit", "INVALID");
    }
    const discountAmountIdr = discount ? Math.floor(packageTotalIdr * discount.percentOff / 100) : 0;
    const totalAmountIdr = subtotalIdr - discountAmountIdr;

    if (mode === "payment") {
      const reserved = await tx.availability.updateMany({
        where: { id: availability.id, isOpen: true, spotsRemaining: { gte: input.pax } },
        data: { spotsRemaining: { decrement: input.pax } },
      });
      if (reserved.count !== 1) throw new BookingError("Those spots were just taken. Please choose another date or group size.", "SOLD_OUT", 409);
    } else if (!availability.isOpen || availability.spotsRemaining < input.pax) {
      throw new BookingError("This date does not currently have enough space for your group.", "SOLD_OUT", 409);
    }

    const reference = bookingReference(input.date);
    const booking = await tx.booking.create({
      data: {
        reference,
        tourId: tour.id,
        availabilityId: availability.id,
        paxCount: input.pax,
        adultCount: input.adultCount,
        childCount: input.childCount,
        customerName: input.traveler.name,
        customerEmail: input.traveler.email,
        customerPhone: input.traveler.phone,
        customerCountry: input.traveler.country,
        hotelName: input.traveler.hotelName || null,
        notes: input.traveler.notes || null,
        totalAmountIdr,
        baseCostIdrSnapshot: tour.baseCostIdr,
        discountCodeId: discount?.id,
        discountPercent: discount?.percentOff,
        discountAmountIdr,
        status: mode === "request" ? BookingStatus.REQUESTED : BookingStatus.PENDING,
        paymentProvider: mode === "request" ? PaymentProviderName.MANUAL : PaymentProviderName.MIDTRANS,
        paymentStatus: mode === "request" ? PaymentStatus.NOT_REQUIRED : PaymentStatus.PENDING,
        paymentTransactionId: mode === "request" ? null : reference,
        idempotencyKey,
        idempotencyRequestHash: fingerprint,
        heldUntil: new Date(Date.now() + 15 * 60 * 1000),
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
        addons: { create: addonRows },
      },
      include: { tour: true, availability: true },
    });
    if (discount && mode === "payment") await tx.discountCode.update({ where: { id: discount.id }, data: { timesUsed: { increment: 1 } } });
    return { booking, created: true };
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5_000,
    timeout: 8_000,
  }));
}

export async function confirmBookingRequest(bookingId: string) {
  const prisma = getPrisma();
  return retrySerializable(() => prisma.$transaction(async (tx) => {
    const initial = await tx.booking.findUnique({ where: { id: bookingId }, select: { availabilityId: true } });
    if (!initial) throw new BookingError("Booking request was not found", "NOT_FOUND", 404);
    await tx.$queryRaw(Prisma.sql`select id from public.availability where id = ${initial.availabilityId}::uuid for update`);

    const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: { tour: true, availability: true } });
    if (!booking) throw new BookingError("Booking request was not found", "NOT_FOUND", 404);
    if (booking.status !== BookingStatus.REQUESTED) throw new BookingError("Only new booking requests can be confirmed", "INVALID", 409);

    const blackout = await tx.globalBlackoutDate.findUnique({ where: { date: booking.availability.date }, select: { reason: true } });
    if (blackout) throw new BookingError(`This date is unavailable: ${blackout.reason}`, "INVALID", 409);

    const reserved = await tx.availability.updateMany({
      where: { id: booking.availabilityId, isOpen: true, spotsRemaining: { gte: booking.paxCount } },
      data: { spotsRemaining: { decrement: booking.paxCount } },
    });
    if (reserved.count !== 1) throw new BookingError("There is no longer enough availability for this request", "SOLD_OUT", 409);

    if (booking.discountCodeId) {
      await tx.$queryRaw(Prisma.sql`select id from public.discount_codes where id = ${booking.discountCodeId}::uuid for update`);
      const discount = await tx.discountCode.findUniqueOrThrow({ where: { id: booking.discountCodeId } });
      if (discount.usageLimit !== null && discount.timesUsed >= discount.usageLimit) throw new BookingError("The request's discount code has reached its usage limit", "INVALID", 409);
      await tx.discountCode.update({ where: { id: discount.id }, data: { timesUsed: { increment: 1 } } });
    }

    return tx.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CONFIRMED, confirmedAt: new Date() },
      include: { tour: true, availability: true },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5_000, timeout: 8_000 }));
}

export async function cancelBookingRequest(bookingId: string) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const initial = await tx.booking.findUnique({ where: { id: bookingId }, select: { availabilityId: true } });
    if (!initial) throw new BookingError("Booking request was not found", "NOT_FOUND", 404);
    await tx.$queryRaw(Prisma.sql`select id from public.availability where id = ${initial.availabilityId}::uuid for update`);
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking || (booking.status !== BookingStatus.REQUESTED && booking.status !== BookingStatus.CONFIRMED)) {
      throw new BookingError("Only requested or manually confirmed bookings can be cancelled here", "INVALID", 409);
    }

    const released = booking.status === BookingStatus.CONFIRMED;
    const updated = await tx.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
    });
    if (released) {
      await tx.availability.update({ where: { id: booking.availabilityId }, data: { spotsRemaining: { increment: booking.paxCount } } });
      if (booking.discountCodeId) await tx.discountCode.update({ where: { id: booking.discountCodeId }, data: { timesUsed: { decrement: 1 } } });
    }
    return updated;
  });
}

export async function releasePendingBooking(reference: string, paymentStatus: PaymentStatus = PaymentStatus.FAILED) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { reference }, select: { id: true, availabilityId: true, paxCount: true, discountCodeId: true } });
    if (!booking) return false;
    await tx.$queryRaw(Prisma.sql`select id from public.availability where id = ${booking.availabilityId}::uuid for update`);
    const cancelled = await tx.booking.updateMany({
      where: { id: booking.id, status: BookingStatus.PENDING },
      data: { status: BookingStatus.CANCELLED, paymentStatus, cancelledAt: new Date() },
    });
    if (cancelled.count === 1) {
      await tx.availability.update({ where: { id: booking.availabilityId }, data: { spotsRemaining: { increment: booking.paxCount } } });
      if (booking.discountCodeId) await tx.discountCode.update({ where: { id: booking.discountCodeId }, data: { timesUsed: { decrement: 1 } } });
    }
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

export async function markBookingRequestEmailSent(bookingId: string) {
  return getPrisma().booking.updateMany({
    where: { id: bookingId, bookingRequestEmailSentAt: null },
    data: { bookingRequestEmailSentAt: new Date() },
  });
}

export async function markPaymentReceiptEmailSent(bookingId: string) {
  return getPrisma().booking.updateMany({
    where: { id: bookingId, paymentReceiptEmailSentAt: null },
    data: { paymentReceiptEmailSentAt: new Date() },
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
  
