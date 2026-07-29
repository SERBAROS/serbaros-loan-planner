import { Session } from '../entities/session';

export interface AuthRepositoryPort {
  login(email: string, password: string): Promise<Session>;
  register(email: string, password: string, nombre?: string): Promise<Session>;
}
