import type { IAuthorRepository } from '../../domain/repositories/IAuthorRepository';
import type { Author } from '../../domain/entities/Author';
import { getDB } from '../db/db';
import { authors } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';

export class AuthorRepository implements IAuthorRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(): Promise<Author[]> {
    return await this.db.select().from(authors).all();
  }

  async getById(id: number): Promise<Author | null> {
    const result = await this.db.select().from(authors).where(eq(authors.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async create(authorData: Author): Promise<Author> {
    const [inserted] = await this.db.insert(authors).values(authorData).returning();
    return inserted;
  }

  async update(id: number, authorData: Partial<Author>): Promise<Author | null> {
    const exists = await this.getById(id);
    if (!exists) return null;
    const [updated] = await this.db
      .update(authors)
      .set(authorData)
      .where(eq(authors.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db.delete(authors).where(eq(authors.id, id)).returning();
    return results.length > 0;
  }
}
