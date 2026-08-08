"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AddonPricingMode, BookingStatus, PaymentStatus, Prisma, TourCategory } from "@/generated/prisma/client";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { applyVerifiedPaymentStatus, markConfirmationEmailSent, releasePendingBooking } from "@/lib/booking-service";
import { getPrisma } from "@/lib/db";
import { sendBookingConfirmation } from "@/lib/email";
import { getPaymentProvider } from "@/lib/payments/provider";

export interface AdminActionState {
  ok: boolean;
  message: string;
  recordId?: string;
}

const initialState: AdminActionState = { ok: false, message: "" };
export { initialState as initialAdminActionState };

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function parseItinerary(value: FormDataEntryValue | null) {
  return lines(value).map((line, position) => {
    const [timeLabel, title, ...descriptionParts] = line.split("|").map((part) => part.trim());
    const description = descriptionParts.join(" | ");
    if (!timeLabel || !title || !description) throw new Error(`Itinerary line ${position + 1} needs time | title | description`);
    return { position, timeLabel, title, description };
  });
}

function parsePricing(value: FormDataEntryValue | null) {
  return lines(value).map((line, index) => {
    const [range, priceText] = line.split("|").map((part) => part.trim());
    const [minText, maxText = minText] = range?.split("-").map((part) => part.trim()) ?? [];
    const minPax = Number(minText);
    const maxPax = Number(maxText);
    const perPersonIdr = Number(priceText);
    if (!Number.isInteger(minPax) || !Number.isInteger(maxPax) || minPax < 1 || maxPax < minPax || !Number.isInteger(perPersonIdr) || perPersonIdr < 0) {
      throw new Error(`Pricing line ${index + 1} needs min-max | price in IDR`);
    }
    return { minPax, maxPax, perPersonIdr };
  });
}

function parseAddons(value: FormDataEntryValue | null) {
  return lines(value).map((line, index) => {
    const [code, title, priceText, modeText, ...descriptionParts] = line.split("|").map((part) => part.trim());
    const priceIdr = Number(priceText);
    const pricingMode = modeText as AddonPricingMode;
    if (!code?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !title || !Number.isInteger(priceIdr) || priceIdr < 0 || !Object.values(AddonPricingMode).includes(pricingMode)) {
      throw new Error(`Add-on line ${index + 1} needs code | title | price | PER_PERSON or PER_BOOKING | description`);
    }
    return { code, title, priceIdr, pricingMode, description: descriptionParts.join(" | ") || null };
  });
}

const tourSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(140),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),
  description: z.string().trim().min(40).max(8_000),
  category: z.enum(TourCategory),
  durationMinutes: z.coerce.number().int().min(30).max(20_160),
  basePriceIdr: z.coerce.number().int().min(0).max(2_000_000_000),
  meetingPoint: z.string().trim().min(3).max(500),
  cancellationPolicy: z.string().trim().min(20).max(3_000),
  maxGroupSize: z.coerce.number().int().min(1).max(50),
  published: z.boolean(),
});

async function mutableSession() {
  const session = await requireAdminPageSession();
  if (session.preview) throw new Error("Preview mode is read-only. Connect Supabase to save changes.");
  return session;
}

export async function saveTourAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const idValue = String(formData.get("id") ?? "").trim();
    const input = tourSchema.parse({
      id: idValue || undefined,
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      category: formData.get("category"),
      durationMinutes: formData.get("durationMinutes"),
      basePriceIdr: formData.get("basePriceIdr"),
      meetingPoint: formData.get("meetingPoint"),
      cancellationPolicy: formData.get("cancellationPolicy"),
      maxGroupSize: formData.get("maxGroupSize"),
      published: formData.get("published") === "on",
    });
    const images = lines(formData.get("images"));
    const inclusions = lines(formData.get("inclusions"));
    const exclusions = lines(formData.get("exclusions"));
    const itinerary = parseItinerary(formData.get("itinerary"));
    const pricingTiers = parsePricing(formData.get("pricingTiers"));
    const addons = parseAddons(formData.get("addons"));
    if (!images.length || !itinerary.length || !pricingTiers.length) throw new Error("Add at least one image, itinerary stop, and pricing tier");

    const prisma = getPrisma();
    const record = await prisma.$transaction(async (tx) => {
      const tourData = {
        title: input.title,
        slug: input.slug,
        description: input.description,
        category: input.category,
        durationMinutes: input.durationMinutes,
        basePriceIdr: input.basePriceIdr,
        images,
        inclusions,
        exclusions,
        meetingPoint: input.meetingPoint,
        cancellationPolicy: input.cancellationPolicy,
        maxGroupSize: input.maxGroupSize,
        published: input.published,
      };
      const tour = input.id
        ? await tx.tour.update({ where: { id: input.id }, data: tourData })
        : await tx.tour.create({ data: tourData });

      await tx.tourItineraryStop.deleteMany({ where: { tourId: tour.id } });
      await tx.tourPricingTier.deleteMany({ where: { tourId: tour.id } });
      await tx.tourItineraryStop.createMany({ data: itinerary.map((stop) => ({ ...stop, tourId: tour.id })) });
      await tx.tourPricingTier.createMany({ data: pricingTiers.map((tier) => ({ ...tier, tourId: tour.id })) });

      const addonCodes = addons.map((addon) => addon.code);
      await tx.tourAddon.updateMany({ where: { tourId: tour.id, code: { notIn: addonCodes } }, data: { active: false } });
      for (const addon of addons) {
        await tx.tourAddon.upsert({
          where: { tourId_code: { tourId: tour.id, code: addon.code } },
          update: { ...addon, active: true },
          create: { ...addon, tourId: tour.id, active: true },
        });
      }
      return tour;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 8_000 });

    revalidatePath("/admin");
    revalidatePath("/admin/tours");
    revalidatePath(`/tours/${record.slug}`);
    return { ok: true, message: input.id ? "Tour updated" : "Tour created", recordId: record.id };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Tour could not be saved" };
  }
}

export async function deleteTourAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const id = z.string().uuid().parse(formData.get("id"));
    const prisma = getPrisma();
    const bookingCount = await prisma.booking.count({ where: { tourId: id } });
    if (bookingCount) throw new Error("Tours with booking history cannot be deleted. Unpublish it instead.");
    await prisma.tour.delete({ where: { id } });
    revalidatePath("/admin/tours");
    return { ok: true, message: "Tour deleted" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Tour could not be deleted" };
  }
}

const availabilitySchema = z.object({
  tourId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  capacity: z.coerce.number().int().min(1).max(50),
});

export async function saveAvailabilityAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const input = availabilitySchema.parse(Object.fromEntries(formData));
    const start = new Date(`${input.startDate}T00:00:00.000Z`);
    const end = new Date(`${input.endDate}T00:00:00.000Z`);
    const dayCount = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    if (dayCount < 1 || dayCount > 90) throw new Error("Choose a date range between 1 and 90 days");
    const dates = Array.from({ length: dayCount }, (_, index) => new Date(start.getTime() + index * 86_400_000));
    const prisma = getPrisma();

    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw(Prisma.sql`
        select id from public.availability
        where tour_id = ${input.tourId}::uuid and date between ${start} and ${end}
        order by date for update
      `);
      const existing = await tx.availability.findMany({ where: { tourId: input.tourId, date: { gte: start, lte: end } } });
      const existingByDate = new Map(existing.map((row) => [row.date.toISOString().slice(0, 10), row]));
      for (const date of dates) {
        const row = existingByDate.get(date.toISOString().slice(0, 10));
        if (!row) continue;
        const reservedSpots = row.capacity - row.spotsRemaining;
        if (input.capacity < reservedSpots) throw new Error(`${row.date.toISOString().slice(0, 10)} already has ${reservedSpots} reserved spots`);
        await tx.availability.update({
          where: { id: row.id },
          data: { capacity: input.capacity, spotsRemaining: input.capacity - reservedSpots, isOpen: true },
        });
      }
      const newDates = dates.filter((date) => !existingByDate.has(date.toISOString().slice(0, 10)));
      if (newDates.length) {
        await tx.availability.createMany({ data: newDates.map((date) => ({ tourId: input.tourId, date, capacity: input.capacity, spotsRemaining: input.capacity, isOpen: true })) });
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 8_000 });

    revalidatePath("/admin/availability");
    return { ok: true, message: `${dayCount} date${dayCount === 1 ? "" : "s"} opened or updated` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Availability could not be saved" };
  }
}

export async function toggleAvailabilityAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const id = z.string().uuid().parse(formData.get("id"));
    const isOpen = z.enum(["true", "false"]).transform((value) => value === "true").parse(formData.get("isOpen"));
    await getPrisma().availability.update({ where: { id }, data: { isOpen } });
    revalidatePath("/admin/availability");
    return { ok: true, message: isOpen ? "Date reopened" : "Date closed to new bookings" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Availability could not be changed" };
  }
}

export async function updateBookingAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const id = z.string().uuid().parse(formData.get("id"));
    const action = z.enum(["cancel", "recheck"]).parse(formData.get("action"));
    const prisma = getPrisma();
    const booking = await prisma.booking.findUnique({ where: { id }, include: { tour: true, availability: true } });
    if (!booking) throw new Error("Booking was not found");

    if (action === "cancel") {
      const cancelled = await releasePendingBooking(booking.reference, PaymentStatus.CANCELLED);
      if (!cancelled) throw new Error("Only pending bookings can be cancelled directly");
      revalidatePath("/admin/bookings");
      return { ok: true, message: "Pending booking cancelled and capacity restored" };
    }

    if (!booking.paymentTransactionId) throw new Error("This booking has no provider transaction to recheck");
    const providerStatus = await getPaymentProvider().getTransactionStatus(booking.paymentTransactionId);
    const updated = await applyVerifiedPaymentStatus(providerStatus.transactionId, providerStatus.state, providerStatus.grossAmountIdr);
    if (updated.status === BookingStatus.PAID && !updated.confirmationEmailSentAt) {
      after(async () => {
        try {
          await sendBookingConfirmation(updated);
          await markConfirmationEmailSent(updated.id);
        } catch {
          // The booking is paid even if email delivery needs a later retry.
        }
      });
    }
    revalidatePath("/admin/bookings");
    return { ok: true, message: `Provider status is ${providerStatus.providerStatus}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Booking could not be updated" };
  }
}
