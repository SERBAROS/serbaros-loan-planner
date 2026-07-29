import { LoanExportData } from './loan-export-data';

export const PDF_EXPORTER = Symbol('PDF_EXPORTER');

export interface PdfExporterPort {
  generate(data: LoanExportData): Promise<Buffer>;
}
