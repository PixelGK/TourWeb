import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getPrisma } from "@/lib/db";
import { hasDatabaseConfiguration } from "@/lib/server-env";

const labels: Record<string, string> = {
  tour_search: "Tour searches",
  collection_selected: "Collections opened",
  tour_viewed: "Tour views",
  date_selected: "Dates selected",
  checkout_started: "Checkout starts",
  booking_request_submitted: "Booking requests",
  whatsapp_clicked: "WhatsApp clicks",
};

const analyticsRenderedAt = Date.now();

function ratio(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "—";
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const query = await searchParams;
  const days = [7, 30, 90].includes(Number(query.days)) ? Number(query.days) : 30;
  const since = new Date(analyticsRenderedAt - days * 86_400_000);
  const events = hasDatabaseConfiguration()
    ? await getPrisma().conversionEvent.findMany({
        where: { createdAt: { gte: since } },
        select: { name: true, tourSlug: true, valueIdr: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20_000,
      }).catch(() => [])
    : [];

  const counts = new Map<string, number>();
  const tours = new Map<string, { views: number; checkouts: number; requests: number }>();
  for (const event of events) {
    counts.set(event.name, (counts.get(event.name) ?? 0) + 1);
    if (!event.tourSlug) continue;
    const row = tours.get(event.tourSlug) ?? { views: 0, checkouts: 0, requests: 0 };
    if (event.name === "tour_viewed") row.views += 1;
    if (event.name === "checkout_started") row.checkouts += 1;
    if (event.name === "booking_request_submitted") row.requests += 1;
    tours.set(event.tourSlug, row);
  }
  const tourRows = [...tours.entries()].sort((a, b) => (b[1].requests * 100 + b[1].checkouts * 10 + b[1].views) - (a[1].requests * 100 + a[1].checkouts * 10 + a[1].views)).slice(0, 12);
  const views = counts.get("tour_viewed") ?? 0;
  const checkouts = counts.get("checkout_started") ?? 0;
  const requests = counts.get("booking_request_submitted") ?? 0;

  return (
    <div className="space-y-10">
      <AdminPageHeader eyebrow="07 · Visitor journey" title="Analytics" description="See which actions lead toward a booking request. These are event counts, not unique people, and no customer contact details are stored here." />
      <nav aria-label="Analytics period" className="flex gap-2">
        {[7, 30, 90].map((option) => <a key={option} href={`/admin/analytics?days=${option}`} aria-current={days === option ? "page" : undefined} className={`inline-flex min-h-11 items-center border px-4 text-sm font-semibold ${days === option ? "border-terrace bg-terrace text-frangipani" : "border-charcoal/25 bg-frangipani hover:border-terrace"}`}>{option} days</a>)}
      </nav>
      <section aria-label="Conversion summary" className="grid border border-charcoal/25 bg-frangipani sm:grid-cols-3">
        <Metric label="Booking requests" value={requests} note={`${ratio(requests, checkouts)} of checkout-start events`} />
        <Metric label="Checkout starts" value={checkouts} note={`${ratio(checkouts, views)} of tour-view events`} />
        <Metric label="WhatsApp clicks" value={counts.get("whatsapp_clicked") ?? 0} note="Secondary contact action" last />
      </section>
      <section aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="font-serif text-4xl">Journey actions</h2>
        <div className="mt-5 grid border border-charcoal/25 bg-white sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(labels).map(([name, label]) => <div key={name} className="border-b border-r border-charcoal/15 p-5"><span className="text-xs font-bold uppercase tracking-[0.08em] text-weathered">{label}</span><strong className="mt-3 block font-serif text-4xl tabular-nums">{counts.get(name) ?? 0}</strong></div>)}
        </div>
      </section>
      <section aria-labelledby="tours-heading">
        <h2 id="tours-heading" className="font-serif text-4xl">Tours attracting intent</h2>
        <p className="mt-2 text-sm leading-6 text-weathered">Use this to compare interest, not as an accounting report. A person may generate more than one event.</p>
        <div className="mt-5 overflow-x-auto border border-charcoal/25 bg-frangipani">
          <table className="w-full min-w-[40rem] text-left text-sm"><thead className="bg-charcoal text-frangipani"><tr><th className="px-4 py-3">Tour slug</th><th className="px-4 py-3">Views</th><th className="px-4 py-3">Checkouts</th><th className="px-4 py-3">Requests</th></tr></thead><tbody className="divide-y divide-charcoal/15">{tourRows.length ? tourRows.map(([slug, row]) => <tr key={slug}><td className="px-4 py-4 font-semibold">{slug}</td><td className="px-4 py-4 tabular-nums">{row.views}</td><td className="px-4 py-4 tabular-nums">{row.checkouts}</td><td className="px-4 py-4 tabular-nums">{row.requests}</td></tr>) : <tr><td colSpan={4} className="px-4 py-8 text-center text-weathered">No conversion events have been recorded in this period yet.</td></tr>}</tbody></table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, note, last = false }: { label: string; value: number; note: string; last?: boolean }) {
  return <div className={`p-5 ${last ? "" : "border-b border-charcoal/15 sm:border-b-0 sm:border-r"}`}><span className="text-xs font-bold uppercase tracking-[0.1em] text-weathered">{label}</span><strong className="mt-4 block font-serif text-5xl tabular-nums">{value}</strong><span className="mt-1 block text-xs text-weathered">{note}</span></div>;
}
