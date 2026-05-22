import PDFDocument from 'pdfkit';
import { companyProfile } from '../config/company.js';

const page = {
  marginX: 28,
  marginTop: 28,
  marginBottom: 34,
};

const colors = {
  navy: '#0f2a5f',
  blue: '#2563eb',
  slate900: '#0f172a',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  green: '#15803d',
  greenBg: '#dcfce7',
  amber: '#b45309',
  amberBg: '#fef3c7',
  red: '#b91c1c',
  redBg: '#fee2e2',
  white: '#ffffff',
};

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

function contentWidth(doc) {
  return doc.page.width - page.marginX * 2;
}

function bottomLimit(doc) {
  return doc.page.height - page.marginBottom;
}

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

  const text = String(value).trim();
  return text || fallback;
}

function labelFor(value) {
  return statusLabels[value] ?? value ?? 'Não informado';
}

function fileLabelFor(value) {
  return fileTypeLabels[value] ?? value ?? 'Anexo';
}

function statusPalette(status) {
  if (status === 'critical') {
    return { background: colors.redBg, text: colors.red };
  }

  if (status === 'attention') {
    return { background: colors.amberBg, text: colors.amber };
  }

  if (status === 'normal' || status === 'completed') {
    return { background: colors.greenBg, text: colors.green };
  }

  return { background: colors.slate100, text: colors.slate700 };
}

function ensureSpace(doc, height, topY = page.marginTop) {
  if (doc.y + height > bottomLimit(doc)) {
    doc.addPage();
    doc.y = topY;
  }
}

function rect(doc, x, y, width, height, fill, stroke = null, radius = 8) {
  doc.roundedRect(x, y, width, height, radius);
  if (fill && stroke) {
    doc.fillAndStroke(fill, stroke);
    return;
  }
  if (fill) {
    doc.fill(fill);
  }
  if (stroke) {
    doc.stroke(stroke);
  }
}

function textHeight(doc, text, options = {}) {
  const previousSize = doc._fontSize;
  if (options.fontSize) {
    doc.fontSize(options.fontSize);
  }
  const height = doc.heightOfString(safeText(text, ''), options);
  doc.fontSize(previousSize);
  return height;
}

function writeHeader(doc, generatedAt) {
  const width = contentWidth(doc);
  const x = page.marginX;
  const y = page.marginTop;
  const headerHeight = 86;

  rect(doc, x, y, width, headerHeight, colors.navy, null, 12);
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(colors.white)
    .text(companyProfile.tradeName, x + 20, y + 18, { width: 280 });
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#dbeafe')
    .text(companyProfile.subtitle, x + 20, y + 48, { width: 300 });

  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor(colors.white)
    .text('Relatório Técnico', x + width - 220, y + 20, { width: 200, align: 'right' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#dbeafe')
    .text('Manutenção predial e hidráulica', x + width - 220, y + 42, { width: 200, align: 'right' });
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#bfdbfe')
    .text(`Emitido em ${formatDateTime(generatedAt)}`, x + width - 220, y + 60, { width: 200, align: 'right' });

  doc.y = y + headerHeight + 18;
}

function writeSectionHeading(doc, title, subtitle = '') {
  ensureSpace(doc, 42);
  const x = page.marginX;
  const y = doc.y;
  const width = contentWidth(doc);

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(colors.slate900)
    .text(title, x, y, { width: 320 });

  if (subtitle) {
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(colors.slate500)
      .text(subtitle, x + 330, y + 2, { width: width - 330, align: 'right' });
  }

  doc
    .moveTo(x, y + 22)
    .lineTo(x + width, y + 22)
    .strokeColor(colors.slate200)
    .lineWidth(1)
    .stroke();

  doc.y = y + 34;
}

function writeField(doc, label, value, x, y, width) {
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(colors.slate500).text(label.toUpperCase(), x, y, { width });
  doc.font('Helvetica').fontSize(9.5).fillColor(colors.slate900).text(safeText(value), x, y + 12, {
    width,
    lineGap: 1,
  });
}

function writeBadge(doc, label, status, x, y, width = 76) {
  const palette = statusPalette(status);
  rect(doc, x, y, width, 18, palette.background, null, 9);
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor(palette.text)
    .text(label, x + 6, y + 5, { width: width - 12, align: 'center' });
}

function writeIdentification(doc, visit) {
  writeSectionHeading(doc, 'Identificação do atendimento', 'Dados principais da visita técnica');

  const x = page.marginX;
  const y = doc.y;
  const width = contentWidth(doc);
  const gap = 12;
  const cardWidth = (width - gap) / 2;
  const cardHeight = 122;

  ensureSpace(doc, cardHeight + 8);
  rect(doc, x, y, cardWidth, cardHeight, colors.slate50, colors.slate200, 10);
  rect(doc, x + cardWidth + gap, y, cardWidth, cardHeight, colors.slate50, colors.slate200, 10);

  const leftX = x + 14;
  const rightX = x + cardWidth + gap + 14;
  const innerWidth = cardWidth - 28;

  writeField(doc, 'Condomínio', visit.condominium?.name, leftX, y + 14, innerWidth);
  writeField(
    doc,
    'Endereço',
    [visit.condominium?.addressLine, visit.condominium?.city, visit.condominium?.state].filter(Boolean).join(' - '),
    leftX,
    y + 52,
    innerWidth
  );
  writeField(
    doc,
    'Responsável no local',
    [visit.responsibleName, visit.responsibleRole].filter(Boolean).join(' - '),
    leftX,
    y + 88,
    innerWidth
  );

  writeField(
    doc,
    'Técnico responsável',
    [visit.technician?.name, visit.technician?.role].filter(Boolean).join(' - '),
    rightX,
    y + 14,
    innerWidth
  );
  writeField(doc, 'Data da visita', formatDateTime(visit.visitDate), rightX, y + 52, innerWidth / 2 - 6);
  writeField(doc, 'Tipo de serviço', visit.serviceType, rightX + innerWidth / 2 + 6, y + 52, innerWidth / 2 - 6);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(colors.slate500).text('STATUS DA VISITA', rightX, y + 88);
  writeBadge(doc, labelFor(visit.status), visit.status, rightX, y + 102, 92);

  doc.y = y + cardHeight + 16;
}

function checklistRowHeight(doc, item, columns) {
  const notes = safeText(item.notes, 'Sem observações.');
  const noteHeight = textHeight(doc, notes, { width: columns.notes - 16, fontSize: 8.5, lineGap: 1 });
  return Math.max(34, noteHeight + 18);
}

function writeChecklistHeader(doc, x, y, columns) {
  rect(doc, x, y, columns.total, 24, colors.navy, null, 6);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(colors.white);
  doc.text('Equipamento', x + 10, y + 8, { width: columns.equipment - 16 });
  doc.text('Status', x + columns.equipment + 8, y + 8, { width: columns.status - 16, align: 'center' });
  doc.text('Observações', x + columns.equipment + columns.status + 8, y + 8, { width: columns.notes - 16 });
}

function writeChecklist(doc, visit) {
  writeSectionHeading(doc, 'Checklist operacional', 'Condição dos equipamentos avaliados');

  const items = visit.checklistItems ?? [];
  if (!items.length) {
    rect(doc, page.marginX, doc.y, contentWidth(doc), 42, colors.slate50, colors.slate200, 8);
    doc.font('Helvetica').fontSize(9.5).fillColor(colors.slate600).text('Nenhum item de checklist registrado.', page.marginX + 12, doc.y + 14);
    doc.y += 54;
    return;
  }

  const x = page.marginX;
  const columns = {
    total: contentWidth(doc),
    equipment: 190,
    status: 92,
    notes: contentWidth(doc) - 282,
  };

  ensureSpace(doc, 76);
  writeChecklistHeader(doc, x, doc.y, columns);
  doc.y += 24;

  items.forEach((item, index) => {
    const rowHeight = checklistRowHeight(doc, item, columns);
    if (doc.y + rowHeight > bottomLimit(doc)) {
      doc.addPage();
      doc.y = page.marginTop;
      writeChecklistHeader(doc, x, doc.y, columns);
      doc.y += 24;
    }

    const y = doc.y;
    const fill = index % 2 === 0 ? colors.white : colors.slate50;
    rect(doc, x, y, columns.total, rowHeight, fill, colors.slate200, 0);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(colors.slate900).text(safeText(item.equipment), x + 10, y + 10, {
      width: columns.equipment - 16,
    });
    writeBadge(doc, labelFor(item.status), item.status, x + columns.equipment + 12, y + 9, columns.status - 24);
    doc.font('Helvetica').fontSize(8.5).fillColor(colors.slate700).text(safeText(item.notes, 'Sem observações.'), x + columns.equipment + columns.status + 10, y + 10, {
      width: columns.notes - 18,
      lineGap: 1,
    });
    doc.y += rowHeight;
  });

  doc.y += 14;
}

function writeTextCard(doc, title, value, x, y, width) {
  const body = safeText(value, 'Sem registro.');
  const bodyHeight = textHeight(doc, body, { width: width - 24, fontSize: 9, lineGap: 2 });
  const height = Math.max(86, bodyHeight + 42);

  rect(doc, x, y, width, height, colors.slate50, colors.slate200, 9);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.slate900).text(title, x + 12, y + 12, { width: width - 24 });
  doc.font('Helvetica').fontSize(9).fillColor(colors.slate700).text(body, x + 12, y + 32, {
    width: width - 24,
    lineGap: 2,
  });

  return height;
}

function writeTechnicalSummary(doc, visit) {
  writeSectionHeading(doc, 'Resumo técnico', 'Registro do atendimento realizado');

  const x = page.marginX;
  const gap = 12;
  const cardWidth = (contentWidth(doc) - gap) / 2;
  const cards = [
    ['Ações executadas', visit.actionsPerformed],
    ['Problemas encontrados', visit.issuesFound],
    ['Melhorias sugeridas', visit.improvementsSuggested],
    ['Observações gerais', visit.notes],
  ];

  for (let index = 0; index < cards.length; index += 2) {
    const leftHeight = Math.max(86, textHeight(doc, safeText(cards[index][1], 'Sem registro.'), { width: cardWidth - 24, fontSize: 9, lineGap: 2 }) + 42);
    const rightHeight = Math.max(86, textHeight(doc, safeText(cards[index + 1][1], 'Sem registro.'), { width: cardWidth - 24, fontSize: 9, lineGap: 2 }) + 42);
    const rowHeight = Math.max(leftHeight, rightHeight);
    ensureSpace(doc, rowHeight + 12);

    const y = doc.y;
    writeTextCard(doc, cards[index][0], cards[index][1], x, y, cardWidth);
    writeTextCard(doc, cards[index + 1][0], cards[index + 1][1], x + cardWidth + gap, y, cardWidth);
    doc.y = y + rowHeight + 12;
  }
}

function writeAcceptance(doc, visit, generatedAt) {
  writeSectionHeading(doc, 'Aceite técnico', 'Responsabilidade operacional e ciência do atendimento');

  const x = page.marginX;
  const y = doc.y;
  const width = contentWidth(doc);
  const blockHeight = 142;
  ensureSpace(doc, blockHeight + 12);

  rect(doc, x, y, width, blockHeight, '#eff6ff', '#bfdbfe', 10);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.navy).text('Aceite técnico confirmado', x + 16, y + 16, { width: 220 });
  writeBadge(doc, visit.acceptanceConfirmed ? 'Confirmado' : 'Não confirmado', visit.acceptanceConfirmed ? 'completed' : 'pending', x + width - 128, y + 14, 110);

  const colWidth = (width - 56) / 3;
  writeField(doc, 'Responsável', [visit.acceptanceResponsibleName, visit.acceptanceResponsibleRole].filter(Boolean).join(' - '), x + 16, y + 48, colWidth);
  writeField(doc, 'Local da instalação', visit.installationLocation, x + 28 + colWidth, y + 48, colWidth);
  writeField(doc, 'Valor do equipamento', formatCurrency(visit.equipmentValue), x + 40 + colWidth * 2, y + 48, colWidth);
  writeField(doc, 'Data de emissão', formatDateTime(generatedAt), x + 16, y + 88, colWidth);
  writeField(doc, 'Observações do aceite', safeText(visit.acceptanceNotes, 'Sem observações.'), x + 28 + colWidth, y + 88, colWidth * 2 + 12);

  doc.y = y + blockHeight + 16;
}

function writeAttachments(doc, visit) {
  writeSectionHeading(doc, 'Anexos e evidências', 'Arquivos vinculados à visita técnica');

  const files = visit.files ?? [];
  if (!files.length) {
    rect(doc, page.marginX, doc.y, contentWidth(doc), 42, colors.slate50, colors.slate200, 8);
    doc.font('Helvetica').fontSize(9.5).fillColor(colors.slate600).text('Nenhum anexo registrado para esta visita.', page.marginX + 12, doc.y + 14);
    doc.y += 54;
    return;
  }

  const x = page.marginX;
  const width = contentWidth(doc);
  const rowHeight = 32;
  files.forEach((file, index) => {
    ensureSpace(doc, rowHeight + 4);
    const y = doc.y;
    rect(doc, x, y, width, rowHeight, index % 2 === 0 ? colors.white : colors.slate50, colors.slate200, 6);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(colors.slate900).text(fileLabelFor(file.fileType), x + 10, y + 9, { width: 150 });
    doc.font('Helvetica').fontSize(8.5).fillColor(colors.slate600).text(safeText(file.fileName), x + 168, y + 9, { width: width - 180 });
    doc.y += rowHeight + 4;
  });

  doc.y += 6;
}

function writePhotoGrid(doc, imageAttachments) {
  if (!imageAttachments.length) {
    return;
  }

  doc.addPage();
  doc.y = page.marginTop;
  writeSectionHeading(doc, 'Fotos da visita', 'Miniaturas das evidências disponíveis');

  const gap = 12;
  const x = page.marginX;
  const cardWidth = (contentWidth(doc) - gap) / 2;
  const imageHeight = 170;
  const cardHeight = 220;

  for (let index = 0; index < imageAttachments.length; index += 1) {
    const column = index % 2;
    if (column === 0) {
      ensureSpace(doc, cardHeight + 10);
    }

    const y = doc.y;
    const cardX = x + column * (cardWidth + gap);
    rect(doc, cardX, y, cardWidth, cardHeight, colors.slate50, colors.slate200, 9);

    doc.font('Helvetica-Bold').fontSize(9).fillColor(colors.slate900).text(fileLabelFor(imageAttachments[index].fileType), cardX + 10, y + 10, {
      width: cardWidth - 20,
    });
    doc.font('Helvetica').fontSize(7.5).fillColor(colors.slate500).text(imageAttachments[index].fileName, cardX + 10, y + 24, {
      width: cardWidth - 20,
    });

    try {
      doc.image(imageAttachments[index].buffer, cardX + 10, y + 44, {
        fit: [cardWidth - 20, imageHeight],
        align: 'center',
        valign: 'center',
      });
    } catch {
      rect(doc, cardX + 10, y + 44, cardWidth - 20, imageHeight, colors.white, colors.slate200, 6);
      doc.font('Helvetica').fontSize(8.5).fillColor(colors.red).text('Não foi possível renderizar esta imagem no PDF.', cardX + 18, y + 112, {
        width: cardWidth - 36,
        align: 'center',
      });
    }

    if (column === 1 || index === imageAttachments.length - 1) {
      doc.y = y + cardHeight + 12;
    }
  }
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

function writeFooters(doc) {
  const pageCount = doc.bufferedPageRange().count;
  for (let index = 0; index < pageCount; index += 1) {
    doc.switchToPage(index);
    const y = doc.page.height - 24;
    doc
      .moveTo(page.marginX, y - 8)
      .lineTo(doc.page.width - page.marginX, y - 8)
      .strokeColor(colors.slate200)
      .lineWidth(0.8)
      .stroke();
    doc.font('Helvetica').fontSize(7.5).fillColor(colors.slate500).text(
      `${companyProfile.tradeName} | Relatório técnico gerado pelo sistema | Página ${index + 1} de ${pageCount}`,
      page.marginX,
      y,
      { align: 'center', width: contentWidth(doc) }
    );
  }
}

export async function generateTechnicalReportPdf({ visit, imageAttachments = [], generatedAt = new Date() }) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: page.marginTop,
      bottom: page.marginBottom,
      left: page.marginX,
      right: page.marginX,
    },
    bufferPages: true,
    info: {
      Title: `Relatório técnico - ${visit.condominium?.name ?? 'Condomínio'}`,
      Author: companyProfile.tradeName,
      Subject: 'Relatório técnico de visita',
    },
  });

  writeHeader(doc, generatedAt);
  writeIdentification(doc, visit);
  writeChecklist(doc, visit);
  writeTechnicalSummary(doc, visit);
  writeAcceptance(doc, visit, generatedAt);
  writeAttachments(doc, visit);
  writePhotoGrid(doc, imageAttachments);
  writeFooters(doc);

  return collectPdfBuffer(doc);
}
