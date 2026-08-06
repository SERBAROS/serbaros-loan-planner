import { UserProfile, UserProfileRepositoryPort } from '../../domain/ports/user-profile-repository.port';
import { httpRequest } from './http-client';

export class HttpUserProfileRepository implements UserProfileRepositoryPort {
  constructor(private readonly getToken: () => string | null) {}

  get(): Promise<UserProfile> {
    return httpRequest<UserProfile>('/users/me/perfil', { token: this.getToken() });
  }

  update(nombre: string | null): Promise<UserProfile> {
    return httpRequest<UserProfile>('/users/me/perfil', { method: 'PUT', body: { nombre }, token: this.getToken() });
  }
}
