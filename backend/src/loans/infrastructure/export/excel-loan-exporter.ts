import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { ExcelExporterPort } from '../../domain/ports/excel-exporter.port';
import { LoanExportData, LoanExportPlan } from '../../domain/ports/loan-export-data';

const PERCENT_FMT = '0.00%';

function buildCurrencyFormat(currencyCode: string): string {
  const parts = new Intl.NumberFormat('es-CO', { style: 'currency', currency: currencyCode }).formatToParts(0);
  const symbol = parts.find((p) => p.type === 'currency')?.value ?? '$';
  const decimals =
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: currencyCode }).resolvedOptions()
      .maximumFractionDigits ?? 0;
  const safeSymbol = symbol.replace(/"/g, "'");
  return decimals > 0 ? `"${safeSymbol}"#,##0.${'0'.repeat(decimals)}` : `"${safeSymbol}"#,##0`;
}
const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF212832' } };
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFECE7DB' } };

@Injectable()
export class ExcelJsLoanExporter implements ExcelExporterPort {
  async generate(data: LoanExportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = data.generadoPor.nombre || data.generadoPor.email;
    workbook.created = new Date(data.generadoEl);

    this.buildInfoSheet(workbook, data);
    this.buildResumenSheet(workbook, data);

    const usedNames = new Set<string>();
    for (const plan of data.planes) {
      this.buildPlanSheet(workbook, plan, this.uniqueSheetName(plan.nombre, usedNames), data.loan.moneda);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private buildInfoSheet(workbook: ExcelJS.Workbook, data: LoanExportData) {
    const sheet = workbook.addWorksheet('Información');
    sheet.columns = [{ width: 22 }, { width: 40 }];

    sheet.addRow(['Reporte', 'Plan de pagos — ' + data.loan.nombre]).font = { bold: true, size: 14 };
    sheet.addRow([]);
    sheet.addRow(['Generado por', data.generadoPor.nombre || data.generadoPor.email]);
    if (data.generadoPor.nombre) sheet.addRow(['Correo', data.generadoPor.email]);
    sheet.addRow(['Generado el', new Date(data.generadoEl).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })]);
    sheet.addRow([]);
    sheet.addRow(['Préstamo', data.loan.nombre]);
    sheet.addRow(['Estado', data.loan.estado === 'EN_EJECUCION' ? 'En ejecución' : 'Nuevo']);
    sheet.addRow(['Moneda', data.loan.moneda]);
    sheet.addRow([]);

    const leyendaHeader = sheet.addRow(['Contenido de este archivo', '']);
    leyendaHeader.font = { bold: true };
    sheet.addRow(['Estimación', 'El plan calculado del préstamo tal como está registrado.']);
    if (data.planes.some((p) => p.key === 'real')) {
      sheet.addRow(['Pago real', 'El plan con los abonos/cuotas extra que realmente se pagaron.']);
    }
    for (const plan of data.planes) {
      if (plan.key.startsWith('simulacion-')) {
        sheet.addRow([plan.nombre, 'Escenario hipotético guardado sobre el préstamo base.']);
      }
    }

    sheet.getColumn(1).font = { bold: true };
  }

  private uniqueSheetName(nombre: string, used: Set<string>): string {
    // Excel: máx 31 caracteres, sin : \ / ? * [ ]
    const base = nombre.replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 31) || 'Hoja';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) {
      const suffix = ` (${i})`;
      candidate = base.slice(0, 31 - suffix.length) + suffix;
      i++;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  }

  private buildResumenSheet(workbook: ExcelJS.Workbook, data: LoanExportData) {
    const currencyFmt = buildCurrencyFormat(data.loan.moneda);
    const sheet = workbook.addWorksheet('Resumen');
    sheet.columns = [{ width: 28 }, { width: 22 }];

    sheet.addRow(['Préstamo', data.loan.nombre]).font = { bold: true, size: 14 };
    sheet.addRow(['Estado', data.loan.estado === 'EN_EJECUCION' ? 'En ejecución' : 'Nuevo']);
    sheet.addRow(['Moneda', data.loan.moneda]);
    sheet.addRow(['Generado el', new Date(data.generadoEl).toLocaleString('es-CO')]);
    sheet.addRow([]);

    const estimacion = data.planes.find((p) => p.key === 'estimacion');
    if (estimacion) {
      sheet.addRow(['Monto', estimacion.resumen.monto]).getCell(2).numFmt = currencyFmt;
      const teaRow = sheet.addRow(['TEA', estimacion.resumen.tasaEfectivaAnual]);
      teaRow.getCell(2).numFmt = PERCENT_FMT;
      sheet.addRow(['Tasa mensual', estimacion.resumen.tasaMensual]).getCell(2).numFmt = PERCENT_FMT;
      sheet.addRow(['Valor cuota', estimacion.resumen.valorCuota]).getCell(2).numFmt = currencyFmt;
      sheet.addRow(['Cuota inicial (numeración)', estimacion.resumen.numeroCuotaInicial]);
    }
    sheet.addRow([]);

    // Tabla comparativa: una fila por plan, columnas con las métricas clave
    const headerRow = sheet.addRow([
      'Plan',
      'Cuotas reales',
      'Valor cuota',
      'Total intereses',
      'Total capital',
      'Total abonado extra',
      'Ahorro intereses vs. estimación',
      'Cuotas adelantadas vs. estimación',
    ]);
    headerRow.eachCell((cell) => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
    });

    for (const plan of data.planes) {
      const row = sheet.addRow([
        plan.nombre,
        plan.resumen.numeroCuotasReales,
        plan.resumen.valorCuota,
        plan.resumen.totalIntereses,
        plan.resumen.totalCapital,
        plan.resumen.totalAbonosExtra,
        plan.comparacion ? plan.comparacion.interesesAhorrados : null,
        plan.comparacion ? plan.comparacion.cuotasAdelantadas : null,
      ]);
      [3, 4, 5, 6, 7].forEach((col) => {
        row.getCell(col).numFmt = currencyFmt;
      });
    }

    sheet.getColumn(1).width = 24;
    for (let c = 2; c <= 8; c++) sheet.getColumn(c).width = 20;
  }

  private buildPlanSheet(workbook: ExcelJS.Workbook, plan: LoanExportPlan, sheetName: string, monedaCodigo: string) {
    const currencyFmt = buildCurrencyFormat(monedaCodigo);
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = [
      { header: 'No.', key: 'numeroCuota', width: 8 },
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Saldo inicial', key: 'saldoInicial', width: 16 },
      { header: 'Interés', key: 'interes', width: 14 },
      { header: 'Capital', key: 'capital', width: 14 },
      { header: 'Cuota', key: 'cuota', width: 14 },
      { header: 'Abono extra', key: 'abonoExtra', width: 16 },
      { header: 'Saldo final', key: 'saldoFinal', width: 16 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
    });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    for (const fila of plan.tabla) {
      sheet.addRow(fila);
    }

    ['saldoInicial', 'interes', 'capital', 'cuota', 'abonoExtra', 'saldoFinal'].forEach((key) => {
      sheet.getColumn(key).numFmt = currencyFmt;
    });
  }
}
