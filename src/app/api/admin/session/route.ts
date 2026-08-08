import { UserRole } from "@/generated/prisma/client";
import { ADMIN_COOKIE, adminCookieOptions, createAdminSessionToken, isAdminPreviewEnabled, isTrustedMutationRequest } from "@/lib/admin-auth";
import { verifyAdminPassword } from "@/lib/admin-password";
import { getPrisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestIp, readJsonBody } from "@/lib/request";
import { hasDatabaseConfiguration } from "@/lib/server-env";
import { cookies } from "next/headers";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)).optional(),
  password: z.string().min(1).max(256).optional(),
  preview: z.boolean().optional().default(false),
}).strict();

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isTrustedMutationRequest(request)) return Response.json({ error: "Untrusted request origin" }, { status: 403 });
    const input = loginSchema.parse(await readJsonBody(request, 8_000));

    if (input.preview) {
      if (!isAdminPreviewEnabled()) return Response.json({ error: "Admin preview is not enabled" }, { status: 403 });
      const token = createAdminSessionToken({ sub: "local-preview", email: "owner@preview.local", preview: true });
      (await cookies()).set(ADMIN_COOKIE, token, adminCookieOptions());
      return Response.json({ authenticated: true, preview: true });
    }

    if (!hasDatabaseConfiguration()) return Response.json({ error: "Connect the database before signing in" }, { status: 503 });
    const rateLimit = await enforceRateLimit("admin-login", getRequestIp(request.headers), 5, 15 * 60);
    if (!rateLimit.allowed) return Response.json({ error: "Too many sign-in attempts. Try again later." }, { status: 429 });
    if (!input.email || !input.password) return Response.json({ error: "Email and password are required" }, { status: 400 });

    const user = await getPrisma().user.findUnique({ where: { email: input.email } });
    const valid = user?.role === UserRole.ADMIN && await verifyAdminPassword(input.password, user.passwordHash);
    if (!user || !valid) return Response.json({ error: "Email or password is incorrect" }, { status: 401 });

    const token = createAdminSessionToken({ sub: user.id, email: user.email, preview: false });
    (await cookies()).set(ADMIN_COOKIE, token, adminCookieOptions());
    return Response.json({ authenticated: true, preview: false });
  } catch {
    return Response.json({ error: "Sign-in could not be completed" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isTrustedMutationRequest(request)) return Response.json({ error: "Untrusted request origin" }, { status: 403 });
  (await cookies()).delete(ADMIN_COOKIE);
  return Response.json({ authenticated: false });
}
