import { drizzle } from 'drizzle-orm/d1';
import { haikuMonument } from '../models/schema';
import { eq } from 'drizzle-orm/expressions';

export interface HaikuMonumentEntity {
  id?: number;
  text: string;
  authorId: number;
  sourceId?: number | null;
  establishedDate?: string | null;
  locationId?: number | null;
  commentary?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

type Env = {
  DB: D1Database;
};

const getDB = (env: Env) => drizzle(env.DB);

export const getAllHaikuMonuments = async (env: Env): Promise<HaikuMonumentEntity[]> => {
  const db = getDB(env);
  return await db.select().from(haikuMonument).all();
};

export const getHaikuMonumentById = async (
  id: number,
  env: Env
): Promise<HaikuMonumentEntity | null> => {
  const db = getDB(env);
  const result = await db
    .select()
    .from(haikuMonument)
    .where(eq(haikuMonument.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

export const createHaikuMonument = async (
  monumentData: HaikuMonumentEntity,
  env: Env
): Promise<HaikuMonumentEntity> => {
  const db = getDB(env);
  const [inserted] = await db.insert(haikuMonument).values(monumentData).returning();
  return inserted;
};

export const updateHaikuMonument = async (
  id: number,
  monumentData: Partial<HaikuMonumentEntity>,
  env: Env
): Promise<HaikuMonumentEntity | null> => {
  const db = getDB(env);
  const exists = await getHaikuMonumentById(id, env);
  if (!exists) return null;
  
  const [updated] = await db
    .update(haikuMonument)
    .set(monumentData)
    .where(eq(haikuMonument.id, id))
    .returning();
  return updated;
};

export const deleteHaikuMonument = async (
  id: number,
  env: Env
): Promise<boolean> => {
  const db = getDB(env);
  const results = await db.delete(haikuMonument).where(eq(haikuMonument.id, id)).returning();
  return results.length > 0;
};
