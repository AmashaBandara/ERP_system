import http from 'node:http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import { env, corsOrigins } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error';
import { registerSockets } from './sockets';
import { openapiDoc } from './openapi';

import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import roleRoutes from './modules/roles/routes';
import branchRoutes from './modules/branches/routes';
import auditRoutes from './modules/audit/routes';
import healthRoutes from './modules/health/routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const apiLimiter = rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false });
  const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 50, standardHeaders: true, legacyHeaders: false });

  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/users', apiLimiter, userRoutes);
  app.use('/api/v1/roles', apiLimiter, roleRoutes);
  app.use('/api/v1/branches', apiLimiter, branchRoutes);
  app.use('/api/v1/audit', apiLimiter, auditRoutes);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function startServer() {
  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    path: '/socket.io',
    cors: { origin: corsOrigins, credentials: true },
  });
  registerSockets(io);

  server.listen(env.PORT, () => {
    console.log(`[server] listening on http://localhost:${env.PORT}`);
    console.log(`[server] API docs at http://localhost:${env.PORT}/api-docs`);
  });

  return { app, server, io };
}

if (process.argv[1] && !process.argv[1].includes('test')) {
  const running = startServer();
  void running;
}