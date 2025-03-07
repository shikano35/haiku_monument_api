import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { Env } from '../../types/env';
import { PoetRepository } from '../../infrastructure/repositories/PoetRepository';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { PoetUseCases } from '../../domain/usecases/PoetUseCases';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';

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

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
}).openapi({
  param: { name: 'id', in: 'path' },
});

const PoetsQuerySchema = z.object({
  limit: z.coerce.number().optional().openapi({
    param: { name: 'limit', description: '取得する件数', in: 'query', required: false },
    type: 'integer',
  }),
  offset: z.coerce.number().optional().openapi({
    param: { name: 'offset', description: '取得する位置', in: 'query', required: false },
    type: 'integer',
  }),
  ordering: z.preprocess(
    (arg) => (typeof arg === 'string' ? [arg] : arg),
    z.array(z.enum(["-created_at", "-updated_at", "created_at", "updated_at"]))
  ).optional().openapi({
    param: {
      name: 'ordering',
      description: "並び替え\n* `created_at` - 作成日時の昇順\n* `-created_at` - 作成日時の降順\n* `updated_at` - 更新日時の昇順\n* `-updated_at` - 更新日時の降順",
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
    param: { name: 'created_at_gt', description: "作成日時が指定した日時以降のもの\n例: 2025-01-01 00:00:00", in: 'query', required: false },
    format: 'date-time',
  }),
  created_at_lt: z.string().optional().openapi({
    param: { name: 'created_at_lt', description: "作成日時が指定した日時以前のもの\n例: 2025-01-01 00:00:00", in: 'query', required: false },
    format: 'date-time',
  }),
  updated_at_gt: z.string().optional().openapi({
    param: { name: 'updated_at_gt', description: "更新日時が指定した日時以降のもの\n例: 2025-01-01 00:00:00", in: 'query', required: false },
    format: 'date-time',
  }),
  updated_at_lt: z.string().optional().openapi({
    param: { name: 'updated_at_lt', description: "更新日時が指定した日時以前のもの\n例: 2025-01-01 00:00:00", in: 'query', required: false },
    format: 'date-time',
  }),
});

const convertPoetToSnakeCase = (poet: {
  id: number;
  name: string;
  biography?: string | null;
  links?: string | null;
  imageUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}): {
  id: number;
  name: string;
  biography: string | null;
  links: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
} => ({
  id: poet.id,
  name: poet.name,
  biography: poet.biography ?? null,
  links: poet.links ?? null,
  image_url: poet.imageUrl ?? null,
  created_at: poet.createdAt as string,
  updated_at: poet.updatedAt as string,
});

const convertPoetsToSnakeCase = (poets: Array<{
  id: number;
  name: string;
  biography?: string | null;
  links?: string | null;
  imageUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}>) => poets.map(convertPoetToSnakeCase);

const getUseCases = (env: Env) => {
  const poetRepo = new PoetRepository(env.DB);
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return {
    poetUseCases: new PoetUseCases(poetRepo),
    monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
  };
};

const router = new OpenAPIHono<{ Bindings: Env }>();

const getAllPoetsRoute = createRoute({
  method: 'get',
  tags: ['poets'],
  path: '/',
  request: {
    query: PoetsQuerySchema,
  },
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
  const { poetUseCases } = getUseCases(c.env);
  const poets = await poetUseCases.getAllPoets(queryParams);
  return c.json(convertPoetsToSnakeCase(poets));
});

const getPoetByIdRoute = createRoute({
  method: 'get',
  tags: ['poets'],
  path: '/{id}',
  request: {
    params: idParamSchema,
  },
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
  const { poetUseCases } = getUseCases(c.env);
  const poet = await poetUseCases.getPoetById(id);
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
      content: {
        'application/json': { schema: createPoetSchema },
      },
      required: true,
      description: 'Create an poet',
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
  const { poetUseCases } = getUseCases(c.env);
  const created = await poetUseCases.createPoet(payload);
  return c.json(convertPoetToSnakeCase(created), 201);
});

const updatePoetRoute = createRoute({
  method: 'put',
  tags: ['poets'],
  path: '/{id}',
  request: {
    params: idParamSchema,
    body: {
      content: {
        'application/json': { schema: updatePoetSchema },
      },
      required: true,
      description: 'Update an poet',
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
  const { poetUseCases } = getUseCases(c.env);
  const updated = await poetUseCases.updatePoet(id, payload);
  if (!updated) {
    return c.json({ error: 'Poet not found' }, 404);
  }
  return c.json(convertPoetToSnakeCase(updated));
});

const deletePoetRoute = createRoute({
  method: 'delete',
  tags: ['poets'],
  path: '/{id}',
  request: {
    params: idParamSchema,
  },
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
  const { poetUseCases } = getUseCases(c.env);
  const success = await poetUseCases.deletePoet(id);
  if (!success) {
    return c.json({ error: 'Poet not found' }, 404);
  }
  return c.json({ id, message: 'Poet deleted successfully' });
});

const getPoetHaikuMonumentsRoute = createRoute({
  method: 'get',
  tags: ['poets'],
  path: '/{id}/haiku-monuments',
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: 'Haiku monuments for an poet',
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
  const { monumentUseCases } = getUseCases(c.env);
  const monuments = await monumentUseCases.getHaikuMonumentsByPoet(id);
  const cleaned = monuments.map(({ poetId, sourceId, locationId, ...rest }) => rest);
  return c.json(convertKeysToSnakeCase(cleaned));
});

export default router;
