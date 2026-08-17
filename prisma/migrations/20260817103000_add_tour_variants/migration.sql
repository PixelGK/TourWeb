CREATE TABLE "tour_variants" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tour_id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "price_adjustment_idr" INTEGER NOT NULL DEFAULT 0,
  "supplier_unit_cost_idr" INTEGER NOT NULL,
  "guests_per_unit" INTEGER NOT NULL DEFAULT 1,
  "remainder_cost_idr" INTEGER NOT NULL DEFAULT 0,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tour_variants_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tour_variants_supplier_cost_nonnegative" CHECK ("supplier_unit_cost_idr" >= 0),
  CONSTRAINT "tour_variants_remainder_cost_nonnegative" CHECK ("remainder_cost_idr" >= 0),
  CONSTRAINT "tour_variants_guests_per_unit_positive" CHECK ("guests_per_unit" >= 1)
);

CREATE UNIQUE INDEX "tour_variants_tour_id_code_key" ON "tour_variants"("tour_id", "code");
CREATE INDEX "tour_variants_tour_id_active_idx" ON "tour_variants"("tour_id", "active");
CREATE UNIQUE INDEX "tour_variants_one_active_default_per_tour" ON "tour_variants"("tour_id") WHERE "is_default" AND "active";
ALTER TABLE "tour_variants" ADD CONSTRAINT "tour_variants_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings"
  ADD COLUMN "variant_id" UUID,
  ADD COLUMN "variant_code_snapshot" TEXT,
  ADD COLUMN "variant_title_snapshot" TEXT,
  ADD COLUMN "variant_price_adjustment_idr_snapshot" INTEGER,
  ADD COLUMN "variant_supplier_cost_idr_snapshot" INTEGER;
CREATE INDEX "bookings_variant_id_idx" ON "bookings"("variant_id");
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "tour_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_variant_supplier_cost_nonnegative" CHECK ("variant_supplier_cost_idr_snapshot" IS NULL OR "variant_supplier_cost_idr_snapshot" >= 0);

ALTER TABLE "tour_variants" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "tour_variants" FROM anon, authenticated;
