import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { Env } from '../../types/env';
import { AuthorRepository } from '../../infrastructure/repositories/AuthorRepository';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { AuthorUseCases } from '../../domain/usecases/AuthorUseCases';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';

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
}).openapi({
  param: { name: 'id', in: 'path' },
});

const authorsQuerySchema = z.object({
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

const convertAuthorToSnakeCase = (author: {
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
  id: author.id,
  name: author.name,
  biography: author.biography ?? null,
  links: author.links ?? null,
  image_url: author.imageUrl ?? null,
  created_at: author.createdAt as string,
  updated_at: author.updatedAt as string,
});

const convertAuthorsToSnakeCase = (authors: Array<{
  id: number;
  name: string;
  biography?: string | null;
  links?: string | null;
  imageUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}>) => authors.map(convertAuthorToSnakeCase);

const getUseCases = (env: Env) => {
  const authorRepo = new AuthorRepository(env.DB);
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return {
    authorUseCases: new AuthorUseCases(authorRepo),
    monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
  };
};

const router = new OpenAPIHono<{ Bindings: Env }>();

const getAllAuthorsRoute = createRoute({
  method: 'get',
  tags: ['authors'],
  path: '/',
  request: {
    query: authorsQuerySchema,
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
router.openapi(getAllAuthorsRoute, async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const { authorUseCases } = getUseCases(c.env);
  const authors = await authorUseCases.getAllAuthors(queryParams);
  return c.json(convertAuthorsToSnakeCase(authors));
});

const getAuthorByIdRoute = createRoute({
  method: 'get',
  tags: ['authors'],
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
    404: { description: 'Author not found' },
  },
});
router.openapi(getAuthorByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { authorUseCases } = getUseCases(c.env);
  const author = await authorUseCases.getAuthorById(id);
  if (!author) {
    return c.json({ error: 'Author not found' }, 404);
  }
  return c.json(convertAuthorToSnakeCase(author));
});

const createAuthorRoute = createRoute({
  method: 'post',
  tags: ['authors'],
  path: '/',
  request: {
    body: {
      content: {
        'application/json': { schema: createAuthorSchema },
      },
      required: true,
      description: 'Create an author',
    },
  },
  responses: {
    201: {
      description: 'Author created',
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
router.openapi(createAuthorRoute, async (c) => {
  const rawPayload = c.req.valid('json');
  const payload = convertKeysToCamelCase(rawPayload);
  const { authorUseCases } = getUseCases(c.env);
  const created = await authorUseCases.createAuthor(payload);
  return c.json(convertAuthorToSnakeCase(created), 201);
});

const updateAuthorRoute = createRoute({
  method: 'put',
  tags: ['authors'],
  path: '/{id}',
  request: {
    params: idParamSchema,
    body: {
      content: {
        'application/json': { schema: updateAuthorSchema },
      },
      required: true,
      description: 'Update an author',
    },
  },
  responses: {
    200: {
      description: 'Author updated',
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
    404: { description: 'Author not found' },
  },
});
router.openapi(updateAuthorRoute, async (c) => {
  const { id } = c.req.valid('param');
  const rawPayload = c.req.valid('json');
  const payload = convertKeysToCamelCase(rawPayload);
  const { authorUseCases } = getUseCases(c.env);
  const updated = await authorUseCases.updateAuthor(id, payload);
  if (!updated) {
    return c.json({ error: 'Author not found' }, 404);
  }
  return c.json(convertAuthorToSnakeCase(updated));
});

const deleteAuthorRoute = createRoute({
  method: 'delete',
  tags: ['authors'],
  path: '/{id}',
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: 'Author deleted',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            message: z.string(),
          }),
        },
      },
    },
    404: { description: 'Author not found' },
  },
});
router.openapi(deleteAuthorRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { authorUseCases } = getUseCases(c.env);
  const success = await authorUseCases.deleteAuthor(id);
  if (!success) {
    return c.json({ error: 'Author not found' }, 404);
  }
  return c.json({ id, message: 'Author deleted successfully' });
});

const getAuthorHaikuMonumentsRoute = createRoute({
  method: 'get',
  tags: ['authors'],
  path: '/{id}/haiku-monuments',
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: 'Haiku monuments for an author',
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
router.openapi(getAuthorHaikuMonumentsRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { monumentUseCases } = getUseCases(c.env);
  const monuments = await monumentUseCases.getHaikuMonumentsByAuthor(id);
  const cleaned = monuments.map(({ authorId, sourceId, locationId, ...rest }) => rest);
  return c.json(convertKeysToSnakeCase(cleaned));
});

export default router;
