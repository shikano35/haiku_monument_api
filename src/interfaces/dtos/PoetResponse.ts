import { z } from "@hono/zod-openapi";

// Poet基本スキーマ
export const PoetBaseSchema = z.object({
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

// Poet詳細スキーマ
export const PoetDetailSchema = PoetBaseSchema.extend({
  monuments: z
    .array(
      z.object({
        id: z.number(),
        canonical_name: z.string(),
        monument_type: z.string().nullable(),
      }),
    )
    .optional(),
});

// Poet一覧レスポンス
export const PoetListSchema = z.object({
  poets: z.array(PoetBaseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

// Poetクエリパラメータ
export const PoetQuerySchema = z.object({
  limit: z.string().optional().default("50").transform(Number),
  offset: z.string().optional().default("0").transform(Number),
  ordering: z.string().optional(),
  search: z.string().optional(),
  name_contains: z.string().optional(),
  biography_contains: z.string().optional(),
  created_at_gt: z.string().optional(),
  created_at_lt: z.string().optional(),
  updated_at_gt: z.string().optional(),
  updated_at_lt: z.string().optional(),
});

export type PoetBase = z.infer<typeof PoetBaseSchema>;
export type PoetDetail = z.infer<typeof PoetDetailSchema>;
export type PoetList = z.infer<typeof PoetListSchema>;
export type PoetQuery = z.infer<typeof PoetQuerySchema>;
