import { ArrowLeft, ArrowRight, Compass, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TourCard } from "@/components/site/tour-card";
import { TourFilters, type ActiveFilters } from "@/components/tours/tour-filters";
import { TourSort } from "@/components/tours/tour-sort";
import { bestAutomaticOffer, getAutomaticDiscountOffers } from "@/lib/automatic-discounts";
import { isInsideBookingWindow } from "@/lib/booking-window";
import { getPrisma } from "@/lib/db";
import { getPublicTourCategories, getPublicTours } from "@/lib/public-tour-data";
import { hasDatabaseConfiguration } from "@/lib/server-env";
import type { PublicTourCard } from "@/types/public-tour";

export const metadata: Metadata = {
  title: "Bali Tours & Private Experiences",
  description: "Compare private Bali driver days, activity packages, trekking, water sports, car charters, and multi-day routes with clear IDR pricing.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const validDurations = new Set(["half-day", "full-day", "multi-day"]);
const validPrices = new Set(["under-750", "750-1000", "over-1000"]);
const validSorts = new Set(["featured", "price-low", "price-high", "duration"]);
const destinationLabels: Record<string, string> = {
  ubud: "Ubud & central Bali",
  batur: "Mount Batur",
  "nusa-penida": "Nusa Penida",
  "north-bali": "North Bali",
  "ubud-adventure": "Rafting, ATV & Ubud",
  "private-driver": "Private driver",
  "experience-days": "Experience days",
  "attraction-tickets": "Experience days",
  "bali-safari": "Bali Safari",
  "bali-zoo": "Bali Zoo",
  waterbom: "Waterbom Bali",
  "bird-park": "Bali Bird Park",
  "uluwatu-kecak": "Uluwatu & Kecak",
  "cooking-class": "Balinese cooking class",
  "blue-lagoon": "Blue Lagoon snorkeling",
  sidemen: "Sidemen",
};
const validDestinations = new Set(Object.keys(destinationLabels));
const pageSize = 6;

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function parseFilters(params: Record<string, string | string[] | undefined>, validCategories: Set<string>): ActiveFilters {
  const category = singleValue(params.category)?.toLowerCase();
  const duration = singleValue(params.duration);
  const price = singleValue(params.price);
  const sort = singleValue(params.sort);
  const destination = singleValue(params.destination)?.toLowerCase();
  const date = singleValue(params.date);
  const pax = singleValue(params.pax);

  return {
    category: category && validCategories.has(category) ? category : undefined,
    duration: duration && validDurations.has(duration) ? duration : undefined,
    price: price && validPrices.has(price) ? price : undefined,
    sort: sort && validSorts.has(sort) ? sort : "featured",
    destination: destination && validDestinations.has(destination) ? destination : undefined,
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) && isInsideBookingWindow(date) ? date : undefined,
    pax: pax && ["1", "2", "3", "4", "5"].includes(pax) ? pax : undefined,
  };
}

function matchesDestination(tour: PublicTourCard, destination?: string) {
  if (!destination) return true;
  const text = `${tour.slug} ${tour.title} ${tour.category} ${tour.location}`.toLowerCase();
  if (destination === "ubud") return text.includes("ubud") || text.includes("tegalalang");
  if (destination === "batur") return text.includes("batur") || text.includes("kintamani");
  if (destination === "nusa-penida") return text.includes("nusa penida") || text.includes("nusa-penida");
  if (destination === "north-bali") return ["north bali", "buleleng", "munduk", "lovina", "sekumpul"].some((term) => text.includes(term));
  if (destination === "ubud-adventure") return ["rafting", "atv"].some((term) => text.includes(term));
  if (destination === "private-driver") return tour.category === "Car Charter" || text.includes("private car charter");
  if (destination === "experience-days" || destination === "attraction-tickets") return tour.category === "Experience Days";
  if (destination === "bali-safari") return tour.slug === "bali-safari-day-admission";
  if (destination === "bali-zoo") return tour.slug === "bali-zoo-general-admission";
  if (destination === "waterbom") return tour.slug === "waterbom-bali-single-day-pass";
  if (destination === "bird-park") return tour.slug === "bali-bird-park-batubulan-day";
  if (destination === "uluwatu-kecak") return tour.slug === "uluwatu-kecak-jimbaran-evening";
  if (destination === "cooking-class") return tour.slug === "ubud-market-cooking-class";
  if (destination === "blue-lagoon") return tour.slug === "blue-lagoon-snorkeling-tenganan";
  if (destination === "sidemen") return tour.slug === "sidemen-cycling-village-lunch";
  return true;
}

function filterTours(tours: PublicTourCard[], filters: ActiveFilters): PublicTourCard[] {
  const filtered = tours.filter((tour) => {
    if (!matchesDestination(tour, filters.destination)) return false;
    if (filters.category && tour.category.toLowerCase() !== filters.category) return false;
    if (filters.duration === "half-day" && tour.durationHours > 6) return false;
    if (filters.duration === "full-day" && (tour.durationHours <= 6 || tour.durationHours > 12)) return false;
    if (filters.duration === "multi-day" && tour.durationHours <= 12) return false;
    if (filters.price === "under-750" && tour.priceIdr >= 750000) return false;
    if (filters.price === "750-1000" && (tour.priceIdr < 750000 || tour.priceIdr > 1000000)) return false;
    if (filters.price === "over-1000" && tour.priceIdr <= 1000000) return false;
    return true;
  });

  if (filters.sort === "price-low") return filtered.toSorted((a, b) => a.priceIdr - b.priceIdr);
  if (filters.sort === "price-high") return filtered.toSorted((a, b) => b.priceIdr - a.priceIdr);
  if (filters.sort === "duration") return filtered.toSorted((a, b) => a.durationHours - b.durationHours);
  return filtered;
}

async function filterByAvailability(tours: PublicTourCard[], filters: ActiveFilters) {
  if (!filters.date || !filters.pax || !hasDatabaseConfiguration() || !tours.length) return tours;
  const pax = Number(filters.pax);
  const available = await getPrisma().availability.findMany({
    where: {
      date: new Date(`${filters.date}T00:00:00.000Z`),
      isOpen: true,
      spotsRemaining: { gte: pax },
      tour: { published: true, slug: { in: tours.map((tour) => tour.slug) } },
    },
    select: { tour: { select: { slug: true } } },
  });
  const availableSlugs = new Set(available.map((row) => row.tour.slug));
  return tours.filter((tour) => availableSlugs.has(tour.slug));
}

function pageHref(filters: ActiveFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.duration) params.set("duration", filters.duration);
  if (filters.price) params.set("price", filters.price);
  if (filters.sort && filters.sort !== "featured") params.set("sort", filters.sort);
  if (filters.destination) params.set("destination", filters.destination);
  if (filters.date) params.set("date", filters.date);
  if (filters.pax) params.set("pax", filters.pax);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/tours?${query}` : "/tours";
}

export default async function ToursPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [allTours, tourCategories] = await Promise.all([getPublicTours(), getPublicTourCategories()]);
  const validCategories = new Set(tourCategories.map((category) => category.toLowerCase()));
  const filters = parseFilters(params, validCategories);
  const filteredTours = filterTours(allTours, filters);
  const [results, automaticOffers] = await Promise.all([
    filterByAvailability(filteredTours, filters),
    getAutomaticDiscountOffers(filteredTours.map((tour) => tour.slug)),
  ]);
  const requestedPage = Number.parseInt(singleValue(params.page) ?? "1", 10);
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visibleTours = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilterCount = [filters.destination, filters.category, filters.duration, filters.price].filter(Boolean).length;
  const bookingParams = new URLSearchParams();
  if (filters.date) bookingParams.set("date", filters.date);
  if (filters.pax) bookingParams.set("pax", filters.pax);
  const bookingQuery = bookingParams.toString() || undefined;
  const searchContext = [
    filters.destination ? destinationLabels[filters.destination] : undefined,
    filters.date ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${filters.date}T00:00:00Z`)) : undefined,
    filters.pax ? `${filters.pax}${filters.pax === "5" ? "+" : ""} ${filters.pax === "1" ? "traveler" : "travelers"}` : undefined,
  ].filter(Boolean).join(" · ");

  return (
    <main>
      <SiteHeader />

      <section className="border-b border-charcoal/20 bg-terrace text-frangipani">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-16">
          <div>
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold text-frangipani/65">
              <Link href="/" className="hover:text-gold">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Tours</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Day tours, drivers and activities</p>
            <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">Private Bali day trips</h1>
          </div>
          <div className="flex items-center gap-3 border-l-2 border-gold pl-4 text-sm text-frangipani/70 lg:max-w-xs">
            <Compass aria-hidden="true" className="size-5 shrink-0 text-gold" /> Choose a ready-made route or ask us to adjust the stops.
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="grid gap-9 lg:grid-cols-[17.5rem_1fr] lg:items-start">
          <TourFilters filters={filters} categories={tourCategories} />

          <section aria-labelledby="results-heading">
            <div className="flex flex-col gap-5 border-b border-charcoal/25 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-clay"><SlidersHorizontal aria-hidden="true" className="size-3.5" /> {activeFilterCount ? `${activeFilterCount} active filters` : "All experiences"}</p>
                <h2 id="results-heading" className="mt-2 font-serif text-3xl text-charcoal">{results.length} {results.length === 1 ? "experience" : "experiences"} found</h2>
                {searchContext ? <p className="mt-2 text-sm text-weathered">Your search: <span className="font-semibold text-charcoal">{searchContext}</span></p> : null}
              </div>
              <TourSort filters={filters} />
            </div>

            {visibleTours.length ? (
              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                {visibleTours.map((tour) => {
                  const promotion = bestAutomaticOffer(automaticOffers, tour.slug, filters.date);
                  return <TourCard key={tour.slug} tour={tour} bookingQuery={bookingQuery} promotion={promotion ? { ...promotion, exactForSelectedDate: Boolean(filters.date) } : null} />;
                })}
              </div>
            ) : (
              <div className="mt-7 border border-charcoal/25 bg-frangipani px-6 py-14 text-center">
                <Compass aria-hidden="true" className="mx-auto size-7 text-clay" />
                <h3 className="mt-4 font-serif text-3xl">No exact matches</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-weathered">Try removing one filter, or request a custom route if you already know the kind of day you want.</p>
                <Link href="/tours" className="mt-6 inline-flex min-h-11 items-center rounded-control border border-terrace bg-terrace px-5 text-sm font-semibold text-frangipani">Clear filters</Link>
              </div>
            )}

            {pageCount > 1 ? (
              <nav className="mt-10 flex items-center justify-between border-t border-charcoal/25 pt-6" aria-label="Tour result pages">
                {currentPage > 1 ? (
                  <Link href={pageHref(filters, currentPage - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-control border border-charcoal/35 px-4 text-sm font-semibold hover:bg-charcoal hover:text-frangipani"><ArrowLeft aria-hidden="true" className="size-4" /> Previous</Link>
                ) : <span />}
                <span className="text-sm font-semibold text-weathered">Page <span className="text-charcoal">{currentPage}</span> of {pageCount}</span>
                {currentPage < pageCount ? (
                  <Link href={pageHref(filters, currentPage + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-control border border-charcoal/35 px-4 text-sm font-semibold hover:bg-charcoal hover:text-frangipani">Next <ArrowRight aria-hidden="true" className="size-4" /></Link>
                ) : <span />}
              </nav>
            ) : null}
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
