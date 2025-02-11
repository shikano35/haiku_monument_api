import type { IHaikuMonumentRepository } from '../../domain/repositories/IHaikuMonumentRepository';
import type { HaikuMonument } from '../../domain/entities/HaikuMonument';
import { getDB } from '../db/db';
import { haikuMonument, authors, sources, locations } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';

export class HaikuMonumentRepository implements IHaikuMonumentRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(): Promise<HaikuMonument[]> {
    const results = await this.db
      .select({
        id: haikuMonument.id,
        text: haikuMonument.text,
        authorId: haikuMonument.authorId,
        sourceId: haikuMonument.sourceId,
        locationId: haikuMonument.locationId,
        establishedDate: haikuMonument.establishedDate,
        commentary: haikuMonument.commentary,
        imageUrl: haikuMonument.imageUrl,
        createdAt: haikuMonument.createdAt,
        updatedAt: haikuMonument.updatedAt,
        author: authors,
        source: sources,
        location: locations,
      })
      .from(haikuMonument)
      .leftJoin(authors, eq(haikuMonument.authorId, authors.id))
      .leftJoin(sources, eq(haikuMonument.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonument.locationId, locations.id));
    return results;
  }

  async getById(id: number): Promise<HaikuMonument | null> {
    const result = await this.db
      .select({
        id: haikuMonument.id,
        text: haikuMonument.text,
        authorId: haikuMonument.authorId,
        sourceId: haikuMonument.sourceId,
        locationId: haikuMonument.locationId,
        establishedDate: haikuMonument.establishedDate,
        commentary: haikuMonument.commentary,
        imageUrl: haikuMonument.imageUrl,
        createdAt: haikuMonument.createdAt,
        updatedAt: haikuMonument.updatedAt,
        author: authors,
        source: sources,
        location: locations,
      })
      .from(haikuMonument)
      .leftJoin(authors, eq(haikuMonument.authorId, authors.id))
      .leftJoin(sources, eq(haikuMonument.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonument.locationId, locations.id))
      .where(eq(haikuMonument.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async create(monumentData: HaikuMonument): Promise<HaikuMonument> {
    const [inserted] = await this.db.insert(haikuMonument).values(monumentData).returning();
    return inserted;
  }

  async update(id: number, monumentData: Partial<HaikuMonument>): Promise<HaikuMonument | null> {
    const exists = await this.getById(id);
    if (!exists) return null;
    const [updated] = await this.db
      .update(haikuMonument)
      .set(monumentData)
      .where(eq(haikuMonument.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db.delete(haikuMonument).where(eq(haikuMonument.id, id)).returning();
    return results.length > 0;
  }
}
