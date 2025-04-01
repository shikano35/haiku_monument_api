import type { ISourceRepository } from '../../domain/repositories/ISourceRepository';
import type { CreateSourceInput, Source } from '../../domain/entities/Source';
import { getDB } from '../db/db';
import { sources } from '../db/schema';
import {
  eq,
  and,
  or,
  like,
  asc,
  desc,
  gt,
  lt,
} from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';
import type { QueryParams } from '../../domain/common/QueryParams';

export class SourceRepository implements ISourceRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(queryParams: QueryParams): Promise<Source[]> {
    let query = this.db.select().from(sources);

    if (queryParams) {
      const conditions = [];

      if (queryParams.title_contains) {
        conditions.push(like(sources.title, `%${queryParams.title_contains}%`));
      }

      if (queryParams.search) {
        conditions.push(
          or(
            like(sources.title, `%${queryParams.search}%`),
            like(sources.publisher, `%${queryParams.search}%`),
            like(sources.author, `%${queryParams.search}%`)
          )
        );
      }
      if (queryParams.name_contains) {
        conditions.push(like(sources.author, `%${queryParams.name_contains}%`));
      }
      if (queryParams.created_at_gt) {
        conditions.push(gt(sources.createdAt, queryParams.created_at_gt));
      }
      if (queryParams.created_at_lt) {
        conditions.push(lt(sources.createdAt, queryParams.created_at_lt));
      }
      if (queryParams.updated_at_gt) {
        conditions.push(gt(sources.updatedAt, queryParams.updated_at_gt));
      }
      if (queryParams.updated_at_lt) {
        conditions.push(lt(sources.updatedAt, queryParams.updated_at_lt));
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
              case 'title':
                return direction === 'asc' ? asc(sources.title) : desc(sources.title);
              case 'author':
                return direction === 'asc' ? asc(sources.author) : desc(sources.author);
              case 'year':
                return direction === 'asc' ? asc(sources.year) : desc(sources.year);
              case 'publisher':
                return direction === 'asc' ? asc(sources.publisher) : desc(sources.publisher);
              case 'created_at':
              case 'createdAt':
                return direction === 'asc' ? asc(sources.createdAt) : desc(sources.createdAt);
              case 'updated_at':
              case 'updatedAt':
                return direction === 'asc' ? asc(sources.updatedAt) : desc(sources.updatedAt);
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

  async getById(id: number): Promise<Source | null> {
    const result = await this.db
      .select()
      .from(sources)
      .where(eq(sources.id, id))
      .limit(1)
      .all();
    return result.length > 0 ? result[0] : null;
  }

  async create(sourceData: CreateSourceInput): Promise<Source> {
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
