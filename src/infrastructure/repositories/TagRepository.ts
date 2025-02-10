import type { ITagRepository } from '../../domain/repositories/ITagRepository';
import type { Tag } from '../../domain/entities/Tag';
import { getDB } from '../db/db';
import { tags } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';

export class TagRepository implements ITagRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(): Promise<Tag[]> {
    return await this.db.select().from(tags).all();
  }

  async getById(id: number): Promise<Tag | null> {
    const result = await this.db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async create(tagData: Tag): Promise<Tag> {
    const [inserted] = await this.db.insert(tags).values(tagData).returning();
    return inserted;
  }

  async update(id: number, tagData: Partial<Tag>): Promise<Tag | null> {
    const exists = await this.getById(id);
    if (!exists) return null;
    const [updated] = await this.db
      .update(tags)
      .set(tagData)
      .where(eq(tags.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db.delete(tags).where(eq(tags.id, id)).returning();
    return results.length > 0;
  }
}
