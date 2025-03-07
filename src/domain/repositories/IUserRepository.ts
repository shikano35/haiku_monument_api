import type { CreateUserInput, User } from '../entities/User';

export type IUserRepository = {
  getAll(): Promise<User[]>;
  getById(id: number): Promise<User | null>;
  create(user: CreateUserInput): Promise<User>;
  update(id: number, userData: Partial<User>): Promise<User | null>;
  delete(id: number): Promise<boolean>;
}
