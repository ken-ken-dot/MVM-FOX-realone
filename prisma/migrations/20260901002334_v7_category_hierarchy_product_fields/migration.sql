/*
  Warnings:

  - You are about to drop the column `changes` on the `AuditLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "changes";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productType" TEXT NOT NULL DEFAULT 'physical',
ADD COLUMN     "specs" JSONB,
ADD COLUMN     "story" TEXT;

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
