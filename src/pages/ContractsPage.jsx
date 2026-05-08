import { PlusCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ActionButtons } from '../components/ActionButtons';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ContractPreview } from '../components/ContractPreview';
import { EmptyState } from '../components/EmptyState';
import { FileUploader } from '../components/FileUploader';
import { FilterPanel } from '../components/FilterPanel';
import { FormField } from '../components/FormField';
import { ModalShell } from '../components/ModalShell';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { contractStatuses, serviceTypes } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { createEmptyContract, exportContractDocument, getContractLifecycleStatus, printContractDocument } from '../utils/contractHelpers';
import { formatCurrency, formatDate } from '../utils/formatters';

export function ContractsPage() {
  const { contracts, condominiums, companySettings, createContract, updateContract, deleteContract } = useAppContext();
  const location = useLocation();
  const [filters, setFilters] = useState({ condominiumId: '', status: '', serviceType: '' });
  const [form, setForm] = useState(createEmptyContract());
  const [editingId, setEditingId] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const status = getContractLifecycleStatus(contract);
      return (
        (!filters.condominiumId || contract.condominiumId === filters.condominiumId) &&
        (!filters.status || status === filters.status) &&
        (!filters.serviceType || contract.serviceType === filters.serviceType)
      );
    });
  }, [contracts, filters]);

  useEffect(() => {
    const editContractId = location.state?.editContractId;
    if (!editContractId) {
      return;
    }

    const target = contracts.find((item) => item.id === editContractId);
    if (target) {
      setEditingId(target.id);
      setForm(target);
    }
  }, [contracts, location.state]);

  function resetForm() {
    setForm(createEmptyContract());
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (editingId) {
      updateContract(editingId, form);
    } else {
      createContract(form);
    }
    resetForm();
  }

  function getCondominium(id) {
    return condominiums.find((item) => item.id === id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Gerencie múltiplos contratos por condomínio, gere documento, imprima e anexe a versão assinada."
      />

      <FilterPanel
        title="Filtros de contratos"
        actions={
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            <PlusCircle size={18} />
            Novo contrato
          </button>
        }
      >
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
        <FormField label="Status">
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="">Todos</option>
            {contractStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
            <option>Vencido</option>
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
      </FilterPanel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Carteira de contratos" subtitle={`${filteredContracts.length} contrato(s) encontrado(s).`}>
          {filteredContracts.length ? (
            <div className="space-y-4">
              {filteredContracts.map((contract) => {
                const condominium = getCondominium(contract.condominiumId);
                const status = getContractLifecycleStatus(contract);
                return (
                  <div key={contract.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{contract.contractNumber}</h3>
                          <StatusBadge value={status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{condominium?.name ?? 'Condomínio não identificado'}</p>
                        <p className="mt-2 text-sm text-slate-600">
                          {contract.serviceType} • Início: {formatDate(contract.startDate)} • Valor: {formatCurrency(contract.monthlyValue)}
                        </p>
                      </div>
                      <ActionButtons
                        actions={[
                          { label: 'Ver', onClick: () => setDetailsItem(contract) },
                          {
                            label: 'Editar',
                            onClick: () => {
                              setEditingId(contract.id);
                              setForm(contract);
                            },
                          },
                          {
                            label: 'Imprimir',
                            onClick: () => printContractDocument({ contract, condominium, companySettings }),
                          },
                          {
                            label: 'Gerar documento',
                            onClick: () => exportContractDocument({ contract, condominium, companySettings }),
                            tone: 'primary',
                          },
                          { label: 'Excluir', onClick: () => setDeleteTarget(contract), tone: 'danger' },
                        ]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Nenhum contrato encontrado" description="Cadastre um contrato para iniciar a gestão contratual por condomínio." />
          )}
        </SectionCard>

        <SectionCard
          title={editingId ? 'Editar contrato' : 'Cadastrar contrato'}
          subtitle="Permite múltiplos contratos por condomínio, com documento e arquivo assinado."
          action={
            editingId ? (
              <button type="button" onClick={resetForm} className="text-sm font-semibold text-brand-600">
                Cancelar edição
              </button>
            ) : null
          }
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="Condomínio">
              <select
                value={form.condominiumId}
                onChange={(event) => setForm((current) => ({ ...current, condominiumId: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              >
                <option value="">Selecione</option>
                {condominiums.map((condo) => (
                  <option key={condo.id} value={condo.id}>
                    {condo.name}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Número do contrato">
                <input
                  value={form.contractNumber}
                  onChange={(event) => setForm((current) => ({ ...current, contractNumber: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                  required
                />
              </FormField>
              <FormField label="Tipo de serviço">
                <select
                  value={form.serviceType}
                  onChange={(event) => setForm((current) => ({ ...current, serviceType: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                >
                  {serviceTypes.map((serviceType) => (
                    <option key={serviceType}>{serviceType}</option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Valor mensal">
                <input
                  value={form.monthlyValue}
                  onChange={(event) => setForm((current) => ({ ...current, monthlyValue: event.target.value }))}
                  placeholder="R$ 0,00"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
              <FormField label="Dia de vencimento">
                <input
                  value={form.dueDay}
                  onChange={(event) => setForm((current) => ({ ...current, dueDay: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Prazo em meses">
                <input
                  value={form.termMonths}
                  onChange={(event) => setForm((current) => ({ ...current, termMonths: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
              <FormField label="Visitas preventivas mensais">
                <input
                  value={form.monthlyPreventiveVisits}
                  onChange={(event) => setForm((current) => ({ ...current, monthlyPreventiveVisits: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Data de início">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
              <FormField label="Data de assinatura">
                <input
                  type="date"
                  value={form.signatureDate}
                  onChange={(event) => setForm((current) => ({ ...current, signatureDate: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="SLA emergencial em horas">
                <input
                  value={form.emergencySlaHours}
                  onChange={(event) => setForm((current) => ({ ...current, emergencySlaHours: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
              <FormField label="SLA não emergencial em horas">
                <input
                  value={form.nonEmergencySlaHours}
                  onChange={(event) => setForm((current) => ({ ...current, nonEmergencySlaHours: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
            </div>
            <FormField label="Foro">
              <input
                value={form.jurisdiction}
                onChange={(event) => setForm((current) => ({ ...current, jurisdiction: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
            <FormField label="Status do contrato">
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              >
                {contractStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Observações">
              <textarea
                rows="4"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
            <FileUploader
              file={form.signedFile}
              onChange={(signedFile) => setForm((current) => ({ ...current, signedFile }))}
            />
            <button type="submit" className="w-full rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-500">
              {editingId ? 'Salvar alterações' : 'Salvar contrato'}
            </button>
          </form>
        </SectionCard>
      </div>

      <ModalShell
        open={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        title={`Contrato ${detailsItem?.contractNumber ?? ''}`}
        subtitle="Detalhamento completo com prévia pronta para impressão."
      >
        {detailsItem ? (
          <ContractPreview
            contract={detailsItem}
            condominium={getCondominium(detailsItem.condominiumId)}
            companySettings={companySettings}
          />
        ) : null}
      </ModalShell>

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteContract(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Excluir contrato"
        description="Esta ação remove o contrato da carteira e do detalhe do condomínio."
        confirmLabel="Excluir"
      />
    </div>
  );
}
