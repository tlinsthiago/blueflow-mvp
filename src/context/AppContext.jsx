import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { technicianStatuses } from '../data/mockData';
import { normalizeCondominium, normalizeContract } from '../utils/contractHelpers';
import { normalizeVisit } from '../utils/visitHelpers';
import { getStoredToken, getStoredUser, onUnauthorized } from '../services/apiClient';
import * as authService from '../services/authService';
import { condominiumService } from '../services/condominiumService';
import { technicianService } from '../services/technicianService';
import { visitService } from '../services/visitService';
import { fullAccessRoles, hasAnyRole } from '../auth/permissions';

const AppContext = createContext(null);
const LEGACY_STORAGE_KEY = 'blueflow-condo-care';

const emptyCompanySettings = {
  legalName: '',
  cnpj: '',
  addressLine: '',
  city: '',
  state: '',
  legalRepresentative: '',
  representativeCpf: '',
  phone: '',
  email: '',
};

const emptyDataState = {
  companySettings: emptyCompanySettings,
  condominiums: [],
  technicians: [],
  visits: [],
  reports: [],
  contracts: [],
};

const initialDomainLoading = {
  condominiums: false,
  technicians: false,
  visits: false,
};

const initialDomainErrors = {
  condominiums: '',
  technicians: '',
  visits: '',
};

const visitStatusToApi = {
  Agendada: 'scheduled',
  'Em andamento': 'in_progress',
  Concluída: 'completed',
  Pendente: 'pending',
  Cancelada: 'cancelled',
};

const visitStatusFromApi = {
  scheduled: 'Agendada',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  pending: 'Pendente',
  cancelled: 'Cancelada',
};

const checklistStatusToApi = {
  Normal: 'normal',
  Atenção: 'attention',
  Crítico: 'critical',
};

const checklistStatusFromApi = {
  normal: 'Normal',
  attention: 'Atenção',
  critical: 'Crítico',
};

function normalizeVisitFile(payload) {
  return {
    id: payload.id,
    visitId: payload.visitId,
    fileName: payload.fileName,
    name: payload.fileName,
    fileType: payload.fileType ?? payload.category ?? 'other',
    mimeType: payload.mimeType,
    size: payload.size ?? payload.sizeBytes ?? 0,
    url: payload.url ?? payload.publicUrl,
    uploadedAt: payload.uploadedAt ?? payload.createdAt,
    uploadedBy: payload.uploadedBy ?? '',
  };
}

function normalizeApiCondominium(payload) {
  return normalizeCondominium({
    ...payload,
    manager: payload.manager ?? payload.managerName ?? '',
  });
}

function toCondominiumPayload(payload) {
  return {
    name: payload.name,
    legalName: payload.legalName,
    cnpj: payload.cnpj,
    addressLine: payload.addressLine,
    city: payload.city,
    state: payload.state,
    managerName: payload.manager ?? payload.managerName,
    managerCpf: payload.managerCpf,
    managerPhone: payload.managerPhone,
    managerEmail: payload.managerEmail,
    units: Number(payload.units) || 0,
    monthlyWindow: payload.monthlyWindow,
    status: payload.status ?? 'Ativo',
  };
}

function normalizeTechnician(payload) {
  return {
    ...payload,
    role: payload.role ?? payload.specialty ?? 'Técnico de Campo',
    specialty: payload.specialty ?? payload.role ?? '',
    status: payload.status ?? technicianStatuses[0],
    notes: payload.notes ?? '',
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };
}

function normalizeApiVisit(payload) {
  return normalizeVisit({
    ...payload,
    visitStatus: visitStatusFromApi[payload.status] ?? payload.visitStatus ?? 'Pendente',
    responsible: {
      name: payload.acceptanceResponsibleName ?? payload.responsibleName ?? '',
      phone: payload.responsible?.phone ?? '',
      role: payload.acceptanceResponsibleRole ?? payload.responsibleRole ?? '',
      equipmentValue: payload.equipmentValue ?? '',
      acknowledged: payload.acceptanceConfirmed ?? false,
      acknowledgedAt: payload.status === 'completed' ? payload.updatedAt ?? payload.visitDate : '',
    },
    checklist: (payload.checklistItems ?? payload.checklist ?? []).map((item) => ({
      label: item.equipment ?? item.label,
      status: checklistStatusFromApi[item.status] ?? item.status ?? 'Normal',
      observations: item.notes ?? item.observations ?? '',
    })),
    actionsPerformed: payload.actionsPerformed ?? '',
    outsideScope: payload.issuesFound ?? payload.outsideScope ?? '',
    improvements: payload.improvementsSuggested ?? payload.improvements ?? '',
    installationLocation: payload.installationLocation ?? '',
    acceptanceNotes: payload.acceptanceNotes ?? '',
    files: (payload.files ?? []).map(normalizeVisitFile),
    photos: (payload.files ?? []).filter((file) => file.mimeType?.startsWith('image/')).map(normalizeVisitFile),
  });
}

function toVisitPayload(payload) {
  return {
    condominiumId: payload.condominiumId,
    technicianId: payload.technicianId,
    serviceType: payload.serviceType,
    status: visitStatusToApi[payload.visitStatus] ?? payload.status ?? 'scheduled',
    visitDate: payload.visitDate,
    responsibleName: payload.responsible?.name ?? payload.responsibleName,
    responsibleRole: payload.responsible?.role ?? payload.responsibleRole,
    acceptanceConfirmed: payload.responsible?.acknowledged ?? payload.acceptanceConfirmed ?? false,
    acceptanceResponsibleName: payload.responsible?.name ?? payload.acceptanceResponsibleName ?? payload.responsibleName,
    acceptanceResponsibleRole: payload.responsible?.role ?? payload.acceptanceResponsibleRole ?? payload.responsibleRole,
    installationLocation: payload.installationLocation ?? '',
    equipmentValue:
      payload.responsible?.equipmentValue === '' || payload.responsible?.equipmentValue == null
        ? null
        : Number(payload.responsible.equipmentValue),
    acceptanceNotes: payload.acceptanceNotes ?? '',
    notes: payload.notes ?? '',
    actionsPerformed: payload.actionsPerformed ?? '',
    issuesFound: payload.outsideScope ?? payload.issuesFound ?? '',
    improvementsSuggested: payload.improvements ?? payload.improvementsSuggested ?? '',
    checklistItems: (payload.checklist ?? payload.checklistItems ?? []).map((item) => ({
      equipment: item.label ?? item.equipment,
      status: checklistStatusToApi[item.status] ?? item.status ?? 'normal',
      notes: item.observations ?? item.notes ?? '',
    })),
  };
}

export function AppProvider({ children }) {
  const [dataState, setDataState] = useState(emptyDataState);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [authLoading, setAuthLoading] = useState(Boolean(getStoredToken()));
  const [domainLoading, setDomainLoading] = useState(initialDomainLoading);
  const [domainErrors, setDomainErrors] = useState(initialDomainErrors);
  const [notifications, setNotifications] = useState([]);

  const isAuthenticated = Boolean(token && currentUser);

  function notify(type, message) {
    const id = crypto.randomUUID();
    setNotifications((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
    }, 3500);
  }

  function clearAuthState() {
    authService.clearSession();
    setToken(null);
    setCurrentUser(null);
    setDataState(emptyDataState);
  }

  useEffect(() => {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    onUnauthorized(() => {
      clearAuthState();
      notify('error', 'Sessão expirada. Faça login novamente.');
    });
  }, []);

  async function loadCondominiums() {
    setDomainLoading((current) => ({ ...current, condominiums: true }));
    setDomainErrors((current) => ({ ...current, condominiums: '' }));

    try {
      const payload = await condominiumService.list({ pageSize: 100 });
      const condominiums = (payload.data ?? []).map(normalizeApiCondominium);
      setDataState((current) => ({ ...current, condominiums }));
      return condominiums;
    } catch (error) {
      setDomainErrors((current) => ({ ...current, condominiums: error.message }));
      notify('error', error.message);
      return [];
    } finally {
      setDomainLoading((current) => ({ ...current, condominiums: false }));
    }
  }

  async function loadTechnicians() {
    setDomainLoading((current) => ({ ...current, technicians: true }));
    setDomainErrors((current) => ({ ...current, technicians: '' }));

    try {
      const payload = await technicianService.list({ pageSize: 100 });
      const technicians = (payload.data ?? []).map(normalizeTechnician);
      setDataState((current) => ({ ...current, technicians }));
      return technicians;
    } catch (error) {
      setDomainErrors((current) => ({ ...current, technicians: error.message }));
      notify('error', error.message);
      return [];
    } finally {
      setDomainLoading((current) => ({ ...current, technicians: false }));
    }
  }

  async function loadVisits() {
    setDomainLoading((current) => ({ ...current, visits: true }));
    setDomainErrors((current) => ({ ...current, visits: '' }));

    try {
      const payload = await visitService.list({ pageSize: 100 });
      const visits = (payload.data ?? []).map(normalizeApiVisit);
      setDataState((current) => ({ ...current, visits }));
      return visits;
    } catch (error) {
      setDomainErrors((current) => ({ ...current, visits: error.message }));
      notify('error', error.message);
      return [];
    } finally {
      setDomainLoading((current) => ({ ...current, visits: false }));
    }
  }

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    loadCondominiums();
    loadTechnicians();
    loadVisits();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const user = await authService.getMe();
        if (isMounted) {
          setToken(storedToken);
          setCurrentUser(user);
        }
      } catch {
        if (isMounted) {
          clearAuthState();
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      ...dataState,
      token,
      currentUser,
      authLoading,
      domainLoading,
      domainErrors,
      isAuthenticated,
      notifications,
      hasRole(allowedRoles) {
        return hasAnyRole(currentUser, allowedRoles);
      },
      canWriteDomain() {
        return hasAnyRole(currentUser, fullAccessRoles);
      },
      canDeleteVisits() {
        return hasAnyRole(currentUser, fullAccessRoles);
      },
      canDeleteVisitFiles() {
        return hasAnyRole(currentUser, fullAccessRoles);
      },
      loadCondominiums,
      loadTechnicians,
      loadVisits,
      async login(credentials) {
        const session = await authService.login(credentials);
        setToken(session.token);
        setCurrentUser(session.user);
        notify('success', 'Login realizado com sucesso.');
        return session.user;
      },
      logout() {
        clearAuthState();
      },
      dismissNotification(id) {
        setNotifications((current) => current.filter((item) => item.id !== id));
      },
      updateCompanySettings(payload) {
        setDataState((current) => ({
          ...current,
          companySettings: {
            ...emptyCompanySettings,
            ...payload,
          },
        }));
        notify('success', 'Dados da empresa atualizados com sucesso.');
      },
      async createCondominium(payload) {
        try {
          const response = await condominiumService.create(toCondominiumPayload(payload));
          const condominium = normalizeApiCondominium(response.data);
          setDataState((current) => ({
            ...current,
            condominiums: [condominium, ...current.condominiums],
          }));
          notify('success', 'Condomínio cadastrado com sucesso.');
          return condominium;
        } catch (error) {
          notify('error', error.message);
          throw error;
        }
      },
      async updateCondominium(id, payload) {
        try {
          const response = await condominiumService.update(id, toCondominiumPayload(payload));
          const condominium = normalizeApiCondominium(response.data);
          setDataState((current) => ({
            ...current,
            condominiums: current.condominiums.map((item) => (item.id === id ? condominium : item)),
          }));
          notify('success', 'Condomínio atualizado com sucesso.');
          return condominium;
        } catch (error) {
          notify('error', error.message);
          throw error;
        }
      },
      async deleteCondominium(id) {
        try {
          await condominiumService.remove(id);
          setDataState((current) => ({
            ...current,
            condominiums: current.condominiums.filter((item) => item.id !== id),
          }));
          notify('success', 'Condomínio excluído com sucesso.');
          return true;
        } catch (error) {
          notify('error', error.message);
          return false;
        }
      },
      async createTechnician(payload) {
        try {
          const response = await technicianService.create(payload);
          const technician = normalizeTechnician(response.data);
          setDataState((current) => ({
            ...current,
            technicians: [technician, ...current.technicians],
          }));
          notify('success', 'Técnico cadastrado com sucesso.');
          return technician;
        } catch (error) {
          notify('error', error.message);
          throw error;
        }
      },
      async updateTechnician(id, payload) {
        try {
          const response = await technicianService.update(id, payload);
          const technician = normalizeTechnician(response.data);
          setDataState((current) => ({
            ...current,
            technicians: current.technicians.map((item) => (item.id === id ? technician : item)),
          }));
          notify('success', 'Técnico atualizado com sucesso.');
          return technician;
        } catch (error) {
          notify('error', error.message);
          throw error;
        }
      },
      async deleteTechnician(id) {
        try {
          await technicianService.remove(id);
          setDataState((current) => ({
            ...current,
            technicians: current.technicians.filter((item) => item.id !== id),
          }));
          notify('success', 'Técnico excluído com sucesso.');
          return true;
        } catch (error) {
          notify('error', error.message);
          return false;
        }
      },
      async saveVisit(payload) {
        try {
          const requestPayload = toVisitPayload(payload);
          const response = payload.id
            ? await visitService.update(payload.id, requestPayload)
            : await visitService.create(requestPayload);
          const normalizedVisit = normalizeApiVisit(response.data);

          setDataState((current) => {
            const exists = current.visits.some((item) => item.id === normalizedVisit.id);
            const nextVisits = exists
              ? current.visits.map((item) => (item.id === normalizedVisit.id ? normalizedVisit : item))
              : [normalizedVisit, ...current.visits];

            return {
              ...current,
              visits: nextVisits,
            };
          });

          notify('success', payload.id ? 'Visita técnica atualizada com sucesso.' : 'Visita técnica cadastrada com sucesso.');
          return normalizedVisit.id;
        } catch (error) {
          notify('error', error.message);
          throw error;
        }
      },
      async deleteVisit(id) {
        try {
          await visitService.remove(id);
          setDataState((current) => ({
            ...current,
            visits: current.visits.filter((item) => item.id !== id),
            reports: current.reports.filter((item) => item.visitId !== id),
          }));
          notify('success', 'Visita técnica excluída com sucesso.');
          return true;
        } catch (error) {
          notify('error', error.message);
          return false;
        }
      },
      async uploadVisitFile(visitId, file, fileType) {
        try {
          const response = await visitService.uploadFile(visitId, { file, fileType });
          const uploadedFile = normalizeVisitFile(response.data);
          setDataState((current) => ({
            ...current,
            visits: current.visits.map((visit) =>
              visit.id === visitId
                ? {
                    ...visit,
                    files: [uploadedFile, ...(visit.files ?? [])],
                    photos: uploadedFile.mimeType?.startsWith('image/')
                      ? [uploadedFile, ...(visit.photos ?? [])]
                      : visit.photos ?? [],
                  }
                : visit
            ),
          }));
          notify('success', 'Arquivo anexado com sucesso.');
          return uploadedFile;
        } catch (error) {
          notify('error', error.message);
          throw error;
        }
      },
      async deleteVisitFile(visitId, fileId) {
        try {
          await visitService.deleteFile(visitId, fileId);
          setDataState((current) => ({
            ...current,
            visits: current.visits.map((visit) =>
              visit.id === visitId
                ? {
                    ...visit,
                    files: (visit.files ?? []).filter((file) => file.id !== fileId),
                    photos: (visit.photos ?? []).filter((file) => file.id !== fileId),
                  }
                : visit
            ),
          }));
          notify('success', 'Arquivo removido com sucesso.');
          return true;
        } catch (error) {
          notify('error', error.message);
          return false;
        }
      },
      async openVisitFile(visitId, file) {
        try {
          const blob = await visitService.downloadFile(visitId, file.id);
          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
          link.target = '_blank';
          link.rel = 'noreferrer';
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
          return true;
        } catch (error) {
          notify('error', error.message);
          return false;
        }
      },
      generateReport(visitId) {
        const reportExists = dataState.reports.some((report) => report.visitId === visitId);
        if (reportExists) {
          notify('success', 'Relatório já estava disponível para esta visita técnica.');
          return dataState.reports.find((report) => report.visitId === visitId)?.id ?? null;
        }

        const visit = dataState.visits.find((item) => item.id === visitId);
        if (!visit) {
          notify('error', 'Visita técnica não encontrada para gerar relatório.');
          return null;
        }

        const reportId = crypto.randomUUID();
        setDataState((current) => ({
          ...current,
          reports: [
            {
              id: reportId,
              visitId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...current.reports,
          ],
        }));
        notify('success', 'Relatório gerado com sucesso.');
        return reportId;
      },
      updateReport(id) {
        setDataState((current) => ({
          ...current,
          reports: current.reports.map((item) =>
            item.id === id ? { ...item, updatedAt: new Date().toISOString() } : item
          ),
        }));
        notify('success', 'Relatório atualizado com sucesso.');
        return true;
      },
      deleteReport(id) {
        setDataState((current) => ({
          ...current,
          reports: current.reports.filter((item) => item.id !== id),
        }));
        notify('success', 'Relatório excluído com sucesso.');
        return true;
      },
      createContract(payload) {
        setDataState((current) => ({
          ...current,
          contracts: [
            normalizeContract({
              id: crypto.randomUUID(),
              ...payload,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
            ...current.contracts,
          ],
        }));
        notify('success', 'Contrato cadastrado com sucesso.');
      },
      updateContract(id, payload) {
        setDataState((current) => ({
          ...current,
          contracts: current.contracts.map((item) =>
            item.id === id
              ? normalizeContract({
                  ...item,
                  ...payload,
                  updatedAt: new Date().toISOString(),
                })
              : item
          ),
        }));
        notify('success', 'Contrato atualizado com sucesso.');
      },
      deleteContract(id) {
        setDataState((current) => ({
          ...current,
          contracts: current.contracts.filter((item) => item.id !== id),
        }));
        notify('success', 'Contrato excluído com sucesso.');
        return true;
      },
    }),
    [authLoading, currentUser, dataState, domainErrors, domainLoading, isAuthenticated, notifications, token]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
