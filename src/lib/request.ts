import "server-only";

export function getRequestIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || headers.get("x-real-ip") || "unknown").slice(0, 64);
}

export async function readJsonBody(request: Request, maxBytes = 64_000): Promise<unknown> {
  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredSize) && declaredSize > maxBytes) throw new RequestBodyError("Request body is too large", 413);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new RequestBodyError("Request body is too large", 413);

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new RequestBodyError("Request body must be valid JSON", 400);
  }
}

export class RequestBodyError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}
