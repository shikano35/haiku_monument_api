import type { IPoetRepository } from '../../domain/repositories/IPoetRepository';
import type { Poet, CreatePoetInput } from '../../domain/entities/Poet';
import { getDB } from '../db/db';
import { poets } from '../db/schema';
import { eq, like, gt, lt, or, asc, desc } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';
import type { QueryParams } from '../../domain/common/QueryParams';

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

    return await query.all();
  }

  async getById(id: number): Promise<Poet | null> {
    const result = await this.db
      .select()
      .from(poets)
      .where(eq(poets.id, id))
      .limit(1)
      .all();
    return result.length > 0 ? result[0] : null;
  }

  async create(poetData: CreatePoetInput): Promise<Poet> {
    const [inserted] = await this.db
      .insert(poets)
      .values(poetData)
      .returning({
        id: poets.id,
        name: poets.name,
        biography: poets.biography,
        links: poets.links,
        imageUrl: poets.imageUrl,
        createdAt: poets.createdAt,
        updatedAt: poets.updatedAt,
      });
    return inserted;
  }

  async update(id: number, poetData: Partial<Poet>): Promise<Poet | null> {
    const exists = await this.getById(id);
    if (!exists) return null;
    const [updated] = await this.db
      .update(poets)
      .set({
        ...poetData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(poets.id, id))
      .returning({
        id: poets.id,
        name: poets.name,
        biography: poets.biography,
        links: poets.links,
        imageUrl: poets.imageUrl,
        createdAt: poets.createdAt,
        updatedAt: poets.updatedAt,
      });
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(poets)
      .where(eq(poets.id, id))
      .returning({ id: poets.id });
    return results.length > 0;
  }
}
