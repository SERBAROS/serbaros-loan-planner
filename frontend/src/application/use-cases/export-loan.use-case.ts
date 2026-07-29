import { LoanExportRepositoryPort, ExportFormat } from '../../domain/ports/loan-export-repository.port';

export class ExportLoanUseCase {
  constructor(private readonly loanExportRepository: LoanExportRepositoryPort) {}

  execute(loanId: number, format: ExportFormat) {
    return this.loanExportRepository.fetchExport(loanId, format);
  }
}
