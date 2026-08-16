import { Filter, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export interface ActiveFilters {
  category?: string;
  duration?: string;
  price?: string;
  sort?: string;
  destination?: string;
  date?: string;
  pax?: string;
  collection?: string;
}

function FilterFields({ filters, categories }: { filters: ActiveFilters; categories: string[] }) {
  return (
    <div className="divide-y divide-charcoal/15">
      <fieldset className="pb-6">
        <legend className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-clay">Category</legend>
        <div className="space-y-2.5">
          <FilterRadio name="category" value="" label="All experiences" checked={!filters.category} />
          {categories.map((category) => (
            <FilterRadio key={category} name="category" value={category.toLowerCase()} label={category} checked={filters.category === category.toLowerCase()} />
          ))}
        </div>
      </fieldset>

      <fieldset className="py-6">
        <legend className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-clay">Duration</legend>
        <div className="space-y-2.5">
          <FilterRadio name="duration" value="" label="Any duration" checked={!filters.duration} />
          <FilterRadio name="duration" value="half-day" label="Half-day · up to 6h" checked={filters.duration === "half-day"} />
          <FilterRadio name="duration" value="full-day" label="Full-day · 7–12h" checked={filters.duration === "full-day"} />
          <FilterRadio name="duration" value="multi-day" label="Multi-day" checked={filters.duration === "multi-day"} />
        </div>
      </fieldset>

      <fieldset className="py-6">
        <legend className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-clay">Listed package price</legend>
        <div className="space-y-2.5">
          <FilterRadio name="price" value="" label="Any price" checked={!filters.price} />
          <FilterRadio name="price" value="under-750" label="Under IDR 750k" checked={filters.price === "under-750"} />
          <FilterRadio name="price" value="750-1000" label="IDR 750k–1m" checked={filters.price === "750-1000"} />
          <FilterRadio name="price" value="over-1000" label="Over IDR 1m" checked={filters.price === "over-1000"} />
        </div>
      </fieldset>

    </div>
  );
}

function FilterRadio({ name, value, label, checked }: { name: string; value: string; label: string; checked: boolean }) {
  return (
    <label className="group flex min-h-7 cursor-pointer items-center gap-3 text-sm text-charcoal">
      <input type="radio" name={name} value={value} defaultChecked={checked} className="peer sr-only" />
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-charcoal/45 bg-frangipani peer-checked:border-terrace peer-checked:bg-terrace peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-focus after:size-1.5 after:rounded-full after:bg-frangipani after:content-['']" />
      <span className="leading-5 group-hover:text-terrace">{label}</span>
    </label>
  );
}

function FilterForm({ filters, categories }: { filters: ActiveFilters; categories: string[] }) {
  return (
    <form action="/tours" method="get">
      {filters.sort && filters.sort !== "featured" ? <input type="hidden" name="sort" value={filters.sort} /> : null}
      {filters.destination && filters.destination !== "all" ? <input type="hidden" name="destination" value={filters.destination} /> : null}
      {filters.date ? <input type="hidden" name="date" value={filters.date} /> : null}
      {filters.pax ? <input type="hidden" name="pax" value={filters.pax} /> : null}
      {filters.collection ? <input type="hidden" name="collection" value={filters.collection} /> : null}
      <FilterFields filters={filters} categories={categories} />
      <div className="flex gap-3 border-t border-charcoal/25 pt-5">
        <Button type="submit" className="flex-1">Apply filters</Button>
        <Link href="/tours" className="inline-flex size-11 items-center justify-center rounded-control border border-charcoal/35 text-charcoal hover:bg-charcoal hover:text-frangipani focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus" title="Clear all filters">
          <RotateCcw aria-hidden="true" className="size-4" />
          <span className="sr-only">Clear all filters</span>
        </Link>
      </div>
    </form>
  );
}

export function TourFilters({ filters, categories }: { filters: ActiveFilters; categories: string[] }) {
  return (
    <>
      <details className="border border-charcoal/25 bg-frangipani lg:hidden">
        <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between px-4 font-semibold text-charcoal [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2"><Filter aria-hidden="true" className="size-4 text-clay" /> Filter tours</span>
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-weathered">Open</span>
        </summary>
        <div className="border-t border-charcoal/20 p-5"><FilterForm filters={filters} categories={categories} /></div>
      </details>

      <aside className="hidden lg:block" aria-label="Tour filters">
        <div className="sticky top-6 border border-charcoal/25 bg-frangipani p-6 shadow-sun">
          <div className="mb-6 flex items-center justify-between border-b border-charcoal/20 pb-4">
            <h2 className="inline-flex items-center gap-2 font-serif text-2xl"><Filter aria-hidden="true" className="size-4 text-clay" /> Filter tours</h2>
            <Link href="/tours" className="text-xs font-bold uppercase tracking-[0.1em] text-weathered underline decoration-charcoal/30 underline-offset-4 hover:text-clay">Clear</Link>
          </div>
          <FilterForm filters={filters} categories={categories} />
        </div>
      </aside>
    </>
  );
}
