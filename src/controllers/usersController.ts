import type { Context } from 'hono';
import * as usersService from '../services/usersService';

export const getAllUsers = async (ctx: Context) => {
  const data = await usersService.getAllUsers(ctx.env);
  return ctx.json({ data });
};

export const getUserById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const data = await usersService.getUserById(id, ctx.env);
  if (!data) return ctx.json({ error: 'User not found' }, 404);

  return ctx.json({ data });
};

export const createUser = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.username || !payload.email || !payload.hashedPassword) {
    return ctx.json(
      { error: 'Missing required fields: username, email, and hashedPassword' },
      400
    );
  }
  const data = await usersService.createUser(payload, ctx.env);
  return ctx.json({ data }, 201);
};

export const updateUser = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const data = await usersService.updateUser(id, payload, ctx.env);
  if (!data) return ctx.json({ error: 'User not found' }, 404);

  return ctx.json({ data });
};

export const deleteUser = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const success = await usersService.deleteUser(id, ctx.env);
  if (!success) return ctx.json({ error: 'User not found' }, 404);

  return ctx.json({ message: 'User deleted successfully' });
};
