-- Categories can hold several images; `image` remains the cover (first image).
ALTER TABLE "Category" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Keep existing covers: seed the gallery with the current image.
UPDATE "Category" SET "images" = ARRAY["image"] WHERE "image" IS NOT NULL AND "image" <> '';
