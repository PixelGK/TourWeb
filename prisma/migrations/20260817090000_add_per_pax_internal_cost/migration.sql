ALTER TABLE "tours"
ADD COLUMN "per_pax_cost_idr" INTEGER;

ALTER TABLE "bookings"
ADD COLUMN "per_pax_cost_idr_snapshot" INTEGER;

ALTER TABLE "tours"
ADD CONSTRAINT "tours_per_pax_cost_idr_nonnegative"
CHECK ("per_pax_cost_idr" IS NULL OR "per_pax_cost_idr" >= 0);

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_per_pax_cost_idr_snapshot_nonnegative"
CHECK ("per_pax_cost_idr_snapshot" IS NULL OR "per_pax_cost_idr_snapshot" >= 0);
