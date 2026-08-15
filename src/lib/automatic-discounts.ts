import "server-only";

import { getBookingWindow } from "@/lib/booking-window";
import { getPrisma } from "@/lib/db";
import { hasDatabaseConfiguration } from "@/lib/server-env";

export interface AutomaticDiscountOffer {
  name: string;
  percentOff: number;
  startsOn: string;
  endsOn: string;
  tourSlugs: string[] | null;
}

function baliDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function getAutomaticDiscountOffers(tourSlugs: string[]): Promise<AutomaticDiscountOffer[]> {
  if (!hasDatabaseConfiguration() || tourSlugs.length === 0) return [];

  const { minDate, maxDate } = getBookingWindow();
  const bookingWindowStart = new Date(`${minDate}T00:00:00+08:00`);
  const bookingWindowEnd = new Date(`${maxDate}T23:59:59+08:00`);

  try {
    const offers = await getPrisma().discountCode.findMany({
      where: {
        automatic: true,
        active: true,
        startsAt: { lte: bookingWindowEnd },
        endsAt: { gte: bookingWindowStart },
        OR: [
          { appliesToAll: true },
          { tours: { some: { tour: { slug: { in: tourSlugs } } } } },
        ],
      },
      orderBy: { percentOff: "desc" },
      select: {
        name: true,
        percentOff: true,
        startsAt: true,
        endsAt: true,
        appliesToAll: true,
        tours: { select: { tour: { select: { slug: true } } } },
      },
    });

    return offers.flatMap((offer) => offer.startsAt && offer.endsAt ? [{
      name: offer.name ?? "Seasonal offer",
      percentOff: offer.percentOff,
      startsOn: baliDate(offer.startsAt),
      endsOn: baliDate(offer.endsAt),
      tourSlugs: offer.appliesToAll ? null : offer.tours.map((item) => item.tour.slug),
    }] : []);
  } catch {
    return [];
  }
}

export function automaticOffersForTour(offers: AutomaticDiscountOffer[], tourSlug: string) {
  return offers.filter((offer) => offer.tourSlugs === null || offer.tourSlugs.includes(tourSlug));
}

export function bestAutomaticOffer(offers: AutomaticDiscountOffer[], tourSlug: string, travelDate?: string) {
  const applicable = automaticOffersForTour(offers, tourSlug);
  if (!travelDate) return applicable[0] ?? null;
  return applicable.find((offer) => travelDate >= offer.startsOn && travelDate <= offer.endsOn) ?? null;
}
