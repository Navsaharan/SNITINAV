-- Media is private by default. Administrators explicitly publish gallery images.
ALTER TABLE "media" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- Existing slideshow membership is an explicit publication decision; preserve it.
UPDATE "media"
SET "isPublic" = true
WHERE "id" IN (
  SELECT jsonb_array_elements_text("value"::jsonb)
  FROM "settings"
  WHERE "key" = 'homepage_slideshow'
    AND jsonb_typeof("value"::jsonb) = 'array'
);
