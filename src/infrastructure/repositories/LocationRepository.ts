import type { ILocationRepository } from '../../domain/repositories/ILocationRepository';
import type { Location } from '../../domain/entities/Location';
import { getDB } from '../db/db';
import { locations } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';

export class LocationRepository implements ILocationRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(): Promise<Location[]> {
    return await this.db.select().from(locations).all();
  }

  async getById(id: number): Promise<Location | null> {
    const result = await this.db.select().from(locations).where(eq(locations.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async create(locationData: Location): Promise<Location> {
    const [inserted] = await this.db.insert(locations).values(locationData).returning();
    return inserted;
  }

  async update(id: number, locationData: Partial<Location>): Promise<Location | null> {
    const exists = await this.getById(id);
    if (!exists) return null;

    const [updated] = await this.db
      .update(locations)
      .set(locationData)
      .where(eq(locations.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db.delete(locations).where(eq(locations.id, id)).returning();
    return results.length > 0;
  }
}
