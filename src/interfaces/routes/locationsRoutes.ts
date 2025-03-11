import { createRoute, z } from '@hono/zod-openapi';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';
import { createRouter } from './commonRouter';
import { createUseCases } from './createUseCases';

const createLocationSchema = z.object({
  address: z.string().min(1, 'Address is required').max(255, 'Address is too long'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  name: z.string().max(255, 'Name is too long').nullable().optional().default(null),
  prefecture: z.string().default(''),
  region: z.string().nullable().default(null),
});

const updateLocationSchema = z.object({
  address: z.string().nonempty().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  name: z
    .string()
    .max(255, 'Name is too long')
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  prefecture: z.string().optional(),
  region: z.string().nullable().optional(),
});

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
  })
  .openapi({
    param: { name: 'id', in: 'path' },
  });

const orderingSchema = z
  .preprocess((arg) => (typeof arg === 'string' ? [arg] : arg), 
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
    param: { name: 'offset', description: '取得する位置', in: 'query', required: false },
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
      description: 'List of locations',
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
      description: 'Location detail',
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
    404: { description: 'Location not found' },
  },
});
router.openapi(getLocationByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { locationUseCases } = createUseCases(c.env, 'locations');
  const location = await locationUseCases.getLocationById(id);
  if (!location) {
    return c.json({ error: 'Location not found' }, 404);
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
      description: 'Create a location',
    },
  },
  responses: {
    201: {
      description: 'Location created',
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
      description: 'Update a location',
    },
  },
  responses: {
    200: {
      description: 'Location updated',
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
    404: { description: 'Location not found' },
  },
});
router.openapi(updateLocationRoute, async (c) => {
  const { id } = c.req.valid('param');
  const payload = c.req.valid('json');
  const { locationUseCases } = createUseCases(c.env, 'locations');
  const updated = await locationUseCases.updateLocation(id, payload);
  if (!updated) {
    return c.json({ error: 'Location not found' }, 404);
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
      description: 'Location deleted',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            message: z.string(),
          }),
        },
      },
    },
    404: { description: 'Location not found' },
  },
});
router.openapi(deleteLocationRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { locationUseCases } = createUseCases(c.env, 'locations');
  const success = await locationUseCases.deleteLocation(id);
  if (!success) {
    return c.json({ error: 'Location not found' }, 404);
  }
  return c.json({ id, message: 'Location deleted successfully' });
});

const getHaikuMonumentsRoute = createRoute({
  method: 'get',
  tags: ['locations'],
  path: '/{id}/haiku-monuments',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Haiku monuments for a location',
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
router.openapi(getHaikuMonumentsRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments');
  const monuments = await monumentUseCases.getHaikuMonumentsByLocation(id);
  const cleaned = monuments.map(({ poetId, sourceId, locationId, ...rest }) => rest);
  return c.json(convertKeysToSnakeCase(cleaned));
});

export default router;
