-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('reservoir_photo', 'pump_photo', 'electrical_panel_photo', 'signed_acceptance_term', 'other');

-- AlterTable
ALTER TABLE "files"
ADD COLUMN "visitId" TEXT,
ADD COLUMN "fileType" "FileType" NOT NULL DEFAULT 'other',
ADD COLUMN "url" TEXT,
ADD COLUMN "size" INTEGER,
ADD COLUMN "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "uploadedBy" TEXT;

-- Backfill new metadata columns from legacy columns when available.
UPDATE "files"
SET
  "url" = COALESCE("url", "publicUrl"),
  "size" = COALESCE("size", "sizeBytes");

-- CreateIndex
CREATE INDEX "files_visitId_idx" ON "files"("visitId");

-- CreateIndex
CREATE INDEX "files_fileType_idx" ON "files"("fileType");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
