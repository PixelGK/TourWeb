import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { MultiDayPlanner } from "@/components/tours/multi-day-planner";
import { getPublicTours } from "@/lib/public-tour-data";

export const metadata: Metadata = {
  title: "Build a Multi-Day Bali Plan",
  description: "Combine two to five private Bali day routes and send one clear itinerary request to BaliXperience.",
};

export default async function PlanPage() {
  const tours = await getPublicTours();
  const planTours = tours.filter((tour) => tour.category !== "Car Charter" && tour.durationHours <= 12);

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
        <MultiDayPlanner tours={planTours} phone={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER} />
      </div>
      <SiteFooter />
    </main>
  );
}
