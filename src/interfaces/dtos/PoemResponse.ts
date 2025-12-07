import { z } from "@hono/zod-openapi";

export const PoemBaseSchema = z.object({
  id: z.number(),
  text: z.string(),
  normalized_text: z.string(),
  text_hash: z.string(),
  kigo: z.string().nullable(),
  season: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PoemDetailSchema = PoemBaseSchema.extend({
  attributions: z
    .array(
      z.object({
        id: z.number(),
        poet: z.object({
          id: z.number(),
          name: z.string(),
          link_url: z.string().nullable(),
        }),
        confidence: z.string(),
        confidence_score: z.number(),
        source: z
          .object({
            id: z.number(),
            title: z.string(),
            url: z.string().nullable(),
          })
          .nullable(),
      }),
    )
    .nullable(),
  inscriptions: z
    .array(
      z.object({
        id: z.number(),
        monument: z.object({
          id: z.number(),
          canonical_name: z.string(),
        }),
        side: z.string(),
      }),
    )
    .nullable(),
});

export const PoemListSchema = z.object({
  poems: z.array(PoemBaseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const PoemQuerySchema = z.object({
  limit: z.string().optional().default("50").transform(Number),
  offset: z.string().optional().default("0").transform(Number),
  ordering: z.string().optional(),
  search: z.string().optional(),
  text_contains: z.string().optional(),
  poet_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : null)),
  season: z.string().optional(),
  kigo: z.string().optional(),
});

export type PoemBase = z.infer<typeof PoemBaseSchema>;
export type PoemDetail = z.infer<typeof PoemDetailSchema>;
export type PoemList = z.infer<typeof PoemListSchema>;
export type PoemQuery = z.infer<typeof PoemQuerySchema>;
