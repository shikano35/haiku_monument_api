import type { EventQueryParams } from "../common/QueryParams";
import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from "../entities/Event";
import type { IEventRepository } from "../repositories/IEventRepository";

export class EventUseCases {
  constructor(private eventRepository: IEventRepository) {}

  async getAllEvents(queryParams: EventQueryParams = {}): Promise<Event[]> {
    return this.eventRepository.getAll(queryParams);
  }

  async getEventById(id: number): Promise<Event | null> {
    return this.eventRepository.getById(id);
  }

  async getEventsByMonument(monumentId: number): Promise<Event[]> {
    return this.eventRepository.getByMonumentId(monumentId);
  }

  async getEventsByType(eventType: string): Promise<Event[]> {
    return this.eventRepository.getByEventType(eventType);
  }

  async createEvent(eventData: CreateEventInput): Promise<Event> {
    return this.eventRepository.create(eventData);
  }

  async updateEvent(
    id: number,
    eventData: UpdateEventInput,
  ): Promise<Event | null> {
    return this.eventRepository.update(id, eventData);
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.eventRepository.delete(id);
  }

  async getEventCount(): Promise<number> {
    return this.eventRepository.count();
  }
}
