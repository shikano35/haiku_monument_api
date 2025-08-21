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
  limit: z.coerce.number().optional().openapi({
    param: {
      name: "limit",
      description: "取得する件数",
      in: "query",
      required: false,
    },
    type: "integer",
  }),
  offset: z.coerce.number().optional().openapi({
    param: {
      name: "offset",
      description: "取得開始位置",
      in: "query",
      required: false,
    },
    type: "integer",
  }),
  monument_id: z.coerce.number().optional().openapi({
    param: {
      name: "monument_id",
      description: "句碑ID",
      in: "query",
      required: false,
    },
    type: "integer",
  }),
  language: z.string().optional().openapi({
    param: {
      name: "language",
      description: "言語",
      in: "query",
      required: false,
    },
  }),
  text_contains: z.string().optional().openapi({
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
  poems: [], // TODO: Poem関連の実装後に追加
  monument: null, // TODO: Monument関連の実装後に追加
  source: inscription.sourceId ? { id: inscription.sourceId, title: "", url: null } : null,
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
  const inscriptions = await inscriptionUseCases.getAllInscriptions(queryParams);
  
  const response = {
    inscriptions: inscriptions.map(convertInscriptionToBaseResponse),
    total: inscriptions.length, // TODO: implement proper total count
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
