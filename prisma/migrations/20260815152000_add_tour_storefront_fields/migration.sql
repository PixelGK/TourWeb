ALTER TABLE "public"."tours"
ADD COLUMN "location" TEXT NOT NULL DEFAULT 'Bali',
ADD COLUMN "card_note" TEXT,
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "image_alts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "tours_featured_published_idx" ON "public"."tours"("featured", "published");

UPDATE "public"."tours"
SET "featured" = true
WHERE "slug" IN (
  'mount-batur-sunrise-trek',
  'nusa-penida-west-coast',
  'sekumpul-waterfall-north-bali',
  'ubud-temples-rice-terraces'
);

UPDATE "public"."tours" AS "tour"
SET "image_alts" = (
  SELECT array_agg("tour"."title" || ' — photo ' || "image"."position" ORDER BY "image"."position")
  FROM unnest("tour"."images") WITH ORDINALITY AS "image"("url", "position")
)
WHERE cardinality("tour"."image_alts") = 0;
