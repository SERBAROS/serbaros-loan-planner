export interface AuthUser {
  id: number;
  email: string;
  nombre: string | null;
  temaDefecto: 'azul' | 'oscuro' | 'claro';
  monedaDefecto: string;
}

export interface Session {
  token: string;
  user: AuthUser;
}
