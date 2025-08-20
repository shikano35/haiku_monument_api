import type { CreateLocationInput, UpdateLocationInput, Location } from "../entities/Location";
import type { LocationQueryParams } from "../common/QueryParams";

export interface ILocationRepository {
  getAll(queryParams?: LocationQueryParams): Promise<Location[]>;
  getById(id: number): Promise<Location | null>;
  getByPrefecture(prefecture: string): Promise<Location[]>;
  getByRegion(region: string): Promise<Location[]>;
  getByCoordinates(lat: number, lon: number, radius: number): Promise<Location[]>;
  getByImiPrefCode(imiPrefCode: string): Promise<Location[]>;
  create(location: CreateLocationInput): Promise<Location>;
  update(id: number, locationData: UpdateLocationInput): Promise<Location | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
  countByPrefecture(prefecture: string): Promise<number>;
}
