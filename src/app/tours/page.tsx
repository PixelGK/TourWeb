import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TourCard } from "@/components/site/tour-card";
import { TourFilters, type ActiveFilters } from "@/components/tours/tour-filters";
import { TourCollectionNav } from "@/components/tours/tour-collection-nav";
import { TourSort } from "@/components/tours/tour-sort";
import { bestAutomaticOffer, getAutomaticDiscountOffers } from "@/lib/automatic-discounts";
import { isInsideBookingWindow } from "@/lib/booking-window";
import { collectionForTour, matchesTourCollection, tourCollections, type TourCollectionId } from "@/lib/tour-collections";
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
const validCollections = new Set(tourCollections.map((collection) => collection.id));
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
  const collection = singleValue(params.collection)?.toLowerCase();

  return {
    category: category && validCategories.has(category) ? category : undefined,
    duration: duration && validDurations.has(duration) ? duration : undefined,
    price: price && validPrices.has(price) ? price : undefined,
    sort: sort && validSorts.has(sort) ? sort : "featured",
    destination: destination && validDestinations.has(destination) ? destination : undefined,
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) && isInsideBookingWindow(date) ? date : undefined,
    pax: pax && ["1", "2", "3", "4", "5", "6"].includes(pax) ? pax : undefined,
    collection: collection && validCollections.has(collection as TourCollectionId) ? collection : undefined,
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
    if (!matchesTourCollection(tour, filters.collection)) return false;
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
  if (filters.collection) params.set("collection", filters.collection);
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
  const collectionCounts = Object.fromEntries(tourCollections.map((collection) => [collection.id, allTours.filter((tour) => collectionForTour(tour) === collection.id).length])) as Record<TourCollectionId, number>;
  const [results, automaticOffers] = await Promise.all([
    filterByAvailability(filteredTours, filters),
    getAutomaticDiscountOffers(filteredTours.map((tour) => tour.slug)),
  ]);
  const requestedPage = Number.parseInt(singleValue(params.page) ?? "1", 10);
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visibleTours = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilterCount = [filters.destination, filters.category, filters.duration, filters.price, filters.collection].filter(Boolean).length;
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

      <section className="border-b border-charcoal/15 bg-[#fbfaf6]">
        <div className="site-shell grid gap-8 py-12 sm:py-14 lg:grid-cols-12 lg:items-end lg:py-16">
          <div className="lg:col-span-8">
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold text-weathered">
              <Link href="/" className="hover:text-terrace">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Tours</span>
            </nav>
            <h1 className="max-w-4xl font-serif text-5xl font-normal leading-[0.95] tracking-[-0.03em] text-terrace sm:text-6xl">Choose a Bali day</h1>
          </div>
          <div className="flex items-start gap-3 text-sm leading-6 text-weathered lg:col-span-4 lg:max-w-sm lg:justify-self-end">
            <Compass aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-clay" /> Pick a ready-made route, or start with a private driver and choose the stops yourself.
          </div>
        </div>
      </section>

      <TourCollectionNav active={filters.collection as TourCollectionId | undefined} counts={collectionCounts} date={filters.date} pax={filters.pax} />

      <div className="site-shell py-10 lg:py-14">
        <div className="grid gap-9 lg:grid-cols-[17.5rem_1fr] lg:items-start">
          <TourFilters filters={filters} categories={tourCategories} />

          <section aria-labelledby="results-heading">
            <div className="flex flex-col gap-5 border-b border-charcoal/25 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="results-heading" className="font-serif text-3xl font-normal text-charcoal">{results.length} {results.length === 1 ? "day" : "days"} found</h2>
                {activeFilterCount ? <p className="mt-2 text-xs font-semibold text-clay">{activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}</p> : null}
                {searchContext ? <p className="mt-2 text-sm text-weathered">Your search: <span className="font-semibold text-charcoal">{searchContext}</span></p> : null}
              </div>
              <TourSort filters={filters} />
            </div>

            {visibleTours.length ? (
              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                {visibleTours.map((tour, index) => {
                  const promotion = bestAutomaticOffer(automaticOffers, tour.slug, filters.date);
                  return <div key={tour.slug} className={index === 0 ? "sm:col-span-2" : ""}><TourCard tour={tour} layout={index === 0 ? "wide" : "standard"} bookingQuery={bookingQuery} promotion={promotion ? { ...promotion, exactForSelectedDate: Boolean(filters.date) } : null} /></div>;
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

            <aside className="mt-12 grid gap-5 border border-charcoal/25 bg-gold-pale p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Planning more than one day?</p><h2 className="mt-2 font-serif text-3xl">Put routes side by side.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-weathered">Choose two to five days, then send one organized request. We check for repeated areas and unrealistic driving before quoting it.</p></div>
              <Link href="/plan" className="inline-flex min-h-12 items-center justify-center gap-2 bg-terrace px-5 text-sm font-bold text-frangipani">Build a multi-day plan <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </aside>
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
