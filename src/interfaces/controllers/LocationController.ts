import type { Context } from 'hono';
import { LocationUseCases } from '../../domain/usecases/LocationUseCases';
import { LocationRepository } from '../../infrastructure/repositories/LocationRepository';
import type { D1Database } from '@cloudflare/workers-types';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';

const getUseCases = (env: { DB: D1Database }) => {
  const locationRepo = new LocationRepository(env.DB);
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return {
    LocationUseCases: new LocationUseCases(locationRepo),
    monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
  };
};

export const getAllLocations = async (ctx: Context) => {
  const queryParams = parseQueryParams(new URLSearchParams(ctx.req.query()));
  const { LocationUseCases } = getUseCases(ctx.env);
  const data = await LocationUseCases.getAllLocations(queryParams);
  return ctx.json(data);
};

export const getLocationById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) {
    ctx.status(400);
    return ctx.json({ error: 'Invalid ID' });
  }

  const { LocationUseCases } = getUseCases(ctx.env);
  const data = await LocationUseCases.getLocationById(id);
  if (!data) {
    ctx.status(404);
    return ctx.json({ error: 'Location not found' });
  }

  return ctx.json(data);
};

export const createLocation = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (
    !payload.address ||
    typeof payload.latitude !== 'number' ||
    typeof payload.longitude !== 'number' ||
    !payload.name
  ) {
    ctx.status(400);
    return ctx.json({ error: 'Missing required fields' });
  }

  const { LocationUseCases } = getUseCases(ctx.env);
  const data = await LocationUseCases.createLocation(payload);
  ctx.status(201);
  return ctx.json(data);
};

export const updateLocation = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) {
    ctx.status(400);
    return ctx.json({ error: 'Invalid ID' });
  }

  const payload = await ctx.req.json();
  const { LocationUseCases } = getUseCases(ctx.env);
  const data = await LocationUseCases.updateLocation(id, payload);
  if (!data) {
    ctx.status(404);
    return ctx.json({ error: 'Location not found' });
  }

  return ctx.json(data);
};

export const deleteLocation = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) {
    ctx.status(400);
    return ctx.json({ error: 'Invalid ID' });
  }

  const { LocationUseCases } = getUseCases(ctx.env);
  const success = await LocationUseCases.deleteLocation(id);
  if (!success) {
    ctx.status(404);
    return ctx.json({ error: 'Location not found' });
  }

  return ctx.json({ id, message: 'Location deleted successfully' });
};

export const getHaikuMonumentsByLocation = async (ctx: Context) => {
  const locationId = Number(ctx.req.param('locationId'));
  if (Number.isNaN(locationId)) {
    ctx.status(400);
    return ctx.json({ error: 'Invalid locationId' });
  }

  const { monumentUseCases } = getUseCases(ctx.env);
  const monuments = await monumentUseCases.getHaikuMonumentsByLocation(locationId);

  const cleanedMonuments = monuments.map(monument => {
    const { authorId, sourceId, locationId, ...rest } = monument;
    return rest;
  });

  return ctx.json(convertKeysToSnakeCase(cleanedMonuments));
};
