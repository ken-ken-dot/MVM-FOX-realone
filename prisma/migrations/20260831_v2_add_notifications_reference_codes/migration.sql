-- MVM FOX v2 Schema Migration
-- Adds: Notification model, referenceCode fields, FormDraft model, AuditLog before/after fields

-- 1. Add referenceCode to Order
ALTER TABLE "Order" ADD COLUMN "referenceCode" TEXT NOT NULL;
CREATE UNIQUE INDEX "Order_referenceCode_key" ON "Order"("referenceCode");

-- 2. Add referenceCode to ServiceRequest
ALTER TABLE "ServiceRequest" ADD COLUMN "referenceCode" TEXT NOT NULL;
CREATE UNIQUE INDEX "ServiceRequest_referenceCode_key" ON "ServiceRequest"("referenceCode");

-- 3. Add referenceCode to CateringRequest
ALTER TABLE "CateringRequest" ADD COLUMN "referenceCode" TEXT NOT NULL;
CREATE UNIQUE INDEX "CateringRequest_referenceCode_key" ON "CateringRequest"("referenceCode");

-- 4. Create Notification table
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- 5. Create FormDraft table
CREATE TABLE "FormDraft" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormDraft_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FormDraft_token_key" ON "FormDraft"("token");

-- 6. Enhance AuditLog with before/after fields
ALTER TABLE "AuditLog" ADD COLUMN "before" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN "after" JSONB;
