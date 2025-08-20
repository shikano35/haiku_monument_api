import type {
  Event,
  CreateEventInput,
  UpdateEventInput,
} from "../entities/Event";
import type { EventQueryParams } from "../common/QueryParams";

export interface IEventRepository {
  getAll(queryParams?: EventQueryParams): Promise<Event[]>;
  getById(id: number): Promise<Event | null>;
  getByMonumentId(monumentId: number): Promise<Event[]>;
  getByEventType(eventType: string): Promise<Event[]>;
  create(eventData: CreateEventInput): Promise<Event>;
  update(id: number, eventData: UpdateEventInput): Promise<Event | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
}
