-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('scheduled', 'in_progress', 'completed', 'pending', 'cancelled');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('normal', 'attention', 'critical');

-- AlterTable: visits
ALTER TABLE "visits" RENAME COLUMN "visitStatus" TO "status";
ALTER TABLE "visits" RENAME COLUMN "outsideScope" TO "issuesFound";
ALTER TABLE "visits" RENAME COLUMN "improvements" TO "improvementsSuggested";
ALTER TABLE "visits" ADD COLUMN "notes" TEXT;
ALTER TABLE "visits"
  DROP COLUMN "responsiblePhone",
  DROP COLUMN "equipmentValue",
  DROP COLUMN "acknowledged",
  DROP COLUMN "acknowledgedAt";

ALTER TABLE "visits"
  ALTER COLUMN "status" TYPE "VisitStatus"
  USING (
    CASE
      WHEN "status" = 'scheduled' THEN 'scheduled'
      WHEN "status" = 'in_progress' THEN 'in_progress'
      WHEN "status" = 'completed' THEN 'completed'
      WHEN "status" = 'pending' THEN 'pending'
      WHEN "status" = 'cancelled' THEN 'cancelled'
      WHEN "status" = 'Agendada' THEN 'scheduled'
      WHEN "status" = 'Em andamento' THEN 'in_progress'
      WHEN "status" = 'Concluída' THEN 'completed'
      WHEN "status" = 'Pendente' THEN 'pending'
      WHEN "status" = 'Cancelada' THEN 'cancelled'
      ELSE 'pending'
    END::"VisitStatus"
  );

ALTER TABLE "visits" ALTER COLUMN "status" SET DEFAULT 'scheduled';

-- AlterTable: visit_checklist_items
ALTER TABLE "visit_checklist_items" RENAME COLUMN "equipmentLabel" TO "equipment";
ALTER TABLE "visit_checklist_items" RENAME COLUMN "observations" TO "notes";

ALTER TABLE "visit_checklist_items"
  ALTER COLUMN "status" TYPE "ChecklistStatus"
  USING (
    CASE
      WHEN "status" = 'normal' THEN 'normal'
      WHEN "status" = 'attention' THEN 'attention'
      WHEN "status" = 'critical' THEN 'critical'
      WHEN "status" = 'Normal' THEN 'normal'
      WHEN "status" = 'Atenção' THEN 'attention'
      WHEN "status" = 'Crítico' THEN 'critical'
      ELSE 'normal'
    END::"ChecklistStatus"
  );

ALTER TABLE "visit_checklist_items" ALTER COLUMN "status" SET DEFAULT 'normal';

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");
