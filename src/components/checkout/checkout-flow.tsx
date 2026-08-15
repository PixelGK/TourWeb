"use client";

import { ArrowLeft, ArrowRight, CalendarCheck2, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PricingTier } from "@/data/mock-tour-details";
import type { MockAddon } from "@/data/mock-addons";
import { cn } from "@/lib/utils";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const longDate = new Intl.DateTimeFormat("en", { dateStyle: "full", timeZone: "UTC" });
const idrPerUsdEstimate = 16500;

interface TravelerState {
  name: string;
  email: string;
  phone: string;
  country: string;
  hotelName: string;
  notes: string;
}

interface CheckoutFlowProps {
  tour: { slug: string; title: string; location: string; duration: string };
  date: string;
  pax: number;
  pricingTiers: PricingTier[];
  addons: MockAddon[];
  childPriceIdr: number | null;
  childAgeLabel: string | null;
  automaticDiscount: { name: string; percentOff: number } | null;
  mode: "request" | "payment";
}

export function CheckoutFlow({ tour, date, pax, pricingTiers, addons, childPriceIdr, childAgeLabel, automaticDiscount, mode }: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [traveler, setTraveler] = useState<TravelerState>({ name: "", email: "", phone: "", country: "", hotelName: "", notes: "" });
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const hasLunchOption = addons.some((addon) => addon.code === "local-lunch");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [adultCount, setAdultCount] = useState(pax);
  const [childCount, setChildCount] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState<{ code: string; percentOff: number } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  const lunchAddon = addons.find((addon) => addon.code === "local-lunch");
  const otherAddons = addons.filter((addon) => addon.code !== "local-lunch");
  const lunchIncluded = lunchAddon ? selectedAddons.includes(lunchAddon.code) : false;
  const selectedExtraCount = selectedAddons.filter((code) => code !== lunchAddon?.code).length;
  const perPersonIdr = pricingTiers.find((tier) => pax >= tier.minPax && pax <= tier.maxPax)?.perPersonIdr ?? pricingTiers.at(-1)?.perPersonIdr ?? 0;
  const addOnTotal = addons.filter((addon) => selectedAddons.includes(addon.code)).reduce((sum, addon) => sum + addon.priceIdr * (addon.pricingMode === "PER_PERSON" ? pax : 1), 0);
  const basePackageTotalIdr = perPersonIdr * adultCount + (childPriceIdr ?? perPersonIdr) * childCount;
  const packageSubtotalIdr = basePackageTotalIdr + addOnTotal;
  const activeDiscount = promoDiscount && (!automaticDiscount || promoDiscount.percentOff >= automaticDiscount.percentOff)
    ? { label: promoDiscount.code, percentOff: promoDiscount.percentOff }
    : automaticDiscount ? { label: automaticDiscount.name, percentOff: automaticDiscount.percentOff } : null;
  const discountAmountIdr = activeDiscount ? Math.floor(basePackageTotalIdr * activeDiscount.percentOff / 100) : 0;
  const totalIdr = packageSubtotalIdr - discountAmountIdr;
  const dateLabel = longDate.format(new Date(`${date}T00:00:00.000Z`));

  function updateTraveler(field: keyof TravelerState, value: string) {
    setTraveler((current) => ({ ...current, [field]: value }));
  }

  function continueFromTraveler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseLunch(included: boolean) {
    if (!lunchAddon) return;
    setSelectedAddons((current) => included
      ? [...new Set([...current, lunchAddon.code])]
      : current.filter((code) => code !== lunchAddon.code));
  }

  function updateTravelerCounts(adults: number, children: number) {
    if (adults + children > pax) return;
    setAdultCount(adults);
    setChildCount(children);
  }

  async function applyDiscount() {
    const code = discountCode.trim().toUpperCase();
    if (!code) return;
    setDiscountLoading(true);
    setError("");
    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, tourSlug: tour.slug }),
      });
      const result = await response.json() as { error?: string; code?: string; percentOff?: number };
      if (!response.ok || !result.code || !result.percentOff) throw new Error(result.error ?? "Discount code could not be applied");
      setPromoDiscount({ code: result.code, percentOff: result.percentOff });
      setDiscountCode(result.code);
    } catch (caught) {
      setPromoDiscount(null);
      setError(caught instanceof Error ? caught.message : "Discount code could not be applied");
    } finally {
      setDiscountLoading(false);
    }
  }

  async function submitBooking() {
    if (!termsAccepted) {
      setError(`Please accept the Booking Terms and Privacy Notice before ${mode === "request" ? "sending your request" : "continuing to payment"}.`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ tourSlug: tour.slug, date, pax, adultCount, childCount, discountCode: promoDiscount?.code ?? "", addonCodes: selectedAddons, termsAccepted, traveler }),
      });
      const result = await response.json() as { error?: string; redirectUrl?: string; confirmationUrl?: string };
      const destination = mode === "request" ? result.confirmationUrl : result.redirectUrl;
      if (!response.ok || !destination) {
        if (response.status === 502) setIdempotencyKey(crypto.randomUUID());
        throw new Error(result.error ?? (mode === "request" ? "Your booking request could not be sent" : "Secure payment could not be started"));
      }

      const redirect = new URL(destination, window.location.origin);
      if (mode === "request") {
        if (redirect.origin !== window.location.origin || redirect.pathname !== "/checkout/confirmation") throw new Error("The booking confirmation destination was not recognized");
      } else if (redirect.protocol !== "https:" || !new Set(["app.midtrans.com", "app.sandbox.midtrans.com"]).has(redirect.hostname)) {
        throw new Error("The payment destination was not recognized");
      }
      window.location.assign(redirect.toString());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (mode === "request" ? "Your booking request could not be sent" : "Secure payment could not be started"));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-12">
      <main>
        <ol aria-label="Checkout progress" className="mb-8 grid grid-cols-3 border border-charcoal/25 bg-frangipani">
          {["Traveler", "Options", mode === "request" ? "Request" : "Payment"].map((label, index) => {
            const number = index + 1;
            return <li key={label} aria-current={step === number ? "step" : undefined} className={cn("flex min-h-14 items-center gap-2 border-r border-charcoal/20 px-3 text-sm last:border-r-0 sm:px-5", step === number && "bg-terrace text-frangipani", step > number && "text-terrace")}>
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold", step === number ? "border-frangipani/60" : "border-current")}>{step > number ? <Check className="size-3.5" aria-hidden="true" /> : number}</span>
              <span className="hidden font-semibold sm:inline">{label}</span>
            </li>;
          })}
        </ol>

        {step === 1 ? (
          <section aria-labelledby="traveler-heading">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-clay">Step 1 of 3</p>
            <h1 id="traveler-heading" className="mt-2 font-serif text-4xl sm:text-5xl">Traveler details</h1>
            <p className="mt-3 max-w-2xl text-weathered">Tell us who is making the booking and where you are staying. You can confirm the hotel later if you have not booked it yet.</p>
            <form onSubmit={continueFromTraveler} className="mt-8 grid gap-5 sm:grid-cols-2">
              <Input label="Full name" autoComplete="name" required value={traveler.name} onChange={(event) => updateTraveler("name", event.target.value)} />
              <Input label="Email" type="email" autoComplete="email" required value={traveler.email} onChange={(event) => updateTraveler("email", event.target.value)} />
              <Input label="WhatsApp / phone" type="tel" autoComplete="tel" required hint="Include your country code, for example +61." value={traveler.phone} onChange={(event) => updateTraveler("phone", event.target.value)} />
              <Input label="Country" autoComplete="country-name" required value={traveler.country} onChange={(event) => updateTraveler("country", event.target.value)} />
              <Input label="Bali hotel or villa" autoComplete="organization" hint="Optional—you can confirm this later on WhatsApp." value={traveler.hotelName} onChange={(event) => updateTraveler("hotelName", event.target.value)} containerClassName="sm:col-span-2" />
              <label className="space-y-2 sm:col-span-2">
                <span className="block text-sm font-semibold">Notes for the operator <span className="font-normal text-weathered">(optional)</span></span>
                <textarea value={traveler.notes} onChange={(event) => updateTraveler("notes", event.target.value)} maxLength={800} rows={4} className="w-full rounded-field border border-charcoal/35 bg-frangipani px-3.5 py-3 text-base outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30" placeholder="Mobility needs, dietary requests, pickup questions…" />
              </label>
              <Button type="submit" size="lg" className="sm:col-start-2">Choose trip options <ArrowRight className="size-4" aria-hidden="true" /></Button>
            </form>
          </section>
        ) : null}

        {step === 2 ? (
          <section aria-labelledby="addons-heading">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-clay">Step 2 of 3</p>
            <h1 id="addons-heading" className="mt-2 font-serif text-4xl sm:text-5xl">{hasLunchOption ? "Choose lunch and extras" : "Choose optional extras"}</h1>
            <p className="mt-3 text-weathered">{hasLunchOption ? `Lunch is optional. Every extra is priced in IDR before you ${mode === "request" ? "send the request" : "pay"}.` : `Add only what you need. Every extra is priced in IDR before you ${mode === "request" ? "send the request" : "pay"}.`}</p>

            {childPriceIdr !== null ? (
              <fieldset className="mt-8 border border-charcoal/25 bg-frangipani p-5">
                <legend className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-clay">Traveler prices</legend>
                <p className="text-sm leading-6 text-weathered">This package has a separate child rate{childAgeLabel ? ` for ${childAgeLabel}` : ""}. At least one adult is required, and the total must remain {pax}.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input label="Adults" type="number" min={1} max={pax} value={adultCount} onChange={(event) => updateTravelerCounts(Number(event.target.value), pax - Number(event.target.value))} />
                  <Input label="Children" type="number" min={0} max={pax - 1} value={childCount} onChange={(event) => updateTravelerCounts(pax - Number(event.target.value), Number(event.target.value))} />
                </div>
              </fieldset>
            ) : null}

            {lunchAddon ? (
              <fieldset className="mt-8">
                <legend className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Lunch plan</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className={cn("cursor-pointer border p-5 transition-colors hover:bg-frangipani", lunchIncluded ? "border-terrace bg-frangipani shadow-sun" : "border-charcoal/25")}>
                    <span className="flex items-start gap-3">
                      <input type="radio" name="lunch-plan" checked={lunchIncluded} onChange={() => chooseLunch(true)} className="mt-1 size-5 shrink-0 accent-terrace" />
                      <span>
                        <strong className="block">Lunch included</strong>
                        <span className="mt-1 block text-sm leading-6 text-weathered">{lunchAddon.description}</span>
                        <span className="mt-3 block font-semibold tabular-nums text-terrace">+ {idr.format(lunchAddon.priceIdr * pax)} <span className="text-xs font-normal text-weathered">({idr.format(lunchAddon.priceIdr)} each)</span></span>
                      </span>
                    </span>
                  </label>
                  <label className={cn("cursor-pointer border p-5 transition-colors hover:bg-frangipani", !lunchIncluded ? "border-terrace bg-frangipani shadow-sun" : "border-charcoal/25")}>
                    <span className="flex items-start gap-3">
                      <input type="radio" name="lunch-plan" checked={!lunchIncluded} onChange={() => chooseLunch(false)} className="mt-1 size-5 shrink-0 accent-terrace" />
                      <span>
                        <strong className="block">Choose where to eat</strong>
                        <span className="mt-1 block text-sm leading-6 text-weathered">Your driver can suggest suitable stops, but you choose the restaurant and pay for your own food and drinks directly.</span>
                        <span className="mt-3 block font-semibold text-terrace">No BaliXperience lunch charge</span>
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>
            ) : null}

            {otherAddons.length ? <div className="mt-8 divide-y divide-charcoal/20 border-y border-charcoal/25">
              {otherAddons.map((addon) => {
                const selected = selectedAddons.includes(addon.code);
                const lineTotal = addon.priceIdr * (addon.pricingMode === "PER_PERSON" ? pax : 1);
                return <label key={addon.code} className={cn("grid cursor-pointer grid-cols-[1.5rem_1fr_auto] gap-3 px-2 py-5 transition-colors hover:bg-frangipani sm:px-4", selected && "bg-frangipani")}>
                  <input type="checkbox" checked={selected} onChange={() => setSelectedAddons((current) => selected ? current.filter((code) => code !== addon.code) : [...current, addon.code])} className="mt-1 size-5 accent-terrace" />
                  <span><strong className="block">{addon.title}</strong><span className="mt-1 block text-sm leading-6 text-weathered">{addon.description}</span></span>
                  <span className="text-right"><strong className="block tabular-nums">{idr.format(lineTotal)}</strong><span className="text-xs text-weathered">{addon.pricingMode === "PER_PERSON" ? `${idr.format(addon.priceIdr)} each` : "per booking"}</span></span>
                </label>;
              })}
            </div> : null}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="ghost" size="lg" onClick={() => setStep(1)}><ArrowLeft className="size-4" aria-hidden="true" /> Traveler details</Button>
              <Button size="lg" onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{mode === "request" ? "Review request" : "Review payment"} <ArrowRight className="size-4" aria-hidden="true" /></Button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section aria-labelledby="payment-heading">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-clay">Step 3 of 3</p>
            <h1 id="payment-heading" className="mt-2 font-serif text-4xl sm:text-5xl">{mode === "request" ? "Review your request" : "Review and pay"}</h1>
            <div className="mt-7 border-l-4 border-gold bg-frangipani p-5 sm:p-6">
              {mode === "request" ? <div className="flex gap-3"><CalendarCheck2 className="mt-0.5 size-5 shrink-0 text-terrace" aria-hidden="true" /><div><h2 className="font-bold">No payment today</h2><p className="mt-1 text-sm leading-6 text-weathered">We’ll check the driver and included arrangements, then contact you on WhatsApp. Your request is not confirmed and does not hold capacity until we accept it.</p></div></div> : <div className="flex gap-3"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-terrace" aria-hidden="true" /><div><h2 className="font-bold">You’ll continue to Midtrans</h2><p className="mt-1 text-sm leading-6 text-weathered">Card, bank, or wallet details are entered only on Midtrans’s hosted checkout. BaliXperience never receives or stores raw card numbers.</p></div></div>}
            </div>
            <dl className="mt-8 divide-y divide-charcoal/20 border-y border-charcoal/25">
              <div className="flex justify-between gap-5 py-4"><dt className="text-weathered">Lead traveler</dt><dd className="text-right font-semibold">{traveler.name}<br /><span className="font-normal text-weathered">{traveler.email}</span></dd></div>
              <div className="flex justify-between gap-5 py-4"><dt className="text-weathered">Package price</dt><dd className="font-semibold tabular-nums">{idr.format(perPersonIdr * adultCount + (childPriceIdr ?? perPersonIdr) * childCount)}</dd></div>
              {lunchAddon ? <div className="flex justify-between gap-5 py-4"><dt className="text-weathered">Lunch</dt><dd className="text-right font-semibold">{lunchIncluded ? <>Included · <span className="tabular-nums">{idr.format(lunchAddon.priceIdr * pax)}</span></> : <>Choose your own · <span className="font-normal text-weathered">pay at restaurant</span></>}</dd></div> : null}
              <div className="flex justify-between gap-5 py-4"><dt className="text-weathered">Other extras</dt><dd className="font-semibold tabular-nums">{idr.format(addOnTotal - (lunchIncluded && lunchAddon ? lunchAddon.priceIdr * pax : 0))}</dd></div>
              {activeDiscount ? <div className="flex justify-between gap-5 py-4 text-success"><dt>Package discount · {activeDiscount.label}</dt><dd className="font-semibold tabular-nums">− {idr.format(discountAmountIdr)}</dd></div> : null}
            </dl>
            <div className="mt-6 border border-charcoal/25 bg-frangipani p-4">
              {automaticDiscount ? <p className="mb-4 border-l-4 border-terrace bg-terrace/8 px-3 py-2 text-sm leading-6"><strong>{automaticDiscount.name}: {automaticDiscount.percentOff}% off</strong><span className="block text-weathered">Already applied for this travel date—no code needed.</span></p> : null}
              <label htmlFor="discount-code" className="text-sm font-semibold">Discount code</label>
              <div className="mt-2 flex gap-2">
                <input id="discount-code" value={discountCode} onChange={(event) => { setDiscountCode(event.target.value.toUpperCase()); setPromoDiscount(null); }} maxLength={30} className="min-h-11 min-w-0 flex-1 rounded-field border border-charcoal/35 bg-limestone px-3.5 font-mono uppercase outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30" />
                <Button type="button" variant="outline" onClick={applyDiscount} loading={discountLoading}>Apply</Button>
              </div>
              {promoDiscount ? <p className="mt-2 text-xs font-semibold text-success">{activeDiscount?.label === promoDiscount.code ? `${promoDiscount.code} is applied to the package price.` : `${promoDiscount.code} is valid, but the seasonal offer gives you a better price.`}</p> : <p className="mt-2 text-xs text-weathered">Optional. Discounts apply to the package price, exclude optional extras, and do not stack.</p>}
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 border border-charcoal/25 bg-frangipani p-4 text-sm leading-6 text-weathered">
              <input type="checkbox" required checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-terrace" />
              <span>I have read and accept the <Link href="/terms" target="_blank" className="font-semibold text-terrace underline underline-offset-4">Booking Terms</Link> and acknowledge the <Link href="/privacy" target="_blank" className="font-semibold text-terrace underline underline-offset-4">Privacy Notice</Link>.</span>
            </label>
            {error ? <p role="alert" className="mt-5 border border-error/40 bg-error/8 p-4 text-sm font-semibold text-error">{error}</p> : null}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="ghost" size="lg" onClick={() => setStep(2)} disabled={loading}><ArrowLeft className="size-4" aria-hidden="true" /> Trip options</Button>
              <Button size="lg" onClick={submitBooking} loading={loading} disabled={!termsAccepted}>{mode === "request" ? "Send booking request" : "Pay securely in IDR"} <ArrowRight className="size-4" aria-hidden="true" /></Button>
            </div>
          </section>
        ) : null}
      </main>

      <aside className="h-fit border border-charcoal/25 bg-frangipani p-5 shadow-sun lg:sticky lg:top-6" aria-label="Booking summary">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Your booking</p>
        <h2 className="mt-2 font-serif text-2xl leading-tight">{tour.title}</h2>
        <p className="mt-2 text-sm text-weathered">{tour.location} · {tour.duration}</p>
        <dl className="mt-5 space-y-3 border-y border-charcoal/20 py-4 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-weathered">Date</dt><dd className="text-right font-semibold">{dateLabel}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-weathered">Travelers</dt><dd className="font-semibold">{pax}</dd></div>
          {childPriceIdr !== null ? <div className="flex justify-between gap-4"><dt className="text-weathered">Mix</dt><dd className="font-semibold">{adultCount} adult · {childCount} child</dd></div> : null}
          {lunchAddon ? <div className="flex justify-between gap-4"><dt className="text-weathered">Lunch</dt><dd className="text-right font-semibold">{lunchIncluded ? "Included" : "Choose & pay directly"}</dd></div> : null}
          <div className="flex justify-between gap-4"><dt className="text-weathered">Other extras</dt><dd className="font-semibold">{selectedExtraCount || "None"}</dd></div>
        </dl>
        <div className="mt-5 flex items-end justify-between gap-3"><span className="text-sm text-weathered">{mode === "request" ? "Quoted total" : "Total"}</span><strong className="font-serif text-3xl tabular-nums">{idr.format(totalIdr)}</strong></div>
        <p className="mt-1 text-right text-xs text-weathered">≈ {usd.format(totalIdr / idrPerUsdEstimate)} estimate</p>
        <p className="mt-5 flex gap-2 text-xs leading-5 text-weathered"><ShieldCheck className="size-4 shrink-0 text-terrace" aria-hidden="true" />{mode === "request" ? "No payment is taken when you submit. Any later payment arrangement will be stated clearly before you commit." : "The actual charge and settlement currency is IDR. Your bank determines any conversion rate or foreign transaction fee."}</p>
      </aside>
    </div>
  );
}
