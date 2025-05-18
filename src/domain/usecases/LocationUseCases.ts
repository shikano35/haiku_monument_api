import type { QueryParams } from "../common/QueryParams";
import type { CreateLocationInput, Location } from "../entities/Location";
import type { ILocationRepository } from "../repositories/ILocationRepository";

export class LocationUseCases {
  constructor(private readonly locationRepo: ILocationRepository) {}

  async getAllLocations(queryParams: QueryParams): Promise<Location[]> {
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
    locationData: Partial<Location>,
  ): Promise<Location | null> {
    return this.locationRepo.update(id, locationData);
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locationRepo.delete(id);
  }
}
