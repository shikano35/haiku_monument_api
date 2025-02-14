import type { Context } from 'hono';
import { AuthorUseCases } from '../../domain/usecases/AuthorUseCases';
import { AuthorRepository } from '../../infrastructure/repositories/AuthorRepository';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import type { D1Database } from '@cloudflare/workers-types';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import { parseQueryParams } from '../../utils/parseQueryParams';

const getUseCases = (env: { DB: D1Database }) => {
  const authorRepo = new AuthorRepository(env.DB);
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return {
    authorUseCases: new AuthorUseCases(authorRepo),
    monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
  };
};

export const getAllAuthors = async (ctx: Context) => {
  const queryParams = parseQueryParams(new URLSearchParams(ctx.req.query()));
  const { authorUseCases } = getUseCases(ctx.env);
  const data = await authorUseCases.getAllAuthors(queryParams);
  return ctx.json(convertKeysToSnakeCase(data));
};

export const getAuthorById = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const { authorUseCases } = getUseCases(ctx.env);
  const data = await authorUseCases.getAuthorById(id);
  if (!data) return ctx.json({ error: 'Author not found' }, 404);

  return ctx.json(convertKeysToSnakeCase(data));
};

export const createAuthor = async (ctx: Context) => {
  const payload = await ctx.req.json();
  const camelPayload = convertKeysToCamelCase(payload);
  if (!camelPayload.name) {
    return ctx.json({ error: 'Missing required field: name' }, 400);
  }
  const { authorUseCases } = getUseCases(ctx.env);
  const data = await authorUseCases.createAuthor(camelPayload);
  return ctx.json(convertKeysToSnakeCase(data), 201);
};

export const updateAuthor = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const payload = await ctx.req.json();
  const camelPayload = convertKeysToCamelCase(payload);

  const { authorUseCases } = getUseCases(ctx.env);
  const data = await authorUseCases.updateAuthor(id, camelPayload);
  if (!data) return ctx.json({ error: 'Author not found' }, 404);

  return ctx.json(convertKeysToSnakeCase(data));
};

export const deleteAuthor = async (ctx: Context) => {
  const id = Number(ctx.req.param('id'));
  if (Number.isNaN(id)) return ctx.json({ error: 'Invalid ID' }, 400);

  const { authorUseCases } = getUseCases(ctx.env);
  const success = await authorUseCases.deleteAuthor(id);
  if (!success) return ctx.json({ error: 'Author not found' }, 404);

  return ctx.json({ message: 'Author deleted successfully' });
};

export const getHaikuMonumentsByAuthor = async (ctx: Context) => {
  const authorId = Number(ctx.req.param('authorId'));
  if (Number.isNaN(authorId)) {
    return ctx.json({ error: 'Invalid authorId' }, 400);
  }

  const { monumentUseCases } = getUseCases(ctx.env);
  const monuments = await monumentUseCases.getHaikuMonumentsByAuthor(authorId);

  const cleanedMonuments = monuments.map(monument => {
    const { authorId, sourceId, locationId, ...rest } = monument;
    return rest;
  });

  return ctx.json(convertKeysToSnakeCase(cleanedMonuments));
};
