import { ArrowLeft, Check, Clock3, ExternalLink, MapPin, MessageCircle, ShieldCheck, Users, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BookingWidget } from "@/components/tours/booking-widget";
import { ItineraryTimeline } from "@/components/tours/itinerary-timeline";
import { PhotoGallery } from "@/components/tours/photo-gallery";
import { Badge } from "@/components/ui/badge";
import { automaticOffersForTour, getAutomaticDiscountOffers } from "@/lib/automatic-discounts";
import { isInsideBookingWindow } from "@/lib/booking-window";
import { getPrisma } from "@/lib/db";
import { getPublicTour } from "@/lib/public-tour-data";
import { getAppUrl, hasDatabaseConfiguration } from "@/lib/server-env";

type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ date?: string; pax?: string }> };

export const revalidate = 300;

const idrFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getPublicTour(slug);
  if (!tour) return { title: "Tour not found" };

  return {
    title: tour.title,
    description: tour.category === "Experience Days"
      ? `${tour.title}: a private Bali experience day with admission, hotel transport, direct local support, and clear IDR pricing.`
      : `${tour.title}: a private ${tour.duration.toLowerCase()} Bali experience with hotel pickup, direct local support, and clear IDR pricing.`,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      type: "website",
      title: tour.title,
      description: tour.summary,
      url: `/tours/${tour.slug}`,
      images: [{ url: tour.image, alt: tour.imageAlt }],
    },
  };
}

export default async function TourDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const tour = await getPublicTour(slug);
  if (!tour) notFound();
  const [blackoutDates, automaticOffers] = hasDatabaseConfiguration()
    ? await Promise.all([
        getPrisma().globalBlackoutDate.findMany({ select: { date: true }, orderBy: { date: "asc" } }).then((rows) => rows.map((row) => row.date.toISOString().slice(0, 10))).catch(() => []),
        getAutomaticDiscountOffers([slug]),
      ])
    : [[], []];
  const isExperienceDay = tour.category === "Experience Days";
  const initialDate = query.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date) && isInsideBookingWindow(query.date) ? query.date : undefined;
  const requestedPax = Number(query.pax);
  const initialPax = Number.isInteger(requestedPax) && requestedPax >= 1 && requestedPax <= tour.maxGroupSize ? requestedPax : 2;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tour.title,
    description: tour.summary,
    image: tour.gallery.map((image) => image.src),
    category: tour.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: tour.priceIdr,
      availability: "https://schema.org/InStock",
      url: `${getAppUrl()}/tours/${tour.slug}`,
    },
  };

  return (
    <main className="pb-36 lg:pb-0">
      <SiteHeader />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />

      <section className="bg-limestone">
        <div className="mx-auto max-w-7xl px-5 pb-9 pt-8 sm:px-8 lg:px-12 lg:pb-12 lg:pt-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-weathered">
            <Link href="/tours" className="inline-flex items-center gap-1.5 hover:text-clay"><ArrowLeft aria-hidden="true" className="size-3.5" /> All tours</Link>
            <span aria-hidden="true">/</span><span>{tour.category}</span>
          </nav>

          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="category">{tour.category}</Badge>
                <Badge tone="trust"><MessageCircle aria-hidden="true" className="size-3.5" /> Direct local booking</Badge>
              </div>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.94] tracking-[-0.035em] text-charcoal sm:text-6xl lg:text-7xl">{tour.title}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-weathered">{tour.summary}</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 border-l-2 border-gold pl-5 text-sm font-semibold text-charcoal lg:max-w-xs lg:flex-col lg:gap-3">
              <span className="inline-flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4 text-clay" /> {tour.duration}</span>
              <span className="inline-flex items-center gap-2"><Users aria-hidden="true" className="size-4 text-clay" /> {isExperienceDay ? `Private experience day · up to ${tour.maxGroupSize}` : `Private · up to ${tour.maxGroupSize}`}</span>
              <span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="size-4 text-clay" /> {tour.location}</span>
            </div>
          </div>
        </div>
      </section>

      <PhotoGallery images={tour.gallery} title={tour.title} />

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:px-12 lg:py-20">
        <div className="min-w-0 space-y-16">
          <section aria-labelledby="itinerary-heading">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Your day</p>
            <h2 id="itinerary-heading" className="mt-3 font-serif text-4xl leading-none sm:text-5xl">What happens on the day</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-weathered">{isExperienceDay ? "We confirm both the main experience and your private pickup before the date, then keep the rest of the route deliberately simple." : "Pickup times change by hotel area. We’ll confirm your time on WhatsApp the evening before."}</p>
            <ItineraryTimeline stops={tour.itinerary} />
          </section>

          <section className="grid border border-charcoal/25 bg-frangipani md:grid-cols-2" aria-labelledby="included-heading">
            <div className="p-6 sm:p-8">
              <h2 id="included-heading" className="font-serif text-3xl">What’s included</h2>
              <ul className="mt-5 space-y-3">
                {tour.inclusions.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-charcoal"><Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-success" />{item}</li>)}
              </ul>
            </div>
            <div className="border-t border-charcoal/20 bg-limestone/55 p-6 sm:p-8 md:border-l md:border-t-0">
              <h2 className="font-serif text-3xl">Not included</h2>
              <ul className="mt-5 space-y-3">
                {tour.exclusions.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-weathered"><X aria-hidden="true" className="mt-1 size-4 shrink-0 text-clay" />{item}</li>)}
              </ul>
            </div>
          </section>

          <section aria-labelledby="pricing-heading">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Group pricing</p>
            <h2 id="pricing-heading" className="mt-3 font-serif text-4xl sm:text-5xl">{tour.pricingMode === "PER_VEHICLE" ? "One price for the vehicle" : isExperienceDay ? "Complete day price per person" : "Price per person"}</h2>
            <div className="mt-7 overflow-hidden border border-charcoal/25 bg-frangipani">
              <div className="grid grid-cols-[1fr_1fr_0.8fr] border-b border-charcoal/20 bg-terrace px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-frangipani sm:px-6">
                <span>Group size</span><span>{tour.pricingMode === "PER_VEHICLE" ? "Per vehicle" : "Per person"}</span><span className="text-right">USD est.</span>
              </div>
              {tour.pricingTiers.map((tier) => (
                <div key={tier.minPax} className="grid min-h-14 grid-cols-[1fr_1fr_0.8fr] items-center border-b border-charcoal/15 px-4 text-sm last:border-b-0 sm:px-6">
                  <span className="font-semibold">{tier.minPax === tier.maxPax ? tier.minPax : `${tier.minPax}–${tier.maxPax}`} {tier.maxPax === 1 ? "guest" : "guests"}</span>
                  <span className="font-serif text-lg font-semibold tabular-nums">{idrFormatter.format(tier.perPersonIdr)}</span>
                  <span className="text-right text-weathered">≈ {usdFormatter.format(tier.perPersonIdr / 16500)}</span>
                </div>
              ))}
              {tour.childPriceIdr !== null ? (
                <div className="grid min-h-14 grid-cols-[1fr_1fr_0.8fr] items-center border-t border-charcoal/20 bg-limestone/60 px-4 text-sm sm:px-6">
                  <span className="font-semibold">Child <span className="font-normal text-weathered">{tour.childAgeLabel ?? "supplier age band"}</span></span>
                  <span className="font-serif text-lg font-semibold tabular-nums">{idrFormatter.format(tour.childPriceIdr)}</span>
                  <span className="text-right text-weathered">≈ {usdFormatter.format(tour.childPriceIdr / 16500)}</span>
                </div>
              ) : null}
            </div>
            <p className="mt-3 text-xs leading-5 text-weathered">USD values are estimates for comparison. Your request and final confirmed price use IDR.</p>
          </section>

          <section className="grid gap-7 md:grid-cols-2" aria-label="Meeting and cancellation details">
            <div className="border-l-4 border-gold bg-charcoal p-6 text-frangipani sm:p-8">
              <MapPin aria-hidden="true" className="size-6 text-gold" />
              <h2 className="mt-5 font-serif text-3xl">Meeting point</h2>
              <p className="mt-4 font-semibold">{tour.meetingPoint}</p>
              <p className="mt-2 text-sm leading-6 text-frangipani/65">{tour.meetingNote}</p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tour.location + ", Bali")}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gold hover:underline">View the tour area <ExternalLink aria-hidden="true" className="size-3.5" /></a>
            </div>
            <div className="border border-charcoal/25 bg-frangipani p-6 sm:p-8">
              <ShieldCheck aria-hidden="true" className="size-6 text-clay" />
              <h2 className="mt-5 font-serif text-3xl">Cancellation policy</h2>
              <p className="mt-4 text-sm leading-6 text-weathered">{tour.cancellationPolicy}</p>
            </div>
          </section>

          <section className="border-t border-charcoal/25 pt-8" aria-labelledby="reviews-heading">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Guest reviews</p>
            <h2 id="reviews-heading" className="mt-3 font-serif text-4xl sm:text-5xl">Guest reviews are coming</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-weathered">We are moving existing guest feedback to this website. Until it is connected, message us on WhatsApp for the current review link.</p>
          </section>
        </div>

        <BookingWidget tourSlug={tour.slug} pricingTiers={tour.pricingTiers} pricingMode={tour.pricingMode ?? "PER_PERSON"} maxGroupSize={tour.maxGroupSize} blackoutDates={blackoutDates} initialDate={initialDate} initialPax={initialPax} automaticDiscounts={automaticOffersForTour(automaticOffers, slug)} />
      </div>

      <SiteFooter />
    </main>
  );
}
