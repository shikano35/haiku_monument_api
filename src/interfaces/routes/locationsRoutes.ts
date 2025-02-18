import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../../types/env';
import { LocationUseCases } from '../../domain/usecases/LocationUseCases';
import { LocationRepository } from '../../infrastructure/repositories/LocationRepository';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { parseQueryParams } from '../../utils/parseQueryParams';
import { convertKeysToSnakeCase } from '../../utils/convertKeysToSnakeCase';

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
  name: z.string().max(255, 'Name is too long').nullable().optional()
    .transform((val) => (val === "" ? null : val)),
  prefecture: z.string().optional(),
  region: z.string().nullable().optional(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number)
});
const locationIdParamSchema = z.object({
  locationId: z.string().regex(/^\d+$/, 'Invalid locationId').transform(Number)
});

const getUseCases = (env: Env) => {
  const locationRepo = new LocationRepository(env.DB);
  const monumentRepo = new HaikuMonumentRepository(env.DB);
  return {
    locationUseCases: new LocationUseCases(locationRepo),
    monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
  };
};

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const { locationUseCases } = getUseCases(c.env);
  const locations = await locationUseCases.getAllLocations(queryParams);
  return c.json(locations);
});

router.get('/:id', async (c) => {
  const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { id } = parseResult.data;
  const { locationUseCases } = getUseCases(c.env);
  const location = await locationUseCases.getLocationById(id);
  if (!location) {
    return c.json({ error: 'Location not found' }, 404);
  }
  return c.json(location);
});

router.post(
  '/',
  zValidator('json', createLocationSchema),
  async (c) => {
    const payload = c.req.valid('json');
    const { locationUseCases } = getUseCases(c.env);
    const created = await locationUseCases.createLocation(payload);
    return c.json(created, 201);
  }
);

router.put(
  '/:id',
  zValidator('json', updateLocationSchema),
  async (c) => {
    const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
    if (!parseResult.success) {
      return c.json({ error: parseResult.error.errors[0].message }, 400);
    }
    const { id } = parseResult.data;
    const payload = c.req.valid('json');
    const { locationUseCases } = getUseCases(c.env);
    const updated = await locationUseCases.updateLocation(id, payload);
    if (!updated) {
      return c.json({ error: 'Location not found' }, 404);
    }
    return c.json(updated);
  }
);

router.delete('/:id', async (c) => {
  const parseResult = idParamSchema.safeParse({ id: c.req.param('id') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { id } = parseResult.data;
  const { locationUseCases } = getUseCases(c.env);
  const success = await locationUseCases.deleteLocation(id);
  if (!success) {
    return c.json({ error: 'Location not found' }, 404);
  }
  return c.json({ id, message: 'Location deleted successfully' });
});

router.get('/:locationId/haiku-monuments', async (c) => {
  const parseResult = locationIdParamSchema.safeParse({ locationId: c.req.param('locationId') });
  if (!parseResult.success) {
    return c.json({ error: parseResult.error.errors[0].message }, 400);
  }
  const { locationId } = parseResult.data;
  const { monumentUseCases } = getUseCases(c.env);
  const monuments = await monumentUseCases.getHaikuMonumentsByLocation(locationId);
  const cleaned = monuments.map(({ authorId, sourceId, locationId, ...rest }) => rest);
  return c.json(convertKeysToSnakeCase(cleaned));
});

export default router;
