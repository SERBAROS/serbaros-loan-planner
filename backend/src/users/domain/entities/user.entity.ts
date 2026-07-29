export interface UserProps {
  id?: number;
  email: string;
  passwordHash: string;
  nombre: string | null;
  createdAt?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  readonly id?: number;
  readonly email: string;
  readonly passwordHash: string;
  readonly nombre: string | null;
  readonly createdAt?: string;

  constructor(props: UserProps) {
    if (!props.email || !EMAIL_REGEX.test(props.email)) {
      throw new Error('Correo inválido.');
    }
    this.id = props.id;
    this.email = props.email.toLowerCase();
    this.passwordHash = props.passwordHash;
    this.nombre = props.nombre ?? null;
    this.createdAt = props.createdAt;
  }
}
