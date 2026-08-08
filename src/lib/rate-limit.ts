import "server-only";

import { createHash } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { requireServerEnv } from "@/lib/server-env";

interface RateLimitRow {
  count: number;
  reset_at: Date;
}

export async function enforceRateLimit(scope: string, identifier: string, limit: number, windowSeconds: number) {
  const digest = createHash("sha256")
    .update(`${scope}:${identifier}:${requireServerEnv("RATE_LIMIT_SALT")}`)
    .digest("hex");
  const key = `${scope}:${digest}`;
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<RateLimitRow[]>(Prisma.sql`
    insert into public.rate_limit_buckets (key, count, window_start, reset_at, updated_at)
    values (${key}, 1, now(), now() + (${windowSeconds} * interval '1 second'), now())
    on conflict (key) do update set
      count = case
        when rate_limit_buckets.reset_at <= now() then 1
        else rate_limit_buckets.count + 1
      end,
      window_start = case
        when rate_limit_buckets.reset_at <= now() then now()
        else rate_limit_buckets.window_start
      end,
      reset_at = case
        when rate_limit_buckets.reset_at <= now() then now() + (${windowSeconds} * interval '1 second')
        else rate_limit_buckets.reset_at
      end,
      updated_at = now()
    returning count, reset_at
  `);

  const bucket = rows[0];
  if (!bucket) throw new Error("Rate limiter did not return a bucket");
  return { allowed: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.reset_at };
}
