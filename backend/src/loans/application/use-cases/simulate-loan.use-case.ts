import { Injectable } from '@nestjs/common';
import { Loan } from '../../domain/entities/loan.entity';
import { AbonoDefinition, PlanPagos } from '../../domain/services/amortization.service';

export interface SimulateLoanInput {
  monto: number;
  tasaEfectivaAnual: number;
  numeroCuotas: number;
  mesInicioAmortizacion: string;
  valorCuotaManual?: number | null;
  compromisosCuotaExtraordinaria?: AbonoDefinition[];
  numeroCuotaInicial?: number;
}

@Injectable()
export class SimulateLoanUseCase {
  execute(input: SimulateLoanInput): PlanPagos {
    const loan = new Loan({
      userId: 0,
      nombre: 'simulacion',
      monto: input.monto,
      tasaEfectivaAnual: input.tasaEfectivaAnual,
      numeroCuotas: input.numeroCuotas,
      mesInicioAmortizacion: input.mesInicioAmortizacion,
      valorCuotaManual: input.valorCuotaManual ?? null,
      compromisosCuotaExtraordinaria: input.compromisosCuotaExtraordinaria ?? [],
      numeroCuotaInicial: input.numeroCuotaInicial ?? 1,
    });

    return loan.calcularPlan();
  }
}
