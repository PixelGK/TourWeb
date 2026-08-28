"use client";

import Link from "next/link";

import { tourCollections, type TourCollectionId } from "@/lib/tour-collections";
import { trackConversion } from "@/lib/analytics";

interface TourCollectionNavProps {
  active?: TourCollectionId;
  counts: Record<TourCollectionId, number>;
  date?: string;
  pax?: string;
}

export function TourCollectionNav({ active, counts, date, pax }: TourCollectionNavProps) {
  return (
    <nav aria-label="Tour collections" className="border-b border-charcoal/15 bg-white">
      <div className="site-shell flex snap-x snap-mandatory gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/tours" aria-current={!active ? "page" : undefined} className={collectionClass(!active)}>
          <span>All tours</span>
        </Link>
        {tourCollections.map((collection) => {
          const params = new URLSearchParams({ collection: collection.id });
          if (date) params.set("date", date);
          if (pax) params.set("pax", pax);
          const isActive = active === collection.id;

          return (
            <Link key={collection.id} href={`/tours?${params.toString()}`} onClick={() => trackConversion("collection_selected", { collection: collection.id })} aria-current={isActive ? "page" : undefined} className={collectionClass(isActive)}>
              <span>{collection.label}</span>
              <span className="text-xs font-normal text-weathered">{counts[collection.id]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function collectionClass(active: boolean) {
  return `flex min-h-15 shrink-0 snap-start items-center gap-2 border-b-2 px-1 pt-0.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${active ? "border-gold text-terrace" : "border-transparent text-charcoal/65 hover:border-charcoal/25 hover:text-charcoal"}`;
}
