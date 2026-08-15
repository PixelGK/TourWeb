"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { AdminTourRow } from "@/lib/admin-data";

export function AvailabilityWorkspace({
  tours,
  selectedTour,
  month,
}: {
  tours: AdminTourRow[];
  selectedTour: AdminTourRow;
  month: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  function selectTour(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const exactMatch = tours.find((tour) => tour.title.toLocaleLowerCase() === normalizedQuery);
    const partialMatches = tours.filter((tour) => tour.title.toLocaleLowerCase().includes(normalizedQuery));
    const match = exactMatch ?? (partialMatches.length === 1 ? partialMatches[0] : undefined);

    if (!normalizedQuery || !match) {
      setMessage(partialMatches.length > 1
        ? `${partialMatches.length} tours match. Add another word or choose a suggestion.`
        : "Choose a tour from the suggestions or enter part of its name.");
      return;
    }

    setMessage("");
    router.replace(`/admin/availability?tour=${encodeURIComponent(match.id)}&month=${month}`);
  }

  return (
    <section aria-labelledby="selected-tour-heading" className="border-y-2 border-charcoal bg-terrace text-frangipani">
      <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)] lg:items-end">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold">Working calendar</p>
          <h2 id="selected-tour-heading" className="mt-1 font-serif text-2xl leading-tight sm:text-3xl">{selectedTour.title}</h2>
          <p className="mt-2 text-sm text-frangipani/70">
            {selectedTour.openDateCount} open dates across the schedule · up to {selectedTour.maxGroupSize} guests
          </p>
        </div>

        <form onSubmit={selectTour} role="search" className="relative">
          <label htmlFor="availability-tour-search" className="mb-2 block text-sm font-semibold">Find another tour</label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/55" aria-hidden="true" />
              <input
                id="availability-tour-search"
                type="search"
                list="availability-tour-options"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type a tour name…"
                autoComplete="off"
                aria-describedby={message ? "availability-tour-search-error" : undefined}
                className="min-h-11 w-full border border-frangipani/40 bg-frangipani py-2 pl-10 pr-3 text-sm text-charcoal outline-none placeholder:text-weathered focus:border-gold focus:ring-3 focus:ring-gold/30"
              />
              <datalist id="availability-tour-options">
                {tours.map((tour) => <option key={tour.id} value={tour.title} />)}
              </datalist>
            </div>
            <button type="submit" className="min-h-11 border border-gold bg-gold px-4 text-sm font-bold text-charcoal transition-colors hover:bg-frangipani focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold">
              Show
            </button>
          </div>
          {message ? <p id="availability-tour-search-error" className="mt-2 text-sm font-semibold text-frangipani" role="alert">{message}</p> : null}
        </form>
      </div>
    </section>
  );
}
