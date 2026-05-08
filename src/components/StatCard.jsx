export function StatCard({ label, value, tone = 'blue', icon: Icon, helper }) {
  const tones = {
    blue: 'from-brand-700 via-brand-600 to-brand-500 text-white',
    gray: 'from-slate-900 via-slate-800 to-slate-700 text-white',
    soft: 'from-white to-slate-50 text-slate-900 border border-slate-200',
    emerald: 'from-emerald-600 via-emerald-500 to-emerald-400 text-white',
  };

  return (
    <div className={`rounded-[2rem] bg-gradient-to-br p-5 shadow-soft ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight">{value}</p>
          {helper ? <p className="mt-2 text-sm opacity-80">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
