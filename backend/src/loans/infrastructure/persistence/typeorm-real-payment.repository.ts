import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealPayment } from '../../domain/entities/real-payment.entity';
import { RealPaymentRepositoryPort } from '../../domain/ports/real-payment-repository.port';
import { RealPaymentOrmEntity } from './real-payment.orm-entity';
import { RealPaymentMapper } from '../mappers/real-payment.mapper';

@Injectable()
export class TypeOrmRealPaymentRepository implements RealPaymentRepositoryPort {
  constructor(
    @InjectRepository(RealPaymentOrmEntity)
    private readonly repo: Repository<RealPaymentOrmEntity>,
  ) {}

  async findAllByLoan(loanId: number, userId: number): Promise<RealPayment[]> {
    const rows = await this.repo.find({ where: { loanId, userId }, order: { fechaPago: 'ASC', id: 'ASC' } });
    return rows.map(RealPaymentMapper.toDomain);
  }

  async findByIdAndLoan(id: number, loanId: number, userId: number): Promise<RealPayment | null> {
    const row = await this.repo.findOne({ where: { id, loanId, userId } });
    return row ? RealPaymentMapper.toDomain(row) : null;
  }

  async create(payment: RealPayment): Promise<number> {
    const row = this.repo.create(RealPaymentMapper.toPersistence(payment) as RealPaymentOrmEntity);
    const saved = await this.repo.save(row);
    return saved.id;
  }

  async update(id: number, loanId: number, userId: number, payment: RealPayment): Promise<boolean> {
    const result = await this.repo.update({ id, loanId, userId }, RealPaymentMapper.toPersistence(payment) as RealPaymentOrmEntity);
    return (result.affected ?? 0) > 0;
  }

  async delete(id: number, loanId: number, userId: number): Promise<boolean> {
    const result = await this.repo.delete({ id, loanId, userId });
    return (result.affected ?? 0) > 0;
  }
}
