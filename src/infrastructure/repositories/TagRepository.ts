import type { ITagRepository } from '../../domain/repositories/ITagRepository';
import type { Tag } from '../../domain/entities/Tag';
import { getDB } from '../db/db';
import { tags } from '../db/schema';
import { eq, and, or, like, asc, desc } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';
import type { QueryParams } from '../../domain/common/QueryParams';

export class TagRepository implements ITagRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(queryParams?: QueryParams): Promise<Tag[]> {
    let query = this.db.select().from(tags);

    if (queryParams) {
      const conditions = [];

      if (queryParams.search) {
        conditions.push(
          or(
            like(tags.name, `%${queryParams.search}%`),
            like(tags.description, `%${queryParams.search}%`)
          )
        );
      }

      if (queryParams.name_contains) {
        conditions.push(like(tags.name, `%${queryParams.name_contains}%`));
      }

      if (queryParams.description_contains) {
        conditions.push(like(tags.description, `%${queryParams.description_contains}%`));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      if (queryParams.ordering?.length) {
        const orderClauses = queryParams.ordering
          .map((order) => {
            const direction = order.startsWith('-') ? 'desc' : 'asc';
            const columnName = order.startsWith('-') ? order.substring(1) : order;

            switch (columnName) {
              case 'name':
                return direction === 'asc' ? asc(tags.name) : desc(tags.name);
              case 'description':
                return direction === 'asc' ? asc(tags.description) : desc(tags.description);
              case 'id':
                return direction === 'asc' ? asc(tags.id) : desc(tags.id);
              default:
                return undefined;
            }
          })
          .filter((clause): clause is Exclude<typeof clause, undefined> => clause !== undefined);

        if (orderClauses.length > 0) {
          query = query.orderBy(...orderClauses) as typeof query;
        }
      }
      if (typeof queryParams.limit === 'number') {
        query = query.limit(queryParams.limit) as typeof query;
      }
      if (typeof queryParams.offset === 'number') {
        query = query.offset(queryParams.offset) as typeof query;
      }
    }
    return await query.all();
  }

  async getById(id: number): Promise<Tag | null> {
    const result = await this.db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1)
      .all();
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
