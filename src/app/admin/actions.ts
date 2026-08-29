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

const idrValue = z.coerce.number().int().min(0).max(2_000_000_000);
const nullableIdrValue = z.union([z.literal(""), z.null(), idrValue]).transform((value) => value === "" ? null : value);
const codeValue = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase code with hyphens only").max(80);

const structuredTourSchema = z.object({
  itinerary: z.array(z.object({
    timeLabel: z.string().trim().min(1, "Every itinerary stop needs a time or timing label").max(80),
    title: z.string().trim().min(2, "Every itinerary stop needs a title").max(160),
    description: z.string().trim().min(3, "Every itinerary stop needs a description").max(1_000),
  })).min(1, "Add at least one itinerary stop").max(30),
  inclusions: z.array(z.string().trim().min(2).max(300)).min(1, "Add at least one inclusion").max(40),
  exclusions: z.array(z.string().trim().min(2).max(300)).min(1, "Add at least one exclusion").max(40),
  pricingTiers: z.array(z.object({
    minPax: z.coerce.number().int().min(1).max(50),
    maxPax: z.coerce.number().int().min(1).max(50),
    perPersonIdr: idrValue,
  })).min(1, "Add at least one pricing tier").max(50),
  addons: z.array(z.object({
    code: codeValue,
    title: z.string().trim().min(2).max(160),
    priceIdr: idrValue,
    costPriceIdr: nullableIdrValue,
    pricingMode: z.enum(AddonPricingMode),
    description: z.string().trim().max(500).nullable().transform((value) => value || null),
    active: z.boolean(),
  })).max(50),
  variants: z.array(z.object({
    code: codeValue,
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().max(500).nullable().transform((value) => value || null),
    priceAdjustmentIdr: z.coerce.number().int().min(-2_000_000_000).max(2_000_000_000),
    supplierUnitCostIdr: idrValue,
    guestsPerUnit: z.coerce.number().int().min(1).max(20),
    remainderCostIdr: idrValue,
    isDefault: z.boolean(),
    active: z.boolean(),
  })).max(30),
}).superRefine((value, context) => {
  if (new Set(value.addons.map((addon) => addon.code)).size !== value.addons.length) {
    context.addIssue({ code: "custom", path: ["addons"], message: "Add-on codes must be unique" });
  }
  if (new Set(value.variants.map((variant) => variant.code)).size !== value.variants.length) {
    context.addIssue({ code: "custom", path: ["variants"], message: "Package option codes must be unique" });
  }
  const activeVariants = value.variants.filter((variant) => variant.active);
  if (activeVariants.length && activeVariants.filter((variant) => variant.isDefault).length !== 1) {
    context.addIssue({ code: "custom", path: ["variants"], message: "Choose exactly one default active package option" });
  }
  value.variants.forEach((variant, index) => {
    if (!variant.active && variant.isDefault) context.addIssue({ code: "custom", path: ["variants", index, "isDefault"], message: "An inactive option cannot be the default" });
  });
});

function parseStructuredTour(value: FormDataEntryValue | null) {
  if (typeof value !== "string") throw new Error("The structured tour details are missing");
  try {
    return structuredTourSchema.parse(JSON.parse(value));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("The structured tour details could not be read");
    throw error;
  }
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
  perPaxCostIdr: z.union([z.literal(""), z.coerce.number().int().min(0).max(2_000_000_000)]),
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
      perPaxCostIdr: formData.get("perPaxCostIdr"),
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
    const structured = parseStructuredTour(formData.get("structuredTourData"));
    const { inclusions, exclusions, pricingTiers, addons, variants } = structured;
    const itinerary = structured.itinerary.map((stop, position) => ({ ...stop, position }));
    if (!images.length) throw new Error("Add at least one image");
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
        perPaxCostIdr: input.perPaxCostIdr === "" ? null : input.perPaxCostIdr,
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
          update: addon,
          create: { ...addon, tourId: tour.id },
        });
      }
      const variantCodes = variants.map((variant) => variant.code);
      await tx.tourVariant.updateMany({ where: { tourId: tour.id }, data: { isDefault: false } });
      await tx.tourVariant.updateMany({ where: { tourId: tour.id, code: { notIn: variantCodes } }, data: { active: false, isDefault: false } });
      for (const variant of variants) {
        await tx.tourVariant.upsert({
          where: { tourId_code: { tourId: tour.id, code: variant.code } },
          update: variant,
          create: { ...variant, tourId: tour.id },
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
    const message = error instanceof z.ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : "Tour could not be saved";
    return { ok: false, message: message || "Tour could not be saved" };
  }
}

export async function copyPickupRulesAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  try {
    await mutableSession();
    const sourceTourId = z.string().uuid().parse(formData.get("sourceTourId"));
    const targetTourIds = z.array(z.string().uuid()).min(1, "Choose at least one destination tour").max(100).parse(formData.getAll("targetTourIds"));
    const uniqueTargetIds = [...new Set(targetTourIds)].filter((id) => id !== sourceTourId);
    if (!uniqueTargetIds.length) throw new Error("Choose at least one destination tour other than the source");

    const prisma = getPrisma();
    const [sourceRules, targetTours] = await Promise.all([
      prisma.tourAddon.findMany({ where: { tourId: sourceTourId, code: { startsWith: "pickup-" } } }),
      prisma.tour.findMany({ where: { id: { in: uniqueTargetIds } }, select: { id: true, slug: true } }),
    ]);
    if (!sourceRules.length) throw new Error("The source tour does not have any pickup rules to copy");
    if (targetTours.length !== uniqueTargetIds.length) throw new Error("One or more destination tours could not be found");

    await prisma.$transaction(async (tx) => {
      await tx.tourAddon.updateMany({
        where: { tourId: { in: uniqueTargetIds }, code: { startsWith: "pickup-" } },
        data: { active: false },
      });
      for (const rule of sourceRules) {
        const data = {
          title: rule.title,
          description: rule.description,
          priceIdr: rule.priceIdr,
          costPriceIdr: rule.costPriceIdr,
          pricingMode: rule.pricingMode,
          active: rule.active,
        };
        await tx.tourAddon.updateMany({
          where: { tourId: { in: uniqueTargetIds }, code: rule.code },
          data,
        });
        await tx.tourAddon.createMany({
          data: uniqueTargetIds.map((tourId) => ({ ...data, tourId, code: rule.code })),
          skipDuplicates: true,
        });
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 12_000 });

    revalidatePath("/admin/tours");
    revalidatePath("/checkout");
    for (const tour of targetTours) revalidatePath(`/tours/${tour.slug}`);
    return { ok: true, message: `Pickup rules copied to ${targetTours.length} ${targetTours.length === 1 ? "tour" : "tours"}` };
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : "Pickup rules could not be copied";
    return { ok: false, message: message || "Pickup rules could not be copied" };
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
