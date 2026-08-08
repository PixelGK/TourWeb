import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getMockAddons } from "@/data/mock-addons";
import { getTourDetail } from "@/data/mock-tour-details";
import { allTours } from "@/data/mock-tours";
import { isInsideBookingWindow } from "@/lib/booking-window";

export const metadata: Metadata = {
  title: "Secure checkout",
  description: "Complete your BaliXperience traveler details and continue to secure hosted payment in IDR.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ tour?: string; date?: string; pax?: string }> }) {
  const params = await searchParams;
  const tour = allTours.find((item) => item.slug === params.tour);
  const pax = Number(params.pax);
  const date = params.date;
  if (!tour || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !isInsideBookingWindow(date) || !Number.isInteger(pax) || pax < 1 || pax > 6) notFound();

  const detail = getTourDetail(tour);
  return (
    <>
      <SiteHeader />
      <CheckoutFlow
        tour={{ slug: tour.slug, title: tour.title, location: tour.location, duration: tour.duration }}
        date={date}
        pax={pax}
        pricingTiers={detail.pricingTiers}
        addons={getMockAddons(tour.category)}
      />
      <SiteFooter />
    </>
  );
}
