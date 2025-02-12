import type { Context } from 'hono';
import { AuthorUseCases } from '../../domain/usecases/AuthorUseCases';
import { AuthorRepository } from '../../infrastructure/repositories/AuthorRepository';
import type { D1Database } from '@cloudflare/workers-types';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';

const getUseCases = (env: { DB: D1Database }) => {
  const authorRepo = new AuthorRepository(env.DB);
  return new AuthorUseCases(authorRepo);
};

export const getAllAuthors = async (ctx: Context) => {
  const useCases = getUseCases(ctx.env);
  const data = await useCases.getAllAuthors();
  return ctx.json(convertKeysToSnakeCase(data));
};

export const getAuthorById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const data = await useCases.getAuthorById(id);
  if (!data) return ctx.json({ error: 'Author not found' }, 404);

  return ctx.json(convertKeysToSnakeCase(data));
};

import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';

export const createAuthor = async (ctx: Context) => {
  const payload = await ctx.req.json();
  const camelPayload = convertKeysToCamelCase(payload);
  if (!camelPayload.name) {
    return ctx.json({ error: 'Missing required field: name' }, 400);
  }
  const useCases = getUseCases(ctx.env);
  const data = await useCases.createAuthor(camelPayload);
  return ctx.json(convertKeysToSnakeCase(data), 201);
};

export const updateAuthor = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const camelPayload = convertKeysToCamelCase(payload);

  const useCases = getUseCases(ctx.env);
  const data = await useCases.updateAuthor(id, camelPayload);
  if (!data) return ctx.json({ error: 'Author not found' }, 404);

  return ctx.json(convertKeysToSnakeCase(data));
};


export const deleteAuthor = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const useCases = getUseCases(ctx.env);
  const success = await useCases.deleteAuthor(id);
  if (!success) return ctx.json({ error: 'Author not found' }, 404);

  return ctx.json({ message: 'Author deleted successfully' });
};
