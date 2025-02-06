import { drizzle } from 'drizzle-orm/d1';
import { authors } from '../models/schema';
import { eq } from 'drizzle-orm/expressions';

export interface Author {
  id?: number;
  name: string;
  biography?: string | null;
  links?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

type Env = {
  DB: D1Database;
};

const getDB = (env: Env) => drizzle(env.DB);

export const getAllAuthors = async (env: Env): Promise<Author[]> => {
  const db = getDB(env);
  return await db.select().from(authors).all();
};

export const getAuthorById = async (id: number, env: Env): Promise<Author | null> => {
  const db = getDB(env);
  const result = await db
    .select()
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

export const createAuthor = async (authorData: Author, env: Env): Promise<Author> => {
  const db = getDB(env);
  const [inserted] = await db.insert(authors).values(authorData).returning();
  return inserted;
};

export const updateAuthor = async (
  id: number,
  authorData: Partial<Author>,
  env: Env
): Promise<Author | null> => {
  const db = getDB(env);
  // 存在チェック
  const exists = await getAuthorById(id, env);
  if (!exists) return null;
  
  const [updated] = await db
    .update(authors)
    .set(authorData)
    .where(eq(authors.id, id))
    .returning();
  return updated;
};

export const deleteAuthor = async (id: number, env: Env): Promise<boolean> => {
  const db = getDB(env);
  const results = await db.delete(authors).where(eq(authors.id, id)).returning();
  return results.length > 0;
};
