import type { User } from '../entities/User';

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: number): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: number, userData: Partial<User>): Promise<User | null>;
  delete(id: number): Promise<boolean>;
}
