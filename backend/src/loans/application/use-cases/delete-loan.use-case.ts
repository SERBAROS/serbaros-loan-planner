import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';

@Injectable()
export class DeleteLoanUseCase {
  constructor(@Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort) {}

  async execute(id: number, userId: number): Promise<{ ok: true }> {
    const ok = await this.loanRepository.delete(id, userId);
    if (!ok) throw new NotFoundException('Préstamo no encontrado.');
    return { ok: true };
  }
}
