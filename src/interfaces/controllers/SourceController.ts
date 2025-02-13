import type { Context } from 'hono';
import { SourceUseCases } from '../../domain/usecases/SourceUseCases';
import { SourceRepository } from '../../infrastructure/repositories/SourceRepository';
import type { D1Database } from '@cloudflare/workers-types';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { parseQueryParams } from '../../utils/parseQueryParams';

const getUseCases = (env: { DB: D1Database }) => {
  const sourceRepo = new SourceRepository(env.DB);
  return new SourceUseCases(sourceRepo);
};

export const getAllSources = async (ctx: Context) => {
  const queryParams = parseQueryParams(new URLSearchParams(ctx.req.query()));
  const useCases = getUseCases(ctx.env);
  const data = await useCases.getAllSources(queryParams);
  return ctx.json(convertKeysToSnakeCase(data));
};

export const getSourceById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const data = await useCases.getSourceById(id);
  if (!data) return ctx.json({ error: 'Source not found' }, 404);

  return ctx.json(convertKeysToSnakeCase(data));
};

export const createSource = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.title) {
    return ctx.json({ error: 'Missing required field: title' }, 400);
  }
  const useCases = getUseCases(ctx.env);
  const data = await useCases.createSource(payload);
  return ctx.json(convertKeysToSnakeCase(data), 201);
};

export const updateSource = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const useCases = getUseCases(ctx.env);
  const data = await useCases.updateSource(id, payload);
  if (!data) return ctx.json({ error: 'Source not found' }, 404);

  return ctx.json(convertKeysToSnakeCase(data));
};

export const deleteSource = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const success = await useCases.deleteSource(id);
  if (!success) return ctx.json({ error: 'Source not found' }, 404);

  return ctx.json({ message: 'Source deleted successfully' });
};
