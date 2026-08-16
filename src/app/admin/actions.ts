"use server";

import { randomUUID } from "node:crypto";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AddonPricingMode, BookingStatus, PaymentStatus, Prisma, TourCategory, TourPricingMode } from "@/generated/prisma/client";
import type { AdminActionState } from "@/lib/admin-action-state";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { applyVerifiedPaymentStatus, cancelBookingRequest, confirmBookingRequest, markBookingRequestEmailSent, markConfirmationEmailSent, markPaymentReceiptEmailSent, releasePendingBooking } from "@/lib/booking-service";
import { getPrisma } from "@/lib/db";
import { sendBookingConfirmation, sendBookingRequestEmails, sendPaymentReceipt } from "@/lib/email";
import { getPaymentProvider } from "@/lib/payments/provider";

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
    const [code, title, priceText, modeText, costText, ...descriptionParts] = line.split("|").map((part) => part.trim());
    const priceIdr = Number(priceText);
    const costPriceIdr = costText === "" ? null : Number(costText);
    const pricingMode = modeText as AddonPricingMode;
    if (!code?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !title || !Number.isInteger(priceIdr) || priceIdr < 0 || (costPriceIdr !== null && (!Number.isInteger(costPriceIdr) || costPriceIdr < 0)) || !Object.values(AddonPricingMode).includes(pricingMode)) {
      throw new Error(`Add-on line ${index + 1} needs code | title | selling price | PER_PERSON or PER_BOOKING | internal cost | description`);
    }
    return { code, title, priceIdr, costPriceIdr, pricingMode, description: descriptionParts.join(" | ") || null };
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
  pricingMode: z.enum(TourPricingMode),
  baseCostIdr: z.union([z.literal(""), z.coerce.number().int().min(0).max(2_000_000_000)]),
  childPriceIdr: z.union([z.literal(""), z.coerce.number().int().min(0).max(2_000_000_000)]),
  childAgeLabel: z.string().trim().max(80),
  location: z.string().trim().min(2).max(120),
  cardNote: z.string().trim().min(3).max(120),
  featured: z.boolean(),
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
      pricingMode: formData.get("pricingMode"),
      baseCostIdr: formData.get("baseCostIdr"),
      childPriceIdr: formData.get("childPriceIdr"),
      childAgeLabel: formData.get("childAgeLabel"),
      location: formData.get("location"),
      cardNote: formData.get("cardNote"),
      featured: formData.get("featured") === "on",
      meetingPoint: formData.get("meetingPoint"),
      cancellationPolicy: formData.get("cancellationPolicy"),
      maxGroupSize: formData.get("maxGroupSize"),
      published: formData.get("published") === "on",
    });
    const images = lines(formData.get("images"));
    const imageAlts = lines(formData.get("imageAlts"));
    const inclusions = lines(formData.get("inclusions"));
    const exclusions = lines(formData.get("exclusions"));
    const itinerary = parseItinerary(formData.get("itinerary"));
    const pricingTiers = parsePricing(formData.get("pricingTiers"));
    const addons = parseAddons(formData.get("addons"));
    if (!images.length || !itinerary.length || !pricingTiers.length) throw new Error("Add at least one image, itinerary stop, and pricing tier");
    if (images.some((image) => { try { const url = new URL(image); return !["http:", "https:"].includes(url.protocol); } catch { return true; } })) throw new Error("Every image must be a valid http or https URL");
    if (imageAlts.length !== images.length) throw new Error("Add one image description for each image URL");
    const orderedTiers = pricingTiers.toSorted((a, b) => a.minPax - b.minPax);
    if (orderedTiers[0].minPax !== 1 || orderedTiers.some((tier, index) => index > 0 && tier.minPax !== orderedTiers[index - 1].maxPax + 1) || orderedTiers.at(-1)!.maxPax < input.maxGroupSize) {
      throw new Error(`Pricing tiers must cover every group size from 1 to ${input.maxGroupSize} without gaps or overlaps`);
    }

    const prisma = getPrisma();
    const record = await prisma.$transaction(async (tx) => {
      const tourData = {
        title: input.title,
        slug: input.slug,
        description: input.description,
        category: input.category,
        durationMinutes: input.durationMinutes,
        basePriceIdr: input.basePriceIdr,
        pricingMode: input.pricingMode,
        baseCostIdr: input.baseCostIdr === "" ? null : input.baseCostIdr,
        childPriceIdr: input.childPriceIdr === "" ? null : input.childPriceIdr,
        childAgeLabel: input.childPriceIdr === "" ? null : input.childAgeLabel || null,
        location: input.location,
        cardNote: input.cardNote,
        featured: input.featured,
        images,
        imageAlts,
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
    revalidatePath("/");
    revalidatePath("/tours");
    revalidatePath("/checkout");
    revalidatePath("/tours/[slug]", "page");
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
      const blackouts = await tx.globalBlackoutDate.findMany({ where: { date: { gte: start, lte: end } }, select: { date: true } });
      const blackoutDates = new Set(blackouts.map((row) => row.date.toISOString().slice(0, 10)));
      const existing = await tx.availability.findMany({ where: { tourId: input.tourId, date: { gte: start, lte: end } } });
      const existingByDate = new Map(existing.map((row) => [row.date.toISOString().slice(0, 10), row]));
      for (const date of dates) {
        if (blackoutDates.has(date.toISOString().slice(0, 10))) continue;
        const row = existingByDate.get(date.toISOString().slice(0, 10));
        if (!row) continue;
        const reservedSpots = row.capacity - row.spotsRemaining;
        if (input.capacity < reservedSpots) throw new Error(`${row.date.toISOString().slice(0, 10)} already has ${reservedSpots} reserved spots`);
        await tx.availability.update({
          where: { id: row.id },
          data: { capacity: input.capacity, spotsRemaining: input.capacity - reservedSpots, isOpen: true },
        });
      }
      const newDates = dates.filter((date) => !existingByDate.has(date.toISOString().slice(0, 10)) && !blackoutDates.has(date.toISOString().slice(0, 10)));
      if (newDates.length) {
        await tx.availability.createMany({ data: newDates.map((date) => ({ tourId: input.tourId, date, capacity: input.capacity, spotsRemaining: input.capacity, isOpen: true })) });
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 8_000 });

    revalidatePath("/admin/availability");
    return { ok: true, message: `${dayCount} date${dayCount === 1 ? "" : "s"} processed; global closure dates stayed blocked` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Availability could not be saved" };
  }
}

export async function toggleAvailabilityAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const id = z.string().uuid().parse(formData.get("id"));
    const isOpen = z.enum(["true", "false"]).transform((value) => value === "true").parse(formData.get("isOpen"));
    if (isOpen) {
      const row = await getPrisma().availability.findUnique({ where: { id }, select: { date: true } });
      if (!row) throw new Error("Availability date was not found");
      const blackout = await getPrisma().globalBlackoutDate.findUnique({ where: { date: row.date } });
      if (blackout) throw new Error(`This date is globally blocked: ${blackout.reason}`);
    }
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
    const action = z.enum(["cancel", "recheck", "confirm", "resend_request", "resend_confirmation"]).parse(formData.get("action"));
    const prisma = getPrisma();
    const booking = await prisma.booking.findUnique({ where: { id }, include: { tour: true, availability: true } });
    if (!booking) throw new Error("Booking was not found");

    if (action === "cancel") {
      if (booking.status === BookingStatus.REQUESTED || booking.status === BookingStatus.CONFIRMED) {
        await cancelBookingRequest(booking.id);
      } else {
        const cancelled = await releasePendingBooking(booking.reference, PaymentStatus.CANCELLED);
        if (!cancelled) throw new Error("Only requests and pending bookings can be cancelled directly");
      }
      revalidatePath("/admin/bookings");
      return { ok: true, message: "Booking cancelled; reserved capacity was restored when applicable" };
    }

    if (action === "resend_request") {
      if (booking.status !== BookingStatus.REQUESTED) throw new Error("Only an open request can receive the request email");
      await sendBookingRequestEmails(booking);
      await markBookingRequestEmailSent(booking.id);
      revalidatePath("/admin/bookings");
      return { ok: true, message: "Request email sent to the guest and operator" };
    }

    if (action === "resend_confirmation") {
      if (booking.status !== BookingStatus.CONFIRMED && !booking.confirmedAt) throw new Error("Confirm the package before sending its confirmation email");
      await sendBookingConfirmation(booking);
      await markConfirmationEmailSent(booking.id);
      revalidatePath("/admin/bookings");
      return { ok: true, message: "Confirmation email sent" };
    }

    if (action === "confirm") {
      if (booking.status !== BookingStatus.REQUESTED && booking.status !== BookingStatus.PAID) throw new Error("Only a booking request or verified payment can be confirmed");
      const updated = booking.status === BookingStatus.REQUESTED
        ? await confirmBookingRequest(booking.id)
        : await prisma.booking.update({ where: { id }, data: { confirmedAt: booking.confirmedAt ?? new Date() }, include: { tour: true, availability: true } });
      if (!updated.confirmationEmailSentAt) {
        after(async () => {
          try { await sendBookingConfirmation(updated); await markConfirmationEmailSent(updated.id); } catch { /* Admin can retry confirmation. */ }
        });
      }
      revalidatePath("/admin/bookings");
      return { ok: true, message: "Package confirmed, capacity reserved, and confirmation email queued" };
    }

    if (!booking.paymentTransactionId) throw new Error("This booking has no provider transaction to recheck");
    const providerStatus = await getPaymentProvider().getTransactionStatus(booking.paymentTransactionId);
    const updated = await applyVerifiedPaymentStatus(providerStatus.transactionId, providerStatus.state, providerStatus.grossAmountIdr);
    if (updated.status === BookingStatus.PAID && !updated.paymentReceiptEmailSentAt) {
      after(async () => {
        try {
          await sendPaymentReceipt(updated);
          await markPaymentReceiptEmailSent(updated.id);
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

const discountSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,30}$/),
  percentOff: z.coerce.number().int().min(1).max(50),
  startsAt: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
  endsAt: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
  usageLimit: z.union([z.literal(""), z.coerce.number().int().min(1).max(1_000_000)]),
  appliesToAll: z.boolean(),
});

const seasonalDiscountSchema = z.object({
  name: z.string().trim().min(3).max(80),
  percentOff: z.coerce.number().int().min(1).max(50),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appliesToAll: z.boolean(),
});

export async function saveSeasonalDiscountAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const input = seasonalDiscountSchema.parse({
      name: formData.get("name"), percentOff: formData.get("percentOff"), startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"), appliesToAll: formData.get("appliesToAll") === "on",
    });
    const tourIds = formData.getAll("tourIds").map(String).filter(Boolean);
    if (!input.appliesToAll && tourIds.length === 0) throw new Error("Choose at least one package or apply the offer to all packages");
    const startsAt = new Date(`${input.startsAt}T00:00:00+08:00`);
    const endsAt = new Date(`${input.endsAt}T23:59:59+08:00`);
    if (endsAt < startsAt) throw new Error("End date must be on or after the start date");
    await getPrisma().discountCode.create({
      data: {
        code: `AUTO-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`,
        name: input.name,
        automatic: true,
        percentOff: input.percentOff,
        startsAt,
        endsAt,
        appliesToAll: input.appliesToAll,
        tours: input.appliesToAll ? undefined : { create: tourIds.map((tourId) => ({ tourId })) },
      },
    });
    revalidatePath("/admin/commerce");
    revalidatePath("/checkout");
    revalidatePath("/");
    revalidatePath("/tours");
    revalidatePath("/tours/[slug]", "page");
    return { ok: true, message: `${input.name} will apply automatically` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Seasonal offer could not be created" };
  }
}

export async function saveDiscountAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const input = discountSchema.parse({
      code: formData.get("code"), percentOff: formData.get("percentOff"), startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"), usageLimit: formData.get("usageLimit"), appliesToAll: formData.get("appliesToAll") === "on",
    });
    const tourIds = formData.getAll("tourIds").map(String).filter(Boolean);
    if (!input.appliesToAll && tourIds.length === 0) throw new Error("Choose at least one package or apply the code to all packages");
    const startsAt = input.startsAt ? new Date(`${input.startsAt}T00:00:00+08:00`) : null;
    const endsAt = input.endsAt ? new Date(`${input.endsAt}T23:59:59+08:00`) : null;
    if (startsAt && endsAt && endsAt < startsAt) throw new Error("End date must be on or after the start date");
    await getPrisma().discountCode.create({
      data: {
        code: input.code, automatic: false, percentOff: input.percentOff, startsAt, endsAt,
        usageLimit: input.usageLimit === "" ? null : input.usageLimit,
        appliesToAll: input.appliesToAll,
        tours: input.appliesToAll ? undefined : { create: tourIds.map((tourId) => ({ tourId })) },
      },
    });
    revalidatePath("/admin/commerce");
    return { ok: true, message: `Discount ${input.code} created` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Discount could not be created" };
  }
}

export async function toggleDiscountAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const id = z.string().uuid().parse(formData.get("id"));
    const active = z.enum(["true", "false"]).transform((value) => value === "true").parse(formData.get("active"));
    await getPrisma().discountCode.update({ where: { id }, data: { active } });
    revalidatePath("/admin/commerce");
    revalidatePath("/");
    revalidatePath("/tours");
    revalidatePath("/tours/[slug]", "page");
    return { ok: true, message: active ? "Discount activated" : "Discount paused" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Discount could not be changed" };
  }
}

const blackoutSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), reason: z.string().trim().min(3).max(160) });

export async function saveBlackoutAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const input = blackoutSchema.parse(Object.fromEntries(formData));
    const date = new Date(`${input.date}T00:00:00.000Z`);
    await getPrisma().$transaction([
      getPrisma().globalBlackoutDate.upsert({ where: { date }, update: { reason: input.reason }, create: { date, reason: input.reason } }),
      getPrisma().availability.updateMany({ where: { date }, data: { isOpen: false } }),
    ]);
    revalidatePath("/admin/commerce");
    revalidatePath("/admin/availability");
    return { ok: true, message: `${input.date} blocked across all packages` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Closure date could not be saved" };
  }
}

export async function deleteBlackoutAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const value = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(formData.get("date"));
    await getPrisma().globalBlackoutDate.delete({ where: { date: new Date(`${value}T00:00:00.000Z`) } });
    revalidatePath("/admin/commerce");
    return { ok: true, message: "Closure removed. Existing tour dates remain closed until reopened from Calendar." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Closure date could not be removed" };
  }
}
