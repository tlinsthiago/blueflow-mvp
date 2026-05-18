import { formatCurrency, formatDateTime } from '../utils/formatters';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildTermHtml({ visit, condominium, technician }) {
  const responsibleName = visit.responsible?.name || visit.acceptanceResponsibleName || 'Não informado';
  const responsibleRole = visit.responsible?.role || visit.acceptanceResponsibleRole || 'Não informado';
  const installationLocation = visit.installationLocation || condominium?.address || 'Não informado';
  const equipmentValue = formatCurrency(visit.responsible?.equipmentValue || visit.equipmentValue || 0);
  const acceptedText = visit.responsible?.acknowledged ? 'Aceite técnico confirmado' : 'Aceite técnico pendente';

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Termo de Instalação e Aceite Técnico</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #f8fafc; color: #0f172a; font-family: Arial, sans-serif; }
      .page { max-width: 920px; margin: 24px auto; background: #fff; padding: 48px 56px; border: 1px solid #e2e8f0; }
      h1 { margin: 0; text-align: center; font-size: 22px; text-transform: uppercase; letter-spacing: .04em; }
      h2 { margin: 28px 0 10px; font-size: 15px; text-transform: uppercase; color: #075985; }
      p, li { font-size: 14px; line-height: 1.65; }
      .muted { color: #475569; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .field { border: 1px solid #cbd5e1; padding: 10px 12px; min-height: 58px; }
      .label { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
      .value { font-weight: 700; }
      .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #e0f2fe; color: #075985; font-size: 12px; font-weight: 700; }
      .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 54px; }
      .line { border-top: 1px solid #0f172a; padding-top: 10px; text-align: center; min-height: 74px; }
      @media print {
        body { background: #fff; }
        .page { margin: 0; max-width: none; border: 0; padding: 28px 36px; }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <h1>Termo de Instalação, Aceite Técnico e Responsabilidade Operacional</h1>
      <p class="muted" style="text-align:center">F TEC AUTOMAÇÃO</p>

      <h2>1. Identificação do cliente/condomínio</h2>
      <div class="grid">
        <div class="field"><span class="label">Condomínio</span><span class="value">${escapeHtml(condominium?.name || 'Não informado')}</span></div>
        <div class="field"><span class="label">Razão social</span><span class="value">${escapeHtml(condominium?.legalName || 'Não informado')}</span></div>
        <div class="field"><span class="label">CNPJ</span><span class="value">${escapeHtml(condominium?.cnpj || 'Não informado')}</span></div>
        <div class="field"><span class="label">Endereço</span><span class="value">${escapeHtml(condominium?.address || condominium?.addressLine || 'Não informado')}</span></div>
      </div>

      <h2>2. Instalação e funcionamento</h2>
      <p>
        A F TEC AUTOMAÇÃO declara que realizou a instalação, configuração, verificação ou atendimento técnico do sistema
        indicado neste termo. O responsável abaixo declara que recebeu as orientações quanto à utilização,
        operacionalidade, boas práticas de preservação e acompanhamento do equipamento ou sistema instalado.
      </p>
      <div class="grid">
        <div class="field"><span class="label">Serviço</span><span class="value">${escapeHtml(visit.serviceType)}</span></div>
        <div class="field"><span class="label">Técnico responsável</span><span class="value">${escapeHtml(technician?.name || 'Não informado')}</span></div>
        <div class="field"><span class="label">Data</span><span class="value">${escapeHtml(formatDateTime(visit.visitDate))}</span></div>
        <div class="field"><span class="label">Local da instalação</span><span class="value">${escapeHtml(installationLocation)}</span></div>
      </div>

      <h2>3. Responsabilidade sobre equipamento</h2>
      <p>
        O cliente/condomínio declara ciência de que o equipamento possui valor comercial indicado neste termo,
        comprometendo-se a zelar pela integridade física e operacional do sistema. Em caso de mau uso, violação,
        intervenção indevida, extravio, danos físicos ou danos causados por terceiros vinculados ao ambiente de
        instalação, poderá ser de responsabilidade do cliente/condomínio o valor correspondente à substituição do
        equipamento, sem prejuízo de eventuais custos técnicos de reinstalação ou deslocamento operacional.
      </p>
      <div class="grid">
        <div class="field"><span class="label">Valor comercial do equipamento</span><span class="value">${escapeHtml(equipmentValue)}</span></div>
        <div class="field"><span class="label">Status do aceite</span><span class="badge">${escapeHtml(acceptedText)}</span></div>
      </div>

      <h2>4. Aceite técnico</h2>
      <p>
        O responsável declara que realizou a validação visual e operacional do sistema instalado, não havendo, nesta
        data, ressalva registrada quanto ao funcionamento, salvo observações expressamente indicadas abaixo. Este aceite
        não substitui assinatura eletrônica formal nem comprovante físico assinado.
      </p>
      <div class="grid">
        <div class="field"><span class="label">Responsável</span><span class="value">${escapeHtml(responsibleName)}</span></div>
        <div class="field"><span class="label">Cargo/Função</span><span class="value">${escapeHtml(responsibleRole)}</span></div>
      </div>
      <p><strong>Observações:</strong> ${escapeHtml(visit.acceptanceNotes || 'Sem observações adicionais.')}</p>

      <div class="signatures">
        <div class="line">
          <strong>${escapeHtml(responsibleName)}</strong><br />
          <span class="muted">${escapeHtml(responsibleRole)}</span>
        </div>
        <div class="line">
          <strong>F TEC AUTOMAÇÃO</strong><br />
          <span class="muted">Responsável técnico</span>
        </div>
      </div>
    </main>
  </body>
</html>`;
}

export function printAcceptanceTerm({ visit, condominium, technician }) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Termo de instalação e aceite técnico');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';

  document.body.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument ?? iframeWindow?.document;

  if (!iframeWindow || !iframeDocument) {
    iframe.remove();
    return;
  }

  iframeDocument.open();
  iframeDocument.write(buildTermHtml({ visit, condominium, technician }));
  iframeDocument.close();

  iframe.onload = () => {
    iframeWindow.focus();
    iframeWindow.print();
    window.setTimeout(() => iframe.remove(), 500);
  };

  window.setTimeout(() => {
    iframeWindow.focus();
    iframeWindow.print();
    iframe.remove();
  }, 250);
}

export function AcceptanceTermPreview({ visit, condominium, technician }) {
  if (!visit || !condominium || !technician) {
    return null;
  }

  const responsibleName = visit.responsible?.name || 'Não informado';
  const responsibleRole = visit.responsible?.role || 'Não informado';

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">F TEC AUTOMAÇÃO</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Termo de Instalação, Aceite Técnico e Responsabilidade Operacional
          </h2>
          <p className="mt-1 text-sm text-slate-500">{condominium.name}</p>
        </div>
        <button
          type="button"
          onClick={() => printAcceptanceTerm({ visit, condominium, technician })}
          className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          Imprimir termo
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Cliente/condomínio</p>
          <p className="mt-1 font-semibold text-slate-900">{condominium.legalName || condominium.name}</p>
          <p className="mt-1 text-sm text-slate-600">{condominium.address}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Instalação e funcionamento</p>
          <p className="mt-1 font-semibold text-slate-900">{visit.serviceType}</p>
          <p className="mt-1 text-sm text-slate-600">Técnico: {technician.name}</p>
          <p className="text-sm text-slate-600">Data: {formatDateTime(visit.visitDate)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Responsabilidade sobre equipamento</p>
          <p className="mt-1 text-sm text-slate-600">
            Local: {visit.installationLocation || condominium.address || 'Não informado'}
          </p>
          <p className="text-sm text-slate-600">Valor comercial: {formatCurrency(visit.responsible?.equipmentValue || 0)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Aceite técnico</p>
          <p className="mt-1 font-semibold text-slate-900">{visit.responsible?.acknowledged ? 'Confirmado' : 'Pendente'}</p>
          <p className="mt-1 text-sm text-slate-600">
            {responsibleName} - {responsibleRole}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
        <p>
          O responsável declara ciência sobre instalação, funcionamento, boas práticas de uso e responsabilidade operacional
          do equipamento, conforme atendimento realizado pela F TEC AUTOMAÇÃO. O termo assinado pode ser anexado à visita
          para consulta operacional.
        </p>
        <p className="mt-3">
          <strong>Observações:</strong> {visit.acceptanceNotes || 'Sem observações adicionais.'}
        </p>
      </div>
    </div>
  );
}
