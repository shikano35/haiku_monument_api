import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "./commonRouter";
import { createUseCases } from "./createUseCases";
import { parseQueryParams } from "../../utils/parseQueryParams";
import type { Inscription } from "../../domain/entities/Inscription";
import {
  InscriptionDetailSchema,
  InscriptionListSchema,
} from "../dtos/InscriptionResponse";

const router = createRouter();

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, "無効なIDです").transform(Number),
  })
  .openapi({ param: { name: "id", in: "path" } });

const inscriptionsQuerySchema = z.object({
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
  monument_id: z.coerce
    .number()
    .optional()
    .openapi({
      param: {
        name: "monument_id",
        description: "句碑ID",
        in: "query",
        required: false,
      },
      type: "integer",
    }),
  language: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "language",
        description: "言語",
        in: "query",
        required: false,
      },
    }),
  text_contains: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "text_contains",
        description: "碑文に含まれる文字列",
        in: "query",
        required: false,
      },
    }),
});

// Inscription変換関数
const convertInscriptionToBaseResponse = (inscription: Inscription) => ({
  id: inscription.id,
  monument_id: inscription.monumentId,
  side: inscription.side,
  original_text: inscription.originalText,
  transliteration: inscription.transliteration,
  reading: inscription.reading,
  language: inscription.language,
  notes: inscription.notes,
  source_id: inscription.sourceId,
  created_at: inscription.createdAt,
  updated_at: inscription.updatedAt,
});

const convertInscriptionToResponse = (inscription: Inscription) => ({
  id: inscription.id,
  monument_id: inscription.monumentId,
  side: inscription.side,
  original_text: inscription.originalText,
  transliteration: inscription.transliteration,
  reading: inscription.reading,
  language: inscription.language,
  notes: inscription.notes,
  source_id: inscription.sourceId,
  created_at: inscription.createdAt,
  updated_at: inscription.updatedAt,
  poems:
    inscription.poems?.map((poem) => ({
      id: poem.id,
      text: poem.text,
      normalized_text: poem.normalizedText,
      text_hash: poem.textHash,
      kigo: poem.kigo,
      season: poem.season,
      created_at: poem.createdAt,
      updated_at: poem.updatedAt,
    })) || [],
  monument: inscription.monument
    ? {
        id: inscription.monument.id,
        canonical_name: inscription.monument.canonicalName,
        canonical_uri:
          inscription.monument.canonicalUri ||
          `https://api.kuhiapi.com/monuments/${inscription.monument.id}`,
        monument_type: inscription.monument.monumentType,
        monument_type_uri: inscription.monument.monumentTypeUri,
        material: inscription.monument.material,
        material_uri: inscription.monument.materialUri,
        created_at: inscription.monument.createdAt,
        updated_at: inscription.monument.updatedAt,
      }
    : null,
  source: inscription.source
    ? {
        id: inscription.source.id,
        citation: inscription.source.citation,
        author: inscription.source.author,
        title: inscription.source.title,
        publisher: inscription.source.publisher,
        source_year: inscription.source.sourceYear,
        url: inscription.source.url,
        created_at: inscription.source.createdAt,
        updated_at: inscription.source.updatedAt,
      }
    : null,
});

// GET /inscriptions
const getAllInscriptionsRoute = createRoute({
  method: "get",
  tags: ["inscriptions"],
  path: "/",
  request: { query: inscriptionsQuerySchema },
  responses: {
    200: {
      description: "碑文一覧",
      content: {
        "application/json": {
          schema: InscriptionListSchema,
        },
      },
    },
  },
});

router.openapi(getAllInscriptionsRoute, async (c) => {
  const queryParams = parseQueryParams(c.req.url);
  const { inscriptionUseCases } = createUseCases(c.env, "inscriptions");
  const inscriptions =
    await inscriptionUseCases.getAllInscriptions(queryParams);

  const response = {
    inscriptions: inscriptions.map(convertInscriptionToResponse),
    total: inscriptions.length,
    limit: queryParams.limit || 50,
    offset: queryParams.offset || 0,
  };

  return c.json(response);
});

// GET /inscriptions/:id
const getInscriptionByIdRoute = createRoute({
  method: "get",
  tags: ["inscriptions"],
  path: "/{id}",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "碑文の詳細",
      content: {
        "application/json": {
          schema: InscriptionDetailSchema,
        },
      },
    },
    404: { description: "碑文が見つかりません" },
  },
});

router.openapi(getInscriptionByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { inscriptionUseCases } = createUseCases(c.env, "inscriptions");
  const inscription = await inscriptionUseCases.getInscriptionById(id);
  if (!inscription) {
    return c.json({ error: "碑文が見つかりません" }, 404);
  }
  return c.json(convertInscriptionToResponse(inscription));
});

export default router;
