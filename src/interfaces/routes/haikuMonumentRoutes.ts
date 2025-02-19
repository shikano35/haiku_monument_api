import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { Env } from '../../types/env';
import type { HaikuMonument } from '../../domain/entities/HaikuMonument';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import { parseQueryParams } from '../../utils/parseQueryParams';

export interface AuthorResponse {
  id: number;
  name: string;
  biography: string | null;
  links: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourceResponse {
  id: number;
  title: string;
  author: string | null;
  year: number | null;
  url: string | null;
  publisher: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationResponse {
  id: number;
  prefecture: string;
  region: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  name: string | null;
}

export interface HaikuMonumentResponseType {
  id: number;
  text: string;
  established_date: string | null;
  commentary: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  author_id: number | null;
  source_id: number | null;
  location_id: number | null;
  authors: AuthorResponse[];
  sources: SourceResponse[];
  locations: LocationResponse[];
}

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
  })
  .openapi({
    param: { name: 'id', in: 'path' },
  });

const haikuMonumentQuerySchema = z.object({
  limit: z.coerce.number().optional().openapi({
    param: { name: 'limit', description: '取得する件数', in: 'query', required: false },
    type: 'integer',
  }),
  offset: z.coerce.number().optional().openapi({
    param: { name: 'offset', description: '取得開始位置', in: 'query', required: false },
    type: 'integer',
  }),
  ordering: z
    .preprocess(
      (arg) => (typeof arg === 'string' ? [arg] : arg),
      z.array(
        z.enum([
          '-text',
          '-established_date',
          '-author',
          '-source',
          '-prefecture',
          '-region',
          '-created_at',
          '-updated_at',
          'text',
          'established_date',
          'author',
          'source',
          'prefecture',
          'region',
          'created_at',
          'updated_at',
        ])
      )
    )
    .optional()
    .openapi({
      param: {
        name: 'ordering',
        description: `並び替え
* \`text\` - 俳句の昇順
* \`-text\` - 俳句の降順
* \`established_date\` - 建立日の昇順
* \`-established_date\` - 建立日の降順
* \`author\` - 著者の昇順
* \`-author\` - 著者の降順
* \`source\` - 出典の昇順
* \`-source\` - 出典の降順
* \`prefecture\` - 都道府県の昇順
* \`-prefecture\` - 都道府県の降順
* \`region\` - 地域の昇順
* \`-region\` - 地域の降順
* \`created_at\` - 作成日時の昇順
* \`-created_at\` - 作成日時の降順
* \`updated_at\` - 更新日時の昇順
* \`-updated_at\` - 更新日時の降順`,
        in: 'query',
        required: false,
      },
    }),
  search: z.string().optional().openapi({
    param: { name: 'search', description: '俳句と俳句の解説で検索', in: 'query', required: false },
  }),
  title_contains: z.string().optional().openapi({
    param: { name: 'title_contains', description: '俳句に対する検索', in: 'query', required: false },
  }),
  description_contains: z.string().optional().openapi({
    param: { name: 'description_contains', description: '俳句の解説に対する検索', in: 'query', required: false },
  }),
  name_contains: z.string().optional().openapi({
    param: { name: 'name_contains', description: '著者に対する検索', in: 'query', required: false },
  }),
  biography_contains: z.string().optional().openapi({
    param: { name: 'biography_contains', description: '著者の解説に対する検索', in: 'query', required: false },
  }),
  prefecture: z.string().optional().openapi({
    param: { name: 'prefecture', description: '都道府県名での絞り込み', in: 'query', required: false },
  }),
  region: z.string().optional().openapi({
    param: { name: 'region', description: '地域名での絞り込み', in: 'query', required: false },
  }),
  created_at_gt: z.string().optional().openapi({
    param: {
      name: 'created_at_gt',
      description: '作成日時が指定した日時以降のもの 例: 2025-01-01 00:00:00',
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
  created_at_lt: z.string().optional().openapi({
    param: {
      name: 'created_at_lt',
      description: '作成日時が指定した日時以前のもの 例: 2025-01-01 00:00:00',
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
  updated_at_gt: z.string().optional().openapi({
    param: {
      name: 'updated_at_gt',
      description: '更新日時が指定した日時以降のもの 例: 2025-01-01 00:00:00',
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
  updated_at_lt: z.string().optional().openapi({
    param: {
      name: 'updated_at_lt',
      description: '更新日時が指定した日時以前のもの 例: 2025-01-01 00:00:00',
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
});

const authorInputSchema = z
  .object({
    name: z.string().min(1, 'Author name is required').max(255, 'Author name too long'),
    biography: z.string().optional().nullable(),
    links: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

const sourceInputSchema = z
  .object({
    title: z.string().min(1, 'Source title is required').max(255, 'Source title too long'),
    author: z.string().optional().nullable(),
    year: z.number().optional().nullable(),
    url: z.string().optional().nullable(),
    publisher: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

const locationInputSchema = z
  .object({
    prefecture: z.string().min(1, 'Prefecture is required'),
    region: z.string().nullable().default(null),
    address: z.string().nullable().default(null),
    latitude: z.number(),
    longitude: z.number(),
    name: z.string().nullable().default(null),
  })
  .optional()
  .nullable();

const createHaikuMonumentSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  established_date: z.string().optional().nullable(),
  commentary: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  authors: z.array(authorInputSchema).optional().nullable(),
  sources: z.array(sourceInputSchema).optional().nullable(),
  locations: z.array(locationInputSchema).optional().nullable(),
}).transform(data => ({
  text: data.text,
  establishedDate: data.established_date ?? null,
  commentary: data.commentary ?? null,
  imageUrl: data.image_url ?? null,
  author: data.authors && data.authors.length > 0 ? data.authors[0] : null,
  source: data.sources && data.sources.length > 0 ? data.sources[0] : null,
  location: data.locations && data.locations.length > 0 ? data.locations[0] : null,
}));

const updateHaikuMonumentSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  established_date: z.string().optional().nullable(),
  commentary: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  authors: z.array(authorInputSchema).optional().nullable(),
  sources: z.array(sourceInputSchema).optional().nullable(),
  locations: z.array(locationInputSchema).optional().nullable(),
}).transform(data => ({
  text: data.text,
  establishedDate: data.established_date ?? null,
  commentary: data.commentary ?? null,
  imageUrl: data.image_url ?? null,
  author: data.authors && data.authors.length > 0 ? data.authors[0] : null,
  source: data.sources && data.sources.length > 0 ? data.sources[0] : null,
  location: data.locations && data.locations.length > 0 ? data.locations[0] : null,
}));

const haikuMonumentResponseSchema = z.object({
  id: z.number(),
  text: z.string(),
  established_date: z.string().nullable(),
  commentary: z.string().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  author_id: z.number().nullable(),
  source_id: z.number().nullable(),
  location_id: z.number().nullable(),
  authors: z.array(
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
  sources: z.array(
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
  locations: z.array(
    z.object({
      id: z.number(),
      prefecture: z.string(),
      region: z.string().nullable(),
      address: z.string().nullable(),
      latitude: z.number(),
      longitude: z.number(),
      name: z.string().nullable(),
    })
  ),
});

const convertAuthorToResponse = (author: {
  id: number;
  name: string;
  biography?: string | null;
  links?: string | null;
  imageUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}): AuthorResponse => ({
  id: author.id,
  name: author.name,
  biography: author.biography ?? null,
  links: author.links ?? null,
  image_url: author.imageUrl ?? null,
  created_at: author.createdAt ?? '',
  updated_at: author.updatedAt ?? '',
});

const convertSourceToResponse = (source: {
  id: number;
  title: string;
  author?: string | null;
  year?: number | null;
  url?: string | null;
  publisher?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}): SourceResponse => ({
  id: source.id,
  title: source.title,
  author: source.author ?? null,
  year: source.year ?? null,
  url: source.url ?? null,
  publisher: source.publisher ?? null,
  created_at: source.createdAt ?? '',
  updated_at: source.updatedAt ?? '',
});

const convertLocationToResponse = (location: {
  id: number;
  prefecture: string;
  region?: string | null;
  address?: string | null;
  latitude: number | null;
  longitude: number | null;
  name?: string | null;
}): LocationResponse => ({
  id: location.id,
  prefecture: location.prefecture,
  region: location.region ?? null,
  address: location.address ?? null,
  latitude: location.latitude ?? 0,
  longitude: location.longitude ?? 0,
  name: location.name ?? null,
});

const convertHaikuMonumentToResponse = (
  monument: HaikuMonument
): HaikuMonumentResponseType => ({
  id: monument.id,
  text: monument.text,
  established_date: monument.establishedDate ?? null,
  commentary: monument.commentary ?? null,
  image_url: monument.imageUrl ?? null,
  created_at: monument.createdAt ?? '',
  updated_at: monument.updatedAt ?? '',
  author_id: monument.authorId ?? null,
  source_id: monument.sourceId ?? null,
  location_id: monument.locationId ?? null,
  authors: monument.author ? [convertAuthorToResponse(monument.author)] : [],
  sources: monument.source ? [convertSourceToResponse(monument.source)] : [],
  locations: monument.location ? [convertLocationToResponse(monument.location)] : [],
});

const getUseCases = (env: Env): HaikuMonumentUseCases => {
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return new HaikuMonumentUseCases(monumentRepo);
};

const router = new OpenAPIHono<{ Bindings: Env }>();

const getAllHaikuMonumentsRoute = createRoute({
  method: 'get',
  tags: ['haiku-monuments'],
  path: '/',
  request: {
    query: haikuMonumentQuerySchema,
  },
  responses: {
    200: {
      description: '句碑の一覧を取得',
      content: {
        'application/json': {
          schema: z.object({
            haiku_monuments: z.array(haikuMonumentResponseSchema),
          }),
        },
      },
    },
  },
});
router.openapi(getAllHaikuMonumentsRoute, async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const useCases = getUseCases(c.env);
  const monuments: HaikuMonument[] = await useCases.getAllHaikuMonuments(queryParams);
  const transformed = monuments.map((monument) => convertHaikuMonumentToResponse(monument));
  return c.json({ haiku_monuments: transformed });
});

const getHaikuMonumentByIdRoute = createRoute({
  method: 'get',
  tags: ['haiku-monuments'],
  path: '/{id}',
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: '句碑の詳細を取得',
      content: {
        'application/json': {
          schema: z.object({
            haiku_monument: haikuMonumentResponseSchema,
          }),
        },
      },
    },
    404: { description: 'Haiku Monument not found' },
  },
});
router.openapi(getHaikuMonumentByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const useCases = getUseCases(c.env);
  const monument: HaikuMonument | null = await useCases.getHaikuMonumentById(id);
  if (!monument) {
    return c.json({ error: 'Haiku Monument not found' }, 404);
  }
  return c.json({ haiku_monument: convertHaikuMonumentToResponse(monument) });
});

const createHaikuMonumentRoute = createRoute({
  method: 'post',
  tags: ['haiku-monuments'],
  path: '/',
  request: {
    body: {
      content: {
        'application/json': { schema: createHaikuMonumentSchema },
      },
      required: true,
      description: '句碑の作成',
    },
  },
  responses: {
    201: {
      description: '句碑の作成に成功',
      content: {
        'application/json': {
          schema: z.object({
            haiku_monument: haikuMonumentResponseSchema,
          }),
        },
      },
    },
  },
});
router.openapi(createHaikuMonumentRoute, async (c) => {
  const rawPayload = c.req.valid('json');
  const payload = convertKeysToCamelCase(rawPayload);
  const useCases = getUseCases(c.env);
  const created: HaikuMonument = await useCases.createHaikuMonument(payload);
  return c.json({ haiku_monument: convertHaikuMonumentToResponse(created) }, 201);
});

const updateHaikuMonumentRoute = createRoute({
  method: 'put',
  tags: ['haiku-monuments'],
  path: '/{id}',
  request: {
    params: idParamSchema,
    body: {
      content: {
        'application/json': { schema: updateHaikuMonumentSchema },
      },
      required: true,
      description: '句碑の更新',
    },
  },
  responses: {
    200: {
      description: '句碑の更新に成功',
      content: {
        'application/json': {
          schema: z.object({
            haiku_monument: haikuMonumentResponseSchema,
          }),
        },
      },
    },
    404: { description: 'Haiku Monument not found' },
  },
});
router.openapi(updateHaikuMonumentRoute, async (c) => {
  const { id } = c.req.valid('param');
  const rawPayload = c.req.valid('json');
  const payload = convertKeysToCamelCase(rawPayload);
  const useCases = getUseCases(c.env);
  const updated: HaikuMonument | null = await useCases.updateHaikuMonument(id, payload);
  if (!updated) {
    return c.json({ error: 'Haiku Monument not found' }, 404);
  }
  return c.json({ haiku_monument: convertHaikuMonumentToResponse(updated) });
});

const deleteHaikuMonumentRoute = createRoute({
  method: 'delete',
  tags: ['haiku-monuments'],
  path: '/{id}',
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: '句碑の削除に成功',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            message: z.string(),
          }),
        },
      },
    },
    404: { description: 'Haiku Monument not found' },
  },
});
router.openapi(deleteHaikuMonumentRoute, async (c) => {
  const { id } = c.req.valid('param');
  const useCases = getUseCases(c.env);
  const success: boolean = await useCases.deleteHaikuMonument(id);
  if (!success) {
    return c.json({ error: 'Haiku Monument not found' }, 404);
  }
  return c.json({ message: 'Haiku Monument deleted successfully', id });
});

export default router;
