ALTER TABLE "tours"
ADD COLUMN "base_cost_idr" INTEGER;

ALTER TABLE "tour_addons"
ADD COLUMN "cost_price_idr" INTEGER;

ALTER TABLE "tours"
ADD CONSTRAINT "tours_base_cost_idr_nonnegative"
CHECK ("base_cost_idr" IS NULL OR "base_cost_idr" >= 0);

ALTER TABLE "tour_addons"
ADD CONSTRAINT "tour_addons_cost_price_idr_nonnegative"
CHECK ("cost_price_idr" IS NULL OR "cost_price_idr" >= 0);

UPDATE "tours"
SET "pricing_mode" = 'PER_VEHICLE',
    "base_price_idr" = 700000,
    "base_cost_idr" = 400000,
    "max_group_size" = 6,
    "meeting_point" = 'Your Ubud hotel or villa lobby',
    "inclusions" = ARRAY[
      'Private air-conditioned vehicle for up to 6 guests',
      'Experienced English-speaking local driver',
      'Ubud hotel pickup and drop-off',
      'Parking and fuel',
      'Drinking water',
      'Route planning by WhatsApp'
    ],
    "exclusions" = ARRAY[
      'Attraction entrance tickets unless stated',
      'Meals and personal purchases',
      'Pickup surcharge for Kuta, Canggu, or Uluwatu—quoted before confirmation',
      'Personal travel insurance',
      'Gratuities'
    ]
WHERE "slug" = 'private-car-charter-bali';

DELETE FROM "tour_pricing_tiers"
WHERE "tour_id" = (
  SELECT "id" FROM "tours" WHERE "slug" = 'private-car-charter-bali'
);

INSERT INTO "tour_pricing_tiers" ("id", "tour_id", "min_pax", "max_pax", "per_person_idr")
SELECT gen_random_uuid(), "id", 1, 6, 700000
FROM "tours"
WHERE "slug" = 'private-car-charter-bali';

UPDATE "tour_addons"
SET "price_idr" = 180000,
    "cost_price_idr" = 120000
WHERE "code" = 'local-lunch';

INSERT INTO "tour_addons" ("id", "tour_id", "code", "title", "description", "price_idr", "cost_price_idr", "pricing_mode", "active", "created_at", "updated_at")
SELECT gen_random_uuid(), "id", pickup.code, pickup.title, pickup.description, 150000, 100000, 'PER_BOOKING', true, now(), now()
FROM "tours"
CROSS JOIN (VALUES
  ('pickup-kuta', 'Pickup from Kuta', 'Private pickup and return in Kuta.'),
  ('pickup-canggu', 'Pickup from Canggu', 'Private pickup and return in Canggu.'),
  ('pickup-uluwatu', 'Pickup from Uluwatu', 'Private pickup and return in Uluwatu.')
) AS pickup(code, title, description)
WHERE "slug" = 'private-car-charter-bali'
ON CONFLICT ("tour_id", "code") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "price_idr" = EXCLUDED."price_idr",
  "cost_price_idr" = EXCLUDED."cost_price_idr",
  "pricing_mode" = EXCLUDED."pricing_mode",
  "active" = true,
  "updated_at" = now();
