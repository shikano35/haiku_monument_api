import { z } from "@hono/zod-openapi";

export const MediaBaseSchema = z.object({
  id: z.number(),
  monument_id: z.number(),
  media_type: z.string(),
  url: z.string(),
  iiif_manifest_url: z.string().nullable(),
  captured_at: z.string().nullable(),
  photographer: z.string().nullable(),
  license: z.string().nullable(),
  exif_json: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const MediaDetailSchema = MediaBaseSchema.extend({
  monument: z
    .object({
      id: z.number(),
      canonical_name: z.string(),
    })
    .nullable(),
  exif: z.record(z.string()).nullable(),
});

export const MediaListSchema = z.object({
  media: z.array(MediaBaseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const MediaQuerySchema = z.object({
  limit: z.string().optional().default("50").transform(Number),
  offset: z.string().optional().default("0").transform(Number),
  ordering: z.string().optional(),
  search: z.string().optional(),
  monument_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : null)),
  media_type: z.string().optional(),
  photographer: z.string().optional(),
});

export type MediaBase = z.infer<typeof MediaBaseSchema>;
export type MediaDetail = z.infer<typeof MediaDetailSchema>;
export type MediaList = z.infer<typeof MediaListSchema>;
export type MediaQuery = z.infer<typeof MediaQuerySchema>;
