-- Certificate & Portfolio kinds, Meet Our Team, and Company Gallery.

CREATE TYPE "CertificateKind" AS ENUM ('CERTIFICATE', 'PORTFOLIO');
CREATE TYPE "TeamSection" AS ENUM ('LEADERSHIP', 'ENGINEERING', 'TEAM');
CREATE TYPE "GalleryCategory" AS ENUM ('PHOTOS', 'ACTIVITIES', 'PROJECTS', 'EVENTS', 'OTHER');

ALTER TABLE "Certificate" ADD COLUMN "kind" "CertificateKind" NOT NULL DEFAULT 'CERTIFICATE';
ALTER TABLE "Certificate" ADD COLUMN "images" JSONB;

CREATE INDEX "Certificate_kind_idx" ON "Certificate"("kind");

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT,
    "photo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "section" "TeamSection" NOT NULL DEFAULT 'TEAM',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TeamMember_status_idx" ON "TeamMember"("status");
CREATE INDEX "TeamMember_section_idx" ON "TeamMember"("section");
CREATE INDEX "TeamMember_order_idx" ON "TeamMember"("order");

CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "category" "GalleryCategory" NOT NULL DEFAULT 'PHOTOS',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GalleryImage_status_idx" ON "GalleryImage"("status");
CREATE INDEX "GalleryImage_category_idx" ON "GalleryImage"("category");
CREATE INDEX "GalleryImage_order_idx" ON "GalleryImage"("order");
