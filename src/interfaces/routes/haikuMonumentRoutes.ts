import { createRoute, z } from '@hono/zod-openapi'
import type { HaikuMonument } from '../../domain/entities/HaikuMonument'
import { createUseCases } from './createUseCases'
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase'
import { parseQueryParams } from '../../utils/parseQueryParams'
import { createRouter } from './commonRouter'

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number)
  })
  .openapi({ param: { name: 'id', in: 'path' } })

const haikuMonumentsQuerySchema = z.object({
  limit: z.coerce.number().optional().openapi({
    param: { name: 'limit', description: '取得する件数', in: 'query', required: false },
    type: 'integer'
  }),
  offset: z.coerce.number().optional().openapi({
    param: { name: 'offset', description: '取得開始位置', in: 'query', required: false },
    type: 'integer'
  }),
  ordering: z.preprocess(
    (arg) => (typeof arg === 'string' ? [arg] : arg),
    z.array(
      z.enum([
        '-text',
        '-established_date',
        '-poet',
        '-source',
        '-prefecture',
        '-region',
        '-created_at',
        '-updated_at',
        'text',
        'established_date',
        'poet',
        'source',
        'prefecture',
        'region',
        'created_at',
        'updated_at'
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
* \`poet\` - 著者の昇順
* \`-poet\` - 著者の降順
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
        required: false
      }
    }),
  search: z.string().optional().openapi({
    param: { name: 'search', description: '俳句と俳句の解説で検索', in: 'query', required: false }
  }),
  title_contains: z.string().optional().openapi({
    param: { name: 'title_contains', description: '俳句に対する検索', in: 'query', required: false }
  }),
  description_contains: z.string().optional().openapi({
    param: { name: 'description_contains', description: '俳句の解説に対する検索', in: 'query', required: false }
  }),
  name_contains: z.string().optional().openapi({
    param: { name: 'name_contains', description: '著者に対する検索', in: 'query', required: false }
  }),
  biography_contains: z.string().optional().openapi({
    param: { name: 'biography_contains', description: '著者の解説に対する検索', in: 'query', required: false }
  }),
  prefecture: z.string().optional().openapi({
    param: { name: 'prefecture', description: '都道府県名での絞り込み', in: 'query', required: false }
  }),
  region: z.string().optional().openapi({
    param: { name: 'region', description: '地域名での絞り込み', in: 'query', required: false }
  }),
  created_at_gt: z.string().optional().openapi({
    param: { name: 'created_at_gt', description: '作成日時が指定した日時以降のもの 例: 2025-01-01 00:00:00', in: 'query', required: false },
    format: 'date-time'
  }),
  created_at_lt: z.string().optional().openapi({
    param: { name: 'created_at_lt', description: '作成日時が指定した日時以前のもの 例: 2025-01-01 00:00:00', in: 'query', required: false },
    format: 'date-time'
  }),
  updated_at_gt: z.string().optional().openapi({
    param: { name: 'updated_at_gt', description: '更新日時が指定した日時以降のもの 例: 2025-01-01 00:00:00', in: 'query', required: false },
    format: 'date-time'
  }),
  updated_at_lt: z.string().optional().openapi({
    param: { name: 'updated_at_lt', description: '更新日時が指定した日時以前のもの 例: 2025-01-01 00:00:00', in: 'query', required: false },
    format: 'date-time'
  })
})

const poetInputSchema = z.object({
  name: z.string().min(1, 'Poet name is required').max(255, 'Poet name too long'),
  biography: z.string().nullable().optional(),
  links: z.string().nullable().optional(),
  image_url: z.string().nullable().optional()
})
const sourceInputSchema = z.object({
  title: z.string().min(1, 'Source title is required').max(255, 'Source title too long'),
  author: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  url: z.string().nullable().optional(),
  publisher: z.string().nullable().optional()
})
const locationInputSchema = z.object({
  prefecture: z.string().min(1, 'Prefecture is required'),
  region: z.string().nullable().default(null),
  address: z.string().nullable().default(null),
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().nullable().default(null)
})

const baseHaikuMonumentSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  established_date: z.string().nullable().optional(),
  commentary: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  poets: z.array(poetInputSchema).nullable().optional(),
  sources: z.array(sourceInputSchema).nullable().optional(),
  locations: z.array(locationInputSchema).nullable().optional()
})
const transformMonumentInput = (data: z.infer<typeof baseHaikuMonumentSchema>) => ({
  text: data.text,
  establishedDate: data.established_date ?? null,
  commentary: data.commentary ?? null,
  imageUrl: data.image_url ?? null,
  poet: data.poets && data.poets.length > 0 ? data.poets[0] : null,
  source: data.sources && data.sources.length > 0 ? data.sources[0] : null,
  location: data.locations && data.locations.length > 0 ? data.locations[0] : null
})
const createHaikuMonumentSchema = baseHaikuMonumentSchema.transform(transformMonumentInput)
const updateHaikuMonumentSchema = baseHaikuMonumentSchema.transform(transformMonumentInput)

const haikuMonumentResponseSchema = z.object({
  id: z.number(),
  text: z.string(),
  established_date: z.string().nullable(),
  commentary: z.string().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  poet_id: z.number().nullable(),
  source_id: z.number().nullable(),
  location_id: z.number().nullable(),
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
    year: z.number().nullable(),
    url: z.string().nullable(),
    publisher: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string()
  })),
  locations: z.array(z.object({
    id: z.number(),
    prefecture: z.string(),
    region: z.string().nullable(),
    address: z.string().nullable(),
    latitude: z.number(),
    longitude: z.number(),
    name: z.string().nullable()
  }))
})

const convertPoet = (poet: {
  id: number
  name: string
  biography?: string | null
  links?: string | null
  imageUrl?: string | null
  createdAt: string | null
  updatedAt: string | null
}) => ({
  id: poet.id,
  name: poet.name,
  biography: poet.biography ?? null,
  links: poet.links ?? null,
  image_url: poet.imageUrl ?? null,
  created_at: poet.createdAt ?? '',
  updated_at: poet.updatedAt ?? ''
})

const convertSource = (source: {
  id: number
  title: string
  author?: string | null
  year?: number | null
  url?: string | null
  publisher?: string | null
  createdAt: string | null
  updatedAt: string | null
}) => ({
  id: source.id,
  title: source.title,
  author: source.author ?? null,
  year: source.year ?? null,
  url: source.url ?? null,
  publisher: source.publisher ?? null,
  created_at: source.createdAt ?? '',
  updated_at: source.updatedAt ?? ''
})

const convertLocation = (location: {
  id: number
  prefecture: string
  region?: string | null
  address?: string | null
  latitude: number | null
  longitude: number | null
  name?: string | null
}) => ({
  id: location.id,
  prefecture: location.prefecture,
  region: location.region ?? null,
  address: location.address ?? null,
  latitude: location.latitude ?? 0,
  longitude: location.longitude ?? 0,
  name: location.name ?? null
})

const convertHaikuMonument = (monument: HaikuMonument) => ({
  id: monument.id,
  text: monument.text,
  established_date: monument.establishedDate ?? null,
  commentary: monument.commentary ?? null,
  image_url: monument.imageUrl ?? null,
  created_at: monument.createdAt ?? '',
  updated_at: monument.updatedAt ?? '',
  poet_id: monument.poetId ?? null,
  source_id: monument.sourceId ?? null,
  location_id: monument.locationId ?? null,
  poets: monument.poet ? [convertPoet(monument.poet)] : [],
  sources: monument.source ? [convertSource(monument.source)] : [],
  locations: monument.location ? [convertLocation(monument.location)] : []
})

const router = createRouter()

router.openapi(
  createRoute({
    method: 'get',
    tags: ['haiku-monuments'],
    path: '/',
    request: { query: haikuMonumentsQuerySchema },
    responses: {
      200: {
        description: '句碑の一覧を取得',
        content: {
          'application/json': {
            schema: z.object({ haiku_monuments: z.array(haikuMonumentResponseSchema) })
          }
        }
      }
    }
  }),
  async (c) => {
    const queryParams = parseQueryParams(new URLSearchParams(c.req.query()))
    const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments')
    const monuments = await monumentUseCases.getAllHaikuMonuments(queryParams)
    return c.json({ haiku_monuments: monuments.map(convertHaikuMonument) })
  }
)

router.openapi(
  createRoute({
    method: 'get',
    tags: ['haiku-monuments'],
    path: '/{id}',
    request: { params: idParamSchema },
    responses: {
      200: {
        description: '句碑の詳細を取得',
        content: {
          'application/json': {
            schema: z.object({ haiku_monument: haikuMonumentResponseSchema })
          }
        }
      },
      404: { description: 'Haiku Monument not found' }
    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments')
    const monument = await monumentUseCases.getHaikuMonumentById(id)
    if (!monument) {
      return c.json({ error: 'Haiku Monument not found' }, 404)
    }
    return c.json({ haiku_monument: convertHaikuMonument(monument) })
  }
)

router.openapi(
  createRoute({
    method: 'post',
    tags: ['haiku-monuments'],
    path: '/',
    request: {
      body: {
        content: { 'application/json': { schema: createHaikuMonumentSchema } },
        required: true,
        description: '句碑の作成'
      }
    },
    responses: {
      201: {
        description: '句碑の作成に成功',
        content: {
          'application/json': {
            schema: z.object({ haiku_monument: haikuMonumentResponseSchema })
          }
        }
      }
    }
  }),
  async (c) => {
    const rawPayload = c.req.valid('json')
    const payload = convertKeysToCamelCase(rawPayload)
    const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments')
    const created = await monumentUseCases.createHaikuMonument(payload)
    return c.json({ haiku_monument: convertHaikuMonument(created) }, 201)
  }
)

router.openapi(
  createRoute({
    method: 'put',
    tags: ['haiku-monuments'],
    path: '/{id}',
    request: {
      params: idParamSchema,
      body: {
        content: { 'application/json': { schema: updateHaikuMonumentSchema } },
        required: true,
        description: '句碑の更新'
      }
    },
    responses: {
      200: {
        description: '句碑の更新に成功',
        content: {
          'application/json': {
            schema: z.object({ haiku_monument: haikuMonumentResponseSchema })
          }
        }
      },
      404: { description: 'Haiku Monument not found' }
    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const rawPayload = c.req.valid('json')
    const payload = convertKeysToCamelCase(rawPayload)
    const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments')
    const updated = await monumentUseCases.updateHaikuMonument(id, payload)
    if (!updated) {
      return c.json({ error: 'Haiku Monument not found' }, 404)
    }
    return c.json({ haiku_monument: convertHaikuMonument(updated) })
  }
)

router.openapi(
  createRoute({
    method: 'delete',
    tags: ['haiku-monuments'],
    path: '/{id}',
    request: { params: idParamSchema },
    responses: {
      200: {
        description: '句碑の削除に成功',
        content: {
          'application/json': {
            schema: z.object({ id: z.number(), message: z.string() })
          }
        }
      },
      404: { description: 'Haiku Monument not found' }
    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments')
    const success = await monumentUseCases.deleteHaikuMonument(id)
    if (!success) {
      return c.json({ error: 'Haiku Monument not found' }, 404)
    }
    return c.json({ message: 'Haiku Monument deleted successfully', id })
  }
)

export default router
