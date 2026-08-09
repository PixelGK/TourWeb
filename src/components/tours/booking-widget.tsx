"use client";

import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { PricingTier } from "@/data/mock-tour-details";
import { getBookingWindow } from "@/lib/booking-window";

const idrFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const approximateIdrPerUsd = 16500;

function getPerPersonPrice(tiers: PricingTier[], pax: number) {
  return tiers.find((tier) => pax >= tier.minPax && pax <= tier.maxPax)?.perPersonIdr ?? tiers[tiers.length - 1].perPersonIdr;
}

export function BookingWidget({ tourSlug, pricingTiers, maxGroupSize, initialDate = "", initialPax = 2 }: { tourSlug: string; pricingTiers: PricingTier[]; maxGroupSize: number; initialDate?: string; initialPax?: number }) {
  const [pax, setPax] = useState(Math.min(Math.max(initialPax, 1), maxGroupSize));
  const [bookingWindow] = useState(getBookingWindow);
  const perPerson = getPerPersonPrice(pricingTiers, pax);
  const total = perPerson * pax;
  const usdEstimate = total / approximateIdrPerUsd;

  return (
    <>
      <aside className="sticky top-6 hidden border border-charcoal/25 bg-frangipani p-6 shadow-sun-raised lg:block" aria-label="Book this tour">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Reserve your date</p>
        <h2 className="mt-2 font-serif text-3xl">Book direct</h2>
        <BookingForm tourSlug={tourSlug} pax={pax} setPax={setPax} maxGroupSize={maxGroupSize} minDate={bookingWindow.minDate} maxDate={bookingWindow.maxDate} initialDate={initialDate} />
        <div className="mt-5 border-y border-charcoal/20 py-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-weathered">Total for {pax}</span>
            <strong className="font-serif text-3xl tabular-nums">{idrFormatter.format(total)}</strong>
          </div>
          <p className="mt-1 text-right text-xs text-weathered">≈ {usdFormatter.format(usdEstimate)} · charged in IDR</p>
        </div>
        <Button type="submit" form="desktop-booking-form" size="lg" className="mt-5 w-full">Continue to booking <ArrowRight aria-hidden="true" className="size-4" /></Button>
        <p className="mt-3 text-center text-xs leading-5 text-weathered">No card details are entered on this site. Secure hosted payment follows after traveler details.</p>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-charcoal/30 bg-frangipani p-3 shadow-[0_-5px_18px_rgb(28_27_24_/_0.16)] lg:hidden" aria-label="Mobile booking bar">
        <form id="mobile-booking-form" action="/checkout" method="get" className="mx-auto grid max-w-xl grid-cols-[1fr_4.5rem] gap-2">
          <input type="hidden" name="tour" value={tourSlug} />
          <label className="relative block">
            <span className="sr-only">Travel date</span>
            <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-2.5 top-3 size-4 text-clay" />
            <input type="date" name="date" min={bookingWindow.minDate} max={bookingWindow.maxDate} defaultValue={initialDate} required suppressHydrationWarning className="min-h-10 w-full rounded-control border border-charcoal/30 bg-limestone py-2 pl-8 pr-2 text-xs text-charcoal outline-none focus:border-terrace focus:ring-2 focus:ring-gold/30" />
          </label>
          <label className="relative block">
            <span className="sr-only">Travelers</span>
            <Users aria-hidden="true" className="pointer-events-none absolute left-2 top-3 size-3.5 text-clay" />
            <select name="pax" value={pax} onChange={(event) => setPax(Number(event.target.value))} className="min-h-10 w-full rounded-control border border-charcoal/30 bg-limestone py-2 pl-7 pr-1 text-xs font-semibold text-charcoal outline-none focus:border-terrace focus:ring-2 focus:ring-gold/30">
              {Array.from({ length: maxGroupSize }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <div className="col-span-2 flex items-center justify-between gap-3">
            <div>
              <span className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-weathered">Total · IDR</span>
              <strong className="font-serif text-xl tabular-nums">{idrFormatter.format(total)}</strong>
            </div>
            <Button type="submit" size="md">Choose date <ArrowRight aria-hidden="true" className="size-4" /></Button>
          </div>
        </form>
      </div>
    </>
  );
}

function BookingForm({ tourSlug, pax, setPax, maxGroupSize, minDate, maxDate, initialDate }: { tourSlug: string; pax: number; setPax: (pax: number) => void; maxGroupSize: number; minDate: string; maxDate: string; initialDate: string }) {
  return (
    <form id="desktop-booking-form" action="/checkout" method="get" className="mt-5 space-y-4">
      <input type="hidden" name="tour" value={tourSlug} />
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Travel date</span>
        <input type="date" name="date" min={minDate} max={maxDate} defaultValue={initialDate} required suppressHydrationWarning className="min-h-12 w-full rounded-field border border-charcoal/35 bg-limestone px-3.5 text-base text-charcoal outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30" />
        <span className="block text-xs leading-5 text-weathered">Dates open on a rolling 12-month window.</span>
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Travelers</span>
        <select name="pax" value={pax} onChange={(event) => setPax(Number(event.target.value))} className="min-h-12 w-full rounded-field border border-charcoal/35 bg-limestone px-3.5 text-base text-charcoal outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30">
          {Array.from({ length: maxGroupSize }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? "traveler" : "travelers"}</option>)}
        </select>
      </label>
    </form>
  );
}
