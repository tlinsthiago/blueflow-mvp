import { Download, FileText, Mail, MessageCircle, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { FilterPanel } from '../components/FilterPanel';
import { FormField } from '../components/FormField';
import { ModalShell } from '../components/ModalShell';
import { PageHeader } from '../components/PageHeader';
import { ReportPreview } from '../components/ReportPreview';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { formatDate, formatDateTime, isWithinDateRange } from '../utils/formatters';
import { getChecklistOverallStatus } from '../utils/visitHelpers';
import { buildReportShareContent, openShareLink } from '../utils/shareHelpers';

const PAGE_SIZE = 6;

export function ReportsPage() {
  const {
    reports,
    visits,
    condominiums,
    technicians,
    domainLoading,
    domainErrors,
    loadReports,
    openReport,
    deleteReport,
    canManageReports,
  } = useAppContext();
  const [filters, setFilters] = useState({
    condominiumId: '',
    technicianId: '',
    startDate: '',
    endDate: '',
    search: '',
    sorting: 'recentes',
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const canManageReportActions = canManageReports();

  const reportRows = useMemo(() => {
    const rows = reports
      .map((report) => {
        const visit = report.visit ?? visits.find((item) => item.id === report.visitId);
        if (!visit) {
          return null;
        }

        const condominium = visit.condominium ?? condominiums.find((item) => item.id === visit.condominiumId);
        const technician = visit.technician ?? technicians.find((item) => item.id === visit.technicianId);
        const checklistStatus = getChecklistOverallStatus(visit.checklist ?? []);
        const searchText = [
          condominium?.name,
          technician?.name,
          visit.serviceType,
          visit.actionsPerformed,
          visit.outsideScope,
          visit.improvements,
          report.file?.fileName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return {
          report,
          visit,
          condominium,
          technician,
          checklistStatus,
          searchText,
          isLatestVersion: !reports.some(
            (item) =>
              item.visitId === report.visitId &&
              ((item.version ?? 0) > (report.version ?? 0) ||
                ((item.version ?? 0) === (report.version ?? 0) &&
                  new Date(item.generatedAt ?? item.createdAt).getTime() > new Date(report.generatedAt ?? report.createdAt).getTime()))
          ),
        };
      })
      .filter(Boolean);

    const search = filters.search.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const matchesCondominium = !filters.condominiumId || row.condominium?.id === filters.condominiumId;
      const matchesTechnician = !filters.technicianId || row.technician?.id === filters.technicianId;
      const matchesDate = isWithinDateRange(row.report.generatedAt ?? row.report.createdAt, filters.startDate, filters.endDate);
      const matchesSearch = !search || row.searchText.includes(search);

      return matchesCondominium && matchesTechnician && matchesDate && matchesSearch;
    });

    filtered.sort((a, b) => {
      const firstDate = new Date(a.report.generatedAt ?? a.report.createdAt).getTime();
      const secondDate = new Date(b.report.generatedAt ?? b.report.createdAt).getTime();
      return filters.sorting === 'antigos' ? firstDate - secondDate : secondDate - firstDate;
    });

    return filtered;
  }, [condominiums, filters, reports, technicians, visits]);

  const visibleReports = reportRows.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios técnicos"
        description="Documentos profissionais gerados a partir das visitas, com PDF seguro para consulta e entrega ao condomínio."
        actions={
          <button
            type="button"
            onClick={() => loadReports()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={18} />
            Atualizar
          </button>
        }
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
        <FormField label="Emissão inicial">
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
        <FormField label="Emissão final">
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
        <FormField label="Buscar">
          <input
            value={filters.search}
            onChange={(event) => {
              setFilters((current) => ({ ...current, search: event.target.value }));
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Condomínio, técnico ou conteúdo técnico"
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

      {domainErrors.reports ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {domainErrors.reports}
        </div>
      ) : null}

      <SectionCard
        title="Relatórios emitidos"
        subtitle={domainLoading.reports ? 'Carregando relatórios...' : `${reportRows.length} relatório(s) encontrado(s).`}
      >
        {domainLoading.reports ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
            Carregando relatórios técnicos...
          </div>
        ) : visibleReports.length ? (
          <div className="space-y-4">
            {visibleReports.map((row) => (
              <div key={row.report.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText size={18} className="text-brand-600" />
                      <h3 className="font-semibold text-slate-900">{row.condominium?.name ?? 'Condomínio não identificado'}</h3>
                      <StatusBadge value={row.checklistStatus} />
                      {row.isLatestVersion ? <StatusBadge value="Mais recente" /> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Emitido em {formatDateTime(row.report.generatedAt ?? row.report.createdAt)} • Visita em {formatDate(row.visit.visitDate)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Técnico: {row.technician?.name ?? 'Não identificado'} • Serviço: {row.visit.serviceType}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Versão {row.report.version ?? 1} • {row.report.file?.fileName ?? 'PDF disponível'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailsItem(row)}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Ver resumo
                    </button>
                    <button
                      type="button"
                      onClick={() => openReport(row.report.id)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
                    >
                      <Download size={16} />
                      Abrir PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => openShareLink(buildReportShareContent(row).whatsappUrl)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <MessageCircle size={16} />
                      Enviar por WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => openShareLink(buildReportShareContent(row).emailUrl)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Mail size={16} />
                      Enviar por e-mail
                    </button>
                    {canManageReportActions ? (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Excluir
                      </button>
                    ) : null}
                  </div>
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
            title="Nenhum relatório técnico encontrado"
            description="Gere relatórios a partir das visitas técnicas para disponibilizar PDFs profissionais ao condomínio."
          />
        )}
      </SectionCard>

      <ModalShell
        open={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        title="Resumo do relatório"
        subtitle="Consulta rápida dos dados usados na emissão do PDF técnico."
      >
        {detailsItem ? (
          <ReportPreview visit={detailsItem.visit} condominium={detailsItem.condominium} technician={detailsItem.technician} />
        ) : null}
      </ModalShell>

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            const deleted = await deleteReport(deleteTarget.report.id);
            if (deleted) {
              setDeleteTarget(null);
            }
          }
        }}
        title="Excluir relatório técnico"
        description="Esta ação remove apenas a versão selecionada e o PDF vinculado. A visita técnica permanece cadastrada."
        confirmLabel="Excluir relatório"
      />
    </div>
  );
}
