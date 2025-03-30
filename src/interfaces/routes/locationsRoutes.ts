import { createRoute, z } from '@hono/zod-openapi';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { createRouter } from './commonRouter';
import { createUseCases } from './createUseCases';

const createLocationSchema = z.object({
  address: z.string().min(1, '住所は必須です').max(255),
  latitude: z.number().min(-90, '緯度は-90以上でなければなりません').max(90, '緯度は90以下でなければなりません'),
  longitude: z.number().min(-180, '経度は-180以上でなければなりません').max(180, '経度は180以下でなければなりません'),
  name: z.string().max(255).nullable().optional().default(null),
  prefecture: z.string().default(''),
  region: z.string().nullable().default(null),
});

const updateLocationSchema = z.object({
  address: z.string().nonempty('住所を入力してください').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  name: z
    .string()
    .max(255)
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  prefecture: z.string().optional(),
  region: z.string().nullable().optional(),
});

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, '無効なIDです').transform(Number),
  })
  .openapi({
    param: { name: 'id', in: 'path' },
  });

const orderingSchema = z
  .preprocess(
    (arg) => (typeof arg === 'string' ? [arg] : arg),
    z.array(z.enum(["-prefecture", "-region", "prefecture", "region"]))
  )
  .optional()
  .openapi({
    param: {
      name: 'ordering',
      description:
        "並び順\n* `prefecture` - 都道府県の昇順\n* `-prefecture` - 都道府県の降順\n* `region` - 地域の昇順\n* `-region` - 地域の降順",
      in: 'query',
      required: false,
    },
  });

const locationsQuerySchema = z.object({
  limit: z.coerce.number().optional().openapi({
    param: { name: 'limit', description: '取得する件数', in: 'query', required: false },
    type: 'integer',
  }),
  offset: z.coerce.number().optional().openapi({
    param: { name: 'offset', description: '取得開始位置', in: 'query', required: false },
    type: 'integer',
  }),
  ordering: orderingSchema,
  prefecture: z.string().optional().openapi({
    param: { name: 'prefecture', description: '検索対象の都道府県名', in: 'query', required: false },
  }),
  region: z.string().optional().openapi({
    param: { name: 'region', description: '検索対象の地域名', in: 'query', required: false },
  }),
});

const router = createRouter();

const getAllLocationsRoute = createRoute({
  method: 'get',
  tags: ['locations'],
  path: '/',
  request: { query: locationsQuerySchema },
  responses: {
    200: {
      description: '句碑の場所一覧',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.number(),
              prefecture: z.string(),
              region: z.string().nullable(),
              address: z.string().nullable(),
              latitude: z.number().nullable(),
              longitude: z.number().nullable(),
              name: z.string().nullable(),
            })
          ),
        },
      },
    },
  },
});
router.openapi(getAllLocationsRoute, async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const { locationUseCases } = createUseCases(c.env, 'locations');
  const locations = await locationUseCases.getAllLocations(queryParams);
  return c.json(locations);
});

const getLocationByIdRoute = createRoute({
  method: 'get',
  tags: ['locations'],
  path: '/{id}',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: '句碑の場所の詳細',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            prefecture: z.string(),
            region: z.string().nullable(),
            address: z.string().nullable(),
            latitude: z.number().nullable(),
            longitude: z.number().nullable(),
            name: z.string().nullable(),
          }),
        },
      },
    },
    404: { description: '句碑の場所が見つかりません' },
  },
});
router.openapi(getLocationByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { locationUseCases } = createUseCases(c.env, 'locations');
  const location = await locationUseCases.getLocationById(id);
  if (!location) {
    return c.json({ error: '句碑の場所が見つかりません' }, 404);
  }
  return c.json(location);
});

const createLocationRoute = createRoute({
  method: 'post',
  tags: ['locations'],
  path: '/',
  request: {
    body: {
      content: { 'application/json': { schema: createLocationSchema } },
      required: true,
      description: '句碑の場所を作成',
    },
  },
  responses: {
    201: {
      description: '句碑の場所が作成されました',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            prefecture: z.string(),
            region: z.string().nullable(),
            address: z.string().nullable(),
            latitude: z.number().nullable(),
            longitude: z.number().nullable(),
            name: z.string().nullable(),
          }),
        },
      },
    },
  },
});
router.openapi(createLocationRoute, async (c) => {
  const payload = c.req.valid('json');
  const { locationUseCases } = createUseCases(c.env, 'locations');
  const created = await locationUseCases.createLocation(payload);
  return c.json(created, 201);
});

const updateLocationRoute = createRoute({
  method: 'put',
  tags: ['locations'],
  path: '/{id}',
  request: {
    params: idParamSchema,
    body: {
      content: { 'application/json': { schema: updateLocationSchema } },
      required: true,
      description: '句碑の場所を更新',
    },
  },
  responses: {
    200: {
      description: '句碑の場所が更新されました',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            prefecture: z.string(),
            region: z.string().nullable(),
            address: z.string().nullable(),
            latitude: z.number().nullable(),
            longitude: z.number().nullable(),
            name: z.string().nullable(),
          }),
        },
      },
    },
    404: { description: '句碑の場所が見つかりません' },
  },
});
router.openapi(updateLocationRoute, async (c) => {
  const { id } = c.req.valid('param');
  const payload = c.req.valid('json');
  const { locationUseCases } = createUseCases(c.env, 'locations');
  const updated = await locationUseCases.updateLocation(id, payload);
  if (!updated) {
    return c.json({ error: '句碑の場所が見つかりません' }, 404);
  }
  return c.json(updated);
});

const deleteLocationRoute = createRoute({
  method: 'delete',
  tags: ['locations'],
  path: '/{id}',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: '句碑の場所の削除に成功しました',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            message: z.string(),
          }),
        },
      },
    },
    404: { description: '句碑の場所が見つかりません' },
  },
});
router.openapi(deleteLocationRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { locationUseCases } = createUseCases(c.env, 'locations');
  const success = await locationUseCases.deleteLocation(id);
  if (!success) {
    return c.json({ error: '句碑の場所が見つかりません' }, 404);
  }
  return c.json({ id, message: '句碑の場所が正常に削除されました' });
});

const getHaikuMonumentsRoute = createRoute({
  method: 'get',
  tags: ['locations'],
  path: '/{id}/haiku-monuments',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: '場所に関する句碑一覧の取得に成功しました',
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
    400: { description: '無効なIDです' },
  },
});
router.openapi(getHaikuMonumentsRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments');
  const monuments = await monumentUseCases.getHaikuMonumentsByLocation(id);
  const cleaned = monuments.map(({ poetId, sourceId, locationId, ...rest }) => rest);
  return c.json(convertKeysToSnakeCase(cleaned));
});

export default router;
