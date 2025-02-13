import type { IAuthorRepository } from '../../domain/repositories/IAuthorRepository';
import type { Author } from '../../domain/entities/Author';
import { getDB } from '../db/db';
import { authors } from '../db/schema';
import { eq, like, gt, lt, or, asc, desc } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';
import type { QueryParams } from '../../domain/common/QueryParams';

export class AuthorRepository implements IAuthorRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(queryParams?: QueryParams): Promise<Author[]> {
    let query = this.db.select().from(authors);

    if (queryParams) {
      if (queryParams.name_contains) {
        query = query.where(
          like(authors.name, `%${queryParams.name_contains}%`)
        ) as typeof query;
      }
      if (queryParams.biography_contains) {
        query = query.where(
          like(authors.biography, `%${queryParams.biography_contains}%`)
        ) as typeof query;
      }
      if (queryParams.created_at_gt) {
        query = query.where(
          gt(authors.createdAt, queryParams.created_at_gt)
        ) as typeof query;
      }
      if (queryParams.created_at_lt) {
        query = query.where(
          lt(authors.createdAt, queryParams.created_at_lt)
        ) as typeof query;
      }
      if (queryParams.updated_at_gt) {
        query = query.where(
          gt(authors.updatedAt, queryParams.updated_at_gt)
        ) as typeof query;
      }
      if (queryParams.updated_at_lt) {
        query = query.where(
          lt(authors.updatedAt, queryParams.updated_at_lt)
        ) as typeof query;
      }
      if (queryParams.search) {
        query = query.where(
          or(
            like(authors.name, `%${queryParams.search}%`),
            like(authors.biography, `%${queryParams.search}%`)
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
                ? asc(authors.name)
                : desc(authors.name)
            ) as typeof query;
          } else if (columnName === 'created_at') {
            query = query.orderBy(
              direction === 'asc'
                ? asc(authors.createdAt)
                : desc(authors.createdAt)
            ) as typeof query;
          } else if (columnName === 'updated_at') {
            query = query.orderBy(
              direction === 'asc'
                ? asc(authors.updatedAt)
                : desc(authors.updatedAt)
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

  async getById(id: number): Promise<Author | null> {
    const result = await this.db
      .select()
      .from(authors)
      .where(eq(authors.id, id))
      .limit(1)
      .all();
    return result.length > 0 ? result[0] : null;
  }

  async create(authorData: Author): Promise<Author> {
    const [inserted] = await this.db
      .insert(authors)
      .values(authorData)
      .returning({
        id: authors.id,
        name: authors.name,
        biography: authors.biography,
        links: authors.links,
        imageUrl: authors.imageUrl,
        createdAt: authors.createdAt,
        updatedAt: authors.updatedAt,
      });
    return inserted;
  }

  async update(id: number, authorData: Partial<Author>): Promise<Author | null> {
    const exists = await this.getById(id);
    if (!exists) return null;
    const [updated] = await this.db
      .update(authors)
      .set(authorData)
      .where(eq(authors.id, id))
      .returning({
        id: authors.id,
        name: authors.name,
        biography: authors.biography,
        links: authors.links,
        imageUrl: authors.imageUrl,
        createdAt: authors.createdAt,
        updatedAt: authors.updatedAt,
      });
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(authors)
      .where(eq(authors.id, id))
      .returning({ id: authors.id });
    return results.length > 0;
  }
}
