import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { getAppUrl, requireServerEnv } from "@/lib/server-env";
import type { PaymentBooking, PaymentProvider, PaymentState, PaymentStatus, PaymentWebhookEvent } from "@/lib/payments/types";
import { PaymentProviderError } from "@/lib/payments/types";

const midtransResponseSchema = z.object({
  token: z.string().min(1),
  redirect_url: z.url(),
}).passthrough();

const midtransStatusSchema = z.object({
  order_id: z.string().min(1).max(100),
  transaction_id: z.string().min(1).max(100).optional(),
  transaction_status: z.string().min(1).max(40),
  status_code: z.string().min(1).max(8),
  gross_amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  currency: z.literal("IDR").default("IDR"),
  fraud_status: z.string().max(20).optional(),
  signature_key: z.string().regex(/^[a-fA-F0-9]{128}$/).optional(),
}).passthrough();

function mapStatus(transactionStatus: string, statusCode: string, fraudStatus?: string): PaymentState {
  if ((transactionStatus === "capture" || transactionStatus === "settlement") && statusCode === "200" && (!fraudStatus || fraudStatus.toLowerCase() === "accept")) return "paid";
  if (transactionStatus === "refund" || transactionStatus === "partial_refund") return "refunded";
  if (transactionStatus === "cancel") return "cancelled";
  if (transactionStatus === "expire") return "expired";
  if (transactionStatus === "deny" || transactionStatus === "failure") return "failed";
  return "pending";
}

function toPaymentStatus(payload: z.infer<typeof midtransStatusSchema>): PaymentStatus {
  return {
    state: mapStatus(payload.transaction_status, payload.status_code, payload.fraud_status),
    transactionId: payload.order_id,
    grossAmountIdr: Math.round(Number(payload.gross_amount)),
    currency: "IDR",
    providerStatus: payload.transaction_status,
  };
}

export class MidtransProvider implements PaymentProvider {
  private readonly serverKey = requireServerEnv("MIDTRANS_SERVER_KEY");
  private readonly production = process.env.MIDTRANS_IS_PRODUCTION === "true";

  private get snapBaseUrl() {
    return this.production ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
  }

  private get apiBaseUrl() {
    return this.production ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
  }

  private get authorization() {
    return `Basic ${Buffer.from(`${this.serverKey}:`).toString("base64")}`;
  }

  async createTransaction(booking: PaymentBooking) {
    const response = await fetch(`${this.snapBaseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: this.authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction_details: { order_id: booking.reference, gross_amount: booking.totalAmountIdr },
        item_details: [{
          id: booking.reference,
          name: booking.tourTitle.slice(0, 50),
          price: booking.totalAmountIdr,
          quantity: 1,
        }],
        customer_details: {
          first_name: booking.customerName.slice(0, 50),
          email: booking.customerEmail,
          phone: booking.customerPhone,
        },
        callbacks: { finish: `${getAppUrl()}/checkout/confirmation?booking=${encodeURIComponent(booking.reference)}` },
        expiry: { duration: 15, unit: "minute" },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    const raw: unknown = await response.json().catch(() => null);
    const parsed = midtransResponseSchema.safeParse(raw);
    if (!response.ok || !parsed.success) throw new PaymentProviderError("Midtrans could not start the hosted checkout");

    return { redirectUrl: parsed.data.redirect_url, transactionId: booking.reference };
  }

  verifyWebhookSignature(payload: unknown, headers: Headers) {
    void headers;
    const parsed = midtransStatusSchema.safeParse(payload);
    if (!parsed.success || !parsed.data.signature_key) return false;

    const { order_id, status_code, gross_amount, signature_key } = parsed.data;
    const expected = createHash("sha512").update(`${order_id}${status_code}${gross_amount}${this.serverKey}`).digest("hex");
    const receivedBuffer = Buffer.from(signature_key.toLowerCase(), "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
  }

  parseWebhook(payload: unknown): PaymentWebhookEvent {
    const parsed = midtransStatusSchema.safeParse(payload);
    if (!parsed.success || !parsed.data.signature_key) throw new PaymentProviderError("Invalid Midtrans webhook payload", 400);
    return {
      ...toPaymentStatus(parsed.data),
      providerEventId: `${parsed.data.order_id}:${parsed.data.transaction_id ?? "none"}:${parsed.data.transaction_status}:${parsed.data.status_code}`,
    };
  }

  async getTransactionStatus(transactionId: string) {
    const response = await fetch(`${this.apiBaseUrl}/v2/${encodeURIComponent(transactionId)}/status`, {
      headers: { Accept: "application/json", Authorization: this.authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const raw: unknown = await response.json().catch(() => null);
    const parsed = midtransStatusSchema.safeParse(raw);
    if (!response.ok || !parsed.success) throw new PaymentProviderError("Midtrans status verification failed");
    return toPaymentStatus(parsed.data);
  }
}
