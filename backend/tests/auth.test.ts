import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'node:http';
import { createApp } from '../src/index';

let server: http.Server;
let base: string;

beforeAll(async () => {
  server = http.createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address();
  base = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 4000}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('health', () => {
  it('reports healthy with db up', async () => {
    const res = await request(base).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data.db).toBe('up');
  });
});

describe('auth', () => {
  it('logs in as superadmin and returns access token', async () => {
    const res = await request(base).post('/api/v1/auth/login').send({ username: 'superadmin', password: 'ChangeMe!123' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.username).toBe('superadmin');
    expect(res.body.data.user.roles).toContain('SUPER_ADMIN');
  });

  it('rejects bad password', async () => {
    const res = await request(base).post('/api/v1/auth/login').send({ username: 'superadmin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('/auth/me requires token', async () => {
    const res = await request(base).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('rbac', () => {
  let adminToken = '';
  let kitchenToken = '';

  beforeAll(async () => {
    const admin = await request(base).post('/api/v1/auth/login').send({ username: 'superadmin', password: 'ChangeMe!123' });
    adminToken = admin.body.data.accessToken;
    const kitchen = await request(base).post('/api/v1/auth/login').send({ username: 'kitchen', password: 'DemoUser!1' });
    kitchenToken = kitchen.body.data.accessToken;
  });

  it('superadmin can list users', async () => {
    const res = await request(base).get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('kitchen staff is denied listing users', async () => {
    const res = await request(base).get('/api/v1/users').set('Authorization', `Bearer ${kitchenToken}`);
    expect(res.status).toBe(403);
  });

  it('kitchen staff can list roles read? (no permission) denied', async () => {
    const res = await request(base).get('/api/v1/roles').set('Authorization', `Bearer ${kitchenToken}`);
    expect(res.status).toBe(403);
  });
});

describe('roles & branches', () => {
  let token: string;
  beforeAll(async () => {
    const res = await request(base).post('/api/v1/auth/login').send({ username: 'superadmin', password: 'ChangeMe!123' });
    token = res.body.data.accessToken;
  });

  it('lists seeded roles including 11 system/demo roles', async () => {
    const res = await request(base).get('/api/v1/roles').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(11);
  });

  it('lists permissions', async () => {
    const res = await request(base).get('/api/v1/roles/permissions').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(50);
  });

  it('lists branches', async () => {
    const res = await request(base).get('/api/v1/branches').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it('audit log is written on user create', async () => {
    const suffix = Date.now();
    const res = await request(base)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: `audit.test${suffix}`,
        email: `audit.test${suffix}@waikkalhospitality.lk`,
        password: 'T3st!Pass123',
        full_name: 'Audit Test',
        roleIds: [1],
        branchAccess: [1],
      });
    expect(res.status).toBe(201);
    const audit = await request(base).get('/api/v1/audit').set('Authorization', `Bearer ${token}`);
    expect(audit.status).toBe(200);
    expect(audit.body.data.items.some((a: { action: string }) => a.action === 'user.create')).toBe(true);
  });
});