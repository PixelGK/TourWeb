import "server-only";

import { getAppUrl, requireServerEnv } from "@/lib/server-env";
import { assessTurnstileResponse, TURNSTILE_ACTION, type TurnstileAssessment } from "@/lib/turnstile-core";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export class TurnstileUnavailableError extends Error {}

function allowedHostnames() {
  const hostname = new URL(getAppUrl()).hostname.toLowerCase();
  const alternate = hostname.startsWith("www.") ? hostname.slice(4) : `www.${hostname}`;
  return new Set([hostname, alternate]);
}

export async function verifyTurnstileToken(input: {
  token: string;
  idempotencyKey: string;
  remoteIp?: string;
}): Promise<TurnstileAssessment> {
  const secret = requireServerEnv("TURNSTILE_SECRET_KEY");
  const usingTestKey = secret === TEST_SECRET_KEY;
  const body: Record<string, string> = {
    secret,
    response: input.token,
    idempotency_key: input.idempotencyKey,
  };
  if (input.remoteIp && input.remoteIp !== "unknown") body.remoteip = input.remoteIp;

  let response: Response;
  try {
    response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new TurnstileUnavailableError("Turnstile validation could not be reached");
  }

  if (!response.ok) throw new TurnstileUnavailableError("Turnstile validation returned an unavailable response");

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new TurnstileUnavailableError("Turnstile validation returned an invalid response");
  }

  return assessTurnstileResponse(payload, {
    allowedHostnames: usingTestKey ? new Set() : allowedHostnames(),
    expectedAction: usingTestKey ? undefined : TURNSTILE_ACTION,
  });
}
