import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { requireServerEnv } from "@/lib/server-env";
import { SUPABASE_DATABASE_CA } from "@/lib/supabase-database-ca";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const databaseUrl = new URL(requireServerEnv("DATABASE_URL"));

  // node-postgres lets an sslmode query parameter replace the explicit TLS
  // options. Remove it so certificate and hostname verification cannot be
  // silently weakened by a copied connection string.
  databaseUrl.searchParams.delete("sslmode");

  const adapter = new PrismaPg({
    connectionString: databaseUrl.toString(),
    ssl: {
      ca: SUPABASE_DATABASE_CA,
      rejectUnauthorized: true,
    },
    max: 5,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
  });
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}
