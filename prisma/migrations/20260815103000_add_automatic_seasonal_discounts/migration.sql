ALTER TABLE "discount_codes"
  ADD COLUMN "name" TEXT,
  ADD COLUMN "automatic" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "discount_codes"
  ADD CONSTRAINT "discount_codes_automatic_schedule_check" CHECK (
    NOT "automatic"
    OR (
      "name" IS NOT NULL
      AND length(trim("name")) >= 3
      AND "starts_at" IS NOT NULL
      AND "ends_at" IS NOT NULL
      AND "usage_limit" IS NULL
    )
  );

CREATE INDEX "discount_codes_automatic_active_starts_at_ends_at_idx"
  ON "discount_codes"("automatic", "active", "starts_at", "ends_at");
