import { checklistStatuses, equipmentLabels, serviceTypes, visitStatuses } from '../data/mockData';
import { monthKey } from './formatters';

export function createEmptyVisit() {
  return {
    condominiumId: '',
    technicianId: '',
    visitDate: new Date().toISOString().slice(0, 16),
    type: serviceTypes[0],
    serviceType: serviceTypes[0],
    visitStatus: visitStatuses[0],
    responsible: {
      name: '',
      phone: '',
      role: '',
      equipmentValue: '',
      acknowledged: false,
      acknowledgedAt: '',
    },
    checklist: equipmentLabels.map((label) => ({
      label,
      status: checklistStatuses[0],
      observations: '',
    })),
    actionsPerformed: '',
    outsideScope: '',
    improvements: '',
    installationLocation: '',
    acceptanceNotes: '',
    photos: [],
    notifications: {
      whatsapp: true,
      email: true,
    },
  };
}

export function getMonthlyVisitStatus(condominiumId, visits) {
  const currentMonth = monthKey(new Date().toISOString());
  return visits.some(
    (visit) =>
      visit.condominiumId === condominiumId &&
      monthKey(visit.visitDate) === currentMonth &&
      visit.visitStatus === 'Concluída'
  )
    ? 'Concluído'
    : 'Pendente';
}

export function getChecklistOverallStatus(checklist) {
  if (!checklist?.length) {
    return 'Normal';
  }

  if (checklist.some((item) => item.status === 'Crítico')) {
    return 'Crítico';
  }

  if (checklist.some((item) => item.status === 'Atenção')) {
    return 'Atenção';
  }

  return 'Normal';
}

export function normalizeVisit(rawVisit) {
  const serviceType = rawVisit.serviceType ?? rawVisit.type ?? serviceTypes[0];
  const visitStatus =
    rawVisit.visitStatus ??
    (rawVisit.responsible?.acknowledged ? 'Concluída' : 'Pendente');

  return {
    ...createEmptyVisit(),
    ...rawVisit,
    type: serviceType,
    serviceType,
    visitStatus,
    checklist: rawVisit.checklist?.length ? rawVisit.checklist : createEmptyVisit().checklist,
    responsible: {
      ...createEmptyVisit().responsible,
      equipmentValue: rawVisit.equipmentValue ?? rawVisit.responsible?.equipmentValue ?? '',
      acknowledged: rawVisit.acceptanceConfirmed ?? rawVisit.responsible?.acknowledged ?? false,
      ...rawVisit.responsible,
    },
    installationLocation: rawVisit.installationLocation ?? '',
    acceptanceNotes: rawVisit.acceptanceNotes ?? '',
    notifications: {
      ...createEmptyVisit().notifications,
      ...rawVisit.notifications,
    },
    createdAt: rawVisit.createdAt ?? rawVisit.visitDate ?? new Date().toISOString(),
    updatedAt: rawVisit.updatedAt ?? rawVisit.visitDate ?? new Date().toISOString(),
  };
}
