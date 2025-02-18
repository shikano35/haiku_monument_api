import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { AuthorRepository } from '../../infrastructure/repositories/AuthorRepository';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { AuthorUseCases } from '../../domain/usecases/AuthorUseCases';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import type { Env } from '../../types/env';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';

const createAuthorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  biography: z.string().optional().nullable(),
  links: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

const updateAuthorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  biography: z.string().optional().nullable(),
  links: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
});

const authorIdParamSchema = z.object({
  authorId: z.string().regex(/^\d+$/, 'Invalid authorId').transform(Number),
});

const getUseCases = (env: Env) => {
  const authorRepo = new AuthorRepository(env.DB);
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return {
    authorUseCases: new AuthorUseCases(authorRepo),
    monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
  };
};

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const { authorUseCases } = getUseCases(c.env);
  const authors = await authorUseCases.getAllAuthors(queryParams);
  return c.json(convertKeysToSnakeCase(authors));
});

router.get('/:id', async (c) => {
  const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { id } = parseResult.data;
  const { authorUseCases } = getUseCases(c.env);
  const author = await authorUseCases.getAuthorById(id);
  if (!author) {
    return c.json({ error: 'Author not found' }, 404);
  }
  return c.json(convertKeysToSnakeCase(author));
});

router.post(
  '/',
  zValidator('json', createAuthorSchema),
  async (c) => {
    const rawPayload = c.req.valid('json');
    const payload = convertKeysToCamelCase(rawPayload);
    const { authorUseCases } = getUseCases(c.env);
    const created = await authorUseCases.createAuthor(payload);
    return c.json(convertKeysToSnakeCase(created), 201);
  }
);

router.put(
  '/:id',
  zValidator('json', updateAuthorSchema),
  async (c) => {
    const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
    if (!parseResult.success) {
      return c.json({ error: parseResult.error.errors[0].message }, 400);
    }
    const { id } = parseResult.data;
    const rawPayload = c.req.valid('json');
    const payload = convertKeysToCamelCase(rawPayload);
    const { authorUseCases } = getUseCases(c.env);
    const updated = await authorUseCases.updateAuthor(id, payload);
    if (!updated) {
      return c.json({ error: 'Author not found' }, 404);
    }
    return c.json(convertKeysToSnakeCase(updated));
  }
);

router.delete('/:id', async (c) => {
  const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { id } = parseResult.data;
  const { authorUseCases } = getUseCases(c.env);
  const success = await authorUseCases.deleteAuthor(id);
  if (!success) {
    return c.json({ error: 'Author not found' }, 404);
  }
  return c.json({ id, message: 'Author deleted successfully' });
});

router.get('/:authorId/haiku-monuments', async (c) => {
  const parseResult = authorIdParamSchema.safeParse({ authorId: c.req.param('authorId') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { authorId } = parseResult.data;
  const { monumentUseCases } = getUseCases(c.env);
  const monuments = await monumentUseCases.getHaikuMonumentsByAuthor(authorId);
  const cleaned = monuments.map(({ authorId, sourceId, locationId, ...rest }) => rest);
  return c.json(convertKeysToSnakeCase(cleaned));
});

export default router;
