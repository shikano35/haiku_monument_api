import type { HaikuMonument } from '../entities/HaikuMonument';

export interface IHaikuMonumentRepository {
  getAll(): Promise<HaikuMonument[]>;
  getById(id: number): Promise<HaikuMonument | null>;
  create(monument: HaikuMonument): Promise<HaikuMonument>;
  update(id: number, monumentData: Partial<HaikuMonument>): Promise<HaikuMonument | null>;
  delete(id: number): Promise<boolean>;
}
