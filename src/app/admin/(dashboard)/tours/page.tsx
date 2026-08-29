import { ArrowRight, CircleAlert, Plus } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatus } from "@/components/admin/admin-status";
import { PickupRuleCopyForm } from "@/components/admin/pickup-rule-copy-form";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { getAdminTours } from "@/lib/admin-data";
import type { TourReadinessStatus } from "@/lib/tour-readiness";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const filters: Array<{ value: "ALL" | TourReadinessStatus; label: string }> = [
  { value: "ALL", label: "All packages" },
  { value: "READY", label: "Ready" },
  { value: "NEEDS_ATTENTION", label: "Needs attention" },
  { value: "DRAFT", label: "Drafts" },
];

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours} hours`;
}

export default async function AdminToursPage({ searchParams }: { searchParams: Promise<{ readiness?: string }> }) {
  const [{ readiness }, session, tours] = await Promise.all([searchParams, requireAdminPageSession(), getAdminTours()]);
  const activeFilter = filters.some((filter) => filter.value === readiness) ? readiness as "ALL" | TourReadinessStatus : "ALL";
  const visibleTours = activeFilter === "ALL" ? tours : tours.filter((tour) => tour.readinessStatus === activeFilter);
  const counts = Object.fromEntries(filters.map((filter) => [filter.value, filter.value === "ALL" ? tours.length : tours.filter((tour) => tour.readinessStatus === filter.value).length]));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="02 · Tour desk"
        title="Tours and charters"
        description="See what is ready to sell, fix incomplete operating details, and keep pickup charges consistent. Warnings do not unpublish a package."
        action={<Link href="/admin/tours/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-gold bg-gold px-5 text-sm font-semibold text-charcoal shadow-sun transition hover:-translate-y-0.5 hover:bg-gold-dark"><Plus className="size-4" aria-hidden="true" /> New tour</Link>}
      />

      <section aria-label="Package readiness summary" className="grid border border-charcoal/25 bg-frangipani sm:grid-cols-4">
        {filters.map((filter) => (
          <Link key={filter.value} href={filter.value === "ALL" ? "/admin/tours" : `/admin/tours?readiness=${filter.value}`} aria-current={activeFilter === filter.value ? "page" : undefined} className={`flex min-h-20 items-center justify-between gap-3 border-b border-charcoal/15 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${activeFilter === filter.value ? "bg-charcoal text-frangipani" : "hover:bg-gold/8"}`}>
            <span className="text-sm font-semibold">{filter.label}</span><strong className={`font-serif text-3xl tabular-nums ${activeFilter === filter.value ? "text-gold" : "text-charcoal"}`}>{counts[filter.value]}</strong>
          </Link>
        ))}
      </section>

      <PickupRuleCopyForm tours={tours.map((tour) => ({ id: tour.id, title: tour.title }))} preview={session.preview} />

      <section aria-label="Tour inventory" className="overflow-hidden border border-charcoal/30 bg-frangipani">
        <div className="hidden grid-cols-[minmax(15rem,1.25fr)_0.65fr_0.65fr_minmax(13rem,0.9fr)_2.5rem] gap-4 bg-charcoal px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-frangipani md:grid">
          <span>Listing</span><span>Price / duration</span><span>Demand</span><span>Readiness</span><span className="sr-only">Open</span>
        </div>
        <ol className="divide-y divide-charcoal/15">
          {visibleTours.map((tour) => (
            <li key={tour.id}>
              <Link href={`/admin/tours/${tour.id}`} className="group grid gap-4 p-5 transition-colors hover:bg-gold/8 md:grid-cols-[minmax(15rem,1.25fr)_0.65fr_0.65fr_minmax(13rem,0.9fr)_2.5rem] md:items-center">
                <div><strong className="block text-base leading-5">{tour.title}</strong><span className="mt-1 block text-xs text-weathered">{tour.category} · /{tour.slug}</span><span className="mt-2 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-clay">{tour.published ? "Published" : "Not visible to guests"}</span></div>
                <div><strong className="block text-sm tabular-nums">{idr.format(tour.basePriceIdr)}</strong><span className="text-xs text-weathered">{durationLabel(tour.durationMinutes)} · {tour.pricingMode === "PER_VEHICLE" ? "vehicle" : "person"}</span></div>
                <div className="grid grid-cols-2 gap-4 text-sm md:block"><span><strong className="block tabular-nums">{tour.bookingCount}</strong><span className="text-xs text-weathered">bookings</span></span><span className="md:mt-1 md:block"><strong className="tabular-nums md:font-normal">{tour.openDateCount}</strong><span className="ml-1 text-xs text-weathered">open dates</span></span></div>
                <div>
                  <AdminStatus status={tour.readinessStatus} />
                  {tour.readinessIssues.length ? <ul className="mt-2 space-y-1 text-xs leading-4 text-weathered">{tour.readinessIssues.slice(0, 2).map((issue) => <li key={issue.code} className="flex gap-1.5"><CircleAlert className="mt-0.5 size-3.5 shrink-0 text-clay" aria-hidden="true" /><span>{issue.message}</span></li>)}{tour.readinessIssues.length > 2 ? <li className="pl-5 font-semibold text-clay">+{tour.readinessIssues.length - 2} more checks</li> : null}</ul> : <p className="mt-2 text-xs text-success">Operating details complete</p>}
                </div>
                <ArrowRight className="hidden size-5 text-clay transition-transform group-hover:translate-x-1 md:block" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
        {!visibleTours.length ? <div className="p-8 text-center"><p className="font-serif text-2xl">No packages in this view</p><p className="mt-2 text-sm text-weathered">Choose another readiness filter to see the rest of the catalogue.</p></div> : null}
      </section>
    </div>
  );
}
