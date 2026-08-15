import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { BookingActions } from "@/components/admin/booking-actions";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { getAdminBookings, getAdminTours } from "@/lib/admin-data";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string; tour?: string; q?: string }> }) {
  const filters = await searchParams;
  const [session, tours, bookings] = await Promise.all([
    requireAdminPageSession(),
    getAdminTours(),
    getAdminBookings({ status: filters.status, tourId: filters.tour, query: filters.q }),
  ]);
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="04 · Guest ledger" title="Bookings" description="Review new requests, confirm available packages, or cancel a booking and restore reserved capacity." />
      <form className="grid gap-3 border border-charcoal/30 bg-frangipani p-4 sm:grid-cols-[1fr_0.7fr_0.9fr_auto] sm:items-end">
        <label className="text-sm font-semibold">Guest or reference<input name="q" defaultValue={filters.q} placeholder="BX-… or guest name" className="mt-2 min-h-11 w-full border border-charcoal/35 bg-limestone px-3 font-normal outline-none focus:border-terrace" /></label>
        <label className="text-sm font-semibold">Status<select name="status" defaultValue={filters.status ?? "ALL"} className="mt-2 min-h-11 w-full border border-charcoal/35 bg-limestone px-3 font-normal"><option value="ALL">All statuses</option>{["REQUESTED", "CONFIRMED", "PENDING", "PAID", "CANCELLED", "REFUNDED"].map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="text-sm font-semibold">Tour<select name="tour" defaultValue={filters.tour ?? "ALL"} className="mt-2 min-h-11 w-full border border-charcoal/35 bg-limestone px-3 font-normal"><option value="ALL">All tours</option>{tours.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}</option>)}</select></label>
        <button type="submit" className="min-h-11 border border-terrace bg-terrace px-5 text-sm font-semibold text-frangipani hover:bg-terrace-light">Apply filters</button>
      </form>

      <div className="overflow-x-auto border border-charcoal/25 bg-frangipani">
        <table className="w-full min-w-[68rem] text-left text-sm">
          <thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Guest</th><th className="px-4 py-3">Tour / departure</th><th className="px-4 py-3">Party</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Quoted total</th><th className="px-4 py-3 text-right">Safe actions</th></tr></thead>
          <tbody className="divide-y divide-charcoal/15">{bookings.map((booking) => <tr key={booking.id}><td className="px-4 py-4"><strong className="block">{booking.customerName}</strong><span className="block text-xs text-weathered">{booking.reference}</span><a href={`mailto:${booking.customerEmail}`} className="block max-w-52 truncate text-xs text-terrace hover:underline">{booking.customerEmail}</a></td><td className="px-4 py-4"><span className="block max-w-64 truncate">{booking.tourTitle}</span><time className="text-xs text-weathered" dateTime={booking.date}>{booking.date}</time></td><td className="px-4 py-4 tabular-nums">{booking.paxCount} pax</td><td className="space-y-1 px-4 py-4"><AdminStatus status={booking.confirmed ? "CONFIRMED" : booking.status} /><span className="block text-[0.65rem] uppercase tracking-wide text-weathered">Provider: {booking.paymentStatus.replaceAll("_", " ")}</span></td><td className="px-4 py-4 font-semibold tabular-nums">{idr.format(booking.totalAmountIdr)}</td><td className="px-4 py-4"><BookingActions id={booking.id} status={booking.status} confirmed={booking.confirmed} preview={session.preview} /></td></tr>)}</tbody>
        </table>
        {bookings.length === 0 ? <p className="p-8 text-center text-sm text-weathered">No bookings match those filters.</p> : null}
      </div>
      <p className="border-l-4 border-gold pl-4 text-sm leading-6 text-weathered"><strong className="text-charcoal">Request mode:</strong> confirming a request reserves capacity but does not mark it paid. When online payment is enabled later, payment state will still change only through a verified provider notification.</p>
    </div>
  );
}
