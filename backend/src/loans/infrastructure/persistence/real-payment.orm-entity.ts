import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'real_payments' })
export class RealPaymentOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'loan_id' })
  loanId!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'numero_cuota' })
  numeroCuota!: number;

  @Column('double')
  monto!: number;

  @Column()
  concepto!: string;

  @Column({ name: 'fecha_pago' })
  fechaPago!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
