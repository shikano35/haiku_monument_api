import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, count, and, like, desc, asc } from "drizzle-orm";
import type { IInscriptionRepository } from "../../domain/repositories/IInscriptionRepository";
import type {
  Inscription,
  CreateInscriptionInput,
  UpdateInscriptionInput,
} from "../../domain/entities/Inscription";
import type { InscriptionQueryParams } from "../../domain/common/QueryParams";
import { 
  inscriptions, 
  inscriptionPoems, 
  poems, 
  monuments, 
  sources 
} from "../db/schema";

export class InscriptionRepository implements IInscriptionRepository {
  constructor(private db: DrizzleD1Database) {}

  async getAll(queryParams?: InscriptionQueryParams): Promise<Inscription[]> {
    const {
      limit: paramLimit = 50,
      offset: paramOffset = 0,
      ordering: paramOrdering = [],
      search,
      monumentId,
      side,
      language,
      sourceId,
    } = queryParams || {};

    const limit = paramLimit ?? 50;
    const offset = paramOffset ?? 0;
    const ordering = paramOrdering ?? [];

    const conditions = [];

    if (monumentId) {
      conditions.push(eq(inscriptions.monumentId, monumentId));
    }

    if (side) {
      conditions.push(eq(inscriptions.side, side));
    }

    if (language) {
      conditions.push(eq(inscriptions.language, language));
    }

    if (sourceId) {
      conditions.push(eq(inscriptions.sourceId, sourceId));
    }

    // 全文検索
    if (search) {
      conditions.push(like(inscriptions.originalText, `%${search}%`));
    }

    // 順序付けの設定
    const orderClauses = ordering.map((order) => {
      const isDesc = order.startsWith("-");
      const field = isDesc ? order.slice(1) : order;

      switch (field) {
        case "monumentId":
          return isDesc
            ? desc(inscriptions.monumentId)
            : asc(inscriptions.monumentId);
        case "side":
          return isDesc ? desc(inscriptions.side) : asc(inscriptions.side);
        case "language":
          return isDesc
            ? desc(inscriptions.language)
            : asc(inscriptions.language);
        case "createdAt":
          return isDesc
            ? desc(inscriptions.createdAt)
            : asc(inscriptions.createdAt);
        case "updatedAt":
          return isDesc
            ? desc(inscriptions.updatedAt)
            : asc(inscriptions.updatedAt);
        default:
          return asc(inscriptions.id);
      }
    });

    // クエリ構築
    let results;
    if (conditions.length > 0 && orderClauses.length > 0) {
      results = await this.db
        .select()
        .from(inscriptions)
        .where(and(...conditions))
        .orderBy(...orderClauses)
        .limit(limit)
        .offset(offset);
    } else if (conditions.length > 0) {
      results = await this.db
        .select()
        .from(inscriptions)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);
    } else if (orderClauses.length > 0) {
      results = await this.db
        .select()
        .from(inscriptions)
        .orderBy(...orderClauses)
        .limit(limit)
        .offset(offset);
    } else {
      results = await this.db
        .select()
        .from(inscriptions)
        .limit(limit)
        .offset(offset);
    }

    return Promise.all(results.map(async (row) => this.convertToInscriptionWithRelations(row)));
  }

  async getById(id: number): Promise<Inscription | null> {
    const results = await this.db
      .select()
      .from(inscriptions)
      .where(eq(inscriptions.id, id));

    return results.length > 0 ? await this.convertToInscriptionWithRelations(results[0]) : null;
  }

  async getByMonumentId(monumentId: number): Promise<Inscription[]> {
    const results = await this.db
      .select()
      .from(inscriptions)
      .where(eq(inscriptions.monumentId, monumentId));

    return Promise.all(results.map(async (row) => this.convertToInscriptionWithRelations(row)));
  }

  async create(inscription: CreateInscriptionInput): Promise<Inscription> {
    const results = await this.db
      .insert(inscriptions)
      .values({
        monumentId: inscription.monumentId,
        side: inscription.side,
        originalText: inscription.originalText,
        transliteration: inscription.transliteration,
        reading: inscription.reading,
        language: inscription.language,
        notes: inscription.notes,
        sourceId: inscription.sourceId,
      })
      .returning();

    return this.convertToInscription(results[0]);
  }

  async update(
    id: number,
    inscription: UpdateInscriptionInput,
  ): Promise<Inscription | null> {
    const updateData: Record<string, unknown> = {};

    if (inscription.side !== null) updateData.side = inscription.side;
    if (inscription.originalText !== null)
      updateData.originalText = inscription.originalText;
    if (inscription.transliteration !== null)
      updateData.transliteration = inscription.transliteration;
    if (inscription.reading !== null) updateData.reading = inscription.reading;
    if (inscription.language !== null)
      updateData.language = inscription.language;
    if (inscription.notes !== null) updateData.notes = inscription.notes;
    if (inscription.sourceId !== null)
      updateData.sourceId = inscription.sourceId;

    const results = await this.db
      .update(inscriptions)
      .set(updateData)
      .where(eq(inscriptions.id, id))
      .returning();

    return results.length > 0 ? this.convertToInscription(results[0]) : null;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(inscriptions)
      .where(eq(inscriptions.id, id))
      .returning();

    return results.length > 0;
  }

  async count(): Promise<number> {
    const results = await this.db.select({ count: count() }).from(inscriptions);

    return results[0]?.count ?? 0;
  }

  private convertToInscription(
    row: typeof inscriptions.$inferSelect,
  ): Inscription {
    return {
      id: row.id,
      monumentId: row.monumentId,
      side: row.side,
      originalText: row.originalText ?? null,
      transliteration: row.transliteration ?? null,
      reading: row.reading ?? null,
      language: row.language ?? "ja",
      notes: row.notes ?? null,
      sourceId: row.sourceId ?? null,
      poems: null,
      monument: null,
      source: null,
      createdAt: this.convertToISOString(row.createdAt),
      updatedAt: this.convertToISOString(row.updatedAt),
    };
  }

  private async convertToInscriptionWithRelations(
    row: typeof inscriptions.$inferSelect,
  ): Promise<Inscription> {
    const relatedPoems = await this.db
      .select({
        id: poems.id,
        text: poems.text,
        normalizedText: poems.normalizedText,
        textHash: poems.textHash,
        kigo: poems.kigo,
        season: poems.season,
        createdAt: poems.createdAt,
        updatedAt: poems.updatedAt,
      })
      .from(poems)
      .innerJoin(inscriptionPoems, eq(poems.id, inscriptionPoems.poemId))
      .where(eq(inscriptionPoems.inscriptionId, row.id));

    const relatedMonument = row.monumentId
      ? await this.db
          .select()
          .from(monuments)
          .where(eq(monuments.id, row.monumentId))
          .limit(1)
      : [];

    const relatedSource = row.sourceId
      ? await this.db
          .select()
          .from(sources)
          .where(eq(sources.id, row.sourceId))
          .limit(1)
      : [];

    return {
      id: row.id,
      monumentId: row.monumentId,
      side: row.side,
      originalText: row.originalText ?? null,
      transliteration: row.transliteration ?? null,
      reading: row.reading ?? null,
      language: row.language ?? "ja",
      notes: row.notes ?? null,
      sourceId: row.sourceId ?? null,
      poems: relatedPoems.map(poem => ({
        id: poem.id,
        text: poem.text,
        normalizedText: poem.normalizedText,
        textHash: poem.textHash,
        kigo: poem.kigo,
        season: poem.season,
        attributions: null,
        inscriptions: null,
        createdAt: this.convertToISOString(poem.createdAt),
        updatedAt: this.convertToISOString(poem.updatedAt),
      })),
      monument: relatedMonument.length > 0 
        ? {
            id: relatedMonument[0].id,
            canonicalName: relatedMonument[0].canonicalName,
            canonicalUri: `https://api.kuhiapi.com/monuments/${relatedMonument[0].id}`,
            monumentType: relatedMonument[0].monumentType,
            monumentTypeUri: relatedMonument[0].monumentTypeUri,
            material: relatedMonument[0].material,
            materialUri: relatedMonument[0].materialUri,
            createdAt: this.convertToISOString(relatedMonument[0].createdAt),
            updatedAt: this.convertToISOString(relatedMonument[0].updatedAt),
            inscriptions: null,
            events: null,
            media: null,
            locations: null,
            poets: null,
            sources: null,
            originalEstablishedDate: null,
            huTimeNormalized: null,
            intervalStart: null,
            intervalEnd: null,
            uncertaintyNote: null,
          }
        : null,
      source: relatedSource.length > 0
        ? {
            id: relatedSource[0].id,
            citation: relatedSource[0].citation,
            author: relatedSource[0].author,
            title: relatedSource[0].title,
            publisher: relatedSource[0].publisher,
            sourceYear: relatedSource[0].sourceYear,
            url: relatedSource[0].url,
            monuments: null,
            createdAt: this.convertToISOString(relatedSource[0].createdAt),
            updatedAt: this.convertToISOString(relatedSource[0].updatedAt),
          }
        : null,
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
