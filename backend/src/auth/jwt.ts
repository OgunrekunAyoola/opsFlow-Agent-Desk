import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const SECRET = process.env.JWT_SECRET || 'dev';
export const refreshCookieName = 'refresh_token';
export const refreshCookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', path: '/auth/refresh' } as const;

export function signAccessToken(user: IUser) {
  return jwt.sign({ sub: user._id.toString(), tenant_id: user.tenantId.toString(), role: user.role }, SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(user: IUser) {
  return jwt.sign({ sub: user._id.toString(), tenant_id: user.tenantId.toString(), type: 'refresh' }, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
