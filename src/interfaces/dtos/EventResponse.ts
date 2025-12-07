import { z } from "@hono/zod-openapi";

export const EventBaseSchema = z.object({
  id: z.number(),
  monument_id: z.number(),
  event_type: z.string(),
  hu_time_normalized: z.string().nullable(),
  interval_start: z.string().nullable(),
  interval_end: z.string().nullable(),
  uncertainty_note: z.string().nullable(),
  actor: z.string().nullable(),
  source_id: z.number().nullable(),
  created_at: z.string(),
});

export const EventDetailSchema = EventBaseSchema.extend({
  monument: z
    .object({
      id: z.number(),
      canonical_name: z.string(),
    })
    .nullable(),
  source: z
    .object({
      id: z.number(),
      title: z.string(),
      url: z.string().nullable(),
    })
    .nullable(),
});

export const EventListSchema = z.object({
  events: z.array(EventBaseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const EventQuerySchema = z.object({
  limit: z.string().optional().default("50").transform(Number),
  offset: z.string().optional().default("0").transform(Number),
  ordering: z.string().optional(),
  search: z.string().optional(),
  monument_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : null)),
  event_type: z.string().optional(),
  actor: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});

export type EventBase = z.infer<typeof EventBaseSchema>;
export type EventDetail = z.infer<typeof EventDetailSchema>;
export type EventList = z.infer<typeof EventListSchema>;
export type EventQuery = z.infer<typeof EventQuerySchema>;
