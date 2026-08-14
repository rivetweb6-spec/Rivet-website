-- Persist whether an admin has opened/viewed a quotation request.
ALTER TABLE "QuotationRequest" ADD COLUMN "readAt" TIMESTAMP(3);

-- Requests already moved out of NEW have been reviewed; leave NEW rows unread.
UPDATE "QuotationRequest" SET "readAt" = "updatedAt" WHERE "status" <> 'NEW';

CREATE INDEX "QuotationRequest_readAt_idx" ON "QuotationRequest"("readAt");
