import { createRoute, z } from "@hono/zod-openapi";
import { parseQueryParams } from "../../utils/parseQueryParams";
import type { SourceDetail } from "../dtos/SourceResponse";
import {
  SourceBaseSchema,
  SourceDetailSchema,
  SourceQuerySchema,
} from "../dtos/SourceResponse";
import { createRouter } from "./commonRouter";
import { createUseCases } from "./createUseCases";

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, "無効なIDです").transform(Number),
  })
  .openapi({ param: { name: "id", in: "path" } });

const router = createRouter();

const getAllSourcesRoute = createRoute({
  method: "get",
  tags: ["sources"],
  path: "/",
  request: { query: SourceQuerySchema },
  responses: {
    200: {
      description: "情報源一覧の取得に成功しました",
      content: {
        "application/json": {
          schema: z.array(SourceBaseSchema),
        },
      },
    },
  },
});
router.openapi(getAllSourcesRoute, async (c) => {
  const queryParams = parseQueryParams(c.req.url);
  const { sourceUseCases } = createUseCases(c.env, "sources");
  const sources = await sourceUseCases.getAllSources(queryParams);

  const convertedSources = sources.map((source) => ({
    id: source.id,
    citation: source.citation,
    author: source.author,
    publisher: source.publisher,
    source_year: source.sourceYear,
    title: source.title,
    url: source.url,
    created_at: source.createdAt,
    updated_at: source.updatedAt,
  }));

  return c.json(convertedSources);
});

const getSourceByIdRoute = createRoute({
  method: "get",
  tags: ["sources"],
  path: "/{id}",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "情報源詳細の取得に成功しました",
      content: {
        "application/json": {
          schema: SourceDetailSchema,
        },
      },
    },
    404: { description: "情報源が見つかりません" },
  },
});
router.openapi(getSourceByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { sourceUseCases } = createUseCases(c.env, "sources");
  const source = await sourceUseCases.getSourceById(id);
  if (!source) return c.json({ error: "情報源が見つかりません" }, 404);
  const snakeSource: SourceDetail = {
    id: source.id,
    citation: source.citation,
    author: source.author,
    title: source.title,
    publisher: source.publisher,
    source_year: source.sourceYear,
    url: source.url,
    created_at: source.createdAt,
    updated_at: source.updatedAt,
    monuments:
      source.monuments?.map((monument) => ({
        id: monument.id,
        canonical_name: monument.canonicalName,
        canonical_uri:
          monument.canonicalUri ||
          `https://api.kuhi.jp/monuments/${monument.id}`,
        monument_type: monument.monumentType,
        monument_type_uri: monument.monumentTypeUri,
        material: monument.material,
        material_uri: monument.materialUri,
        created_at: monument.createdAt,
        updated_at: monument.updatedAt,
        original_established_date: monument.originalEstablishedDate,
        hu_time_normalized: monument.huTimeNormalized,
        interval_start: monument.intervalStart,
        interval_end: monument.intervalEnd,
        uncertainty_note: monument.uncertaintyNote,
      })) || [],
  };
  return c.json(snakeSource);
});

// GET /sources/:id/monuments
const getSourceMonumentsRoute = createRoute({
  method: "get",
  tags: ["sources"],
  path: "/{id}/monuments",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "情報源に関する句碑一覧の取得に成功しました",
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
    400: { description: "無効なIDです" },
  },
});
router.openapi(getSourceMonumentsRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { monumentUseCases } = createUseCases(c.env, "monuments");
  const monuments = await monumentUseCases.getMonumentsBySource(id);

  const convertedMonuments = monuments.map((monument) => ({
    id: monument.id,
    canonical_name: monument.canonicalName,
    canonical_uri:
      monument.canonicalUri || `https://api.kuhi.jp/monuments/${monument.id}`,
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
