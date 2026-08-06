import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { PASSWORD_HASHER, PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TOKEN_SERVICE, TokenServicePort } from '../../domain/ports/token-service.port';
import { AuthResult } from './register-user.use-case';

export interface LoginUserInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = input.email ? await this.userRepository.findByEmail(input.email) : null;
    const passwordOk = user ? await this.passwordHasher.compare(input.password, user.passwordHash) : false;

    if (!user || !passwordOk) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    return {
      token: this.tokenService.sign(user.id as number),
      user: { id: user.id as number, email: user.email, nombre: user.nombre, temaDefecto: user.temaDefecto, monedaDefecto: user.monedaDefecto },
    };
  }
}
