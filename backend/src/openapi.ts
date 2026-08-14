import type { OpenAPIV3 } from 'openapi-types';

export const openapiDoc: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Waikkal Hospitality ERP API',
    version: '0.1.0',
    description:
      'Integrated ERP for Ernie\'s Retreat (accommodation) and Nanga\'s Kitchen (restaurant & catering). ' +
      'Phase 1 covers auth, RBAC, users, roles, branches and audit logs.',
  },
  servers: [{ url: '/api/v1', description: 'Default base path' }],
  tags: [
    { name: 'auth', description: 'Authentication & session' },
    { name: 'users', description: 'User management' },
    { name: 'roles', description: 'Roles & permissions (RBAC)' },
    { name: 'branches', description: 'Multi-location branches' },
    { name: 'audit', description: 'Audit logs' },
    { name: 'health', description: 'Health checks' },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['auth'],
        summary: 'Login and receive access + refresh token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string' } } } } },
        },
        responses: { '200': { description: 'Authenticated' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/auth/refresh': { post: { tags: ['auth'], summary: 'Rotate refresh token', responses: { '200': { description: 'New access token' } } } },
    '/auth/logout': { post: { tags: ['auth'], summary: 'Revoke refresh token', responses: { '200': { description: 'Logged out' } } } },
    '/auth/me': { get: { tags: ['auth'], summary: 'Current user', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Profile' } } } },
    '/auth/change-password': { post: { tags: ['auth'], summary: 'Change password', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Changed' } } } },
    '/users': {
      get: { tags: ['users'], summary: 'List users', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Paginated users' } } },
      post: { tags: ['users'], summary: 'Create user', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/roles': { get: { tags: ['roles'], summary: 'List roles', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Roles' } } } },
    '/roles/permissions': { get: { tags: ['roles'], summary: 'List permissions', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Permissions' } } } },
    '/branches': { get: { tags: ['branches'], summary: 'List branches', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Branches' } } } },
    '/audit': { get: { tags: ['audit'], summary: 'List audit logs', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Audit entries' } } } },
    '/health': { get: { tags: ['health'], summary: 'Health check', responses: { '200': { description: 'Service + DB health' } } } },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};