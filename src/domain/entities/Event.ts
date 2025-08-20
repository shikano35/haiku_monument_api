import type { Source } from "./Source";

export interface Event {
  id: number;
  monumentId: number;
  eventType: string;
  huTimeNormalized?: string;
  intervalStart?: string;
  intervalEnd?: string;
  uncertaintyNote?: string;
  actor?: string;
  sourceId?: number;
  source?: Source;
  createdAt: string;
}

export interface CreateEventInput {
  monumentId: number;
  eventType: string;
  huTimeNormalized?: string;
  intervalStart?: string;
  intervalEnd?: string;
  uncertaintyNote?: string;
  actor?: string;
  sourceId?: number;
}

export interface UpdateEventInput {
  eventType?: string;
  huTimeNormalized?: string;
  intervalStart?: string;
  intervalEnd?: string;
  uncertaintyNote?: string;
  actor?: string;
  sourceId?: number;
}
