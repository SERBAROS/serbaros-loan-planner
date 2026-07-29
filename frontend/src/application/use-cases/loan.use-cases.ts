import { LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { LoanDetail, LoanInput, LoanListItem, SimulatedPlan, SimulateLoanInput } from '../../domain/entities/loan';

export class ListLoansUseCase {
  constructor(private readonly loanRepository: LoanRepositoryPort) {}
  execute(): Promise<LoanListItem[]> {
    return this.loanRepository.list();
  }
}

export class GetLoanUseCase {
  constructor(private readonly loanRepository: LoanRepositoryPort) {}
  execute(id: number): Promise<LoanDetail> {
    return this.loanRepository.getById(id);
  }
}

export class CreateLoanUseCase {
  constructor(private readonly loanRepository: LoanRepositoryPort) {}
  execute(input: LoanInput): Promise<{ id: number }> {
    return this.loanRepository.create(input);
  }
}

export class UpdateLoanUseCase {
  constructor(private readonly loanRepository: LoanRepositoryPort) {}
  execute(id: number, input: LoanInput): Promise<void> {
    return this.loanRepository.update(id, input);
  }
}

export class DeleteLoanUseCase {
  constructor(private readonly loanRepository: LoanRepositoryPort) {}
  execute(id: number): Promise<void> {
    return this.loanRepository.remove(id);
  }
}

export class SimulateLoanUseCase {
  constructor(private readonly loanRepository: LoanRepositoryPort) {}
  execute(input: SimulateLoanInput): Promise<SimulatedPlan> {
    return this.loanRepository.simulate(input);
  }
}
