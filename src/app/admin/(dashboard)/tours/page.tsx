import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { getAdminTours } from "@/lib/admin-data";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours} hours`;
}

export default async function AdminToursPage() {
  const tours = await getAdminTours();
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="02 · Tour desk"
        title="Tours and charters"
        description="Create tours and update routes, group pricing, and the details shown to guests."
        action={<Link href="/admin/tours/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-gold bg-gold px-5 text-sm font-semibold text-charcoal shadow-sun transition hover:-translate-y-0.5 hover:bg-gold-dark"><Plus className="size-4" aria-hidden="true" /> New tour</Link>}
      />

      <section aria-label="Tour inventory" className="overflow-hidden border border-charcoal/30 bg-frangipani">
        <div className="hidden grid-cols-[minmax(15rem,1.5fr)_0.7fr_0.7fr_0.6fr_2.5rem] gap-4 bg-charcoal px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-frangipani md:grid">
          <span>Listing</span><span>Price / duration</span><span>Demand</span><span>Status</span><span className="sr-only">Open</span>
        </div>
        <ol className="divide-y divide-charcoal/15">
          {tours.map((tour, index) => (
            <li key={tour.id}>
              <Link href={`/admin/tours/${tour.id}`} className="group grid gap-4 p-5 transition-colors hover:bg-gold/8 md:grid-cols-[minmax(15rem,1.5fr)_0.7fr_0.7fr_0.6fr_2.5rem] md:items-center">
                <div className="grid grid-cols-[2.2rem_1fr] gap-3">
                  <span className="font-serif text-2xl text-gold-dark">{String(index + 1).padStart(2, "0")}</span>
                  <div><strong className="block text-base leading-5">{tour.title}</strong><span className="mt-1 block text-xs text-weathered">{tour.category} · /{tour.slug}</span></div>
                </div>
                <div><strong className="block text-sm tabular-nums">{idr.format(tour.basePriceIdr)}</strong><span className="text-xs text-weathered">{durationLabel(tour.durationMinutes)}</span></div>
                <div className="grid grid-cols-2 gap-4 text-sm md:block"><span><strong className="block tabular-nums">{tour.bookingCount}</strong><span className="text-xs text-weathered">bookings</span></span><span className="md:mt-1 md:block"><strong className="tabular-nums md:font-normal">{tour.openDateCount}</strong><span className="ml-1 text-xs text-weathered">open dates</span></span></div>
                <div><AdminStatus status={tour.published ? "OPEN" : "DRAFT"} /></div>
                <ArrowRight className="hidden size-5 text-clay transition-transform group-hover:translate-x-1 md:block" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
