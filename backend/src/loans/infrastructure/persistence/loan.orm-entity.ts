import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AbonoDefinition } from '../../domain/services/amortization.service';

@Entity({ name: 'loans' })
export class LoanOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column()
  nombre!: string;

  @Column('double')
  monto!: number;

  @Column('double', { name: 'tasa_efectiva_anual' })
  tasaEfectivaAnual!: number;

  @Column({ name: 'numero_cuotas' })
  numeroCuotas!: number;

  @Column({ name: 'mes_inicio_amortizacion' })
  mesInicioAmortizacion!: string;

  @Column('double', { name: 'valor_cuota_manual', nullable: true })
  valorCuotaManual!: number | null;

  @Column('simple-json', { name: 'compromisos_cuota_extraordinaria', nullable: true })
  compromisosCuotaExtraordinaria!: AbonoDefinition[] | null;

  @Column({ default: 'NUEVO' })
  estado!: 'NUEVO' | 'EN_EJECUCION';

  @Column({ name: 'numero_cuota_inicial', default: 1 })
  numeroCuotaInicial!: number;

  @Column({ default: 'COP' })
  moneda!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
