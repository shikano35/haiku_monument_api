import { createRoute, z } from '@hono/zod-openapi';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import type { Poet } from '../../domain/entities/Poet';
import type { HaikuMonument } from '../../domain/entities/HaikuMonument';
import type { PoetResponse } from '../dtos/PoetResponse';
import type { HaikuMonumentResponse } from '../dtos/HaikuMonumentResponse';
import { createRouter } from './commonRouter';
import { createUseCases } from './createUseCases';

const convertPoetToSnakeCase = (poet: Poet): PoetResponse => ({
  id: poet.id,
  name: poet.name,
  biography: poet.biography !== undefined ? poet.biography : null,
  links: poet.links !== undefined ? poet.links : null,
  image_url: poet.imageUrl !== undefined ? poet.imageUrl : null,
  created_at: poet.createdAt !== null ? poet.createdAt : '',
  updated_at: poet.updatedAt !== null ? poet.updatedAt : '',
});

const convertPoetsToSnakeCase = (poets: Poet[]): PoetResponse[] =>
  poets.map(convertPoetToSnakeCase);

const convertHaikuMonumentToSnakeCase = (
  monument: HaikuMonument
): HaikuMonumentResponse => ({
  id: monument.id,
  text: monument.text,
  established_date: monument.establishedDate,
  commentary: monument.commentary ?? null,
  image_url: monument.imageUrl ?? null,
  created_at: monument.createdAt,
  updated_at: monument.updatedAt,
});

const convertHaikuMonumentsToSnakeCase = (monuments: HaikuMonument[]) =>
  monuments.map(convertHaikuMonumentToSnakeCase);

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
  })
  .openapi({ param: { name: 'id', in: 'path' } });

const PoetsQuerySchema = z.object({
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
      z.array(z.enum(["-created_at", "-updated_at", "created_at", "updated_at"]))
    )
    .optional()
    .openapi({
      param: {
        name: 'ordering',
        description:
          "並び替え\n* `created_at` - 作成日時の昇順\n* `-created_at` - 作成日時の降順\n* `updated_at` - 更新日時の昇順\n* `-updated_at` - 更新日時の降順",
        in: 'query',
        required: false,
      },
    }),
  search: z.string().optional().openapi({
    param: { name: 'search', description: '検索', in: 'query', required: false },
  }),
  name_contains: z.string().optional().openapi({
    param: { name: 'name_contains', description: '名前に含まれる文字列', in: 'query', required: false },
  }),
  biography_contains: z.string().optional().openapi({
    param: { name: 'biography_contains', description: '俳人の情報に含まれる文字列', in: 'query', required: false },
  }),
  created_at_gt: z.string().optional().openapi({
    param: {
      name: 'created_at_gt',
      description: "作成日時が指定した日時以降のもの\n例: 2025-01-01 00:00:00",
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
  created_at_lt: z.string().optional().openapi({
    param: {
      name: 'created_at_lt',
      description: "作成日時が指定した日時以前のもの\n例: 2025-01-01 00:00:00",
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
  updated_at_gt: z.string().optional().openapi({
    param: {
      name: 'updated_at_gt',
      description: "更新日時が指定した日時以降のもの\n例: 2025-01-01 00:00:00",
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
  updated_at_lt: z.string().optional().openapi({
    param: {
      name: 'updated_at_lt',
      description: "更新日時が指定した日時以前のもの\n例: 2025-01-01 00:00:00",
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
});

const createPoetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  biography: z.string().optional().nullable(),
  links: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

const updatePoetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  biography: z.string().optional().nullable(),
  links: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

const router = createRouter();

const getAllPoetsRoute = createRoute({
  method: 'get',
  tags: ['poets'],
  path: '/',
  request: { query: PoetsQuerySchema },
  responses: {
    200: {
      description: 'Success operation',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              biography: z.string().nullable(),
              links: z.string().nullable(),
              image_url: z.string().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
            })
          ),
        },
      },
    },
  },
});
router.openapi(getAllPoetsRoute, async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const { poetUseCases } = createUseCases(c.env, 'poets');
  const poets: Poet[] = await poetUseCases.getAllPoets(queryParams);
  return c.json(convertPoetsToSnakeCase(poets));
});

const getPoetByIdRoute = createRoute({
  method: 'get',
  tags: ['poets'],
  path: '/{id}',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Success operation',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            biography: z.string().nullable(),
            links: z.string().nullable(),
            image_url: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        },
      },
    },
    404: { description: 'Poet not found' },
  },
});
router.openapi(getPoetByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { poetUseCases } = createUseCases(c.env, 'poets');
  const poet: Poet | null = await poetUseCases.getPoetById(id);
  if (!poet) {
    return c.json({ error: 'Poet not found' }, 404);
  }
  return c.json(convertPoetToSnakeCase(poet));
});

const createPoetRoute = createRoute({
  method: 'post',
  tags: ['poets'],
  path: '/',
  request: {
    body: {
      content: { 'application/json': { schema: createPoetSchema } },
      required: true,
      description: 'Create a poet',
    },
  },
  responses: {
    201: {
      description: 'Poet created',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            biography: z.string().nullable(),
            links: z.string().nullable(),
            image_url: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        },
      },
    },
  },
});
router.openapi(createPoetRoute, async (c) => {
  const rawPayload = c.req.valid('json');
  const payload = convertKeysToCamelCase(rawPayload);
  const { poetUseCases } = createUseCases(c.env, 'poets');
  const created: Poet = await poetUseCases.createPoet(payload);
  return c.json(convertPoetToSnakeCase(created), 201);
});

const updatePoetRoute = createRoute({
  method: 'put',
  tags: ['poets'],
  path: '/{id}',
  request: {
    params: idParamSchema,
    body: {
      content: { 'application/json': { schema: updatePoetSchema } },
      required: true,
      description: 'Update a poet',
    },
  },
  responses: {
    200: {
      description: 'Poet updated',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            biography: z.string().nullable(),
            links: z.string().nullable(),
            image_url: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        },
      },
    },
    404: { description: 'Poet not found' },
  },
});
router.openapi(updatePoetRoute, async (c) => {
  const { id } = c.req.valid('param');
  const rawPayload = c.req.valid('json');
  const payload = convertKeysToCamelCase(rawPayload);
  const { poetUseCases } = createUseCases(c.env, 'poets');
  const updated: Poet | null = await poetUseCases.updatePoet(id, payload);
  if (!updated) {
    return c.json({ error: 'Poet not found' }, 404);
  }
  return c.json(convertPoetToSnakeCase(updated));
});

const deletePoetRoute = createRoute({
  method: 'delete',
  tags: ['poets'],
  path: '/{id}',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Poet deleted',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            message: z.string(),
          }),
        },
      },
    },
    404: { description: 'Poet not found' },
  },
});
router.openapi(deletePoetRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { poetUseCases } = createUseCases(c.env, 'poets');
  const success: boolean = await poetUseCases.deletePoet(id);
  if (!success) {
    return c.json({ error: 'Poet not found' }, 404);
  }
  return c.json({ id, message: 'Poet deleted successfully' });
});

const getPoetHaikuMonumentsRoute = createRoute({
  method: 'get',
  tags: ['poets'],
  path: '/{id}/haiku-monuments',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Haiku monuments for a poet',
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
router.openapi(getPoetHaikuMonumentsRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { monumentUseCases } =  createUseCases(c.env, 'haikuMonuments');
  const monuments: HaikuMonument[] = await monumentUseCases.getHaikuMonumentsByPoet(id);
  return c.json(convertHaikuMonumentsToSnakeCase(monuments));
});

export default router;
