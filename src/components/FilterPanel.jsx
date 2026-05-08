export function FilterPanel({ title = 'Filtros', children, actions }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">Refine a visualização para trabalhar melhor com muitos registros.</p>
        </div>
        {actions}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  );
}
