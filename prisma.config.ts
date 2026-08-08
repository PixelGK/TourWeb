import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Prisma CLI uses the direct/session connection. Runtime uses the pooled
  // DATABASE_URL through the pg adapter in src/lib/db.ts.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
