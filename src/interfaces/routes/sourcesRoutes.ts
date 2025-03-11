import { createRoute, z } from '@hono/zod-openapi';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { parseQueryParams } from '../../utils/parseQueryParams';
import type { SourceResponse } from '../dtos/SourceResponse';
import { createRouter } from './commonRouter';
import { createUseCases } from './createUseCases';

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
  })
  .openapi({ param: { name: 'id', in: 'path' } });

const sourcesQuerySchema = z.object({
  limit: z.coerce.number().optional().openapi({
    param: { name: 'limit', description: '取得する件数', in: 'query', required: false },
    type: 'integer',
  }),
  offset: z.coerce.number().optional().openapi({
    param: { name: 'offset', description: '取得する位置', in: 'query', required: false },
    type: 'integer',
  }),
  ordering: z
    .preprocess(
      (arg) => (typeof arg === 'string' ? [arg] : arg),
      z.array(
        z.enum([
          '-title',
          '-author',
          '-year',
          '-publisher',
          '-created_at',
          '-updated_at',
          'title',
          'author',
          'year',
          'publisher',
          'created_at',
          'updated_at',
        ])
      )
    )
    .optional()
    .openapi({
      param: {
        name: 'ordering',
        description:
          "並び替え\n* `title` - タイトルの昇順\n* `-title` - タイトルの降順\n* `author` - 著者の昇順\n* `-author` - 著者の降順\n* `year` - 出版年の昇順\n* `-year` - 出版年の降順\n* `publisher` - 出版社の昇順\n* `-publisher` - 出版社の降順\n* `created_at` - 作成日時の昇順\n* `-created_at` - 作成日時の降順\n* `updated_at` - 更新日時の昇順\n* `-updated_at` - 更新日時の降順",
        in: 'query',
        required: false,
      },
    }),
  search: z.string().optional().openapi({
    param: { name: 'search', description: '検索', in: 'query', required: false },
  }),
  title_contains: z.string().optional().openapi({
    param: { name: 'title_contains', description: 'タイトルに含まれる文字列', in: 'query', required: false },
  }),
  name_contains: z.string().optional().openapi({
    param: { name: 'name_contains', description: '著者に含まれる文字列', in: 'query', required: false },
  }),
});

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

const router = createRouter();

const getAllSourcesRoute = createRoute({
  method: 'get',
  tags: ['sources'],
  path: '/',
  request: { query: sourcesQuerySchema },
  responses: {
    200: {
      description: 'Success operation',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.number(),
              title: z.string(),
              author: z.string().nullable(),
              year: z.number().nullable(),
              url: z.string().nullable(),
              publisher: z.string().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
            })
          ),
        },
      },
    },
  },
});
router.openapi(getAllSourcesRoute, async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const { sourceUseCases } = createUseCases(c.env, 'sources');
  const sources = await sourceUseCases.getAllSources(queryParams);
  const snakeSources = convertKeysToSnakeCase(sources) as unknown as SourceResponse[];
  return c.json(snakeSources);
});

const getSourceByIdRoute = createRoute({
  method: 'get',
  tags: ['sources'],
  path: '/{id}',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Success operation',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            title: z.string(),
            author: z.string().nullable(),
            year: z.number().nullable(),
            url: z.string().nullable(),
            publisher: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        },
      },
    },
    404: { description: 'Source not found' },
  },
});
router.openapi(getSourceByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { sourceUseCases } = createUseCases(c.env, 'sources');
  const source = await sourceUseCases.getSourceById(id);
  if (!source) return c.json({ error: 'Source not found' }, 404);
  const snakeSource = convertKeysToSnakeCase(source) as unknown as SourceResponse;
  return c.json(snakeSource);
});

const createSourceRoute = createRoute({
  method: 'post',
  tags: ['sources'],
  path: '/',
  request: {
    body: {
      content: { 'application/json': { schema: createSourceSchema } },
      required: true,
      description: 'Create a source',
    },
  },
  responses: {
    201: {
      description: 'Source created',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            title: z.string(),
            author: z.string().nullable(),
            year: z.number().nullable(),
            url: z.string().nullable(),
            publisher: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        },
      },
    },
  },
});
router.openapi(createSourceRoute, async (c) => {
  const rawPayload = c.req.valid('json');
  const payload = convertKeysToCamelCase(rawPayload);
  const { sourceUseCases } = createUseCases(c.env, 'sources');
  const created = await sourceUseCases.createSource(payload);
  const snakeCreated = convertKeysToSnakeCase(created) as unknown as SourceResponse;
  return c.json(snakeCreated, 201);
});

const updateSourceRoute = createRoute({
  method: 'put',
  tags: ['sources'],
  path: '/{id}',
  request: {
    params: idParamSchema,
    body: {
      content: { 'application/json': { schema: updateSourceSchema } },
      required: true,
      description: 'Update a source',
    },
  },
  responses: {
    200: {
      description: 'Source updated',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            title: z.string(),
            author: z.string().nullable(),
            year: z.number().nullable(),
            url: z.string().nullable(),
            publisher: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        },
      },
    },
    404: { description: 'Source not found' },
  },
});
router.openapi(updateSourceRoute, async (c) => {
  const { id } = c.req.valid('param');
  const rawPayload = c.req.valid('json');
  const payload = convertKeysToCamelCase(rawPayload);
  const { sourceUseCases } = createUseCases(c.env, 'sources');
  const updated = await sourceUseCases.updateSource(id, payload);
  if (!updated) return c.json({ error: 'Source not found' }, 404);
  const snakeUpdated = convertKeysToSnakeCase(updated) as unknown as SourceResponse;
  return c.json(snakeUpdated);
});

const deleteSourceRoute = createRoute({
  method: 'delete',
  tags: ['sources'],
  path: '/{id}',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Source deleted',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            message: z.string(),
          }),
        },
      },
    },
    404: { description: 'Source not found' },
  },
});
router.openapi(deleteSourceRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { sourceUseCases } = createUseCases(c.env, 'sources');
  const success = await sourceUseCases.deleteSource(id);
  if (!success) return c.json({ error: 'Source not found' }, 404);
  return c.json({ id, message: 'Source deleted successfully' });
});

const getSourceHaikuMonumentsRoute = createRoute({
  method: 'get',
  tags: ['sources'],
  path: '/{id}/haiku-monuments',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Haiku monuments for a source',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.number(),
              text: z.string(),
              established_date: z.string(),
              commentary: z.string(),
              image_url: z.string().url(),
              created_at: z.string(),
              updated_at: z.string(),
            })
          ),
        },
      },
    },
    400: { description: 'Invalid ID' },
  },
});
router.openapi(getSourceHaikuMonumentsRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments');
  const monuments = await monumentUseCases.getHaikuMonumentsBySource(id);
  const cleaned = monuments.map(({ poetId, sourceId, locationId, ...rest }) => rest);
  return c.json(convertKeysToSnakeCase(cleaned));
});

export default router;
