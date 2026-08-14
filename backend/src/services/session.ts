import { db } from '../db/knex';
import {
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
  verifyRefreshToken,
} from '../auth/jwt';
import { AppError } from '../middleware/error';

export interface SessionResult {
  userId: number;
  refreshToken: string;
}

/** Issue a fresh refresh token, revoking the previous one and rotating the family. */
export async function issueRefreshToken(userId: number): Promise<string> {
  const { token } = generateRefreshToken();
  const expires_at = refreshTokenExpiry();
  await db('refresh_tokens').insert({
    user_id: userId,
    token_hash: hashRefreshToken(token),
    expires_at,
  });
  return token;
}

/**
 * Rotate a refresh token. On reuse of an already-rotated token, revoke the whole
 * family (reuse detection) to neutralize theft.
 */
export async function rotateRefreshToken(
  rawToken: string,
): Promise<SessionResult> {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw new AppError(401, 'INVALID_REFRESH', 'Invalid refresh token');
  }
  void payload;

  const hash = hashRefreshToken(rawToken);
  const stored = await db('refresh_tokens').where('token_hash', hash).first();

  if (!stored) throw new AppError(401, 'INVALID_REFRESH', 'Refresh token not found');
  if (stored.revoked_at) {
    // Reuse detection: this token was already rotated → revoke the family.
    await revokeFamily(Number(stored.user_id), Number(stored.id));
    throw new AppError(401, 'TOKEN_REUSED', 'Refresh token reuse detected');
  }
  if (new Date(stored.expires_at) < new Date()) {
    throw new AppError(401, 'EXPIRED_REFRESH', 'Refresh token expired');
  }

  const newToken = await issueRefreshToken(Number(stored.user_id));
  await db('refresh_tokens')
    .where('id', Number(stored.id))
    .update({ revoked_at: new Date(), replaced_by_token_id: Number(stored.id) });

  return { userId: Number(stored.user_id), refreshToken: newToken };
}

async function revokeFamily(userId: number, originId: number): Promise<void> {
  const seen = new Set<number>();
  const queue = [originId];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const tokens = await db('refresh_tokens')
      .where('user_id', userId)
      .where((q) => q.where('id', id).orWhere('replaced_by_token_id', id))
      .select('id');
    for (const t of tokens) queue.push(Number(t.id));
  }
  await db('refresh_tokens')
    .whereIn('id', [...seen])
    .update({ revoked_at: new Date() });
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const hash = hashRefreshToken(rawToken);
  await db('refresh_tokens').where('token_hash', hash).update({ revoked_at: new Date() });
}
