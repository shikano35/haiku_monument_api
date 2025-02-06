import { drizzle } from 'drizzle-orm/d1';
import { sources } from '../models/schema';
import { eq } from 'drizzle-orm/expressions';

export interface Source {
  id?: number;
  title: string;
  author?: string | null;
  year?: number | null;
  url?: string | null;
  publisher?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

type Env = {
  DB: D1Database;
};

const getDB = (env: Env) => drizzle(env.DB);

export const getAllSources = async (env: Env): Promise<Source[]> => {
  const db = getDB(env);
  return await db.select().from(sources).all();
};

export const getSourceById = async (id: number, env: Env): Promise<Source | null> => {
  const db = getDB(env);
  const result = await db
    .select()
    .from(sources)
    .where(eq(sources.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

export const createSource = async (sourceData: Source, env: Env): Promise<Source> => {
  const db = getDB(env);
  const [inserted] = await db.insert(sources).values(sourceData).returning();
  return inserted;
};

export const updateSource = async (
  id: number,
  sourceData: Partial<Source>,
  env: Env
): Promise<Source | null> => {
  const db = getDB(env);
  const exists = await getSourceById(id, env);
  if (!exists) return null;
  
  const [updated] = await db
    .update(sources)
    .set(sourceData)
    .where(eq(sources.id, id))
    .returning();
  return updated;
};

export const deleteSource = async (id: number, env: Env): Promise<boolean> => {
  const db = getDB(env);
  const results = await db.delete(sources).where(eq(sources.id, id)).returning();
  return results.length > 0;
};
