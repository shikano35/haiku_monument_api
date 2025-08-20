import type { LocationQueryParams } from "../common/QueryParams";
import type {
  CreateLocationInput,
  UpdateLocationInput,
  Location,
} from "../entities/Location";
import type { ILocationRepository } from "../repositories/ILocationRepository";

export class LocationUseCases {
  constructor(private readonly locationRepo: ILocationRepository) {}

  async getAllLocations(
    queryParams?: LocationQueryParams,
  ): Promise<Location[]> {
    return this.locationRepo.getAll(queryParams);
  }

  async getLocationById(id: number): Promise<Location | null> {
    return this.locationRepo.getById(id);
  }

  async createLocation(locationData: CreateLocationInput): Promise<Location> {
    return this.locationRepo.create(locationData);
  }

  async updateLocation(
    id: number,
    locationData: UpdateLocationInput,
  ): Promise<Location | null> {
    return this.locationRepo.update(id, locationData);
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locationRepo.delete(id);
  }
}
