import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, like, count, and, desc, asc } from "drizzle-orm";
import type { IPoemRepository } from "../../domain/repositories/IPoemRepository";
import type {
  Poem,
  CreatePoemInput,
  UpdatePoemInput,
} from "../../domain/entities/Poem";
import type { PoemQueryParams } from "../../domain/common/QueryParams";
import { poems } from "../db/schema";

export class PoemRepository implements IPoemRepository {
  constructor(private db: DrizzleD1Database) {}

  async getAll(queryParams?: PoemQueryParams): Promise<Poem[]> {
    const {
      limit = 50,
      offset = 0,
      ordering = [],
      search,
      kigo,
      season,
    } = queryParams || {};

    let baseQuery = this.db.select().from(poems);

    const conditions = [];

    if (kigo) {
      conditions.push(eq(poems.kigo, kigo));
    }

    if (season) {
      conditions.push(eq(poems.season, season));
    }

    // 全文検索
    if (search) {
      conditions.push(like(poems.text, `%${search}%`));
    }

    let query = baseQuery;
    if (conditions.length > 0) {
      query = baseQuery.where(and(...conditions)) as typeof baseQuery;
    }

    if (ordering.length > 0) {
      const orderClauses = ordering.map((order) => {
        const isDesc = order.startsWith("-");
        const field = isDesc ? order.slice(1) : order;

        switch (field) {
          case "text":
            return isDesc ? desc(poems.text) : asc(poems.text);
          case "kigo":
            return isDesc ? desc(poems.kigo) : asc(poems.kigo);
          case "season":
            return isDesc ? desc(poems.season) : asc(poems.season);
          case "createdAt":
            return isDesc ? desc(poems.createdAt) : asc(poems.createdAt);
          case "updatedAt":
            return isDesc ? desc(poems.updatedAt) : asc(poems.updatedAt);
          default:
            return asc(poems.id);
        }
      });
      query = query.orderBy(...orderClauses) as typeof query;
    }

    const results = await query.limit(limit).offset(offset);
    return results.map(this.convertToPoem);
  }

  async getById(id: number): Promise<Poem | null> {
    const results = await this.db.select().from(poems).where(eq(poems.id, id));

    return results.length > 0 ? this.convertToPoem(results[0]) : null;
  }

  async getByText(text: string): Promise<Poem | null> {
    const results = await this.db
      .select()
      .from(poems)
      .where(eq(poems.text, text));

    return results.length > 0 ? this.convertToPoem(results[0]) : null;
  }

  async getByNormalizedText(normalizedText: string): Promise<Poem | null> {
    const results = await this.db
      .select()
      .from(poems)
      .where(eq(poems.normalizedText, normalizedText));

    return results.length > 0 ? this.convertToPoem(results[0]) : null;
  }

  async getBySeason(season: string): Promise<Poem[]> {
    const results = await this.db
      .select()
      .from(poems)
      .where(eq(poems.season, season));

    return results.map(this.convertToPoem);
  }

  async getByKigo(kigo: string): Promise<Poem[]> {
    const results = await this.db
      .select()
      .from(poems)
      .where(like(poems.kigo, `%${kigo}%`));

    return results.map(this.convertToPoem);
  }

  async create(poem: CreatePoemInput): Promise<Poem> {
    const results = await this.db
      .insert(poems)
      .values({
        text: poem.text,
        normalizedText: poem.normalizedText,
        textHash: poem.textHash,
        kigo: poem.kigo,
        season: poem.season,
      })
      .returning();

    return this.convertToPoem(results[0]);
  }

  async update(id: number, poem: UpdatePoemInput): Promise<Poem | null> {
    const updateData: Record<string, unknown> = {};

    if (poem.text !== null) updateData.text = poem.text;
    if (poem.normalizedText !== null)
      updateData.normalizedText = poem.normalizedText;
    if (poem.textHash !== null) updateData.textHash = poem.textHash;
    if (poem.kigo !== null) updateData.kigo = poem.kigo;
    if (poem.season !== null) updateData.season = poem.season;

    const results = await this.db
      .update(poems)
      .set(updateData)
      .where(eq(poems.id, id))
      .returning();

    return results.length > 0 ? this.convertToPoem(results[0]) : null;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(poems)
      .where(eq(poems.id, id))
      .returning();

    return results.length > 0;
  }

  async count(): Promise<number> {
    const results = await this.db.select({ count: count() }).from(poems);

    return results[0]?.count ?? 0;
  }

  private convertToPoem(row: typeof poems.$inferSelect): Poem {
    return {
      id: row.id,
      text: row.text,
      normalizedText: row.normalizedText,
      textHash: row.textHash,
      kigo: row.kigo ?? null,
      season: row.season ?? null,
      attributions: null,
      createdAt: this.convertToISOString(row.createdAt),
      updatedAt: this.convertToISOString(row.updatedAt),
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
