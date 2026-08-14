import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/error';
import { verifyAccessToken, type AccessTokenPayload } from './jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing bearer token'));
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = payload;
    next();
  } catch {
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
  }
}

export function authorize(permission?: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Not authenticated'));
    }
    if (req.user.roles.includes('SUPER_ADMIN')) return next();
    if (permission && !req.user.permissions.includes(permission)) {
      return next(new AppError(403, 'FORBIDDEN', `Missing permission: ${permission}`));
    }
    next();
  };
}

/** Restrict the resolved branch to those the user has access to (unless super admin). */
export function branchScope(branchIdParam = 'branchId') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, 'UNAUTHORIZED', 'Not authenticated'));
    if (req.user.roles.includes('SUPER_ADMIN')) return next();
    const branchId = Number(req.params[branchIdParam] ?? req.query[branchIdParam]);
    if (branchId && !req.user.branches.includes(branchId)) {
      return next(new AppError(403, 'FORBIDDEN', 'No access to this branch'));
    }
    next();
  };
}
