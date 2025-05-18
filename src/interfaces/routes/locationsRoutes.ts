import { createRoute, z } from "@hono/zod-openapi";
import { parseQueryParams } from "../../utils/parseQueryParams";
import { createRouter } from "./commonRouter";
import { createUseCases } from "./createUseCases";
import type { HaikuMonument } from "../../domain/entities/HaikuMonument";
import type { Location } from "../../domain/entities/Location";

const createLocationSchema = z.object({
  region: z.string().default(""),
  prefecture: z.string().default(""),
  municipality: z.string().nullable().optional().default(null),
  address: z.string().min(1, "住所は必須です").max(255),
  place_name: z.string().max(255).nullable().optional().default(null),
  latitude: z
    .number()
    .min(-90, "緯度は-90以上でなければなりません")
    .max(90, "緯度は90以下でなければなりません"),
  longitude: z
    .number()
    .min(-180, "経度は-180以上でなければなりません")
    .max(180, "経度は180以下でなければなりません"),
});

const updateLocationSchema = z.object({
  region: z.string().optional(),
  prefecture: z.string().optional(),
  municipality: z.string().nullable().optional(),
  address: z.string().nonempty("住所を入力してください").optional(),
  place_name: z
    .string()
    .max(255)
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, "無効なIDです").transform(Number),
  })
  .openapi({
    param: { name: "id", in: "path" },
  });

const orderingSchema = z
  .preprocess(
    (arg) => (typeof arg === "string" ? [arg] : arg),
    z.array(z.enum(["-prefecture", "-region", "prefecture", "region"])),
  )
  .optional()
  .openapi({
    param: {
      name: "ordering",
      description:
        "並び順\n* `prefecture` - 都道府県の昇順\n* `-prefecture` - 都道府県の降順\n* `region` - 地域の昇順\n* `-region` - 地域の降順",
      in: "query",
      required: false,
    },
  });

const locationsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .optional()
    .openapi({
      param: {
        name: "limit",
        description: "取得する件数",
        in: "query",
        required: false,
      },
      type: "integer",
    }),
  offset: z.coerce
    .number()
    .optional()
    .openapi({
      param: {
        name: "offset",
        description: "取得開始位置",
        in: "query",
        required: false,
      },
      type: "integer",
    }),
  ordering: orderingSchema,
  prefecture: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "prefecture",
        description: "検索対象の都道府県名",
        in: "query",
        required: false,
      },
    }),
  region: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "region",
        description: "検索対象の地域名",
        in: "query",
        required: false,
      },
    }),
});

const router = createRouter();

const convertLocationToApiResponse = (location: Location) => ({
  id: location.id,
  region: location.region,
  prefecture: location.prefecture,
  municipality: location.municipality,
  address: location.address,
  place_name: location.placeName,
  latitude: location.latitude,
  longitude: location.longitude,
});

const getAllLocationsRoute = createRoute({
  method: "get",
  tags: ["locations"],
  path: "/",
  request: { query: locationsQuerySchema },
  responses: {
    200: {
      description: "句碑の場所一覧",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.number(),
              region: z.string(),
              prefecture: z.string(),
              municipality: z.string().nullable(),
              address: z.string().nullable(),
              place_name: z.string().nullable(),
              latitude: z.number().nullable(),
              longitude: z.number().nullable(),
            }),
          ),
        },
      },
    },
  },
});
router.openapi(getAllLocationsRoute, async (c) => {
  const queryParams = parseQueryParams(new URLSearchParams(c.req.query()));
  const { locationUseCases } = createUseCases(c.env, "locations");
  const locations = await locationUseCases.getAllLocations(queryParams);
  return c.json(locations.map(convertLocationToApiResponse));
});

const getLocationByIdRoute = createRoute({
  method: "get",
  tags: ["locations"],
  path: "/{id}",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "句碑の場所の詳細",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            region: z.string(),
            prefecture: z.string(),
            municipality: z.string().nullable(),
            address: z.string().nullable(),
            place_name: z.string().nullable(),
            latitude: z.number().nullable(),
            longitude: z.number().nullable(),
          }),
        },
      },
    },
    404: { description: "句碑の場所が見つかりません" },
  },
});
router.openapi(getLocationByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { locationUseCases } = createUseCases(c.env, "locations");
  const location = await locationUseCases.getLocationById(id);
  if (!location) {
    return c.json({ error: "句碑の場所が見つかりません" }, 404);
  }
  return c.json(convertLocationToApiResponse(location));
});

// const createLocationRoute = createRoute({
//   method: 'post',
//   tags: ['locations'],
//   path: '/',
//   request: {
//     body: {
//       content: { 'application/json': { schema: createLocationSchema } },
//       required: true,
//       description: '句碑の場所を作成',
//     },
//   },
//   responses: {
//     201: {
//       description: '句碑の場所が作成されました',
//       content: {
//         'application/json': {
//           schema: z.object({
//             id: z.number(),
//             region: z.string(),
//             prefecture: z.string(),
//             municipality: z.string().nullable(),
//             address: z.string().nullable(),
//             latitude: z.number().nullable(),
//             longitude: z.number().nullable(),
//             name: z.string().nullable(),
//           }),
//         },
//       },
//     },
//   },
// });
// router.openapi(createLocationRoute, async (c) => {
//   const payload = c.req.valid('json');
//   const { locationUseCases } = createUseCases(c.env, 'locations');
//   const created = await locationUseCases.createLocation(payload);
//   return c.json(created, 201);
// });

// const updateLocationRoute = createRoute({
//   method: 'put',
//   tags: ['locations'],
//   path: '/{id}',
//   request: {
//     params: idParamSchema,
//     body: {
//       content: { 'application/json': { schema: updateLocationSchema } },
//       required: true,
//       description: '句碑の場所を更新',
//     },
//   },
//   responses: {
//     200: {
//       description: '句碑の場所が更新されました',
//       content: {
//         'application/json': {
//           schema: z.object({
//             id: z.number(),
//             region: z.string(),
//             prefecture: z.string(),
//             municipality: z.string().nullable(),
//             address: z.string().nullable(),
//             latitude: z.number().nullable(),
//             longitude: z.number().nullable(),
//             name: z.string().nullable(),
//           }),
//         },
//       },
//     },
//     404: { description: '句碑の場所が見つかりません' },
//   },
// });
// router.openapi(updateLocationRoute, async (c) => {
//   const { id } = c.req.valid('param');
//   const payload = c.req.valid('json');
//   const { locationUseCases } = createUseCases(c.env, 'locations');
//   const updated = await locationUseCases.updateLocation(id, payload);
//   if (!updated) {
//     return c.json({ error: '句碑の場所が見つかりません' }, 404);
//   }
//   return c.json(updated);
// });

// const deleteLocationRoute = createRoute({
//   method: 'delete',
//   tags: ['locations'],
//   path: '/{id}',
//   request: { params: idParamSchema },
//   responses: {
//     200: {
//       description: '句碑の場所の削除に成功しました',
//       content: {
//         'application/json': {
//           schema: z.object({
//             id: z.number(),
//             message: z.string(),
//           }),
//         },
//       },
//     },
//     404: { description: '句碑の場所が見つかりません' },
//   },
// });
// router.openapi(deleteLocationRoute, async (c) => {
//   const { id } = c.req.valid('param');
//   const { locationUseCases } = createUseCases(c.env, 'locations');
//   const success = await locationUseCases.deleteLocation(id);
//   if (!success) {
//     return c.json({ error: '句碑の場所が見つかりません' }, 404);
//   }
//   return c.json({ id, message: '句碑の場所が正常に削除されました' });
// });

const getHaikuMonumentsRoute = createRoute({
  method: "get",
  tags: ["locations"],
  path: "/{id}/haiku-monuments",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "場所に関する句碑一覧の取得に成功しました",
      content: {
        "application/json": {
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
              model_3d_url: z.string().nullable(),
              remarks: z.string().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
              poets: z.array(
                z.object({
                  id: z.number(),
                  name: z.string(),
                  biography: z.string().nullable(),
                  link_url: z.string().nullable(),
                  image_url: z.string().nullable(),
                  created_at: z.string(),
                  updated_at: z.string(),
                }),
              ),
              sources: z.array(
                z.object({
                  id: z.number(),
                  title: z.string(),
                  author: z.string().nullable(),
                  publisher: z.string().nullable(),
                  source_year: z.number().nullable(),
                  url: z.string().nullable(),
                  created_at: z.string(),
                  updated_at: z.string(),
                }),
              ),
              locations: z.array(
                z.object({
                  id: z.number(),
                  region: z.string(),
                  prefecture: z.string(),
                  municipality: z.string().nullable(),
                  address: z.string().nullable(),
                  place_name: z.string().nullable(),
                  latitude: z.number(),
                  longitude: z.number(),
                }),
              ),
            }),
          ),
        },
      },
    },
    400: { description: "無効なIDです" },
  },
});
router.openapi(getHaikuMonumentsRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { monumentUseCases } = createUseCases(c.env, "haikuMonuments");
  const monuments: HaikuMonument[] =
    await monumentUseCases.getHaikuMonumentsByLocation(id);

  const convertedMonuments = monuments.map((monument) => ({
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
    created_at: monument.createdAt ?? "",
    updated_at: monument.updatedAt ?? "",
    poets: monument.poet
      ? [
          {
            id: monument.poet.id,
            name: monument.poet.name,
            biography: monument.poet.biography ?? null,
            link_url: monument.poet.linkUrl ?? null,
            image_url: monument.poet.imageUrl ?? null,
            created_at: monument.poet.createdAt ?? "",
            updated_at: monument.poet.updatedAt ?? "",
          },
        ]
      : [],
    sources: monument.source
      ? [
          {
            id: monument.source.id,
            title: monument.source.title,
            author: monument.source.author ?? null,
            publisher: monument.source.publisher ?? null,
            source_year: monument.source.sourceYear ?? null,
            url: monument.source.url ?? null,
            created_at: monument.source.createdAt ?? "",
            updated_at: monument.source.updatedAt ?? "",
          },
        ]
      : [],
    locations: monument.location
      ? [
          {
            id: monument.location.id,
            region: monument.location.region,
            prefecture: monument.location.prefecture,
            municipality: monument.location.municipality ?? null,
            address: monument.location.address ?? null,
            place_name: monument.location.placeName ?? null,
            latitude: monument.location.latitude ?? 0,
            longitude: monument.location.longitude ?? 0,
          },
        ]
      : [],
  }));

  return c.json(convertedMonuments);
});

export default router;
