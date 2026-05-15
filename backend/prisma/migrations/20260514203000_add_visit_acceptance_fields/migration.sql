-- AlterTable
ALTER TABLE "visits"
ADD COLUMN "acceptanceConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "acceptanceResponsibleName" TEXT,
ADD COLUMN "acceptanceResponsibleRole" TEXT,
ADD COLUMN "installationLocation" TEXT,
ADD COLUMN "equipmentValue" DECIMAL(12,2),
ADD COLUMN "acceptanceNotes" TEXT;
