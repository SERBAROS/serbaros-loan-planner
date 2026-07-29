import { Loan } from '../../domain/entities/loan.entity';
import { LoanOrmEntity } from '../persistence/loan.orm-entity';

export class LoanMapper {
  static toDomain(row: LoanOrmEntity): Loan {
    return new Loan({
      id: row.id,
      userId: row.userId,
      nombre: row.nombre,
      monto: row.monto,
      tasaEfectivaAnual: row.tasaEfectivaAnual,
      numeroCuotas: row.numeroCuotas,
      mesInicioAmortizacion: row.mesInicioAmortizacion,
      valorCuotaManual: row.valorCuotaManual,
      compromisosCuotaExtraordinaria: row.compromisosCuotaExtraordinaria ?? [],
      estado: row.estado,
      numeroCuotaInicial: row.numeroCuotaInicial,
      moneda: row.moneda,
      createdAt: row.createdAt?.toISOString(),
      updatedAt: row.updatedAt?.toISOString(),
    });
  }

  static toPersistence(loan: Loan): Partial<LoanOrmEntity> {
    return {
      userId: loan.userId,
      nombre: loan.nombre,
      monto: loan.monto,
      tasaEfectivaAnual: loan.tasaEfectivaAnual,
      numeroCuotas: loan.numeroCuotas,
      mesInicioAmortizacion: loan.mesInicioAmortizacion,
      valorCuotaManual: loan.valorCuotaManual,
      compromisosCuotaExtraordinaria: loan.compromisosCuotaExtraordinaria.length > 0 ? loan.compromisosCuotaExtraordinaria : null,
      estado: loan.estado,
      numeroCuotaInicial: loan.numeroCuotaInicial,
      moneda: loan.moneda,
    };
  }
}
