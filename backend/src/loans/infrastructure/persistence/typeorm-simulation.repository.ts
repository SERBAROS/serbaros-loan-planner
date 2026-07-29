import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Simulation } from '../../domain/entities/simulation.entity';
import { SimulationRepositoryPort } from '../../domain/ports/simulation-repository.port';
import { SimulationOrmEntity } from './simulation.orm-entity';
import { SimulationMapper } from '../mappers/simulation.mapper';

@Injectable()
export class TypeOrmSimulationRepository implements SimulationRepositoryPort {
  constructor(
    @InjectRepository(SimulationOrmEntity)
    private readonly repo: Repository<SimulationOrmEntity>,
  ) {}

  async findAllByLoan(loanId: number, userId: number): Promise<Simulation[]> {
    const rows = await this.repo.find({ where: { loanId, userId }, order: { createdAt: 'DESC' } });
    return rows.map(SimulationMapper.toDomain);
  }

  async findByIdAndLoan(id: number, loanId: number, userId: number): Promise<Simulation | null> {
    const row = await this.repo.findOne({ where: { id, loanId, userId } });
    return row ? SimulationMapper.toDomain(row) : null;
  }

  async create(simulation: Simulation): Promise<number> {
    const row = this.repo.create(SimulationMapper.toPersistence(simulation) as SimulationOrmEntity);
    const saved = await this.repo.save(row);
    return saved.id;
  }

  async update(id: number, loanId: number, userId: number, simulation: Simulation): Promise<boolean> {
    const result = await this.repo.update({ id, loanId, userId }, SimulationMapper.toPersistence(simulation) as SimulationOrmEntity);
    return (result.affected ?? 0) > 0;
  }

  async delete(id: number, loanId: number, userId: number): Promise<boolean> {
    const result = await this.repo.delete({ id, loanId, userId });
    return (result.affected ?? 0) > 0;
  }
}
