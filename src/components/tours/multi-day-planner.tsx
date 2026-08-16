"use client";

import { ArrowRight, Check, GripVertical, MapPin, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { collectionForTour, tourCollections } from "@/lib/tour-collections";
import type { PublicTourCard } from "@/types/public-tour";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function MultiDayPlanner({ tours, phone }: { tours: PublicTourCard[]; phone?: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pax, setPax] = useState(2);
  const selectedTours = selected.map((slug) => tours.find((tour) => tour.slug === slug)).filter((tour): tour is PublicTourCard => Boolean(tour));
  const normalizedPhone = phone?.replace(/\D/g, "");
  const message = [
    `Hi BaliXperience, I would like a ${selectedTours.length}-day private Bali plan for ${pax} ${pax === 1 ? "guest" : "guests"}:`,
    ...selectedTours.map((tour, index) => `Day ${index + 1}: ${tour.title} (${tour.location})`),
    "Please check the route order, pickup supplements, admission budget, and final package price.",
  ].join("\n");

  function toggle(slug: string) {
    setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < 5 ? [...current, slug] : current);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-10">
        {tourCollections.filter((collection) => collection.id !== "driver").map((collection) => {
          const collectionTours = tours.filter((tour) => collectionForTour(tour) === collection.id);
          if (!collectionTours.length) return null;
          return (
            <section key={collection.id} aria-labelledby={`collection-${collection.id}`}>
              <div className="mb-4 flex items-end justify-between gap-4 border-b border-charcoal/20 pb-3">
                <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-clay">{collection.description}</p><h2 id={`collection-${collection.id}`} className="mt-1 font-serif text-3xl">{collection.label}</h2></div>
                <span className="text-sm text-weathered">{collectionTours.length} choices</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {collectionTours.map((tour) => {
                  const active = selected.includes(tour.slug);
                  const full = selected.length >= 5 && !active;
                  return (
                    <button key={tour.slug} type="button" onClick={() => toggle(tour.slug)} disabled={full} aria-pressed={active} className={`group min-h-36 border p-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${active ? "border-terrace bg-terrace text-frangipani" : "border-charcoal/20 bg-frangipani hover:border-charcoal/55"}`}>
                      <div className="flex items-start justify-between gap-4"><span className={`text-xs font-bold uppercase tracking-[0.12em] ${active ? "text-gold" : "text-clay"}`}>{tour.duration}</span><span className={`flex size-7 items-center justify-center border ${active ? "border-gold bg-gold text-charcoal" : "border-charcoal/25"}`}>{active ? <Check aria-hidden="true" className="size-4" /> : <span className="text-lg leading-none">+</span>}</span></div>
                      <strong className="mt-4 block font-serif text-xl leading-tight">{tour.title}</strong>
                      <span className={`mt-3 flex items-center gap-1.5 text-xs ${active ? "text-frangipani/70" : "text-weathered"}`}><MapPin aria-hidden="true" className="size-3.5" /> {tour.location} · {idr.format(tour.priceIdr)} {tour.pricingMode === "PER_VEHICLE" ? "per vehicle" : "per guest"}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <aside className="lg:sticky lg:top-6" aria-label="Your multi-day plan">
        <div className="border border-charcoal/25 bg-charcoal p-6 text-frangipani shadow-sun-dark">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Your route</p><h2 className="mt-2 font-serif text-3xl">{selected.length ? `${selected.length} Bali days` : "Start a plan"}</h2></div>{selected.length ? <button type="button" onClick={() => setSelected([])} className="flex size-9 items-center justify-center border border-frangipani/25 text-frangipani/70 hover:text-frangipani" title="Clear plan"><RotateCcw aria-hidden="true" className="size-4" /><span className="sr-only">Clear plan</span></button> : null}</div>

          {selectedTours.length ? <ol className="mt-6 space-y-2">{selectedTours.map((tour, index) => <li key={tour.slug} className="flex items-center gap-3 border border-frangipani/15 bg-frangipani/5 p-3"><GripVertical aria-hidden="true" className="size-4 shrink-0 text-frangipani/35" /><span className="flex size-7 shrink-0 items-center justify-center bg-gold text-xs font-bold text-charcoal">{index + 1}</span><span className="min-w-0 flex-1 text-sm font-semibold leading-5">{tour.title}</span><button type="button" onClick={() => toggle(tour.slug)} className="text-frangipani/55 hover:text-frangipani"><X aria-hidden="true" className="size-4" /><span className="sr-only">Remove {tour.title}</span></button></li>)}</ol> : <p className="mt-5 text-sm leading-6 text-frangipani/65">Choose two to five day routes. The order you add them becomes the first draft of your trip.</p>}

          <label className="mt-6 block text-xs font-bold uppercase tracking-[0.12em] text-frangipani/65" htmlFor="planner-pax">Travelers</label>
          <select id="planner-pax" value={pax} onChange={(event) => setPax(Number(event.target.value))} className="mt-2 min-h-11 w-full border border-frangipani/30 bg-charcoal px-3 text-sm text-frangipani focus:outline-2 focus:outline-offset-2 focus:outline-gold">
            {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}
          </select>

          <p className="mt-5 border-l-2 border-gold pl-3 text-xs leading-5 text-frangipani/60">We do not show a fake combined total: activity days are per guest, driver routes are per vehicle, and the most efficient order depends on your hotels.</p>

          {normalizedPhone && selected.length >= 2 ? <a href={`https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="mt-6 flex min-h-12 items-center justify-between bg-gold px-4 text-sm font-bold text-charcoal hover:bg-gold-pale">Ask for this plan <ArrowRight aria-hidden="true" className="size-4" /></a> : <span className="mt-6 flex min-h-12 items-center justify-center border border-frangipani/20 px-4 text-center text-sm font-semibold text-frangipani/45">Choose at least two days</span>}
          <Link href="/tours" className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-frangipani/70 underline decoration-frangipani/30 underline-offset-4 hover:text-frangipani">Open the full tour catalogue</Link>
        </div>
      </aside>
    </div>
  );
}
