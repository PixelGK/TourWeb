import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getMockAddons } from "@/data/mock-addons";
import { getTourDetail } from "@/data/mock-tour-details";
import { allTours } from "@/data/mock-tours";
import { isInsideBookingWindow } from "@/lib/booking-window";
import { getBookingFlowMode } from "@/lib/booking-mode";
import { getPrisma } from "@/lib/db";
import { hasDatabaseConfiguration } from "@/lib/server-env";

export const metadata: Metadata = {
  title: "Request your Bali day",
  description: "Send BaliXperience your preferred date, group details, and trip options for confirmation.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ tour?: string; date?: string; pax?: string }> }) {
  const params = await searchParams;
  const tour = allTours.find((item) => item.slug === params.tour);
  const pax = Number(params.pax);
  const date = params.date;
  if (!tour || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !isInsideBookingWindow(date) || !Number.isInteger(pax) || pax < 1 || pax > 6) notFound();

  const detail = getTourDetail(tour);
  const [databaseTour, blackout] = hasDatabaseConfiguration()
    ? await Promise.all([getPrisma().tour.findUnique({
        where: { slug: tour.slug },
        include: { pricingTiers: { orderBy: { minPax: "asc" } }, addons: { where: { active: true }, orderBy: { title: "asc" } } },
      }).catch(() => null), getPrisma().globalBlackoutDate.findUnique({ where: { date: new Date(`${date}T00:00:00.000Z`) } }).catch(() => null)])
    : [null, null];
  if (blackout) return <><SiteHeader /><main className="mx-auto max-w-3xl px-5 py-20 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.15em] text-clay">Date unavailable</p><h1 className="mt-3 font-serif text-5xl">Choose another Bali day.</h1><p className="mt-5 text-lg leading-8 text-weathered">{blackout.reason}. BaliXperience does not operate driver transport on this island-wide closure date.</p><Link href={`/tours/${tour.slug}`} className="mt-8 inline-flex min-h-12 items-center rounded-control bg-terrace px-6 font-semibold text-frangipani">Return to the package</Link></main><SiteFooter /></>;
  return (
    <>
      <SiteHeader />
      <CheckoutFlow
        tour={{ slug: tour.slug, title: tour.title, location: tour.location, duration: tour.duration }}
        date={date}
        pax={pax}
        pricingTiers={databaseTour?.pricingTiers ?? detail.pricingTiers}
        addons={databaseTour?.addons.map((addon) => ({ code: addon.code, title: addon.title, description: addon.description ?? "", priceIdr: addon.priceIdr, pricingMode: addon.pricingMode })) ?? getMockAddons(tour.category, tour.slug)}
        childPriceIdr={databaseTour?.childPriceIdr ?? null}
        childAgeLabel={databaseTour?.childAgeLabel ?? null}
        mode={getBookingFlowMode()}
      />
      <SiteFooter />
    </>
  );
}
