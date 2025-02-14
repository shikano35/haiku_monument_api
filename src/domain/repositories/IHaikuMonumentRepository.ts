import type { QueryParams } from '../common/QueryParams';
import type { HaikuMonument } from '../entities/HaikuMonument';

export interface IHaikuMonumentRepository {
  getAll(queryParams?: QueryParams): Promise<HaikuMonument[]>;
  getById(id: number): Promise<HaikuMonument | null>;
  create(monument: HaikuMonument): Promise<HaikuMonument>;
  update(id: number, monumentData: Partial<HaikuMonument>): Promise<HaikuMonument | null>;
  delete(id: number): Promise<boolean>;
  getByAuthorId(authorId: number): Promise<HaikuMonument[]>;
  getByLocationId(locationId: number): Promise<HaikuMonument[]>;
  getBySourceId(sourceId: number): Promise<HaikuMonument[]>;
}
