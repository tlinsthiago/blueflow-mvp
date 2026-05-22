import { API_BASE_URL } from '../services/apiClient';
import { formatDate } from './formatters';

const signature = 'F TEC AUTOMAÇÃO\nAutomação e manutenção hidráulica para condomínios';

function encoded(value) {
  return encodeURIComponent(value);
}

function absoluteAppUrl(path) {
  if (typeof window === 'undefined') {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

function secureApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function openShareLink(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function whatsappShareUrl(message) {
  return `https://wa.me/?text=${encoded(message)}`;
}

export function emailShareUrl({ subject, body }) {
  return `mailto:?subject=${encoded(subject)}&body=${encoded(body)}`;
}

export function buildReportShareContent({ report, visit, condominium, technician }) {
  const condominiumName = condominium?.name ?? 'condomínio informado';
  const visitDate = formatDate(visit?.visitDate);
  const serviceType = visit?.serviceType ?? 'serviço técnico';
  const version = report?.version ? ` - versão ${report.version}` : '';
  const systemUrl = absoluteAppUrl('/app/reports');
  const downloadUrl = report?.id ? secureApiUrl(`/reports/${report.id}/download`) : '';

  const subject = `Relatório técnico - ${condominiumName}`;
  const body = [
    `Olá, segue a orientação para acesso ao relatório técnico${version} da F TEC AUTOMAÇÃO.`,
    '',
    `Condomínio: ${condominiumName}`,
    `Data da visita: ${visitDate}`,
    `Tipo de serviço: ${serviceType}`,
    technician?.name ? `Técnico responsável: ${technician.name}` : '',
    '',
    'O relatório está disponível para consulta e download no sistema.',
    `Acesso ao sistema: ${systemUrl}`,
    downloadUrl ? `Link seguro do relatório: ${downloadUrl}` : '',
    '',
    'Observação: por segurança, o arquivo pode exigir login de usuário autorizado.',
    '',
    signature,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject,
    body,
    whatsappUrl: whatsappShareUrl(body),
    emailUrl: emailShareUrl({ subject, body }),
  };
}

export function buildContractShareContent({ contract, condominium }) {
  const condominiumName = condominium?.name ?? 'condomínio informado';
  const status = contract?.status ?? 'status não informado';
  const contractNumber = contract?.contractNumber ?? 'contrato';
  const systemUrl = absoluteAppUrl('/app/contracts');
  const downloadUrl = contract?.signedFile ? secureApiUrl(`/contracts/${contract.id}/signed-file/download`) : '';

  const subject = `Contrato ${contractNumber} - ${condominiumName}`;
  const body = [
    'Olá, segue a orientação para acesso ao contrato da F TEC AUTOMAÇÃO.',
    '',
    `Condomínio: ${condominiumName}`,
    `Número do contrato: ${contractNumber}`,
    `Status: ${status}`,
    '',
    'O contrato está disponível para consulta e download no sistema.',
    `Acesso ao sistema: ${systemUrl}`,
    downloadUrl ? `Link seguro do contrato assinado: ${downloadUrl}` : '',
    '',
    'Observação: por segurança, o arquivo pode exigir login de usuário autorizado.',
    '',
    signature,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject,
    body,
    whatsappUrl: whatsappShareUrl(body),
    emailUrl: emailShareUrl({ subject, body }),
  };
}
