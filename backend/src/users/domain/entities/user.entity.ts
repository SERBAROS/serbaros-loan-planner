export type TemaId = 'azul' | 'oscuro' | 'claro';

const TEMAS_VALIDOS: TemaId[] = ['azul', 'oscuro', 'claro'];
const CODIGO_MONEDA_REGEX = /^[A-Z]{3}$/;

export interface UserProps {
  id?: number;
  email: string;
  passwordHash: string;
  nombre: string | null;
  temaDefecto?: TemaId;
  monedaDefecto?: string;
  createdAt?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Preferencias de cuenta: tema y moneda por defecto. Viven en el usuario
 * (no en localStorage) para que viajen entre dispositivos — el tema
 * elegido alimenta el ThemeContext al iniciar sesión, y la moneda alimenta
 * el valor inicial del selector al crear un préstamo nuevo.
 */
export class User {
  readonly id?: number;
  readonly email: string;
  readonly passwordHash: string;
  readonly nombre: string | null;
  readonly temaDefecto: TemaId;
  readonly monedaDefecto: string;
  readonly createdAt?: string;

  constructor(props: UserProps) {
    if (!props.email || !EMAIL_REGEX.test(props.email)) {
      throw new Error('Correo inválido.');
    }
    const temaDefecto = props.temaDefecto ?? 'oscuro';
    if (!TEMAS_VALIDOS.includes(temaDefecto)) {
      throw new Error('El tema por defecto debe ser azul, oscuro o claro.');
    }
    const monedaDefecto = (props.monedaDefecto ?? 'COP').toUpperCase();
    if (!CODIGO_MONEDA_REGEX.test(monedaDefecto)) {
      throw new Error('El código de moneda por defecto debe tener 3 letras (ISO 4217).');
    }

    this.id = props.id;
    this.email = props.email.toLowerCase();
    this.passwordHash = props.passwordHash;
    this.nombre = props.nombre ?? null;
    this.temaDefecto = temaDefecto;
    this.monedaDefecto = monedaDefecto;
    this.createdAt = props.createdAt;
  }
}
