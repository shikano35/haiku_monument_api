import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { CreateUserInput, User } from '../../domain/entities/User';
import { getDB } from '../db/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';

export class UserRepository implements IUserRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(): Promise<User[]> {
    return await this.db.select().from(users).all();
  }

  async getById(id: number): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async create(userData: CreateUserInput): Promise<User> {
    const [inserted] = await this.db.insert(users).values(userData).returning();
    return inserted;
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const exists = await this.getById(id);
    if (!exists) return null;
    const [updated] = await this.db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db.delete(users).where(eq(users.id, id)).returning();
    return results.length > 0;
  }
}
