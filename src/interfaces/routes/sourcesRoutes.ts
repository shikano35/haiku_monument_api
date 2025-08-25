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

const sourcesQuerySchema = z.object({
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
        z.enum([
          "-title",
          "-author",
          "-year",
          "-publisher",
          "-created_at",
          "-updated_at",
          "title",
          "author",
          "year",
          "publisher",
          "created_at",
          "updated_at",
        ]),
      ),
    )
    .optional()
    .openapi({
      param: {
        name: "ordering",
        description:
          "並び替え\n* `title` - タイトルの昇順\n* `-title` - タイトルの降順\n* `author` - 著者の昇順\n* `-author` - 著者の降順\n* `year` - 出版年の昇順\n* `-year` - 出版年の降順\n* `publisher` - 出版社の昇順\n* `-publisher` - 出版社の降順\n* `created_at` - 作成日時の昇順\n* `-created_at` - 作成日時の降順\n* `updated_at` - 更新日時の昇順\n* `-updated_at` - 更新日時の降順",
        in: "query",
        required: false,
      },
    }),
  search: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "search",
        description: "検索",
        in: "query",
        required: false,
      },
    }),
  title_contains: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "title_contains",
        description: "タイトルに含まれる文字列",
        in: "query",
        required: false,
      },
    }),
  name_contains: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "name_contains",
        description: "著者に含まれる文字列",
        in: "query",
        required: false,
      },
    }),
});

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
          `https://api.kuhiapi.com/monuments/${monument.id}`,
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
      monument.canonicalUri ||
      `https://api.kuhiapi.com/monuments/${monument.id}`,
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
