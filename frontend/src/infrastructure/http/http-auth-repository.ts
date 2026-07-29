import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { Session } from '../../domain/entities/session';
import { httpRequest } from './http-client';

export class HttpAuthRepository implements AuthRepositoryPort {
  login(email: string, password: string): Promise<Session> {
    return httpRequest<Session>('/auth/login', { method: 'POST', body: { email, password } });
  }

  register(email: string, password: string, nombre?: string): Promise<Session> {
    return httpRequest<Session>('/auth/register', { method: 'POST', body: { email, password, nombre } });
  }
}
