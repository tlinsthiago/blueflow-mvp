export function PhotoUploader({ photos, onChange }) {
  function handleFiles(event) {
    const files = Array.from(event.target.files ?? []);
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: crypto.randomUUID(),
                name: file.name,
                url: reader.result,
              });
            reader.readAsDataURL(file);
          })
      )
    ).then((items) => onChange([...(photos ?? []), ...items]));
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 transition hover:border-brand-400 hover:text-brand-700">
        <input type="file" accept="image/*" className="hidden" multiple onChange={handleFiles} />
        Enviar fotos da vistoria
      </label>
      {photos?.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-2xl border border-slate-200">
              <img src={photo.url} alt={photo.name} className="h-28 w-full object-cover" />
              <p className="truncate px-3 py-2 text-xs text-slate-500">{photo.name}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
