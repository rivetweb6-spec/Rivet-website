-- CreateTable
CREATE TABLE "HomePageContent" (
    "id" TEXT NOT NULL DEFAULT 'home',
    "eyebrow" TEXT,
    "headline" TEXT,
    "headlineAccent" TEXT,
    "subheadline" TEXT,
    "heroImage" TEXT,
    "introEyebrow" TEXT,
    "introTitle" TEXT,
    "introBody" TEXT,
    "introBodySecondary" TEXT,
    "introImage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageContent_pkey" PRIMARY KEY ("id")
);
