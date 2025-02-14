import type { Context } from 'hono';
import { SourceUseCases } from '../../domain/usecases/SourceUseCases';
import { SourceRepository } from '../../infrastructure/repositories/SourceRepository';
import type { D1Database } from '@cloudflare/workers-types';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';

const getUseCases = (env: { DB: D1Database }) => {
  const sourceRepo = new SourceRepository(env.DB);
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return {
    sourceUseCases: new SourceUseCases(sourceRepo),
    monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
  };
};

export const getAllSources = async (ctx: Context) => {
  const queryParams = parseQueryParams(new URLSearchParams(ctx.req.query()));
  const { sourceUseCases } = getUseCases(ctx.env);
  const data = await sourceUseCases.getAllSources(queryParams);
  return ctx.json(convertKeysToSnakeCase(data));
};

export const getSourceById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const { sourceUseCases } = getUseCases(ctx.env);
  const data = await sourceUseCases.getSourceById(id);
  if (!data) return ctx.json({ error: 'Source not found' }, 404);

  return ctx.json(convertKeysToSnakeCase(data));
};

export const createSource = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.title) {
    return ctx.json({ error: 'Missing required field: title' }, 400);
  }
  const { sourceUseCases } = getUseCases(ctx.env);
  const data = await sourceUseCases.createSource(payload);
  return ctx.json(convertKeysToSnakeCase(data), 201);
};

export const updateSource = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const { sourceUseCases } = getUseCases(ctx.env);
  const data = await sourceUseCases.updateSource(id, payload);
  if (!data) return ctx.json({ error: 'Source not found' }, 404);

  return ctx.json(convertKeysToSnakeCase(data));
};

export const deleteSource = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const { sourceUseCases } = getUseCases(ctx.env);
  const success = await sourceUseCases.deleteSource(id);
  if (!success) return ctx.json({ error: 'Source not found' }, 404);

  return ctx.json({ message: 'Source deleted successfully' });
};

export const getHaikuMonumentsBySource = async (ctx: Context) => {
  const sourceId = Number(ctx.req.param('sourceId'));
  if (Number.isNaN(sourceId)) {
    return ctx.json({ error: 'Invalid sourceId' }, 400);
  }

  const { monumentUseCases } = getUseCases(ctx.env);
  const monuments = await monumentUseCases.getHaikuMonumentsBySource(sourceId);

  const cleanedMonuments = monuments.map(monument => {
    const { authorId, sourceId, locationId, ...rest } = monument;
    return rest;
  });

  return ctx.json(convertKeysToSnakeCase(cleanedMonuments));
};