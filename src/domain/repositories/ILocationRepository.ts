import type { QueryParams } from '../common/QueryParams';
import type { Location } from '../entities/Location';

export interface ILocationRepository {
  getAll(queryParams?: QueryParams): Promise<Location[]>;
  getById(id: number): Promise<Location | null>;
  create(location: Location): Promise<Location>;
  update(id: number, locationData: Partial<Location>): Promise<Location | null>;
  delete(id: number): Promise<boolean>;
}
