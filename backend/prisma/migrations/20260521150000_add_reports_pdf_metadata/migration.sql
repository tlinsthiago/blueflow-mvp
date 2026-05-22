-- AlterEnum
ALTER TYPE "FileType" ADD VALUE IF NOT EXISTS 'technical_report_pdf';

-- AlterTable
ALTER TABLE "reports"
ADD COLUMN IF NOT EXISTS "fileId" TEXT,
ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "reports_fileId_key" ON "reports"("fileId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reports_fileId_idx" ON "reports"("fileId");

-- AddForeignKey
ALTER TABLE "reports"
ADD CONSTRAINT "reports_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
