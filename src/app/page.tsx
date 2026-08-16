import {
  ArrowRight,
  CalendarCheck2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Headphones,
  MapPinned,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DayPlanPromise } from "@/components/site/day-plan-promise";
import { SearchPanel } from "@/components/site/search-panel";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TourCard } from "@/components/site/tour-card";
import { Badge } from "@/components/ui/badge";
import { bestAutomaticOffer, getAutomaticDiscountOffers } from "@/lib/automatic-discounts";
import { getFeaturedPublicTours } from "@/lib/public-tour-data";

export const metadata: Metadata = {
  title: "Private Bali Drivers & Experience Days",
  description: "Book private Bali day trips with an experienced local driver, including clearly bundled attraction and activity experiences.",
};

export const revalidate = 300;

const categories = [
  ["01", "Trekking"],
  ["02", "Water sports"],
  ["03", "Cultural tours"],
  ["04", "Car charter"],
  ["05", "Multi-day trips"],
  ["06", "Experience days"],
  ["07", "Custom tour"],
] as const;

const directReasons = [
  {
    number: "01",
    title: "One contact from start to finish",
    copy: "Ask questions before you book, then message the same local contact when it is time for pickup.",
    icon: Headphones,
  },
  {
    number: "02",
    title: "Prices are charged in IDR",
    copy: "You see what is included before you commit. USD is shown as an estimate so you can compare costs easily.",
    icon: CircleDollarSign,
  },
  {
    number: "03",
    title: "Your date is reserved",
    copy: "The availability calendar is tied to the places left for that tour, not a request waiting for someone to approve it.",
    icon: CalendarCheck2,
  },
  {
    number: "04",
    title: "Pickup is confirmed on WhatsApp",
    copy: "We send the pickup time and driver details directly, and stay reachable if traffic or weather changes the plan.",
    icon: MapPinned,
  },
] as const;

export default async function HomePage() {
  const topTours = await getFeaturedPublicTours(4);
  const automaticOffers = await getAutomaticDiscountOffers(topTours.map((tour) => tour.slug));

  return (
    <main>
      <SiteHeader />

      <section className="relative overflow-hidden bg-limestone" aria-labelledby="hero-heading">
        <div className="mx-auto grid w-full xl:min-h-[36rem] xl:w-[94%] xl:max-w-[1520px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
          <div className="relative z-10 flex min-w-0 flex-col justify-center px-5 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-14 xl:pb-20 xl:pt-16 2xl:px-16">
            <Badge tone="category" className="w-fit bg-transparent">
              <MapPinned aria-hidden="true" className="size-3.5" /> Bali-based · direct booking
            </Badge>
            <h1 id="hero-heading" className="mt-6 max-w-[12ch] font-serif text-[clamp(3rem,5.2vw,5.5rem)] leading-[0.93] tracking-[-0.04em] text-charcoal">
              See Bali with a local driver.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-weathered">
              Private day tours and driver hire, planned around where you are staying and how much you want to fit in.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold text-charcoal">
              <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-4 text-terrace" /> Your group only</span>
              <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-4 text-terrace" /> Pickup confirmed by WhatsApp</span>
            </div>
          </div>

          <div className="relative aspect-[16/11] min-w-0 w-full overflow-hidden bg-terrace sm:aspect-[16/9] xl:aspect-auto xl:min-h-[36rem]">
            <Image
              src="https://images.unsplash.com/photo-1573593198586-9335916930e5?auto=format&fit=crop&w=1800&q=84"
              alt="Layered green rice terraces and palms near Ubud, Bali"
              fill
              priority
              sizes="(max-width: 1279px) 100vw, min(50vw, 790px)"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/20 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute bottom-8 left-5 right-5 flex min-w-0 flex-col items-start gap-1 border-l-4 border-gold bg-charcoal/90 px-5 py-4 text-frangipani shadow-lg backdrop-blur-sm sm:bottom-10 sm:left-8 sm:right-auto sm:max-w-md sm:px-6 xl:bottom-14">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Tegalalang / North of Ubud</p>
              <p className="font-serif text-base leading-snug sm:text-lg">Routes shaped around real Bali traffic</p>
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto -mt-5 max-w-7xl px-5 pb-8 sm:-mt-8 sm:px-8 lg:-mt-10 lg:px-12">
          <SearchPanel />
        </div>
      </section>

      <section id="experiences" className="scroll-mt-24 border-y border-charcoal/20 bg-frangipani py-6" aria-labelledby="categories-heading">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <h2 id="categories-heading" className="sr-only">Browse tour categories</h2>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map(([number, label]) => (
              <Link key={label} href={`/tours?category=${encodeURIComponent(label.toLowerCase())}`} className="group flex min-h-14 min-w-fit snap-start items-center border border-charcoal/25 bg-limestone pr-4 transition-[background-color,border-color,color] duration-fast hover:border-terrace hover:bg-terrace hover:text-frangipani focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">
                <span className="self-stretch border-r border-current/20 px-3 py-4 text-xs font-bold tabular-nums text-clay group-hover:text-gold">{number}</span>
                <span className="pl-4 text-sm font-semibold">{label}</span>
                <ChevronRight aria-hidden="true" className="ml-4 size-4 text-weathered transition-transform duration-fast group-hover:translate-x-1 group-hover:text-gold" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="top-picks" className="scroll-mt-20 overflow-hidden bg-limestone py-16 lg:py-24" aria-labelledby="top-picks-heading">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Popular day tours</p>
              <h2 id="top-picks-heading" className="mt-3 font-serif text-4xl leading-none sm:text-5xl">Good places to start</h2>
            </div>
            <Link href="/tours" className="inline-flex min-h-11 items-center gap-2 border-b border-charcoal pb-1 text-sm font-bold text-charcoal hover:border-gold hover:text-terrace focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
              See all tours <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="-mx-5 mt-10 grid snap-x snap-mandatory auto-cols-[84%] grid-flow-col gap-5 overflow-x-auto px-5 pb-7 [scrollbar-color:var(--color-gold)_transparent] sm:-mx-8 sm:auto-cols-[46%] sm:px-8 lg:-mx-12 lg:auto-cols-[calc((100%-3rem)/3)] lg:px-12">
            {topTours.map((tour, index) => {
              const promotion = bestAutomaticOffer(automaticOffers, tour.slug);
              return (
                <div key={tour.slug} className="snap-start">
                  <TourCard tour={tour} priority={index === 0} promotion={promotion ? { ...promotion, exactForSelectedDate: false } : null} />
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.11em] text-weathered">Swipe or scroll to explore <span aria-hidden="true">→</span></p>
        </div>
      </section>

      <DayPlanPromise />

      <section id="why-direct" className="scroll-mt-20 bg-frangipani py-16 lg:py-24" aria-labelledby="direct-heading">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Why book direct</p>
            <h2 id="direct-heading" className="mt-4 font-serif text-4xl leading-[1.02] sm:text-5xl">Book with the person arranging your day.</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-weathered">Ask questions before you commit, confirm pickup on WhatsApp, and know who to contact if plans change.</p>
          </div>
          <div className="border-t border-charcoal/30 lg:col-span-8">
            {directReasons.map(({ number, title, copy, icon: Icon }) => (
              <div key={number} className="group grid gap-4 border-b border-charcoal/25 py-6 sm:grid-cols-[3rem_1fr_1.3fr_auto] sm:items-center">
                <span className="text-xs font-bold tabular-nums text-clay">{number}</span>
                <h3 className="font-serif text-2xl text-charcoal">{title}</h3>
                <p className="text-sm leading-6 text-weathered">{copy}</p>
                <Icon aria-hidden="true" className="hidden size-5 text-terrace transition-transform duration-fast group-hover:translate-x-1 sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="custom-tour" className="scroll-mt-20 border-y border-charcoal/20 bg-limestone">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative min-h-80 overflow-hidden bg-terrace lg:min-h-[31rem]">
            <Image
              src="https://images.unsplash.com/photo-1557093793-d149a38a1be8?auto=format&fit=crop&w=1400&q=82"
              alt="Layered rice terraces in Ubud, Bali"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-charcoal/15" aria-hidden="true" />
            <div className="absolute bottom-5 left-5 bg-charcoal px-4 py-3 text-frangipani sm:bottom-8 sm:left-8">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold">Pick the stops. We’ll sort the route.</p>
            </div>
          </div>
          <div className="flex flex-col justify-center px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
            <Sparkles aria-hidden="true" className="size-6 text-clay" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-clay">Build your own day</p>
            <h2 className="mt-3 max-w-xl font-serif text-4xl leading-[1.02] sm:text-5xl">Want to combine a few places?</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-weathered">Send your hotel area and the places you have in mind. We’ll tell you what fits, what doesn’t, and the total price.</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="#footer-contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-gold bg-gold px-6 text-base font-semibold text-charcoal shadow-sun transition hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-sun-raised">Plan my day <ArrowRight aria-hidden="true" className="size-4" /></Link>
              <Link href="/tours" className="inline-flex min-h-12 items-center justify-center rounded-control border border-charcoal/45 px-6 text-base font-semibold text-charcoal transition hover:bg-charcoal hover:text-frangipani">Browse tours</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
