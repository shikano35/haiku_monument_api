// import { Hono } from 'hono';
// import { z } from 'zod';
// import { zValidator } from '@hono/zod-validator';
// import type { Env } from '../../types/env';
// import { UserUseCases } from '../../domain/usecases/UserUseCases';
// import { UserRepository } from '../../infrastructure/repositories/UserRepository';
// import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
// import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';

// const createUserSchema = z.object({
//   username: z.string().min(1, 'Username is required').max(100, 'Username is too long'),
//   email: z.string().email('Invalid email').max(255, 'Email is too long'),
//   hashed_password: z.string().min(1, 'Hashed password is required'),
//   display_name: z.string().optional().nullable(),
//   role: z.string().optional()
// });

// const updateUserSchema = z.object({
//   username: z.string().min(1, 'Username is required').max(100, 'Username is too long').optional(),
//   email: z.string().email('Invalid email').max(255, 'Email is too long').optional(),
//   hashed_password: z.string().min(1, 'Hashed password is required').optional(),
//   display_name: z.string().optional().nullable(),
//   role: z.string().optional()
// });

// const idParamSchema = z.object({
//   id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
// });

// const getUseCases = (env: Env) => {
//   const userRepo = new UserRepository(env.DB);
//   return new UserUseCases(userRepo);
// };

// const router = new Hono<{ Bindings: Env }>();

// router.get('/', async (c) => {
//   const useCases = getUseCases(c.env);
//   const users = await useCases.getAllUsers();
//   return c.json(convertKeysToSnakeCase(users));
// });

// router.get('/:id', async (c) => {
//   const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
//   if (!parseResult.success) {
//     return c.json({ error: parseResult.error.errors[0].message }, 400);
//   }
//   const { id } = parseResult.data;
//   const useCases = getUseCases(c.env);
//   const user = await useCases.getUserById(id);
//   if (!user) {
//     return c.json({ error: 'User not found' }, 404);
//   }
//   return c.json(convertKeysToSnakeCase(user));
// });

// router.post(
//   '/',
//   zValidator('json', createUserSchema),
//   async (c) => {
//     const rawPayload = c.req.valid('json');
//     const payload = convertKeysToCamelCase(rawPayload);
    
//     const { hashed_password, ...rest } = payload;
//     const newPayload = { ...rest, hashedPassword: hashed_password };

//     const useCases = getUseCases(c.env);
//     const created = await useCases.createUser(newPayload);
//     return c.json(convertKeysToSnakeCase(created), 201);
//   }
// );

// router.put(
//   '/:id',
//   zValidator('json', updateUserSchema),
//   async (c) => {
//     const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
//     if (!parseResult.success) {
//       return c.json({ error: parseResult.error.errors[0].message }, 400);
//     }
//     const { id } = parseResult.data;
//     const rawPayload = c.req.valid('json');
//     const payload = convertKeysToCamelCase(rawPayload);
//     const useCases = getUseCases(c.env);
//     const updated = await useCases.updateUser(id, payload);
//     if (!updated) {
//       return c.json({ error: 'User not found' }, 404);
//     }
//     return c.json(convertKeysToSnakeCase(updated));
//   }
// );

// router.delete('/:id', async (c) => {
//   const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
//   if (!parseResult.success) {
//     return c.json({ error: parseResult.error.errors[0].message }, 400);
//   }
//   const { id } = parseResult.data;
//   const useCases = getUseCases(c.env);
//   const success = await useCases.deleteUser(id);
//   if (!success) {
//     return c.json({ error: 'User not found' }, 404);
//   }
//   return c.json({ message: 'User deleted successfully', id });
// });

// export default router;
