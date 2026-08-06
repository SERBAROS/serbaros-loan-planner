import { TemaId, User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(user: User): Promise<number>;
  updatePreferencias(userId: number, temaDefecto: TemaId, monedaDefecto: string): Promise<void>;
}
