import { UserPreferences, UserPreferencesRepositoryPort } from '../../domain/ports/user-preferences-repository.port';
import { httpRequest } from './http-client';

export class HttpUserPreferencesRepository implements UserPreferencesRepositoryPort {
  constructor(private readonly getToken: () => string | null) {}

  get(): Promise<UserPreferences> {
    return httpRequest<UserPreferences>('/users/me/preferencias', { token: this.getToken() });
  }

  update(prefs: UserPreferences): Promise<UserPreferences> {
    return httpRequest<UserPreferences>('/users/me/preferencias', { method: 'PUT', body: prefs, token: this.getToken() });
  }
}
