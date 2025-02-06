import type { Context } from 'hono';
import * as locationsService from '../services/locationsService';

export const getAllLocations = async (ctx: Context) => {
  const data = await locationsService.getAllLocations(ctx.env);
  return ctx.json({ data });
};

export const getLocationById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const data = await locationsService.getLocationById(id, ctx.env);
  if (!data) return ctx.json({ error: 'Location not found' }, 404);

  return ctx.json({ data });
};

export const createLocation = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.address || payload.latitude === undefined || payload.longitude === undefined || !payload.name) {
    return ctx.json({ error: 'Missing required fields' }, 400);
  }
  const data = await locationsService.createLocation(payload, ctx.env);
  return ctx.json({ data }, 201);
};

export const updateLocation = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const data = await locationsService.updateLocation(id, payload, ctx.env);
  if (!data) return ctx.json({ error: 'Location not found' }, 404);

  return ctx.json({ data });
};

export const deleteLocation = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const success = await locationsService.deleteLocation(id, ctx.env);
  if (!success) return ctx.json({ error: 'Location not found' }, 404);

  return ctx.json({ message: 'Location deleted successfully' });
};
