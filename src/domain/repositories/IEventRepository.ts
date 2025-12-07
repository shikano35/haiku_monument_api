import type { EventQueryParams } from "../common/QueryParams";
import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from "../entities/Event";

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
