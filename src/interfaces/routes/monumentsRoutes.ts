import { createRoute, z } from "@hono/zod-openapi";
import type { Monument } from "../../domain/entities/Monument";
import type { Source } from "../../domain/entities/Source";
import { parseQueryParams } from "../../utils/parseQueryParams";
import {
  EventSchema,
  InscriptionSchema,
  MediaSchema,
  MonumentBaseSchema,
  type MonumentDetail,
  MonumentDetailSchema,
  MonumentQuerySchema,
} from "../dtos/MonumentResponse";
import { createRouter } from "./commonRouter";
import { createUseCases } from "./createUseCases";

const router = createRouter();

const idParamSchema = z
  .object({
    id: z.string().regex(/^\d+$/, "無効なIDです").transform(Number),
  })
  .openapi({ param: { name: "id", in: "path" } });

const safeParseGeoJSON = (
  geojson: string | null | undefined,
): Record<string, unknown> | null => {
  if (!geojson) return null;
  try {
    const parsed = JSON.parse(geojson);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
};

const convertSourceToResponse = (source: Source | null | undefined) => {
  if (!source) return null;
  return {
    id: source.id,
    citation: source.citation,
    author: source.author,
    title: source.title,
    publisher: source.publisher,
    source_year: source.sourceYear,
    url: source.url,
    created_at: source.createdAt,
    updated_at: source.updatedAt,
  };
};

const convertMonumentToResponse = (monument: Monument): MonumentDetail => {
  try {
    const inscriptions =
      monument.inscriptions?.map((inscription) => {
        const poems =
          inscription.poems?.map((poem) => ({
            id: poem.id,
            text: poem.text,
            normalized_text: poem.normalizedText,
            text_hash: poem.textHash,
            kigo: poem.kigo,
            season: poem.season,
            created_at: poem.createdAt,
            updated_at: poem.updatedAt,
          })) || [];

        return {
          id: inscription.id,
          side: inscription.side,
          original_text: inscription.originalText,
          transliteration: inscription.transliteration,
          reading: inscription.reading,
          language: inscription.language,
          notes: inscription.notes,
          poems,
          source: convertSourceToResponse(inscription.source),
        };
      }) || [];

    const events =
      monument.events?.map((event) => ({
        id: event.id,
        event_type: event.eventType,
        hu_time_normalized: event.huTimeNormalized,
        interval_start: event.intervalStart,
        interval_end: event.intervalEnd,
        uncertainty_note: event.uncertaintyNote,
        actor: event.actor,
        source: convertSourceToResponse(event.source),
      })) || [];

    const media =
      monument.media?.map((m) => ({
        id: m.id,
        media_type: m.mediaType,
        url: m.url,
        iiif_manifest_url: m.iiifManifestUrl,
        captured_at: m.capturedAt,
        photographer: m.photographer,
        license: m.license,
      })) || [];

    const locations =
      monument.locations?.map((location) => ({
        id: location.id,
        imi_pref_code: location.imiPrefCode,
        region: location.region,
        prefecture: location.prefecture,
        municipality: location.municipality,
        place_name: location.placeName,
        latitude: location.latitude,
        longitude: location.longitude,
        geojson: safeParseGeoJSON(location.geomGeojson),
      })) || [];

    const poets =
      monument.poets?.map((poet) => ({
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
      })) || [];

    const sources =
      monument.sources?.map((source) => ({
        id: source.id,
        citation: source.citation,
        author: source.author,
        title: source.title,
        publisher: source.publisher,
        source_year: source.sourceYear,
        url: source.url,
        created_at: source.createdAt,
        updated_at: source.updatedAt,
      })) || [];

    return {
      id: monument.id,
      canonical_name: monument.canonicalName,
      canonical_uri:
        monument.canonicalUri || `https://api.kuhi.jp/monuments/${monument.id}`,
      monument_type: monument.monumentType,
      monument_type_uri: monument.monumentTypeUri,
      material: monument.material,
      material_uri: monument.materialUri,
      created_at: monument.createdAt,
      updated_at: monument.updatedAt,
      inscriptions,
      events,
      media,
      locations,
      poets,
      sources,
      original_established_date: monument.originalEstablishedDate,
      hu_time_normalized: monument.huTimeNormalized,
      interval_start: monument.intervalStart,
      interval_end: monument.intervalEnd,
      uncertainty_note: monument.uncertaintyNote,
    };
  } catch (_error) {
    return {
      id: monument.id,
      canonical_name: monument.canonicalName,
      canonical_uri: `https://api.kuhi.jp/monuments/${monument.id}`,
      monument_type: monument.monumentType,
      monument_type_uri: monument.monumentTypeUri,
      material: monument.material,
      material_uri: monument.materialUri,
      created_at: monument.createdAt,
      updated_at: monument.updatedAt,
      inscriptions: [],
      events: [],
      media: [],
      locations: [],
      poets: [],
      sources: [],
      original_established_date: null,
      hu_time_normalized: null,
      interval_start: null,
      interval_end: null,
      uncertainty_note: null,
    };
  }
};

// GET /monuments
const getAllMonumentsRoute = createRoute({
  method: "get",
  tags: ["monuments"],
  path: "/",
  request: {
    query: MonumentQuerySchema.openapi({
      description: "句碑一覧取得のクエリパラメータ",
    }),
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

  const inscriptions =
    monument.inscriptions?.map((inscription) => ({
      id: inscription.id,
      side: inscription.side,
      original_text: inscription.originalText,
      transliteration: inscription.transliteration,
      reading: inscription.reading,
      language: inscription.language,
      notes: inscription.notes,
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

  const events =
    monument.events?.map((event) => ({
      id: event.id,
      event_type: event.eventType,
      hu_time_normalized: event.huTimeNormalized,
      interval_start: event.intervalStart,
      interval_end: event.intervalEnd,
      uncertainty_note: event.uncertaintyNote,
      actor: event.actor,
      source: event.source
        ? {
            id: event.source.id,
            citation: event.source.citation,
            author: event.source.author,
            title: event.source.title,
            publisher: event.source.publisher,
            source_year: event.source.sourceYear,
            url: event.source.url,
            created_at: event.source.createdAt,
            updated_at: event.source.updatedAt,
          }
        : null,
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

  const media =
    monument.media?.map((mediaItem) => ({
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
