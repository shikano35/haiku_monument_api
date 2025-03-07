import type { QueryParams } from '../common/QueryParams';
import type { CreateHaikuMonumentInput, HaikuMonument, UpdateHaikuMonumentInput } from '../entities/HaikuMonument';

export type IHaikuMonumentRepository = {
  getAll(queryParams?: QueryParams): Promise<HaikuMonument[]>;
  getById(id: number): Promise<HaikuMonument | null>;
  create(monument: CreateHaikuMonumentInput): Promise<HaikuMonument>;
  update(id: number, monumentData: UpdateHaikuMonumentInput): Promise<HaikuMonument | null>;
  delete(id: number): Promise<boolean>;
  getByPoetId(poetId: number): Promise<HaikuMonument[]>;
  getByLocationId(locationId: number): Promise<HaikuMonument[]>;
  getBySourceId(sourceId: number): Promise<HaikuMonument[]>;
}
