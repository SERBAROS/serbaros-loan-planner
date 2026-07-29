export class ApiError extends Error {}

export interface HttpClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function httpRequest<T>(path: string, options: HttpClientOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // sin cuerpo JSON (ej. 204)
  }

  if (!res.ok) {
    const message = (data as { error?: string } | null)?.error || `Error ${res.status}`;
    throw new ApiError(message);
  }

  return data as T;
}
