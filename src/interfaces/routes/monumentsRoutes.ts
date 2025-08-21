import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "./commonRouter";
import { createUseCases } from "./createUseCases";
import { parseQueryParams } from "../../utils/parseQueryParams";
import type { Monument } from "../../domain/entities/Monument";
import { 
  MonumentDetailSchema,
  MonumentBaseSchema,
  MonumentQuerySchema,
  InscriptionSchema,
  EventSchema,
  MediaSchema,
  type MonumentDetail,
} from "../dtos/MonumentResponse";

const router = createRouter();

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, "無効なIDです").transform(Number),
  })
  .openapi({ param: { name: "id", in: "path" } });

const convertMonumentToResponse = (monument: Monument): MonumentDetail => ({
  id: monument.id,
  canonical_name: monument.canonicalName,
  canonical_uri: monument.canonicalUri || `https://api.kuhiapi.com/monuments/${monument.id}`,
  monument_type: monument.monumentType,
  monument_type_uri: monument.monumentTypeUri,
  material: monument.material,
  material_uri: monument.materialUri,
  created_at: monument.createdAt,
  updated_at: monument.updatedAt,
  inscriptions: monument.inscriptions?.map(inscription => ({
    id: inscription.id,
    side: inscription.side,
    original_text: inscription.originalText,
    transliteration: inscription.transliteration,
    reading: inscription.reading,
    language: inscription.language,
    notes: inscription.notes,
    poems: [], // TODO: inscription.poems mapping
    source: inscription.sourceId ? { id: inscription.sourceId, title: "", url: null } : null,
  })) || [],
  events: monument.events?.map(event => ({
    id: event.id,
    event_type: event.eventType,
    hu_time_normalized: event.huTimeNormalized,
    interval_start: event.intervalStart,
    interval_end: event.intervalEnd,
    uncertainty_note: event.uncertaintyNote,
    actor: event.actor,
    source: event.sourceId ? { id: event.sourceId } : null,
  })) || [],
  media: monument.media?.map(media => ({
    id: media.id,
    media_type: media.mediaType,
    url: media.url,
    iiif_manifest_url: media.iiifManifestUrl,
    captured_at: media.capturedAt,
    photographer: media.photographer,
    license: media.license,
  })) || [],
  locations: monument.locations?.map(location => ({
    id: location.id,
    imi_pref_code: location.imiPrefCode,
    region: location.region,
    prefecture: location.prefecture,
    municipality: location.municipality,
    place_name: location.placeName,
    latitude: location.latitude,
    longitude: location.longitude,
    geojson: location.geomGeojson ? JSON.parse(location.geomGeojson) : null,
  })) || [],
  poets: monument.poets?.map(poet => ({
    id: poet.id,
    name: poet.name,
    link_url: poet.linkUrl,
  })) || [],
  sources: monument.sources?.map(source => ({
    id: source.id,
    title: source.title || "",
    url: source.url,
  })) || [],
  original_established_date: monument.originalEstablishedDate,
  hu_time_normalized: monument.huTimeNormalized,
  interval_start: monument.intervalStart,
  interval_end: monument.intervalEnd,
  uncertainty_note: monument.uncertaintyNote,
});

// GET /monuments
const getAllMonumentsRoute = createRoute({
  method: "get",
  tags: ["monuments"],
  path: "/",
  request: { 
    query: MonumentQuerySchema.openapi({
      description: "句碑一覧取得のクエリパラメータ"
    })
  },
  responses: {
    200: {
      description: "句碑一覧",
      content: {
        "application/json": {
          schema: z.array(MonumentBaseSchema),
        },
      },
    },
  },
});

router.openapi(getAllMonumentsRoute, async (c) => {
  const queryParams = parseQueryParams(c.req.url);
  const { monumentUseCases } = createUseCases(c.env, "monuments");
  const monuments = await monumentUseCases.getAllMonuments(queryParams);
  return c.json(monuments.map(convertMonumentToResponse));
});

// GET /monuments/:id
const getMonumentByIdRoute = createRoute({
  method: "get",
  tags: ["monuments"],
  path: "/{id}",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "句碑の詳細",
      content: {
        "application/json": {
          schema: MonumentDetailSchema,
        },
      },
    },
    404: { description: "句碑が見つかりません" },
  },
});

router.openapi(getMonumentByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { monumentUseCases } = createUseCases(c.env, "monuments");
  const monument = await monumentUseCases.getMonumentById(id);
  if (!monument) {
    return c.json({ error: "句碑が見つかりません" }, 404);
  }
  return c.json(convertMonumentToResponse(monument));
});

// GET /monuments/:id/inscriptions
const getMonumentInscriptionsRoute = createRoute({
  method: "get",
  tags: ["monuments"],
  path: "/{id}/inscriptions",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "句碑の碑文一覧",
      content: {
        "application/json": {
          schema: z.array(InscriptionSchema),
        },
      },
    },
    404: { description: "句碑が見つかりません" },
  },
});

router.openapi(getMonumentInscriptionsRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { monumentUseCases } = createUseCases(c.env, "monuments");
  const monument = await monumentUseCases.getMonumentById(id);
  if (!monument) {
    return c.json({ error: "句碑が見つかりません" }, 404);
  }
  
  const inscriptions = monument.inscriptions?.map(inscription => ({
    id: inscription.id,
    side: inscription.side,
    original_text: inscription.originalText,
    transliteration: inscription.transliteration,
    reading: inscription.reading,
    language: inscription.language,
    notes: inscription.notes,
    poems: [], // TODO: inscription.poems mapping
    source: inscription.sourceId ? { id: inscription.sourceId, title: "", url: null } : null,
  })) || [];
  
  return c.json(inscriptions);
});

// GET /monuments/:id/events
const getMonumentEventsRoute = createRoute({
  method: "get",
  tags: ["monuments"],
  path: "/{id}/events",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "句碑のイベント一覧",
      content: {
        "application/json": {
          schema: z.array(EventSchema),
        },
      },
    },
    404: { description: "句碑が見つかりません" },
  },
});

router.openapi(getMonumentEventsRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { monumentUseCases } = createUseCases(c.env, "monuments");
  const monument = await monumentUseCases.getMonumentById(id);
  if (!monument) {
    return c.json({ error: "句碑が見つかりません" }, 404);
  }
  
  const events = monument.events?.map(event => ({
    id: event.id,
    event_type: event.eventType,
    hu_time_normalized: event.huTimeNormalized,
    interval_start: event.intervalStart,
    interval_end: event.intervalEnd,
    uncertainty_note: event.uncertaintyNote,
    actor: event.actor,
    source: event.sourceId ? { id: event.sourceId } : null,
  })) || [];
  
  return c.json(events);
});

// GET /monuments/:id/media
const getMonumentMediaRoute = createRoute({
  method: "get",
  tags: ["monuments"],
  path: "/{id}/media",
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "句碑のメディア一覧",
      content: {
        "application/json": {
          schema: z.array(MediaSchema),
        },
      },
    },
    404: { description: "句碑が見つかりません" },
  },
});

router.openapi(getMonumentMediaRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { monumentUseCases } = createUseCases(c.env, "monuments");
  const monument = await monumentUseCases.getMonumentById(id);
  if (!monument) {
    return c.json({ error: "句碑が見つかりません" }, 404);
  }
  
  const media = monument.media?.map(mediaItem => ({
    id: mediaItem.id,
    media_type: mediaItem.mediaType,
    url: mediaItem.url,
    iiif_manifest_url: mediaItem.iiifManifestUrl,
    captured_at: mediaItem.capturedAt,
    photographer: mediaItem.photographer,
    license: mediaItem.license,
  })) || [];
  
  return c.json(media);
});

export default router;
