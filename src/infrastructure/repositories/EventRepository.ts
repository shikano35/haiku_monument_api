import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, count, and, like, desc, asc } from "drizzle-orm";
import type { IEventRepository } from "../../domain/repositories/IEventRepository";
import type {
  Event,
  CreateEventInput,
  UpdateEventInput,
} from "../../domain/entities/Event";
import type { EventQueryParams } from "../../domain/common/QueryParams";
import { events } from "../db/schema";

export class EventRepository implements IEventRepository {
  constructor(private db: DrizzleD1Database) {}

  async getAll(queryParams?: EventQueryParams): Promise<Event[]> {
    const {
      limit = 50,
      offset = 0,
      ordering = [],
      search,
      monumentId,
      eventType,
      sourceId,
    } = queryParams || {};

    const conditions = [];

    if (monumentId) {
      conditions.push(eq(events.monumentId, monumentId));
    }

    if (eventType) {
      conditions.push(eq(events.eventType, eventType));
    }

    if (sourceId) {
      conditions.push(eq(events.sourceId, sourceId));
    }

    // 全文検索
    if (search) {
      conditions.push(like(events.eventType, `%${search}%`));
    }

    // 順序付けの設定
    const orderClauses = ordering.map((order) => {
      const isDesc = order.startsWith("-");
      const field = isDesc ? order.slice(1) : order;

      switch (field) {
        case "monumentId":
          return isDesc ? desc(events.monumentId) : asc(events.monumentId);
        case "eventType":
          return isDesc ? desc(events.eventType) : asc(events.eventType);
        case "intervalStart":
          return isDesc
            ? desc(events.intervalStart)
            : asc(events.intervalStart);
        case "intervalEnd":
          return isDesc ? desc(events.intervalEnd) : asc(events.intervalEnd);
        case "createdAt":
          return isDesc ? desc(events.createdAt) : asc(events.createdAt);
        default:
          return asc(events.id);
      }
    });

    // クエリ構築
    let results;
    if (conditions.length > 0 && orderClauses.length > 0) {
      results = await this.db
        .select()
        .from(events)
        .where(and(...conditions))
        .orderBy(...orderClauses)
        .limit(limit)
        .offset(offset);
    } else if (conditions.length > 0) {
      results = await this.db
        .select()
        .from(events)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);
    } else if (orderClauses.length > 0) {
      results = await this.db
        .select()
        .from(events)
        .orderBy(...orderClauses)
        .limit(limit)
        .offset(offset);
    } else {
      results = await this.db.select().from(events).limit(limit).offset(offset);
    }

    return results.map(this.convertToEvent);
  }

  async getById(id: number): Promise<Event | null> {
    const results = await this.db
      .select()
      .from(events)
      .where(eq(events.id, id));

    return results.length > 0 ? this.convertToEvent(results[0]) : null;
  }

  async getByMonumentId(monumentId: number): Promise<Event[]> {
    const results = await this.db
      .select()
      .from(events)
      .where(eq(events.monumentId, monumentId));

    return results.map(this.convertToEvent);
  }

  async getByEventType(eventType: string): Promise<Event[]> {
    const results = await this.db
      .select()
      .from(events)
      .where(eq(events.eventType, eventType));

    return results.map(this.convertToEvent);
  }

  async create(event: CreateEventInput): Promise<Event> {
    const results = await this.db
      .insert(events)
      .values({
        monumentId: event.monumentId,
        eventType: event.eventType,
        huTimeNormalized: event.huTimeNormalized,
        intervalStart: event.intervalStart,
        intervalEnd: event.intervalEnd,
        uncertaintyNote: event.uncertaintyNote,
        actor: event.actor,
        sourceId: event.sourceId,
      })
      .returning();

    return this.convertToEvent(results[0]);
  }

  async update(id: number, event: UpdateEventInput): Promise<Event | null> {
    const updateData: Record<string, unknown> = {};

    if (event.eventType !== null) updateData.eventType = event.eventType;
    if (event.huTimeNormalized !== null)
      updateData.huTimeNormalized = event.huTimeNormalized;
    if (event.intervalStart !== null)
      updateData.intervalStart = event.intervalStart;
    if (event.intervalEnd !== null) updateData.intervalEnd = event.intervalEnd;
    if (event.uncertaintyNote !== null)
      updateData.uncertaintyNote = event.uncertaintyNote;
    if (event.actor !== null) updateData.actor = event.actor;
    if (event.sourceId !== null) updateData.sourceId = event.sourceId;

    const results = await this.db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    return results.length > 0 ? this.convertToEvent(results[0]) : null;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(events)
      .where(eq(events.id, id))
      .returning();

    return results.length > 0;
  }

  async count(): Promise<number> {
    const results = await this.db.select({ count: count() }).from(events);

    return results[0]?.count ?? 0;
  }

  private convertToEvent(row: typeof events.$inferSelect): Event {
    return {
      id: row.id,
      monumentId: row.monumentId,
      eventType: row.eventType,
      huTimeNormalized: row.huTimeNormalized ?? null,
      intervalStart: row.intervalStart ?? null,
      intervalEnd: row.intervalEnd ?? null,
      uncertaintyNote: row.uncertaintyNote ?? null,
      actor: row.actor ?? null,
      sourceId: row.sourceId ?? null,
      source: null,
      createdAt: this.convertToISOString(row.createdAt),
    };
  }

  private convertToISOString(dateString: string): string {
    try {
      return new Date(dateString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}
