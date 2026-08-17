"use client";

import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getBookingWindow } from "@/lib/booking-window";
import type { PricingTier, PublicTourVariant, TourPricingMode } from "@/types/public-tour";
import { calculatePackageTotal, calculateVariantPriceAdjustment } from "@/lib/tour-pricing";

const idrFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const approximateIdrPerUsd = 16500;

interface AutomaticDiscount {
  name: string;
  percentOff: number;
  startsOn: string;
  endsOn: string;
}

export function BookingWidget({ tourSlug, pricingTiers, pricingMode, variants = [], maxGroupSize, blackoutDates = [], initialDate = "", initialPax = 2, automaticDiscounts = [] }: { tourSlug: string; pricingTiers: PricingTier[]; pricingMode: TourPricingMode; variants?: PublicTourVariant[]; maxGroupSize: number; blackoutDates?: string[]; initialDate?: string; initialPax?: number; automaticDiscounts?: AutomaticDiscount[] }) {
  const [pax, setPax] = useState(Math.min(Math.max(initialPax, 1), maxGroupSize));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [bookingWindow] = useState(getBookingWindow);
  const [variantCode, setVariantCode] = useState(variants.find((variant) => variant.isDefault)?.code ?? variants[0]?.code ?? "");
  const selectedVariant = variants.find((variant) => variant.code === variantCode);
  function updatePax(nextPax: number) {
    setPax(nextPax);
    if (selectedVariant && selectedVariant.guestsPerUnit > nextPax) setVariantCode(variants.find((variant) => variant.guestsPerUnit <= nextPax && variant.isDefault)?.code ?? variants.find((variant) => variant.guestsPerUnit <= nextPax)?.code ?? "");
  }
  const total = calculatePackageTotal({ pricingMode, pricingTiers, pax }) + calculateVariantPriceAdjustment(selectedVariant, pax);
  const activeDiscount = automaticDiscounts.find((offer) => selectedDate >= offer.startsOn && selectedDate <= offer.endsOn);
  const discountedTotal = activeDiscount ? Math.floor(total * (100 - activeDiscount.percentOff) / 100) : total;
  const usdEstimate = discountedTotal / approximateIdrPerUsd;
  const advertisedDiscount = automaticDiscounts[0];

  return (
    <>
      <aside className="sticky top-6 hidden border border-charcoal/25 bg-frangipani p-6 shadow-sun-raised lg:block" aria-label="Book this tour">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Reserve your date</p>
        <h2 className="mt-2 font-serif text-3xl">Book direct</h2>
        {advertisedDiscount ? <p className="mt-4 border-l-3 border-gold bg-limestone px-3 py-2 text-xs font-semibold leading-5 text-terrace">{advertisedDiscount.name}: up to {advertisedDiscount.percentOff}% off selected dates. Choose a date to see the exact price.</p> : null}
        <BookingForm tourSlug={tourSlug} pax={pax} setPax={updatePax} variants={variants} variantCode={variantCode} setVariantCode={setVariantCode} maxGroupSize={maxGroupSize} minDate={bookingWindow.minDate} maxDate={bookingWindow.maxDate} blackoutDates={blackoutDates} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        <div className="mt-5 border-y border-charcoal/20 py-4">
          {activeDiscount ? <p className="mb-2 text-xs font-bold text-terrace">{activeDiscount.name} · {activeDiscount.percentOff}% off</p> : null}
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-weathered">{pricingMode === "PER_VEHICLE" ? `One vehicle · ${pax} guests` : `Total for ${pax}`}</span>
            <span className="text-right">
              {activeDiscount ? <span className="block text-xs tabular-nums text-weathered line-through decoration-clay">{idrFormatter.format(total)}</span> : null}
              <strong className="block font-serif text-3xl tabular-nums">{idrFormatter.format(discountedTotal)}</strong>
            </span>
          </div>
          <p className="mt-1 text-right text-xs text-weathered">≈ {usdFormatter.format(usdEstimate)} · final price in IDR</p>
        </div>
        <Button type="submit" form="desktop-booking-form" size="lg" className="mt-5 w-full">Continue to booking <ArrowRight aria-hidden="true" className="size-4" /></Button>
        <p className="mt-3 text-center text-xs leading-5 text-weathered">No payment today. Send a request and we’ll confirm the driver and included arrangements with you.</p>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-charcoal/30 bg-frangipani p-3 shadow-[0_-5px_18px_rgb(28_27_24_/_0.16)] lg:hidden" aria-label="Mobile booking bar">
        <form id="mobile-booking-form" action="/checkout" method="get" className="mx-auto grid max-w-xl grid-cols-[1fr_4.5rem] gap-2">
          <input type="hidden" name="tour" value={tourSlug} />
          {variants.length ? <label className="col-span-2"><span className="sr-only">Ride option</span><select name="variant" value={variantCode} onChange={(event) => setVariantCode(event.target.value)} className="min-h-10 w-full rounded-control border border-charcoal/30 bg-limestone px-3 text-xs font-semibold text-charcoal outline-none focus:border-terrace focus:ring-2 focus:ring-gold/30">{variants.map((variant) => <option key={variant.code} value={variant.code} disabled={variant.guestsPerUnit > pax}>{variant.title}</option>)}</select></label> : null}
          <label className="relative block">
            <span className="sr-only">Travel date</span>
            <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-2.5 top-3 size-4 text-clay" />
            <input type="date" name="date" min={bookingWindow.minDate} max={bookingWindow.maxDate} value={selectedDate} required suppressHydrationWarning onChange={(event) => { setSelectedDate(event.currentTarget.value); event.currentTarget.setCustomValidity(blackoutDates.includes(event.currentTarget.value) ? "This is an island-wide closure date. Please choose another day." : ""); }} className="min-h-10 w-full rounded-control border border-charcoal/30 bg-limestone py-2 pl-8 pr-2 text-xs text-charcoal outline-none focus:border-terrace focus:ring-2 focus:ring-gold/30" />
          </label>
          <label className="relative block">
            <span className="sr-only">Travelers</span>
            <Users aria-hidden="true" className="pointer-events-none absolute left-2 top-3 size-3.5 text-clay" />
            <select name="pax" value={pax} onChange={(event) => updatePax(Number(event.target.value))} className="min-h-10 w-full rounded-control border border-charcoal/30 bg-limestone py-2 pl-7 pr-1 text-xs font-semibold text-charcoal outline-none focus:border-terrace focus:ring-2 focus:ring-gold/30">
              {Array.from({ length: maxGroupSize }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <div className="col-span-2 flex items-center justify-between gap-3">
            <div>
              <span className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-weathered">Total · IDR{activeDiscount ? ` · ${activeDiscount.percentOff}% off` : ""}</span>
              {activeDiscount ? <span className="mr-2 text-[0.65rem] tabular-nums text-weathered line-through">{idrFormatter.format(total)}</span> : null}
              <strong className="font-serif text-xl tabular-nums">{idrFormatter.format(discountedTotal)}</strong>
            </div>
            <Button type="submit" size="md">Choose date <ArrowRight aria-hidden="true" className="size-4" /></Button>
          </div>
        </form>
      </div>
    </>
  );
}

function BookingForm({ tourSlug, pax, setPax, variants, variantCode, setVariantCode, maxGroupSize, minDate, maxDate, blackoutDates, selectedDate, setSelectedDate }: { tourSlug: string; pax: number; setPax: (pax: number) => void; variants: PublicTourVariant[]; variantCode: string; setVariantCode: (code: string) => void; maxGroupSize: number; minDate: string; maxDate: string; blackoutDates: string[]; selectedDate: string; setSelectedDate: (date: string) => void }) {
  return (
    <form id="desktop-booking-form" action="/checkout" method="get" className="mt-5 space-y-4">
      <input type="hidden" name="tour" value={tourSlug} />
      {variants.length ? <label className="block space-y-2"><span className="text-sm font-semibold">Ride option</span><select name="variant" value={variantCode} onChange={(event) => setVariantCode(event.target.value)} className="min-h-12 w-full rounded-field border border-charcoal/35 bg-limestone px-3.5 text-base text-charcoal outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30">{variants.map((variant) => <option key={variant.code} value={variant.code} disabled={variant.guestsPerUnit > pax}>{variant.title}{variant.priceAdjustmentIdr === 0 ? "" : ` (${variant.priceAdjustmentIdr > 0 ? "+" : "−"}${idrFormatter.format(Math.abs(variant.priceAdjustmentIdr))} each)`}</option>)}</select><span className="block text-xs leading-5 text-weathered">Shared ATVs require at least two travelers.</span></label> : null}
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Travel date</span>
        <input type="date" name="date" min={minDate} max={maxDate} value={selectedDate} required suppressHydrationWarning onChange={(event) => { setSelectedDate(event.currentTarget.value); event.currentTarget.setCustomValidity(blackoutDates.includes(event.currentTarget.value) ? "This is an island-wide closure date. Please choose another day." : ""); }} className="min-h-12 w-full rounded-field border border-charcoal/35 bg-limestone px-3.5 text-base text-charcoal outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30" />
        <span className="block text-xs leading-5 text-weathered">Dates open for 12 months. Nyepi and other island-wide closures are unavailable.</span>
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
