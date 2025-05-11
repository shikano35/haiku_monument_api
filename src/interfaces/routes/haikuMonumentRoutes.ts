import { createRoute, z } from '@hono/zod-openapi'
import type { HaikuMonument } from '../../domain/entities/HaikuMonument'
import { createUseCases } from './createUseCases'
import { convertKeysToCamelCase } from '../../utils/convertKeysToCamelCase'
import { parseQueryParams } from '../../utils/parseQueryParams'
import { createRouter } from './commonRouter'
import type { HaikuMonumentResponseWithRelations } from '../dtos/HaikuMonumentResponse'

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, '無効なIDです').transform(Number)
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
        '-inscription',
        '-established_date',
        '-poet',
        '-source',
        '-prefecture',
        '-region',
        '-created_at',
        '-updated_at',
        'inscription',
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
* \`inscription\` - 句碑の内容（俳句）の昇順
* \`-inscription\` - 句碑の内容（俳句）の降順
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
    param: { name: 'search', description: '句碑と解説文での検索', in: 'query', required: false }
  }),
  title_contains: z.string().optional().openapi({
    param: { name: 'title_contains', description: '句碑内容に含まれる文字列での検索', in: 'query', required: false }
  }),
  description_contains: z.string().optional().openapi({
    param: { name: 'description_contains', description: '解説文に含まれる文字列での検索', in: 'query', required: false }
  }),
  name_contains: z.string().optional().openapi({
    param: { name: 'name_contains', description: '著者名に含まれる文字列での検索', in: 'query', required: false }
  }),
  biography_contains: z.string().optional().openapi({
    param: { name: 'biography_contains', description: '著者の解説に含まれる文字列での検索', in: 'query', required: false }
  }),
  prefecture: z.string().optional().openapi({
    param: { name: 'prefecture', description: '都道府県名での絞り込み', in: 'query', required: false }
  }),
  region: z.string().optional().openapi({
    param: { name: 'region', description: '地域名での絞り込み', in: 'query', required: false }
  }),
  created_at_gt: z.string().optional().openapi({
    param: { name: 'created_at_gt', description: '作成日時が指定日時以降のもの 例: 2025-01-01T00:00:00Z', in: 'query', required: false },
    format: 'date-time'
  }),
  created_at_lt: z.string().optional().openapi({
    param: { name: 'created_at_lt', description: '作成日時が指定日時以前のもの 例: 2025-01-01T00:00:00Z', in: 'query', required: false },
    format: 'date-time'
  }),
  updated_at_gt: z.string().optional().openapi({
    param: { name: 'updated_at_gt', description: '更新日時が指定日時以降のもの 例: 2025-01-01T00:00:00Z', in: 'query', required: false },
    format: 'date-time'
  }),
  updated_at_lt: z.string().optional().openapi({
    param: { name: 'updated_at_lt', description: '更新日時が指定日時以前のもの 例: 2025-01-01T00:00:00Z', in: 'query', required: false },
    format: 'date-time'
  })
})

const poetInputSchema = z.object({
  name: z.string().min(1, '著者名は必須です').max(255),
  biography: z.string().nullable().optional(),
  links: z.string().nullable().optional(),
  image_url: z.string().nullable().optional()
})
const sourceInputSchema = z.object({
  title: z.string().min(1, '出典タイトルは必須です').max(255),
  author: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  url: z.string().nullable().optional(),
  publisher: z.string().nullable().optional()
})
const locationInputSchema = z.object({
  prefecture: z.string().min(1, '都道府県は必須です'),
  region: z.string().nullable().default(null),
  address: z.string().nullable().default(null),
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().nullable().default(null)
})

const baseHaikuMonumentSchema = z.object({
  inscription: z.string().min(1, '句碑の内容は必須です'),
  established_date: z.string().nullable().optional(),
  commentary: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  poets: z.array(poetInputSchema).nullable().optional(),
  sources: z.array(sourceInputSchema).nullable().optional(),
  locations: z.array(locationInputSchema).nullable().optional()
})

const transformMonumentInput = (data: z.infer<typeof baseHaikuMonumentSchema>) => ({
  inscription: data.inscription,
  establishedDate: data.established_date ?? null,
  commentary: data.commentary ?? null,
  photoUrl: data.photo_url ?? null,
  poet: data.poets && data.poets.length > 0 ? data.poets[0] : null,
  source: data.sources && data.sources.length > 0 ? data.sources[0] : null,
  location: data.locations && data.locations.length > 0 ? data.locations[0] : null
})
const createHaikuMonumentSchema = baseHaikuMonumentSchema.transform(transformMonumentInput)
const updateHaikuMonumentSchema = baseHaikuMonumentSchema.transform(transformMonumentInput)

const haikuMonumentResponseSchema = z.object({
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
    longitude: z.number(),
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
  publisher?: string | null
  year?: number | null
  url?: string | null
  createdAt: string | null
  updatedAt: string | null
}) => ({
  id: source.id,
  title: source.title,
  author: source.author ?? null,
  publisher: source.publisher ?? null,
  year: source.year ?? null,
  url: source.url ?? null,
  created_at: source.createdAt ?? '',
  updated_at: source.updatedAt ?? ''
})

const convertLocation = (location: {
  id: number
  prefecture: string
  region?: string | null
  address?: string | null
  name?: string | null
  latitude: number | null
  longitude: number | null
}) => ({
  id: location.id,
  prefecture: location.prefecture,
  region: location.region ?? null,
  address: location.address ?? null,
  name: location.name ?? null,
  latitude: location.latitude ?? 0,
  longitude: location.longitude ?? 0
})

const convertHaikuMonumentToResponse = (monument: HaikuMonument): HaikuMonumentResponseWithRelations => ({
  id: monument.id,
  inscription: monument.inscription,
  commentary: monument.commentary,
  kigo: monument.kigo,
  season: monument.season,
  isReliable: monument.isReliable,
  hasReverseInscription: monument.hasReverseInscription,
  material: monument.material,
  totalHeight: monument.totalHeight,
  width: monument.width,
  depth: monument.depth,
  establishedDate: monument.establishedDate,
  establishedYear: monument.establishedYear,
  founder: monument.founder,
  monumentType: monument.monumentType,
  designationStatus: monument.designationStatus,
  photoUrl: monument.photoUrl,
  photoDate: monument.photoDate,
  photographer: monument.photographer,
  model3dUrl: monument.model3dUrl,
  remarks: monument.remarks,
  poetId: monument.poetId,
  sourceId: monument.sourceId,
  locationId: monument.locationId,
  createdAt: monument.createdAt,
  updatedAt: monument.updatedAt,
  poet: monument.poet ? convertPoet(monument.poet) : null,
  source: monument.source ? convertSource(monument.source) : null,
  location: monument.location ? convertLocation(monument.location) : null
})

const convertHaikuMonumentToApiResponse = (monument: HaikuMonumentResponseWithRelations) => ({
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
  poet_id: monument.poetId,
  source_id: monument.sourceId,
  location_id: monument.locationId,
  poets: monument.poet ? [{
    id: monument.poet.id,
    name: monument.poet.name,
    biography: monument.poet.biography,
    links: monument.poet.links,
    image_url: monument.poet.image_url,
    created_at: monument.poet.created_at,
    updated_at: monument.poet.updated_at
  }] : [],
  sources: monument.source ? [{
    id: monument.source.id,
    title: monument.source.title,
    author: monument.source.author,
    publisher: monument.source.publisher,
    year: monument.source.year,
    url: monument.source.url,
    created_at: monument.source.created_at,
    updated_at: monument.source.updated_at
  }] : [],
  locations: monument.location ? [{
    id: monument.location.id,
    prefecture: monument.location.prefecture,
    region: monument.location.region,
    address: monument.location.address,
    name: monument.location.name,
    latitude: monument.location.latitude ?? 0,
    longitude: monument.location.longitude ?? 0,
  }] : []
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
        description: '句碑の一覧を取得しました',
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
    const responseData = monuments.map(monument => 
      convertHaikuMonumentToApiResponse(convertHaikuMonumentToResponse(monument))
    )
    return c.json({ haiku_monuments: responseData })
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
        description: '句碑の詳細を取得しました',
        content: {
          'application/json': {
            schema: z.object({ haiku_monument: haikuMonumentResponseSchema })
          }
        }
      },
      404: { description: '句碑が見つかりません' }
    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments')
    const monument = await monumentUseCases.getHaikuMonumentById(id)
    if (!monument) {
      return c.json({ error: '句碑が見つかりません' }, 404)
    }
    return c.json({ 
      haiku_monument: convertHaikuMonumentToApiResponse(convertHaikuMonumentToResponse(monument)) 
    })
  }
)

// router.openapi(
//   createRoute({
//     method: 'post',
//     tags: ['haiku-monuments'],
//     path: '/',
//     request: {
//       body: {
//         content: { 'application/json': { schema: createHaikuMonumentSchema } },
//         required: true,
//         description: '句碑の作成'
//       }
//     },
//     responses: {
//       201: {
//         description: '句碑の作成に成功しました',
//         content: {
//           'application/json': {
//             schema: z.object({ haiku_monument: haikuMonumentResponseSchema })
//           }
//         }
//       }
//     }
//   }),
//   async (c) => {
//     const rawPayload = c.req.valid('json')
//     const payload = convertKeysToCamelCase(rawPayload)
//     const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments')
//     const created = await monumentUseCases.createHaikuMonument(payload)
//     return c.json({ 
//       haiku_monument: convertHaikuMonumentToApiResponse(convertHaikuMonumentToResponse(created)) 
//     }, 201)
//   }
// )

// router.openapi(
//   createRoute({
//     method: 'put',
//     tags: ['haiku-monuments'],
//     path: '/{id}',
//     request: {
//       params: idParamSchema,
//       body: {
//         content: { 'application/json': { schema: updateHaikuMonumentSchema } },
//         required: true,
//         description: '句碑の更新'
//       }
//     },
//     responses: {
//       200: {
//         description: '句碑の更新に成功しました',
//         content: {
//           'application/json': {
//             schema: z.object({ haiku_monument: haikuMonumentResponseSchema })
//           }
//         }
//       },
//       404: { description: '句碑が見つかりません' }
//     }
//   }),
//   async (c) => {
//     const { id } = c.req.valid('param')
//     const rawPayload = c.req.valid('json')
//     const payload = convertKeysToCamelCase(rawPayload)
//     const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments')
//     const updated = await monumentUseCases.updateHaikuMonument(id, payload)
//     if (!updated) {
//       return c.json({ error: '句碑が見つかりません' }, 404)
//     }
//     return c.json({ 
//       haiku_monument: convertHaikuMonumentToApiResponse(convertHaikuMonumentToResponse(updated)) 
//     })
//   }
// )

// router.openapi(
//   createRoute({
//     method: 'delete',
//     tags: ['haiku-monuments'],
//     path: '/{id}',
//     request: { params: idParamSchema },
//     responses: {
//       200: {
//         description: '句碑の削除に成功しました',
//         content: {
//           'application/json': {
//             schema: z.object({ id: z.number(), message: z.string() })
//           }
//         }
//       },
//       404: { description: '句碑が見つかりません' }
//     }
//   }),
//   async (c) => {
//     const { id } = c.req.valid('param')
//     const { monumentUseCases } = createUseCases(c.env, 'haikuMonuments')
//     const success = await monumentUseCases.deleteHaikuMonument(id)
//     if (!success) {
//       return c.json({ error: '句碑が見つかりません' }, 404)
//     }
//     return c.json({ message: '句碑が正常に削除されました', id })
//   }
// )

export default router
