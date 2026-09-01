import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DayPlanPromise } from "@/components/site/day-plan-promise";
import { HeroGallery, type HeroSlide } from "@/components/site/hero-gallery";
import { SearchPanel } from "@/components/site/search-panel";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TourCard } from "@/components/site/tour-card";
import { bestAutomaticOffer, getAutomaticDiscountOffers } from "@/lib/automatic-discounts";
import { getFeaturedPublicTours } from "@/lib/public-tour-data";
import { getAppUrl } from "@/lib/server-env";

export const metadata: Metadata = {
  title: "Private Bali Driver & Day Trips",
  description: "Book private Bali driver days with hotel pickup, clear IDR prices, realistic routes, and clearly listed admissions.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BaliXperience | Private Bali Driver & Day Trips",
    description: "Choose a ready-made Bali day or arrange a private driver around the places you want to visit.",
    url: "/",
    images: [{ url: "https://images.unsplash.com/photo-1769485016814-943270cdb5db?auto=format&fit=crop&w=1800&q=84", alt: "A Balinese woman carrying offerings near an ornate temple entrance" }],
  },
};

export const revalidate = 300;

const heroSlides: readonly HeroSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1769485016814-943270cdb5db?auto=format&fit=crop&w=2200&q=84",
    alt: "A Balinese woman carrying offerings near an ornate temple entrance",
    caption: "Morning offerings near a temple gate",
    objectPosition: "center 42%",
  },
  {
    src: "https://images.unsplash.com/photo-1555865138-193ba536d7e0?auto=format&fit=crop&w=2200&q=84",
    alt: "Layered green rice terraces in Bali",
    caption: "Rice terraces along the central Bali road",
    objectPosition: "center 52%",
  },
  {
    src: "https://images.unsplash.com/photo-1669108724321-aa81435896f4?auto=format&fit=crop&w=2200&q=84",
    alt: "Mount Batur at sunrise beneath a dark blue sky",
    caption: "An early start for Mount Batur",
    objectPosition: "center 58%",
  },
  {
    src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2200&q=84",
    alt: "A Balinese water temple reflected in a calm lake",
    caption: "A quieter temple morning in north Bali",
    objectPosition: "center 52%",
  },
] as const;

const dayStyles = [
  {
    label: "Adventure",
    duration: "8–10 hours",
    description: "Rafting, ATV rides and early starts for Mount Batur.",
    href: "/tours?collection=adventure",
    image: "https://images.unsplash.com/photo-1669108724321-aa81435896f4?auto=format&fit=crop&w=900&q=82",
  },
  {
    label: "Culture",
    duration: "6–8 hours",
    description: "Temple visits, village craft and days around Ubud.",
    href: "/tours?collection=culture",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=82",
  },
  {
    label: "Wellness",
    duration: "7–9 hours",
    description: "Spa, yoga, purification and hot-spring days.",
    href: "/tours?collection=wellness",
    image: "https://images.unsplash.com/photo-1661011612361-4e0704509a58?auto=format&fit=crop&w=900&q=82",
  },
  {
    label: "Scenic Bali",
    duration: "8–10 hours",
    description: "Rice terraces, waterfalls and quieter roads.",
    href: "/tours?collection=nature",
    image: "https://images.unsplash.com/photo-1555865138-193ba536d7e0?auto=format&fit=crop&w=900&q=82",
  },
  {
    label: "Private driver",
    duration: "10 hours",
    description: "A car and driver for the day. You choose the stops.",
    href: "/tours?collection=driver",
    image: "https://images.unsplash.com/photo-1506797848948-339596317992?auto=format&fit=crop&w=900&q=82",
  },
  {
    label: "Multi-day",
    duration: "2+ days",
    description: "Two or more days without rebuilding the plan each morning.",
    href: "/plan",
    image: "https://images.unsplash.com/photo-1551058624-e9390c71d17d?auto=format&fit=crop&w=900&q=82",
  },
] as const;

export default async function HomePage() {
  const topTours = await getFeaturedPublicTours(4);
  const automaticOffers = await getAutomaticDiscountOffers(topTours.map((tour) => tour.slug));
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "BaliXperience",
    url: getAppUrl(),
    description: "Private Bali driver days, ready-made routes, and experience packages with clear IDR pricing.",
    areaServed: { "@type": "AdministrativeArea", name: "Bali, Indonesia" },
  };

  return (
    <main className="bg-[#fbfaf6]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData).replace(/</g, "\\u003c") }} />
      <SiteHeader />

      <section className="site-shell grid overflow-hidden border-x border-b border-charcoal/15 bg-frangipani lg:min-h-[34rem] lg:grid-cols-[minmax(0,1.42fr)_minmax(25rem,1fr)]" aria-labelledby="hero-heading">
        <HeroGallery slides={heroSlides} />

        <div className="flex flex-col justify-center bg-frangipani px-5 py-7 sm:px-9 sm:py-12 lg:px-12 lg:py-14 xl:px-14">
          <h1 id="hero-heading" className="max-w-[11ch] font-serif text-[clamp(2.75rem,4.8vw,4.8rem)] font-normal leading-[0.95] tracking-[-0.035em] text-terrace">
            Bali, with your own driver.
          </h1>
          <p className="mt-5 max-w-[31rem] text-base leading-7 text-charcoal/72 sm:mt-6 sm:text-[1.0625rem]">
            Choose a ready-made day or send your places. We check pickup, route order, inclusions and final IDR total before confirming.
          </p>
          <div className="mt-6 max-w-xl sm:mt-7">
            <SearchPanel />
          </div>
        </div>
      </section>

      <aside className="border-b border-charcoal/15 bg-charcoal text-frangipani" aria-label="Booking confirmation promise">
        <div className="site-shell grid gap-3 py-5 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Checked before pickup</p>
          <p className="max-w-4xl font-serif text-xl font-normal leading-snug text-frangipani sm:text-2xl">Driver, pickup, route order, inclusions and final IDR total, written down before the day.</p>
          <Link href="/plan" className="inline-flex min-h-11 w-fit items-center gap-2 border-b border-frangipani/45 text-sm font-semibold text-frangipani hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
            Plan from my hotel <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </aside>

      <section id="experiences" className="scroll-mt-20 border-b border-charcoal/15 bg-[#fbfaf6] py-14 lg:py-20" aria-labelledby="categories-heading">
        <div className="site-shell">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="categories-heading" className="font-serif text-4xl font-normal leading-none tracking-[-0.02em] text-charcoal sm:text-5xl">Ways to experience Bali</h2>
            <Link href="/tours" className="inline-flex min-h-11 w-fit items-center gap-2 border-b border-charcoal/35 text-sm font-semibold text-charcoal hover:border-gold hover:text-terrace focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
              See every tour <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {dayStyles.map((style) => (
              <ExperienceChapter key={style.label} {...style} />
            ))}
          </div>
        </div>
      </section>

      <section id="top-picks" className="scroll-mt-20 bg-limestone py-14 lg:py-20" aria-labelledby="top-picks-heading">
        <div className="site-shell">
          <div className="grid gap-6 border-b border-charcoal/20 pb-8 lg:grid-cols-12 lg:items-end">
            <h2 id="top-picks-heading" className="font-serif text-4xl font-normal leading-none tracking-[-0.02em] text-charcoal sm:text-5xl lg:col-span-7">Popular private days</h2>
            <p className="max-w-xl text-base leading-7 text-weathered lg:col-span-5">These are the routes people ask for most. Each page shows the planned stops, estimated length and what the price covers.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {topTours.slice(0, 3).map((tour, index) => {
              const promotion = bestAutomaticOffer(automaticOffers, tour.slug);
              return (
                <TourCard key={tour.slug} tour={tour} priority={index === 0} promotion={promotion ? { ...promotion, exactForSelectedDate: false } : null} />
              );
            })}
          </div>
        </div>
      </section>

      <DayPlanPromise />

      <section id="custom-tour" className="scroll-mt-20 border-y border-charcoal/15 bg-frangipani">
        <div className="site-shell grid lg:grid-cols-2">
          <div className="relative min-h-72 overflow-hidden bg-terrace lg:min-h-[30rem]">
            <Image
              src="https://images.unsplash.com/photo-1557093793-d149a38a1be8?auto=format&fit=crop&w=1400&q=82"
              alt="Layered rice terraces in central Bali"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
            <h2 className="max-w-xl font-serif text-4xl font-normal leading-[1.02] tracking-[-0.02em] sm:text-5xl">Already have a few places in mind?</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-weathered">Send us your hotel area and your list. We’ll tell you which stops fit together, roughly how long the drive will take, and the price for the vehicle.</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/plan" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-gold bg-gold px-6 text-base font-semibold text-charcoal hover:bg-gold-dark focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">Plan your day <ArrowRight aria-hidden="true" className="size-4" /></Link>
              <Link href="/tours" className="inline-flex min-h-12 items-center justify-center rounded-control border border-charcoal/35 px-6 text-base font-semibold text-charcoal hover:bg-charcoal hover:text-frangipani focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">Browse tours</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function ExperienceChapter({ label, duration, description, href, image }: (typeof dayStyles)[number]) {
  return (
    <Link href={href} className="group grid min-w-0 grid-cols-[7.5rem_1fr] gap-4 border-t border-charcoal/20 pt-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus sm:block sm:border-t-0 sm:pt-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-limestone sm:aspect-[4/5]">
        <Image src={image} alt="" fill sizes="(max-width: 639px) 120px, (max-width: 1279px) 33vw, 16vw" className="object-cover transition-transform duration-slow group-hover:scale-[1.025]" />
      </div>
      <div className="sm:pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-2xl font-normal leading-none text-charcoal">{label}</h3>
          <ArrowRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-weathered transition-transform group-hover:translate-x-1 group-hover:text-terrace" />
        </div>
        <p className="mt-2 text-xs font-semibold text-clay">{duration}</p>
        <p className="mt-3 text-sm leading-5 text-weathered">{description}</p>
      </div>
    </Link>
  );
}

