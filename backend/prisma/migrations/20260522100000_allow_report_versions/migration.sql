-- DropIndex
DROP INDEX IF EXISTS "reports_visitId_key";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reports_visitId_idx" ON "reports"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "reports_visitId_version_key" ON "reports"("visitId", "version");
