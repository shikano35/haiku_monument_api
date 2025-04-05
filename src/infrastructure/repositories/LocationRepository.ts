import type { ILocationRepository } from '../../domain/repositories/ILocationRepository';
import type { CreateLocationInput, Location } from '../../domain/entities/Location';
import { getDB } from '../db/db';
import { locations } from '../db/schema';
import { and, asc, desc, eq, like } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';
import type { QueryParams } from '../../domain/common/QueryParams';

export class LocationRepository implements ILocationRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(queryParams: QueryParams): Promise<Location[]> {
    let query = this.db.select().from(locations);

    if (queryParams) {
      const conditions = [];
      if (queryParams.prefecture) {
        conditions.push(eq(locations.prefecture, queryParams.prefecture));
      }
      if (queryParams.region) {
        conditions.push(like(locations.region, `%${queryParams.region}%`));
      }
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      if (queryParams.ordering?.length) {
        const orderClauses = queryParams.ordering
          .map((order) => {
            const direction = order.startsWith('-') ? 'desc' : 'asc';
            const columnName = order.startsWith('-') ? order.substring(1) : order;
      
            if (columnName === 'prefecture') {
              return direction === 'asc' ? asc(locations.prefecture) : desc(locations.prefecture);
            }
            if (columnName === 'region') {
              return direction === 'asc' ? asc(locations.region) : desc(locations.region);
            }
            return undefined;
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

  async getById(id: number): Promise<Location | null> {
    const result = await this.db
      .select()
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1)
      .all();
    return result.length > 0 ? result[0] : null;
  }

  async create(locationData: CreateLocationInput): Promise<Location> {
    const [inserted] = await this.db
      .insert(locations)
      .values(locationData)
      .returning();
    return inserted;
  }

  async update(id: number, locationData: Partial<Location>): Promise<Location | null> {
    if (!(await this.getById(id))) return null;
    
    const [updated] = await this.db
      .update(locations)
      .set(locationData)
      .where(eq(locations.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(locations)
      .where(eq(locations.id, id))
      .returning({ id: locations.id });
    return results.length > 0;
  }
}
