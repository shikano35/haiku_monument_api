import { createRoute, z } from '@hono/zod-openapi';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import type { Poet } from '../../domain/entities/Poet';
import type { HaikuMonument } from '../../domain/entities/HaikuMonument';
import type { PoetResponse } from '../dtos/PoetResponse';
import { createRouter } from './commonRouter';
import { createUseCases } from './createUseCases';

const convertPoetToSnakeCase = (poet: Poet): PoetResponse => ({
  id: poet.id,
  name: poet.name,
  biography: poet.biography ?? null,
  link_url: poet.linkUrl ?? null,
  image_url: poet.imageUrl ?? null,
  created_at: poet.createdAt ?? '',
  updated_at: poet.updatedAt ?? '',
});

const convertPoetsToSnakeCase = (poets: Poet[]): PoetResponse[] =>
  poets.map(convertPoetToSnakeCase);

const convertHaikuMonumentToSnakeCase = (
  monument: HaikuMonument
): {
  id: number;
  inscription: string;
  established_date: string | null;
  commentary: string | null;
  photo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
} => ({
  id: monument.id,
  inscription: monument.inscription,
  established_date: monument.establishedDate,
  commentary: monument.commentary,
  photo_url: monument.photoUrl,
  created_at: monument.createdAt ?? '',
  updated_at: monument.updatedAt ?? '',
});

const convertHaikuMonumentsToSnakeCase = (monuments: HaikuMonument[]) =>
  monuments.map(convertHaikuMonumentToSnakeCase);

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, '無効なIDです').transform(Number),
  })
  .openapi({ param: { name: 'id', in: 'path' } });

const PoetsQuerySchema = z.object({
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
    param: { name: 'biography_contains', description: '俳人情報に含まれる文字列', in: 'query', required: false },
  }),
  created_at_gt: z.string().optional().openapi({
    param: {
      name: 'created_at_gt',
      description: "作成日時が指定日時以降のもの\n例: 2025-01-01T00:00:00Z",
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
  created_at_lt: z.string().optional().openapi({
    param: {
      name: 'created_at_lt',
      description: "作成日時が指定日時以前のもの\n例: 2025-01-01T00:00:00Z",
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
  updated_at_gt: z.string().optional().openapi({
    param: {
      name: 'updated_at_gt',
      description: "更新日時が指定日時以降のもの\n例: 2025-01-01T00:00:00Z",
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
  updated_at_lt: z.string().optional().openapi({
    param: {
      name: 'updated_at_lt',
      description: "更新日時が指定日時以前のもの\n例: 2025-01-01T00:00:00Z",
      in: 'query',
      required: false,
    },
    format: 'date-time',
  }),
});

const createPoetSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(255, '名前が長すぎます'),
  biography: z.string().optional().nullable(),
  link_url: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

const updatePoetSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(255, '名前が長すぎます').optional(),
  biography: z.string().optional().nullable(),
  link_url: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

const poetResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  biography: z.string().nullable(),
  link_url: z.string().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const poetListResponseSchema = z.array(poetResponseSchema);

const router = createRouter();

const getAllPoetsRoute = createRoute({
  method: 'get',
  tags: ['poets'],
  path: '/',
  request: { query: PoetsQuerySchema },
  responses: {
    200: {
      description: '俳人一覧の取得に成功しました',
      content: {
        'application/json': {
          schema: poetListResponseSchema,
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
      description: '俳人詳細の取得に成功しました',
      content: {
        'application/json': {
          schema: poetResponseSchema,
        },
      },
    },
    404: { description: '俳人が見つかりません' },
  },
});

router.openapi(getPoetByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { poetUseCases } = createUseCases(c.env, 'poets');
  const poet: Poet | null = await poetUseCases.getPoetById(id);
  if (!poet) {
    return c.json({ error: '俳人が見つかりません' }, 404);
  }
  return c.json(convertPoetToSnakeCase(poet));
});

// const createPoetRoute = createRoute({
//   method: 'post',
//   tags: ['poets'],
//   path: '/',
//   request: {
//     body: {
//       content: { 'application/json': { schema: createPoetSchema } },
//       required: true,
//       description: '俳人の作成',
//     },
//   },
//   responses: {
//     201: {
//       description: '俳人が作成されました',
//       content: {
//         'application/json': {
//           schema: poetResponseSchema,
//         },
//       },
//     },
//   },
// });

// router.openapi(createPoetRoute, async (c) => {
//   const rawPayload = c.req.valid('json');
//   const payload = convertKeysToCamelCase(rawPayload);
//   const { poetUseCases } = createUseCases(c.env, 'poets');
//   const created: Poet = await poetUseCases.createPoet(payload);
//   return c.json(convertPoetToSnakeCase(created), 201);
// });

// const updatePoetRoute = createRoute({
//   method: 'put',
//   tags: ['poets'],
//   path: '/{id}',
//   request: {
//     params: idParamSchema,
//     body: {
//       content: { 'application/json': { schema: updatePoetSchema } },
//       required: true,
//       description: '俳人の更新',
//     },
//   },
//   responses: {
//     200: {
//       description: '俳人が更新されました',
//       content: {
//         'application/json': {
//           schema: poetResponseSchema,
//         },
//       },
//     },
//     404: { description: '俳人が見つかりません' },
//   },
// });

// router.openapi(updatePoetRoute, async (c) => {
//   const { id } = c.req.valid('param');
//   const rawPayload = c.req.valid('json');
//   const payload = convertKeysToCamelCase(rawPayload);
//   const { poetUseCases } = createUseCases(c.env, 'poets');
//   const updated: Poet | null = await poetUseCases.updatePoet(id, payload);
//   if (!updated) {
//     return c.json({ error: '俳人が見つかりません' }, 404);
//   }
//   return c.json(convertPoetToSnakeCase(updated));
// });

// const deletePoetRoute = createRoute({
//   method: 'delete',
//   tags: ['poets'],
//   path: '/{id}',
//   request: { params: idParamSchema },
//   responses: {
//     200: {
//       description: '俳人が削除されました',
//       content: {
//         'application/json': {
//           schema: z.object({
//             id: z.number(),
//             message: z.string(),
//           }),
//         },
//       },
//     },
//     404: { description: '俳人が見つかりません' },
//   },
// });

// router.openapi(deletePoetRoute, async (c) => {
//   const { id } = c.req.valid('param');
//   const { poetUseCases } = createUseCases(c.env, 'poets');
//   const success: boolean = await poetUseCases.deletePoet(id);
//   if (!success) {
//     return c.json({ error: '俳人が見つかりません' }, 404);
//   }
//   return c.json({ id, message: '俳人が正常に削除されました' });
// });

const haikuMonumentSimpleResponseSchema = z.object({
  id: z.number(),
  inscription: z.string(),
  commentary: z.string().nullable(),
  kigo: z.string().nullable(),
  season: z.string().nullable(),
  is_reliable: z.boolean().nullable(),
  has_reverse_inscription: z.boolean().nullable(),
  material: z.string().nullable(),
  total_height: z.number().nullable(),
  width: z.number().nullable(),
  depth: z.number().nullable(),
  established_date: z.string().nullable(),
  established_year: z.number().nullable(),
  founder: z.string().nullable(),
  monument_type: z.string().nullable(),
  designation_status: z.string().nullable(),
  photo_url: z.string().nullable(),
  photo_date: z.string().nullable(),
  photographer: z.string().nullable(),
  model_3d_url: z.string().nullable(),
  remarks: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  poets: z.array(z.object({
    id: z.number(),
    name: z.string(),
    biography: z.string().nullable(),
    link_url: z.string().nullable(),
    image_url: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string()
  })),
  sources: z.array(z.object({
    id: z.number(),
    title: z.string(),
    author: z.string().nullable(),
    publisher: z.string().nullable(),
    source_year: z.number().nullable(),
    url: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string()
  })),
  locations: z.array(z.object({
    id: z.number(),
    region: z.string().nullable(),
    prefecture: z.string(),
    municipality: z.string().nullable(),
    address: z.string().nullable(),
    place_name: z.string().nullable(),
    latitude: z.number(),
    longitude: z.number()
  }))
});

const getPoetHaikuMonumentsRoute = createRoute({
  method: 'get',
  tags: ['poets'],
  path: '/{id}/haiku-monuments',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: '俳人に関する句碑一覧の取得に成功しました',
      content: {
        'application/json': {
          schema: z.array(haikuMonumentSimpleResponseSchema),
        },
      },
    },
    400: { description: '無効なIDです' },
  },
});

router.openapi(getPoetHaikuMonumentsRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments');
  const monuments: HaikuMonument[] = await monumentUseCases.getHaikuMonumentsByPoet(id);
  
  const convertedMonuments = monuments.map(monument => ({
    id: monument.id,
    inscription: monument.inscription,
    commentary: monument.commentary,
    kigo: monument.kigo,
    season: monument.season,
    is_reliable: monument.isReliable,
    has_reverse_inscription: monument.hasReverseInscription,
    material: monument.material,
    total_height: monument.totalHeight,
    width: monument.width,
    depth: monument.depth,
    established_date: monument.establishedDate,
    established_year: monument.establishedYear,
    founder: monument.founder,
    monument_type: monument.monumentType,
    designation_status: monument.designationStatus,
    photo_url: monument.photoUrl,
    photo_date: monument.photoDate,
    photographer: monument.photographer,
    model_3d_url: monument.model3dUrl,
    remarks: monument.remarks,
    created_at: monument.createdAt ?? '',
    updated_at: monument.updatedAt ?? '',
    poets: monument.poet ? [{
      id: monument.poet.id,
      name: monument.poet.name,
      biography: monument.poet.biography ?? null,
      link_url: monument.poet.linkUrl ?? null,
      image_url: monument.poet.imageUrl ?? null,
      created_at: monument.poet.createdAt ?? '',
      updated_at: monument.poet.updatedAt ?? ''
    }] : [],
    sources: monument.source ? [{
      id: monument.source.id,
      title: monument.source.title,
      author: monument.source.author ?? null,
      publisher: monument.source.publisher ?? null,
      source_year: monument.source.sourceYear ?? null,
      url: monument.source.url ?? null,
      created_at: monument.source.createdAt ?? '',
      updated_at: monument.source.updatedAt ?? ''
    }] : [],
    locations: monument.location ? [{
      id: monument.location.id,
      region: monument.location.region,
      prefecture: monument.location.prefecture,
      municipality: monument.location.municipality ?? null,
      address: monument.location.address ?? null,
      place_name: monument.location.placeName ?? null,
      latitude: monument.location.latitude ?? 0,
      longitude: monument.location.longitude ?? 0
    }] : []
  }));
  
  return c.json(convertedMonuments);
});

export default router;
