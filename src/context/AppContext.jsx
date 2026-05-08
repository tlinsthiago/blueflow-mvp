import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialData, technicianStatuses } from '../data/mockData';
import { normalizeCompanySettings, normalizeCondominium, normalizeContract } from '../utils/contractHelpers';
import { normalizeVisit } from '../utils/visitHelpers';

const STORAGE_KEY = 'blueflow-condo-care';
const AppContext = createContext(null);

function normalizeMonthlyWindow(value) {
  const map = {
    'First week': 'Primeira semana',
    'Second week': 'Segunda semana',
    'Third week': 'Terceira semana',
    'Fourth week': 'Quarta semana',
  };

  return map[value] ?? value;
}

function normalizeState(rawState) {
  const merged = {
    ...initialData,
    ...rawState,
  };

  const companySettings = normalizeCompanySettings(merged.companySettings ?? initialData.companySettings);

  const condominiums = (merged.condominiums ?? initialData.condominiums).map((condominium) =>
    normalizeCondominium({
      ...condominium,
      monthlyWindow: normalizeMonthlyWindow(condominium.monthlyWindow),
      createdAt: condominium.createdAt ?? new Date().toISOString(),
    })
  );

  const technicians = (merged.technicians ?? initialData.technicians).map((technician) => ({
    ...technician,
    role: technician.role ?? technician.specialty ?? 'Técnico de Campo',
    specialty: technician.specialty ?? technician.role ?? '',
    status:
      technician.status ??
      (technician.active === false ? technicianStatuses[1] : technicianStatuses[0]),
    notes: technician.notes ?? '',
    createdAt: technician.createdAt ?? new Date().toISOString(),
  }));

  const visits = (merged.visits ?? initialData.visits).map(normalizeVisit);
  const contracts = (merged.contracts ?? initialData.contracts ?? []).map(normalizeContract);
  const persistedReports = merged.reports ?? [];

  const reports =
    persistedReports.length > 0
      ? persistedReports.map((report) => ({
          ...report,
          createdAt: report.createdAt ?? new Date().toISOString(),
          updatedAt: report.updatedAt ?? report.createdAt ?? new Date().toISOString(),
        }))
      : visits
          .filter((visit) => visit.visitStatus === 'Concluída')
          .map((visit) => ({
            id: `report-${visit.id}`,
            visitId: visit.id,
            createdAt: visit.updatedAt ?? visit.visitDate,
            updatedAt: visit.updatedAt ?? visit.visitDate,
          }));

  return {
    companySettings,
    condominiums,
    technicians,
    visits,
    reports,
    contracts,
    isAuthenticated: rawState?.isAuthenticated ?? false,
  };
}

function readStoredState() {
  if (typeof window === 'undefined') {
    return normalizeState(initialData);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return normalizeState(initialData);
  }

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return normalizeState(initialData);
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(readStoredState);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function notify(type, message) {
    const id = crypto.randomUUID();
    setNotifications((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
    }, 3500);
  }

  const value = useMemo(
    () => ({
      ...state,
      notifications,
      login() {
        setState((current) => ({ ...current, isAuthenticated: true }));
      },
      logout() {
        setState((current) => ({ ...current, isAuthenticated: false }));
      },
      dismissNotification(id) {
        setNotifications((current) => current.filter((item) => item.id !== id));
      },
      updateCompanySettings(payload) {
        setState((current) => ({
          ...current,
          companySettings: normalizeCompanySettings(payload),
        }));
        notify('success', 'Dados da empresa atualizados com sucesso.');
      },
      createCondominium(payload) {
        setState((current) => ({
          ...current,
          condominiums: [
            normalizeCondominium({
              id: crypto.randomUUID(),
              ...payload,
              units: Number(payload.units) || 0,
              createdAt: new Date().toISOString(),
            }),
            ...current.condominiums,
          ],
        }));
        notify('success', 'Condomínio cadastrado com sucesso.');
      },
      updateCondominium(id, payload) {
        setState((current) => ({
          ...current,
          condominiums: current.condominiums.map((item) =>
            item.id === id ? normalizeCondominium({ ...item, ...payload, units: Number(payload.units) || 0 }) : item
          ),
        }));
        notify('success', 'Condomínio atualizado com sucesso.');
      },
      deleteCondominium(id) {
        const hasVisits = state.visits.some((visit) => visit.condominiumId === id);
        const hasContracts = state.contracts.some((contract) => contract.condominiumId === id);
        if (hasVisits || hasContracts) {
          notify('error', 'Não foi possível excluir. Este condomínio possui vínculos com visitas ou contratos.');
          return false;
        }

        setState((current) => ({
          ...current,
          condominiums: current.condominiums.filter((item) => item.id !== id),
        }));
        notify('success', 'Condomínio excluído com sucesso.');
        return true;
      },
      createTechnician(payload) {
        setState((current) => ({
          ...current,
          technicians: [
            {
              id: crypto.randomUUID(),
              ...payload,
              specialty: payload.role,
              createdAt: new Date().toISOString(),
            },
            ...current.technicians,
          ],
        }));
        notify('success', 'Técnico cadastrado com sucesso.');
      },
      updateTechnician(id, payload) {
        setState((current) => ({
          ...current,
          technicians: current.technicians.map((item) =>
            item.id === id ? { ...item, ...payload, specialty: payload.role } : item
          ),
        }));
        notify('success', 'Técnico atualizado com sucesso.');
      },
      deleteTechnician(id) {
        const hasVisits = state.visits.some((visit) => visit.technicianId === id);
        if (hasVisits) {
          notify('error', 'Não foi possível excluir. Este técnico possui visitas técnicas vinculadas.');
          return false;
        }

        setState((current) => ({
          ...current,
          technicians: current.technicians.filter((item) => item.id !== id),
        }));
        notify('success', 'Técnico excluído com sucesso.');
        return true;
      },
      saveVisit(payload) {
        const normalizedVisit = normalizeVisit({
          ...payload,
          id: payload.id ?? crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
          createdAt: payload.createdAt ?? new Date().toISOString(),
        });

        setState((current) => {
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

        notify('success', payload.id ? 'Visita técnica atualizada com sucesso.' : 'Visita técnica cadastrada com sucesso.');
        return normalizedVisit.id;
      },
      deleteVisit(id) {
        setState((current) => ({
          ...current,
          visits: current.visits.filter((item) => item.id !== id),
          reports: current.reports.filter((item) => item.visitId !== id),
        }));
        notify('success', 'Visita técnica excluída com sucesso.');
        return true;
      },
      generateReport(visitId) {
        const reportExists = state.reports.some((report) => report.visitId === visitId);
        if (reportExists) {
          notify('success', 'Relatório já estava disponível para esta visita técnica.');
          return state.reports.find((report) => report.visitId === visitId)?.id ?? null;
        }

        const visit = state.visits.find((item) => item.id === visitId);
        if (!visit) {
          notify('error', 'Visita técnica não encontrada para gerar relatório.');
          return null;
        }

        const reportId = crypto.randomUUID();
        setState((current) => ({
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
        setState((current) => ({
          ...current,
          reports: current.reports.map((item) =>
            item.id === id ? { ...item, updatedAt: new Date().toISOString() } : item
          ),
        }));
        notify('success', 'Relatório atualizado com sucesso.');
        return true;
      },
      deleteReport(id) {
        setState((current) => ({
          ...current,
          reports: current.reports.filter((item) => item.id !== id),
        }));
        notify('success', 'Relatório excluído com sucesso.');
        return true;
      },
      createContract(payload) {
        setState((current) => ({
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
        setState((current) => ({
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
        setState((current) => ({
          ...current,
          contracts: current.contracts.filter((item) => item.id !== id),
        }));
        notify('success', 'Contrato excluído com sucesso.');
        return true;
      },
    }),
    [notifications, state]
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
