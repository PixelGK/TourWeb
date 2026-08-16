CREATE TYPE "TourPricingMode" AS ENUM ('PER_PERSON', 'PER_VEHICLE');

ALTER TABLE "tours"
ADD COLUMN "pricing_mode" "TourPricingMode" NOT NULL DEFAULT 'PER_PERSON';

UPDATE "tours"
SET "pricing_mode" = 'PER_VEHICLE',
    "base_price_idr" = 400000,
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
SELECT gen_random_uuid(), "id", 1, 6, 400000
FROM "tours"
WHERE "slug" = 'private-car-charter-bali';

UPDATE "tour_addons"
SET "price_idr" = 120000
WHERE "code" = 'local-lunch';
