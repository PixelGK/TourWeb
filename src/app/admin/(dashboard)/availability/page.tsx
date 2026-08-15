import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { AvailabilityRangeForm, AvailabilityToggle } from "@/components/admin/availability-actions";
import { AvailabilityWorkspace } from "@/components/admin/availability-workspace";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { getAdminAvailability, getAdminTours } from "@/lib/admin-data";

function currentBaliMonth() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Makassar", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function validMonth(value: string | undefined) {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return currentBaliMonth();
  return value;
}

function shiftMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
}

export default async function AdminAvailabilityPage({ searchParams }: { searchParams: Promise<{ tour?: string; month?: string }> }) {
  const params = await searchParams;
  const month = validMonth(params.month);
  const [session, tours] = await Promise.all([requireAdminPageSession(), getAdminTours()]);
  const selectedTour = tours.find((tour) => tour.id === params.tour) ?? tours[0];

  if (!selectedTour) {
    return (
      <div className="space-y-8">
        <AdminPageHeader eyebrow="03 · Capacity board" title="Availability" description="Publish a tour before opening its operating dates." />
        <p className="border border-charcoal/25 bg-frangipani p-6">No tours are available yet. Create a tour first, then return to Calendar.</p>
      </div>
    );
  }

  const rows = await getAdminAvailability(selectedTour.id, month);
  const openDates = rows.filter((row) => row.isOpen).length;
  const closedDates = rows.length - openDates;
  const reservations = rows.reduce((total, row) => total + row.activeBookings, 0);
  const previousMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  const calendarHref = (targetMonth: string) => `/admin/availability?tour=${encodeURIComponent(selectedTour.id)}&month=${targetMonth}`;

  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="03 · Capacity board" title="Availability" description="Choose one tour, open its operating dates, and review one month at a time." />
      <AvailabilityWorkspace tours={tours} selectedTour={selectedTour} month={month} />
      <AvailabilityRangeForm tour={selectedTour} preview={session.preview} />

      <section aria-labelledby="availability-ledger">
        <div className="border-b-2 border-charcoal pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-clay">{monthLabel(month)}</p>
              <h2 id="availability-ledger" className="font-serif text-3xl">Date ledger</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={calendarHref(previousMonth)} aria-label={`Show ${monthLabel(previousMonth)}`} className="inline-flex min-h-10 items-center border border-charcoal/35 px-3 text-sm font-semibold hover:bg-charcoal hover:text-frangipani"><ChevronLeft className="mr-1 size-4" aria-hidden="true" />Previous</Link>
              <form className="flex items-center gap-2">
                <input type="hidden" name="tour" value={selectedTour.id} />
                <label htmlFor="availability-month" className="sr-only">Month</label>
                <input id="availability-month" name="month" type="month" defaultValue={month} className="min-h-10 border border-charcoal/35 bg-frangipani px-3 text-sm" />
                <button type="submit" className="min-h-10 border border-charcoal bg-charcoal px-3 text-sm font-semibold text-frangipani hover:bg-terrace">Go</button>
              </form>
              <Link href={calendarHref(nextMonth)} aria-label={`Show ${monthLabel(nextMonth)}`} className="inline-flex min-h-10 items-center border border-charcoal/35 px-3 text-sm font-semibold hover:bg-charcoal hover:text-frangipani">Next<ChevronRight className="ml-1 size-4" aria-hidden="true" /></Link>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-3 divide-x divide-charcoal/20 border-y border-charcoal/20 py-3 text-center sm:max-w-lg sm:text-left">
            <div className="px-3 first:pl-0"><dt className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-weathered">Open</dt><dd className="mt-1 font-serif text-2xl text-terrace">{openDates}</dd></div>
            <div className="px-3"><dt className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-weathered">Closed</dt><dd className="mt-1 font-serif text-2xl">{closedDates}</dd></div>
            <div className="px-3"><dt className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-weathered">Reservations</dt><dd className="mt-1 font-serif text-2xl text-clay">{reservations}</dd></div>
          </dl>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto border border-charcoal/25 bg-frangipani">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-charcoal text-xs uppercase tracking-[0.08em] text-frangipani"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Reservations</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Control</th></tr></thead>
              <tbody className="divide-y divide-charcoal/15">
                {rows.map((row) => (
                  <tr key={row.id} className={!row.isOpen ? "bg-charcoal/4 text-weathered" : undefined}>
                    <td className="px-4 py-4 font-semibold tabular-nums"><time dateTime={row.date}>{new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${row.date}T00:00:00Z`))}</time></td>
                    <td className="px-4 py-4"><strong className="tabular-nums">{row.spotsRemaining}</strong><span className="text-weathered"> / {row.capacity} spots</span></td>
                    <td className="px-4 py-4 tabular-nums">{row.activeBookings}</td>
                    <td className="px-4 py-4"><AdminStatus status={row.isOpen ? "OPEN" : "CLOSED"} /></td>
                    <td className="px-4 py-4"><AvailabilityToggle id={row.id} isOpen={row.isOpen} preview={session.preview} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-charcoal/35 bg-frangipani px-5 py-10 text-center">
            <p className="font-serif text-2xl">No dates open in {monthLabel(month)}</p>
            <p className="mt-2 text-sm text-weathered">Use the date-range form above to add operating dates for this tour.</p>
          </div>
        )}
      </section>
    </div>
  );
}
