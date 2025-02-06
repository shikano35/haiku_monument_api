import type { Context } from 'hono';
import * as authorsService from '../services/authorsService';

export const getAllAuthors = async (ctx: Context) => {
  const data = await authorsService.getAllAuthors(ctx.env);
  return ctx.json({ data });
};

export const getAuthorById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const data = await authorsService.getAuthorById(id, ctx.env);
  if (!data) return ctx.json({ error: 'Author not found' }, 404);

  return ctx.json({ data });
};

export const createAuthor = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.name) {
    return ctx.json({ error: 'Missing required field: name' }, 400);
  }
  const data = await authorsService.createAuthor(payload, ctx.env);
  return ctx.json({ data }, 201);
};

export const updateAuthor = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const data = await authorsService.updateAuthor(id, payload, ctx.env);
  if (!data) return ctx.json({ error: 'Author not found' }, 404);

  return ctx.json({ data });
};

export const deleteAuthor = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const success = await authorsService.deleteAuthor(id, ctx.env);
  if (!success) return ctx.json({ error: 'Author not found' }, 404);

  return ctx.json({ message: 'Author deleted successfully' });
};
