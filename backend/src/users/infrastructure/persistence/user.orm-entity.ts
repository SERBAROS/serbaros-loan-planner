import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'users' })
@Unique(['email'])
export class UserOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ nullable: true, type: 'text' })
  nombre!: string | null;

  @Column({ name: 'tema_defecto', default: 'oscuro' })
  temaDefecto!: 'azul' | 'oscuro' | 'claro';

  @Column({ name: 'moneda_defecto', default: 'COP' })
  monedaDefecto!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
