import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "./commonRouter";
import { createUseCases } from "./createUseCases";
import { parseQueryParams } from "../../utils/parseQueryParams";
import type { Poem } from "../../domain/entities/Poem";
import { 
  PoemDetailSchema, 
  PoemListSchema, 
  PoemQuerySchema 
} from "../dtos/PoemResponse";

const router = createRouter();

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, "無効なIDです").transform(Number),
  })
  .openapi({ param: { name: "id", in: "path" } });

const convertPoemToBaseResponse = (poem: Poem) => ({
  id: poem.id,
  text: poem.text,
  normalized_text: poem.normalizedText,
  text_hash: poem.textHash,
  kigo: poem.kigo,
  season: poem.season,
  created_at: poem.createdAt,
  updated_at: poem.updatedAt,
});

const convertPoemToResponse = (poem: Poem) => ({
  id: poem.id,
  text: poem.text,
  normalized_text: poem.normalizedText,
  text_hash: poem.textHash,
  kigo: poem.kigo,
  season: poem.season,
  created_at: poem.createdAt,
  updated_at: poem.updatedAt,
  attributions: [], // TODO: PoemAttribution関連の実装後に追加
  inscriptions: [], // TODO: Inscription関連の実装後に追加
});

// GET /poems
const getAllPoemsRoute = createRoute({
  method: "get",
  tags: ["poems"],
  path: "/",
  request: { 
    query: PoemQuerySchema.openapi({
      description: "俳句一覧取得のクエリパラメータ"
    })
  },
  responses: {
    200: {
      description: "俳句一覧",
      content: {
        "application/json": {
          schema: PoemListSchema,
        },
      },
    },
  },
});

router.openapi(getAllPoemsRoute, async (c) => {
  const queryParams = parseQueryParams(c.req.url);
  const { poemUseCases } = createUseCases(c.env, "poems");
  const poems = await poemUseCases.getAllPoems(queryParams);
  
  const response = {
    poems: poems.map(convertPoemToBaseResponse),
    total: poems.length, // TODO: implement proper total count
    limit: queryParams.limit || 50,
    offset: queryParams.offset || 0,
  };
  
  return c.json(response);
});

// GET /poems/:id
const getPoemByIdRoute = createRoute({
  method: "get",
  tags: ["poems"],
  path: "/{id}",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "俳句の詳細",
      content: {
        "application/json": {
          schema: PoemDetailSchema,
        },
      },
    },
    404: { description: "俳句が見つかりません" },
  },
});

router.openapi(getPoemByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { poemUseCases } = createUseCases(c.env, "poems");
  const poem = await poemUseCases.getPoemById(id);
  if (!poem) {
    return c.json({ error: "俳句が見つかりません" }, 404);
  }
  return c.json(convertPoemToResponse(poem));
});

export default router;
