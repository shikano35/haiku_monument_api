import type { Context } from 'hono';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import type { D1Database } from '@cloudflare/workers-types';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { parseQueryParams } from '../../utils/parseQueryParams';

const getUseCases = (env: { DB: D1Database }) => {
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return new HaikuMonumentUseCases(monumentRepo);
};

export const getAllHaikuMonuments = async (ctx: Context) => {
  const queryParams = parseQueryParams(new URLSearchParams(ctx.req.query()));
  const useCases = getUseCases(ctx.env);
  const data = await useCases.getAllHaikuMonuments(queryParams);

  const transformedData = data.map(({ authorId, sourceId, locationId, ...rest }) =>
    convertKeysToSnakeCase(rest)
  );

  return ctx.json({ haiku_monuments: transformedData });
};


export const getHaikuMonumentById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const data = await useCases.getHaikuMonumentById(id);
  if (!data) return ctx.json({ error: 'Haiku Monument not found' }, 404);

  const { authorId, sourceId, locationId, ...filteredData } = data;

  return ctx.json({ haiku_monuments: convertKeysToSnakeCase(filteredData) });
};

export const createHaikuMonument = async (ctx: Context) => {
  const payload = await ctx.req.json();

  if (!payload.text) {
    return ctx.json({ error: 'Missing required field: text' }, 400);
  }

  const monumentData = {
    text: payload.text,
    establishedDate: payload.established_date || null,
    commentary: payload.commentary || null,
    imageUrl: payload.image_url || null,
    author: payload.author || null,
    source: payload.source || null,
    location: payload.location || null,
    authorId: null,
    sourceId: null,
    locationId: null,
  };

  const useCases = getUseCases(ctx.env);
  const data = await useCases.createHaikuMonument(monumentData);

  const { authorId, sourceId, locationId, ...filteredData } = data;

  return ctx.json({ haiku_monuments: convertKeysToSnakeCase(filteredData) }, 201);
};


export const updateHaikuMonument = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const useCases = getUseCases(ctx.env);
  const data = await useCases.updateHaikuMonument(id, payload);
  if (!data) return ctx.json({ error: 'Haiku Monument not found' }, 404);

  const { authorId, sourceId, locationId, ...filteredData } = data;

  return ctx.json({ haiku_monuments: convertKeysToSnakeCase(filteredData) });
};

export const deleteHaikuMonument = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const success = await useCases.deleteHaikuMonument(id);
  if (!success) return ctx.json({ error: 'Haiku Monument not found' }, 404);

  return ctx.json({ message: 'Haiku Monument deleted successfully' });
};
