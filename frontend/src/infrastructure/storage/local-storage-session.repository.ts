import { SessionStoragePort } from '../../domain/ports/session-storage.port';
import { Session } from '../../domain/entities/session';

const STORAGE_KEY = 'serbaros_loan_planner_session';

export class LocalStorageSessionRepository implements SessionStoragePort {
  load(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }

  save(session: Session): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
