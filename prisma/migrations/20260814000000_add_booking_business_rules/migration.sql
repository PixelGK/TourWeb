ALTER TABLE "tours"
  ADD COLUMN "child_price_idr" INTEGER,
  ADD COLUMN "child_age_label" TEXT;

ALTER TABLE "bookings"
  ADD COLUMN "adult_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "child_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "discount_code_id" UUID,
  ADD COLUMN "discount_percent" INTEGER,
  ADD COLUMN "discount_amount_idr" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "payment_receipt_email_sent_at" TIMESTAMP(3),
  ADD COLUMN "confirmed_at" TIMESTAMP(3);

UPDATE "bookings" SET "adult_count" = "pax_count" WHERE "adult_count" = 0;

CREATE TABLE "discount_codes" (
  "id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "percent_off" INTEGER NOT NULL,
  "starts_at" TIMESTAMP(3),
  "ends_at" TIMESTAMP(3),
  "usage_limit" INTEGER,
  "times_used" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "applies_to_all" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "discount_code_tours" (
  "discount_code_id" UUID NOT NULL,
  "tour_id" UUID NOT NULL,
  CONSTRAINT "discount_code_tours_pkey" PRIMARY KEY ("discount_code_id", "tour_id")
);

CREATE TABLE "global_blackout_dates" (
  "date" DATE NOT NULL,
  "reason" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "global_blackout_dates_pkey" PRIMARY KEY ("date")
);

CREATE UNIQUE INDEX "discount_codes_code_key" ON "discount_codes"("code");
CREATE INDEX "discount_codes_active_starts_at_ends_at_idx" ON "discount_codes"("active", "starts_at", "ends_at");
CREATE INDEX "discount_code_tours_tour_id_idx" ON "discount_code_tours"("tour_id");
CREATE INDEX "bookings_discount_code_id_idx" ON "bookings"("discount_code_id");

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "discount_code_tours" ADD CONSTRAINT "discount_code_tours_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discount_code_tours" ADD CONSTRAINT "discount_code_tours_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_percent_off_check" CHECK ("percent_off" BETWEEN 1 AND 50);
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_usage_limit_check" CHECK ("usage_limit" IS NULL OR "usage_limit" > 0);
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_times_used_check" CHECK ("times_used" >= 0);
ALTER TABLE "tours" ADD CONSTRAINT "tours_child_price_idr_check" CHECK ("child_price_idr" IS NULL OR "child_price_idr" >= 0);
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_traveler_counts_check" CHECK ("adult_count" >= 0 AND "child_count" >= 0 AND "adult_count" + "child_count" = "pax_count");
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_discount_amount_check" CHECK ("discount_amount_idr" >= 0 AND "discount_amount_idr" <= "total_amount_idr" + "discount_amount_idr");
