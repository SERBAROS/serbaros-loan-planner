export type ExportFormat = 'excel' | 'pdf';

export interface LoanExportRepositoryPort {
  fetchExport(loanId: number, format: ExportFormat): Promise<{ blob: Blob; filename: string }>;
}
