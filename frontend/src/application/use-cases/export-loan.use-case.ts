import { LoanExportRepositoryPort, ExportFormat, ExportOptions } from '../../domain/ports/loan-export-repository.port';

export class ExportLoanUseCase {
  constructor(private readonly loanExportRepository: LoanExportRepositoryPort) {}

  execute(loanId: number, format: ExportFormat, options: ExportOptions) {
    return this.loanExportRepository.fetchExport(loanId, format, options);
  }
}
