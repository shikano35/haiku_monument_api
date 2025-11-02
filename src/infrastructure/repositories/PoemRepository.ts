import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, like, count, and, desc, asc } from "drizzle-orm";
import type { IPoemRepository } from "../../domain/repositories/IPoemRepository";
import type {
  Poem,
  CreatePoemInput,
  UpdatePoemInput,
} from "../../domain/entities/Poem";
import type { PoemQueryParams } from "../../domain/common/QueryParams";
import {
  poems,
  poemAttributions,
  poets,
  inscriptionPoems,
  inscriptions,
} from "../db/schema";

export class PoemRepository implements IPoemRepository {
  constructor(private db: DrizzleD1Database) {}

  async getAll(queryParams?: PoemQueryParams): Promise<Poem[]> {
    const {
      limit: paramLimit = 50,
      offset: paramOffset = 0,
      ordering: paramOrdering = [],
      search,
      textContains,
      kigo,
      season,
    } = queryParams || {};

    const limit = paramLimit ?? 50;
    const offset = paramOffset ?? 0;
    const ordering = paramOrdering ?? [];

    const baseQuery = this.db.select().from(poems);

    const conditions = [];

    if (kigo) {
      conditions.push(eq(poems.kigo, kigo));
    }

    if (season) {
      conditions.push(eq(poems.season, season));
    }

    // 全文検索
    const searchTerm = textContains || search;
    if (searchTerm) {
      conditions.push(like(poems.text, `%${searchTerm}%`));
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
    return Promise.all(
      results.map(async (row) => this.convertToPoemWithRelations(row)),
    );
  }

  async getById(id: number): Promise<Poem | null> {
    const results = await this.db.select().from(poems).where(eq(poems.id, id));

    return results.length > 0
      ? await this.convertToPoemWithRelations(results[0])
      : null;
  }

  async getByText(text: string): Promise<Poem | null> {
    const results = await this.db
      .select()
      .from(poems)
      .where(eq(poems.text, text));

    return results.length > 0
      ? await this.convertToPoemWithRelations(results[0])
      : null;
  }

  async getByNormalizedText(normalizedText: string): Promise<Poem | null> {
    const results = await this.db
      .select()
      .from(poems)
      .where(eq(poems.normalizedText, normalizedText));

    return results.length > 0
      ? await this.convertToPoemWithRelations(results[0])
      : null;
  }

  async getBySeason(season: string): Promise<Poem[]> {
    const results = await this.db
      .select()
      .from(poems)
      .where(eq(poems.season, season));

    return Promise.all(
      results.map(async (row) => this.convertToPoemWithRelations(row)),
    );
  }

  async getByKigo(kigo: string): Promise<Poem[]> {
    const results = await this.db
      .select()
      .from(poems)
      .where(like(poems.kigo, `%${kigo}%`));

    return Promise.all(
      results.map(async (row) => this.convertToPoemWithRelations(row)),
    );
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
      inscriptions: null,
      createdAt: this.convertToISOString(row.createdAt),
      updatedAt: this.convertToISOString(row.updatedAt),
    };
  }

  private async convertToPoemWithRelations(
    row: typeof poems.$inferSelect,
  ): Promise<Poem> {
    const relatedAttributions = await this.db
      .select({
        id: poemAttributions.id,
        poemId: poemAttributions.poemId,
        poetId: poemAttributions.poetId,
        confidence: poemAttributions.confidence,
        confidenceScore: poemAttributions.confidenceScore,
        sourceId: poemAttributions.sourceId,
        createdAt: poemAttributions.createdAt,
        poetName: poets.name,
        poetNameKana: poets.nameKana,
        poetBiography: poets.biography,
        poetBirthYear: poets.birthYear,
        poetDeathYear: poets.deathYear,
        poetLinkUrl: poets.linkUrl,
        poetImageUrl: poets.imageUrl,
        poetCreatedAt: poets.createdAt,
        poetUpdatedAt: poets.updatedAt,
      })
      .from(poemAttributions)
      .innerJoin(poets, eq(poemAttributions.poetId, poets.id))
      .where(eq(poemAttributions.poemId, row.id));

    const relatedInscriptions = await this.db
      .select({
        id: inscriptions.id,
        monumentId: inscriptions.monumentId,
        side: inscriptions.side,
        originalText: inscriptions.originalText,
        transliteration: inscriptions.transliteration,
        reading: inscriptions.reading,
        language: inscriptions.language,
        notes: inscriptions.notes,
        sourceId: inscriptions.sourceId,
        createdAt: inscriptions.createdAt,
        updatedAt: inscriptions.updatedAt,
      })
      .from(inscriptionPoems)
      .innerJoin(
        inscriptions,
        eq(inscriptionPoems.inscriptionId, inscriptions.id),
      )
      .where(eq(inscriptionPoems.poemId, row.id));

    return {
      id: row.id,
      text: row.text,
      normalizedText: row.normalizedText,
      textHash: row.textHash,
      kigo: row.kigo ?? null,
      season: row.season ?? null,
      attributions: relatedAttributions.map((attr) => ({
        id: attr.id,
        poemId: attr.poemId,
        poetId: attr.poetId,
        confidence: attr.confidence ?? "certain",
        confidenceScore: attr.confidenceScore ?? 1.0,
        sourceId: attr.sourceId,
        createdAt: this.convertToISOString(attr.createdAt),
        poet: {
          id: attr.poetId,
          name: attr.poetName,
          nameKana: attr.poetNameKana,
          biography: attr.poetBiography,
          birthYear: attr.poetBirthYear,
          deathYear: attr.poetDeathYear,
          linkUrl: attr.poetLinkUrl,
          imageUrl: attr.poetImageUrl,
          createdAt: this.convertToISOString(attr.poetCreatedAt),
          updatedAt: this.convertToISOString(attr.poetUpdatedAt),
        },
        source: null,
      })),
      inscriptions: relatedInscriptions.map((ins) => ({
        id: ins.id,
        monumentId: ins.monumentId,
        side: ins.side,
        originalText: ins.originalText,
        transliteration: ins.transliteration,
        reading: ins.reading,
        language: ins.language ?? "ja",
        notes: ins.notes,
        sourceId: ins.sourceId,
        createdAt: this.convertToISOString(ins.createdAt),
        updatedAt: this.convertToISOString(ins.updatedAt),
        poems: null,
        monument: null,
        source: null,
      })),
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
