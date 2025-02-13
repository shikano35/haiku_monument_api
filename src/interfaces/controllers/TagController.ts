import type { Context } from 'hono';
import { TagUseCases } from '../../domain/usecases/TagUseCases';
import { TagRepository } from '../../infrastructure/repositories/TagRepository';
import type { D1Database } from '@cloudflare/workers-types';
import { parseQueryParams } from '../../utils/parseQueryParams';

const getUseCases = (env: { DB: D1Database }) => {
  const tagRepo = new TagRepository(env.DB);
  return new TagUseCases(tagRepo);
};

export const getAllTags = async (ctx: Context) => {
  const queryParams = parseQueryParams(new URLSearchParams(ctx.req.query()));
  const useCases = getUseCases(ctx.env);
  const data = await useCases.getAllTags(queryParams);
  return ctx.json({ data });
};

export const getTagById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const data = await useCases.getTagById(id);
  if (!data) return ctx.json({ error: 'Tag not found' }, 404);

  return ctx.json({ data });
};

export const createTag = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.name) {
    return ctx.json({ error: 'Missing required field: name' }, 400);
  }
  const useCases = getUseCases(ctx.env);
  const data = await useCases.createTag(payload);
  return ctx.json({ data }, 201);
};

export const updateTag = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const useCases = getUseCases(ctx.env);
  const data = await useCases.updateTag(id, payload);
  if (!data) return ctx.json({ error: 'Tag not found' }, 404);

  return ctx.json({ data });
};

export const deleteTag = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const success = await useCases.deleteTag(id);
  if (!success) return ctx.json({ error: 'Tag not found' }, 404);

  return ctx.json({ message: 'Tag deleted successfully' });
};
