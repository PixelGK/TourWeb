import "server-only";

import { BookingStatus, Prisma } from "@/generated/prisma/client";
import { mockAdminBookings, mockUpcomingAvailability } from "@/data/mock-admin";
import { getMockAddons } from "@/data/mock-addons";
import { getTourDetail } from "@/data/mock-tour-details";
import { allTours } from "@/data/mock-tours";
import { getPrisma } from "@/lib/db";
import { hasDatabaseConfiguration } from "@/lib/server-env";

export interface AdminTourRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  durationMinutes: number;
  basePriceIdr: number;
  maxGroupSize: number;
  published: boolean;
  bookingCount: number;
  openDateCount: number;
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
  images: string[];
  inclusions: string[];
  exclusions: string[];
  meetingPoint: string;
  cancellationPolicy: string;
  maxGroupSize: number;
  published: boolean;
  itinerary: Array<{ timeLabel: string; title: string; description: string }>;
  pricingTiers: Array<{ minPax: number; maxPax: number; perPersonIdr: number }>;
  addons: Array<{ code: string; title: string; priceIdr: number; pricingMode: string; description: string | null }>;
}

function categoryLabel(category: string) {
  return category.toLowerCase().split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

function mockTours(): AdminTourRow[] {
  return allTours.map((tour, index) => ({
    id: tour.slug,
    slug: tour.slug,
    title: tour.title,
    category: tour.category,
    durationMinutes: tour.durationHours * 60,
    basePriceIdr: tour.priceIdr,
    maxGroupSize: 6,
    published: index !== allTours.length - 1,
    bookingCount: [18, 11, 9, 22, 5, 7, 31, 13, 4, 8, 3, 2][index] ?? 0,
    openDateCount: 120 - index * 3,
  }));
}

export async function getAdminTours(): Promise<AdminTourRow[]> {
  if (!hasDatabaseConfiguration()) return mockTours();
  const tours = await getPrisma().tour.findMany({
    orderBy: [{ published: "desc" }, { title: "asc" }],
    include: { _count: { select: { bookings: true, availability: { where: { date: { gte: new Date() } } } } } },
  });
  return tours.map((tour) => ({
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    category: categoryLabel(tour.category),
    durationMinutes: tour.durationMinutes,
    basePriceIdr: tour.basePriceIdr,
    maxGroupSize: tour.maxGroupSize,
    published: tour.published,
    bookingCount: tour._count.bookings,
    openDateCount: tour._count.availability,
  }));
}

export async function getAdminBookings(filters: BookingFilters = {}): Promise<AdminBookingRow[]> {
  if (!hasDatabaseConfiguration()) {
    return mockAdminBookings.filter((booking) =>
      (!filters.status || filters.status === "ALL" || booking.status === filters.status) &&
      (!filters.tourId || filters.tourId === "ALL" || booking.tourId === filters.tourId) &&
      (!filters.query || `${booking.reference} ${booking.customerName} ${booking.customerEmail}`.toLowerCase().includes(filters.query.toLowerCase())),
    ).map((booking) => ({ ...booking }));
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
    createdAt: booking.createdAt.toISOString(),
  }));
}

export async function getAdminAvailability(tourId?: string): Promise<AdminAvailabilityRow[]> {
  if (!hasDatabaseConfiguration()) return mockUpcomingAvailability().filter((row) => !tourId || tourId === "ALL" || row.tourId === tourId);
  const rows = await getPrisma().availability.findMany({
    where: { date: { gte: new Date() }, tourId: tourId && tourId !== "ALL" ? tourId : undefined },
    include: {
      tour: true,
      bookings: { where: { status: { in: [BookingStatus.PENDING, BookingStatus.PAID] } }, select: { id: true } },
    },
    orderBy: [{ date: "asc" }, { tour: { title: "asc" } }],
    take: 180,
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
    prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
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

export async function getAdminTourDetail(id: string) {
  if (!hasDatabaseConfiguration()) return null;
  return getPrisma().tour.findUnique({
    where: { id },
    include: { itinerary: { orderBy: { position: "asc" } }, pricingTiers: { orderBy: { minPax: "asc" } }, addons: { orderBy: { title: "asc" } } },
  });
}

export async function getAdminTourEditor(id?: string): Promise<AdminTourEditorData> {
  if (!id) {
    return {
      title: "", slug: "", description: "", category: "CUSTOM_TOUR", durationMinutes: 480, basePriceIdr: 0,
      images: [], inclusions: [], exclusions: [], meetingPoint: "Your hotel or villa lobby", cancellationPolicy: "", maxGroupSize: 6,
      published: false, itinerary: [], pricingTiers: [], addons: [],
    };
  }
  if (!hasDatabaseConfiguration()) {
    const tour = allTours.find((item) => item.slug === id);
    if (!tour) return getAdminTourEditor();
    const detail = getTourDetail(tour);
    const mockCategory: Record<string, string> = {
      Trekking: "TREKKING", "Water Sports": "WATER_SPORTS", "Cultural tour": "CULTURAL_TOUR", "Cultural Tours": "CULTURAL_TOUR",
      "Car Charter": "CAR_CHARTER", "Multi-Day Trips": "MULTI_DAY_TRIP", "Custom Tour": "CUSTOM_TOUR", "Island Trips": "ISLAND_TRIP", Nature: "NATURE",
    };
    return {
      id: tour.slug,
      title: tour.title,
      slug: tour.slug,
      description: detail.summary,
      category: mockCategory[tour.category] ?? "CUSTOM_TOUR",
      durationMinutes: tour.durationHours * 60,
      basePriceIdr: tour.priceIdr,
      images: detail.gallery.map((image) => image.src),
      inclusions: detail.inclusions,
      exclusions: detail.exclusions,
      meetingPoint: detail.meetingPoint,
      cancellationPolicy: detail.cancellationPolicy,
      maxGroupSize: detail.maxGroupSize,
      published: true,
      itinerary: detail.itinerary.map((stop) => ({ timeLabel: stop.time, title: stop.title, description: stop.description })),
      pricingTiers: detail.pricingTiers,
      addons: getMockAddons(tour.category).map((addon) => ({ ...addon, description: addon.description })),
    };
  }
  const tour = await getPrisma().tour.findUnique({
    where: { id },
    include: { itinerary: { orderBy: { position: "asc" } }, pricingTiers: { orderBy: { minPax: "asc" } }, addons: { where: { active: true }, orderBy: { title: "asc" } } },
  });
  if (!tour) return getAdminTourEditor();
  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    category: tour.category,
    durationMinutes: tour.durationMinutes,
    basePriceIdr: tour.basePriceIdr,
    images: tour.images,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    meetingPoint: tour.meetingPoint,
    cancellationPolicy: tour.cancellationPolicy,
    maxGroupSize: tour.maxGroupSize,
    published: tour.published,
    itinerary: tour.itinerary.map((stop) => ({ timeLabel: stop.timeLabel, title: stop.title, description: stop.description })),
    pricingTiers: tour.pricingTiers,
    addons: tour.addons.map((addon) => ({ code: addon.code, title: addon.title, priceIdr: addon.priceIdr, pricingMode: addon.pricingMode, description: addon.description })),
  };
}

export type AdminTourDetail = Prisma.TourGetPayload<{ include: { itinerary: true; pricingTiers: true; addons: true } }>;
