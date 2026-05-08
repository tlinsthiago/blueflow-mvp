export function ActionButtons({ actions }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
            action.tone === 'danger'
              ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              : action.tone === 'primary'
              ? 'bg-brand-600 text-white hover:bg-brand-500'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
