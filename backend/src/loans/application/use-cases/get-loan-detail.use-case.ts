import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';

@Injectable()
export class GetLoanDetailUseCase {
  constructor(@Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort) {}

  async execute(id: number, userId: number) {
    const loan = await this.loanRepository.findByIdAndUser(id, userId);
    if (!loan) throw new NotFoundException('Préstamo no encontrado.');

    const plan = loan.calcularPlan();
    return {
      id: loan.id,
      nombre: loan.nombre,
      estado: loan.estado,
      moneda: loan.moneda,
      createdAt: loan.createdAt,
      compromisosCuotaExtraordinaria: loan.compromisosCuotaExtraordinaria,
      ...plan,
    };
  }
}
