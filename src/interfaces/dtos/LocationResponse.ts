import { z } from "@hono/zod-openapi";

// Location基本スキーマ
export const LocationBaseSchema = z.object({
  id: z.number(),
  imi_pref_code: z.string().nullable(),
  region: z.string().nullable(),
  prefecture: z.string().nullable(),
  municipality: z.string().nullable(),
  address: z.string().nullable(),
  place_name: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  geohash: z.string().nullable(),
  geom_geojson: z.string().nullable(),
  accuracy_m: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Location詳細スキーマ
export const LocationDetailSchema = LocationBaseSchema.extend({
  monuments: z.array(z.object({
    id: z.number(),
    canonical_name: z.string(),
    monument_type: z.string().nullable(),
  })).optional(),
});

// Location一覧レスポンス
export const LocationListSchema = z.object({
  locations: z.array(LocationBaseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

// Locationクエリパラメータ
export const LocationQuerySchema = z.object({
  limit: z.string().optional().default("50").transform(Number),
  offset: z.string().optional().default("0").transform(Number),
  ordering: z.string().optional(),
  prefecture: z.string().optional(),
  region: z.string().optional(),
  search: z.string().optional(),
});

export type LocationBase = z.infer<typeof LocationBaseSchema>;
export type LocationDetail = z.infer<typeof LocationDetailSchema>;
export type LocationList = z.infer<typeof LocationListSchema>;
export type LocationQuery = z.infer<typeof LocationQuerySchema>;
