import { Simulation } from '../../domain/entities/simulation.entity';
import { SimulationOrmEntity } from '../persistence/simulation.orm-entity';

export class SimulationMapper {
  static toDomain(row: SimulationOrmEntity): Simulation {
    return new Simulation({
      id: row.id,
      loanId: row.loanId,
      userId: row.userId,
      nombre: row.nombre,
      valorCuotaManual: row.valorCuotaManual,
      compromisosAdicionales: row.compromisosAdicionales ?? [],
      createdAt: row.createdAt?.toISOString(),
      updatedAt: row.updatedAt?.toISOString(),
    });
  }

  static toPersistence(simulation: Simulation): Partial<SimulationOrmEntity> {
    return {
      loanId: simulation.loanId,
      userId: simulation.userId,
      nombre: simulation.nombre,
      valorCuotaManual: simulation.valorCuotaManual,
      compromisosAdicionales: simulation.compromisosAdicionales.length > 0 ? simulation.compromisosAdicionales : null,
    };
  }
}
