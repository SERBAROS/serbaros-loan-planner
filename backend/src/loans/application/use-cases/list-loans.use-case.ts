import { Inject, Injectable } from '@nestjs/common';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { EstadoPrestamo } from '../../domain/entities/loan.entity';

export interface LoanListItem {
  id: number;
  nombre: string;
  estado: EstadoPrestamo;
  moneda: string;
  createdAt?: string;
  resumen?: ReturnType<import('../../domain/entities/loan.entity').Loan['calcularPlan']>['resumen'];
  error?: string;
}

@Injectable()
export class ListLoansUseCase {
  constructor(@Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort) {}

  async execute(userId: number): Promise<{ loans: LoanListItem[] }> {
    const loans = await this.loanRepository.findAllByUser(userId);

    const items: LoanListItem[] = loans.map((loan) => {
      try {
        const { resumen } = loan.calcularPlan();
        return {
          id: loan.id as number,
          nombre: loan.nombre,
          estado: loan.estado,
          moneda: loan.moneda,
          createdAt: loan.createdAt,
          resumen,
        };
      } catch (err) {
        return {
          id: loan.id as number,
          nombre: loan.nombre,
          estado: loan.estado,
          moneda: loan.moneda,
          createdAt: loan.createdAt,
          error: (err as Error).message,
        };
      }
    });

    return { loans: items };
  }
}
