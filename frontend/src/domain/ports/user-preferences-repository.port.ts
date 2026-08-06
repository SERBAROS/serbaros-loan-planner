export interface UserPreferences {
  temaDefecto: 'azul' | 'oscuro' | 'claro';
  monedaDefecto: string;
}

export interface UserPreferencesRepositoryPort {
  get(): Promise<UserPreferences>;
  update(prefs: UserPreferences): Promise<UserPreferences>;
}
