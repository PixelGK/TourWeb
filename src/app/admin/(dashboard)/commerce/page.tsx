import { CalendarRange, Tag } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { BlackoutDelete, BlackoutForm, DiscountForm, DiscountToggle, SeasonalDiscountForm } from "@/components/admin/commerce-actions";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { getAdminCommerce, getAdminTours } from "@/lib/admin-data";

export default async function AdminCommercePage() {
  const [session, tours, commerce] = await Promise.all([requireAdminPageSession(), getAdminTours(), getAdminCommerce()]);
  const seasonalOffers = commerce.discounts.filter((discount) => discount.automatic);
  const promoCodes = commerce.discounts.filter((discount) => !discount.automatic);

  return <div className="space-y-12">
    <AdminPageHeader eyebrow="05 · Booking rules" title="Offers & closure dates" description="Set automatic travel-season offers, private promo codes, and dates when BaliXperience cannot operate." />

    <section className="space-y-5" aria-labelledby="seasonal-heading">
      <div className="grid gap-4 border-b-2 border-charcoal pb-5 md:grid-cols-[1fr_22rem] md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">No code needed</p><h2 id="seasonal-heading" className="mt-1 font-serif text-4xl">Seasonal offers</h2></div>
        <p className="text-sm leading-6 text-weathered">Use these to stimulate quieter travel periods. The best valid percentage applies to the package price; optional extras stay full price.</p>
      </div>
      <SeasonalDiscountForm tours={tours} preview={session.preview} />
      <div className="border border-charcoal/25 bg-frangipani">
        {seasonalOffers.map((discount) => <article key={discount.id} className="grid gap-4 border-b border-charcoal/15 p-5 last:border-b-0 lg:grid-cols-[2rem_minmax(12rem,1.1fr)_minmax(13rem,1fr)_minmax(11rem,0.8fr)_auto] lg:items-center">
          <CalendarRange className="size-5 text-clay" aria-hidden="true" />
          <div><strong className="block text-lg">{discount.name}</strong><span className="text-sm text-weathered">{discount.percentOff}% automatically deducted</span></div>
          <div className="border-l-2 border-gold pl-4"><span className="block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-weathered">Travel dates</span><span className="mt-1 block font-semibold tabular-nums">{discount.startsAt} → {discount.endsAt}</span></div>
          <div><span className="block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-weathered">Packages</span><span className="mt-1 block text-sm leading-5">{discount.appliesToAll ? "All packages" : discount.tourTitles.join(", ")}</span></div>
          <div className="flex items-center justify-between gap-3 lg:block lg:text-right"><AdminStatus status={discount.active ? "ACTIVE" : "PAUSED"} /><DiscountToggle id={discount.id} active={discount.active} preview={session.preview} /></div>
        </article>)}
        {seasonalOffers.length === 0 ? <div className="flex gap-3 p-5 text-sm text-weathered"><CalendarRange className="size-5 shrink-0 text-clay" aria-hidden="true" /><p>No seasonal offers yet. Create one above when you want a date-based promotion to appear automatically at checkout.</p></div> : null}
      </div>
    </section>

    <section className="space-y-5" aria-labelledby="codes-heading">
      <div className="grid gap-4 border-b-2 border-charcoal pb-5 md:grid-cols-[1fr_22rem] md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">Entered by the guest</p><h2 id="codes-heading" className="mt-1 font-serif text-4xl">Promo codes</h2></div>
        <p className="text-sm leading-6 text-weathered">Best for partners, repeat guests, and private campaigns. Codes apply to the package price and never stack; the better discount wins.</p>
      </div>
      <details className="group border border-charcoal/25 bg-frangipani">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 font-semibold [&::-webkit-details-marker]:hidden"><span className="inline-flex items-center gap-2"><Tag className="size-4 text-clay" aria-hidden="true" /> Create a promo code</span><span className="text-xl text-clay transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary>
        <div className="border-t border-charcoal/20"><DiscountForm tours={tours} preview={session.preview} /></div>
      </details>
      <div className="overflow-x-auto border border-charcoal/25 bg-frangipani"><table className="w-full min-w-[48rem] text-left text-sm"><thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Offer</th><th className="px-4 py-3">Applies to</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Control</th></tr></thead><tbody className="divide-y divide-charcoal/15">{promoCodes.map((discount) => <tr key={discount.id}><td className="px-4 py-4 font-mono font-bold">{discount.code}</td><td className="px-4 py-4">{discount.percentOff}% off<br /><span className="text-xs text-weathered">{discount.startsAt ?? "Now"} → {discount.endsAt ?? "No end"}</span></td><td className="max-w-64 px-4 py-4 text-xs leading-5 text-weathered">{discount.appliesToAll ? "All packages" : discount.tourTitles.join(", ")}</td><td className="px-4 py-4 tabular-nums">{discount.timesUsed} / {discount.usageLimit ?? "∞"}</td><td className="px-4 py-4"><AdminStatus status={discount.active ? "ACTIVE" : "PAUSED"} /></td><td className="px-4 py-4"><DiscountToggle id={discount.id} active={discount.active} preview={session.preview} /></td></tr>)}</tbody></table>{promoCodes.length === 0 ? <p className="p-5 text-sm text-weathered">No promo codes yet.</p> : null}</div>
    </section>

    <section className="space-y-5" aria-labelledby="closures-heading">
      <div className="border-b-2 border-charcoal pb-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">Global calendar protection</p><h2 id="closures-heading" className="font-serif text-3xl">Island-wide closure dates</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-weathered">Add the officially announced Nyepi date each year. It is rejected by checkout even if an individual package date was previously opened.</p></div>
      <BlackoutForm preview={session.preview} />
      <div className="divide-y divide-charcoal/15 border border-charcoal/25 bg-frangipani">{commerce.blackouts.map((blackout) => <div key={blackout.date} className="grid gap-3 p-4 sm:grid-cols-[10rem_1fr_auto] sm:items-center"><time className="font-semibold tabular-nums">{blackout.date}</time><p className="text-sm text-weathered">{blackout.reason}</p><BlackoutDelete date={blackout.date} preview={session.preview} /></div>)}{commerce.blackouts.length === 0 ? <p className="p-5 text-sm text-weathered">No global closure dates entered yet.</p> : null}</div>
    </section>
  </div>;
}
