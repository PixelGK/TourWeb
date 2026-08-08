import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { getAppUrl, requireServerEnv } from "@/lib/server-env";

export const ADMIN_COOKIE = "bx_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

export interface AdminSession {
  sub: string;
  email: string;
  exp: number;
  preview: boolean;
}

function sessionSecret() {
  return requireServerEnv("ADMIN_SESSION_SECRET");
}

function signature(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createAdminSessionToken(session: Omit<AdminSession, "exp">) {
  const payload = Buffer.from(JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyAdminSessionToken(token?: string): AdminSession | null {
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expected = Buffer.from(signature(payload), "base64url");
  const received = Buffer.from(suppliedSignature, "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<AdminSession>;
    if (typeof value.sub !== "string" || typeof value.email !== "string" || typeof value.exp !== "number" || typeof value.preview !== "boolean") return null;
    if (value.exp <= Math.floor(Date.now() / 1000)) return null;
    return value as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const session = verifyAdminSessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!session) return null;
  if (session?.preview && !isAdminPreviewEnabled()) return null;
  if (session.preview) return session;

  // Refresh identity and role from the database so email changes and access
  // revocations take effect immediately instead of waiting for cookie expiry.
  const user = await getPrisma().user.findUnique({
    where: { id: session.sub },
    select: { email: true, role: true },
  });
  if (!user || user.role !== UserRole.ADMIN) return null;

  return { ...session, email: user.email };
}

export async function requireAdminPageSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: new URL(getAppUrl()).protocol === "https:",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

export function isAdminPreviewEnabled() {
  if (process.env.ADMIN_PREVIEW_MODE !== "true" || process.env.VERCEL) return false;
  try {
    return ["localhost", "127.0.0.1"].includes(new URL(getAppUrl()).hostname);
  } catch {
    return false;
  }
}

export function isTrustedMutationRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const suppliedOrigin = new URL(origin).origin;
    return suppliedOrigin === new URL(getAppUrl()).origin || suppliedOrigin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
