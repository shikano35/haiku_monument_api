import type { Context } from 'hono';
import * as tagsService from '../services/tagsService';

export const getAllTags = async (ctx: Context) => {
  const data = await tagsService.getAllTags(ctx.env);
  return ctx.json({ data });
};

export const getTagById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const data = await tagsService.getTagById(id, ctx.env);
  if (!data) return ctx.json({ error: 'Tag not found' }, 404);

  return ctx.json({ data });
};

export const createTag = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.name) {
    return ctx.json({ error: 'Missing required field: name' }, 400);
  }
  const data = await tagsService.createTag(payload, ctx.env);
  return ctx.json({ data }, 201);
};

export const updateTag = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const data = await tagsService.updateTag(id, payload, ctx.env);
  if (!data) return ctx.json({ error: 'Tag not found' }, 404);

  return ctx.json({ data });
};

export const deleteTag = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const success = await tagsService.deleteTag(id, ctx.env);
  if (!success) return ctx.json({ error: 'Tag not found' }, 404);

  return ctx.json({ message: 'Tag deleted successfully' });
};
