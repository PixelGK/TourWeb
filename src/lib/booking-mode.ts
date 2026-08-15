import "server-only";

export type BookingFlowMode = "request" | "payment";

export function getBookingFlowMode(): BookingFlowMode {
  return process.env.BOOKING_FLOW_MODE === "payment" ? "payment" : "request";
}
