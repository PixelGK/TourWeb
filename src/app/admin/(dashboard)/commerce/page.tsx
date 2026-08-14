import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { BlackoutDelete, BlackoutForm, DiscountForm, DiscountToggle } from "@/components/admin/commerce-actions";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { getAdminCommerce, getAdminTours } from "@/lib/admin-data";

export default async function AdminCommercePage() {
  const [session, tours, commerce] = await Promise.all([requireAdminPageSession(), getAdminTours(), getAdminCommerce()]);
  return <div className="space-y-10">
    <AdminPageHeader eyebrow="05 · Booking rules" title="Discounts & closure dates" description="Control percentage offers and island-wide dates that must never accept a booking." />

    <section className="space-y-5" aria-labelledby="discounts-heading">
      <div className="border-b-2 border-charcoal pb-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">One code per booking</p><h2 id="discounts-heading" className="font-serif text-3xl">Percentage discounts</h2></div>
      <DiscountForm tours={tours} preview={session.preview} />
      <div className="overflow-x-auto border border-charcoal/25 bg-frangipani"><table className="w-full min-w-[48rem] text-left text-sm"><thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Offer</th><th className="px-4 py-3">Applies to</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Control</th></tr></thead><tbody className="divide-y divide-charcoal/15">{commerce.discounts.map((discount) => <tr key={discount.id}><td className="px-4 py-4 font-mono font-bold">{discount.code}</td><td className="px-4 py-4">{discount.percentOff}% off<br /><span className="text-xs text-weathered">{discount.startsAt ?? "Now"} → {discount.endsAt ?? "No end"}</span></td><td className="max-w-64 px-4 py-4 text-xs leading-5 text-weathered">{discount.appliesToAll ? "All packages" : discount.tourTitles.join(", ")}</td><td className="px-4 py-4 tabular-nums">{discount.timesUsed} / {discount.usageLimit ?? "∞"}</td><td className="px-4 py-4"><AdminStatus status={discount.active ? "ACTIVE" : "PAUSED"} /></td><td className="px-4 py-4"><DiscountToggle id={discount.id} active={discount.active} preview={session.preview} /></td></tr>)}</tbody></table>{commerce.discounts.length === 0 ? <p className="p-5 text-sm text-weathered">No discount codes yet.</p> : null}</div>
    </section>

    <section className="space-y-5" aria-labelledby="closures-heading">
      <div className="border-b-2 border-charcoal pb-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">Global calendar protection</p><h2 id="closures-heading" className="font-serif text-3xl">Island-wide closure dates</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-weathered">Add the officially announced Nyepi date each year. It is rejected by checkout even if an individual package date was previously opened.</p></div>
      <BlackoutForm preview={session.preview} />
      <div className="divide-y divide-charcoal/15 border border-charcoal/25 bg-frangipani">{commerce.blackouts.map((blackout) => <div key={blackout.date} className="grid gap-3 p-4 sm:grid-cols-[10rem_1fr_auto] sm:items-center"><time className="font-semibold tabular-nums">{blackout.date}</time><p className="text-sm text-weathered">{blackout.reason}</p><BlackoutDelete date={blackout.date} preview={session.preview} /></div>)}{commerce.blackouts.length === 0 ? <p className="p-5 text-sm text-weathered">No global closure dates entered yet.</p> : null}</div>
    </section>
  </div>;
}
