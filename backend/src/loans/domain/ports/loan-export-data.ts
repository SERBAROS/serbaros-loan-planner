import { ResumenPlanPagos, FilaAmortizacion } from '../services/amortization.service';
import { ComparacionPlan } from '../services/plan-comparison.service';

/**
 * Un "plan" exportable: la estimación base, el plan real, o una
 * simulación — todos con la misma forma para que los exportadores
 * (Excel/PDF) no tengan que distinguir de dónde vino cada uno.
 */
export interface LoanExportPlan {
  key: string; // 'estimacion' | 'real' | 'simulacion-<id>'
  nombre: string;
  resumen: ResumenPlanPagos;
  tabla: FilaAmortizacion[];
  comparacion?: ComparacionPlan; // ausente para 'estimacion' (es la base de comparación)
}

export interface LoanExportData {
  loan: {
    id: number;
    nombre: string;
    estado: string;
    moneda: string;
    createdAt?: string;
  };
  planes: LoanExportPlan[]; // [estimación, real?, simulación1, simulación2, ...] — ya filtrados según lo que el usuario eligió mostrar
  /** Si es false, los exportadores omiten la tabla de amortización completa (solo dejan resumen/comparación). */
  incluirTabla: boolean;
  generadoEl: string; // ISO timestamp de cuándo se generó el reporte
  generadoPor: {
    email: string;
    nombre: string | null;
  };
}
