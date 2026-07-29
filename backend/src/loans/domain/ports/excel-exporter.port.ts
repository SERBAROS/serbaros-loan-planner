import { LoanExportData } from './loan-export-data';

export const EXCEL_EXPORTER = Symbol('EXCEL_EXPORTER');

export interface ExcelExporterPort {
  generate(data: LoanExportData): Promise<Buffer>;
}
