import type { Source } from "./Source";

export interface Event {
  id: number;
  monumentId: number;
  eventType: string;
  huTimeNormalized: string | null;
  intervalStart: string | null;
  intervalEnd: string | null;
  uncertaintyNote: string | null;
  actor: string | null;
  sourceId: number | null;
  source: Source | null;
  createdAt: string;
}

export interface CreateEventInput {
  monumentId: number;
  eventType: string;
  huTimeNormalized: string | null;
  intervalStart: string | null;
  intervalEnd: string | null;
  uncertaintyNote: string | null;
  actor: string | null;
  sourceId: number | null;
}

export interface UpdateEventInput {
  eventType: string | null;
  huTimeNormalized: string | null;
  intervalStart: string | null;
  intervalEnd: string | null;
  uncertaintyNote: string | null;
  actor: string | null;
  sourceId: number | null;
}
