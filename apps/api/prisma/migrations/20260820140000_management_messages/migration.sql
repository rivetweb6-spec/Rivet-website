-- Management messages on the public homepage (General Manager + Engineering Manager).

ALTER TABLE "HomePageContent" ADD COLUMN "gmName" TEXT;
ALTER TABLE "HomePageContent" ADD COLUMN "gmPosition" TEXT;
ALTER TABLE "HomePageContent" ADD COLUMN "gmPhoto" TEXT;
ALTER TABLE "HomePageContent" ADD COLUMN "gmMessage" TEXT;
ALTER TABLE "HomePageContent" ADD COLUMN "engName" TEXT;
ALTER TABLE "HomePageContent" ADD COLUMN "engPosition" TEXT;
ALTER TABLE "HomePageContent" ADD COLUMN "engPhoto" TEXT;
ALTER TABLE "HomePageContent" ADD COLUMN "engMessage" TEXT;
