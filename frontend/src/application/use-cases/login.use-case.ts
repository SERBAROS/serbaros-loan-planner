import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { SessionStoragePort } from '../../domain/ports/session-storage.port';
import { Session } from '../../domain/entities/session';

export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly sessionStorage: SessionStoragePort,
  ) {}

  async execute(email: string, password: string): Promise<Session> {
    const session = await this.authRepository.login(email, password);
    this.sessionStorage.save(session);
    return session;
  }
}
