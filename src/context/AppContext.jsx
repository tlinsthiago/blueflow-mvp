import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { technicianStatuses } from '../data/mockData';
import { normalizeCondominium, normalizeContract } from '../utils/contractHelpers';
import { normalizeVisit } from '../utils/visitHelpers';
import { getStoredToken, getStoredUser, onUnauthorized } from '../services/apiClient';
import * as authService from '../services/authService';
import { condominiumService } from '../services/condominiumService';
import { technicianService } from '../services/technicianService';
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
};

const initialDomainErrors = {
  condominiums: '',
  technicians: '',
};

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

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    loadCondominiums();
    loadTechnicians();
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
      loadCondominiums,
      loadTechnicians,
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
        notify('success', 'Dados da empresa atualizados no cache local da sessão.');
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
      saveVisit(payload) {
        const normalizedVisit = normalizeVisit({
          ...payload,
          id: payload.id ?? crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
          createdAt: payload.createdAt ?? new Date().toISOString(),
        });

        setDataState((current) => {
          const exists = current.visits.some((item) => item.id === normalizedVisit.id);
          const nextVisits = exists
            ? current.visits.map((item) => (item.id === normalizedVisit.id ? normalizedVisit : item))
            : [normalizedVisit, ...current.visits];

          let nextReports = current.reports;
          const reportExists = current.reports.some((report) => report.visitId === normalizedVisit.id);

          if (normalizedVisit.visitStatus === 'Concluída' && !reportExists) {
            nextReports = [
              {
                id: crypto.randomUUID(),
                visitId: normalizedVisit.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              ...current.reports,
            ];
          }

          return {
            ...current,
            visits: nextVisits,
            reports: nextReports,
          };
        });

        notify('success', payload.id ? 'Visita técnica atualizada no cache local da sessão.' : 'Visita técnica cadastrada no cache local da sessão.');
        return normalizedVisit.id;
      },
      deleteVisit(id) {
        setDataState((current) => ({
          ...current,
          visits: current.visits.filter((item) => item.id !== id),
          reports: current.reports.filter((item) => item.visitId !== id),
        }));
        notify('success', 'Visita técnica excluída do cache local da sessão.');
        return true;
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
        notify('success', 'Relatório gerado no cache local da sessão.');
        return reportId;
      },
      updateReport(id) {
        setDataState((current) => ({
          ...current,
          reports: current.reports.map((item) =>
            item.id === id ? { ...item, updatedAt: new Date().toISOString() } : item
          ),
        }));
        notify('success', 'Relatório atualizado no cache local da sessão.');
        return true;
      },
      deleteReport(id) {
        setDataState((current) => ({
          ...current,
          reports: current.reports.filter((item) => item.id !== id),
        }));
        notify('success', 'Relatório excluído do cache local da sessão.');
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
        notify('success', 'Contrato cadastrado no cache local da sessão.');
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
        notify('success', 'Contrato atualizado no cache local da sessão.');
      },
      deleteContract(id) {
        setDataState((current) => ({
          ...current,
          contracts: current.contracts.filter((item) => item.id !== id),
        }));
        notify('success', 'Contrato excluído do cache local da sessão.');
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
