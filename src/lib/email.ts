import "server-only";

import { Resend } from "resend";

import { bookingConfirmationHtml, bookingRequestHtml, operatorBookingRequestHtml, paymentReceiptHtml } from "@/emails/booking-confirmation";
import type { BookingWithTour } from "@/lib/booking-service";
import { requireServerEnv } from "@/lib/server-env";

export async function sendBookingConfirmation(booking: BookingWithTour) {
  const resend = new Resend(requireServerEnv("RESEND_API_KEY"));
  const { error } = await resend.emails.send({
    from: requireServerEnv("RESEND_FROM_EMAIL"),
    to: [booking.customerEmail],
    subject: `Confirmed: ${booking.tour.title} · ${booking.reference}`,
    html: bookingConfirmationHtml(booking),
  }, { idempotencyKey: `booking-confirmed/${booking.id}` });

  if (error) throw new Error(`Confirmation email failed: ${error.message}`);
}

function senderAddress(from: string) {
  return from.match(/<([^<>]+)>\s*$/)?.[1] ?? from;
}

export async function sendBookingRequestEmails(booking: BookingWithTour) {
  const resend = new Resend(requireServerEnv("RESEND_API_KEY"));
  const from = requireServerEnv("RESEND_FROM_EMAIL");
  const operatorEmail = senderAddress(from);
  const [customer, operator] = await Promise.all([
    resend.emails.send({
      from,
      to: [booking.customerEmail],
      subject: `Request received: ${booking.tour.title} · ${booking.reference}`,
      html: bookingRequestHtml(booking),
    }, { idempotencyKey: `booking-request-customer/${booking.id}` }),
    resend.emails.send({
      from,
      to: [operatorEmail],
      replyTo: booking.customerEmail,
      subject: `New booking request: ${booking.tour.title} · ${booking.reference}`,
      html: operatorBookingRequestHtml(booking),
    }, { idempotencyKey: `booking-request-operator/${booking.id}` }),
  ]);
  if (customer.error) throw new Error(`Customer request email failed: ${customer.error.message}`);
  if (operator.error) throw new Error(`Operator request email failed: ${operator.error.message}`);
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
