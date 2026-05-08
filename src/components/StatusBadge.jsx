export function StatusBadge({ value }) {
  const styleMap = {
    Concluído: 'bg-emerald-50 text-emerald-700',
    Pendente: 'bg-amber-50 text-amber-700',
    Normal: 'bg-emerald-50 text-emerald-700',
    Atenção: 'bg-amber-50 text-amber-700',
    Crítico: 'bg-rose-50 text-rose-700',
    Preventiva: 'bg-brand-50 text-brand-700',
    Instalação: 'bg-cyan-50 text-cyan-700',
    Manutenção: 'bg-violet-50 text-violet-700',
    'Manutenção Preventiva': 'bg-brand-50 text-brand-700',
    'Monitoramento de Nível de Água': 'bg-sky-50 text-sky-700',
    'Bomba de Recalque': 'bg-indigo-50 text-indigo-700',
    'Bomba Dosadora de Cloro': 'bg-teal-50 text-teal-700',
    'Quadro de Comando': 'bg-orange-50 text-orange-700',
    Emergencial: 'bg-rose-50 text-rose-700',
    Agendada: 'bg-sky-50 text-sky-700',
    'Em andamento': 'bg-violet-50 text-violet-700',
    Cancelada: 'bg-slate-100 text-slate-600',
    Ativo: 'bg-emerald-50 text-emerald-700',
    Inativo: 'bg-slate-100 text-slate-600',
    Rascunho: 'bg-slate-100 text-slate-700',
    Gerado: 'bg-brand-50 text-brand-700',
    Enviado: 'bg-sky-50 text-sky-700',
    Assinado: 'bg-emerald-50 text-emerald-700',
    Vencido: 'bg-amber-50 text-amber-700',
    Cancelado: 'bg-rose-50 text-rose-700',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styleMap[value] ?? 'bg-slate-100 text-slate-600'}`}>
      {value}
    </span>
  );
}
