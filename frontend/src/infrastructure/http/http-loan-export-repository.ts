import { ExportFormat, LoanExportRepositoryPort } from '../../domain/ports/loan-export-repository.port';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function extractFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) return fallback;
  const match = /filename="?([^"]+)"?/.exec(contentDisposition);
  return match ? match[1] : fallback;
}

export class HttpLoanExportRepository implements LoanExportRepositoryPort {
  constructor(private readonly getToken: () => string | null) {}

  async fetchExport(loanId: number, format: ExportFormat): Promise<{ blob: Blob; filename: string }> {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/loans/${loanId}/${format === 'excel' ? 'export/excel' : 'export/pdf'}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) {
      let message = `Error ${res.status}`;
      try {
        const data = await res.json();
        message = data.error || message;
      } catch {
        // respuesta sin cuerpo JSON (ej. archivo binario en error)
      }
      throw new Error(message);
    }

    const blob = await res.blob();
    const fallback = `serbaros-loan-planner.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    const filename = extractFilename(res.headers.get('Content-Disposition'), fallback);
    return { blob, filename };
  }
}
