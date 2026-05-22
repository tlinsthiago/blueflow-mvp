import { formatDate } from './formatters';

const signature = 'F TEC AUTOMAÇÃO\nAutomação e manutenção hidráulica para condomínios';

function encoded(value) {
  return encodeURIComponent(value);
}

function normalizePhoneForWhatsapp(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('55')) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

export function openShareLink(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function whatsappShareUrl({ message, phone }) {
  const normalizedPhone = normalizePhoneForWhatsapp(phone);
  const baseUrl = normalizedPhone ? `https://wa.me/${normalizedPhone}` : 'https://wa.me/';

  return `${baseUrl}?text=${encoded(message)}`;
}

export function emailShareUrl({ to = '', subject, body }) {
  const recipient = to?.trim() ? encoded(to.trim()) : '';

  return `mailto:${recipient}?subject=${encoded(subject)}&body=${encoded(body)}`;
}

export function buildReportShareContent({ report, visit, condominium, technician }) {
  const condominiumName = condominium?.name ?? 'condomínio informado';
  const visitDate = formatDate(visit?.visitDate);
  const serviceType = visit?.serviceType ?? 'serviço técnico';
  const version = report?.version ? ` - versão ${report.version}` : '';
  const recipientEmail = condominium?.managerEmail ?? '';
  const recipientPhone = condominium?.managerPhone ?? '';

  const subject = `Relatório técnico - ${condominiumName}`;
  const body = [
    `Olá, segue o relatório técnico${version} da F TEC AUTOMAÇÃO em anexo.`,
    '',
    `Condomínio: ${condominiumName}`,
    `Data da visita: ${visitDate}`,
    `Tipo de serviço: ${serviceType}`,
    technician?.name ? `Técnico responsável: ${technician.name}` : '',
    '',
    'Arquivo baixado pelo sistema F TEC AUTOMAÇÃO.',
    '',
    signature,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject,
    body,
    whatsappUrl: whatsappShareUrl({ message: body, phone: recipientPhone }),
    emailUrl: emailShareUrl({ to: recipientEmail, subject, body }),
  };
}

export function buildContractShareContent({ contract, condominium }) {
  const condominiumName = condominium?.name ?? 'condomínio informado';
  const status = contract?.status ?? 'status não informado';
  const contractNumber = contract?.contractNumber ?? 'contrato';
  const recipientEmail = condominium?.managerEmail ?? '';
  const recipientPhone = condominium?.managerPhone ?? '';

  const subject = `Contrato ${contractNumber} - ${condominiumName}`;
  const body = [
    'Olá, segue o contrato da F TEC AUTOMAÇÃO em anexo.',
    '',
    `Condomínio: ${condominiumName}`,
    `Número do contrato: ${contractNumber}`,
    `Status: ${status}`,
    '',
    'Arquivo baixado pelo sistema F TEC AUTOMAÇÃO.',
    '',
    signature,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject,
    body,
    whatsappUrl: whatsappShareUrl({ message: body, phone: recipientPhone }),
    emailUrl: emailShareUrl({ to: recipientEmail, subject, body }),
  };
}
