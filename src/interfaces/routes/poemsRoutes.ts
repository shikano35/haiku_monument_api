import { createRoute, z } from "@hono/zod-openapi";
import type { Poem } from "../../domain/entities/Poem";
import { parseQueryParams } from "../../utils/parseQueryParams";
import {
  PoemDetailSchema,
  PoemListSchema,
  PoemQuerySchema,
} from "../dtos/PoemResponse";
import { createRouter } from "./commonRouter";
import { createUseCases } from "./createUseCases";

const router = createRouter();

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, "無効なIDです").transform(Number),
  })
  .openapi({ param: { name: "id", in: "path" } });

const convertPoemToResponse = (poem: Poem) => ({
  id: poem.id,
  text: poem.text,
  normalized_text: poem.normalizedText,
  text_hash: poem.textHash,
  kigo: poem.kigo,
  season: poem.season,
  created_at: poem.createdAt,
  updated_at: poem.updatedAt,
  attributions:
    poem.attributions?.map((attr) => ({
      id: attr.id,
      poem_id: attr.poemId,
      poet_id: attr.poetId,
      confidence: attr.confidence,
      confidence_score: attr.confidenceScore,
      source_id: attr.sourceId,
      created_at: attr.createdAt,
      poet: attr.poet
        ? {
            id: attr.poet.id,
            name: attr.poet.name,
            name_kana: attr.poet.nameKana,
            biography: attr.poet.biography,
            birth_year: attr.poet.birthYear,
            death_year: attr.poet.deathYear,
            link_url: attr.poet.linkUrl,
            image_url: attr.poet.imageUrl,
            created_at: attr.poet.createdAt,
            updated_at: attr.poet.updatedAt,
          }
        : null,
      source: attr.source
        ? {
            id: attr.source.id,
            citation: attr.source.citation,
            author: attr.source.author,
            title: attr.source.title,
            publisher: attr.source.publisher,
            source_year: attr.source.sourceYear,
            url: attr.source.url,
            created_at: attr.source.createdAt,
            updated_at: attr.source.updatedAt,
          }
        : null,
    })) || [],
  inscriptions:
    poem.inscriptions?.map((ins) => ({
      id: ins.id,
      monument_id: ins.monumentId,
      side: ins.side,
      original_text: ins.originalText,
      transliteration: ins.transliteration,
      reading: ins.reading,
      language: ins.language,
      notes: ins.notes,
      source_id: ins.sourceId,
      created_at: ins.createdAt,
      updated_at: ins.updatedAt,
    })) || [],
});

// GET /poems
const getAllPoemsRoute = createRoute({
  method: "get",
  tags: ["poems"],
  path: "/",
  request: {
    query: PoemQuerySchema.openapi({
      description: "俳句一覧取得のクエリパラメータ",
    }),
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

  const poemQueryParams = {
    limit: queryParams.limit,
    offset: queryParams.offset,
    ordering: queryParams.ordering,
    search: queryParams.search,
    textContains: queryParams.textContains,
    kigo: queryParams.kigo,
    season: queryParams.season,
    poetId: queryParams.poetId,
  };

  const poems = await poemUseCases.getAllPoems(poemQueryParams);

  const response = {
    poems: poems.map(convertPoemToResponse),
    total: poems.length,
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
