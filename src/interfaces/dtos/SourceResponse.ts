import { z } from "@hono/zod-openapi";

// Source基本スキーマ
export const SourceBaseSchema = z.object({
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

// Source詳細スキーマ
export const SourceDetailSchema = SourceBaseSchema.extend({
  monuments: z.array(z.object({
    id: z.number(),
    canonical_name: z.string(),
    monument_type: z.string().nullable(),
  })).optional(),
});

// Source一覧レスポンス
export const SourceListSchema = z.object({
  sources: z.array(SourceBaseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

// Sourceクエリパラメータ
export const SourceQuerySchema = z.object({
  limit: z.string().optional().default("50").transform(Number),
  offset: z.string().optional().default("0").transform(Number),
  ordering: z.string().optional(),
  search: z.string().optional(),
  title_contains: z.string().optional(),
  author_contains: z.string().optional(),
  created_at_gt: z.string().optional(),
  created_at_lt: z.string().optional(),
  updated_at_gt: z.string().optional(),
  updated_at_lt: z.string().optional(),
});

export type SourceBase = z.infer<typeof SourceBaseSchema>;
export type SourceDetail = z.infer<typeof SourceDetailSchema>;
export type SourceList = z.infer<typeof SourceListSchema>;
export type SourceQuery = z.infer<typeof SourceQuerySchema>;
