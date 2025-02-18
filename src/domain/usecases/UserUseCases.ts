import type { CreateUserInput, User } from '../entities/User';
import type { IUserRepository } from '../repositories/IUserRepository';

export class UserUseCases {
  constructor(private readonly userRepo: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepo.getAll();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepo.getById(id);
  }

  async createUser(userData: CreateUserInput): Promise<User> {
    return this.userRepo.create(userData);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    return this.userRepo.update(id, userData);
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.userRepo.delete(id);
  }
}
