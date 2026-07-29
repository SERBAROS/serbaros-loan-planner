import { Inject, Injectable } from '@nestjs/common';
import { EstadoPrestamo, Loan } from '../../domain/entities/loan.entity';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { AbonoDefinition } from '../../domain/services/amortization.service';

export interface LoanInput {
  nombre: string;
  monto: number;
  tasaEfectivaAnual: number;
  numeroCuotas: number;
  mesInicioAmortizacion: string;
  valorCuotaManual?: number | null;
  compromisosCuotaExtraordinaria?: AbonoDefinition[];
  estado?: EstadoPrestamo;
  numeroCuotaInicial?: number;
  moneda?: string;
}

@Injectable()
export class CreateLoanUseCase {
  constructor(@Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort) {}

  async execute(userId: number, input: LoanInput): Promise<{ id: number }> {
    const loan = new Loan({
      userId,
      nombre: input.nombre,
      monto: input.monto,
      tasaEfectivaAnual: input.tasaEfectivaAnual,
      numeroCuotas: input.numeroCuotas,
      mesInicioAmortizacion: input.mesInicioAmortizacion,
      valorCuotaManual: input.valorCuotaManual ?? null,
      compromisosCuotaExtraordinaria: input.compromisosCuotaExtraordinaria ?? [],
      estado: input.estado ?? 'NUEVO',
      numeroCuotaInicial: input.numeroCuotaInicial ?? 1,
      moneda: input.moneda ?? 'COP',
    });

    // Valida que la lógica de cálculo no explote antes de guardar
    loan.calcularPlan();

    const id = await this.loanRepository.create(loan);
    return { id };
  }
}
