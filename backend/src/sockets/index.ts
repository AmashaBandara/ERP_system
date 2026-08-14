import type { Server } from 'socket.io';
import { verifyAccessToken } from '../auth/jwt';

export const socketEvents = {
  orderNew: 'order:new',
  orderStatus: 'order:status',
  tableStatus: 'table:status',
  reservationCreated: 'reservation:created',
  stockLow: 'stock:low',
  posPayment: 'pos:payment',
  authSession: 'auth:session',
} as const;

export interface SocketAuth {
  userId: number;
  username: string;
  branches: number[];
}

export function registerSockets(io: Server): void {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('UNAUTHORIZED'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.auth = {
        userId: Number(payload.sub),
        username: payload.username,
        branches: payload.branches,
      } satisfies SocketAuth;
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    const auth = socket.data.auth as SocketAuth;
    for (const branchId of auth.branches) {
      void socket.join(`branch:${branchId}`);
    }
    socket.emit('connected', { user: auth.username });
  });
}
