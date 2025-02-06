import { drizzle } from 'drizzle-orm/d1';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm/expressions';

export interface User {
  id?: number;
  username: string;
  email: string;
  hashedPassword: string;
  displayName?: string | null;
  role?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastLoginAt?: string | null;
  status?: string;
}

type Env = {
  DB: D1Database;
};

const getDB = (env: Env) => drizzle(env.DB);

export const getAllUsers = async (env: Env): Promise<User[]> => {
  const db = getDB(env);
  return await db.select().from(users).all();
};

export const getUserById = async (id: number, env: Env): Promise<User | null> => {
  const db = getDB(env);
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

export const createUser = async (userData: User, env: Env): Promise<User> => {
  const db = getDB(env);
  const [inserted] = await db.insert(users).values(userData).returning();
  return inserted;
};

export const updateUser = async (
  id: number,
  userData: Partial<User>,
  env: Env
): Promise<User | null> => {
  const db = getDB(env);
  const exists = await getUserById(id, env);
  if (!exists) return null;
  
  const [updated] = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, id))
    .returning();
  return updated;
};

export const deleteUser = async (id: number, env: Env): Promise<boolean> => {
  const db = getDB(env);
  const results = await db.delete(users).where(eq(users.id, id)).returning();
  return results.length > 0;
};
