import type { Context } from 'hono';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import type { D1Database } from '@cloudflare/workers-types';

const getUseCases = (env: { DB: D1Database }) => {
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return new HaikuMonumentUseCases(monumentRepo);
};

export const getAllHaikuMonuments = async (ctx: Context) => {
  const useCases = getUseCases(ctx.env);
  const data = await useCases.getAllHaikuMonuments();

  const transformedData = data.map(({ authorId, sourceId, locationId, ...rest }) => rest);

  return ctx.json({ data: transformedData });
};


export const getHaikuMonumentById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const data = await useCases.getHaikuMonumentById(id);
  if (!data) return ctx.json({ error: 'Haiku Monument not found' }, 404);

  return ctx.json({ data });
};

export const createHaikuMonument = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.text || !payload.authorId) {
    return ctx.json({ error: 'Missing required fields: text and authorId' }, 400);
  }
  const useCases = getUseCases(ctx.env);
  const data = await useCases.createHaikuMonument(payload);
  return ctx.json({ data }, 201);
};

export const updateHaikuMonument = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const useCases = getUseCases(ctx.env);
  const data = await useCases.updateHaikuMonument(id, payload);
  if (!data) return ctx.json({ error: 'Haiku Monument not found' }, 404);

  return ctx.json({ data });
};

export const deleteHaikuMonument = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const success = await useCases.deleteHaikuMonument(id);
  if (!success) return ctx.json({ error: 'Haiku Monument not found' }, 404);

  return ctx.json({ message: 'Haiku Monument deleted successfully' });
};
