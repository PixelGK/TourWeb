import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { tourCollections, type TourCollectionId } from "@/lib/tour-collections";

interface TourCollectionNavProps {
  active?: TourCollectionId;
  counts: Record<TourCollectionId, number>;
  date?: string;
  pax?: string;
}

export function TourCollectionNav({ active, counts, date, pax }: TourCollectionNavProps) {
  return (
    <section aria-labelledby="route-collections-heading" className="border-b border-charcoal/20 bg-frangipani">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-clay">Start with the shape of the day</p>
            <h2 id="route-collections-heading" className="mt-2 font-serif text-3xl text-charcoal">Which Bali do you want today?</h2>
          </div>
          {active ? <Link href="/tours" className="text-sm font-semibold text-terrace underline decoration-gold underline-offset-4">Show every route</Link> : null}
        </div>

        <div className="-mx-5 flex snap-x snap-mandatory overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
          {tourCollections.map((collection) => {
            const params = new URLSearchParams({ collection: collection.id });
            if (date) params.set("date", date);
            if (pax) params.set("pax", pax);
            const isActive = active === collection.id;
            return (
              <Link
                key={collection.id}
                href={`/tours?${params.toString()}`}
                aria-current={isActive ? "page" : undefined}
                className={`group relative min-w-[15rem] snap-start border border-r-0 border-charcoal/20 p-5 last:border-r sm:min-w-0 ${isActive ? "bg-terrace text-frangipani" : "bg-limestone text-charcoal hover:bg-gold-pale"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`text-xs font-bold uppercase tracking-[0.12em] ${isActive ? "text-gold" : "text-clay"}`}>{counts[collection.id]} {counts[collection.id] === 1 ? "route" : "routes"}</span>
                  <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <strong className="mt-7 block font-serif text-2xl leading-none">{collection.label}</strong>
                <span className={`mt-3 block text-sm leading-5 ${isActive ? "text-frangipani/70" : "text-weathered"}`}>{collection.description}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
