import "server-only";

import { Resend } from "resend";

import { bookingConfirmationHtml } from "@/emails/booking-confirmation";
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
