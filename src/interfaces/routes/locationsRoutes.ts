import { createRoute, z } from "@hono/zod-openapi";
import { parseQueryParams } from "../../utils/parseQueryParams";
import type { LocationDetail } from "../dtos/LocationResponse";
import { createRouter } from "./commonRouter";
import { createUseCases } from "./createUseCases";

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, "無効なIDです").transform(Number),
  })
  .openapi({ param: { name: "id", in: "path" } });

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
  ordering: z
    .preprocess(
      (arg) => (typeof arg === "string" ? [arg] : arg),
      z.array(
        z.enum(["-prefecture", "-region", "prefecture", "region"]),
      ),
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
    }),
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

const getAllLocationsRoute = createRoute({
  method: "get",
  tags: ["locations"],
  path: "/",
  request: { query: locationsQuerySchema },
  responses: {
    200: {
      description: "場所一覧の取得に成功しました",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.number(),
              imi_pref_code: z.string().nullable(),
              region: z.string().nullable(),
              prefecture: z.string().nullable(),
              municipality: z.string().nullable(),
              address: z.string().nullable(),
              place_name: z.string().nullable(),
              latitude: z.number().nullable(),
              longitude: z.number().nullable(),
              geohash: z.string().nullable(),
              geom_geojson: z.string().nullable(),
              accuracy_m: z.number().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
            }),
          ),
        },
      },
    },
  },
});
router.openapi(getAllLocationsRoute, async (c) => {
  const queryParams = parseQueryParams(c.req.url);
  const { locationUseCases } = createUseCases(c.env, "locations");
  const locations = await locationUseCases.getAllLocations(queryParams);

  const convertedLocations = locations.map((location): LocationDetail => ({
    id: location.id,
    imi_pref_code: location.imiPrefCode,
    region: location.region,
    prefecture: location.prefecture,
    municipality: location.municipality,
    address: location.address,
    place_name: location.placeName,
    latitude: location.latitude,
    longitude: location.longitude,
    geohash: location.geohash,
    geom_geojson: location.geomGeojson,
    accuracy_m: location.accuracyM,
    created_at: location.createdAt,
    updated_at: location.updatedAt,
  }));

  return c.json(convertedLocations);
});

const getLocationByIdRoute = createRoute({
  method: "get",
  tags: ["locations"],
  path: "/{id}",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "場所詳細の取得に成功しました",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            imi_pref_code: z.string().nullable(),
            region: z.string().nullable(),
            prefecture: z.string().nullable(),
            municipality: z.string().nullable(),
            address: z.string().nullable(),
            place_name: z.string().nullable(),
            latitude: z.number().nullable(),
            longitude: z.number().nullable(),
            geohash: z.string().nullable(),
            geom_geojson: z.string().nullable(),
            accuracy_m: z.number().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
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
  if (!location) return c.json({ error: "句碑の場所が見つかりません" }, 404);

  const convertedLocation: LocationDetail = {
    id: location.id,
    imi_pref_code: location.imiPrefCode,
    region: location.region,
    prefecture: location.prefecture,
    municipality: location.municipality,
    address: location.address,
    place_name: location.placeName,
    latitude: location.latitude,
    longitude: location.longitude,
    geohash: location.geohash,
    geom_geojson: location.geomGeojson,
    accuracy_m: location.accuracyM,
    created_at: location.createdAt,
    updated_at: location.updatedAt,
  };

  return c.json(convertedLocation);
});

// GET /locations/:id/monuments
const getLocationMonumentsRoute = createRoute({
  method: "get",
  tags: ["locations"],
  path: "/{id}/monuments",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "場所に関する句碑一覧の取得に成功しました",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.number(),
              canonical_name: z.string(),
              canonical_uri: z.string(),
              monument_type: z.string().nullable(),
              material: z.string().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
              original_established_date: z.string().nullable(),
              hu_time_normalized: z.string().nullable(),
              interval_start: z.string().nullable(),
              interval_end: z.string().nullable(),
              uncertainty_note: z.string().nullable(),
            }),
          ),
        },
      },
    },
    404: { description: "句碑の場所が見つかりません" },
  },
});
router.openapi(getLocationMonumentsRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { monumentUseCases } = createUseCases(c.env, "monuments");
  const monuments = await monumentUseCases.getMonumentsByLocation(id);

  const convertedMonuments = monuments.map((monument) => ({
    id: monument.id,
    canonical_name: monument.canonicalName,
    canonical_uri: monument.canonicalUri || `https://api.kuhiapi.com/monuments/${monument.id}`,
    monument_type: monument.monumentType,
    material: monument.material,
    created_at: monument.createdAt,
    updated_at: monument.updatedAt,
    original_established_date: monument.originalEstablishedDate,
    hu_time_normalized: monument.huTimeNormalized,
    interval_start: monument.intervalStart,
    interval_end: monument.intervalEnd,
    uncertainty_note: monument.uncertaintyNote,
  }));

  return c.json(convertedMonuments);
});

export default router;
