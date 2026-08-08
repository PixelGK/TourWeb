import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { AvailabilityRangeForm, AvailabilityToggle } from "@/components/admin/availability-actions";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { getAdminAvailability, getAdminTours } from "@/lib/admin-data";

export default async function AdminAvailabilityPage({ searchParams }: { searchParams: Promise<{ tour?: string }> }) {
  const { tour = "ALL" } = await searchParams;
  const [session, tours, rows] = await Promise.all([requireAdminPageSession(), getAdminTours(), getAdminAvailability(tour)]);
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="03 · Capacity board" title="Availability" description="Open operating dates in batches, then close a date without erasing its reservation history." />
      <AvailabilityRangeForm tours={tours} preview={session.preview} />

      <section aria-labelledby="availability-ledger">
        <div className="mb-4 flex flex-col gap-3 border-b-2 border-charcoal pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">Next 180 operating dates</p><h2 id="availability-ledger" className="font-serif text-3xl">Date ledger</h2></div>
          <form className="flex items-center gap-2"><label htmlFor="tour-filter" className="text-sm font-semibold">Tour</label><select id="tour-filter" name="tour" defaultValue={tour} className="min-h-10 border border-charcoal/35 bg-frangipani px-3 text-sm"><option value="ALL">All tours</option>{tours.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><button type="submit" className="min-h-10 border border-charcoal px-3 text-sm font-semibold hover:bg-charcoal hover:text-frangipani">Filter</button></form>
        </div>
        <div className="overflow-x-auto border border-charcoal/25 bg-frangipani">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Tour</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Reservations</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Control</th></tr></thead>
            <tbody className="divide-y divide-charcoal/15">{rows.map((row) => <tr key={row.id} className={!row.isOpen ? "bg-charcoal/4 text-weathered" : undefined}><td className="px-4 py-4 font-semibold tabular-nums"><time dateTime={row.date}>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${row.date}T00:00:00Z`))}</time></td><td className="max-w-64 px-4 py-4"><span className="block truncate">{row.tourTitle}</span></td><td className="px-4 py-4"><strong className="tabular-nums">{row.spotsRemaining}</strong><span className="text-weathered"> / {row.capacity} spots</span></td><td className="px-4 py-4 tabular-nums">{row.activeBookings}</td><td className="px-4 py-4"><AdminStatus status={row.isOpen ? "OPEN" : "CLOSED"} /></td><td className="px-4 py-4"><AvailabilityToggle id={row.id} isOpen={row.isOpen} preview={session.preview} /></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
