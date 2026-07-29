import { SessionStoragePort } from '../../domain/ports/session-storage.port';

export class LogoutUseCase {
  constructor(private readonly sessionStorage: SessionStoragePort) {}

  execute(): void {
    this.sessionStorage.clear();
  }
}
