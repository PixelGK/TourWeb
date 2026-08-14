import { BookingStatus } from "@/generated/prisma/client";
import { after } from "next/server";
import { applyVerifiedPaymentStatus, markPaymentReceiptEmailSent } from "@/lib/booking-service";
import { sendPaymentReceipt } from "@/lib/email";
import { getPaymentProvider } from "@/lib/payments/provider";
import { PaymentProviderError } from "@/lib/payments/types";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestIp, readJsonBody, RequestBodyError } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rateLimit = await enforceRateLimit("midtrans-webhook", getRequestIp(request.headers), 120, 60);
    if (!rateLimit.allowed) return Response.json({ error: "Rate limit exceeded" }, { status: 429 });

    const payload = await readJsonBody(request);
    const provider = getPaymentProvider();
    if (!provider.verifyWebhookSignature(payload, request.headers)) return Response.json({ error: "Invalid webhook signature" }, { status: 401 });

    const event = provider.parseWebhook(payload);
    const verified = await provider.getTransactionStatus(event.transactionId);
    if (verified.transactionId !== event.transactionId || verified.grossAmountIdr !== event.grossAmountIdr || verified.currency !== "IDR") {
      return Response.json({ error: "Webhook did not match provider status" }, { status: 409 });
    }

    const booking = await applyVerifiedPaymentStatus(verified.transactionId, verified.state, verified.grossAmountIdr);
    if (booking.status === BookingStatus.PAID && !booking.paymentReceiptEmailSentAt) {
      after(async () => {
        try {
          await sendPaymentReceipt(booking);
          await markPaymentReceiptEmailSent(booking.id);
        } catch (error) {
          // Resend's idempotency key makes a later replay safe.
          console.error("Booking confirmation email failed", error instanceof Error ? error.name : "UnknownError");
        }
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    if (error instanceof RequestBodyError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof PaymentProviderError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Midtrans webhook failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Webhook could not be processed" }, { status: 503 });
  }
}
