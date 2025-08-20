import type { Poet, CreatePoetInput, UpdatePoetInput } from "../entities/Poet";
import type { IPoetRepository } from "../repositories/IPoetRepository";
import type { PoetQueryParams } from "../common/QueryParams";

export class PoetUseCases {
  constructor(private readonly poetRepo: IPoetRepository) {}

  async getAllPoets(queryParams?: PoetQueryParams): Promise<Poet[]> {
    return this.poetRepo.getAll(queryParams);
  }

  async getPoetById(id: number): Promise<Poet | null> {
    return this.poetRepo.getById(id);
  }

  async createPoet(poetData: CreatePoetInput): Promise<Poet> {
    return this.poetRepo.create(poetData);
  }

  async updatePoet(id: number, poetData: Partial<Poet>): Promise<Poet | null> {
    return this.poetRepo.update(id, poetData);
  }

  async deletePoet(id: number): Promise<boolean> {
    return this.poetRepo.delete(id);
  }
}
