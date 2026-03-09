import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';
const AUTH_BASE = `${API_BASE}/api/auth`;

export const authClient = createAuthClient({
  baseURL: AUTH_BASE,
  plugins: [organizationClient()],
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

type AuthErrorShape = {
  message?: string;
} | null;

type SocialSignInClient = {
  signIn: {
    social: (params: { provider: string; callbackURL?: string }) => Promise<void>;
  };
};

type ForgetPasswordClient = {
  forgetPassword: (params: {
    email: string;
    redirectTo: string;
  }) => Promise<{ error?: AuthErrorShape }>;
};

type ChangePasswordClient = {
  changePassword: (params: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ error?: AuthErrorShape }>;
};

type EmailOtpClient = {
  emailOtp: {
    verifyEmail: (params: { token: string }) => Promise<{ error?: AuthErrorShape }>;
  };
};

export function getSocialSignInClient(): SocialSignInClient {
  return authClient as unknown as SocialSignInClient;
}

export function getForgetPasswordClient(): ForgetPasswordClient {
  return authClient as unknown as ForgetPasswordClient;
}

export function getChangePasswordClient(): ChangePasswordClient {
  return authClient as unknown as ChangePasswordClient;
}

export function getEmailOtpClient(): EmailOtpClient {
  return authClient as unknown as EmailOtpClient;
}
