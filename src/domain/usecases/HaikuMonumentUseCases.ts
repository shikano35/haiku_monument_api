import type { HaikuMonument } from '../entities/HaikuMonument';
import type { IHaikuMonumentRepository } from '../repositories/IHaikuMonumentRepository';

export class HaikuMonumentUseCases {
  constructor(private readonly monumentRepo: IHaikuMonumentRepository) {}

  async getAllHaikuMonuments(): Promise<HaikuMonument[]> {
    return this.monumentRepo.getAll();
  }

  async getHaikuMonumentById(id: number): Promise<HaikuMonument | null> {
    return this.monumentRepo.getById(id);
  }

  async createHaikuMonument(monumentData: HaikuMonument): Promise<HaikuMonument> {
    return this.monumentRepo.create(monumentData);
  }

  async updateHaikuMonument(id: number, monumentData: Partial<HaikuMonument>): Promise<HaikuMonument | null> {
    return this.monumentRepo.update(id, monumentData);
  }

  async deleteHaikuMonument(id: number): Promise<boolean> {
    return this.monumentRepo.delete(id);
  }
}
