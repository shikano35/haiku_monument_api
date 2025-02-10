import type { Context } from 'hono';
import { UserUseCases } from '../../domain/usecases/UserUseCases';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import type { D1Database } from '@cloudflare/workers-types';

const getUseCases = (env: { DB: D1Database }) => {
  const userRepo = new UserRepository(env.DB);
  return new UserUseCases(userRepo);
};

export const getAllUsers = async (ctx: Context) => {
  const useCases = getUseCases(ctx.env);
  const data = await useCases.getAllUsers();
  return ctx.json({ data });
};

export const getUserById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const data = await useCases.getUserById(id);
  if (!data) return ctx.json({ error: 'User not found' }, 404);

  return ctx.json({ data });
};

export const createUser = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.username || !payload.email || !payload.hashedPassword) {
    return ctx.json({ error: 'Missing required fields: username, email, and hashedPassword' }, 400);
  }
  const useCases = getUseCases(ctx.env);
  const data = await useCases.createUser(payload);
  return ctx.json({ data }, 201);
};

export const updateUser = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const useCases = getUseCases(ctx.env);
  const data = await useCases.updateUser(id, payload);
  if (!data) return ctx.json({ error: 'User not found' }, 404);

  return ctx.json({ data });
};

export const deleteUser = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const success = await useCases.deleteUser(id);
  if (!success) return ctx.json({ error: 'User not found' }, 404);

  return ctx.json({ message: 'User deleted successfully' });
};
