import type { Monument, CreateMonumentInput, UpdateMonumentInput } from "../entities/Monument";
import type { MonumentQueryParams } from "../common/QueryParams";

export interface IMonumentRepository {
  getAll(queryParams?: MonumentQueryParams): Promise<Monument[]>;
  getById(id: number): Promise<Monument | null>;
  getByPoetId(poetId: number): Promise<Monument[]>;
  getByLocationId(locationId: number): Promise<Monument[]>;
  getBySourceId(sourceId: number): Promise<Monument[]>;
  getByCoordinates(lat: number, lon: number, radius: number): Promise<Monument[]>;
  create(monumentData: CreateMonumentInput): Promise<Monument>;
  update(id: number, monumentData: UpdateMonumentInput): Promise<Monument | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
  countByPrefecture(prefecture: string): Promise<number>;
}
