import "server-only";

export function requireServerEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getAppUrl() {
  return (process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function hasDatabaseConfiguration() {
  return Boolean(process.env.DATABASE_URL?.trim());
}
