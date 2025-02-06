import type { Context } from 'hono';
import * as sourcesService from '../services/sourcesService';

export const getAllSources = async (ctx: Context) => {
  const data = await sourcesService.getAllSources(ctx.env);
  return ctx.json({ data });
};

export const getSourceById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const data = await sourcesService.getSourceById(id, ctx.env);
  if (!data) return ctx.json({ error: 'Source not found' }, 404);

  return ctx.json({ data });
};

export const createSource = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.title) {
    return ctx.json({ error: 'Missing required field: title' }, 400);
  }
  const data = await sourcesService.createSource(payload, ctx.env);
  return ctx.json({ data }, 201);
};

export const updateSource = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const data = await sourcesService.updateSource(id, payload, ctx.env);
  if (!data) return ctx.json({ error: 'Source not found' }, 404);

  return ctx.json({ data });
};

export const deleteSource = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const success = await sourcesService.deleteSource(id, ctx.env);
  if (!success) return ctx.json({ error: 'Source not found' }, 404);

  return ctx.json({ message: 'Source deleted successfully' });
};
