export function ToastStack({ items, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex min-w-[280px] items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm shadow-soft ${
            item.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          <span>{item.message}</span>
          <button type="button" onClick={() => onDismiss(item.id)} className="text-xs font-semibold opacity-80">
            Fechar
          </button>
        </div>
      ))}
    </div>
  );
}
