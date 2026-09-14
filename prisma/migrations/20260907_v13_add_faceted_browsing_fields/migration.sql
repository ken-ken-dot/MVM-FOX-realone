-- AlterTable: Add tags, platform, licenseType to Product
ALTER TABLE "Product" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN "platform" TEXT;
ALTER TABLE "Product" ADD COLUMN "licenseType" TEXT;

-- AlterTable: Add tier, eventTypeId to CateringPackage
ALTER TABLE "CateringPackage" ADD COLUMN "tier" TEXT;
ALTER TABLE "CateringPackage" ADD COLUMN "eventTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "CateringPackage" ADD CONSTRAINT "CateringPackage_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "CateringEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
