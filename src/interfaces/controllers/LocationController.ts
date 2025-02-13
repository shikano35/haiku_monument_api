import type { Context } from 'hono';
import { LocationUseCases } from '../../domain/usecases/LocationUseCases';
import { LocationRepository } from '../../infrastructure/repositories/LocationRepository';
import type { D1Database } from '@cloudflare/workers-types';
import { parseQueryParams } from '../../utils/parseQueryParams';

const getUseCases = (env: { DB: D1Database }) => {
  const locationRepo = new LocationRepository(env.DB);
  return new LocationUseCases(locationRepo);
};

export const getAllLocations = async (ctx: Context) => {
  const queryParams = parseQueryParams(new URLSearchParams(ctx.req.query()));
  const useCases = getUseCases(ctx.env);
  const data = await useCases.getAllLocations(queryParams);
  return ctx.json({ data });
};

export const getLocationById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const data = await useCases.getLocationById(id);
  if (!data) return ctx.json({ error: 'Location not found' }, 404);

  return ctx.json({ data });
};

export const createLocation = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (
    !payload.address ||
    typeof payload.latitude !== 'number' ||
    typeof payload.longitude !== 'number' ||
    !payload.name
  ) {
    return ctx.json({ error: 'Missing required fields' }, 400);
  }

  const useCases = getUseCases(ctx.env);
  const data = await useCases.createLocation(payload);
  return ctx.json({ data }, 201);
};

export const updateLocation = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const useCases = getUseCases(ctx.env);
  const data = await useCases.updateLocation(id, payload);
  if (!data) return ctx.json({ error: 'Location not found' }, 404);

  return ctx.json({ data });
};

export const deleteLocation = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const success = await useCases.deleteLocation(id);
  if (!success) return ctx.json({ error: 'Location not found' }, 404);

  return ctx.json({ message: 'Location deleted successfully' });
};
