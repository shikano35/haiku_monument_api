import type { QueryParams } from '../common/QueryParams';
import type { CreateHaikuMonumentInput, HaikuMonument, UpdateHaikuMonumentInput } from '../entities/HaikuMonument';
import type { IHaikuMonumentRepository } from '../repositories/IHaikuMonumentRepository';

export class HaikuMonumentUseCases {
  constructor(private readonly monumentRepo: IHaikuMonumentRepository) {}

  async getAllHaikuMonuments(queryParams?: QueryParams): Promise<HaikuMonument[]> {
    return this.monumentRepo.getAll(queryParams);
  }

  async getHaikuMonumentById(id: number): Promise<HaikuMonument | null> {
    return this.monumentRepo.getById(id);
  }

  async createHaikuMonument(monumentData: CreateHaikuMonumentInput): Promise<HaikuMonument> {
    return this.monumentRepo.create(monumentData);
  }

  async updateHaikuMonument(id: number, monumentData: UpdateHaikuMonumentInput): Promise<HaikuMonument | null> {
    return this.monumentRepo.update(id, monumentData);
  }

  async deleteHaikuMonument(id: number): Promise<boolean> {
    return this.monumentRepo.delete(id);
  }

  async getHaikuMonumentsByAuthor(authorId: number): Promise<HaikuMonument[]> {
    return this.monumentRepo.getByAuthorId(authorId);
  }

  async getHaikuMonumentsByLocation(locationId: number): Promise<HaikuMonument[]> {
    return this.monumentRepo.getByLocationId(locationId);
  }

  async getHaikuMonumentsBySource(sourceId: number): Promise<HaikuMonument[]> {
    return this.monumentRepo.getBySourceId(sourceId);
  }
}
