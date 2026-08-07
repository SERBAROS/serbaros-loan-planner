export type ExportFormat = 'excel' | 'pdf';

export interface ExportOptions {
  /** undefined = todas las simulaciones; [] = ninguna; [id,...] = solo esas. */
  simulacionIds?: number[];
  incluirTabla: boolean;
}

export interface LoanExportRepositoryPort {
  fetchExport(loanId: number, format: ExportFormat, options: ExportOptions): Promise<{ blob: Blob; filename: string }>;
}
