import { useMemo, useState } from 'react';
import { ActionButtons } from '../components/ActionButtons';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { FilterPanel } from '../components/FilterPanel';
import { FormField } from '../components/FormField';
import { ModalShell } from '../components/ModalShell';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';

const initialForm = {
  name: '',
  phone: '',
  role: '',
  status: 'Ativo',
  notes: '',
};

export function TechniciansPage() {
  const {
    technicians,
    visits,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    domainLoading,
    domainErrors,
    canWriteDomain,
  } = useAppContext();
  const [filters, setFilters] = useState({ search: '', status: 'Todos' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canWrite = canWriteDomain();

  const filteredTechnicians = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return technicians.filter((tech) => {
      const matchesSearch =
        !search ||
        [tech.name, tech.phone, tech.role]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));
      const matchesStatus = filters.status === 'Todos' || tech.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [filters, technicians]);

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
        await updateTechnician(editingId, form);
      } else {
        await createTechnician(form);
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
      phone: item.phone,
      role: item.role,
      status: item.status,
      notes: item.notes,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Gestão de Técnicos" description="Administre a equipe de campo com filtros, consulta rápida e CRUD completo." />

      <FilterPanel title="Filtros de técnicos">
        <FormField label="Buscar">
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Nome ou telefone"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          />
        </FormField>
        <FormField label="Status">
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option>Todos</option>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
        </FormField>
      </FilterPanel>

      {domainErrors.technicians ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {domainErrors.technicians}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Equipe técnica"
          subtitle={domainLoading.technicians ? 'Carregando técnicos...' : `${filteredTechnicians.length} registro(s) encontrado(s).`}
        >
          {domainLoading.technicians ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
              Carregando técnicos...
            </div>
          ) : filteredTechnicians.length ? (
            <div className="space-y-4">
              {filteredTechnicians.map((tech) => {
                const linkedVisits = visits.filter((visit) => visit.technicianId === tech.id).length;
                return (
                  <div key={tech.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{tech.name}</h3>
                          <StatusBadge value={tech.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{tech.role}</p>
                        <p className="mt-2 text-sm text-slate-600">{tech.phone}</p>
                        <p className="mt-1 text-sm text-slate-500">Visitas vinculadas: {linkedVisits}</p>
                      </div>
                      <ActionButtons
                        actions={[
                          { label: 'Ver detalhes', onClick: () => setDetailsItem(tech) },
                          ...(canWrite
                            ? [
                                { label: 'Editar', onClick: () => handleEdit(tech) },
                                { label: 'Excluir', onClick: () => setDeleteTarget(tech), tone: 'danger' },
                              ]
                            : []),
                        ]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Nenhum técnico encontrado" description="Refine os filtros ou cadastre um novo técnico para ampliar a equipe." />
          )}
        </SectionCard>

        <SectionCard
          title={canWrite ? (editingId ? 'Editar técnico' : 'Cadastrar técnico') : 'Permissão de visualização'}
          subtitle={
            canWrite
              ? 'Campos adequados ao uso operacional em empresas de manutenção condominial.'
              : 'Seu perfil permite consultar técnicos, mas não criar, editar ou excluir registros.'
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
            <FormField label="Nome">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="Telefone">
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="(81) 99999-9999"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="Cargo/Função">
              <input
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              >
                <option>Ativo</option>
                <option>Inativo</option>
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar técnico'}
            </button>
          </form>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              A criação e manutenção de técnicos está disponível apenas para perfis Admin e Gestor.
            </div>
          )}
        </SectionCard>
      </div>

      <ModalShell
        open={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        title={detailsItem?.name ?? 'Detalhes do técnico'}
        subtitle="Consulta rápida para gestão da equipe."
        size="max-w-2xl"
      >
        {detailsItem ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Telefone</p>
                <p className="mt-1 font-medium text-slate-900">{detailsItem.phone}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Status</p>
                <div className="mt-2">
                  <StatusBadge value={detailsItem.status} />
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Cargo/Função</p>
              <p className="mt-1 font-medium text-slate-900">{detailsItem.role}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Observações</p>
              <p className="mt-1 text-slate-700">{detailsItem.notes || 'Nenhuma observação cadastrada.'}</p>
            </div>
          </div>
        ) : null}
      </ModalShell>

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            const deleted = await deleteTechnician(deleteTarget.id);
            if (deleted) {
              setDeleteTarget(null);
            }
          }
        }}
        title="Excluir técnico"
        description="Esta ação remove o cadastro do técnico. Caso existam visitas técnicas vinculadas, a exclusão será bloqueada."
        confirmLabel="Excluir"
      />
    </div>
  );
}
