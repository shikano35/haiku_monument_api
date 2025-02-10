import type { Source } from '../entities/Source';
import type { ISourceRepository } from '../repositories/ISourceRepository';

export class SourceUseCases {
  constructor(private readonly sourceRepo: ISourceRepository) {}

  async getAllSources(): Promise<Source[]> {
    return this.sourceRepo.getAll();
  }

  async getSourceById(id: number): Promise<Source | null> {
    return this.sourceRepo.getById(id);
  }

  async createSource(sourceData: Source): Promise<Source> {
    return this.sourceRepo.create(sourceData);
  }

  async updateSource(id: number, sourceData: Partial<Source>): Promise<Source | null> {
    return this.sourceRepo.update(id, sourceData);
  }

  async deleteSource(id: number): Promise<boolean> {
    return this.sourceRepo.delete(id);
  }
}
