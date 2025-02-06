import { drizzle } from 'drizzle-orm/d1';
import { tags } from '../models/schema';
import { eq } from 'drizzle-orm/expressions';

export interface Tag {
  id?: number;
  name: string;
  description?: string | null;
}

type Env = {
  DB: D1Database;
};

const getDB = (env: Env) => drizzle(env.DB);

export const getAllTags = async (env: Env): Promise<Tag[]> => {
  const db = getDB(env);
  return await db.select().from(tags).all();
};

export const getTagById = async (id: number, env: Env): Promise<Tag | null> => {
  const db = getDB(env);
  const result = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

export const createTag = async (tagData: Tag, env: Env): Promise<Tag> => {
  const db = getDB(env);
  const [inserted] = await db.insert(tags).values(tagData).returning();
  return inserted;
};

export const updateTag = async (
  id: number,
  tagData: Partial<Tag>,
  env: Env
): Promise<Tag | null> => {
  const db = getDB(env);
  const exists = await getTagById(id, env);
  if (!exists) return null;
  
  const [updated] = await db
    .update(tags)
    .set(tagData)
    .where(eq(tags.id, id))
    .returning();
  return updated;
};

export const deleteTag = async (id: number, env: Env): Promise<boolean> => {
  const db = getDB(env);
  const results = await db.delete(tags).where(eq(tags.id, id)).returning();
  return results.length > 0;
};
