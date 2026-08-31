-- MVM FOX v3: Add placeholder flag to Media for stock vs real asset tracking

ALTER TABLE "Media" ADD COLUMN "isPlaceholder" BOOLEAN NOT NULL DEFAULT false;
