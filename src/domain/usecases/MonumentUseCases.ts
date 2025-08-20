import type { IMonumentRepository } from "../repositories/IMonumentRepository";
import type { MonumentQueryParams } from "../common/QueryParams";
import type { Monument, CreateMonumentInput, UpdateMonumentInput } from "../entities/Monument";

export class MonumentUseCases {
  constructor(private monumentRepository: IMonumentRepository) {}

  async getAllMonuments(queryParams: MonumentQueryParams = {}): Promise<Monument[]> {
    return this.monumentRepository.getAll(queryParams);
  }

  async getMonumentById(id: number): Promise<Monument | null> {
    return this.monumentRepository.getById(id);
  }

  async getMonumentsByPoet(poetId: number): Promise<Monument[]> {
    return this.monumentRepository.getByPoetId(poetId);
  }

  async getMonumentsByLocation(locationId: number): Promise<Monument[]> {
    return this.monumentRepository.getByLocationId(locationId);
  }

  async getMonumentsBySource(sourceId: number): Promise<Monument[]> {
    return this.monumentRepository.getBySourceId(sourceId);
  }

  async getMonumentsByCoordinates(
    lat: number,
    lon: number,
    radius: number
  ): Promise<Monument[]> {
    return this.monumentRepository.getByCoordinates(lat, lon, radius);
  }

  async createMonument(monumentData: CreateMonumentInput): Promise<Monument> {
    return this.monumentRepository.create(monumentData);
  }

  async updateMonument(id: number, monumentData: UpdateMonumentInput): Promise<Monument | null> {
    return this.monumentRepository.update(id, monumentData);
  }

  async deleteMonument(id: number): Promise<boolean> {
    return this.monumentRepository.delete(id);
  }

  async getMonumentCount(): Promise<number> {
    return this.monumentRepository.count();
  }

  async getMonumentCountByPrefecture(prefecture: string): Promise<number> {
    return this.monumentRepository.countByPrefecture(prefecture);
  }
}
