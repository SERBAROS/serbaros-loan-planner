import { Loan } from '../entities/loan.entity';

export const LOAN_REPOSITORY = Symbol('LOAN_REPOSITORY');

/**
 * Puerto de salida (driven port): contrato que el dominio/aplicación
 * necesita para persistir préstamos, sin saber nada de TypeORM/SQLite.
 */
export interface LoanRepositoryPort {
  findAllByUser(userId: number): Promise<Loan[]>;
  findByIdAndUser(id: number, userId: number): Promise<Loan | null>;
  create(loan: Loan): Promise<number>;
  update(id: number, userId: number, loan: Loan): Promise<boolean>;
  delete(id: number, userId: number): Promise<boolean>;
}
