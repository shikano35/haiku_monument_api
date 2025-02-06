import { drizzle } from 'drizzle-orm/d1';
import { locations } from '../models/schema';
import { eq } from 'drizzle-orm/expressions';

export interface Location {
  id?: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
}

type Env = {
  DB: D1Database;
};

const getDB = (env: Env) => drizzle(env.DB);

export const getAllLocations = async (env: Env): Promise<Location[]> => {
  const db = getDB(env);
  return await db.select().from(locations).all();
};

export const getLocationById = async (id: number, env: Env): Promise<Location | null> => {
  const db = getDB(env);
  const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
};

export const createLocation = async (locationData: Location, env: Env): Promise<Location> => {
  const db = getDB(env);
  const [inserted] = await db.insert(locations).values(locationData).returning();
  return inserted;
};

export const updateLocation = async (
  id: number,
  locationData: Partial<Location>,
  env: Env
): Promise<Location | null> => {
  const db = getDB(env);
  const exists = await getLocationById(id, env);
  if (!exists) return null;

  const [updated] = await db
    .update(locations)
    .set(locationData)
    .where(eq(locations.id, id))
    .returning();
  return updated;
};

export const deleteLocation = async (id: number, env: Env): Promise<boolean> => {
  const db = getDB(env);
  const results = await db.delete(locations).where(eq(locations.id, id)).returning();
  return results.length > 0;
};
