export function FileUploader({ file, onChange, label = 'Enviar arquivo do contrato assinado' }) {
  function handleFiles(event) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      onChange({
        id: crypto.randomUUID(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        url: reader.result,
      });
    reader.readAsDataURL(selectedFile);
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 transition hover:border-brand-400 hover:text-brand-700">
        <input type="file" className="hidden" onChange={handleFiles} />
        {label}
      </label>
      {file ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          Arquivo atual: <strong>{file.name}</strong>
        </div>
      ) : null}
    </div>
  );
}
