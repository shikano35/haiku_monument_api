import type { IPoetRepository } from '../../domain/repositories/IPoetRepository';
import type { CreatePoetInput, Poet } from '../../domain/entities/Poet';
import { getDB } from '../db/db';
import { poets } from '../db/schema';
import { and, asc, desc, eq, gt, like, lt, or } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';
import type { QueryParams } from '../../domain/common/QueryParams';

const ensureString = (value: string | null): string => {
  return value || "";
};

const convertToPoet = (dbPoet: {
  id: number;
  name: string;
  biography: string | null;
  linkUrl: string | null;
  imageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}): Poet => {
  return {
    id: dbPoet.id,
    name: dbPoet.name,
    biography: dbPoet.biography,
    linkUrl: dbPoet.linkUrl,
    imageUrl: dbPoet.imageUrl,
    createdAt: ensureString(dbPoet.createdAt),
    updatedAt: ensureString(dbPoet.updatedAt),
  };
};

export class PoetRepository implements IPoetRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(queryParams: QueryParams): Promise<Poet[]> {
    let query = this.db.select().from(poets);

    if (queryParams) {
      if (queryParams.name_contains) {
        query = query.where(
          like(poets.name, `%${queryParams.name_contains}%`)
        ) as typeof query;
      }
      if (queryParams.biography_contains) {
        query = query.where(
          like(poets.biography, `%${queryParams.biography_contains}%`)
        ) as typeof query;
      }
      if (queryParams.created_at_gt) {
        query = query.where(
          gt(poets.createdAt, queryParams.created_at_gt)
        ) as typeof query;
      }
      if (queryParams.created_at_lt) {
        query = query.where(
          lt(poets.createdAt, queryParams.created_at_lt)
        ) as typeof query;
      }
      if (queryParams.updated_at_gt) {
        query = query.where(
          gt(poets.updatedAt, queryParams.updated_at_gt)
        ) as typeof query;
      }
      if (queryParams.updated_at_lt) {
        query = query.where(
          lt(poets.updatedAt, queryParams.updated_at_lt)
        ) as typeof query;
      }
      if (queryParams.search) {
        query = query.where(
          or(
            like(poets.name, `%${queryParams.search}%`),
            like(poets.biography, `%${queryParams.search}%`)
          )
        ) as typeof query;
      }

      if (queryParams.ordering && queryParams.ordering.length > 0) {
        for (const order of queryParams.ordering) {
          const direction = order.startsWith('-') ? 'desc' : 'asc';
          const columnName = order.startsWith('-') ? order.substring(1) : order;
          if (columnName === 'name') {
            query = query.orderBy(
              direction === 'asc'
                ? asc(poets.name)
                : desc(poets.name)
            ) as typeof query;
          } else if (columnName === 'created_at') {
            query = query.orderBy(
              direction === 'asc'
                ? asc(poets.createdAt)
                : desc(poets.createdAt)
            ) as typeof query;
          } else if (columnName === 'updated_at') {
            query = query.orderBy(
              direction === 'asc'
                ? asc(poets.updatedAt)
                : desc(poets.updatedAt)
            ) as typeof query;
          }
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
    return results.map(convertToPoet);
  }

  async getById(id: number): Promise<Poet | null> {
    const result = await this.db
      .select()
      .from(poets)
      .where(eq(poets.id, id))
      .limit(1)
      .all();
    
    return result.length > 0 ? convertToPoet(result[0]) : null;
  }

  async create(poetData: CreatePoetInput): Promise<Poet> {
    const [inserted] = await this.db
      .insert(poets)
      .values(poetData)
      .returning();
    
    return convertToPoet(inserted);
  }

  async update(id: number, poetData: Partial<Poet>): Promise<Poet | null> {
    if (!(await this.getById(id))) return null;
    
    const [updated] = await this.db
      .update(poets)
      .set(poetData)
      .where(eq(poets.id, id))
      .returning();
    
    return convertToPoet(updated);
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(poets)
      .where(eq(poets.id, id))
      .returning({ id: poets.id });
    return results.length > 0;
  }
}
