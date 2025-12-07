import { z } from "@hono/zod-openapi";

// 基本のMonumentスキーマ
export const MonumentBaseSchema = z.object({
  id: z.number(),
  canonical_name: z.string(),
  canonical_uri: z.string().optional(),
  monument_type: z.string().nullable(),
  monument_type_uri: z.string().nullable(),
  material: z.string().nullable(),
  material_uri: z.string().nullable(),
  is_reliable: z.boolean().nullable(),
  verification_status: z.string().nullable(),
  verified_at: z.string().nullable(),
  verified_by: z.string().nullable(),
  reliability_note: z.string().nullable(),
  created_at: z.string(), // ISO8601形式
  updated_at: z.string(), // ISO8601形式
});

// Inscription（碑文）スキーマ
export const InscriptionSchema = z.object({
  id: z.number(),
  side: z.string(),
  original_text: z.string().nullable(),
  transliteration: z.string().nullable(),
  reading: z.string().nullable(),
  language: z.string(),
  notes: z.string().nullable(),
  poems: z
    .array(
      z.object({
        id: z.number(),
        text: z.string(),
        normalized_text: z.string(),
        text_hash: z.string(),
        kigo: z.string().nullable(),
        season: z.string().nullable(),
        created_at: z.string(),
        updated_at: z.string(),
      }),
    )
    .optional(),
  source: z
    .object({
      id: z.number(),
      citation: z.string(),
      author: z.string().nullable(),
      title: z.string().nullable(),
      publisher: z.string().nullable(),
      source_year: z.number().nullable(),
      url: z.string().nullable(),
      created_at: z.string(),
      updated_at: z.string(),
    })
    .nullable()
    .optional(),
});

// Event（出来事）スキーマ
export const EventSchema = z.object({
  id: z.number(),
  event_type: z.string(),
  hu_time_normalized: z.string().nullable(),
  interval_start: z.string().nullable(),
  interval_end: z.string().nullable(),
  uncertainty_note: z.string().nullable(),
  actor: z.string().nullable(),
  source: z
    .object({
      id: z.number(),
      citation: z.string(),
      author: z.string().nullable(),
      title: z.string().nullable(),
      publisher: z.string().nullable(),
      source_year: z.number().nullable(),
      url: z.string().nullable(),
      created_at: z.string(),
      updated_at: z.string(),
    })
    .nullable()
    .optional(),
});

// Media（メディア）スキーマ
export const MediaSchema = z.object({
  id: z.number(),
  media_type: z.string(),
  url: z.string(),
  iiif_manifest_url: z.string().nullable(),
  captured_at: z.string().nullable(),
  photographer: z.string().nullable(),
  license: z.string().nullable(),
  exif: z.record(z.unknown()).nullable().optional(),
  primary: z.boolean().optional(),
  order: z.number().optional(),
});

// Location（場所）スキーマ
export const LocationSchema = z.object({
  id: z.number(),
  imi_pref_code: z.string().nullable(),
  region: z.string().nullable(),
  prefecture: z.string().nullable(),
  municipality: z.string().nullable(),
  place_name: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  geojson: z.record(z.unknown()).nullable().optional(),
});

// Poet（俳人）スキーマ
export const PoetSchema = z.object({
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
});

// Source（出典）スキーマ
export const SourceSchema = z.object({
  id: z.number(),
  citation: z.string(),
  author: z.string().nullable(),
  title: z.string().nullable(),
  publisher: z.string().nullable(),
  source_year: z.number().nullable(),
  url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const MonumentDetailSchema = MonumentBaseSchema.extend({
  inscriptions: z.array(InscriptionSchema).optional(),
  events: z.array(EventSchema).optional(),
  media: z.array(MediaSchema).optional(),
  locations: z.array(LocationSchema).optional(),
  poets: z.array(PoetSchema).optional(),
  sources: z.array(SourceSchema).optional(),
  original_established_date: z.string().nullable().optional(),
  hu_time_normalized: z.string().nullable().optional(),
  interval_start: z.string().nullable().optional(),
  interval_end: z.string().nullable().optional(),
  uncertainty_note: z.string().nullable().optional(),
});

// Monument一覧レスポンス
export const MonumentListSchema = z.object({
  monuments: z.array(MonumentDetailSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

// Monumentクエリパラメータスキーマ
export const MonumentQuerySchema = z.object({
  limit: z.string().optional().default("50").transform(Number),
  offset: z.string().optional().default("0").transform(Number),
  ordering: z.string().optional(),
  q: z.string().optional(),
  inscription_contains: z.string().optional(),
  commentary_contains: z.string().optional(),
  poet_name_contains: z.string().optional(),
  poet_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : null)),
  kigo: z.string().optional(),
  season: z.string().optional(),
  material: z.string().optional(),
  monument_type: z.string().optional(),
  prefecture: z.string().optional(),
  region: z.string().optional(),
  municipality: z.string().optional(),
  location_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : null)),
  bbox: z.string().optional(),
  established_start: z.string().optional(),
  established_end: z.string().optional(),
  has_media: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  uncertain: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  expand: z.string().optional(),
});

export type MonumentBase = z.infer<typeof MonumentBaseSchema>;
export type MonumentDetail = z.infer<typeof MonumentDetailSchema>;
export type MonumentList = z.infer<typeof MonumentListSchema>;
export type MonumentQuery = z.infer<typeof MonumentQuerySchema>;
export type Inscription = z.infer<typeof InscriptionSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Poet = z.infer<typeof PoetSchema>;
export type Source = z.infer<typeof SourceSchema>;
