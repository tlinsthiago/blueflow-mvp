import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';

export function CompanySettingsPage() {
  const { companySettings, updateCompanySettings } = useAppContext();
  const [form, setForm] = useState(companySettings);

  function handleSubmit(event) {
    event.preventDefault();
    updateCompanySettings(form);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empresa Contratada"
        description="Configuração dos dados da empresa utilizada no preenchimento automático e impressão dos contratos."
      />

      <SectionCard title="Dados da empresa" subtitle="Essas informações serão aplicadas nas prévias e documentos contratuais.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nome da empresa">
              <input
                value={form.legalName}
                onChange={(event) => setForm((current) => ({ ...current, legalName: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
            <FormField label="CNPJ">
              <input
                value={form.cnpj}
                onChange={(event) => setForm((current) => ({ ...current, cnpj: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
          </div>
          <FormField label="Endereço completo">
            <input
              value={form.addressLine}
              onChange={(event) => setForm((current) => ({ ...current, addressLine: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Cidade">
              <input
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
            <FormField label="UF">
              <input
                value={form.state}
                onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Representante legal">
              <input
                value={form.legalRepresentative}
                onChange={(event) => setForm((current) => ({ ...current, legalRepresentative: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
            <FormField label="CPF do representante">
              <input
                value={form.representativeCpf}
                onChange={(event) => setForm((current) => ({ ...current, representativeCpf: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Telefone">
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
            <FormField label="E-mail">
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
          </div>
          <button type="submit" className="rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-500">
            Salvar dados da empresa
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
