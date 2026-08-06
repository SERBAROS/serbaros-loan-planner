import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User, TemaId } from '../../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';

function toDomain(row: UserOrmEntity): User {
  return new User({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    nombre: row.nombre,
    temaDefecto: row.temaDefecto,
    monedaDefecto: row.monedaDefecto,
    createdAt: row.createdAt?.toISOString(),
  });
}

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { email: email.toLowerCase() } });
    return row ? toDomain(row) : null;
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(user: User): Promise<number> {
    const row = this.repo.create({
      email: user.email,
      passwordHash: user.passwordHash,
      nombre: user.nombre,
      temaDefecto: user.temaDefecto,
      monedaDefecto: user.monedaDefecto,
    });
    const saved = await this.repo.save(row);
    return saved.id;
  }

  async updatePreferencias(userId: number, temaDefecto: TemaId, monedaDefecto: string): Promise<void> {
    await this.repo.update({ id: userId }, { temaDefecto, monedaDefecto });
  }
}
