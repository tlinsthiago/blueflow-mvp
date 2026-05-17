import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { ReportPreview } from '../components/ReportPreview';
import { SectionCard } from '../components/SectionCard';
import { VisitFileUploader } from '../components/VisitFileUploader';
import { checklistStatuses, serviceTypes, visitStatuses } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { formatInputDateTime } from '../utils/formatters';
import { createEmptyVisit, normalizeVisit } from '../utils/visitHelpers';

export function VisitFormPage() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const {
    condominiums,
    technicians,
    visits,
    saveVisit,
    uploadVisitFile,
    deleteVisitFile,
    canDeleteVisitFiles,
    domainLoading,
    domainErrors,
  } = useAppContext();
  const existingVisit = useMemo(() => visits.find((item) => item.id === visitId), [visitId, visits]);
  const [visit, setVisit] = useState(createEmptyVisit());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingVisit) {
      setVisit({
        ...normalizeVisit(existingVisit),
        visitDate: formatInputDateTime(existingVisit.visitDate),
      });
    } else {
      setVisit(createEmptyVisit());
    }
  }, [existingVisit]);

  const selectedCondominium = condominiums.find((item) => item.id === visit.condominiumId);
  const selectedTechnician = technicians.find((item) => item.id === visit.technicianId);
  const canDeleteFiles = canDeleteVisitFiles();

  function updateChecklist(index, field, value) {
    setVisit((current) => ({
      ...current,
      checklist: current.checklist.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...visit,
      id: existingVisit?.id,
      createdAt: existingVisit?.createdAt,
      visitDate: new Date(visit.visitDate).toISOString(),
      serviceType: visit.serviceType,
      type: visit.serviceType,
    };

    setIsSubmitting(true);
    try {
      await saveVisit(payload);
      navigate('/app/visits');
    } catch {
      // Toasts are handled by AppContext.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={existingVisit ? 'Editar Visita Técnica' : 'Formulário de Visita Técnica'}
        description="Siga o fluxo operacional: condomínio, técnico, responsável, checklist técnico e observações do atendimento."
      />

      {domainErrors.visits ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {domainErrors.visits}
        </div>
      ) : null}

      {domainLoading.visits && visitId ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          Carregando visita técnica...
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <SectionCard title="Fluxo da visita técnica" subtitle="Registro completo da operação com campos preparados para o uso em escala.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <FormField label="Condomínio">
              <select
                value={visit.condominiumId}
                onChange={(event) => setVisit((current) => ({ ...current, condominiumId: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              >
                <option value="">Selecione</option>
                {condominiums.map((condo) => (
                  <option key={condo.id} value={condo.id}>
                    {condo.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Técnico">
              <select
                value={visit.technicianId}
                onChange={(event) => setVisit((current) => ({ ...current, technicianId: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              >
                <option value="">Selecione</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Data e hora da visita">
              <input
                type="datetime-local"
                value={visit.visitDate}
                onChange={(event) => setVisit((current) => ({ ...current, visitDate: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="Tipo de serviço">
              <select
                value={visit.serviceType}
                onChange={(event) =>
                  setVisit((current) => ({
                    ...current,
                    serviceType: event.target.value,
                    type: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              >
                {serviceTypes.map((serviceType) => (
                  <option key={serviceType}>{serviceType}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Status da visita">
              <select
                value={visit.visitStatus}
                onChange={(event) => setVisit((current) => ({ ...current, visitStatus: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              >
                {visitStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Responsável e aceite técnico" subtitle="Dados do responsável, local de instalação, valor do equipamento e aceite operacional.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Nome do responsável">
              <input
                value={visit.responsible.name}
                onChange={(event) =>
                  setVisit((current) => ({
                    ...current,
                    responsible: { ...current.responsible, name: event.target.value },
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="Cargo">
              <input
                value={visit.responsible.role}
                onChange={(event) =>
                  setVisit((current) => ({
                    ...current,
                    responsible: { ...current.responsible, role: event.target.value },
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                required
              />
            </FormField>
            <FormField label="Valor do equipamento">
              <input
                type="number"
                min="0"
                step="0.01"
                value={visit.responsible.equipmentValue}
                onChange={(event) =>
                  setVisit((current) => ({
                    ...current,
                    responsible: { ...current.responsible, equipmentValue: event.target.value },
                  }))
                }
                placeholder="0,00"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
            <FormField label="Local da instalação">
              <input
                value={visit.installationLocation}
                onChange={(event) => setVisit((current) => ({ ...current, installationLocation: event.target.value }))}
                placeholder="Ex.: Casa de bombas, subsolo"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.5fr]">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={visit.responsible.acknowledged}
                onChange={(event) =>
                  setVisit((current) => ({
                    ...current,
                    responsible: {
                      ...current.responsible,
                      acknowledged: event.target.checked,
                      acknowledgedAt: event.target.checked ? new Date().toISOString() : '',
                    },
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Aceite técnico confirmado
            </label>
            <FormField label="Observações do aceite">
              <input
                value={visit.acceptanceNotes}
                onChange={(event) => setVisit((current) => ({ ...current, acceptanceNotes: event.target.value }))}
                placeholder="Observações adicionais sobre instalação, funcionamento ou responsabilidade"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
              />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Checklist Técnico" subtitle="Situação atual dos equipamentos e evidências do serviço executado.">
          <div className="space-y-4">
            {visit.checklist.map((item, index) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <textarea
                      value={item.observations}
                      onChange={(event) => updateChecklist(index, 'observations', event.target.value)}
                      rows="3"
                      placeholder="Observações"
                      className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                    />
                  </div>
                  <FormField label="Situação Atual">
                    <select
                      value={item.status}
                      onChange={(event) => updateChecklist(index, 'status', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                    >
                      {checklistStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>
            ))}

            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="Ações Realizadas">
                <textarea
                  rows="4"
                  value={visit.actionsPerformed}
                  onChange={(event) => setVisit((current) => ({ ...current, actionsPerformed: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
              <FormField label="Problemas Fora da Alçada">
                <textarea
                  rows="4"
                  value={visit.outsideScope}
                  onChange={(event) => setVisit((current) => ({ ...current, outsideScope: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
              <FormField label="Melhorias Sugeridas">
                <textarea
                  rows="4"
                  value={visit.improvements}
                  onChange={(event) => setVisit((current) => ({ ...current, improvements: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                />
              </FormField>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Fotos e termo assinado" subtitle="Anexos reais armazenados no Vercel Blob, com metadados persistidos no banco.">
          <VisitFileUploader
            files={visit.files ?? []}
            disabled={!existingVisit?.id}
            canDelete={canDeleteFiles}
            onUpload={async (file, fileType) => {
              if (!existingVisit?.id) {
                return;
              }

              const uploadedFile = await uploadVisitFile(existingVisit.id, file, fileType);
              setVisit((current) => ({
                ...current,
                files: [uploadedFile, ...(current.files ?? [])],
                photos: uploadedFile.mimeType?.startsWith('image/')
                  ? [uploadedFile, ...(current.photos ?? [])]
                  : current.photos ?? [],
              }));
            }}
            onDelete={async (fileId) => {
              if (!existingVisit?.id) {
                return;
              }

              const deleted = await deleteVisitFile(existingVisit.id, fileId);
              if (deleted) {
                setVisit((current) => ({
                  ...current,
                  files: (current.files ?? []).filter((file) => file.id !== fileId),
                  photos: (current.photos ?? []).filter((file) => file.id !== fileId),
                }));
              }
            }}
          />
        </SectionCard>

        <SectionCard title="Pré-visualização do relatório" subtitle="Resumo do documento que poderá ser gerado e consultado no módulo de relatórios.">
          <ReportPreview visit={visit} condominium={selectedCondominium} technician={selectedTechnician} />
        </SectionCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/app/visits')}
            className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar visita técnica'}
          </button>
        </div>
      </form>
    </div>
  );
}
