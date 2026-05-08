import { useMemo, useState } from 'react';
import { ActionButtons } from '../components/ActionButtons';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { FilterPanel } from '../components/FilterPanel';
import { FormField } from '../components/FormField';
import { ModalShell } from '../components/ModalShell';
import { PageHeader } from '../components/PageHeader';
import { ReportPreview } from '../components/ReportPreview';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { serviceTypes } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { formatDate, isWithinDateRange } from '../utils/formatters';
import { getChecklistOverallStatus } from '../utils/visitHelpers';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 4;

export function ReportsPage() {
  const { reports, visits, condominiums, technicians, deleteReport, updateReport } = useAppContext();
  const [filters, setFilters] = useState({
    condominiumId: '',
    technicianId: '',
    serviceType: '',
    checklistStatus: '',
    startDate: '',
    endDate: '',
    search: '',
    sorting: 'recentes',
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const reportRows = useMemo(() => {
    const rows = reports
      .map((report) => {
        const visit = visits.find((item) => item.id === report.visitId);
        if (!visit) {
          return null;
        }

        const condominium = condominiums.find((item) => item.id === visit.condominiumId);
        const technician = technicians.find((item) => item.id === visit.technicianId);
        const checklistStatus = getChecklistOverallStatus(visit.checklist);
        return {
          report,
          visit,
          condominium,
          technician,
          checklistStatus,
          summarySearch: [visit.actionsPerformed, visit.outsideScope, visit.improvements]
            .join(' ')
            .toLowerCase(),
        };
      })
      .filter(Boolean);

    const search = filters.search.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      const matchesCondominium = !filters.condominiumId || row.condominium?.id === filters.condominiumId;
      const matchesTechnician = !filters.technicianId || row.technician?.id === filters.technicianId;
      const matchesServiceType = !filters.serviceType || row.visit.serviceType === filters.serviceType;
      const matchesChecklistStatus = !filters.checklistStatus || row.checklistStatus === filters.checklistStatus;
      const matchesDate = isWithinDateRange(row.visit.visitDate, filters.startDate, filters.endDate);
      const matchesSearch = !search || row.summarySearch.includes(search);
      return matchesCondominium && matchesTechnician && matchesServiceType && matchesChecklistStatus && matchesDate && matchesSearch;
    });

    filtered.sort((a, b) =>
      filters.sorting === 'antigos'
        ? new Date(a.visit.visitDate).getTime() - new Date(b.visit.visitDate).getTime()
        : new Date(b.visit.visitDate).getTime() - new Date(a.visit.visitDate).getTime()
    );

    return filtered;
  }, [condominiums, filters, reports, technicians, visits]);

  const visibleReports = reportRows.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Consulta escalável com filtros, ordenação e visualização resumida antes de abrir o relatório completo."
      />

      <FilterPanel title="Filtros de relatórios">
        <FormField label="Condomínio">
          <select
            value={filters.condominiumId}
            onChange={(event) => {
              setFilters((current) => ({ ...current, condominiumId: event.target.value }));
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="">Todos</option>
            {condominiums.map((condo) => (
              <option key={condo.id} value={condo.id}>
                {condo.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Técnico">
          <select
            value={filters.technicianId}
            onChange={(event) => {
              setFilters((current) => ({ ...current, technicianId: event.target.value }));
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="">Todos</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Tipo de serviço">
          <select
            value={filters.serviceType}
            onChange={(event) => {
              setFilters((current) => ({ ...current, serviceType: event.target.value }));
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="">Todos</option>
            {serviceTypes.map((serviceType) => (
              <option key={serviceType}>{serviceType}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Status do checklist">
          <select
            value={filters.checklistStatus}
            onChange={(event) => {
              setFilters((current) => ({ ...current, checklistStatus: event.target.value }));
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="">Todos</option>
            <option>Normal</option>
            <option>Atenção</option>
            <option>Crítico</option>
          </select>
        </FormField>
        <FormField label="Data inicial">
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => {
              setFilters((current) => ({ ...current, startDate: event.target.value }));
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          />
        </FormField>
        <FormField label="Data final">
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => {
              setFilters((current) => ({ ...current, endDate: event.target.value }));
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          />
        </FormField>
        <FormField label="Buscar por texto">
          <input
            value={filters.search}
            onChange={(event) => {
              setFilters((current) => ({ ...current, search: event.target.value }));
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Observação, problema ou melhoria"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          />
        </FormField>
        <FormField label="Ordenação">
          <select
            value={filters.sorting}
            onChange={(event) => {
              setFilters((current) => ({ ...current, sorting: event.target.value }));
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
          </select>
        </FormField>
      </FilterPanel>

      <SectionCard title="Resumo dos relatórios" subtitle={`${reportRows.length} relatório(s) disponível(is) conforme os filtros aplicados.`}>
        {visibleReports.length ? (
          <div className="space-y-4">
            {visibleReports.map((row) => (
              <div key={row.report.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{row.condominium?.name ?? 'Condomínio não identificado'}</h3>
                      <StatusBadge value={row.checklistStatus} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Data da visita: {formatDate(row.visit.visitDate)} • Técnico: {row.technician?.name ?? 'Não identificado'}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">Tipo de serviço: {row.visit.serviceType}</p>
                    <p className="mt-1 text-sm text-slate-500">Fotos anexadas: {row.visit.photos?.length ?? 0}</p>
                  </div>
                  <ActionButtons
                    actions={[
                      { label: 'Ver relatório completo', onClick: () => setDetailsItem(row) },
                      {
                        label: 'Editar',
                        onClick: () => {
                          updateReport(row.report.id);
                          navigate(`/app/visits/${row.visit.id}`);
                        },
                      },
                      { label: 'Excluir', onClick: () => setDeleteTarget(row), tone: 'danger' },
                    ]}
                  />
                </div>
              </div>
            ))}

            {visibleCount < reportRows.length ? (
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Carregar mais relatórios
              </button>
            ) : null}
          </div>
        ) : (
          <EmptyState
            title="Nenhum relatório encontrado"
            description="Ajuste os filtros ou gere novos relatórios a partir das visitas técnicas concluídas."
          />
        )}
      </SectionCard>

      <ModalShell
        open={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        title="Relatório completo"
        subtitle="Visualização detalhada para consulta operacional e apresentação ao cliente."
      >
        {detailsItem ? (
          <ReportPreview visit={detailsItem.visit} condominium={detailsItem.condominium} technician={detailsItem.technician} />
        ) : null}
      </ModalShell>

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteReport(deleteTarget.report.id);
            setDeleteTarget(null);
          }
        }}
        title="Excluir relatório"
        description="Esta ação remove apenas o relatório da listagem. A visita técnica permanece cadastrada para futuras edições e nova geração."
        confirmLabel="Excluir"
      />
    </div>
  );
}
