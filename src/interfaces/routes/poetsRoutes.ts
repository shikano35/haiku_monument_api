import { createRoute, z } from "@hono/zod-openapi";
import { parseQueryParams } from "../../utils/parseQueryParams";
import type { PoetDetail } from "../dtos/PoetResponse";
import { createRouter } from "./commonRouter";
import { createUseCases } from "./createUseCases";

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, "無効なIDです").transform(Number),
  })
  .openapi({ param: { name: "id", in: "path" } });

const poetsQuerySchema = z.object({
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
          "-created_at",
          "-updated_at",
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
          "並び替え\n* `created_at` - 作成日時の昇順\n* `-created_at` - 作成日時の降順\n* `updated_at` - 更新日時の昇順\n* `-updated_at` - 更新日時の降順",
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
  name_contains: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "name_contains",
        description: "名前に含まれる文字列",
        in: "query",
        required: false,
      },
    }),
  biography_contains: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "biography_contains",
        description: "俳人情報に含まれる文字列",
        in: "query",
        required: false,
      },
    }),
});

const router = createRouter();

const getAllPoetsRoute = createRoute({
  method: "get",
  tags: ["poets"],
  path: "/",
  request: { query: poetsQuerySchema },
  responses: {
    200: {
      description: "俳人一覧の取得に成功しました",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              name_kana: z.string().nullable(),
              biography: z.string().nullable(),
              birth_year: z.number().nullable(),
              death_year: z.number().nullable(),
              link_url: z.string().nullable(),
              image_url: z.string().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
            }),
          ),
        },
      },
    },
  },
});
router.openapi(getAllPoetsRoute, async (c) => {
  const queryParams = parseQueryParams(c.req.url);
  const { poetUseCases } = createUseCases(c.env, "poets");
  const poets = await poetUseCases.getAllPoets(queryParams);

  const convertedPoets = poets.map((poet): PoetDetail => ({
    id: poet.id,
    name: poet.name,
    name_kana: poet.nameKana,
    biography: poet.biography,
    birth_year: poet.birthYear,
    death_year: poet.deathYear,
    link_url: poet.linkUrl,
    image_url: poet.imageUrl,
    created_at: poet.createdAt,
    updated_at: poet.updatedAt,
  }));

  return c.json(convertedPoets);
});

const getPoetByIdRoute = createRoute({
  method: "get",
  tags: ["poets"],
  path: "/{id}",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "俳人詳細の取得に成功しました",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            name_kana: z.string().nullable(),
            biography: z.string().nullable(),
            birth_year: z.number().nullable(),
            death_year: z.number().nullable(),
            link_url: z.string().nullable(),
            image_url: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        },
      },
    },
    404: { description: "俳人が見つかりません" },
  },
});
router.openapi(getPoetByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { poetUseCases } = createUseCases(c.env, "poets");
  const poet = await poetUseCases.getPoetById(id);
  if (!poet) return c.json({ error: "俳人が見つかりません" }, 404);

  const convertedPoet: PoetDetail = {
    id: poet.id,
    name: poet.name,
    name_kana: poet.nameKana,
    biography: poet.biography,
    birth_year: poet.birthYear,
    death_year: poet.deathYear,
    link_url: poet.linkUrl,
    image_url: poet.imageUrl,
    created_at: poet.createdAt,
    updated_at: poet.updatedAt,
  };

  return c.json(convertedPoet);
});

// GET /poets/:id/monuments
const getPoetMonumentsRoute = createRoute({
  method: "get",
  tags: ["poets"],
  path: "/{id}/monuments",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "俳人に関する句碑一覧の取得に成功しました",
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
    404: { description: "俳人が見つかりません" },
  },
});
router.openapi(getPoetMonumentsRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { monumentUseCases } = createUseCases(c.env, "monuments");
  const monuments = await monumentUseCases.getMonumentsByPoet(id);

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
