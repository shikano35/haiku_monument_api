import type { Source } from '../entities/Source';

export interface ISourceRepository {
  getAll(): Promise<Source[]>;
  getById(id: number): Promise<Source | null>;
  create(source: Source): Promise<Source>;
  update(id: number, sourceData: Partial<Source>): Promise<Source | null>;
  delete(id: number): Promise<boolean>;
}
