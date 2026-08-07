-- Rename DemoRequest -> QuotationRequest, preserving all existing rows.
ALTER TABLE "DemoRequest" RENAME TO "QuotationRequest";
ALTER INDEX "DemoRequest_pkey" RENAME TO "QuotationRequest_pkey";
ALTER INDEX "DemoRequest_status_idx" RENAME TO "QuotationRequest_status_idx";
ALTER INDEX "DemoRequest_createdAt_idx" RENAME TO "QuotationRequest_createdAt_idx";

-- New status workflow for quotations.
CREATE TYPE "QuotationStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUOTATION_SENT', 'APPROVED', 'REJECTED', 'COMPLETED');

-- Map legacy demo statuses onto the new workflow.
ALTER TABLE "QuotationRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "QuotationRequest"
  ALTER COLUMN "status" TYPE "QuotationStatus"
  USING (
    CASE "status"::text
      WHEN 'SCHEDULED' THEN 'UNDER_REVIEW'
      WHEN 'CLOSED' THEN 'REJECTED'
      ELSE "status"::text
    END
  )::"QuotationStatus";
ALTER TABLE "QuotationRequest" ALTER COLUMN "status" SET DEFAULT 'NEW';

DROP TYPE "DemoStatus";

-- Product context captured when a quotation is requested from a product page.
ALTER TABLE "QuotationRequest"
  ADD COLUMN "productId" TEXT,
  ADD COLUMN "productName" TEXT,
  ADD COLUMN "productSlug" TEXT,
  ADD COLUMN "productImage" TEXT,
  ADD COLUMN "quantity" TEXT;
