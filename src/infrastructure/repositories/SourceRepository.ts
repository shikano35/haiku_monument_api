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

const ensureNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

const ensureString = (value: string | null): string => {
  return value || "";
};

const convertToSource = (dbSource: {
  id: number;
  title: string;
  author: string | null;
  publisher: string | null;
  sourceYear: number | null;
  url: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}): Source => {
  return {
    id: dbSource.id,
    title: dbSource.title,
    author: dbSource.author,
    publisher: dbSource.publisher,
    sourceYear: dbSource.sourceYear,
    url: dbSource.url,
    createdAt: ensureString(dbSource.createdAt),
    updatedAt: ensureString(dbSource.updatedAt),
  };
};

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
                return direction === 'asc' ? asc(sources.sourceYear) : desc(sources.sourceYear);
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

    const results = await query.all();
    return results.map(convertToSource);
  }

  async getById(id: number): Promise<Source | null> {
    const result = await this.db
      .select()
      .from(sources)
      .where(eq(sources.id, id))
      .limit(1)
      .all();
    return result.length > 0 ? convertToSource(result[0]) : null;
  }

  async create(sourceData: CreateSourceInput): Promise<Source> {
    const dataToInsert = {
      ...sourceData,
      sourceYear: ensureNumberOrNull(sourceData.sourceYear),
    };

    const [inserted] = await this.db
      .insert(sources)
      .values(dataToInsert)
      .returning();
    
    return convertToSource(inserted);
  }

  async update(id: number, sourceData: Partial<Source>): Promise<Source | null> {
    if (!(await this.getById(id))) return null;
    
    const dataToUpdate = {
      ...sourceData,
      sourceYear: sourceData.sourceYear !== undefined 
        ? ensureNumberOrNull(sourceData.sourceYear) 
        : undefined,
    };

    const [updated] = await this.db
      .update(sources)
      .set(dataToUpdate)
      .where(eq(sources.id, id))
      .returning();
    
    return convertToSource(updated);
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(sources)
      .where(eq(sources.id, id))
      .returning({ id: sources.id });
    return results.length > 0;
  }
}
