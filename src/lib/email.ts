import "server-only";

import { Resend } from "resend";

import { bookingConfirmationHtml, paymentReceiptHtml } from "@/emails/booking-confirmation";
import type { BookingWithTour } from "@/lib/booking-service";
import { requireServerEnv } from "@/lib/server-env";

export async function sendBookingConfirmation(booking: BookingWithTour) {
  const resend = new Resend(requireServerEnv("RESEND_API_KEY"));
  const { error } = await resend.emails.send({
    from: requireServerEnv("RESEND_FROM_EMAIL"),
    to: [booking.customerEmail],
    subject: `Confirmed: ${booking.tour.title} · ${booking.reference}`,
    html: bookingConfirmationHtml(booking),
  }, { idempotencyKey: `booking-paid/${booking.id}` });

  if (error) throw new Error(`Confirmation email failed: ${error.message}`);
}

export async function sendPaymentReceipt(booking: BookingWithTour) {
  const resend = new Resend(requireServerEnv("RESEND_API_KEY"));
  const { error } = await resend.emails.send({
    from: requireServerEnv("RESEND_FROM_EMAIL"),
    to: [booking.customerEmail],
    subject: `Payment received: ${booking.tour.title} · ${booking.reference}`,
    html: paymentReceiptHtml(booking),
  }, { idempotencyKey: `booking-paid-receipt/${booking.id}` });
  if (error) throw new Error(`Payment receipt failed: ${error.message}`);
}
