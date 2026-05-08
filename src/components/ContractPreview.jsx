import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate, formatMonthDate } from '../utils/formatters';
import { getContractLifecycleStatus } from '../utils/contractHelpers';

export function ContractPreview({ contract, condominium, companySettings }) {
  if (!contract || !condominium || !companySettings) {
    return null;
  }

  const status = getContractLifecycleStatus(contract);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Prévia de Contrato</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{contract.contractNumber || 'Contrato sem número'}</h2>
          <p className="mt-1 text-sm text-slate-500">{contract.serviceType}</p>
        </div>
        <StatusBadge value={status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Contratante</h3>
          <p className="mt-2 text-sm text-slate-600">{condominium.legalName}</p>
          <p className="text-sm text-slate-600">CNPJ: {condominium.cnpj || 'Não informado'}</p>
          <p className="text-sm text-slate-600">{condominium.address}</p>
          <p className="text-sm text-slate-600">Responsável: {condominium.manager}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Contratada</h3>
          <p className="mt-2 text-sm text-slate-600">{companySettings.legalName}</p>
          <p className="text-sm text-slate-600">CNPJ: {companySettings.cnpj || 'Não informado'}</p>
          <p className="text-sm text-slate-600">
            {companySettings.addressLine} - {companySettings.city}/{companySettings.state}
          </p>
          <p className="text-sm text-slate-600">Representante: {companySettings.legalRepresentative}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Valor mensal</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(contract.monthlyValue)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Prazo</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{contract.termMonths} meses</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Vencimento</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Dia {contract.dueDay}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Datas</h3>
          <p className="mt-2 text-sm text-slate-600">Início: {formatDate(contract.startDate)}</p>
          <p className="text-sm text-slate-600">Assinatura: {formatDate(contract.signatureDate)}</p>
          <p className="text-sm text-slate-600">Formalização: {formatMonthDate(contract.signatureDate || contract.startDate)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">SLA e visitas</h3>
          <p className="mt-2 text-sm text-slate-600">Visitas preventivas/mês: {contract.monthlyPreventiveVisits}</p>
          <p className="text-sm text-slate-600">SLA emergencial: {contract.emergencySlaHours} horas</p>
          <p className="text-sm text-slate-600">SLA não emergencial: {contract.nonEmergencySlaHours} horas</p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-900">Observações e foro</h3>
        <p className="mt-2 text-sm text-slate-600">Foro: {contract.jurisdiction || 'Não informado'}</p>
        <p className="mt-2 text-sm text-slate-600">{contract.notes || 'Nenhuma observação cadastrada.'}</p>
      </div>

      {contract.signedFile ? (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
          Contrato assinado anexado: <strong>{contract.signedFile.name}</strong>
        </div>
      ) : null}
    </div>
  );
}
