import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAppContext } from '../context/AppContext';
import { exportContractDocument, getContractLifecycleStatus, printContractDocument } from '../utils/contractHelpers';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getMonthlyVisitStatus } from '../utils/visitHelpers';

const initialForm = {
  name: '',
  legalName: '',
  cnpj: '',
  addressLine: '',
  city: '',
  state: 'PE',
  manager: '',
  managerCpf: '',
  managerPhone: '',
  managerEmail: '',
  units: '',
  monthlyWindow: '',
};

export function CondominiumsPage() {
  const {
    condominiums,
    visits,
    contracts,
    companySettings,
    createCondominium,
    updateCondominium,
    deleteCondominium,
    updateContract,
    domainLoading,
    domainErrors,
    canWriteDomain,
  } = useAppContext();
  const [filters, setFilters] = useState({ search: '', status: 'Todos' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewContract, setPreviewContract] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const canWrite = canWriteDomain();

  const filteredCondominiums = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return condominiums.filter((condo) => {
      const monthlyStatus = getMonthlyVisitStatus(condo.id, visits);
      const matchesSearch =
        !search ||
        [condo.name, condo.legalName, condo.address, condo.manager, condo.managerEmail]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));
      const matchesStatus = filters.status === 'Todos' || monthlyStatus === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [condominiums, filters, visits]);

  function getCondominiumContracts(condominiumId) {
    return contracts.filter((item) => item.condominiumId === condominiumId);
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canWrite) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCondominium(editingId, form);
      } else {
        await createCondominium(form);
      }
      resetForm();
    } catch {
      // Toasts are handled by AppContext.
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      legalName: item.legalName,
      cnpj: item.cnpj,
      addressLine: item.addressLine,
      city: item.city,
      state: item.state,
      manager: item.manager,
      managerCpf: item.managerCpf,
      managerPhone: item.managerPhone,
      managerEmail: item.managerEmail,
      units: String(item.units ?? ''),
      monthlyWindow: item.monthlyWindow,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Condomínios"
        description="Cadastre dados operacionais e jurídicos do condomínio, incluindo responsáveis e contratos vinculados."
      />

      <FilterPanel title="Filtros de condomínios">
        <FormField label="Buscar">
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Nome, endereço ou responsável"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          />
        </FormField>
        <FormField label="Status mensal">
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option>Todos</option>
            <option>Pendente</option>
            <option>Concluído</option>
          </select>
        </FormField>
      </FilterPanel>

      {domainErrors.condominiums ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {domainErrors.condominiums}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Condomínios cadastrados"
          subtitle={
            domainLoading.condominiums
              ? 'Carregando condomínios do banco de dados...'
              : `${filteredCondominiums.length} registro(s) encontrado(s) para os filtros aplicados.`
          }
        >
          {domainLoading.condominiums ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
              Carregando condomínios...
            </div>
          ) : filteredCondominiums.length ? (
            <div className="space-y-4">
              {filteredCondominiums.map((condo) => {
                const monthlyStatus = getMonthlyVisitStatus(condo.id, visits);
                const linkedVisits = visits.filter((visit) => visit.condominiumId === condo.id).length;
                const linkedContracts = getCondominiumContracts(condo.id).length;

                return (
                  <div key={condo.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{condo.name}</h3>
                            <StatusBadge value={monthlyStatus} />
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{condo.address}</p>
                          <p className="mt-2 text-sm text-slate-600">
                            Responsável legal: {condo.manager} • Unidades: {condo.units}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Visitas vinculadas: {linkedVisits} • Contratos vinculados: {linkedContracts}
                          </p>
                        </div>
                        <ActionButtons
                          actions={[
                            { label: 'Ver detalhes', onClick: () => setDetailsItem(condo) },
                            ...(canWrite
                              ? [
                                  { label: 'Editar', onClick: () => handleEdit(condo) },
                                  { label: 'Excluir', onClick: () => setDeleteTarget(condo), tone: 'danger' },
                                ]
                              : []),
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Nenhum condomínio encontrado"
              description="Ajuste os filtros ou cadastre um novo condomínio para começar o planejamento operacional."
            />
          )}
        </SectionCard>

        <SectionCard
          title={canWrite ? (editingId ? 'Editar condomínio' : 'Cadastrar condomínio') : 'Permissão de visualização'}
          subtitle={
            canWrite
              ? 'Formulário com dados cadastrais, jurídicos e de contato do responsável legal.'
              : 'Seu perfil permite consultar condomínios, mas não criar, editar ou excluir registros.'
          }
          action={
            editingId && canWrite ? (
              <button type="button" onClick={resetForm} className="text-sm font-semibold text-brand-600">
                Cancelar edição
              </button>
            ) : null
          }
        >
          {canWrite ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="Nome/Razão social do condomínio">
              <input
                value={form.legalName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    legalName: event.target.value,
                    name: current.name || event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="Nome de exibição">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex.: Residencial Atlântico"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="CNPJ">
              <input
                value={form.cnpj}
                onChange={(event) => setForm((current) => ({ ...current, cnpj: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
            <FormField label="Endereço completo">
              <input
                value={form.addressLine}
                onChange={(event) => setForm((current) => ({ ...current, addressLine: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Cidade">
                <input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                  required
                />
              </FormField>
              <FormField label="UF">
                <input
                  value={form.state}
                  onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                  required
                />
              </FormField>
            </div>
            <FormField label="Síndico/Responsável legal">
              <input
                value={form.manager}
                onChange={(event) => setForm((current) => ({ ...current, manager: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="CPF do responsável">
                <input
                  value={form.managerCpf}
                  onChange={(event) => setForm((current) => ({ ...current, managerCpf: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
              <FormField label="Telefone do responsável">
                <input
                  value={form.managerPhone}
                  onChange={(event) => setForm((current) => ({ ...current, managerPhone: event.target.value }))}
                  placeholder="(81) 99999-9999"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="E-mail do responsável">
                <input
                  value={form.managerEmail}
                  onChange={(event) => setForm((current) => ({ ...current, managerEmail: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
              <FormField label="Quantidade de unidades">
                <input
                  type="number"
                  value={form.units}
                  onChange={(event) => setForm((current) => ({ ...current, units: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
            </div>
            <FormField label="Janela mensal de atendimento">
              <input
                value={form.monthlyWindow}
                onChange={(event) => setForm((current) => ({ ...current, monthlyWindow: event.target.value }))}
                placeholder="Primeira semana"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar condomínio'}
            </button>
          </form>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              A criação e manutenção de condomínios está disponível apenas para perfis Admin e Gestor.
            </div>
          )}
        </SectionCard>
      </div>

      <ModalShell
        open={Boolean(detailsItem)}
        onClose={() => {
          setDetailsItem(null);
          setPreviewContract(null);
        }}
        title={detailsItem?.name ?? 'Detalhes do condomínio'}
        subtitle="Resumo cadastral, operacional e carteira de contratos do condomínio."
        size="max-w-5xl"
      >
        {detailsItem ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Razão social</p>
                <p className="mt-1 font-medium text-slate-900">{detailsItem.legalName}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">CNPJ</p>
                <p className="mt-1 font-medium text-slate-900">{detailsItem.cnpj || 'Não informado'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Responsável legal</p>
                <p className="mt-1 font-medium text-slate-900">{detailsItem.manager}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Status mensal</p>
                <div className="mt-2">
                  <StatusBadge value={getMonthlyVisitStatus(detailsItem.id, visits)} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Contratos</h3>
                <p className="mt-1 text-sm text-slate-500">Relação de contratos ativos e encerrados vinculados a este condomínio.</p>
              </div>

              {getCondominiumContracts(detailsItem.id).length ? (
                <div className="space-y-6">
                  <div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Contratos ativos</p>
                    <div className="space-y-4">
                      {getCondominiumContracts(detailsItem.id)
                        .filter((contract) => !['Vencido', 'Cancelado'].includes(getContractLifecycleStatus(contract)))
                        .map((contract) => {
                          const status = getContractLifecycleStatus(contract);
                          return (
                            <div key={contract.id} className="rounded-2xl border border-slate-200 p-4">
                              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-semibold text-slate-900">{contract.contractNumber}</h4>
                                    <StatusBadge value={status} />
                                  </div>
                                  <p className="mt-1 text-sm text-slate-500">{contract.serviceType}</p>
                                  <p className="mt-2 text-sm text-slate-600">
                                    Início: {formatDate(contract.startDate)} • Valor mensal: {formatCurrency(contract.monthlyValue)}
                                  </p>
                                </div>
                                <ActionButtons
                                  actions={[
                                    { label: 'Ver', onClick: () => setPreviewContract(contract) },
                                    {
                                      label: 'Editar',
                                      onClick: () => navigate('/app/contracts', { state: { editContractId: contract.id } }),
                                    },
                                    {
                                      label: 'Imprimir',
                                      onClick: () => printContractDocument({ contract, condominium: detailsItem, companySettings }),
                                    },
                                    {
                                      label: 'Upload contrato assinado',
                                      onClick: () => setPreviewContract(contract),
                                    },
                                  ]}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Contratos encerrados</p>
                    {getCondominiumContracts(detailsItem.id).some((contract) =>
                      ['Vencido', 'Cancelado'].includes(getContractLifecycleStatus(contract))
                    ) ? (
                      <div className="space-y-4">
                        {getCondominiumContracts(detailsItem.id)
                          .filter((contract) => ['Vencido', 'Cancelado'].includes(getContractLifecycleStatus(contract)))
                          .map((contract) => {
                            const status = getContractLifecycleStatus(contract);
                            return (
                              <div key={contract.id} className="rounded-2xl border border-slate-200 p-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-semibold text-slate-900">{contract.contractNumber}</h4>
                                      <StatusBadge value={status} />
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">{contract.serviceType}</p>
                                    <p className="mt-2 text-sm text-slate-600">
                                      Início: {formatDate(contract.startDate)} • Valor mensal: {formatCurrency(contract.monthlyValue)}
                                    </p>
                                  </div>
                                  <ActionButtons
                                    actions={[
                                      { label: 'Ver', onClick: () => setPreviewContract(contract) },
                                      {
                                        label: 'Editar',
                                        onClick: () => navigate('/app/contracts', { state: { editContractId: contract.id } }),
                                      },
                                      {
                                        label: 'Imprimir',
                                        onClick: () => printContractDocument({ contract, condominium: detailsItem, companySettings }),
                                      },
                                      {
                                        label: 'Upload contrato assinado',
                                        onClick: () => setPreviewContract(contract),
                                      },
                                    ]}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        Nenhum contrato encerrado para este condomínio.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState title="Nenhum contrato vinculado" description="Cadastre contratos na área de contratos para visualizá-los aqui." />
              )}
            </div>

            {previewContract ? (
              <div className="space-y-4">
                <ContractPreview contract={previewContract} condominium={detailsItem} companySettings={companySettings} />
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <FileUploader
                    file={previewContract.signedFile}
                    onChange={(signedFile) => {
                      updateContract(previewContract.id, { signedFile, status: 'Assinado' });
                      setPreviewContract((current) => ({ ...current, signedFile, status: 'Assinado' }));
                    }}
                    label="Enviar contrato assinado"
                  />
                  <div className="flex flex-wrap items-start gap-3">
                    <button
                      type="button"
                      onClick={() => printContractDocument({ contract: previewContract, condominium: detailsItem, companySettings })}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Imprimir contrato
                    </button>
                    <button
                      type="button"
                      onClick={() => exportContractDocument({ contract: previewContract, condominium: detailsItem, companySettings })}
                      className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
                    >
                      Gerar documento
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </ModalShell>

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            const deleted = await deleteCondominium(deleteTarget.id);
            if (deleted) {
              setDeleteTarget(null);
            }
          }
        }}
        title="Excluir condomínio"
        description="Esta ação remove o cadastro do condomínio. Caso existam visitas técnicas ou contratos vinculados, a exclusão será bloqueada."
        confirmLabel="Excluir"
      />
    </div>
  );
}
