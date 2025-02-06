import type { Context } from 'hono';
import * as haikuMonumentService from '../services/haikuMonumentService';

export const getAllHaikuMonuments = async (ctx: Context) => {
  const data = await haikuMonumentService.getAllHaikuMonuments(ctx.env);
  return ctx.json({ data });
};

export const getHaikuMonumentById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const data = await haikuMonumentService.getHaikuMonumentById(id, ctx.env);
  if (!data) return ctx.json({ error: 'Haiku Monument not found' }, 404);

  return ctx.json({ data });
};

export const createHaikuMonument = async (ctx: Context) => {
  const payload = await ctx.req.json();
  if (!payload.text || !payload.authorId) {
    return ctx.json({ error: 'Missing required fields: text and authorId' }, 400);
  }
  const data = await haikuMonumentService.createHaikuMonument(payload, ctx.env);
  return ctx.json({ data }, 201);
};

export const updateHaikuMonument = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const data = await haikuMonumentService.updateHaikuMonument(id, payload, ctx.env);
  if (!data) return ctx.json({ error: 'Haiku Monument not found' }, 404);

  return ctx.json({ data });
};

export const deleteHaikuMonument = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const success = await haikuMonumentService.deleteHaikuMonument(id, ctx.env);
  if (!success) return ctx.json({ error: 'Haiku Monument not found' }, 404);

  return ctx.json({ message: 'Haiku Monument deleted successfully' });
};
