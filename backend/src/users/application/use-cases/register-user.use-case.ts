import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { PASSWORD_HASHER, PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TOKEN_SERVICE, TokenServicePort } from '../../domain/ports/token-service.port';

export interface RegisterUserInput {
  email: string;
  password: string;
  nombre?: string | null;
}

export interface AuthResult {
  token: string;
  user: { id: number; email: string; nombre: string | null };
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    if (!input.password || input.password.length < 6) {
      throw new ConflictException('La contraseña debe tener al menos 6 caracteres.');
    }

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = new User({ email: input.email, passwordHash, nombre: input.nombre ?? null });
    const id = await this.userRepository.create(user);

    return {
      token: this.tokenService.sign(id),
      user: { id, email: user.email, nombre: user.nombre },
    };
  }
}
