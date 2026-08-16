ALTER TABLE "bookings"
ADD COLUMN "base_cost_idr_snapshot" INTEGER;

ALTER TABLE "booking_addons"
ADD COLUMN "unit_cost_idr" INTEGER;

UPDATE "bookings" AS booking
SET "base_cost_idr_snapshot" = tour."base_cost_idr"
FROM "tours" AS tour
WHERE booking."tour_id" = tour."id";

UPDATE "booking_addons" AS booking_addon
SET "unit_cost_idr" = addon."cost_price_idr"
FROM "tour_addons" AS addon
WHERE booking_addon."addon_id" = addon."id";

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_base_cost_idr_snapshot_nonnegative"
CHECK ("base_cost_idr_snapshot" IS NULL OR "base_cost_idr_snapshot" >= 0);

ALTER TABLE "booking_addons"
ADD CONSTRAINT "booking_addons_unit_cost_idr_nonnegative"
CHECK ("unit_cost_idr" IS NULL OR "unit_cost_idr" >= 0);
  
