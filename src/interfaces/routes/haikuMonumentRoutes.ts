import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../../types/env';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { parseQueryParams } from '../../utils/parseQueryParams';

// authorスキーマ（既存 or 新規）
const authorInputSchema = z.union([
  z.object({ id: z.number() }),
  z.object({
    name: z.string().min(1, 'Author name is required').max(255, 'Author name too long'),
    biography: z.string().optional().nullable(),
    links: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
  }),
]).optional().nullable();

// sourceスキーマ（既存 or 新規）
const sourceInputSchema = z.union([
  z.object({ id: z.number() }),
  z.object({
    title: z.string().min(1, 'Source title is required').max(255, 'Source title too long'),
    author: z.string().optional().nullable(),
    year: z.number().optional().nullable(),
    url: z.string().optional().nullable(),
    publisher: z.string().optional().nullable(),
  }),
]).optional().nullable();

// locationスキーマ（新規の場合、必ず各プロパティを null もしくは値にする）
const locationInputSchema = z.union([
  z.object({ id: z.number() }),
  z.object({
    prefecture: z.string().min(1, 'Prefecture is required'),
    region: z.string().nullable().default(null),
    address: z.string().nullable().default(null),
    latitude: z.number(),
    longitude: z.number(),
    name: z.string().nullable().default(null),
  }),
]).optional().nullable();

// POST用スキーマ
const createHaikuMonumentSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  established_date: z.string().optional().nullable(),
  commentary: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  author: authorInputSchema,
  source: sourceInputSchema,
  location: locationInputSchema,
}).transform(data => ({
  text: data.text,
  establishedDate: data.established_date ?? null,
  commentary: data.commentary ?? null,
  imageUrl: data.image_url ?? null,
  author: data.author ?? null,
  source: data.source ?? null,
  location: data.location ?? null,
}));

// PUT用スキーマ（更新は部分的な入力となるので、全体をPartialにする）
const updateHaikuMonumentSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  established_date: z.string().optional().nullable(),
  commentary: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  author: authorInputSchema,
  source: sourceInputSchema,
  location: locationInputSchema,
}).transform(data => ({
  text: data.text,
  establishedDate: data.established_date ?? null,
  commentary: data.commentary ?? null,
  imageUrl: data.image_url ?? null,
  author: data.author ?? null,
  source: data.source ?? null,
  location: data.location ?? null,
}));

// パスパラメータ用スキーマ：idを文字列から数値へ変換
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
});

// ユースケース取得（DI）
const getUseCases = (env: Env) => {
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return new HaikuMonumentUseCases(monumentRepo);
};

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const useCases = getUseCases(c.env);
  const monuments = await useCases.getAllHaikuMonuments(queryParams);
  const transformed = monuments.map(monument => convertKeysToSnakeCase(monument));
  return c.json({ haiku_monuments: transformed });
});

router.get('/:id', async (c) => {
  const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { id } = parseResult.data;
  const useCases = getUseCases(c.env);
  const monument = await useCases.getHaikuMonumentById(id);
  if (!monument) {
    return c.json({ error: 'Haiku Monument not found' }, 404);
  }
  return c.json({ haiku_monument: convertKeysToSnakeCase(monument) });
});

router.post(
  '/',
  zValidator('json', createHaikuMonumentSchema),
  async (c) => {
    const rawPayload = c.req.valid('json');
    const payload = convertKeysToCamelCase(rawPayload);
    const useCases = getUseCases(c.env);
    const created = await useCases.createHaikuMonument(payload);
    return c.json({ haiku_monument: convertKeysToSnakeCase(created) }, 201);
  }
);

router.put(
  '/:id',
  zValidator('json', updateHaikuMonumentSchema),
  async (c) => {
    const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
    if (!parseResult.success) {
      return c.json({ error: parseResult.error.errors[0].message }, 400);
    }
    const { id } = parseResult.data;
    const rawPayload = c.req.valid('json');
    const payload = convertKeysToCamelCase(rawPayload);
    const useCases = getUseCases(c.env);
    const updated = await useCases.updateHaikuMonument(id, payload);
    if (!updated) {
      return c.json({ error: 'Haiku Monument not found' }, 404);
    }
    return c.json({ haiku_monument: convertKeysToSnakeCase(updated) });
  }
);

router.delete('/:id', async (c) => {
  const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { id } = parseResult.data;
  const useCases = getUseCases(c.env);
  const success = await useCases.deleteHaikuMonument(id);
  if (!success) {
    return c.json({ error: 'Haiku Monument not found' }, 404);
  }
  return c.json({ message: 'Haiku Monument deleted successfully', id });
});

export default router;
