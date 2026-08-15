import "server-only";

import { cache } from "react";

import { getMockAddons } from "@/data/mock-addons";
import { getTourDetail as getMockTourDetail } from "@/data/mock-tour-details";
import { allTours, topTours } from "@/data/mock-tours";
import type { TourCategory } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { hasDatabaseConfiguration } from "@/lib/server-env";
import type { PublicTourCard, PublicTourDetail } from "@/types/public-tour";

const IDR_PER_USD_ESTIMATE = 16_500;

const categoryLabels: Record<TourCategory, string> = {
  TREKKING: "Trekking",
  WATER_SPORTS: "Water Sports",
  CULTURAL_TOUR: "Cultural Tours",
  CAR_CHARTER: "Car Charter",
  MULTI_DAY_TRIP: "Multi-Day Trips",
  CUSTOM_TOUR: "Custom Tour",
  ISLAND_TRIP: "Island Trips",
  NATURE: "Nature",
  ATTRACTION_TICKET: "Experience Days",
  EXPERIENCE_DAY: "Experience Days",
};

function durationLabel(minutes: number) {
  if (minutes >= 1_440 && minutes % 1_440 === 0) {
    const days = minutes / 1_440;
    return `${days} ${days === 1 ? "day" : "days"}`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function knownCard(slug: string) {
  return allTours.find((tour) => tour.slug === slug);
}

type DatabaseTourCard = Awaited<ReturnType<typeof getPrisma>>["tour"] extends never ? never : {
  slug: string;
  title: string;
  category: TourCategory;
  durationMinutes: number;
  basePriceIdr: number;
  location: string;
  cardNote: string | null;
  featured: boolean;
  images: string[];
  imageAlts: string[];
};

function toPublicCard(tour: DatabaseTourCard): PublicTourCard {
  const known = knownCard(tour.slug);
  const image = tour.images[0];
  return {
    slug: tour.slug,
    title: tour.title,
    category: categoryLabels[tour.category],
    location: tour.location === "Bali" && known?.location ? known.location : tour.location,
    duration: durationLabel(tour.durationMinutes),
    durationHours: tour.durationMinutes / 60,
    image,
    imageAlt: tour.imageAlts[0] || known?.imageAlt || `${tour.title} in Bali`,
    priceIdr: tour.basePriceIdr,
    priceUsd: Math.round(tour.basePriceIdr / IDR_PER_USD_ESTIMATE),
    rating: 0,
    reviewCount: 0,
    note: tour.cardNote || known?.note || "Private driver and direct support",
    featured: tour.featured,
  };
}

export const getPublicTours = cache(async (): Promise<PublicTourCard[]> => {
  if (!hasDatabaseConfiguration()) return allTours;
  const tours = await getPrisma().tour.findMany({
    where: { published: true },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    select: {
      slug: true,
      title: true,
      category: true,
      durationMinutes: true,
      basePriceIdr: true,
      location: true,
      cardNote: true,
      featured: true,
      images: true,
      imageAlts: true,
    },
  });
  return tours.filter((tour) => tour.images.length > 0).map(toPublicCard);
});

export const getFeaturedPublicTours = cache(async (limit = 4): Promise<PublicTourCard[]> => {
  const tours = await getPublicTours();
  const preferred = new Map(topTours.map((tour, index) => [tour.slug, index]));
  return tours
    .toSorted((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (preferred.get(a.slug) ?? 10_000) - (preferred.get(b.slug) ?? 10_000))
    .slice(0, limit);
});

export const getPublicTour = cache(async (slug: string): Promise<PublicTourDetail | null> => {
  if (!hasDatabaseConfiguration()) {
    const mock = knownCard(slug);
    if (!mock) return null;
    const detail = getMockTourDetail(mock);
    return {
      ...detail,
      childPriceIdr: null,
      childAgeLabel: null,
      addons: getMockAddons(mock.category, mock.slug),
    };
  }

  const tour = await getPrisma().tour.findFirst({
    where: { slug, published: true },
    include: {
      itinerary: { orderBy: { position: "asc" } },
      pricingTiers: { orderBy: { minPax: "asc" } },
      addons: { where: { active: true }, orderBy: { title: "asc" } },
    },
  });
  if (!tour || tour.images.length === 0) return null;

  const card = toPublicCard(tour);
  const known = knownCard(slug);
  const knownDetail = known ? getMockTourDetail(known) : null;
  return {
    ...card,
    summary: tour.description,
    gallery: tour.images.map((src, index) => ({
      src,
      alt: tour.imageAlts[index] || knownDetail?.gallery[index]?.alt || `${tour.title} — photo ${index + 1}`,
    })),
    itinerary: tour.itinerary.map((stop) => ({ time: stop.timeLabel, title: stop.title, description: stop.description })),
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    pricingTiers: tour.pricingTiers,
    meetingPoint: tour.meetingPoint,
    meetingNote: `We’ll confirm the exact pickup time and driver details on WhatsApp before your trip. Remote pickup supplements, if any, are quoted before you confirm.`,
    cancellationPolicy: tour.cancellationPolicy,
    maxGroupSize: tour.maxGroupSize,
    childPriceIdr: tour.childPriceIdr,
    childAgeLabel: tour.childAgeLabel,
    addons: tour.addons.map((addon) => ({
      code: addon.code,
      title: addon.title,
      description: addon.description ?? "",
      priceIdr: addon.priceIdr,
      pricingMode: addon.pricingMode,
    })),
  };
});

export async function getPublicTourCategories() {
  return Array.from(new Set((await getPublicTours()).map((tour) => tour.category))).sort();
}
