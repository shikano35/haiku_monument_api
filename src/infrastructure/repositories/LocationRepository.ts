import type { ILocationRepository } from "../../domain/repositories/ILocationRepository";
import type {
  CreateLocationInput,
  UpdateLocationInput,
  Location,
} from "../../domain/entities/Location";
import type { LocationQueryParams } from "../../domain/common/QueryParams";
import { getDB } from "../db/db";
import { locations } from "../db/schema";
import { and, asc, desc, eq, like, count } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";

export class LocationRepository implements ILocationRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  private convertToLocation(data: {
    id: number;
    imiPrefCode: string | null;
    region: string | null;
    prefecture: string | null;
    municipality: string | null;
    address: string | null;
    placeName: string | null;
    latitude: number | null;
    longitude: number | null;
    geohash: string | null;
    geomGeojson: string | null;
    accuracyM: number | null;
    createdAt: string;
    updatedAt: string;
  }): Location {
    return {
      id: data.id,
      imiPrefCode: data.imiPrefCode ?? null,
      region: data.region ?? null,
      prefecture: data.prefecture ?? null,
      municipality: data.municipality ?? null,
      address: data.address ?? null,
      placeName: data.placeName ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      geohash: data.geohash ?? null,
      geomGeojson: data.geomGeojson ?? null,
      accuracyM: data.accuracyM ?? null,
      createdAt: this.convertToISOString(data.createdAt),
      updatedAt: this.convertToISOString(data.updatedAt),
    };
  }

  private convertToISOString(dateString: string): string {
    try {
      return new Date(dateString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  async getAll(queryParams?: LocationQueryParams): Promise<Location[]> {
    const {
      limit: paramLimit = 50,
      offset: paramOffset = 0,
      ordering: paramOrdering = [],
      search,
      createdAtGt,
      createdAtLt,
      updatedAtGt,
      updatedAtLt,
      prefecture,
      region,
      bbox,
      imiPrefCode,
    } = queryParams || {};

    const limit = paramLimit ?? 50;
    const offset = paramOffset ?? 0;
    const ordering = paramOrdering ?? [];

    let query = this.db.select().from(locations);

    const conditions = [];

    if (prefecture) {
      conditions.push(eq(locations.prefecture, prefecture));
    }

    if (region) {
      conditions.push(eq(locations.region, region));
    }

    if (imiPrefCode) {
      conditions.push(eq(locations.imiPrefCode, imiPrefCode));
    }

    // 全文検索
    if (search) {
      conditions.push(like(locations.placeName, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    if (ordering && ordering.length > 0) {
      const orderClauses = ordering.map((order) => {
        const isDesc = order.startsWith("-");
        const field = isDesc ? order.slice(1) : order;

        switch (field) {
          case "prefecture":
            return isDesc
              ? desc(locations.prefecture)
              : asc(locations.prefecture);
          case "region":
            return isDesc ? desc(locations.region) : asc(locations.region);
          case "created_at":
            return isDesc
              ? desc(locations.createdAt)
              : asc(locations.createdAt);
          case "updated_at":
            return isDesc
              ? desc(locations.updatedAt)
              : asc(locations.updatedAt);
          default:
            return asc(locations.id);
        }
      });
      query = query.orderBy(...orderClauses) as typeof query;
    }

    // 基本クエリ実行
    let results = await query.limit(limit).offset(offset);

    // メモリ内での追加フィルタリング
    let filteredResults = results;

    // 日付フィルタリング
    if (createdAtGt) {
      filteredResults = filteredResults.filter(
        (location) => new Date(location.createdAt) > new Date(createdAtGt),
      );
    }

    if (createdAtLt) {
      filteredResults = filteredResults.filter(
        (location) => new Date(location.createdAt) < new Date(createdAtLt),
      );
    }

    if (updatedAtGt) {
      filteredResults = filteredResults.filter(
        (location) => new Date(location.updatedAt) > new Date(updatedAtGt),
      );
    }

    if (updatedAtLt) {
      filteredResults = filteredResults.filter(
        (location) => new Date(location.updatedAt) < new Date(updatedAtLt),
      );
    }

    // bbox（地理的境界）フィルタリング
    if (bbox && Array.isArray(bbox) && bbox.length === 4) {
      const [minLon, minLat, maxLon, maxLat] = bbox;
      filteredResults = filteredResults.filter(
        (location) =>
          location.latitude !== null &&
          location.longitude !== null &&
          location.latitude >= minLat &&
          location.latitude <= maxLat &&
          location.longitude >= minLon &&
          location.longitude <= maxLon,
      );
    }

    return filteredResults.map((data) => this.convertToLocation(data));
  }

  async getById(id: number): Promise<Location | null> {
    const result = await this.db
      .select()
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1);
    return result.length > 0 ? this.convertToLocation(result[0]) : null;
  }

  async getByPrefecture(prefecture: string): Promise<Location[]> {
    const results = await this.db
      .select()
      .from(locations)
      .where(eq(locations.prefecture, prefecture));
    return results.map((data) => this.convertToLocation(data));
  }

  async getByRegion(region: string): Promise<Location[]> {
    const results = await this.db
      .select()
      .from(locations)
      .where(eq(locations.region, region));
    return results.map((data) => this.convertToLocation(data));
  }

  async getByCoordinates(
    lat: number,
    lon: number,
    radius: number,
  ): Promise<Location[]> {
    const results = await this.db.select().from(locations);

    return results
      .filter((location) => {
        if (!location.latitude || !location.longitude) return false;
        const distance = this.calculateDistance(
          lat,
          lon,
          location.latitude,
          location.longitude,
        );
        return distance <= radius;
      })
      .map((data) => this.convertToLocation(data));
  }

  async getByImiPrefCode(imiPrefCode: string): Promise<Location[]> {
    const results = await this.db
      .select()
      .from(locations)
      .where(eq(locations.imiPrefCode, imiPrefCode));
    return results.map((data) => this.convertToLocation(data));
  }

  async create(locationData: CreateLocationInput): Promise<Location> {
    const [inserted] = await this.db
      .insert(locations)
      .values(locationData)
      .returning();
    return this.convertToLocation(inserted);
  }

  async update(
    id: number,
    locationData: UpdateLocationInput,
  ): Promise<Location | null> {
    if (!(await this.getById(id))) return null;

    const [updated] = await this.db
      .update(locations)
      .set(locationData)
      .where(eq(locations.id, id))
      .returning();
    return this.convertToLocation(updated);
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(locations)
      .where(eq(locations.id, id))
      .returning({ id: locations.id });
    return results.length > 0;
  }

  async count(): Promise<number> {
    const results = await this.db.select({ count: count() }).from(locations);
    return results[0]?.count ?? 0;
  }

  async countByPrefecture(prefecture: string): Promise<number> {
    const results = await this.db
      .select({ count: count() })
      .from(locations)
      .where(eq(locations.prefecture, prefecture));
    return results[0]?.count ?? 0;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
