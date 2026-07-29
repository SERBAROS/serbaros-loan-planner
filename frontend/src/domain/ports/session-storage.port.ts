import { Session } from '../entities/session';

export interface SessionStoragePort {
  load(): Session | null;
  save(session: Session): void;
  clear(): void;
}
