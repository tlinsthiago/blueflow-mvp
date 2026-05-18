import { contractStatuses } from '../data/mockData';
import { formatCurrency, formatDate } from './formatters';

export function createEmptyContract() {
  return {
    condominiumId: '',
    contractNumber: '',
    serviceType: 'Manutenção Preventiva',
    monthlyValue: '',
    dueDay: '',
    termMonths: '',
    startDate: '',
    signatureDate: '',
    monthlyPreventiveVisits: '1',
    emergencySlaHours: '',
    nonEmergencySlaHours: '',
    jurisdiction: 'Recife/PE',
    status: contractStatuses[0],
    notes: '',
    signedFileId: '',
    signedFile: null,
  };
}

export function normalizeCondominium(raw) {
  const city = raw.city ?? extractCity(raw.address);
  const state = raw.state ?? extractState(raw.address);
  const addressLine = raw.addressLine ?? extractAddressLine(raw.address);
  const legalName = raw.legalName ?? raw.name;

  return {
    ...raw,
    legalName,
    cnpj: raw.cnpj ?? '',
    addressLine,
    city,
    state,
    address: buildFullAddress({ addressLine, city, state }),
    manager: raw.manager ?? '',
    managerCpf: raw.managerCpf ?? '',
    managerPhone: raw.managerPhone ?? '',
    managerEmail: raw.managerEmail ?? '',
    units: Number(raw.units) || 0,
  };
}

export function normalizeCompanySettings(raw) {
  return {
    legalName: raw?.legalName ?? 'F TEC AUTOMAÇÃO',
    cnpj: raw?.cnpj ?? '',
    addressLine: raw?.addressLine ?? '',
    city: raw?.city ?? '',
    state: raw?.state ?? '',
    legalRepresentative: raw?.legalRepresentative ?? '',
    representativeCpf: raw?.representativeCpf ?? '',
    phone: raw?.phone ?? '',
    email: raw?.email ?? '',
  };
}

export function normalizeContract(raw) {
  return {
    ...createEmptyContract(),
    ...raw,
    status: raw.status ?? contractStatuses[0],
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
  };
}

export function getContractLifecycleStatus(contract) {
  if (!contract) {
    return 'Rascunho';
  }

  if (contract.status === 'Assinado' && contract.startDate) {
    const start = new Date(contract.startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(contract.termMonths || 0));
    if (Date.now() > end.getTime()) {
      return 'Vencido';
    }
  }

  return contract.status;
}

export function buildContractHtml({ contract, condominium, companySettings }) {
  const status = getContractLifecycleStatus(contract);
  const contractorAddress = buildFullAddress(companySettings);
  const clientAddress = buildFullAddress(condominium);
  const dateLine = `${condominium.city || 'Recife'}/${condominium.state || 'PE'}, ${formatDate(contract.signatureDate || contract.startDate)}`;

  return `<!doctype html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Contrato ${contract.contractNumber}</title>
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; color: #0f172a; margin: 0; background: #f8fafc; }
        .page { max-width: 900px; margin: 24px auto; background: white; padding: 48px 56px; box-shadow: 0 20px 45px -25px rgba(15,23,42,.25); }
        h1, h2, h3 { margin: 0; }
        h1 { text-align: center; font-size: 28px; }
        h2 { text-align: center; font-size: 16px; margin-top: 8px; }
        h3 { font-size: 18px; margin-top: 28px; }
        p, li { line-height: 1.65; font-size: 15px; }
        .muted { color: #475569; }
        .block { margin-top: 18px; }
        ul { margin-top: 8px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 48px; }
        .line { border-top: 1px solid #0f172a; padding-top: 10px; text-align: center; min-height: 78px; }
        .badge { display: inline-block; margin-top: 12px; padding: 6px 12px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-size: 12px; font-family: Arial, sans-serif; }
        @media print { body { background: white; } .page { margin: 0; box-shadow: none; max-width: none; } }
      </style>
    </head>
    <body>
      <div class="page">
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
        <h2>${contract.serviceType.toUpperCase()} – ${companySettings.legalName}</h2>
        <div class="badge">Status atual: ${status}</div>

        <div class="block">
          <p><strong>CONTRATANTE:</strong> ${condominium.legalName}, inscrito no CNPJ nº ${condominium.cnpj || 'Não informado'}, com sede em ${clientAddress}, neste ato representado por ${condominium.manager || 'responsável legal'}, CPF nº ${condominium.managerCpf || 'Não informado'}.</p>
          <p><strong>CONTRATADO:</strong> ${companySettings.legalName}, inscrito no CNPJ nº ${companySettings.cnpj || 'Não informado'}, com endereço em ${contractorAddress}, neste ato representado por ${companySettings.legalRepresentative || 'representante legal'}, CPF nº ${companySettings.representativeCpf || 'Não informado'}.</p>
          <p>As partes celebram o presente contrato de prestação de serviços, regido pelo Código Civil, pela legislação condominial aplicável e pelas normas técnicas pertinentes.</p>
        </div>

        <h3>CLÁUSULA 1 – OBJETO</h3>
        <p>Prestação de serviços técnicos especializados de ${contract.serviceType.toLowerCase()} nas áreas comuns do condomínio, incluindo rotina preventiva, monitoramento operacional, atendimento corretivo e emissão de relatórios técnicos.</p>
        <ul>
          <li>${contract.monthlyPreventiveVisits} visita(s) preventiva(s) mensal(is);</li>
          <li>Atendimento emergencial em até ${contract.emergencySlaHours || 'N/I'} hora(s);</li>
          <li>Atendimento não emergencial em até ${contract.nonEmergencySlaHours || 'N/I'} hora(s);</li>
          <li>Registro técnico das inspeções e orientações operacionais.</li>
        </ul>

        <h3>CLÁUSULA 2 – PRAZO</h3>
        <p>O prazo de vigência deste contrato é de ${contract.termMonths || 'N/I'} mês(es), com início em ${formatDate(contract.startDate)}.</p>

        <h3>CLÁUSULA 3 – VALOR E CONDIÇÕES DE PAGAMENTO</h3>
        <p>O valor mensal ajustado é de <strong>${formatCurrency(contract.monthlyValue)}</strong>, com vencimento todo dia <strong>${contract.dueDay || 'N/I'}</strong> de cada mês.</p>
        <p>O reajuste poderá ser realizado conforme índice contratual definido entre as partes, preservando o equilíbrio econômico-financeiro da contratação.</p>

        <h3>CLÁUSULA 4 – OBRIGAÇÕES DO CONTRATADO</h3>
        <ul>
          <li>Executar os serviços com técnica, segurança e observância das normas aplicáveis;</li>
          <li>Manter equipe qualificada para atendimento preventivo e corretivo;</li>
          <li>Emitir relatórios técnicos e registrar evidências sempre que necessário.</li>
        </ul>

        <h3>CLÁUSULA 5 – OBRIGAÇÕES DO CONTRATANTE</h3>
        <ul>
          <li>Disponibilizar acesso às áreas comuns e equipamentos vinculados ao contrato;</li>
          <li>Efetuar os pagamentos nas datas ajustadas;</li>
          <li>Comunicar ocorrências relevantes que impactem a execução dos serviços.</li>
        </ul>

        <h3>CLÁUSULA 6 – SLA E SUPORTE</h3>
        <p>Fica acordado SLA emergencial de ${contract.emergencySlaHours || 'N/I'} hora(s) e SLA não emergencial de ${contract.nonEmergencySlaHours || 'N/I'} hora(s), contados a partir da solicitação formal do contratante.</p>

        <h3>CLÁUSULA 7 – DISPOSIÇÕES GERAIS</h3>
        <p>O presente instrumento não estabelece exclusividade entre as partes e poderá ser complementado por ordens de serviço, relatórios ou registros operacionais vinculados ao contrato nº ${contract.contractNumber}.</p>
        <p><strong>Foro:</strong> ${contract.jurisdiction || 'Não informado'}.</p>
        ${contract.notes ? `<p><strong>Observações adicionais:</strong> ${contract.notes}</p>` : ''}

        <div class="block">
          <p>${dateLine}.</p>
        </div>

        <div class="signatures">
          <div class="line">
            <strong>CONTRATANTE</strong><br/>
            ${condominium.legalName}<br/>
            ${condominium.manager || ''}
          </div>
          <div class="line">
            <strong>CONTRATADO</strong><br/>
            ${companySettings.legalName}<br/>
            ${companySettings.legalRepresentative || ''}
          </div>
          <div class="line">
            <strong>TESTEMUNHA 1</strong><br/>
            Nome: ________________________________<br/>
            CPF: _________________________________
          </div>
          <div class="line">
            <strong>TESTEMUNHA 2</strong><br/>
            Nome: ________________________________<br/>
            CPF: _________________________________
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

export function printContractDocument(args) {
  const html = buildContractHtml(args);
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    return false;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 300);
  return true;
}

export function exportContractDocument(args) {
  const html = buildContractHtml(args);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `contrato-${args.contract.contractNumber || 'sem-numero'}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildFullAddress(entity) {
  const parts = [entity.addressLine, entity.city && entity.state ? `${entity.city}/${entity.state}` : entity.city || entity.state]
    .filter(Boolean);
  return parts.join(' - ');
}

function extractAddressLine(address = '') {
  return address.split(' - ')[0] || '';
}

function extractCity(address = '') {
  const suffix = address.split(' - ')[1] || '';
  return suffix.split('/')[0] || '';
}

function extractState(address = '') {
  const suffix = address.split(' - ')[1] || '';
  return suffix.split('/')[1] || '';
}
