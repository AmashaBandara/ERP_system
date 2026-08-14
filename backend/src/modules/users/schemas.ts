import { z } from 'zod';

export const idParam = z.object({ id: z.coerce.number().int().positive() });

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().optional(),
  branchId: z.coerce.number().int().optional(),
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  full_name: z.string().min(1).max(160),
  phone: z.string().max(40).optional().nullable(),
  status: z.enum(['active', 'inactive', 'locked']).optional(),
  roleIds: z.array(z.number().int().positive()).min(1),
  branchAccess: z.array(z.number().int().positive()).min(1),
  primaryBranchId: z.number().int().positive().optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .extend({
    password: z.string().min(8).max(128).optional(),
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;