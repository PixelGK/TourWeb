import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

if (!connectionString) throw new Error("DATABASE_URL or DIRECT_URL is required");
if (!email) throw new Error("ADMIN_EMAIL is required");
if (!passwordHash?.startsWith("scrypt$")) throw new Error("ADMIN_PASSWORD_HASH is invalid");

const caSource = await readFile(
  fileURLToPath(new URL("../src/lib/supabase-database-ca.ts", import.meta.url)),
  "utf8",
);
const ca = caSource.match(/`(-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----)`/)?.[1];
if (!ca) throw new Error("Supabase database CA could not be loaded");

const client = new pg.Client({
  connectionString,
  ssl: { ca, rejectUnauthorized: true },
  connectionTimeoutMillis: 8_000,
});

await client.connect();
try {
  await client.query(
    `insert into public.users (email, name, password_hash, role)
     values ($1, 'BaliXperience Owner', $2, 'ADMIN')
     on conflict (email) do update
       set password_hash = excluded.password_hash,
           role = 'ADMIN',
           updated_at = now()`,
    [email, passwordHash],
  );
  const result = await client.query(
    `select count(*)::int as count
       from public.users
      where email = $1 and role = 'ADMIN' and password_hash = $2`,
    [email, passwordHash],
  );
  if (result.rows[0]?.count !== 1) throw new Error("Admin user verification failed");
  process.stdout.write("Admin user synchronized and verified.\n");
} finally {
  await client.end();
}
