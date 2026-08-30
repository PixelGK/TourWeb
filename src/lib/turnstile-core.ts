export const TURNSTILE_ACTION = "booking_request";

export type TurnstileAssessment =
  | { success: true }
  | { success: false; reason: "invalid-response" | "rejected" | "wrong-action" | "wrong-hostname" };

interface TurnstileAssessmentOptions {
  allowedHostnames: ReadonlySet<string>;
  expectedAction?: string;
}

export function assessTurnstileResponse(payload: unknown, options: TurnstileAssessmentOptions): TurnstileAssessment {
  if (!payload || typeof payload !== "object") return { success: false, reason: "invalid-response" };

  const result = payload as Record<string, unknown>;
  if (result.success !== true) return { success: false, reason: "rejected" };

  if (options.expectedAction && result.action !== options.expectedAction) {
    return { success: false, reason: "wrong-action" };
  }

  if (options.allowedHostnames.size > 0) {
    const hostname = typeof result.hostname === "string" ? result.hostname.toLowerCase() : "";
    if (!options.allowedHostnames.has(hostname)) return { success: false, reason: "wrong-hostname" };
  }

  return { success: true };
}
