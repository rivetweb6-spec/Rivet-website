-- Careers / vacancy listings and CV applications.

CREATE TYPE "VacancyStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED');
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'HIRED');

CREATE TABLE "Vacancy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department" TEXT,
    "location" TEXT,
    "employmentType" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "VacancyStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "primaryKeyword" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Vacancy_slug_key" ON "Vacancy"("slug");
CREATE INDEX "Vacancy_status_idx" ON "Vacancy"("status");
CREATE INDEX "Vacancy_deadline_idx" ON "Vacancy"("deadline");

CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "coverLetter" TEXT,
    "cvPublicId" TEXT NOT NULL,
    "cvOriginalName" TEXT NOT NULL,
    "cvMimeType" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JobApplication_vacancyId_idx" ON "JobApplication"("vacancyId");
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");
CREATE INDEX "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");
CREATE INDEX "JobApplication_readAt_idx" ON "JobApplication"("readAt");

ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
