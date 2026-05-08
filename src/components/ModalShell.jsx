export function ModalShell({ open, title, subtitle, onClose, children, size = 'max-w-3xl' }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/45 p-4">
      <div className={`mx-auto mt-8 w-full ${size} rounded-3xl bg-white p-6 shadow-soft`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
