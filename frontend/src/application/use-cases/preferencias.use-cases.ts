import { UserPreferences, UserPreferencesRepositoryPort } from '../../domain/ports/user-preferences-repository.port';

export class GetPreferenciasUseCase {
  constructor(private readonly repo: UserPreferencesRepositoryPort) {}
  execute(): Promise<UserPreferences> {
    return this.repo.get();
  }
}

export class UpdatePreferenciasUseCase {
  constructor(private readonly repo: UserPreferencesRepositoryPort) {}
  execute(prefs: UserPreferences): Promise<UserPreferences> {
    return this.repo.update(prefs);
  }
}
