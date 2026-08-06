export interface UserProfile {
  id: number;
  email: string;
  nombre: string | null;
}

export interface UserProfileRepositoryPort {
  get(): Promise<UserProfile>;
  update(nombre: string | null): Promise<UserProfile>;
}
