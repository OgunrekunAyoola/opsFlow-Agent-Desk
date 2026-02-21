import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3000';

export const authClient = createAuthClient({
  baseURL: API_BASE,
  plugins: [
    organizationClient(),
  ],
});

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};

export async function fetchWithAccess<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const isAbsolute = path.startsWith('http://') || path.startsWith('https://');
  const normalizedPath = isAbsolute
    ? path
    : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init?.headers as HeadersInit | undefined);
  if (init?.body && !headers.has('Content-Type') && !headers.has('content-type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(normalizedPath, {
    ...init,
    headers,
    credentials: 'include',
  });
  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch {
    data = null;
  }
  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}
