import { CircleAlert, PencilLine } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { getAdminMargins } from "@/lib/admin-data";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const compactIdr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", maximumFractionDigits: 1 });

function percent(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

function profitTone(value: number | null) {
  if (value === null) return "text-weathered";
  return value < 0 ? "text-error" : "text-success";
}

export default async function AdminMarginsPage() {
  const data = await getAdminMargins();
  const baliMonth = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(new Date());

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="06 · Price ledger"
        title="Margins"
        description="See what remains after the package and selected add-on costs currently recorded in BaliXperience. This is an operating estimate, not an accounting profit statement."
      />

      <section aria-labelledby="definition-heading" className="grid border border-charcoal/30 bg-charcoal text-frangipani lg:grid-cols-[1.15fr_1fr]">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-gold">The number used here</p>
          <h2 id="definition-heading" className="mt-2 font-serif text-3xl">Estimated gross profit</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-frangipani/70">Confirmed sale price minus the recorded package cost and selected add-on costs. Discounts are already reflected in the sale price.</p>
        </div>
        <div className="border-t border-frangipani/15 p-6 text-sm leading-6 text-frangipani/65 lg:border-l lg:border-t-0 sm:p-8">
          <strong className="text-frangipani">Not included:</strong> tax, payment fees, salaries, marketing, office costs, vehicle depreciation, refunds, or expenses entered outside this website.
        </div>
      </section>

      <section aria-label="Confirmed booking margin snapshot" className="grid border border-charcoal/30 bg-frangipani sm:grid-cols-3">
        <div className="border-b border-charcoal/20 p-5 sm:border-b-0 sm:border-r">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-weathered">Confirmed sales</span>
          <strong className="mt-4 block font-serif text-4xl tabular-nums">{compactIdr.format(data.summary.confirmedSalesIdr)}</strong>
          <span className="mt-1 block text-xs text-weathered">Departures from {baliMonth}</span>
        </div>
        <div className="border-b border-charcoal/20 p-5 sm:border-b-0 sm:border-r">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-weathered">Estimated gross profit</span>
          <strong className={`mt-4 block font-serif text-4xl tabular-nums ${profitTone(data.summary.estimatedGrossProfitIdr)}`}>{compactIdr.format(data.summary.estimatedGrossProfitIdr)}</strong>
          <span className="mt-1 block text-xs text-weathered">{percent(data.summary.estimatedGrossMarginPercent)} on cost-complete bookings</span>
        </div>
        <div className="p-5">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-weathered">Cost coverage</span>
          <strong className="mt-4 block font-serif text-4xl tabular-nums">{data.summary.completeBookingCount}/{data.summary.confirmedBookingCount}</strong>
          <span className="mt-1 block text-xs text-weathered">confirmed bookings have complete costs</span>
        </div>
      </section>

      <section aria-labelledby="package-margin-heading">
        <div className="mb-5 grid gap-4 border-b-2 border-charcoal pb-5 lg:grid-cols-[1fr_24rem] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">Before a guest books</p>
            <h2 id="package-margin-heading" className="mt-1 font-serif text-4xl">Package margin check</h2>
          </div>
          <p className="text-sm leading-6 text-weathered">For comparison, every package is shown using two guests. Vehicle-priced packages remain one vehicle price.</p>
        </div>
        <div className="overflow-x-auto border border-charcoal/25 bg-frangipani">
          <table className="w-full min-w-[68rem] text-left text-sm">
            <thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Package</th><th className="px-4 py-3">Example sale</th><th className="px-4 py-3">Fixed cost</th><th className="px-4 py-3">Per traveler</th><th className="px-4 py-3">Example cost</th><th className="px-4 py-3">Est. gross profit</th><th className="px-4 py-3">Margin</th><th className="px-4 py-3">Cost setup</th><th className="px-4 py-3 text-right">Edit</th></tr></thead>
            <tbody className="divide-y divide-charcoal/15">
              {data.tours.map((tour) => {
                const missing = tour.exampleCostIdr === null || tour.addonsMissingCost > 0;
                return <tr key={tour.id}>
                  <td className="px-4 py-4"><strong className="block max-w-72">{tour.title}</strong><span className="mt-1 block text-xs text-weathered">{tour.pricingMode === "PER_VEHICLE" ? "Per vehicle" : "Per person"} · {tour.published ? "Published" : "Draft"}</span></td>
                  <td className="px-4 py-4 font-semibold tabular-nums">{idr.format(tour.exampleRevenueIdr)}<span className="block text-xs font-normal text-weathered">for {tour.examplePax} guests</span></td>
                  <td className="px-4 py-4 tabular-nums">{tour.baseCostIdr === null ? "—" : idr.format(tour.baseCostIdr)}</td>
                  <td className="px-4 py-4 tabular-nums">{tour.perPaxCostIdr === null ? "—" : idr.format(tour.perPaxCostIdr)}</td>
                  <td className="px-4 py-4 tabular-nums">{tour.exampleCostIdr === null ? "—" : idr.format(tour.exampleCostIdr)}</td>
                  <td className={`px-4 py-4 font-semibold tabular-nums ${profitTone(tour.estimatedGrossProfitIdr)}`}>{tour.estimatedGrossProfitIdr === null ? "—" : idr.format(tour.estimatedGrossProfitIdr)}</td>
                  <td className={`px-4 py-4 font-semibold tabular-nums ${profitTone(tour.estimatedGrossProfitIdr)}`}>{percent(tour.estimatedGrossMarginPercent)}</td>
                  <td className="px-4 py-4">{missing ? <span className="inline-flex max-w-48 items-start gap-2 text-xs leading-5 text-clay"><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{tour.baseCostIdr === null ? "Fixed cost missing" : tour.pricingMode === "PER_PERSON" && tour.perPaxCostIdr === null ? "Supplier cost per traveler missing" : `${tour.addonsMissingCost} of ${tour.addonCount} add-on costs missing`}</span> : <span className="text-xs font-semibold text-success">Costs entered</span>}</td>
                  <td className="px-4 py-4 text-right"><Link href={`/admin/tours/${tour.id}`} className="inline-flex min-h-10 items-center gap-2 border border-charcoal/30 px-3 font-semibold hover:bg-charcoal hover:text-frangipani"><PencilLine className="size-4" aria-hidden="true" /> Edit</Link></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="booking-margin-heading">
        <div className="mb-5 border-b-2 border-charcoal pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">After confirmation</p>
          <h2 id="booking-margin-heading" className="mt-1 font-serif text-4xl">Confirmed booking estimates</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-weathered">Includes confirmed manual requests and verified paid bookings from the start of this month onward. Requested, cancelled, and refunded bookings are excluded.</p>
        </div>
        <div className="overflow-x-auto border border-charcoal/25 bg-frangipani">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Package / departure</th><th className="px-4 py-3">Confirmed sale</th><th className="px-4 py-3">Recorded cost</th><th className="px-4 py-3">Est. gross profit</th><th className="px-4 py-3">Margin</th></tr></thead>
            <tbody className="divide-y divide-charcoal/15">{data.bookings.map((booking) => <tr key={booking.id}><td className="px-4 py-4"><strong className="block">{booking.reference}</strong><AdminStatus status={booking.status} /></td><td className="px-4 py-4"><span className="block max-w-72">{booking.tourTitle}</span><time className="text-xs text-weathered" dateTime={booking.date}>{booking.date}</time></td><td className="px-4 py-4 font-semibold tabular-nums">{idr.format(booking.revenueIdr)}</td><td className="px-4 py-4 tabular-nums">{booking.estimatedCostIdr === null ? "Cost incomplete" : idr.format(booking.estimatedCostIdr)}</td><td className={`px-4 py-4 font-semibold tabular-nums ${profitTone(booking.estimatedGrossProfitIdr)}`}>{booking.estimatedGrossProfitIdr === null ? "—" : idr.format(booking.estimatedGrossProfitIdr)}</td><td className={`px-4 py-4 font-semibold tabular-nums ${profitTone(booking.estimatedGrossProfitIdr)}`}>{percent(booking.estimatedGrossMarginPercent)}</td></tr>)}</tbody>
          </table>
          {data.bookings.length === 0 ? <p className="p-8 text-center text-sm leading-6 text-weathered">No confirmed departures fall in this period yet. Package margin checks above are still available for pricing decisions.</p> : null}
        </div>
      </section>
    </div>
  );
}
