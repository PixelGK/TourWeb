import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, TourCategory, UserRole } from "../src/generated/prisma/client";
import { getMockAddons } from "../src/data/mock-addons";
import { getTourDetail } from "../src/data/mock-tour-details";
import { allTours } from "../src/data/mock-tours";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL is required to seed the database");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 2 }) });

const categories: Record<string, TourCategory> = {
  Trekking: TourCategory.TREKKING,
  "Water Sports": TourCategory.WATER_SPORTS,
  "Cultural tour": TourCategory.CULTURAL_TOUR,
  "Cultural Tours": TourCategory.CULTURAL_TOUR,
  "Car Charter": TourCategory.CAR_CHARTER,
  "Multi-Day Trips": TourCategory.MULTI_DAY_TRIP,
  "Custom Tour": TourCategory.CUSTOM_TOUR,
  "Island Trips": TourCategory.ISLAND_TRIP,
  Nature: TourCategory.NATURE,
  "Attraction Tickets": TourCategory.ATTRACTION_TICKET,
};

function bookableDates(days = 366) {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return Array.from({ length: days }, (_, index) => new Date(start.getTime() + index * 86_400_000));
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (adminEmail && adminPasswordHash) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash: adminPasswordHash, role: UserRole.ADMIN },
      create: { email: adminEmail, name: "BaliXperience Owner", passwordHash: adminPasswordHash, role: UserRole.ADMIN },
    });
  }

  const requestedSlugs = new Set((process.env.SEED_SLUGS ?? "").split(",").map((slug) => slug.trim()).filter(Boolean));
  const toursToSeed = requestedSlugs.size ? allTours.filter((tour) => requestedSlugs.has(tour.slug)) : allTours;
  if (requestedSlugs.size && toursToSeed.length !== requestedSlugs.size) {
    const known = new Set(toursToSeed.map((tour) => tour.slug));
    throw new Error(`Unknown SEED_SLUGS: ${[...requestedSlugs].filter((slug) => !known.has(slug)).join(", ")}`);
  }

  for (const mockTour of toursToSeed) {
    const detail = getTourDetail(mockTour);
    const tour = await prisma.tour.upsert({
      where: { slug: mockTour.slug },
      update: {
        title: mockTour.title,
        description: detail.summary,
        category: categories[mockTour.category] ?? TourCategory.CUSTOM_TOUR,
        durationMinutes: Math.round(mockTour.durationHours * 60),
        basePriceIdr: mockTour.priceIdr,
        images: detail.gallery.map((image) => image.src),
        inclusions: detail.inclusions,
        exclusions: detail.exclusions,
        meetingPoint: detail.meetingPoint,
        cancellationPolicy: detail.cancellationPolicy,
        maxGroupSize: detail.maxGroupSize,
        published: true,
      },
      create: {
        title: mockTour.title,
        slug: mockTour.slug,
        description: detail.summary,
        category: categories[mockTour.category] ?? TourCategory.CUSTOM_TOUR,
        durationMinutes: Math.round(mockTour.durationHours * 60),
        basePriceIdr: mockTour.priceIdr,
        images: detail.gallery.map((image) => image.src),
        inclusions: detail.inclusions,
        exclusions: detail.exclusions,
        meetingPoint: detail.meetingPoint,
        cancellationPolicy: detail.cancellationPolicy,
        maxGroupSize: detail.maxGroupSize,
        published: true,
      },
    });

    await prisma.$transaction([
      prisma.tourItineraryStop.deleteMany({ where: { tourId: tour.id } }),
      prisma.tourPricingTier.deleteMany({ where: { tourId: tour.id } }),
      prisma.tourAddon.deleteMany({ where: { tourId: tour.id, bookings: { none: {} } } }),
    ]);

    await prisma.tourItineraryStop.createMany({
      data: detail.itinerary.map((stop, position) => ({ tourId: tour.id, position, timeLabel: stop.time, title: stop.title, description: stop.description })),
    });
    await prisma.tourPricingTier.createMany({
      data: detail.pricingTiers.map((tier) => ({ tourId: tour.id, minPax: tier.minPax, maxPax: tier.maxPax, perPersonIdr: tier.perPersonIdr })),
    });
    for (const addon of getMockAddons(mockTour.category)) {
      await prisma.tourAddon.upsert({
        where: { tourId_code: { tourId: tour.id, code: addon.code } },
        update: { title: addon.title, description: addon.description, priceIdr: addon.priceIdr, pricingMode: addon.pricingMode, active: true },
        create: { tourId: tour.id, ...addon, active: true },
      });
    }
    if (requestedSlugs.size) {
      await prisma.availability.createMany({
        data: bookableDates().map((date) => ({ tourId: tour.id, date, capacity: detail.maxGroupSize, spotsRemaining: detail.maxGroupSize })),
        skipDuplicates: true,
      });
    } else {
      for (const date of bookableDates()) {
        await prisma.availability.upsert({
          where: { tourId_date: { tourId: tour.id, date } },
          update: { capacity: detail.maxGroupSize },
          create: { tourId: tour.id, date, capacity: detail.maxGroupSize, spotsRemaining: detail.maxGroupSize },
        });
      }
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
