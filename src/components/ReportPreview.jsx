import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { getChecklistOverallStatus } from '../utils/visitHelpers';

export function ReportPreview({ visit, condominium, technician }) {
  if (!visit || !condominium || !technician) {
    return null;
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Relatório de Atendimento</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{condominium.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{condominium.address}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>
            <strong>Data da Visita:</strong> {formatDateTime(visit.visitDate)}
          </p>
          <p>
            <strong>Técnico Responsável:</strong> {technician.name}
          </p>
          <div className="mt-2">
            <StatusBadge value={visit.serviceType} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Responsável no Condomínio</h3>
          <p className="mt-2 text-sm text-slate-600">{visit.responsible.name}</p>
          <p className="text-sm text-slate-600">{visit.responsible.role}</p>
          <p className="text-sm text-slate-600">{visit.responsible.phone}</p>
          <p className="text-sm text-slate-600">Valor do Equipamento: {formatCurrency(visit.responsible.equipmentValue)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Termo de Responsabilidade</h3>
          <p className="mt-2 text-sm text-slate-600">
            Confirmação digital: {visit.responsible.acknowledged ? 'Concluída' : 'Pendente'}
          </p>
          <p className="text-sm text-slate-600">
            Data e hora: {visit.responsible.acknowledgedAt ? formatDateTime(visit.responsible.acknowledgedAt) : 'Não informado'}
          </p>
          <div className="mt-2">
            <StatusBadge value={visit.visitStatus} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-50 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Status Geral do Checklist Técnico</h3>
            <p className="mt-1 text-sm text-slate-600">Resultado consolidado a partir da situação atual dos equipamentos vistoriados.</p>
          </div>
          <StatusBadge value={getChecklistOverallStatus(visit.checklist)} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900">Checklist Técnico</h3>
        <div className="mt-3 space-y-3">
          {visit.checklist.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{item.label}</p>
                <StatusBadge value={item.status} />
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.observations || 'Sem observações registradas.'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Ações Realizadas</h3>
          <p className="mt-2 text-sm text-slate-600">{visit.actionsPerformed || 'Não informado'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Problemas Fora da Alçada</h3>
          <p className="mt-2 text-sm text-slate-600">{visit.outsideScope || 'Não informado'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Melhorias Sugeridas</h3>
          <p className="mt-2 text-sm text-slate-600">{visit.improvements || 'Não informado'}</p>
        </div>
      </div>

      {visit.photos?.length ? (
        <div>
          <h3 className="font-semibold text-slate-900">Fotos Anexadas</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {visit.photos.map((photo) => (
              <div key={photo.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {photo.fileName ?? photo.name}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
        Notificações simuladas: WhatsApp {visit.notifications.whatsapp ? 'agendado' : 'desativado'} e e-mail{' '}
        {visit.notifications.email ? 'agendado' : 'desativado'}.
      </div>
    </div>
  );
}
