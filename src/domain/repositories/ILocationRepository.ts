import type { QueryParams } from "../common/QueryParams";
import type { CreateLocationInput, Location } from "../entities/Location";

export type ILocationRepository = {
  getAll(queryParams: QueryParams): Promise<Location[]>;
  getById(id: number): Promise<Location | null>;
  create(location: CreateLocationInput): Promise<Location>;
  update(id: number, locationData: Partial<Location>): Promise<Location | null>;
  delete(id: number): Promise<boolean>;
};
