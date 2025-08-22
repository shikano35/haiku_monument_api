import type { MonumentQueryParams } from "../common/QueryParams";
import type {
  CreateHaikuMonumentInput,
  HaikuMonument,
  UpdateHaikuMonumentInput,
} from "../entities/Monument";
import type { IMonumentRepository } from "../repositories/IMonumentRepository";

export class HaikuMonumentUseCases {
  constructor(private readonly monumentRepo: IMonumentRepository) {}

  async getAllHaikuMonuments(
    queryParams: MonumentQueryParams,
  ): Promise<HaikuMonument[]> {
    return this.monumentRepo.getAll(queryParams);
  }

  async getHaikuMonumentById(id: number): Promise<HaikuMonument | null> {
    return this.monumentRepo.getById(id);
  }

  async createHaikuMonument(
    monumentData: CreateHaikuMonumentInput,
  ): Promise<HaikuMonument> {
    return this.monumentRepo.create(monumentData);
  }

  async updateHaikuMonument(
    id: number,
    monumentData: UpdateHaikuMonumentInput,
  ): Promise<HaikuMonument | null> {
    return this.monumentRepo.update(id, monumentData);
  }

  async deleteHaikuMonument(id: number): Promise<boolean> {
    return this.monumentRepo.delete(id);
  }

  async getHaikuMonumentsByPoet(poetId: number): Promise<HaikuMonument[]> {
    return this.monumentRepo.getByPoetId(poetId);
  }

  async getHaikuMonumentsByLocation(
    locationId: number,
  ): Promise<HaikuMonument[]> {
    return this.monumentRepo.getByLocationId(locationId);
  }

  async getHaikuMonumentsBySource(sourceId: number): Promise<HaikuMonument[]> {
    return this.monumentRepo.getBySourceId(sourceId);
  }
}
