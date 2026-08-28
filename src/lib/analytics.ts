export const conversionEventNames = [
  "tour_search",
  "collection_selected",
  "tour_viewed",
  "date_selected",
  "checkout_started",
  "booking_request_submitted",
  "whatsapp_clicked",
] as const;

export type ConversionEventName = (typeof conversionEventNames)[number];

export interface ConversionEventProperties {
  path?: string;
  tourSlug?: string;
  collection?: string;
  destination?: string;
  pax?: number;
  valueIdr?: number;
}

export function trackConversion(name: ConversionEventName, properties: ConversionEventProperties = {}) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ name, path: window.location.pathname, ...properties });
  const blob = new Blob([payload], { type: "application/json" });
  if (navigator.sendBeacon?.("/api/analytics", blob)) return;
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
