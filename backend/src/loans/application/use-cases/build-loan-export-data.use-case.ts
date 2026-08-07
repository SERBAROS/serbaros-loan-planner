import { realPaymentToAbono } from './real-payment-to-abono';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { SIMULATION_REPOSITORY, SimulationRepositoryPort } from '../../domain/ports/simulation-repository.port';
import { REAL_PAYMENT_REPOSITORY, RealPaymentRepositoryPort } from '../../domain/ports/real-payment-repository.port';
import { USER_REPOSITORY, UserRepositoryPort } from '../../../users/domain/ports/user-repository.port';
import { PlanComparisonService } from '../../domain/services/plan-comparison.service';
import { LoanExportData, LoanExportPlan } from '../../domain/ports/loan-export-data';

export interface BuildLoanExportOptions {
  /** undefined = incluir todas las simulaciones; [] = ninguna; [id,...] = solo esas. */
  simulacionIds?: number[];
  incluirTabla: boolean;
}

@Injectable()
export class BuildLoanExportDataUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort,
    @Inject(SIMULATION_REPOSITORY) private readonly simulationRepository: SimulationRepositoryPort,
    @Inject(REAL_PAYMENT_REPOSITORY) private readonly realPaymentRepository: RealPaymentRepositoryPort,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(loanId: number, userId: number, options: BuildLoanExportOptions): Promise<LoanExportData> {
    const base = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!base) throw new NotFoundException('Préstamo no encontrado.');

    const usuario = await this.userRepository.findById(userId);

    const basePlan = base.calcularPlan();
    const planes: LoanExportPlan[] = [
      { key: 'estimacion', nombre: 'Estimación', resumen: basePlan.resumen, tabla: basePlan.tabla },
    ];

    // Pago real (solo si hay al menos un pago registrado) — siempre se
    // incluye si existe; el selector del usuario aplica solo a simulaciones.
    const pagosReales = await this.realPaymentRepository.findAllByLoan(loanId, userId);
    if (pagosReales.length > 0) {
      const planReal = base.calcularPlanConAbonosAdicionales(
        pagosReales.map(realPaymentToAbono),
      );
      planes.push({
        key: 'real',
        nombre: 'Pago real',
        resumen: planReal.resumen,
        tabla: planReal.tabla,
        comparacion: PlanComparisonService.comparar(basePlan.resumen, planReal.resumen),
      });
    }

    // Simulaciones guardadas — filtradas según lo que el usuario eligió en el diálogo de exportación.
    const todasSimulaciones = await this.simulationRepository.findAllByLoan(loanId, userId);
    const simulaciones =
      options.simulacionIds === undefined
        ? todasSimulaciones
        : todasSimulaciones.filter((s) => options.simulacionIds!.includes(s.id as number));

    for (const sim of simulaciones) {
      try {
        const plan = sim.calcularPlan(base);
        planes.push({
          key: `simulacion-${sim.id}`,
          nombre: sim.nombre,
          resumen: plan.resumen,
          tabla: plan.tabla,
          comparacion: PlanComparisonService.comparar(basePlan.resumen, plan.resumen),
        });
      } catch {
        // Simulación con error de cálculo: se omite del export en vez de romperlo entero
      }
    }

    return {
      loan: { id: base.id as number, nombre: base.nombre, estado: base.estado, moneda: base.moneda, createdAt: base.createdAt },
      planes,
      incluirTabla: options.incluirTabla,
      generadoEl: new Date().toISOString(),
      generadoPor: { email: usuario?.email ?? 'desconocido', nombre: usuario?.nombre ?? null },
    };
  }
}
