import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PdfExporterPort } from '../../domain/ports/pdf-exporter.port';
import { LoanExportData, LoanExportPlan } from '../../domain/ports/loan-export-data';
import { FilaAmortizacion } from '../../domain/services/amortization.service';

function makeMoneyFormatter(currencyCode: string) {
  const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: currencyCode });
  return (n: number) => fmt.format(n);
}
const percent = (n: number) => (n * 100).toFixed(2) + '%';
type MoneyFn = (n: number) => string;

const PORTRAIT_MARGIN = 40;
const LANDSCAPE_MARGIN = 36;
const LANDSCAPE_PAGE_HEIGHT = 595.28; // A4 landscape: width/height se intercambian
const LANDSCAPE_BOTTOM = LANDSCAPE_PAGE_HEIGHT - LANDSCAPE_MARGIN - 12;

interface TableColumn {
  key: keyof FilaAmortizacion;
  header: string;
  width: number;
  money?: boolean;
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'numeroCuota', header: 'No.', width: 35 },
  { key: 'fecha', header: 'Fecha', width: 65 },
  { key: 'saldoInicial', header: 'Saldo inicial', width: 95, money: true },
  { key: 'interes', header: 'Interés', width: 85, money: true },
  { key: 'capital', header: 'Capital', width: 85, money: true },
  { key: 'cuota', header: 'Cuota', width: 85, money: true },
  { key: 'abonoExtra', header: 'Abono extra', width: 95, money: true },
  { key: 'saldoFinal', header: 'Saldo final', width: 95, money: true },
];

@Injectable()
export class PdfKitLoanExporter implements PdfExporterPort {
  async generate(data: LoanExportData): Promise<Buffer> {
    const money = makeMoneyFormatter(data.loan.moneda);
    const doc = new PDFDocument({ size: 'A4', margin: PORTRAIT_MARGIN });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    // Página 1 (portrait): resumen ejecutivo — igual que antes
    this.renderHeader(doc, data);
    this.renderDatosCredito(doc, data, money);
    this.renderTablaComparativa(doc, data, money);
    this.renderDestacado(doc, data, money);

    // Una o más páginas landscape por cada plan, con su tabla de amortización
    // completa — el mismo contenido que cada hoja del Excel.
    for (const plan of data.planes) {
      this.renderPlanTable(doc, plan, money);
    }

    doc.end();
    return done;
  }

  private renderHeader(doc: PDFKit.PDFDocument, data: LoanExportData) {
    doc.fontSize(20).fillColor('#14181c').text(data.loan.nombre, { continued: false });
    doc
      .fontSize(10)
      .fillColor('#6f7885')
      .text(
        `Estado: ${data.loan.estado === 'EN_EJECUCION' ? 'En ejecución' : 'Nuevo'}  ·  Generado el ${new Date(
          data.generadoEl,
        ).toLocaleString('es-CO')}`,
      );
    doc
      .fontSize(10)
      .fillColor('#6f7885')
      .text(`Generado por: ${data.generadoPor.nombre || data.generadoPor.email}`);
    doc.moveDown(1);
  }

  private renderDatosCredito(doc: PDFKit.PDFDocument, data: LoanExportData, money: MoneyFn) {
    const estimacion = data.planes.find((p) => p.key === 'estimacion');
    if (!estimacion) return;

    doc.fontSize(13).fillColor('#14181c').text('Datos del crédito');
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .fillColor('#333')
      .text(
        `Monto: ${money(estimacion.resumen.monto)}   ·   TEA: ${percent(
          estimacion.resumen.tasaEfectivaAnual,
        )}   ·   Tasa mensual: ${percent(estimacion.resumen.tasaMensual)}   ·   Cuota: ${money(
          estimacion.resumen.valorCuota,
        )}`,
      );
    doc.moveDown(1.2);
  }

  private renderTablaComparativa(doc: PDFKit.PDFDocument, data: LoanExportData, money: MoneyFn) {
    doc.fontSize(13).fillColor('#14181c').text('Comparación de planes');
    doc.moveDown(0.4);

    const startX = doc.x;
    let y = doc.y;
    const colWidths = [110, 70, 85, 90, 90, 90];
    const headers = ['Plan', 'Cuotas reales', 'Valor cuota', 'Total intereses', 'Ahorro intereses', 'Cuotas adelanto'];

    doc.fontSize(9).fillColor('#ffffff');
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 20).fill('#212832');
    doc.fillColor('#ece7db');
    let x = startX;
    headers.forEach((h, i) => {
      doc.text(h, x + 4, y + 6, { width: colWidths[i] - 8 });
      x += colWidths[i];
    });
    y += 20;

    doc.fontSize(9);
    for (const plan of data.planes) {
      const rowValues = [
        plan.nombre,
        String(plan.resumen.numeroCuotasReales),
        money(plan.resumen.valorCuota),
        money(plan.resumen.totalIntereses),
        plan.comparacion ? money(plan.comparacion.interesesAhorrados) : '—',
        plan.comparacion ? String(plan.comparacion.cuotasAdelantadas) : '—',
      ];

      doc.fillColor('#f3f1ea');
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 18).fill('#f3f1ea');
      doc.fillColor('#14181c');
      x = startX;
      rowValues.forEach((v, i) => {
        doc.text(v, x + 4, y + 4, { width: colWidths[i] - 8 });
        x += colWidths[i];
      });
      y += 18;

      if (y > 750) {
        doc.addPage();
        y = doc.y;
      }
    }

    doc.y = y + 16;
  }

  private renderDestacado(doc: PDFKit.PDFDocument, data: LoanExportData, money: MoneyFn) {
    const candidatos = data.planes.filter((p) => p.comparacion);
    if (candidatos.length === 0) return;

    const mejor = candidatos.reduce((best, p) =>
      (p.comparacion?.interesesAhorrados ?? -Infinity) > (best.comparacion?.interesesAhorrados ?? -Infinity) ? p : best,
    );

    if (!mejor.comparacion || mejor.comparacion.interesesAhorrados <= 0) return;

    const nombrePrestamo = data.loan.nombre;
    const ahorro = money(mejor.comparacion.interesesAhorrados);
    const cuotas = mejor.comparacion.cuotasAdelantadas;
    const cuotasTexto = cuotas === 1 ? '1 cuota' : `${cuotas} cuotas`;

    doc.moveDown(0.6);
    const boxTop = doc.y;
    const boxLeft = PORTRAIT_MARGIN;
    const boxWidth = doc.page.width - PORTRAIT_MARGIN * 2;
    const boxHeight = 62;

    doc.roundedRect(boxLeft, boxTop, boxWidth, boxHeight, 6).fill('#eaf6ef');
    doc
      .fontSize(11)
      .fillColor('#2f7a52')
      .text('Un consejo antes de seguir', boxLeft + 16, boxTop + 12, { width: boxWidth - 32 });
    doc
      .fontSize(10)
      .fillColor('#3a5c48')
      .text(
        `Con "${mejor.nombre}" te podrías ahorrar ${ahorro} en intereses y terminar de pagar "${nombrePrestamo}" ${cuotasTexto} antes de lo previsto. Vale la pena echarle un ojo a esa simulación con calma.`,
        boxLeft + 16,
        boxTop + 28,
        { width: boxWidth - 32 },
      );

    doc.y = boxTop + boxHeight + 12;
  }

  /**
   * Tabla de amortización completa de un plan, en página(s) horizontales
   * (hay 9 columnas — en horizontal caben cómodas). Replica exactamente
   * la misma tabla que cada hoja del Excel.
   */
  private renderPlanTable(doc: PDFKit.PDFDocument, plan: LoanExportPlan, money: MoneyFn) {
    doc.addPage({ size: 'A4', layout: 'landscape', margin: LANDSCAPE_MARGIN });

    doc.fontSize(14).fillColor('#14181c').text(`Tabla de amortización — ${plan.nombre}`);
    doc.moveDown(0.5);

    const startX = LANDSCAPE_MARGIN;
    let y = doc.y;
    y = this.drawTableHeader(doc, startX, y);

    doc.fontSize(8);
    let rowIndex = 0;
    for (const fila of plan.tabla) {
      if (y > LANDSCAPE_BOTTOM) {
        doc.addPage({ size: 'A4', layout: 'landscape', margin: LANDSCAPE_MARGIN });
        y = LANDSCAPE_MARGIN;
        y = this.drawTableHeader(doc, startX, y);
        doc.fontSize(8);
      }

      const totalWidth = TABLE_COLUMNS.reduce((a, c) => a + c.width, 0);
      if (rowIndex % 2 === 1) {
        doc.rect(startX, y, totalWidth, 14).fill('#f3f1ea');
      }
      doc.fillColor('#14181c');

      let x = startX;
      for (const col of TABLE_COLUMNS) {
        const raw = fila[col.key];
        const text = col.money ? money(raw as number) : String(raw);
        doc.text(text, x + 3, y + 3, {
          width: col.width - 6,
          height: 12,
          lineBreak: false,
          ellipsis: true,
          align: col.key === 'fecha' || col.key === 'numeroCuota' ? 'left' : 'right',
        });
        x += col.width;
      }
      y += 14;
      rowIndex++;
    }

    doc.y = y;
  }

  private drawTableHeader(doc: PDFKit.PDFDocument, startX: number, y: number): number {
    const totalWidth = TABLE_COLUMNS.reduce((a, c) => a + c.width, 0);
    doc.rect(startX, y, totalWidth, 18).fill('#212832');
    doc.fontSize(8).fillColor('#ece7db');
    let x = startX;
    for (const col of TABLE_COLUMNS) {
      doc.text(col.header, x + 3, y + 5, {
        width: col.width - 6,
        height: 12,
        lineBreak: false,
        ellipsis: true,
        align: col.key === 'fecha' || col.key === 'numeroCuota' ? 'left' : 'right',
      });
      x += col.width;
    }
    return y + 18;
  }
}
