import { Calculator, CircleAlert, PencilLine } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { getAdminMargins } from "@/lib/admin-data";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const compactIdr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", maximumFractionDigits: 1 });
const guestChoices = [1, 2, 3, 4, 5, 6];

function percent(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

function profitTone(value: number | null) {
  if (value === null) return "text-weathered";
  return value < 0 ? "text-error" : "text-success";
}

function requestedGuests(value: string | undefined) {
  const parsed = Number(value);
  return guestChoices.includes(parsed) ? parsed : 2;
}

export default async function AdminMarginsPage({ searchParams }: { searchParams: Promise<{ pax?: string }> }) {
  const params = await searchParams;
  const selectedPax = requestedGuests(params.pax);
  const data = await getAdminMargins(selectedPax);
  const baliMonth = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(new Date());

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="06 · Price ledger"
        title="Margins"
        description="Compare what the guest pays with the private operating costs recorded for the same group size. These are gross estimates, not accounting profit."
      />

      <section aria-labelledby="definition-heading" className="border border-charcoal/30 bg-frangipani">
        <div className="grid gap-5 border-b border-charcoal/20 bg-charcoal p-6 text-frangipani sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-gold">How to read this page</p>
            <h2 id="definition-heading" className="mt-2 font-serif text-3xl">One booking, explained line by line</h2>
          </div>
          <p className="text-sm leading-6 text-frangipani/70">An empty internal cost means <strong className="text-frangipani">unknown</strong>. Entering <strong className="text-frangipani">Rp0</strong> means you checked it and confirmed there is no cost.</p>
        </div>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Customer price", "What the guest is charged for the package at the selected group size."],
            ["Fixed internal cost", "A cost paid once per booking, such as the driver and vehicle."],
            ["Cost per guest", "Tickets, meals or supplier costs paid for each traveler."],
            ["Estimated total cost", "Fixed cost + guest costs + the default option supplier cost."],
            ["Estimated gross profit", "Customer price minus the estimated total cost."],
            ["Estimated margin", "Estimated gross profit as a percentage of the customer price."],
          ].map(([term, description]) => (
            <div key={term} className="border-b border-charcoal/15 p-5 last:border-b-0 sm:border-r sm:[&:nth-child(even)]:border-r-0 lg:[&:nth-child(even)]:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0">
              <dt className="font-semibold text-charcoal">{term}</dt>
              <dd className="mt-1 text-sm leading-6 text-weathered">{description}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-charcoal/15 px-5 py-4 text-xs leading-5 text-weathered"><strong className="text-charcoal">Private:</strong> internal costs and margin estimates are admin-only and are never sent to the public tour or checkout pages.</p>
      </section>

      <section aria-label="Confirmed booking margin snapshot" className="grid border border-charcoal/30 bg-frangipani sm:grid-cols-3">
        <div className="border-b border-charcoal/20 p-5 sm:border-b-0 sm:border-r"><span className="text-xs font-bold uppercase tracking-[0.1em] text-weathered">Confirmed sales</span><strong className="mt-4 block font-serif text-4xl tabular-nums">{compactIdr.format(data.summary.confirmedSalesIdr)}</strong><span className="mt-1 block text-xs text-weathered">Departures from {baliMonth}</span></div>
        <div className="border-b border-charcoal/20 p-5 sm:border-b-0 sm:border-r"><span className="text-xs font-bold uppercase tracking-[0.1em] text-weathered">Estimated gross profit</span><strong className={`mt-4 block font-serif text-4xl tabular-nums ${profitTone(data.summary.estimatedGrossProfitIdr)}`}>{compactIdr.format(data.summary.estimatedGrossProfitIdr)}</strong><span className="mt-1 block text-xs text-weathered">{percent(data.summary.estimatedGrossMarginPercent)} on cost-complete bookings</span></div>
        <div className="p-5"><span className="text-xs font-bold uppercase tracking-[0.1em] text-weathered">Cost coverage</span><strong className="mt-4 block font-serif text-4xl tabular-nums">{data.summary.completeBookingCount}/{data.summary.confirmedBookingCount}</strong><span className="mt-1 block text-xs text-weathered">confirmed bookings have complete costs</span></div>
      </section>

      <section aria-labelledby="package-margin-heading">
        <div className="mb-5 grid gap-5 border-b-2 border-charcoal pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">Before a guest books</p>
            <h2 id="package-margin-heading" className="mt-1 font-serif text-4xl">Package margin check</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-weathered">Optional add-ons and pickup charges are not assumed here. They are included in the confirmed-booking estimate only when the guest selects them.</p>
          </div>
          <form action="/admin/margins" method="get" className="flex flex-wrap items-end gap-3 border border-charcoal/25 bg-frangipani p-3">
            <label className="grid gap-1 text-sm font-semibold" htmlFor="margin-pax">Guest count<select id="margin-pax" name="pax" defaultValue={String(selectedPax)} className="min-h-11 min-w-36 border border-charcoal/35 bg-white px-3 text-base outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30">{guestChoices.map((pax) => <option key={pax} value={pax}>{pax} {pax === 1 ? "guest" : "guests"}</option>)}</select></label>
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 border border-gold bg-gold px-4 text-sm font-semibold text-charcoal hover:bg-gold-dark focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus"><Calculator className="size-4" aria-hidden="true" /> Recalculate</button>
          </form>
        </div>
        <div className="overflow-x-auto border border-charcoal/25 bg-frangipani">
          <table className="w-full min-w-[74rem] text-left text-sm">
            <thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Package</th><th className="px-4 py-3">Customer price</th><th className="px-4 py-3">Internal cost formula</th><th className="px-4 py-3">Est. gross profit</th><th className="px-4 py-3">Margin</th><th className="px-4 py-3">Cost setup</th><th className="px-4 py-3 text-right">Edit</th></tr></thead>
            <tbody className="divide-y divide-charcoal/15">
              {data.tours.map((tour) => {
                const missing = tour.exampleCostIdr === null || tour.addonsMissingCost > 0;
                return <tr key={tour.id} className="align-top">
                  <td className="px-4 py-4"><strong className="block max-w-64">{tour.title}</strong><span className="mt-1 block text-xs text-weathered">{tour.pricingMode === "PER_VEHICLE" ? "Per vehicle" : "Per person"} · {tour.published ? "Published" : "Draft"}<br />Calculated for {tour.examplePax} {tour.examplePax === 1 ? "guest" : "guests"}</span></td>
                  <td className="px-4 py-4 tabular-nums"><span className="block text-xs text-weathered">{tour.pricingMode === "PER_VEHICLE" ? "Package price" : `${idr.format(tour.customerUnitPriceIdr)} × ${tour.examplePax} guests`}</span><span className="block">{idr.format(tour.packageRevenueIdr)}</span>{tour.variantTitle ? <span className="mt-1 block text-xs text-weathered">+ {tour.variantTitle}: {idr.format(tour.variantPriceAdjustmentIdr)}</span> : null}<strong className="mt-2 block border-t border-charcoal/15 pt-2">{idr.format(tour.exampleRevenueIdr)}</strong></td>
                  <td className="px-4 py-4 tabular-nums"><span className="flex justify-between gap-5"><span className="text-weathered">Fixed</span><span>{tour.baseCostIdr === null ? "Unknown" : idr.format(tour.baseCostIdr)}</span></span><span className="mt-1 flex justify-between gap-5"><span className="text-weathered">Per guest × {tour.examplePax}</span><span>{tour.perPaxCostIdr === null ? (tour.pricingMode === "PER_VEHICLE" || tour.variantTitle ? "Not used" : "Unknown") : idr.format(tour.perPaxCostIdr * tour.examplePax)}</span></span>{tour.variantTitle ? <span className="mt-1 flex justify-between gap-5"><span className="text-weathered">Option supplier</span><span>{idr.format(tour.variantSupplierCostIdr)}</span></span> : null}<strong className="mt-2 flex justify-between gap-5 border-t border-charcoal/15 pt-2"><span>Total cost</span><span>{tour.exampleCostIdr === null ? "Unknown" : idr.format(tour.exampleCostIdr)}</span></strong></td>
                  <td className={`px-4 py-4 font-semibold tabular-nums ${profitTone(tour.estimatedGrossProfitIdr)}`}><span className="block text-xs font-normal text-weathered">Customer price − total cost</span><span className="mt-2 block">{tour.estimatedGrossProfitIdr === null ? "Unknown" : idr.format(tour.estimatedGrossProfitIdr)}</span></td>
                  <td className={`px-4 py-4 font-semibold tabular-nums ${profitTone(tour.estimatedGrossProfitIdr)}`}>{percent(tour.estimatedGrossMarginPercent)}</td>
                  <td className="px-4 py-4">{missing ? <span className="inline-flex max-w-48 items-start gap-2 text-xs leading-5 text-clay"><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{tour.baseCostIdr === null ? "Fixed cost is unknown" : tour.pricingMode === "PER_PERSON" && tour.perPaxCostIdr === null && !tour.variantTitle ? "Cost per guest is unknown" : `${tour.addonsMissingCost} of ${tour.addonCount} active add-on costs are unknown`}</span> : <span className="text-xs font-semibold text-success">Costs entered</span>}</td>
                  <td className="px-4 py-4 text-right"><Link href={`/admin/tours/${tour.id}`} className="inline-flex min-h-11 items-center gap-2 border border-charcoal/30 px-3 font-semibold hover:bg-charcoal hover:text-frangipani"><PencilLine className="size-4" aria-hidden="true" /> Edit</Link></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="booking-margin-heading">
        <div className="mb-5 border-b-2 border-charcoal pb-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">After confirmation</p><h2 id="booking-margin-heading" className="mt-1 font-serif text-4xl">Confirmed booking estimates</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-weathered">Includes confirmed manual requests and verified paid bookings from the start of this month onward. Requested, cancelled, and refunded bookings are excluded.</p></div>
        <div className="overflow-x-auto border border-charcoal/25 bg-frangipani">
          <table className="w-full min-w-[56rem] text-left text-sm"><thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Package / departure</th><th className="px-4 py-3">Confirmed sale</th><th className="px-4 py-3">Recorded cost</th><th className="px-4 py-3">Est. gross profit</th><th className="px-4 py-3">Margin</th></tr></thead><tbody className="divide-y divide-charcoal/15">{data.bookings.map((booking) => <tr key={booking.id}><td className="px-4 py-4"><strong className="block">{booking.reference}</strong><AdminStatus status={booking.status} /></td><td className="px-4 py-4"><span className="block max-w-72">{booking.tourTitle}</span><time className="text-xs text-weathered" dateTime={booking.date}>{booking.date}</time></td><td className="px-4 py-4 font-semibold tabular-nums">{idr.format(booking.revenueIdr)}</td><td className="px-4 py-4 tabular-nums">{booking.estimatedCostIdr === null ? "Cost incomplete" : idr.format(booking.estimatedCostIdr)}</td><td className={`px-4 py-4 font-semibold tabular-nums ${profitTone(booking.estimatedGrossProfitIdr)}`}>{booking.estimatedGrossProfitIdr === null ? "—" : idr.format(booking.estimatedGrossProfitIdr)}</td><td className={`px-4 py-4 font-semibold tabular-nums ${profitTone(booking.estimatedGrossProfitIdr)}`}>{percent(booking.estimatedGrossMarginPercent)}</td></tr>)}</tbody></table>
          {data.bookings.length === 0 ? <p className="p-8 text-center text-sm leading-6 text-weathered">No confirmed departures fall in this period yet. Package margin checks above are still available for pricing decisions.</p> : null}
        </div>
      </section>
    </div>
  );
}

