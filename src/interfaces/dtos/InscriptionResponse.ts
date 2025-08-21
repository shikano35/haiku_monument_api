import { z } from "@hono/zod-openapi";

export const InscriptionBaseSchema = z.object({
  id: z.number(),
  monument_id: z.number(),
  side: z.string(),
  original_text: z.string().nullable(),
  transliteration: z.string().nullable(),
  reading: z.string().nullable(),
  language: z.string(),
  notes: z.string().nullable(),
  source_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const InscriptionDetailSchema = InscriptionBaseSchema.extend({
  poems: z.array(z.object({
    id: z.number(),
    text: z.string(),
    normalized_text: z.string(),
    text_hash: z.string(),
    kigo: z.string().nullable(),
    season: z.string().nullable(),
  })).nullable(),
  monument: z.object({
    id: z.number(),
    canonical_name: z.string(),
  }).nullable(),
  source: z.object({
    id: z.number(),
    title: z.string(),
    url: z.string().nullable(),
  }).nullable(),
});

export const InscriptionListSchema = z.object({
  inscriptions: z.array(InscriptionBaseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const InscriptionQuerySchema = z.object({
  limit: z.string().optional().default("50").transform(Number),
  offset: z.string().optional().default("0").transform(Number),
  ordering: z.string().optional(),
  search: z.string().optional(),
  monument_id: z.string().optional().transform((val) => (val ? Number(val) : null)),
  side: z.string().optional(),
  language: z.string().optional(),
  source_id: z.string().optional().transform((val) => (val ? Number(val) : null)),
});

export type InscriptionBase = z.infer<typeof InscriptionBaseSchema>;
export type InscriptionDetail = z.infer<typeof InscriptionDetailSchema>;
export type InscriptionList = z.infer<typeof InscriptionListSchema>;
export type InscriptionQuery = z.infer<typeof InscriptionQuerySchema>;
