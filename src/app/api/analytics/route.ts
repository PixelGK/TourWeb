import { z } from "zod";

import { isTrustedMutationRequest } from "@/lib/admin-auth";
import { conversionEventNames } from "@/lib/analytics";
import { getPrisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestIp, readJsonBody, RequestBodyError } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const eventSchema = z.object({
  name: z.enum(conversionEventNames),
  path: z.string().trim().max(240).optional(),
  tourSlug: z.string().trim().max(120).optional(),
  collection: z.string().trim().max(80).optional(),
  destination: z.string().trim().max(80).optional(),
  pax: z.number().int().min(1).max(30).optional(),
  valueIdr: z.number().int().min(0).max(1_000_000_000).optional(),
}).strict();

export async function POST(request: Request) {
  try {
    if (!isTrustedMutationRequest(request)) return new Response(null, { status: 403 });
    const rateLimit = await enforceRateLimit("analytics", getRequestIp(request.headers), 90, 60);
    if (!rateLimit.allowed) return new Response(null, { status: 429 });
    const event = eventSchema.parse(await readJsonBody(request, 2_048));
    await getPrisma().conversionEvent.create({ data: event });
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof RequestBodyError) return new Response(null, { status: error.status });
    if (error instanceof z.ZodError) return new Response(null, { status: 400 });
    console.error("Conversion event could not be recorded", error instanceof Error ? error.name : "UnknownError");
    return new Response(null, { status: 503 });
  }
}
