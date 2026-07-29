import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Loan } from '../../domain/entities/loan.entity';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { LoanInput } from './create-loan.use-case';

@Injectable()
export class UpdateLoanUseCase {
  constructor(@Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort) {}

  async execute(id: number, userId: number, input: LoanInput): Promise<{ ok: true }> {
    const existing = await this.loanRepository.findByIdAndUser(id, userId);
    if (!existing) throw new NotFoundException('Préstamo no encontrado.');

    const loan = new Loan({
      id,
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

    loan.calcularPlan();

    const ok = await this.loanRepository.update(id, userId, loan);
    if (!ok) throw new NotFoundException('Préstamo no encontrado.');
    return { ok: true };
  }
}
