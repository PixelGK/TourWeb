import type { Metadata } from "next";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import Link from "next/link";

import { ConfirmationRefresh } from "@/components/checkout/confirmation-refresh";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { BookingStatus } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { hasDatabaseConfiguration } from "@/lib/server-env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Booking status", robots: { index: false, follow: false } };

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  const { booking: reference } = await searchParams;
  const safeReference = reference && /^BX-\d{8}-[A-F0-9]{24}$/.test(reference) ? reference : null;
  const booking = safeReference && hasDatabaseConfiguration()
    ? await getPrisma().booking.findUnique({ where: { reference: safeReference }, include: { tour: true, availability: true } }).catch(() => null)
    : null;

  const isRequested = booking?.status === BookingStatus.REQUESTED;
  const isPaid = booking?.status === BookingStatus.PAID;
  const isConfirmed = booking?.status === BookingStatus.CONFIRMED || Boolean(isPaid && booking?.confirmedAt);
  const isClosed = booking?.status === BookingStatus.CANCELLED || booking?.status === BookingStatus.REFUNDED;
  const isPendingPayment = booking?.status === BookingStatus.PENDING;
  const Icon = isConfirmed || isPaid ? CheckCircle2 : isClosed ? XCircle : Clock3;

  return (
    <>
      <SiteHeader />
      {isPendingPayment ? <ConfirmationRefresh /> : null}
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="border border-charcoal/25 bg-frangipani p-6 shadow-sun sm:p-10">
          <Icon aria-hidden="true" className={`size-12 ${isPaid ? "text-terrace" : isClosed ? "text-error" : "text-gold-dark"}`} />
          <Badge className="mt-6">{isConfirmed ? "Package confirmed" : isPaid ? "Payment verified" : isRequested ? "Request received" : isClosed ? "Booking not active" : "Checking payment"}</Badge>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            {isConfirmed ? "Your Bali day is confirmed." : isPaid ? "We’re arranging your Bali day." : isRequested ? "We’ve received your request." : isClosed ? "This booking is not active." : "We’re confirming your payment."}
          </h1>
          <p className="mt-4 text-lg leading-8 text-weathered">
            {isConfirmed
              ? booking?.paymentStatus === "NOT_REQUIRED"
                ? "Your driver and included arrangements are confirmed. No online payment was taken; we’ll send your Day Plan on WhatsApp before pickup."
                : "Your driver and included arrangements are confirmed. We’ll send your Day Plan on WhatsApp, and your driver will carry any included admission voucher."
              : isPaid
              ? "Midtrans has verified your payment. We will confirm the driver and any included admission within 12 hours, or issue a full refund."
              : isRequested
                ? "No payment has been taken. We’ll check the driver and included arrangements, then contact you on WhatsApp. Capacity is held only after we confirm your request."
              : isClosed
                ? booking?.paymentStatus === "NOT_REQUIRED"
                  ? "This request was not confirmed or has been cancelled. No online payment was taken."
                  : "No paid booking was confirmed for this reference. If money left your account, message us and we’ll check it directly with Midtrans."
                : "A return from the payment page is not proof of payment. This page updates only after Midtrans’s signed server notification reaches us—usually within seconds."}
          </p>

          {booking ? (
            <dl className="mt-8 divide-y divide-charcoal/20 border-y border-charcoal/25">
              <div className="flex justify-between gap-4 py-4"><dt className="text-weathered">Tour</dt><dd className="text-right font-semibold">{booking.tour.title}</dd></div>
              <div className="flex justify-between gap-4 py-4"><dt className="text-weathered">Travelers</dt><dd className="font-semibold">{booking.paxCount}</dd></div>
              <div className="flex justify-between gap-4 py-4"><dt className="text-weathered">{booking.paymentStatus === "NOT_REQUIRED" ? "Quoted total" : "Total in IDR"}</dt><dd className="font-semibold tabular-nums">{idr.format(booking.totalAmountIdr)}</dd></div>
              <div className="flex justify-between gap-4 py-4"><dt className="text-weathered">Reference</dt><dd className="break-all text-right font-mono text-sm font-semibold">{booking.reference}</dd></div>
            </dl>
          ) : safeReference ? (
            <p className="mt-7 border-l-4 border-gold bg-limestone p-4 text-sm leading-6 text-weathered">This preview is not connected to the Supabase database, so it cannot retrieve the booking yet.</p>
          ) : (
            <p className="mt-7 border-l-4 border-error bg-limestone p-4 text-sm leading-6 text-weathered">The booking reference is missing or invalid. Return to the tour and start checkout again.</p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton message={`Hi BaliXperience, I need help with booking ${safeReference ?? ""}.`} className="min-h-12 sm:flex-1">Contact us on WhatsApp</WhatsAppButton>
            <Link href="/tours" className="inline-flex min-h-12 items-center justify-center rounded-control border border-charcoal/45 px-6 font-semibold transition-colors hover:bg-charcoal hover:text-frangipani sm:flex-1">Browse more tours</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
