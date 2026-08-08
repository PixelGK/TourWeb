import { ZodError } from "zod";

import { BookingError, releasePendingBooking, reserveBooking, toPaymentBooking } from "@/lib/booking-service";
import { checkoutRequestSchema, idempotencyKeySchema } from "@/lib/checkout-validation";
import { getPaymentProvider } from "@/lib/payments/provider";
import { PaymentProviderError } from "@/lib/payments/types";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestIp, readJsonBody, RequestBodyError } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let reference: string | undefined;
  try {
    const rateLimit = await enforceRateLimit("checkout", getRequestIp(request.headers), 8, 60);
    if (!rateLimit.allowed) return Response.json({ error: "Too many checkout attempts. Please wait a minute and try again." }, { status: 429 });

    const idempotencyKey = idempotencyKeySchema.parse(request.headers.get("idempotency-key"));
    const input = checkoutRequestSchema.parse(await readJsonBody(request));
    const reservation = await reserveBooking(input, idempotencyKey);
    reference = reservation.booking.reference;

    if (!reservation.created) {
      return Response.json({ error: "This booking request is already being processed.", reference }, { status: 409 });
    }

    const provider = getPaymentProvider();
    const transaction = await provider.createTransaction(toPaymentBooking(reservation.booking));
    return Response.json({
      bookingReference: reservation.booking.reference,
      redirectUrl: transaction.redirectUrl,
      currency: "IDR",
      totalAmountIdr: reservation.booking.totalAmountIdr,
    }, { status: 201 });
  } catch (error) {
    if (reference) await releasePendingBooking(reference).catch(() => undefined);
    if (error instanceof RequestBodyError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof ZodError) return Response.json({ error: "Please check the booking details and try again.", fields: error.flatten().fieldErrors }, { status: 400 });
    if (error instanceof BookingError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
    if (error instanceof PaymentProviderError) return Response.json({ error: "Secure payment could not be started. Your reserved spots have been released." }, { status: 502 });
    console.error("Checkout creation failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Checkout is not configured in this preview yet." }, { status: 503 });
  }
}
