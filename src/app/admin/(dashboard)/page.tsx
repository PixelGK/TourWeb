import { ArrowRight, CalendarClock, CircleDollarSign, ClipboardCheck, Clock3, ReceiptText } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { getAdminOverview } from "@/lib/admin-data";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", maximumFractionDigits: 1 });
const metrics = [
  { key: "bookingsToday", label: "Bookings today", icon: ReceiptText, format: (value: number) => String(value) },
  { key: "pendingPayments", label: "Open requests", icon: Clock3, format: (value: number) => String(value) },
  { key: "departuresNextSevenDays", label: "Open dates · 7 days", icon: CalendarClock, format: (value: number) => String(value) },
  { key: "paidRevenueThisMonthIdr", label: "Paid this month", icon: CircleDollarSign, format: idr.format },
] as const;

export default async function AdminDashboardPage() {
  const data = await getAdminOverview();
  return (
    <div className="space-y-10">
      <AdminPageHeader eyebrow="01 · Dispatch" title="Today at a glance" description="A compact operating view: new requests, confirmed guests, and the dates that need attention." action={<Link href="/admin/runbook" className="inline-flex min-h-11 items-center gap-2 border-b border-charcoal/40 text-sm font-semibold text-terrace hover:border-gold"><ClipboardCheck className="size-4" aria-hidden="true" /> Open operator playbook</Link>} />
      <section aria-label="Business snapshot" className="grid border border-charcoal/30 bg-frangipani sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => { const Icon = metric.icon; return <div key={metric.key} className="border-b border-charcoal/20 p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2)]:border-r-0 xl:border-b-0 xl:[&:nth-child(2)]:border-r xl:last:border-r-0"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.1em] text-weathered">{metric.label}</span><Icon className="size-4 text-clay" aria-hidden="true" /></div><strong className="mt-5 block font-serif text-4xl tabular-nums">{metric.format(data.metrics[metric.key])}</strong></div>; })}
      </section>

      <div className="grid gap-10 xl:grid-cols-[1.35fr_0.85fr]">
        <section aria-labelledby="recent-bookings">
          <div className="mb-4 flex items-end justify-between border-b border-charcoal pb-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">Guest ledger</p><h2 id="recent-bookings" className="font-serif text-3xl">Recent bookings</h2></div><Link href="/admin/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-terrace">All bookings <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
          <div className="overflow-x-auto border border-charcoal/25 bg-frangipani"><table className="w-full min-w-[42rem] text-left text-sm"><thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Guest</th><th className="px-4 py-3">Tour / date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-charcoal/15">{data.recentBookings.map((booking) => <tr key={booking.id}><td className="px-4 py-4"><strong className="block">{booking.customerName}</strong><span className="text-xs text-weathered">{booking.reference}</span></td><td className="px-4 py-4"><span className="block max-w-52 truncate">{booking.tourTitle}</span><time className="text-xs text-weathered">{booking.date}</time></td><td className="px-4 py-4"><AdminStatus status={booking.status} /></td><td className="px-4 py-4 text-right font-semibold tabular-nums">{new Intl.NumberFormat("id-ID").format(booking.totalAmountIdr)}</td></tr>)}</tbody></table></div>
        </section>

        <section aria-labelledby="upcoming-dates">
          <div className="mb-4 flex items-end justify-between border-b border-charcoal pb-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">Next movement</p><h2 id="upcoming-dates" className="font-serif text-3xl">Upcoming dates</h2></div><Link href="/admin/availability" className="text-sm font-semibold text-terrace">Calendar →</Link></div>
          <ol className="border-y border-charcoal/25 bg-frangipani">{data.upcoming.map((row, index) => <li key={row.id} className="grid grid-cols-[2.5rem_1fr_auto] gap-3 border-b border-charcoal/15 p-4 last:border-b-0"><span className="font-serif text-2xl text-gold-dark">{String(index + 1).padStart(2, "0")}</span><div><strong className="block leading-5">{row.tourTitle}</strong><time className="text-xs text-weathered">{row.date}</time></div><div className="text-right"><strong className="block tabular-nums">{row.spotsRemaining}/{row.capacity}</strong><span className="text-[0.65rem] uppercase tracking-wide text-weathered">spots</span></div></li>)}</ol>
        </section>
      </div>
    </div>
  );
}
