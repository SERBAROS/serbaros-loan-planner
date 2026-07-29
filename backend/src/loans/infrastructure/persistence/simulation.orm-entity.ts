import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AbonoDefinition } from '../../domain/services/amortization.service';

@Entity({ name: 'loan_simulations' })
export class SimulationOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'loan_id' })
  loanId!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column()
  nombre!: string;

  @Column('double', { name: 'valor_cuota_manual', nullable: true })
  valorCuotaManual!: number | null;

  @Column('simple-json', { name: 'compromisos_adicionales', nullable: true })
  compromisosAdicionales!: AbonoDefinition[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
