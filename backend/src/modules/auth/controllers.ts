import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/error';
import { login, logout, me, refresh, changePassword } from './services';
import { changePasswordSchema, loginSchema } from './schemas';
import { env } from '../../config/env';

const REFRESH_COOKIE = 'refresh_token';

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export async function handleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await login(body.username, body.password);
    setRefreshCookie(res, result.refreshToken);
    res.json({ data: { accessToken: result.accessToken, user: result.user } });
  } catch (e) {
    next(e);
  }
}

export async function handleRefresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] ?? (req.body?.refreshToken as string | undefined);
    if (!token) throw new AppError(401, 'NO_REFRESH', 'No refresh token');
    const result = await refresh(token);
    setRefreshCookie(res, result.refreshToken);
    res.json({ data: { accessToken: result.accessToken } });
  } catch (e) {
    next(e);
  }
}

export async function handleLogout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] ?? (req.body?.refreshToken as string | undefined);
    await logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    res.json({ data: { success: true } });
  } catch (e) {
    next(e);
  }
}

export async function handleMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
    const result = await me(Number(req.user.sub));
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
}

export async function handleChangePassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
    const body = changePasswordSchema.parse(req.body);
    await changePassword(Number(req.user.sub), body.currentPassword, body.newPassword);
    res.json({ data: { success: true } });
  } catch (e) {
    next(e);
  }
}
