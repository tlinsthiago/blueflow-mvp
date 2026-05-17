import { ExternalLink, FileText, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

const fileTypeLabels = {
  reservoir_photo: 'Foto do reservatório',
  pump_photo: 'Foto da bomba',
  electrical_panel_photo: 'Foto do quadro',
  signed_acceptance_term: 'Termo assinado',
  other: 'Outro arquivo',
};

const uploadSlots = [
  { fileType: 'reservoir_photo', label: fileTypeLabels.reservoir_photo, accept: 'image/*' },
  { fileType: 'pump_photo', label: fileTypeLabels.pump_photo, accept: 'image/*' },
  { fileType: 'electrical_panel_photo', label: fileTypeLabels.electrical_panel_photo, accept: 'image/*' },
  { fileType: 'signed_acceptance_term', label: fileTypeLabels.signed_acceptance_term, accept: 'image/*,application/pdf' },
];

function formatFileSize(size = 0) {
  if (!size) {
    return 'Tamanho não informado';
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function VisitFileUploader({ files = [], disabled = false, canDelete = false, onUpload, onDelete }) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event, fileType) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file, fileType);
    } catch {
      // O AppContext exibe o erro em toast.
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {uploadSlots.map((slot) => (
          <label
            key={slot.fileType}
            className={`flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-5 text-center text-sm transition ${
              disabled || isUploading
                ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                : 'cursor-pointer border-slate-300 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-700'
            }`}
          >
            <Upload size={22} />
            <span className="font-semibold">{slot.label}</span>
            <span className="text-xs text-slate-400">Imagens ou PDF até 10 MB</span>
            <input
              type="file"
              accept={slot.accept}
              className="hidden"
              disabled={disabled || isUploading}
              onChange={(event) => handleFileChange(event, slot.fileType)}
            />
          </label>
        ))}
      </div>

      {isUploading ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          Enviando arquivo...
        </div>
      ) : null}

      {disabled ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Salve a visita antes de anexar fotos ou o termo assinado.
        </div>
      ) : null}

      {files.length ? (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {files.map((file) => (
            <div key={file.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {file.mimeType?.startsWith('image/') && file.url ? (
                  <img src={file.url} alt={file.fileName} className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FileText size={22} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{file.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {fileTypeLabels[file.fileType] ?? fileTypeLabels.other} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {file.url ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ExternalLink size={14} />
                    Abrir
                  </a>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(file.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Nenhum arquivo anexado a esta visita.
        </div>
      )}
    </div>
  );
}
