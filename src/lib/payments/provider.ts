import "server-only";

import { MidtransProvider } from "@/lib/payments/midtrans";
import type { PaymentProvider } from "@/lib/payments/types";

export function getPaymentProvider(): PaymentProvider {
  const provider = (process.env.PAYMENT_PROVIDER ?? "midtrans").toLowerCase();
  if (provider === "midtrans") return new MidtransProvider();
  throw new Error(`Unsupported payment provider: ${provider}`);
}
