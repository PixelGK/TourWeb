import { z } from "zod";

import { getPrisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestIp, readJsonBody, RequestBodyError } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,30}$/),
  tourSlug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
}).strict();

export async function POST(request: Request) {
  try {
    const limit = await enforceRateLimit("discount-validate", getRequestIp(request.headers), 20, 60);
    if (!limit.allowed) return Response.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
    const input = requestSchema.parse(await readJsonBody(request));
    const now = new Date();
    const discount = await getPrisma().discountCode.findUnique({
      where: { code: input.code },
      include: { tours: { where: { tour: { slug: input.tourSlug } }, select: { tourId: true } } },
    });
    const valid = discount?.active
      && (!discount.startsAt || discount.startsAt <= now)
      && (!discount.endsAt || discount.endsAt >= now)
      && (discount.usageLimit === null || discount.timesUsed < discount.usageLimit)
      && (discount.appliesToAll || discount.tours.length > 0);
    if (!valid) return Response.json({ error: "That discount code is not valid for this package." }, { status: 404 });
    return Response.json({ code: discount.code, percentOff: discount.percentOff });
  } catch (error) {
    if (error instanceof RequestBodyError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "That discount code could not be checked." }, { status: 400 });
  }
}
