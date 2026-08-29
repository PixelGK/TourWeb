import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { MultiDayPlanner } from "@/components/tours/multi-day-planner";
import { getPublicTours } from "@/lib/public-tour-data";

export const metadata: Metadata = {
  title: "Build a Multi-Day Bali Plan",
  description: "Combine two to five private Bali day routes and send one clear itinerary request to BaliXperience.",
  alternates: { canonical: "/plan" },
};

export default async function PlanPage() {
  const tours = await getPublicTours();
  const planTours = tours.filter((tour) => tour.category !== "Car Charter" && tour.durationHours <= 12);
  const readyMadePlans = tours
    .filter((tour) => tour.category === "Multi-Day Trips")
    .toSorted((a, b) => a.durationHours - b.durationHours);

  return (
    <main>
      <SiteHeader />
      <section className="border-b border-charcoal/20 bg-terrace text-frangipani">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">The BaliXperience route desk</p>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">Build several good days.<br />Not one exhausting checklist.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-frangipani/72">Choose the days that matter to you. We will check the driving order against your hotels, remove repeated areas, and send one written route and price before you confirm.</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        {readyMadePlans.length ? (
          <section aria-labelledby="ready-made-heading" className="mb-14">
            <div className="grid gap-4 border-b border-charcoal/25 pb-6 lg:grid-cols-[0.75fr_1fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Ready-made journeys</p>
                <h2 id="ready-made-heading" className="mt-2 font-serif text-4xl leading-none text-charcoal sm:text-5xl">Start with a route that already makes sense.</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-weathered lg:justify-self-end">These prices cover one private vehicle for up to six guests. Hotels, meals, and admission tickets stay separate, so you choose where to stay and what to spend.</p>
            </div>
            <div className="divide-y divide-charcoal/20 border-b border-charcoal/20">
              {readyMadePlans.map((tour) => {
                const days = Math.round(tour.durationHours / 24);
                return (
                  <Link key={tour.slug} href={`/tours/${tour.slug}`} className="group grid gap-4 py-6 transition-colors hover:bg-frangipani focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus sm:grid-cols-[5.5rem_1fr_auto] sm:items-center sm:px-4">
                    <div className="flex items-baseline gap-2 text-terrace sm:block">
                      <span className="font-serif text-5xl leading-none">{days}</span>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] sm:mt-1 sm:block">{days === 1 ? "day" : "days"}</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl leading-tight text-charcoal transition-colors group-hover:text-terrace">{tour.title}</h3>
                      <p className="mt-1 text-sm text-weathered">{tour.location} · {tour.note}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-lg font-bold text-charcoal">IDR {new Intl.NumberFormat("en-ID").format(tour.priceIdr)}</p>
                      <p className="mt-1 text-xs font-semibold text-weathered">per vehicle · up to 6</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
        <section aria-labelledby="custom-plan-heading">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Or build your own</p>
            <h2 id="custom-plan-heading" className="mt-2 font-serif text-4xl text-charcoal">Choose two to five individual days.</h2>
          </div>
        <MultiDayPlanner tours={planTours} phone={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER} />
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
  
