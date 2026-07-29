import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from '../../domain/entities/loan.entity';
import { LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { LoanOrmEntity } from './loan.orm-entity';
import { LoanMapper } from '../mappers/loan.mapper';

@Injectable()
export class TypeOrmLoanRepository implements LoanRepositoryPort {
  constructor(
    @InjectRepository(LoanOrmEntity)
    private readonly repo: Repository<LoanOrmEntity>,
  ) {}

  async findAllByUser(userId: number): Promise<Loan[]> {
    const rows = await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return rows.map(LoanMapper.toDomain);
  }

  async findByIdAndUser(id: number, userId: number): Promise<Loan | null> {
    const row = await this.repo.findOne({ where: { id, userId } });
    return row ? LoanMapper.toDomain(row) : null;
  }

  async create(loan: Loan): Promise<number> {
    const row = this.repo.create(LoanMapper.toPersistence(loan) as LoanOrmEntity);
    const saved = await this.repo.save(row);
    return saved.id;
  }

  async update(id: number, userId: number, loan: Loan): Promise<boolean> {
    const result = await this.repo.update({ id, userId }, LoanMapper.toPersistence(loan) as LoanOrmEntity);
    return (result.affected ?? 0) > 0;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await this.repo.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
