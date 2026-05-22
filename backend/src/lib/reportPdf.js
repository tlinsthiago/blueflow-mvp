import PDFDocument from 'pdfkit';
import { companyProfile } from '../config/company.js';

const statusLabels = {
  scheduled: 'Agendada',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  pending: 'Pendente',
  cancelled: 'Cancelada',
  normal: 'Normal',
  attention: 'Atenção',
  critical: 'Crítico',
};

const fileTypeLabels = {
  reservoir_photo: 'Foto do reservatório',
  pump_photo: 'Foto da bomba',
  electrical_panel_photo: 'Foto do quadro elétrico',
  signed_acceptance_term: 'Termo assinado',
  signed_contract: 'Contrato assinado',
  technical_report_pdf: 'Relatório técnico',
  other: 'Outro anexo',
};

function formatDateTime(value) {
  if (!value) {
    return 'Não informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Fortaleza',
  }).format(new Date(value));
}

function formatCurrency(value) {
  if (value == null || value === '') {
    return 'Não informado';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

function safeText(value, fallback = 'Não informado') {
  if (value == null || value === '') {
    return fallback;
  }

  return String(value);
}

function labelFor(value) {
  return statusLabels[value] ?? value ?? 'Não informado';
}

function fileLabelFor(value) {
  return fileTypeLabels[value] ?? value ?? 'Anexo';
}

function writeSectionTitle(doc, title) {
  doc.moveDown(0.8);
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#0f172a')
    .text(title, { continued: false });
  doc
    .moveTo(doc.x, doc.y + 4)
    .lineTo(540, doc.y + 4)
    .strokeColor('#dbe3ef')
    .stroke();
  doc.moveDown(0.7);
}

function writeLabelValue(doc, label, value) {
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748b').text(label.toUpperCase());
  doc.font('Helvetica').fontSize(10).fillColor('#0f172a').text(safeText(value), { lineGap: 2 });
  doc.moveDown(0.35);
}

function ensureSpace(doc, height = 120) {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function writeParagraph(doc, title, value) {
  ensureSpace(doc, 80);
  writeLabelValue(doc, title, safeText(value, 'Sem registro.'));
}

async function collectPdfBuffer(doc) {
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

export async function generateTechnicalReportPdf({ visit, imageAttachments = [], generatedAt = new Date() }) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 42,
    bufferPages: true,
    info: {
      Title: `Relatório técnico - ${visit.condominium?.name ?? 'Condomínio'}`,
      Author: companyProfile.tradeName,
      Subject: 'Relatório técnico de visita',
    },
  });

  doc.rect(0, 0, doc.page.width, 96).fill('#0f2a5f');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(18).text(companyProfile.tradeName, 42, 28);
  doc.font('Helvetica').fontSize(10).text(companyProfile.subtitle, 42, 52);
  doc.font('Helvetica-Bold').fontSize(13).text('Relatório Técnico de Visita', 360, 32, {
    align: 'right',
    width: 180,
  });
  doc.font('Helvetica').fontSize(8).text(`Emitido em ${formatDateTime(generatedAt)}`, 360, 55, {
    align: 'right',
    width: 180,
  });

  doc.y = 122;
  writeSectionTitle(doc, 'Identificação do atendimento');
  writeLabelValue(doc, 'Condomínio', visit.condominium?.name);
  writeLabelValue(doc, 'Endereço', [visit.condominium?.addressLine, visit.condominium?.city, visit.condominium?.state].filter(Boolean).join(' - '));
  writeLabelValue(doc, 'Responsável do condomínio', [visit.responsibleName, visit.responsibleRole].filter(Boolean).join(' - '));
  writeLabelValue(doc, 'Técnico responsável', [visit.technician?.name, visit.technician?.role].filter(Boolean).join(' - '));
  writeLabelValue(doc, 'Data da visita', formatDateTime(visit.visitDate));
  writeLabelValue(doc, 'Tipo de serviço', visit.serviceType);
  writeLabelValue(doc, 'Status da visita', labelFor(visit.status));

  writeSectionTitle(doc, 'Checklist operacional');
  if (visit.checklistItems?.length) {
    visit.checklistItems.forEach((item) => {
      ensureSpace(doc, 56);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text(safeText(item.equipment));
      doc.font('Helvetica').fontSize(9).fillColor('#334155').text(`Status: ${labelFor(item.status)}`);
      doc.font('Helvetica').fontSize(9).fillColor('#475569').text(`Observações: ${safeText(item.notes, 'Sem observações.')}`);
      doc.moveDown(0.45);
    });
  } else {
    doc.font('Helvetica').fontSize(10).fillColor('#475569').text('Nenhum item de checklist registrado.');
  }

  writeSectionTitle(doc, 'Resumo técnico');
  writeParagraph(doc, 'Ações executadas', visit.actionsPerformed);
  writeParagraph(doc, 'Problemas encontrados', visit.issuesFound);
  writeParagraph(doc, 'Melhorias sugeridas', visit.improvementsSuggested);
  writeParagraph(doc, 'Observações gerais', visit.notes);

  writeSectionTitle(doc, 'Aceite técnico');
  writeLabelValue(doc, 'Aceite confirmado', visit.acceptanceConfirmed ? 'Sim' : 'Não');
  writeLabelValue(doc, 'Responsável pelo aceite', [visit.acceptanceResponsibleName, visit.acceptanceResponsibleRole].filter(Boolean).join(' - '));
  writeLabelValue(doc, 'Local da instalação', visit.installationLocation);
  writeLabelValue(doc, 'Valor comercial do equipamento', formatCurrency(visit.equipmentValue));
  writeLabelValue(doc, 'Observações do aceite', safeText(visit.acceptanceNotes, 'Sem observações.'));

  writeSectionTitle(doc, 'Anexos e evidências');
  const files = visit.files ?? [];
  if (files.length) {
    files.forEach((file) => {
      ensureSpace(doc, 32);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a').text(fileLabelFor(file.fileType), { continued: true });
      doc.font('Helvetica').fillColor('#475569').text(` - ${file.fileName}`);
    });
  } else {
    doc.font('Helvetica').fontSize(10).fillColor('#475569').text('Nenhum anexo registrado para esta visita.');
  }

  if (imageAttachments.length) {
    doc.addPage();
    writeSectionTitle(doc, 'Fotos da visita');

    for (const attachment of imageAttachments) {
      ensureSpace(doc, 250);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text(fileLabelFor(attachment.fileType));
      doc.font('Helvetica').fontSize(8).fillColor('#64748b').text(attachment.fileName);
      doc.moveDown(0.3);

      try {
        doc.image(attachment.buffer, {
          fit: [500, 220],
          align: 'center',
        });
      } catch {
        doc.font('Helvetica').fontSize(9).fillColor('#991b1b').text('Não foi possível renderizar esta imagem no PDF.');
      }

      doc.moveDown(0.8);
    }
  }

  const pageCount = doc.bufferedPageRange().count;
  for (let index = 0; index < pageCount; index += 1) {
    doc.switchToPage(index);
    doc.font('Helvetica').fontSize(8).fillColor('#64748b').text(
      `${companyProfile.tradeName} | Relatório técnico gerado automaticamente pelo sistema | Página ${index + 1} de ${pageCount}`,
      42,
      doc.page.height - 36,
      { align: 'center', width: doc.page.width - 84 }
    );
  }

  return collectPdfBuffer(doc);
}
