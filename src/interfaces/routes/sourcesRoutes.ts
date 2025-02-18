import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../../types/env';
import { SourceUseCases } from '../../domain/usecases/SourceUseCases';
import { SourceRepository } from '../../infrastructure/repositories/SourceRepository';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { parseQueryParams } from '../../utils/parseQueryParams';

const createSourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  author: z.string().optional().nullable(),
  year: z.number().optional().nullable(),
  url: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
});

const updateSourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long').optional(),
  author: z.string().optional().nullable(),
  year: z.number().optional().nullable(),
  url: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
});

const getUseCases = (env: Env) => {
  const sourceRepo = new SourceRepository(env.DB);
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return {
    sourceUseCases: new SourceUseCases(sourceRepo),
    monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
  };
};

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const { sourceUseCases } = getUseCases(c.env);
  const sources = await sourceUseCases.getAllSources(queryParams);
  return c.json(convertKeysToSnakeCase(sources));
});

router.get('/:id', async (c) => {
  const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { id } = parseResult.data;
  const { sourceUseCases } = getUseCases(c.env);
  const source = await sourceUseCases.getSourceById(id);
  if (!source) {
    return c.json({ error: 'Source not found' }, 404);
  }
  return c.json(convertKeysToSnakeCase(source));
});

router.post(
  '/',
  zValidator('json', createSourceSchema),
  async (c) => {
    const rawPayload = c.req.valid('json');
    const payload = convertKeysToCamelCase(rawPayload);
    const { sourceUseCases } = getUseCases(c.env);
    const created = await sourceUseCases.createSource(payload);
    return c.json(convertKeysToSnakeCase(created), 201);
  }
);

router.put(
  '/:id',
  zValidator('json', updateSourceSchema),
  async (c) => {
    const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
    if (!parseResult.success) {
      return c.json({ error: parseResult.error.errors[0].message }, 400);
    }
    const { id } = parseResult.data;
    const rawPayload = c.req.valid('json');
    const payload = convertKeysToCamelCase(rawPayload);
    const { sourceUseCases } = getUseCases(c.env);
    const updated = await sourceUseCases.updateSource(id, payload);
    if (!updated) {
      return c.json({ error: 'Source not found' }, 404);
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
  const { sourceUseCases } = getUseCases(c.env);
  const success = await sourceUseCases.deleteSource(id);
  if (!success) {
    return c.json({ error: 'Source not found' }, 404);
  }
  return c.json({ message: 'Source deleted successfully', id });
});

router.get('/:sourceId/haiku-monuments', async (c) => {
  const parseResult = idParamSchema.safeParse({ id: c.req.param('sourceId') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { id: sourceId } = parseResult.data;
  const { monumentUseCases } = getUseCases(c.env);
  const monuments = await monumentUseCases.getHaikuMonumentsBySource(sourceId);
  const cleaned = monuments.map(({ authorId, sourceId, locationId, ...rest }) => rest);
  return c.json(convertKeysToSnakeCase(cleaned));
});

export default router;
