-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager', 'collaborator');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'collaborator',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "cnpj" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "legalRepresentative" TEXT,
    "representativeCpf" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condominiums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "cnpj" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "managerName" TEXT,
    "managerCpf" TEXT,
    "managerPhone" TEXT,
    "managerEmail" TEXT,
    "units" INTEGER NOT NULL DEFAULT 0,
    "monthlyWindow" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condominiums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "visitStatus" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "responsibleName" TEXT,
    "responsiblePhone" TEXT,
    "responsibleRole" TEXT,
    "equipmentValue" DECIMAL(12,2),
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "actionsPerformed" TEXT,
    "outsideScope" TEXT,
    "improvements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_checklist_items" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "equipmentLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "observations" TEXT,

    CONSTRAINT "visit_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_photos" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "fileId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "monthlyValue" DECIMAL(12,2),
    "dueDay" INTEGER,
    "termMonths" INTEGER,
    "startDate" TIMESTAMP(3),
    "signatureDate" TIMESTAMP(3),
    "monthlyPreventiveVisits" INTEGER,
    "emergencySlaHours" INTEGER,
    "nonEmergencySlaHours" INTEGER,
    "jurisdiction" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Rascunho',
    "notes" TEXT,
    "signedFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT,
    "sizeBytes" INTEGER,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "visits_condominiumId_idx" ON "visits"("condominiumId");

-- CreateIndex
CREATE INDEX "visits_technicianId_idx" ON "visits"("technicianId");

-- CreateIndex
CREATE INDEX "visits_visitDate_idx" ON "visits"("visitDate");

-- CreateIndex
CREATE INDEX "visit_checklist_items_visitId_idx" ON "visit_checklist_items"("visitId");

-- CreateIndex
CREATE INDEX "visit_photos_visitId_idx" ON "visit_photos"("visitId");

-- CreateIndex
CREATE INDEX "visit_photos_fileId_idx" ON "visit_photos"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_visitId_key" ON "reports"("visitId");

-- CreateIndex
CREATE INDEX "contracts_condominiumId_idx" ON "contracts"("condominiumId");

-- CreateIndex
CREATE INDEX "contracts_signedFileId_idx" ON "contracts"("signedFileId");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_checklist_items" ADD CONSTRAINT "visit_checklist_items_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_photos" ADD CONSTRAINT "visit_photos_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_photos" ADD CONSTRAINT "visit_photos_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_signedFileId_fkey" FOREIGN KEY ("signedFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
