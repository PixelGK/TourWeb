"use client";

import { ArrowLeft, ArrowRight, CalendarCheck2, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PricingTier, PublicTourVariant, TourPricingMode } from "@/types/public-tour";
import type { MockAddon } from "@/data/mock-addons";
import { cn } from "@/lib/utils";
import { calculatePackageTotal, calculateVariantPriceAdjustment } from "@/lib/tour-pricing";

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
  pricingMode: TourPricingMode;
  addons: MockAddon[];
  variants: PublicTourVariant[];
  initialVariantCode: string;
  childPriceIdr: number | null;
  childAgeLabel: string | null;
  automaticDiscount: { name: string; percentOff: number } | null;
  mode: "request" | "payment";
}

export function CheckoutFlow({ tour, date, pax, pricingTiers, pricingMode, addons, variants, initialVariantCode, childPriceIdr, childAgeLabel, automaticDiscount, mode }: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [traveler, setTraveler] = useState<TravelerState>({ name: "", email: "", phone: "", country: "", hotelName: "", notes: "" });
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [variantCode, setVariantCode] = useState(initialVariantCode);
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
  const pickupAddons = addons.filter((addon) => addon.code.startsWith("pickup-"));
  const selectedPickup = pickupAddons.find((addon) => selectedAddons.includes(addon.code));
  const otherAddons = addons.filter((addon) => addon.code !== "local-lunch" && !addon.code.startsWith("pickup-"));
  const lunchIncluded = lunchAddon ? selectedAddons.includes(lunchAddon.code) : false;
  const selectedExtraCount = selectedAddons.filter((code) => code !== lunchAddon?.code && !code.startsWith("pickup-")).length;
  const addOnTotal = addons.filter((addon) => selectedAddons.includes(addon.code)).reduce((sum, addon) => sum + addon.priceIdr * (addon.pricingMode === "PER_PERSON" ? pax : 1), 0);
  const selectedVariant = variants.find((variant) => variant.code === variantCode);
  const basePackageTotalIdr = calculatePackageTotal({ pricingMode, pricingTiers, pax, adultCount, childCount, childPriceIdr }) + calculateVariantPriceAdjustment(selectedVariant, pax);
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

  function choosePickup(code: string | null) {
    setSelectedAddons((current) => [
      ...current.filter((item) => !item.startsWith("pickup-")),
      ...(code ? [code] : []),
    ]);
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
        body: JSON.stringify({
          tourSlug: tour.slug,
          date,
          pax,
          adultCount,
          childCount,
          discountCode: promoDiscount?.code ?? "",
          variantCode,
          addonCodes: selectedAddons,
          termsAccepted,
          traveler: {
            ...traveler,
            notes: [selectedPickup ? `Pickup area: ${selectedPickup.title.replace("Pickup from ", "")}` : pickupAddons.length ? "Pickup area: Ubud" : "", traveler.notes].filter(Boolean).join("\n"),
          },
        }),
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
              <Input label="Bali hotel or villa" autoComplete="organization" hint="Optionalâ€”you can confirm this later on WhatsApp." value={traveler.hotelName} onChange={(event) => updateTraveler("hotelName", event.target.value)} containerClassName="sm:col-span-2" />
              <label className="space-y-2 sm:col-span-2">
                <span className="block text-sm font-semibold">Notes for the operator <span className="font-normal text-weathered">(optional)</span></span>
                <textarea value={traveler.notes} onChange={(event) => updateTraveler("notes", event.target.value)} maxLength={800} rows={4} className="w-full rounded-field border border-charcoal/35 bg-frangipani px-3.5 py-3 text-base outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30" placeholder="Mobility needs, dietary requests, pickup questionsâ€¦" />
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

            {variants.length ? (
              <fieldset className="mt-8">
                <legend className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Ride option</legend>
                <p className="mt-2 text-sm leading-6 text-weathered">Choose the ATV setup for your group. Shared options place two travelers on each ATV; an odd guest rides solo.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {variants.map((variant) => {
                    const unavailable = variant.guestsPerUnit > pax;
                    return <label key={variant.code} className={cn("border p-5 transition-colors", unavailable ? "cursor-not-allowed border-charcoal/15 opacity-55" : "cursor-pointer hover:bg-frangipani", variantCode === variant.code && !unavailable ? "border-terrace bg-frangipani shadow-sun" : "border-charcoal/25") }>
                      <span className="flex items-start gap-3"><input type="radio" name="ride-option" value={variant.code} checked={variantCode === variant.code} disabled={unavailable} onChange={() => setVariantCode(variant.code)} className="mt-1 size-5 shrink-0 accent-terrace" /><span><strong className="block">{variant.title}</strong><span className="mt-1 block text-sm leading-6 text-weathered">{variant.description}</span><span className="mt-3 block font-semibold tabular-nums text-terrace">{variant.priceAdjustmentIdr === 0 ? "Included in shown price" : `${variant.priceAdjustmentIdr > 0 ? "+" : "âˆÛ›h‘éì¶»§q«^wİ\OÜÜ[ÜÜ[ÜÜ[‚ˆÛX™[ÂˆJ_BˆÙ]‚ˆÙšY[Ù]‚ˆ
Hˆ[B‚ˆÜXÚİ\YÛœË›[™İÈ
ˆšY[Ù]Û\ÜÓ˜[YOH›]N‚ˆYÙ[™Û\ÜÓ˜[YOH^^È›ÛX›Û\\˜Ø\ÙH˜XÚÚ[™ËVÌŒM[WH^XÛ^H”XÚİ\\™XOÛYÙ[™‚ˆÛ\ÜÓ˜[YOH›]Lˆ^\ÛHXY[™ËMˆ^]ÙX]\™Y•XYXÚİ\\È[˜ÛYYˆHÛ™Ù\ˆXÚİ\\™X\ÈØ\œHÛ™Hš^Yİ\˜Ú\™ÙH›ÜˆH™ZXÛK›İ\ˆİY\İÜ‚ˆ]ˆÛ\ÜÓ˜[YOH›]LÈÜšYØ\LÈÛN™ÜšYXÛÛËLˆ‚ˆX™[Û\ÜÓ˜[YO^ØÛŠ˜İ\œÛÜ‹\Ú[\ˆ›Ü™\ˆM˜[œÚ][Û‹XÛÛÜœÈİ™\˜™ËYœ˜[™Ú\[šH‹\Ù[XİYXÚİ\È˜›Ü™\‹]\œ˜XÙH™ËYœ˜[™Ú\[šHÚYİË\İ[ˆˆˆ˜›Ü™\‹XÚ\˜ÛØ[ÌHŠ_O‚ˆ[œ]\OHœ˜Y[Èˆ˜[YOHœXÚİ\X\™XHˆÚXÚÙY^È\Ù[XİYXÚİ\HÛÚ[™ÙO^Ê
HOˆÚÛÜÙTXÚİ\
[
_HÛ\ÜÓ˜[YOH›\‹LÈÚ^™KMXØÙ[]\œ˜XÙHˆÏ‚ˆİ›Û™Ï•XYÜİ›Û™ÏÜ[ˆÛ\ÜÓ˜[YOH›[Lˆ^\ÛH^]ÙX]\™Y’[˜ÛYYÜÜ[‚ˆÛX™[‚ˆÜXÚİ\YÛœË›X\

YÛŠHOˆ
ˆX™[Ù^O^ØYÛ‹˜ÛÙ_HÛ\ÜÓ˜[YO^ØÛŠ˜İ\œÛÜ‹\Ú[\ˆ›Ü™\ˆM˜[œÚ][Û‹XÛÛÜœÈİ™\˜™ËYœ˜[™Ú\[šH‹Ù[XİYXÚİ\Ë˜ÛÙHOOHYÛ‹˜ÛÙHÈ˜›Ü™\‹]\œ˜XÙH™ËYœ˜[™Ú\[šHÚYİË\İ[ˆˆˆ˜›Ü™\‹XÚ\˜ÛØ[ÌHŠ_O‚ˆ[œ]\OHœ˜Y[Èˆ˜[YOHœXÚİ\X\™XHˆÚXÚÙY^ÜÙ[XİYXÚİ\Ë˜ÛÙHOOHYÛ‹˜ÛÙ_HÛÚ[™ÙO^Ê
HOˆÚÛÜÙTXÚİ\
YÛ‹˜ÛÙJ_HÛ\ÜÓ˜[YOH›\‹LÈÚ^™KMXØÙ[]\œ˜XÙHˆÏ‚ˆİ›Û™ÏØYÛ‹]Kœ™\XÙJ”XÚİ\œ›ÛH‹ˆŠ_OÜİ›Û™ÏÜ[ˆÛ\ÜÓ˜[YOH›[Lˆ^\ÛHX[\‹[[\È^]ÙX]\™YŠÈÚY‹™›Ü›X]
YÛ‹œšXÙRYŠ_OÜÜ[‚ˆÛX™[‚ˆ
J_BˆÙ]‚ˆÙšY[Ù]‚ˆ
Hˆ[B‚ˆÛ[˜ÚYÛˆÈ
ˆšY[Ù]Û\ÜÓ˜[YOH›]N‚ˆYÙ[™Û\ÜÓ˜[YOH^^È›ÛX›Û\\˜Ø\ÙH˜XÚÚ[™ËVÌŒM[WH^XÛ^H“[˜Ú[ÛYÙ[™‚ˆ]ˆÛ\ÜÓ˜[YOH›]LÈÜšYØ\LÈÛN™ÜšYXÛÛËLˆ‚ˆX™[Û\ÜÓ˜[YO^ØÛŠ˜İ\œÛÜ‹\Ú[\ˆ›Ü™\ˆMH˜[œÚ][Û‹XÛÛÜœÈİ™\˜™ËYœ˜[™Ú\[šH‹[˜Ú[˜ÛYYÈ˜›Ü™\‹]\œ˜XÙH™ËYœ˜[™Ú\[šHÚYİË\İ[ˆˆˆ˜›Ü™\‹XÚ\˜ÛØ[ÌHŠ_O‚ˆÜ[ˆÛ\ÜÓ˜[YOH™›^][\Ë\İ\Ø\LÈ‚ˆ[œ]\OHœ˜Y[Èˆ˜[YOH›[˜Ú\[ˆˆÚXÚÙY^Û[˜Ú[˜ÛYYHÛÚ[™ÙO^Ê
HOˆÚÛÜÙS[˜Ú
YJ_HÛ\ÜÓ˜[YOH›]LHÚ^™KMHÚš[šËLXØÙ[]\œ˜XÙHˆÏ‚ˆÜ[‚ˆİ›Û™ÈÛ\ÜÓ˜[YOH˜›ØÚÈ“[˜Ú[˜ÛYYÜİ›Û™Ï‚ˆÜ[ˆÛ\ÜÓ˜[YOH›]LH›ØÚÈ^\ÛHXY[™ËMˆ^]ÙX]\™YÛ[˜ÚYÛ‹™\ØÜš\[ÛŸOÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH›]LÈ›ØÚÈ›Û\Ù[ZX›ÛX[\‹[[\È^]\œ˜XÙHŠÈÚY‹™›Ü›X]
[˜ÚYÛ‹œšXÙRYˆ
ˆ^
_HÜ[ˆÛ\ÜÓ˜[YOH^^È›Û[›Ü›X[^]ÙX]\™YŠÚY‹™›Ü›X]
[˜ÚYÛ‹œšXÙRYŠ_HXXÚ
OÜÜ[ÜÜ[‚ˆÜÜ[‚ˆÜÜ[‚ˆÛX™[‚ˆX™[Û\ÜÓ˜[YO^ØÛŠ˜İ\œÛÜ‹\Ú[\ˆ›Ü™\ˆMH˜[œÚ][Û‹XÛÛÜœÈİ™\˜™ËYœ˜[™Ú\[šH‹[[˜Ú[˜ÛYYÈ˜›Ü™\‹]\œ˜XÙH™ËYœ˜[™Ú\[šHÚYİË\İ[ˆˆˆ˜›Ü™\‹XÚ\˜ÛØ[ÌHŠ_O‚ˆÜ[ˆÛ\ÜÓ˜[YOH™›^][\Ë\İ\Ø\LÈ‚ˆ[œ]\OHœ˜Y[Èˆ˜[YOH›[˜Ú\[ˆˆÚXÚÙY^È[[˜Ú[˜ÛYYHÛÚ[™ÙO^Ê
HOˆÚÛÜÙS[˜Ú
˜[ÙJ_HÛ\ÜÓ˜[YOH›]LHÚ^™KMHÚš[šËLXØÙ[]\œ˜XÙHˆÏ‚ˆÜ[‚ˆİ›Û™ÈÛ\ÜÓ˜[YOH˜›ØÚÈÚÛÜÙHÚ\™HÈX]Üİ›Û™Ï‚ˆÜ[ˆÛ\ÜÓ˜[YOH›]LH›ØÚÈ^\ÛHXY[™ËMˆ^]ÙX]\™Y–[İ\ˆš]™\ˆØ[ˆİYÙÙ\İİZ]X›HİÜË][İHÚÛÜÙHH™\İ]\˜[[™^H›Üˆ[İ\ˆİÛˆ›ÛÙ[™š[šÜÈ\™XİKÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH›]LÈ›ØÚÈ›Û\Ù[ZX›Û^]\œ˜XÙH“›È˜[V\šY[˜ÙH[˜ÚÚ\™ÙOÜÜ[‚ˆÜÜ[‚ˆÜÜ[‚ˆÛX™[‚ˆÙ]‚ˆÙšY[Ù]‚ˆ
Hˆ[B‚ˆÛİ\YÛœË›[™İÈ]ˆÛ\ÜÓ˜[YOH›]N]šYK^H]šYKXÚ\˜ÛØ[ÌŒ›Ü™\‹^H›Ü™\‹XÚ\˜ÛØ[ÌH‚ˆÛİ\YÛœË›X\

YÛŠHOˆÂˆÛÛœİÙ[XİYHÙ[XİYYÛœËš[˜ÛY\ÊYÛ‹˜ÛÙJNÂˆÛÛœİ[™Uİ[HYÛ‹œšXÙRYˆ
ˆ
YÛ‹œšXÚ[™Ó[ÙHOOH”T—ÔT”ÓÓˆˆÈ^ˆJNÂˆ™]\›ˆX™[Ù^O^ØYÛ‹˜ÛÙ_HÛ\ÜÓ˜[YO^ØÛŠ™ÜšYİ\œÛÜ‹\Ú[\ˆÜšYXÛÛËVÌK\™[WÌYœ—Ø]]×HØ\LÈLˆKMH˜[œÚ][Û‹XÛÛÜœÈİ™\˜™ËYœ˜[™Ú\[šHÛNœM‹Ù[XİY	‰ˆ˜™ËYœ˜[™Ú\[šHŠ_O‚ˆ[œ]\OH˜ÚXÚØ›ŞˆÚXÚÙY^ÜÙ[XİYHÛÚ[™ÙO^Ê
HOˆÙ]Ù[XİYYÛœÊ
İ\œ™[
HOˆÙ[XİYÈİ\œ™[™š[\Š
ÛÙJHOˆÛÙHOOHYÛ‹˜ÛÙJHˆË‹‹˜İ\œ™[YÛ‹˜ÛÙWJ_HÛ\ÜÓ˜[YOH›]LHÚ^™KMHXØÙ[]\œ˜XÙHˆÏ‚ˆÜ[İ›Û™ÈÛ\ÜÓ˜[YOH˜›ØÚÈØYÛ‹]_OÜİ›Û™ÏÜ[ˆÛ\ÜÓ˜[YOH›]LH›ØÚÈ^\ÛHXY[™ËMˆ^]ÙX]\™YØYÛ‹™\ØÜš\[ÛŸOÜÜ[ÜÜ[‚ˆÜ[ˆÛ\ÜÓ˜[YOH^\šYÚİ›Û™ÈÛ\ÜÓ˜[YOH˜›ØÚÈX[\‹[[\ÈÚY‹™›Ü›X]
[™Uİ[
_OÜİ›Û™ÏÜ[ˆÛ\ÜÓ˜[YOH^^È^]ÙX]\™YØYÛ‹œšXÚ[™Ó[ÙHOOH”T—ÔT”ÓÓˆˆÈ	ÚY‹™›Ü›X]
YÛ‹œšXÙRYŠ_HXXÚˆœ\ˆ›ÛÚÚ[™ÈŸOÜÜ[ÜÜ[‚ˆÛX™[ÂˆJ_BˆÙ]ˆˆ[Bˆ]ˆÛ\ÜÓ˜[YOH›]N›^›^XÛÛ\™]™\œÙHØ\LÈÛN™›^\›İÈÛNš\İYKX™]ÙY[ˆ‚ˆ]Ûˆ˜\šX[H™ÚÜİˆÚ^™OH›ÈˆÛÛXÚÏ^Ê
HOˆÙ]İ\
J_O\œ›İÓYÛ\ÜÓ˜[YOHœÚ^™KMˆ\šXKZY[HYHˆÏˆ˜]™[\ˆ]Z[ÏĞ]Û‚ˆ]ÛˆÚ^™OH›ÈˆÛÛXÚÏ^Ê
HOˆÈÙ]İ\
ÊNÈÚ[™İËœØÜ›ÛÊÈÜˆ™Z]š[ÜˆœÛ[ÛİˆJNÈ_OÛ[ÙHOOHœ™\]Y\İˆÈ”™]šY]È™\]Y\İˆˆ”™]šY]È^[Y[ŸH\œ›İÔšYÚÛ\ÜÓ˜[YOHœÚ^™KMˆ\šXKZY[HYHˆÏĞ]Û‚ˆÙ]‚ˆÜÙXİ[Û‚ˆ
Hˆ[B‚ˆÜİ\OOHÈÈ
ˆÙXİ[Ûˆ\šXK[X™[YOHœ^[Y[ZXY[™È‚ˆÛ\ÜÓ˜[YOH^^È›ÛX›Û\\˜Ø\ÙH˜XÚÚ[™ËVÌŒMY[WH^XÛ^H”İ\ÈÙˆÏÜ‚ˆHYHœ^[Y[ZXY[™ÈˆÛ\ÜÓ˜[YOH›]Lˆ›Û\Ù\šYˆ^MÛN^M^Û[ÙHOOHœ™\]Y\İˆÈ”™]šY]È[İ\ˆ™\]Y\İˆˆ”™]šY]È[™^HŸOÚO‚ˆ]ˆÛ\ÜÓ˜[YOH›]MÈ›Ü™\‹[M›Ü™\‹YÛÛ™ËYœ˜[™Ú\[šHMHÛNœMˆ‚ˆÛ[ÙHOOHœ™\]Y\İˆÈ]ˆÛ\ÜÓ˜[YOH™›^Ø\LÈØ[[™\ÚXÚÌˆÛ\ÜÓ˜[YOH›]LHÚ^™KMHÚš[šËL^]\œ˜XÙHˆ\šXKZY[HYHˆÏ]ˆÛ\ÜÓ˜[YOH™›ÛX›Û“›È^[Y[Ù^OÚÛ\ÜÓ˜[YOH›]LH^\ÛHXY[™ËMˆ^]ÙX]\™Y•Ùx &[ÚXÚÈHš]™\ˆ[™[˜ÛYY\œ˜[™Ù[Y[Ë[ˆÛÛXİ[İHÛˆÚ]Ğ\ˆ[İ\ˆ™\]Y\İ\È›İÛÛ™š\›YY[™Ù\È›İÛØ\XÚ]H[[ÙHXØÙ\]ÜÙ]Ù]ˆˆ]ˆÛ\ÜÓ˜[YOH™›^Ø\LÈØÚÒÙ^ZÛHÛ\ÜÓ˜[YOH›]LHÚ^™KMHÚš[šËL^]\œ˜XÙHˆ\šXKZY[HYHˆÏ]ˆÛ\ÜÓ˜[YOH™›ÛX›Û–[İx &[ÛÛ[YHÈZY˜[œÏÚÛ\ÜÓ˜[YOH›]LH^\ÛHXY[™ËMˆ^]ÙX]\™YØ\™˜[šËÜˆØ[]]Z[È\™H[\™YÛ›HÛˆZY˜[œø &\ÈÜİYÚXÚÛİ]ˆ˜[V\šY[˜ÙH™]™\ˆ™XÙZ]™\ÈÜˆİÜ™\È˜]ÈØ\™[X™\œËÜÙ]Ù]ŸBˆÙ]‚ˆÛ\ÜÓ˜[YOH›]N]šYK^H]šYKXÚ\˜ÛØ[ÌŒ›Ü™\‹^H›Ü™\‹XÚ\˜ÛØ[ÌH‚ˆ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MHKMÛ\ÜÓ˜[YOH^]ÙX]\™Y“XY˜]™[\ÙÛ\ÜÓ˜[YOH^\šYÚ›Û\Ù[ZX›Ûİ˜]™[\‹›˜[Y_OœˆÏÜ[ˆÛ\ÜÓ˜[YOH™›Û[›Ü›X[^]ÙX]\™Yİ˜]™[\‹™[XZ[OÜÜ[ÙÙ]‚ˆ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MHKMÛ\ÜÓ˜[YOH^]ÙX]\™YÜšXÚ[™Ó[ÙHOOH”T—Õ‘RPÓHˆÈ™ZXÛH›Üˆ	Ü^HİY\İØˆ”XÚØYÙHšXÙHŸOÙÛ\ÜÓ˜[YOH™›Û\Ù[ZX›ÛX[\‹[[\ÈÚY‹™›Ü›X]
˜\ÙTXÚØYÙUİ[YŠ_OÙÙ]‚ˆÜÙ[XİY˜\šX[È]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MHKMÛ\ÜÓ˜[YOH^]ÙX]\™Y”šYHÜ[ÛÙÛ\ÜÓ˜[YOH^\šYÚ›Û\Ù[ZX›ÛÜÙ[XİY˜\šX[]_OÙÙ]ˆˆ[BˆÜXÚİ\YÛœË›[™İÈ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MHKMÛ\ÜÓ˜[YOH^]ÙX]\™Y”XÚİ\\™XOÙÛ\ÜÓ˜[YOH^\šYÚ›Û\Ù[ZX›ÛÜÙ[XİYXÚİ\ÈÜÙ[XİYXÚİ\]Kœ™\XÙJ”XÚİ\œ›ÛH‹ˆŠ_H0­ÈÜ[ˆÛ\ÜÓ˜[YOHX[\‹[[\ÈŠÈÚY‹™›Ü›X]
Ù[XİYXÚİ\œšXÙRYŠ_OÜÜ[Ïˆˆ•XY0­È[˜ÛYYŸOÙÙ]ˆˆ[BˆÛ[˜ÚYÛˆÈ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MHKMÛ\ÜÓ˜[YOH^]ÙX]\™Y“[˜ÚÙÛ\ÜÓ˜[YOH^\šYÚ›Û\Ù[ZX›ÛÛ[˜Ú[˜ÛYYÈ’[˜ÛYY0­ÈÜ[ˆÛ\ÜÓ˜[YOHX[\‹[[\ÈÚY‹™›Ü›X]
[˜ÚYÛ‹œšXÙRYˆ
ˆ^
_OÜÜ[ÏˆˆÚÛÜÙH[İ\ˆİÛˆ0­ÈÜ[ˆÛ\ÜÓ˜[YOH™›Û[›Ü›X[^]ÙX]\™Yœ^H]™\İ]\˜[ÜÜ[ÏŸOÙÙ]ˆˆ[Bˆ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MHKMÛ\ÜÓ˜[YOH^]ÙX]\™Y“İ\ˆ^˜\ÏÙÛ\ÜÓ˜[YOH™›Û\Ù[ZX›ÛX[\‹[[\ÈÚY‹™›Ü›X]
YÛ•İ[H
[˜Ú[˜ÛYY	‰ˆ[˜ÚYÛˆÈ[˜ÚYÛ‹œšXÙRYˆ
ˆ^ˆ
J_OÙÙ]‚ˆØXİ]™Q\ØÛİ[È]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MHKM^\İXØÙ\ÜÈ”XÚØYÙH\ØÛİ[0­ÈØXİ]™Q\ØÛİ[›X™[OÙÛ\ÜÓ˜[YOH™›Û\Ù[ZX›ÛX[\‹[[\È¸¢$ˆÚY‹™›Ü›X]
\ØÛİ[[[İ[YŠ_OÙÙ]ˆˆ[BˆÙ‚ˆ]ˆÛ\ÜÓ˜[YOH›]Mˆ›Ü™\ˆ›Ü™\‹XÚ\˜ÛØ[ÌH™ËYœ˜[™Ú\[šHM‚ˆØ]]ÛX]XÑ\ØÛİ[ÈÛ\ÜÓ˜[YOH›X‹M›Ü™\‹[M›Ü™\‹]\œ˜XÙH™Ë]\œ˜XÙKÎLÈKLˆ^\ÛHXY[™ËMˆİ›Û™ÏØ]]ÛX]XÑ\ØÛİ[›˜[Y_NˆØ]]ÛX]XÑ\ØÛİ[œ\˜Ù[Ù™ŸIHÙ™Üİ›Û™ÏÜ[ˆÛ\ÜÓ˜[YOH˜›ØÚÈ^]ÙX]\™Y[™XYH\YY›Üˆ\È˜]™[]x %›ÈÛÙH™YYYÜÜ[Üˆˆ[BˆX™[[›ÜH™\ØÛİ[XÛÙHˆÛ\ÜÓ˜[YOH^\ÛH›Û\Ù[ZX›Û‘\ØÛİ[ÛÙOÛX™[‚ˆ]ˆÛ\ÜÓ˜[YOH›]Lˆ›^Ø\Lˆ‚ˆ[œ]YH™\ØÛİ[XÛÙHˆ˜[YO^Ù\ØÛİ[ÛÙ_HÛÚ[™ÙO^Ê]™[
HOˆÈÙ]\ØÛİ[ÛÙJ]™[\™Ù]˜[YKÕ\\Ø\ÙJ
JNÈÙ]›Û[Ñ\ØÛİ[
[
NÈ_HX^[™İ^ÌÌHÛ\ÜÓ˜[YOH›Z[‹ZLLHZ[‹]ËL›^LH›İ[™YYšY[›Ü™\ˆ›Ü™\‹XÚ\˜ÛØ[ÌÍH™Ë[[Y\İÛ™HLËH›Û[[Û›È\\˜Ø\ÙHİ][™K[›Û™H›Øİ\Î˜›Ü™\‹]\œ˜XÙH›Øİ\Îœš[™ËLÈ›Øİ\Îœš[™ËYÛÛÌÌˆÏ‚ˆ]Ûˆ\OH˜]Ûˆˆ˜\šX[H›İ][™HˆÛÛXÚÏ^Ø\Q\ØÛİ[HØY[™Ï^Ù\ØÛİ[ØY[™ßO\OĞ]Û‚ˆÙ]‚ˆÜ›Û[Ñ\ØÛİ[ÈÛ\ÜÓ˜[YOH›]Lˆ^^È›Û\Ù[ZX›Û^\İXØÙ\ÜÈØXİ]™Q\ØÛİ[Ë›X™[OOH›Û[Ñ\ØÛİ[˜ÛÙHÈ	Ü›Û[Ñ\ØÛİ[˜ÛÙ_H\È\YYÈHXÚØYÙHšXÙK˜ˆ	Ü›Û[Ñ\ØÛİ[˜ÛÙ_H\È˜[Y]HÙX\ÛÛ˜[Ù™™\ˆÚ]™\È[İHH™]\ˆšXÙK˜OÜˆˆÛ\ÜÓ˜[YOH›]Lˆ^^È^]ÙX]\™Y“Ü[Û˜[ˆ\ØÛİ[È\HÈHXÚØYÙHšXÙK^ÛYHÜ[Û˜[^˜\Ë[™È›İİXÚËÜŸBˆÙ]‚ˆX™[Û\ÜÓ˜[YOH›]Mˆ›^İ\œÛÜ‹\Ú[\ˆ][\Ë\İ\Ø\LÈ›Ü™\ˆ›Ü™\‹XÚ\˜ÛØ[ÌH™ËYœ˜[™Ú\[šHM^\ÛHXY[™ËMˆ^]ÙX]\™Y‚ˆ[œ]\OH˜ÚXÚØ›Şˆ™\]Z\™YÚXÚÙY^İ\›\ĞXØÙ\YHÛÚ[™ÙO^Ê]™[
HOˆÙ]\›\ĞXØÙ\Y
]™[\™Ù]˜ÚXÚÙY
_HÛ\ÜÓ˜[YOH›]LHÚ^™KMHÚš[šËLXØÙ[]\œ˜XÙHˆÏ‚ˆÜ[’H]™H™XY[™XØÙ\H[šÈ™YH‹İ\›\Èˆ\™Ù]H—Ø›[šÈˆÛ\ÜÓ˜[YOH™›Û\Ù[ZX›Û^]\œ˜XÙH[™\›[™H[™\›[™K[Ù™œÙ]M›ÛÚÚ[™È\›\ÏÓ[šÏˆ[™XÚÛ›İÛYÙHH[šÈ™YH‹Üš]˜XŞHˆ\™Ù]H—Ø›[šÈˆÛ\ÜÓ˜[YOH™›Û\Ù[ZX›Û^]\œ˜XÙH[™\›[™H[™\›[™K[Ù™œÙ]M”š]˜XŞH›İXÙOÓ[šÏ‹ÜÜ[‚ˆÛX™[‚ˆÙ\œ›ÜˆÈ›ÛOH˜[\ˆÛ\ÜÓ˜[YOH›]MH›Ü™\ˆ›Ü™\‹Y\œ›Ü‹Í™ËY\œ›Ü‹ÎM^\ÛH›Û\Ù[ZX›Û^Y\œ›ÜˆÙ\œ›ÜŸOÜˆˆ[Bˆ]ˆÛ\ÜÓ˜[YOH›]N›^›^XÛÛ\™]™\œÙHØ\LÈÛN™›^\›İÈÛNš\İYKX™]ÙY[ˆ‚ˆ]Ûˆ˜\šX[H™ÚÜİˆÚ^™OH›ÈˆÛÛXÚÏ^Ê
HOˆÙ]İ\
Š_H\ØX›Y^ÛØY[™ßO\œ›İÓYÛ\ÜÓ˜[YOHœÚ^™KMˆ\šXKZY[HYHˆÏˆš\Ü[ÛœÏĞ]Û‚ˆ]ÛˆÚ^™OH›ÈˆÛÛXÚÏ^ÜİX›Z]›ÛÚÚ[™ßHØY[™Ï^ÛØY[™ßH\ØX›Y^È]\›\ĞXØÙ\YOÛ[ÙHOOHœ™\]Y\İˆÈ”Ù[™›ÛÚÚ[™È™\]Y\İˆˆ”^HÙXİ\™[H[ˆQˆŸH\œ›İÔšYÚÛ\ÜÓ˜[YOHœÚ^™KMˆ\šXKZY[HYHˆÏĞ]Û‚ˆÙ]‚ˆÜÙXİ[Û‚ˆ
Hˆ[BˆÛXZ[‚‚ˆ\ÚYHÛ\ÜÓ˜[YOHšYš]›Ü™\ˆ›Ü™\‹XÚ\˜ÛØ[ÌH™ËYœ˜[™Ú\[šHMHÚYİË\İ[ˆÎœİXÚŞHÎÜMˆˆ\šXK[X™[H›ÛÚÚ[™Èİ[[X\H‚ˆÛ\ÜÓ˜[YOH^^È›ÛX›Û\\˜Ø\ÙH˜XÚÚ[™ËVÌŒM[WH^XÛ^H–[İ\ˆ›ÛÚÚ[™ÏÜ‚ˆˆÛ\ÜÓ˜[YOH›]Lˆ›Û\Ù\šYˆ^LXY[™Ë]YÚİİ\‹]_OÚ‚ˆÛ\ÜÓ˜[YOH›]Lˆ^\ÛH^]ÙX]\™Yİİ\‹›ØØ][ÛŸH0­Èİİ\‹™\˜][ÛŸOÜ‚ˆÛ\ÜÓ˜[YOH›]MHÜXÙK^KLÈ›Ü™\‹^H›Ü™\‹XÚ\˜ÛØ[ÌŒKM^\ÛH‚ˆ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MÛ\ÜÓ˜[YOH^]ÙX]\™Y‘]OÙÛ\ÜÓ˜[YOH^\šYÚ›Û\Ù[ZX›ÛÙ]SX™[OÙÙ]‚ˆ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MÛ\ÜÓ˜[YOH^]ÙX]\™Y•˜]™[\œÏÙÛ\ÜÓ˜[YOH™›Û\Ù[ZX›ÛÜ^OÙÙ]‚ˆÜÙ[XİY˜\šX[È]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MÛ\ÜÓ˜[YOH^]ÙX]\™Y”šYHÜ[ÛÙÛ\ÜÓ˜[YOH^\šYÚ›Û\Ù[ZX›ÛÜÙ[XİY˜\šX[]_OÙÙ]ˆˆ[BˆØÚ[šXÙRYˆOOH[È]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MÛ\ÜÓ˜[YOH^]ÙX]\™Y“Z^ÙÛ\ÜÓ˜[YOH™›Û\Ù[ZX›ÛØY[Ûİ[HY[0­ÈØÚ[Ûİ[HÚ[ÙÙ]ˆˆ[BˆÛ[˜ÚYÛˆÈ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MÛ\ÜÓ˜[YOH^]ÙX]\™Y“[˜ÚÙÛ\ÜÓ˜[YOH^\šYÚ›Û\Ù[ZX›ÛÛ[˜Ú[˜ÛYYÈ’[˜ÛYYˆˆÚÛÜÙH	ˆ^H\™XİHŸOÙÙ]ˆˆ[BˆÜXÚİ\YÛœË›[™İÈ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MÛ\ÜÓ˜[YOH^]ÙX]\™Y”XÚİ\ÙÛ\ÜÓ˜[YOH^\šYÚ›Û\Ù[ZX›ÛÜÙ[XİYXÚİ\ÈÙ[XİYXÚİ\]Kœ™\XÙJ”XÚİ\œ›ÛH‹ˆŠHˆ•XYŸOÙÙ]ˆˆ[Bˆ]ˆÛ\ÜÓ˜[YOH™›^\İYKX™]ÙY[ˆØ\MÛ\ÜÓ˜[YOH^]ÙX]\™Y“İ\ˆ^˜\ÏÙÛ\ÜÓ˜[YOH™›Û\Ù[ZX›ÛÜÙ[XİY^˜PÛİ[“›Û™HŸOÙÙ]‚ˆÙ‚ˆ]ˆÛ\ÜÓ˜[YOH›]MH›^][\ËY[™\İYKX™]ÙY[ˆØ\LÈÜ[ˆÛ\ÜÓ˜[YOH^\ÛH^]ÙX]\™YÛ[ÙHOOHœ™\]Y\İˆÈ”][İYİ[ˆˆ•İ[ŸOÜÜ[İ›Û™ÈÛ\ÜÓ˜[YOH™›Û\Ù\šYˆ^LŞX[\‹[[\ÈÚY‹™›Ü›X]
İ[YŠ_OÜİ›Û™ÏÙ]‚ˆØXİ]™Q\ØÛİ[ÈÛ\ÜÓ˜[YOH›]Lˆ›Ü™\‹[LÈ›Ü™\‹YÛÛLÈ^^È›ÛX›ÛXY[™ËMH^]\œ˜XÙHØXİ]™Q\ØÛİ[›X™[H0­ÈØXİ]™Q\ØÛİ[œ\˜Ù[Ù™ŸIHÙ™ˆ\È[˜ÛYYÜˆˆ[BˆÛ\ÜÓ˜[YOH›]LH^\šYÚ^^È^]ÙX]\™Y¸¢bİ\Ù™›Ü›X]
İ[YˆÈY”\•\Ù\İ[X]J_H\İ[X]OÜ‚ˆÛ\ÜÓ˜[YOH›]MH›^Ø\Lˆ^^ÈXY[™ËMH^]ÙX]\™YÚY[ÚXÚÈÛ\ÜÓ˜[YOHœÚ^™KMÚš[šËL^]\œ˜XÙHˆ\šXKZY[HYHˆÏÛ[ÙHOOHœ™\]Y\İˆÈ“›È^[Y[\ÈZÙ[ˆÚ[ˆ[İHİX›Z]ˆ[H]\ˆ^[Y[\œ˜[™Ù[Y[Ú[™Hİ]YÛX\›H™Y›Ü™H[İHÛÛ[Z]ˆˆˆ•HXİX[Ú\™ÙH[™Ù][Y[İ\œ™[˜ŞH\ÈQ‹ˆ[İ\ˆ˜[šÈ]\›Z[™\È[HÛÛ™\œÚ[Ûˆ˜]HÜˆ›Ü™ZYÛˆ˜[œØXİ[Ûˆ™YKˆŸOÜ‚ˆØ\ÚYO‚ˆÙ]‚ˆ
NÂŸB