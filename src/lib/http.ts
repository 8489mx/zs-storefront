export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, options?: { code?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export function resolveRequestUrl(url?: string): string {
  return url || '';
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new ApiError(`HTTP Error ${res.status}`, res.status);
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    if (contentType.includes('text/html') || path.startsWith('/api/')) {
      throw new ApiError(`API endpoint returned non-JSON response (${contentType || 'unknown'})`, 404);
    }
    return (await res.text()) as unknown as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || 'Network request failed', 500);
  }
}
