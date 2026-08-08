export type PaymentState = "pending" | "paid" | "failed" | "cancelled" | "expired" | "refunded";

export interface PaymentStatus {
  state: PaymentState;
  transactionId: string;
  grossAmountIdr: number;
  currency: "IDR";
  providerStatus: string;
}

export interface Booking {
  reference: string;
  tourTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paxCount: number;
  totalAmountIdr: number;
}

export interface PaymentWebhookEvent extends PaymentStatus {
  providerEventId: string;
}

export interface PaymentProvider {
  createTransaction(booking: Booking): Promise<{ redirectUrl: string; transactionId: string }>;
  verifyWebhookSignature(payload: unknown, headers: Headers): boolean;
  getTransactionStatus(transactionId: string): Promise<PaymentStatus>;
  parseWebhook(payload: unknown): PaymentWebhookEvent;
}

export type PaymentBooking = Booking;

export class PaymentProviderError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
  }
}
