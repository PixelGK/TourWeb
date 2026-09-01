import "server-only";

import { BookingStatus, Prisma } from "@/generated/prisma/client";
import { mockAdminBookings, mockUpcomingAvailability } from "@/data/mock-admin";
import { getMockAddons } from "@/data/mock-addons";
import { getMockVariants } from "@/data/mock-variants";
import { getTourDetail } from "@/data/mock-tour-details";
import { allTours, topTours } from "@/data/mock-tours";
import { getPrisma } from "@/lib/db";
import { hasDatabaseConfiguration } from "@/lib/server-env";
import { calculatePackageTotal, calculateVariantPriceAdjustment, calculateVariantSupplierCost, getTierPrice } from "@/lib/tour-pricing";
import { evaluateTourReadiness, type TourReadinessIssue, type TourReadinessStatus } from "@/lib/tour-readiness";

export interface AdminTourRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  durationMinutes: number;
  basePriceIdr: number;
  pricingMode: "PER_PERSON" | "PER_VEHICLE";
  maxGroupSize: number;
  published: boolean;
  bookingCount: number;
  openDateCount: number;
  readinessStatus: TourReadinessStatus;
  readinessIssues: TourReadinessIssue[];
}

export interface AdminBookingRow {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tourId: string;
  tourTitle: string;
  date: string;
  paxCount: number;
  totalAmountIdr: number;
  status: string;
  paymentStatus: string;
  confirmed: boolean;
  requestEmailSent: boolean;
  confirmationEmailSent: boolean;
  createdAt: string;
}

export interface AdminAvailabilityRow {
  id: string;
  tourId: string;
  tourTitle: string;
  date: string;
  capacity: number;
  spotsRemaining: number;
  activeBookings: number;
  isOpen: boolean;
}

export interface BookingFilters {
  status?: string;
  tourId?: string;
  query?: string;
}

export interface AdminTourEditorData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  durationMinutes: number;
  basePriceIdr: number;
  pricingMode: "PER_PERSON" | "PER_VEHICLE";
  baseCostIdr: number | null;
  perPaxCostIdr: number | null;
  childPriceIdr: number | null;
  childAgeLabel: string | null;
  location: string;
  cardNote: string;
  featured: boolean;
  images: string[];
  imageAlts: string[];
  inclusions: string[];
  exclusions: string[];
  meetingPoint: string;
  cancellationPolicy: string;
  maxGroupSize: number;
  published: boolean;
  itinerary: Array<{ timeLabel: string; title: string; description: string }>;
  pricingTiers: Array<{ minPax: number; maxPax: number; perPersonIdr: number }>;
  addons: Array<{ code: string; title: string; priceIdr: number; costPriceIdr: number | null; pricingMode: string; description: string | null; active: boolean }>;
  variants: Array<{ code: string; title: string; description: string | null; priceAdjustmentIdr: number; supplierUnitCostIdr: number; guestsPerUnit: number; remainderCostIdr: number; isDefault: boolean; active: boolean }>;
}

export interface AdminMarginTourRow {
  id: string;
  title: string;
  published: boolean;
  pricingMode: "PER_PERSON" | "PER_VEHICLE";
  examplePax: number;
  customerUnitPriceIdr: number;
  packageRevenueIdr: number;
  variantTitle: string | null;
  variantPriceAdjustmentIdr: number;
  variantSupplierCostIdr: number;
  exampleRevenueIdr: number;
  baseCostIdr: number | null;
  perPaxCostIdr: number | null;
  exampleCostIdr: number | null;
  estimatedGrossProfitIdr: number | null;
  estimatedGrossMarginPercent: number | null;
  addonCount: number;
  addonsMissingCost: number;
}

export interface AdminMarginBookingRow {
  id: string;
  reference: string;
  tourTitle: string;
  date: string;
  status: string;
  revenueIdr: number;
  estimatedCostIdr: number | null;
  estimatedGrossProfitIdr: number | null;
  estimatedGrossMarginPercent: number | null;
}

export interface AdminMarginData {
  summary: {
    confirmedSalesIdr: number;
    estimatedGrossProfitIdr: number;
    estimatedGrossMarginPercent: number | null;
    completeBookingCount: number;
    confirmedBookingCount: number;
  };
  tours: AdminMarginTourRow[];
  bookings: AdminMarginBookingRow[];
}

function categoryLabel(category: string) {
  return category.toLowerCase().split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

function mockTours(): AdminTourRow[] {
  return allTours.map((tour, index) => {
    const detail = getTourDetail(tour);
    const published = index !== allTours.length - 1;
    const pricingMode = tour.slug === "private-car-charter-bali" ? "PER_VEHICLE" : "PER_PERSON";
    const addons = getMockAddons(tour.category, tour.slug).map((addon) => ({ ...addon, costPriceIdr: addon.code.startsWith("pickup-") ? 100000 : null, active: true }));
    const variants = getMockVariants(tour.slug).map((variant) => ({ ...variant, active: true }));
    const openDateCount = 120 - index * 3;
    const readiness = evaluateTourReadiness({
      published,
      pricingMode,
      baseCostIdr: 500000,
      perPaxCostIdr: pricingMode === "PER_PERSON" && !variants.length ? null : 0,
      maxGroupSize: detail.maxGroupSize,
      images: detail.gallery.map((image) => image.src),
      imageAlts: detail.gallery.map((image) => image.alt),
      inclusions: detail.inclusions,
      exclusions: detail.exclusions,
      meetingPoint: detail.meetingPoint,
      cancellationPolicy: detail.cancellationPolicy,
      itinerary: detail.itinerary.map((stop) => ({ timeLabel: stop.time, title: stop.title, description: stop.description })),
      pricingTiers: detail.pricingTiers,
      addons,
      variants,
      openDateCount,
    });
    return {
      id: tour.slug,
      slug: tour.slug,
      title: tour.title,
      category: tour.category,
      durationMinutes: tour.durationHours * 60,
      basePriceIdr: tour.priceIdr,
      pricingMode,
      maxGroupSize: detail.maxGroupSize,
      published,
      bookingCount: [18, 11, 9, 22, 5, 7, 31, 13, 4, 8, 3, 2][index] ?? 0,
      openDateCount,
      readinessStatus: readiness.status,
      readinessIssues: readiness.issues,
    };
  });
}

export async function getAdminTours(): Promise<AdminTourRow[]> {
  if (!hasDatabaseConfiguration()) return mockTours();
  const tours = await getPrisma().tour.findMany({
    orderBy: [{ published: "desc" }, { title: "asc" }],
    include: {
      itinerary: { orderBy: { position: "asc" } },
      pricingTiers: { orderBy: { minPax: "asc" } },
      addons: true,
      variants: true,
      _count: { select: { bookings: true, availability: { where: { date: { gte: new Date() }, isOpen: true } } } },
    },
  });
  return tours.map((tour) => {
    const readiness = evaluateTourReadiness({ ...tour, openDateCount: tour._count.availability });
    return {
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      category: categoryLabel(tour.category),
      durationMinutes: tour.durationMinutes,
      basePriceIdr: tour.basePriceIdr,
      pricingMode: tour.pricingMode,
      maxGroupSize: tour.maxGroupSize,
      published: tour.published,
      bookingCount: tour._count.bookings,
      openDateCount: tour._count.availability,
      readinessStatus: readiness.status,
      readinessIssues: readiness.issues,
    };
  });
}

export async function getAdminBookings(filters: BookingFilters = {}): Promise<AdminBookingRow[]> {
  if (!hasDatabaseConfiguration()) {
    return mockAdminBookings.filter((booking) =>
      (!filters.status || filters.status === "ALL" || booking.status === filters.status) &&
      (!filters.tourId || filters.tourId === "ALL" || booking.tourId === filters.tourId) &&
      (!filters.query || `${booking.reference} ${booking.customerName} ${booking.customerEmail}`.toLowerCase().includes(filters.query.toLowerCase())),
    ).map((booking) => ({ ...booking, confirmed: booking.status === "PAID", requestEmailSent: true, confirmationEmailSent: booking.status === "PAID" }));
  }

  const validStatus = filters.status && filters.status !== "ALL" && Object.values(BookingStatus).includes(filters.status as BookingStatus)
    ? filters.status as BookingStatus
    : undefined;
  const query = filters.query?.trim().slice(0, 100);
  const bookings = await getPrisma().booking.findMany({
    where: {
      status: validStatus,
      tourId: filters.tourId && filters.tourId !== "ALL" ? filters.tourId : undefined,
      OR: query ? [
        { reference: { contains: query, mode: "insensitive" } },
        { customerName: { contains: query, mode: "insensitive" } },
        { customerEmail: { contains: query, mode: "insensitive" } },
      ] : undefined,
    },
    include: { tour: true, availability: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return bookings.map((booking) => ({
    id: booking.id,
    reference: booking.reference,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    tourId: booking.tourId,
    tourTitle: booking.tour.title,
    date: booking.availability.date.toISOString().slice(0, 10),
    paxCount: booking.paxCount,
    totalAmountIdr: booking.totalAmountIdr,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    confirmed: Boolean(booking.confirmedAt),
    requestEmailSent: Boolean(booking.bookingRequestEmailSentAt),
    confirmationEmailSent: Boolean(booking.confirmationEmailSentAt),
    createdAt: booking.createdAt.toISOString(),
  }));
}

export async function getAdminAvailability(tourId?: string, month?: string): Promise<AdminAvailabilityRow[]> {
  if (!hasDatabaseConfiguration()) return mockUpcomingAvailability().filter((row) =>
    (!tourId || tourId === "ALL" || row.tourId === tourId) && (!month || row.date.startsWith(month)),
  );
  const monthStart = month ? new Date(`${month}-01T00:00:00Z`) : null;
  const monthEnd = monthStart ? new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1)) : null;
  const rows = await getPrisma().availability.findMany({
    where: {
      date: monthStart && monthEnd ? { gte: monthStart, lt: monthEnd } : { gte: new Date() },
      tourId: tourId && tourId !== "ALL" ? tourId : undefined,
    },
    include: {
      tour: true,
      bookings: { where: { status: { in: [BookingStatus.PENDING, BookingStatus.PAID, BookingStatus.CONFIRMED] } }, select: { id: true } },
    },
    orderBy: [{ date: "asc" }, { tour: { title: "asc" } }],
    take: month ? 100 : 180,
  });
  return rows.map((row) => ({
    id: row.id,
    tourId: row.tourId,
    tourTitle: row.tour.title,
    date: row.date.toISOString().slice(0, 10),
    capacity: row.capacity,
    spotsRemaining: row.spotsRemaining,
    activeBookings: row.bookings.length,
    isOpen: row.isOpen,
  }));
}

function baliDayBounds() {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const start = new Date(`${date}T00:00:00+08:00`);
  return { start, end: new Date(start.getTime() + 86_400_000) };
}

export async function getAdminOverview() {
  if (!hasDatabaseConfiguration()) {
    return {
      metrics: { bookingsToday: 2, pendingPayments: 1, departuresNextSevenDays: 7, paidRevenueThisMonthIdr: 18250000 },
      recentBookings: (await getAdminBookings()).slice(0, 5),
      upcoming: mockUpcomingAvailability().slice(0, 5),
    };
  }

  const prisma = getPrisma();
  const { start, end } = baliDayBounds();
  const sevenDays = new Date(start.getTime() + 7 * 86_400_000);
  const monthStart = new Date(start);
  monthStart.setUTCDate(1);
  const [bookingsToday, pendingPayments, departuresNextSevenDays, revenue, recentBookings, upcoming] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.booking.count({ where: { status: { in: [BookingStatus.REQUESTED, BookingStatus.PENDING] } } }),
    prisma.availability.count({ where: { date: { gte: start, lt: sevenDays }, capacity: { gt: 0 } } }),
    prisma.booking.aggregate({ where: { status: BookingStatus.PAID, paidAt: { gte: monthStart } }, _sum: { totalAmountIdr: true } }),
    getAdminBookings(),
    getAdminAvailability(),
  ]);
  return {
    metrics: { bookingsToday, pendingPayments, departuresNextSevenDays, paidRevenueThisMonthIdr: revenue._sum.totalAmountIdr ?? 0 },
    recentBookings: recentBookings.slice(0, 5),
    upcoming: upcoming.slice(0, 5),
  };
}

export async function getAdminMargins(requestedPax = 2): Promise<AdminMarginData> {
  const safeRequestedPax = Number.isInteger(requestedPax) && requestedPax > 0 ? requestedPax : 2;
  if (!hasDatabaseConfiguration()) {
    const tours = allTours.map((tour) => {
      const detail = getTourDetail(tour);
      const pricingMode = tour.pricingMode ?? "PER_PERSON";
      const examplePax = Math.min(safeRequestedPax, detail.maxGroupSize);
      const customerUnitPriceIdr = getTierPrice(detail.pricingTiers, examplePax);
      const packageRevenueIdr = calculatePackageTotal({ pricingMode, pricingTiers: detail.pricingTiers, pax: examplePax });
      const exampleRevenueIdr = packageRevenueIdr;
      const baseCostIdr = tour.category === "Multi-Day Trips" ? Math.round(tour.durationHours / 24) * 500000 : 500000;
      const perPaxCostIdr = tour.slug === "ubud-atv-jungle-trail" ? 275000 : null;
      const exampleCostIdr = pricingMode === "PER_PERSON" && perPaxCostIdr === null ? null : baseCostIdr + (perPaxCostIdr ?? 0) * examplePax;
      const estimatedGrossProfitIdr = exampleCostIdr === null ? null : exampleRevenueIdr - exampleCostIdr;
      return {
        id: tour.slug,
        title: tour.title,
        published: true,
        pricingMode,
        examplePax,
        customerUnitPriceIdr,
        packageRevenueIdr,
        variantTitle: null,
        variantPriceAdjustmentIdr: 0,
        variantSupplierCostIdr: 0,
        exampleRevenueIdr,
        baseCostIdr,
        perPaxCostIdr,
        exampleCostIdr,
        estimatedGrossProfitIdr,
        estimatedGrossMarginPercent: estimatedGrossProfitIdr === null || exampleRevenueIdr === 0 ? null : estimatedGrossProfitIdr / exampleRevenueIdr * 100,
        addonCount: 0,
        addonsMissingCost: 0,
      } satisfies AdminMarginTourRow;
    });
    return { summary: { confirmedSalesIdr: 0, estimatedGrossProfitIdr: 0, estimatedGrossMarginPercent: null, completeBookingCount: 0, confirmedBookingCount: 0 }, tours, bookings: [] };
  }

  const prisma = getPrisma();
  const baliDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const monthStart = new Date(`${baliDate.slice(0, 7)}-01T00:00:00.000Z`);
  const [tourRows, bookingRows] = await Promise.all([
    prisma.tour.findMany({
      orderBy: [{ published: "desc" }, { title: "asc" }],
      include: {
        pricingTiers: { orderBy: { minPax: "asc" } },
        addons: { where: { active: true }, select: { costPriceIdr: true } },
        variants: { where: { active: true }, orderBy: [{ isDefault: "desc" }, { title: "asc" }] },
      },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PAID] },
        availability: { date: { gte: monthStart } },
      },
      orderBy: { availability: { date: "asc" } },
      take: 100,
      include: {
        tour: { select: { title: true, pricingMode: true, baseCostIdr: true, perPaxCostIdr: true } },
        availability: { select: { date: true } },
        addons: { include: { addon: { select: { costPriceIdr: true } } } },
      },
    }),
  ]);

  const tours = tourRows.map((tour) => {
    const examplePax = Math.min(safeRequestedPax, tour.maxGroupSize);
    const defaultVariant = tour.variants.find((variant) => variant.isDefault) ?? tour.variants[0];
    const customerUnitPriceIdr = getTierPrice(tour.pricingTiers, examplePax);
    const packageRevenueIdr = calculatePackageTotal({
      pricingMode: tour.pricingMode,
      pricingTiers: tour.pricingTiers,
      pax: examplePax,
      childPriceIdr: tour.childPriceIdr,
    });
    const variantPriceAdjustmentIdr = calculateVariantPriceAdjustment(defaultVariant, examplePax);
    const variantSupplierCostIdr = defaultVariant ? calculateVariantSupplierCost(defaultVariant, examplePax) : 0;
    const exampleRevenueIdr = packageRevenueIdr + variantPriceAdjustmentIdr;
    const exampleCostIdr = tour.baseCostIdr === null || (tour.pricingMode === "PER_PERSON" && tour.perPaxCostIdr === null && !defaultVariant)
      ? null
      : tour.baseCostIdr + (tour.perPaxCostIdr ?? 0) * examplePax + variantSupplierCostIdr;
    const estimatedGrossProfitIdr = exampleCostIdr === null ? null : exampleRevenueIdr - exampleCostIdr;
    return {
      id: tour.id,
      title: tour.title,
      published: tour.published,
      pricingMode: tour.pricingMode,
      examplePax,
      customerUnitPriceIdr,
      packageRevenueIdr,
      variantTitle: defaultVariant?.title ?? null,
      variantPriceAdjustmentIdr,
      variantSupplierCostIdr,
      exampleRevenueIdr,
      baseCostIdr: tour.baseCostIdr,
      perPaxCostIdr: tour.perPaxCostIdr,
      exampleCostIdr,
      estimatedGrossProfitIdr,
      estimatedGrossMarginPercent: estimatedGrossProfitIdr === null || exampleRevenueIdr === 0 ? null : estimatedGrossProfitIdr / exampleRevenueIdr * 100,
      addonCount: tour.addons.length,
      addonsMissingCost: tour.addons.filter((addon) => addon.costPriceIdr === null).length,
    } satisfies AdminMarginTourRow;
  }).toSorted((a, b) => Number(a.exampleCostIdr !== null) - Number(b.exampleCostIdr !== null)
    || (a.estimatedGrossMarginPercent ?? Number.POSITIVE_INFINITY) - (b.estimatedGrossMarginPercent ?? Number.POSITIVE_INFINITY));

  const bookings = bookingRows.map((booking) => {
    const baseCostIdr = booking.baseCostIdrSnapshot ?? booking.tour.baseCostIdr;
    const perPaxCostIdr = booking.perPaxCostIdrSnapshot ?? booking.tour.perPaxCostIdr;
    const addonCosts = booking.addons.map((item) => {
      const unitCostIdr = item.unitCostIdr ?? item.addon.costPriceIdr;
      return unitCostIdr === null ? null : unitCostIdr * item.quantity;
    });
    const estimatedCostIdr = baseCostIdr === null || (booking.tour.pricingMode === "PER_PERSON" && perPaxCostIdr === null && booking.variantTitleSnapshot === null) || (booking.variantTitleSnapshot !== null && booking.variantSupplierCostIdrSnapshot === null) || addonCosts.some((cost) => cost === null)
      ? null
      : baseCostIdr + (perPaxCostIdr ?? 0) * booking.paxCount + (booking.variantSupplierCostIdrSnapshot ?? 0) + addonCosts.reduce<number>((sum, cost) => sum + (cost ?? 0), 0);
    const estimatedGrossProfitIdr = estimatedCostIdr === null ? null : booking.totalAmountIdr - estimatedCostIdr;
    return {
      id: booking.id,
      reference: booking.reference,
      tourTitle: booking.tour.title,
      date: booking.availability.date.toISOString().slice(0, 10),
      status: booking.status,
      revenueIdr: booking.totalAmountIdr,
      estimatedCostIdr,
      estimatedGrossProfitIdr,
      estimatedGrossMarginPercent: estimatedGrossProfitIdr === null || booking.totalAmountIdr === 0 ? null : estimatedGrossProfitIdr / booking.totalAmountIdr * 100,
    } satisfies AdminMarginBookingRow;
  });

  const completeBookings = bookings.filter((booking) => booking.estimatedGrossProfitIdr !== null);
  const confirmedSalesIdr = bookings.reduce((sum, booking) => sum + booking.revenueIdr, 0);
  const completeRevenueIdr = completeBookings.reduce((sum, booking) => sum + booking.revenueIdr, 0);
  const estimatedGrossProfitIdr = completeBookings.reduce((sum, booking) => sum + (booking.estimatedGrossProfitIdr ?? 0), 0);
  return {
    summary: {
      confirmedSalesIdr,
      estimatedGrossProfitIdr,
      estimatedGrossMarginPercent: completeRevenueIdr === 0 ? null : estimatedGrossProfitIdr / completeRevenueIdr * 100,
      completeBookingCount: completeBookings.length,
      confirmedBookingCount: bookings.length,
    },
    tours,
    bookings,
  };
}

export async function getAdminTourDetail(id: string) {
  if (!hasDatabaseConfiguration()) return null;
  return getPrisma().tour.findUnique({
    where: { id },
    include: { itinerary: { orderBy: { position: "asc" } }, pricingTiers: { orderBy: { minPax: "asc" } }, addons: { orderBy: { title: "asc" } }, variants: { orderBy: [{ isDefault: "desc" }, { title: "asc" }] } },
  });
}

export async function getAdminTourEditor(id?: string): Promise<AdminTourEditorData> {
  if (!id) {
    return {
      title: "", slug: "", description: "", category: "CUSTOM_TOUR", durationMinutes: 480, basePriceIdr: 0, pricingMode: "PER_PERSON", baseCostIdr: null, perPaxCostIdr: null, childPriceIdr: null, childAgeLabel: null,
      location: "Bali", cardNote: "Private driver and direct support", featured: false, images: [], imageAlts: [], inclusions: [], exclusions: [], meetingPoint: "Your hotel or villa lobby", cancellationPolicy: "", maxGroupSize: 6,
      published: false, itinerary: [], pricingTiers: [], addons: [], variants: [],
    };
  }
  if (!hasDatabaseConfiguration()) {
    const tour = allTours.find((item) => item.slug === id);
    if (!tour) return getAdminTourEditor();
    const detail = getTourDetail(tour);
    const mockCategory: Record<string, string> = {
      Trekking: "TREKKING", "Water Sports": "WATER_SPORTS", "Cultural tour": "CULTURAL_TOUR", "Cultural Tours": "CULTURAL_TOUR",
      "Car Charter": "CAR_CHARTER", "Multi-Day Trips": "MULTI_DAY_TRIP", "Custom Tour": "CUSTOM_TOUR", "Island Trips": "ISLAND_TRIP", Nature: "NATURE",
      "Experience Days": "EXPERIENCE_DAY",
    };
    return {
      id: tour.slug,
      title: tour.title,
      slug: tour.slug,
      description: detail.summary,
      category: mockCategory[tour.category] ?? "CUSTOM_TOUR",
      durationMinutes: tour.durationHours * 60,
      basePriceIdr: tour.priceIdr,
      pricingMode: tour.slug === "private-car-charter-bali" ? "PER_VEHICLE" : "PER_PERSON",
      baseCostIdr: tour.category === "Multi-Day Trips" ? Math.round(tour.durationHours / 24) * 500000 : 500000,
      perPaxCostIdr: tour.slug === "ubud-atv-jungle-trail" ? 275000 : null,
      childPriceIdr: null,
      childAgeLabel: null,
      location: tour.location,
      cardNote: tour.note,
      featured: topTours.some((item) => item.slug === tour.slug),
      images: detail.gallery.map((image) => image.src),
      imageAlts: detail.gallery.map((image) => image.alt),
      inclusions: detail.inclusions,
      exclusions: detail.exclusions,
      meetingPoint: detail.meetingPoint,
      cancellationPolicy: detail.cancellationPolicy,
      maxGroupSize: detail.maxGroupSize,
      published: true,
      itinerary: detail.itinerary.map((stop) => ({ timeLabel: stop.time, title: stop.title, description: stop.description })),
      pricingTiers: detail.pricingTiers,
      addons: getMockAddons(tour.category, tour.slug).map((addon) => ({ ...addon, costPriceIdr: addon.code === "local-lunch" ? 120000 : addon.code.startsWith("pickup-") ? 100000 : null, description: addon.description, active: true })),
      variants: getMockVariants(tour.slug).map((variant) => ({ ...variant, description: variant.description, supplierUnitCostIdr: variant.code === "standard-solo" ? 275000 : variant.code === "standard-tandem" ? 375000 : variant.code === "premium-solo" ? 500000 : 750000, remainderCostIdr: variant.code.startsWith("standard") ? 275000 : 500000, active: true })),
    };
  }
  const tour = await getPrisma().tour.findUnique({
    where: { id },
    include: { itinerary: { orderBy: { position: "asc" } }, pricingTiers: { orderBy: { minPax: "asc" } }, addons: { orderBy: [{ active: "desc" }, { title: "asc" }] }, variants: { orderBy: [{ active: "desc" }, { isDefault: "desc" }, { title: "asc" }] } },
  });
  if (!tour) return getAdminTourEditor();
  const knownTour = allTours.find((item) => item.slug === tour.slug);
  const knownDetail = knownTour ? getTourDetail(knownTour) : null;
  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    category: tour.category,
    durationMinutes: tour.durationMinutes,
    basePriceIdr: tour.basePriceIdr,
    pricingMode: tour.pricingMode,
    baseCostIdr: tour.baseCostIdr,
    perPaxCostIdr: tour.perPaxCostIdr,
    childPriceIdr: tour.childPriceIdr,
    childAgeLabel: tour.childAgeLabel,
    location: tour.location === "Bali" ? knownTour?.location ?? tour.location : tour.location,
    cardNote: tour.cardNote ?? knownTour?.note ?? "Private driver and direct support",
    featured: tour.featured,
    images: tour.images,
    imageAlts: tour.imageAlts.length ? tour.imageAlts : knownDetail?.gallery.map((image) => image.alt) ?? tour.images.map((_, index) => `${tour.title} — photo ${index + 1}`),
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    meetingPoint: tour.meetingPoint,
    cancellationPolicy: tour.cancellationPolicy,
    maxGroupSize: tour.maxGroupSize,
    published: tour.published,
    itinerary: tour.itinerary.map((stop) => ({ timeLabel: stop.timeLabel, title: stop.title, description: stop.description })),
    pricingTiers: tour.pricingTiers,
    addons: tour.addons.map((addon) => ({ code: addon.code, title: addon.title, priceIdr: addon.priceIdr, costPriceIdr: addon.costPriceIdr, pricingMode: addon.pricingMode, description: addon.description, active: addon.active })),
    variants: tour.variants.map((variant) => ({ code: variant.code, title: variant.title, description: variant.description, priceAdjustmentIdr: variant.priceAdjustmentIdr, supplierUnitCostIdr: variant.supplierUnitCostIdr, guestsPerUnit: variant.guestsPerUnit, remainderCostIdr: variant.remainderCostIdr, isDefault: variant.isDefault, active: variant.active })),
  };
}

export async function getAdminCommerce() {
  if (!hasDatabaseConfiguration()) return { discounts: [], blackouts: [] };
  const [discounts, blackouts] = await Promise.all([
    getPrisma().discountCode.findMany({ include: { tours: { include: { tour: { select: { title: true } } } } }, orderBy: { createdAt: "desc" } }),
    getPrisma().globalBlackoutDate.findMany({ orderBy: { date: "asc" } }),
  ]);
  return {
    discounts: discounts.map((discount) => ({
      id: discount.id,
      code: discount.code,
      name: discount.name,
      automatic: discount.automatic,
      percentOff: discount.percentOff,
      startsAt: discount.startsAt?.toISOString().slice(0, 10) ?? null,
      endsAt: discount.endsAt?.toISOString().slice(0, 10) ?? null,
      usageLimit: discount.usageLimit,
      timesUsed: discount.timesUsed,
      active: discount.active,
      appliesToAll: discount.appliesToAll,
      tourTitles: discount.tours.map((item) => item.tour.title),
    })),
    blackouts: blackouts.map((blackout) => ({ date: blackout.date.toISOString().slice(0, 10), reason: blackout.reason })),
  };
}

export type AdminTourDetail = Prisma.TourGetPayload<{ include: { itinerary: true; pricingTiers: true; addons: true; variants: true } }>;

