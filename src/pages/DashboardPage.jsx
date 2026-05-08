import { Building2, CheckCircle2, CircleDashed, Clock3, PlusCircle, TimerReset } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { monthKey } from '../utils/formatters';
import { getMonthlyVisitStatus } from '../utils/visitHelpers';

export function DashboardPage() {
  const { condominiums, visits, technicians, reports } = useAppContext();
  const currentMonth = monthKey(new Date().toISOString());
  const monthVisits = visits.filter((visit) => monthKey(visit.visitDate) === currentMonth);
  const completedVisits = condominiums.filter((condo) => getMonthlyVisitStatus(condo.id, visits) === 'Concluído').length;
  const pendingVisits = condominiums.length - completedVisits;
  const activeTechnicians = technicians.filter((item) => item.status === 'Ativo').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel"
        description="Visão geral da operação mensal de manutenção hidráulica preventiva."
        actions={
          <Link
            to="/app/visits/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            <PlusCircle size={18} />
            Nova visita técnica
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total de condomínios"
          value={condominiums.length}
          tone="blue"
          icon={Building2}
          helper="Base ativa de contratos"
        />
        <StatCard
          label="Visitas no mês"
          value={monthVisits.length}
          tone="soft"
          icon={TimerReset}
          helper="Agenda do período atual"
        />
        <StatCard
          label="Visitas pendentes"
          value={pendingVisits}
          tone="gray"
          icon={CircleDashed}
          helper="Condomínios sem conclusão no mês"
        />
        <StatCard
          label="Visitas concluídas"
          value={completedVisits}
          tone="emerald"
          icon={CheckCircle2}
          helper="Atendimentos já finalizados"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Status mensal por condomínio"
          subtitle="Leitura rápida da carteira para identificar contratos concluídos e pendências do mês."
        >
          <div className="space-y-3">
            {condominiums.map((condo) => {
              const status = getMonthlyVisitStatus(condo.id, visits);
              return (
                <div
                  key={condo.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{condo.name}</h3>
                        <p className="text-sm text-slate-500">Janela de atendimento: {condo.monthlyWindow}</p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge value={status} />
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Resumo operacional"
          subtitle="Indicadores complementares para reforçar capacidade de atendimento e governança."
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
                  <Clock3 size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Técnicos ativos</p>
                  <p className="text-sm text-slate-500">Profissionais disponíveis para atendimento em campo</p>
                </div>
              </div>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">{activeTechnicians}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Relatórios gerados</p>
                  <p className="text-sm text-slate-500">Documentos emitidos a partir das visitas concluídas</p>
                </div>
              </div>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">{reports.length}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
