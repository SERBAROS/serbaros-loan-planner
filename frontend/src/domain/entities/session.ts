export interface AuthUser {
  id: number;
  email: string;
  nombre: string | null;
}

export interface Session {
  token: string;
  user: AuthUser;
}
