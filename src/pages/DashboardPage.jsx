import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CircleDashed,
  Clock3,
  PlusCircle,
  TimerReset,
  UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { dashboardService } from '../services/dashboardService';
import { formatDateTime } from '../utils/formatters';

const initialSummary = {
  totals: {
    activeCondominiums: 0,
    activeTechnicians: 0,
    visitsThisMonth: 0,
    pendingVisits: 0,
    completedVisitsThisMonth: 0,
    scheduledVisits: 0,
    criticalChecklistItems: 0,
    attentionChecklistItems: 0,
    condominiumsWithoutCompletedVisit: 0,
  },
  pendingCondominiums: [],
  latestVisits: [],
};

export function DashboardPage() {
  const [summary, setSummary] = useState(initialSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setIsLoading(true);
      setError('');

      try {
        const response = await dashboardService.getSummary();
        if (isMounted) {
          setSummary(response.data ?? initialSummary);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const { totals, pendingCondominiums, latestVisits } = summary;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel"
        description="VisÃ£o geral real da operaÃ§Ã£o mensal de manutenÃ§Ã£o hidrÃ¡ulica preventiva."
        actions={
          <Link
            to="/app/visits/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            <PlusCircle size={18} />
            Nova visita tÃ©cnica
          </Link>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          Carregando indicadores operacionais...
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="CondomÃ­nios ativos"
          value={totals.activeCondominiums}
          tone="blue"
          icon={Building2}
          helper="Carteira operacional ativa"
        />
        <StatCard
          label="TÃ©cnicos ativos"
          value={totals.activeTechnicians}
          tone="soft"
          icon={UsersRound}
          helper="Equipe disponÃ­vel"
        />
        <StatCard
          label="Visitas no mÃªs"
          value={totals.visitsThisMonth}
          tone="soft"
          icon={TimerReset}
          helper="Atendimentos do perÃ­odo atual"
        />
        <StatCard
          label="ConcluÃ­das no mÃªs"
          value={totals.completedVisitsThisMonth}
          tone="emerald"
          icon={CheckCircle2}
          helper="Visitas finalizadas"
        />
        <StatCard
          label="Visitas pendentes"
          value={totals.pendingVisits}
          tone="gray"
          icon={CircleDashed}
          helper="Status pendente"
        />
        <StatCard
          label="Visitas agendadas"
          value={totals.scheduledVisits}
          tone="blue"
          icon={Clock3}
          helper="Agenda futura"
        />
        <StatCard
          label="Checklist crÃ­tico"
          value={totals.criticalChecklistItems}
          tone="gray"
          icon={AlertTriangle}
          helper="Itens em estado crÃ­tico"
        />
        <StatCard
          label="Checklist atenÃ§Ã£o"
          value={totals.attentionChecklistItems}
          tone="soft"
          icon={AlertTriangle}
          helper="Itens que exigem acompanhamento"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="CondomÃ­nios pendentes no mÃªs"
          subtitle={`${totals.condominiumsWithoutCompletedVisit} condomÃ­nio(s) ativo(s) sem visita concluÃ­da no mÃªs atual.`}
        >
          {pendingCondominiums.length ? (
            <div className="space-y-3">
              {pendingCondominiums.map((condo) => (
                <div
                  key={condo.id}
                  className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{condo.name}</h3>
                    <p className="text-sm text-slate-600">
                      {[condo.city, condo.state].filter(Boolean).join('/')} {condo.monthlyWindow ? `Â· ${condo.monthlyWindow}` : ''}
                    </p>
                  </div>
                  <StatusBadge value="Pendente" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Todos os condomÃ­nios ativos possuem visita concluÃ­da no mÃªs.
            </div>
          )}
        </SectionCard>

        <SectionCard title="Ãšltimas visitas realizadas" subtitle="Atendimentos concluÃ­dos mais recentes registrados no backend.">
          {latestVisits.length ? (
            <div className="space-y-3">
              {latestVisits.map((visit) => (
                <div key={visit.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{visit.condominiumName}</h3>
                    <StatusBadge value={visit.serviceType} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{visit.technicianName}</p>
                  <p className="text-sm text-slate-500">{formatDateTime(visit.visitDate)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Nenhuma visita concluÃ­da encontrada.
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
