import { KeyRound, PlusCircle, RefreshCw, UserCog } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { FilterPanel } from '../components/FilterPanel';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { userService } from '../services/userService';

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gestor' },
  { value: 'collaborator', label: 'Colaborador' },
];

const emptyForm = {
  name: '',
  email: '',
  role: 'collaborator',
  isActive: true,
  password: '',
};

function roleLabel(role) {
  return roleOptions.find((item) => item.value === role)?.label ?? role;
}

function generateTemporaryPassword() {
  const randomPart = Array.from(window.crypto.getRandomValues(new Uint32Array(2)))
    .map((value) => value.toString(36))
    .join('')
    .slice(0, 10);

  return `Ftec@${randomPart}9`;
}

export function UsersPage() {
  const { currentUser } = useAppContext();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', role: '', isActive: '' });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [statusTarget, setStatusTarget] = useState(null);

  const editingUser = useMemo(() => users.find((user) => user.id === editingId) ?? null, [editingId, users]);

  async function loadUsers() {
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const params = {
        pageSize: 100,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.isActive ? { isActive: filters.isActive } : {}),
      };
      const response = await userService.list(params);
      setUsers(response.data ?? []);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEditing(user) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: '',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingId) {
        const response = await userService.update(editingId, {
          name: form.name,
          email: form.email,
          role: form.role,
          isActive: form.isActive,
        });
        setUsers((current) => current.map((user) => (user.id === editingId ? response.data : user)));
        setFeedback({ type: 'success', message: 'Usuário atualizado com sucesso.' });
      } else {
        const response = await userService.create(form);
        setUsers((current) => [response.data, ...current]);
        window.alert(`Usuário criado. Guarde a senha temporária com segurança:\n\n${form.password}`);
        setFeedback({ type: 'success', message: 'Usuário criado com sucesso.' });
      }

      resetForm();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(user) {
    const password = generateTemporaryPassword();
    const confirmed = window.confirm(`Resetar a senha de ${user.name}? A senha temporária será exibida apenas uma vez.`);

    if (!confirmed) {
      return;
    }

    setFeedback({ type: '', message: '' });

    try {
      await userService.updatePassword(user.id, password);
      window.alert(`Senha temporária de ${user.name}:\n\n${password}\n\nGuarde e envie ao usuário por um canal seguro.`);
      setFeedback({ type: 'success', message: 'Senha temporária gerada com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  }

  async function handleStatusChange() {
    if (!statusTarget) {
      return;
    }

    setFeedback({ type: '', message: '' });

    try {
      const response = await userService.updateStatus(statusTarget.id, !statusTarget.isActive);
      setUsers((current) => current.map((user) => (user.id === statusTarget.id ? response.data : user)));
      setFeedback({
        type: 'success',
        message: response.data.isActive ? 'Usuário ativado com sucesso.' : 'Usuário inativado com sucesso.',
      });
      setStatusTarget(null);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Administre os acessos da equipe da F TEC AUTOMAÇÃO."
        actions={
          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} />
            Atualizar
          </button>
        }
      />

      <FilterPanel
        title="Filtros de usuários"
        actions={
          <button
            type="button"
            onClick={() => {
              resetForm();
              setForm({ ...emptyForm, password: generateTemporaryPassword() });
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            <PlusCircle size={18} />
            Novo usuário
          </button>
        }
      >
        <FormField label="Buscar">
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Nome ou e-mail"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          />
        </FormField>
        <FormField label="Perfil">
          <select
            value={filters.role}
            onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="">Todos</option>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Status">
          <select
            value={filters.isActive}
            onChange={(event) => setFilters((current) => ({ ...current, isActive: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          >
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </FormField>
        <div className="flex items-end">
          <button
            type="button"
            onClick={loadUsers}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Aplicar filtros
          </button>
        </div>
      </FilterPanel>

      {feedback.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <SectionCard title="Equipe cadastrada" subtitle={loading ? 'Carregando usuários...' : `${users.length} usuário(s) encontrado(s).`}>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              Carregando usuários...
            </div>
          ) : users.length ? (
            <div className="space-y-4">
              {users.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <div key={user.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <UserCog size={18} className="text-brand-600" />
                          <h3 className="font-semibold text-slate-900">{user.name}</h3>
                          <StatusBadge value={user.isActive ? 'Ativo' : 'Inativo'} />
                        </div>
                        <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>
                        <p className="mt-2 text-sm text-slate-600">Perfil: {roleLabel(user.role)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(user)}
                          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetPassword(user)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <KeyRound size={16} />
                          Resetar senha
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusTarget(user)}
                          disabled={isCurrentUser && user.isActive}
                          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {user.isActive ? 'Inativar' : 'Ativar'}
                        </button>
                      </div>
                    </div>
                    {isCurrentUser ? <p className="mt-3 text-xs font-medium text-slate-500">Este é o seu usuário atual.</p> : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Nenhum usuário encontrado" description="Cadastre usuários para liberar o acesso da equipe ao sistema." />
          )}
        </SectionCard>

        <SectionCard
          title={editingUser ? 'Editar usuário' : 'Cadastrar usuário'}
          subtitle="Somente administradores podem manter usuários e perfis de acesso."
          action={
            editingUser ? (
              <button type="button" onClick={resetForm} className="text-sm font-semibold text-brand-600">
                Cancelar edição
              </button>
            ) : null
          }
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="Nome">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="E-mail">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="Perfil">
              <select
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </FormField>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                disabled={editingId === currentUser?.id}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Usuário ativo
            </label>
            {!editingUser ? (
              <FormField label="Senha temporária">
                <div className="flex gap-2">
                  <input
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, password: generateTemporaryPassword() }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Gerar
                  </button>
                </div>
              </FormField>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Salvando...' : editingUser ? 'Salvar alterações' : 'Criar usuário'}
            </button>
          </form>
        </SectionCard>
      </div>

      <ConfirmationModal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusChange}
        title={statusTarget?.isActive ? 'Inativar usuário' : 'Ativar usuário'}
        description={
          statusTarget?.isActive
            ? `O usuário ${statusTarget?.name ?? ''} perderá acesso ao sistema.`
            : `O usuário ${statusTarget?.name ?? ''} poderá acessar o sistema novamente.`
        }
        confirmLabel={statusTarget?.isActive ? 'Inativar' : 'Ativar'}
      />
    </div>
  );
}
