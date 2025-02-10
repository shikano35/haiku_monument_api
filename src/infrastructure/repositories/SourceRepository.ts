import type { ISourceRepository } from '../../domain/repositories/ISourceRepository';
import type { Source } from '../../domain/entities/Source';
import { getDB } from '../db/db';
import { sources } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';

export class SourceRepository implements ISourceRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(): Promise<Source[]> {
    return await this.db.select().from(sources).all();
  }

  async getById(id: number): Promise<Source | null> {
    const result = await this.db.select().from(sources).where(eq(sources.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async create(sourceData: Source): Promise<Source> {
    const [inserted] = await this.db.insert(sources).values(sourceData).returning();
    return inserted;
  }

  async update(id: number, sourceData: Partial<Source>): Promise<Source | null> {
    const exists = await this.getById(id);
    if (!exists) return null;
    const [updated] = await this.db
      .update(sources)
      .set(sourceData)
      .where(eq(sources.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db.delete(sources).where(eq(sources.id, id)).returning();
    return results.length > 0;
  }
}
