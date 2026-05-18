import { PlusCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ActionButtons } from '../components/ActionButtons';
import { AcceptanceTermPreview } from '../components/AcceptanceTermPreview';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { FilterPanel } from '../components/FilterPanel';
import { FormField } from '../components/FormField';
import { ModalShell } from '../components/ModalShell';
import { PageHeader } from '../components/PageHeader';
import { ReportPreview } from '../components/ReportPreview';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { serviceTypes, visitStatuses } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { formatDateTime, isWithinDateRange } from '../utils/formatters';

export function VisitsPage() {
  const { visits, condominiums, technicians, deleteVisit, domainLoading, domainErrors, canDeleteVisits } = useAppContext();
  const [filters, setFilters] = useState({
    condominiumId: '',
    technicianId: '',
    visitStatus: '',
    serviceType: '',
    startDate: '',
    endDate: '',
  });
  const [detailsItem, setDetailsItem] = useState(null);
  const [termItem, setTermItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();
  const canDelete = canDeleteVisits();

  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const matchesCondominium = !filters.condominiumId || visit.condominiumId === filters.condominiumId;
      const matchesTechnician = !filters.technicianId || visit.technicianId === filters.technicianId;
      const matchesStatus = !filters.visitStatus || visit.visitStatus === filters.visitStatus;
      const matchesServiceType = !filters.serviceType || visit.serviceType === filters.serviceType;
      const matchesDateRange = isWithinDateRange(visit.visitDate, filters.startDate, filters.endDate);
      return matchesCondominium && matchesTechnician && matchesStatus && matchesServiceType && matchesDateRange;
    });
  }, [filters, visits]);

  function getCondominium(id) {
    return condominiums.find((item) => item.id === id);
  }

  function getTechnician(id) {
    return technicians.find((item) => item.id === id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Visitas Técnicas"
        description="Controle em escala as visitas preventivas, instalações, atendimentos emergenciais e monitoramentos."
        actions={
          <Link
            to="/app/visits/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            <PlusCircle size={18} />
            Registrar visita técnica
          </Link>
        }
      />

      <FilterPanel title="Filtros de visitas técnicas">
        <FormField label="Condomínio">
          <select
            value={filters.condominiumId}
            onChange={(event) => setFilters((current) => ({ ...current, condominiumId: event.target.value }))}
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
            onChange={(event) => setFilters((current) => ({ ...current, technicianId: event.target.value }))}
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
        <FormField label="Status da visita">
          <select
            value={filters.visitStatus}
            onChange={(event) => setFilters((current) => ({ ...current, visitStatus: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="">Todos</option>
            {visitStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Tipo de serviço">
          <select
            value={filters.serviceType}
            onChange={(event) => setFilters((current) => ({ ...current, serviceType: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="">Todos</option>
            {serviceTypes.map((serviceType) => (
              <option key={serviceType}>{serviceType}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Data inicial">
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          />
        </FormField>
        <FormField label="Data final">
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          />
        </FormField>
      </FilterPanel>

      {domainErrors.visits ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {domainErrors.visits}
        </div>
      ) : null}

      <SectionCard
        title="Histórico de visitas técnicas"
        subtitle={domainLoading.visits ? 'Carregando visitas...' : `${filteredVisits.length} registro(s) encontrado(s).`}
      >
        {domainLoading.visits ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
            Carregando visitas técnicas...
          </div>
        ) : filteredVisits.length ? (
          <div className="space-y-4">
            {filteredVisits.map((visit) => {
              const condominium = getCondominium(visit.condominiumId);
              const technician = getTechnician(visit.technicianId);
              return (
                <div key={visit.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{condominium?.name ?? 'Condomínio não identificado'}</h3>
                        <StatusBadge value={visit.visitStatus} />
                        <StatusBadge value={visit.serviceType} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {technician?.name ?? 'Técnico não identificado'} • {formatDateTime(visit.visitDate)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">Responsável no local: {visit.responsible.name}</p>
                    </div>
                    <ActionButtons
                      actions={[
                        { label: 'Ver detalhes', onClick: () => setDetailsItem(visit) },
                        { label: 'Visualizar termo', onClick: () => setTermItem(visit) },
                        { label: 'Editar', onClick: () => navigate(`/app/visits/${visit.id}`) },
                        ...(canDelete ? [{ label: 'Excluir', onClick: () => setDeleteTarget(visit), tone: 'danger' }] : []),
                      ]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma visita técnica encontrada"
            description="Ajuste os filtros ou registre uma nova visita para iniciar o acompanhamento."
          />
        )}
      </SectionCard>

      <ModalShell
        open={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        title="Detalhes da visita técnica"
        subtitle="Consulta rápida da visita com checklist e informações do atendimento."
      >
        {detailsItem ? (
          <ReportPreview
            visit={detailsItem}
            condominium={getCondominium(detailsItem.condominiumId)}
            technician={getTechnician(detailsItem.technicianId)}
          />
        ) : null}
      </ModalShell>

      <ModalShell
        open={Boolean(termItem)}
        onClose={() => setTermItem(null)}
        title="Termo de instalação e aceite técnico"
        subtitle="Prévia imprimível do termo de responsabilidade operacional."
        size="max-w-5xl"
      >
        {termItem ? (
          <AcceptanceTermPreview
            visit={termItem}
            condominium={getCondominium(termItem.condominiumId)}
            technician={getTechnician(termItem.technicianId)}
          />
        ) : null}
      </ModalShell>

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            const deleted = await deleteVisit(deleteTarget.id);
            if (deleted) {
              setDeleteTarget(null);
            }
          }
        }}
        title="Excluir visita técnica"
        description="Esta ação remove a visita técnica e também exclui qualquer relatório vinculado a ela."
        confirmLabel="Excluir"
      />
    </div>
  );
}
