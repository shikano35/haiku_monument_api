import { createRoute, z } from '@hono/zod-openapi';
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { parseQueryParams } from '../../utils/parseQueryParams';
import type { SourceResponse } from '../dtos/SourceResponse';
import { createRouter } from './commonRouter';
import { createUseCases } from './createUseCases';
import type { HaikuMonument } from '../../domain/entities/HaikuMonument';

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, '無効なIDです').transform(Number),
  })
  .openapi({ param: { name: 'id', in: 'path' } });

const sourcesQuerySchema = z.object({
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
  title: z.string().min(1, 'タイトルは必須です').max(255, 'タイトルが長すぎます'),
  author: z.string().optional().nullable(),
  year: z.number().optional().nullable(),
  url: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
});

const updateSourceSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(255, 'タイトルが長すぎます').optional(),
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
      description: '情報源一覧の取得に成功しました',
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
      description: '情報源詳細の取得に成功しました',
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
    404: { description: '情報源が見つかりません' },
  },
});
router.openapi(getSourceByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { sourceUseCases } = createUseCases(c.env, 'sources');
  const source = await sourceUseCases.getSourceById(id);
  if (!source) return c.json({ error: '情報源が見つかりません' }, 404);
  const snakeSource = convertKeysToSnakeCase(source) as unknown as SourceResponse;
  return c.json(snakeSource);
});

// const createSourceRoute = createRoute({
//   method: 'post',
//   tags: ['sources'],
//   path: '/',
//   request: {
//     body: {
//       content: { 'application/json': { schema: createSourceSchema } },
//       required: true,
//       description: '情報源の作成',
//     },
//   },
//   responses: {
//     201: {
//       description: '情報源が作成されました',
//       content: {
//         'application/json': {
//           schema: z.object({
//             id: z.number(),
//             title: z.string(),
//             author: z.string().nullable(),
//             year: z.number().nullable(),
//             url: z.string().nullable(),
//             publisher: z.string().nullable(),
//             created_at: z.string(),
//             updated_at: z.string(),
//           }),
//         },
//       },
//     },
//   },
// });
// router.openapi(createSourceRoute, async (c) => {
//   const rawPayload = c.req.valid('json');
//   const payload = convertKeysToCamelCase(rawPayload);
//   const { sourceUseCases } = createUseCases(c.env, 'sources');
//   const created = await sourceUseCases.createSource(payload);
//   const snakeCreated = convertKeysToSnakeCase(created) as unknown as SourceResponse;
//   return c.json(snakeCreated, 201);
// });

// const updateSourceRoute = createRoute({
//   method: 'put',
//   tags: ['sources'],
//   path: '/{id}',
//   request: {
//     params: idParamSchema,
//     body: {
//       content: { 'application/json': { schema: updateSourceSchema } },
//       required: true,
//       description: '情報源の更新',
//     },
//   },
//   responses: {
//     200: {
//       description: '情報源が更新されました',
//       content: {
//         'application/json': {
//           schema: z.object({
//             id: z.number(),
//             title: z.string(),
//             author: z.string().nullable(),
//             year: z.number().nullable(),
//             url: z.string().nullable(),
//             publisher: z.string().nullable(),
//             created_at: z.string(),
//             updated_at: z.string(),
//           }),
//         },
//       },
//     },
//     404: { description: '情報源が見つかりません' },
//   },
// });
// router.openapi(updateSourceRoute, async (c) => {
//   const { id } = c.req.valid('param');
//   const rawPayload = c.req.valid('json');
//   const payload = convertKeysToCamelCase(rawPayload);
//   const { sourceUseCases } = createUseCases(c.env, 'sources');
//   const updated = await sourceUseCases.updateSource(id, payload);
//   if (!updated) return c.json({ error: '情報源が見つかりません' }, 404);
//   const snakeUpdated = convertKeysToSnakeCase(updated) as unknown as SourceResponse;
//   return c.json(snakeUpdated);
// });

// const deleteSourceRoute = createRoute({
//   method: 'delete',
//   tags: ['sources'],
//   path: '/{id}',
//   request: { params: idParamSchema },
//   responses: {
//     200: {
//       description: '情報源が削除されました',
//       content: {
//         'application/json': {
//           schema: z.object({
//             id: z.number(),
//             message: z.string(),
//           }),
//         },
//       },
//     },
//     404: { description: '句碑の情報源が見つかりません' },
//   },
// });
// router.openapi(deleteSourceRoute, async (c) => {
//   const { id } = c.req.valid('param');
//   const { sourceUseCases } = createUseCases(c.env, 'sources');
//   const success = await sourceUseCases.deleteSource(id);
//   if (!success) return c.json({ error: '句碑の情報源が見つかりません' }, 404);
//   return c.json({ id, message: '句碑の情報源が正常に削除されました' });
// });

const getSourceHaikuMonumentsRoute = createRoute({
  method: 'get',
  tags: ['sources'],
  path: '/{id}/haiku-monuments',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: '情報源に関する句碑一覧の取得に成功しました',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
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
              model3d_url: z.string().nullable(),
              remarks: z.string().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
              poets: z.array(z.object({
                id: z.number(),
                name: z.string(),
                biography: z.string().nullable(),
                links: z.string().nullable(),
                image_url: z.string().nullable(),
                created_at: z.string(),
                updated_at: z.string()
              })),
              sources: z.array(z.object({
                id: z.number(),
                title: z.string(),
                author: z.string().nullable(),
                publisher: z.string().nullable(),
                year: z.number().nullable(),
                url: z.string().nullable(),
                created_at: z.string(),
                updated_at: z.string()
              })),
              locations: z.array(z.object({
                id: z.number(),
                prefecture: z.string(),
                region: z.string().nullable(),
                address: z.string().nullable(),
                name: z.string().nullable(),
                latitude: z.number(),
                longitude: z.number()
              }))
            })
          ),
        },
      },
    },
    400: { description: '無効なIDです' },
  },
});
router.openapi(getSourceHaikuMonumentsRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments');
  const monuments: HaikuMonument[] = await monumentUseCases.getHaikuMonumentsBySource(id);
  
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
    model3d_url: monument.model3dUrl,
    remarks: monument.remarks,
    created_at: monument.createdAt ?? '',
    updated_at: monument.updatedAt ?? '',
    poets: monument.poet ? [{
      id: monument.poet.id,
      name: monument.poet.name,
      biography: monument.poet.biography ?? null,
      links: monument.poet.links ?? null,
      image_url: monument.poet.imageUrl ?? null,
      created_at: monument.poet.createdAt ?? '',
      updated_at: monument.poet.updatedAt ?? ''
    }] : [],
    sources: monument.source ? [{
      id: monument.source.id,
      title: monument.source.title,
      author: monument.source.author ?? null,
      publisher: monument.source.publisher ?? null,
      year: monument.source.year ?? null,
      url: monument.source.url ?? null,
      created_at: monument.source.createdAt ?? '',
      updated_at: monument.source.updatedAt ?? ''
    }] : [],
    locations: monument.location ? [{
      id: monument.location.id,
      prefecture: monument.location.prefecture,
      region: monument.location.region ?? null,
      address: monument.location.address ?? null,
      name: monument.location.name ?? null,
      latitude: monument.location.latitude ?? 0,
      longitude: monument.location.longitude ?? 0
    }] : []
  }));
  
  return c.json(convertedMonuments);
});

export default router;
