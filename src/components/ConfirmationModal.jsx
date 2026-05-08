export function ConfirmationModal({ open, title, description, confirmLabel = 'Confirmar', onConfirm, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm text-slate-500">{description}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
