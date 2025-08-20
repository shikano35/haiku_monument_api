import { eq, count, sql, and, or, like, inArray, desc, asc } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import {
  monuments,
  monumentLocations,
  locations,
  inscriptions,
  inscriptionPoems,
  poemAttributions,
} from "../db/schema";
import type { IMonumentRepository } from "../../domain/repositories/IMonumentRepository";
import type { MonumentQueryParams } from "../../domain/common/QueryParams";
import type {
  Monument,
  CreateMonumentInput,
  UpdateMonumentInput,
} from "../../domain/entities/Monument";

export class MonumentRepository implements IMonumentRepository {
  private db: DrizzleD1Database;

  constructor(database: D1Database) {
    this.db = drizzle(database);
  }

  async getAll(params: MonumentQueryParams = {}): Promise<Monument[]> {
    const {
      limit = 50,
      offset = 0,
      search,
      prefecture,
      region,
      monumentType,
      q,
      canonicalNameContains,
      ordering = [],
    } = params;

    let query = this.db
      .select({
        id: monuments.id,
        canonicalName: monuments.canonicalName,
        monumentType: monuments.monumentType,
        monumentTypeUri: monuments.monumentTypeUri,
        material: monuments.material,
        materialUri: monuments.materialUri,
        createdAt: monuments.createdAt,
        updatedAt: monuments.updatedAt,
      })
      .from(monuments);

    const conditions = [];

    // 検索条件
    const searchTerm = search || q;
    if (searchTerm) {
      conditions.push(like(monuments.canonicalName, `%${searchTerm}%`));
    }

    if (canonicalNameContains) {
      conditions.push(
        like(monuments.canonicalName, `%${canonicalNameContains}%`),
      );
    }

    if (monumentType) {
      conditions.push(eq(monuments.monumentType, monumentType));
    }

    // 地理的フィルタ
    if (prefecture || region) {
      const joinedQuery = query
        .innerJoin(
          monumentLocations,
          eq(monuments.id, monumentLocations.monumentId),
        )
        .innerJoin(locations, eq(monumentLocations.locationId, locations.id));
      
      query = joinedQuery as unknown as typeof query;

      if (prefecture) {
        conditions.push(eq(locations.prefecture, prefecture));
      }
      if (region) {
        conditions.push(eq(locations.region, region));
      }
    }

    // 条件適用
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    // 順序付け
    if (ordering.length > 0) {
      const orderColumns = ordering.map((orderItem) => {
        const isDesc = orderItem.startsWith("-");
        const fieldName = isDesc ? orderItem.slice(1) : orderItem;

        const column =
          fieldName === "canonicalName"
            ? monuments.canonicalName
            : fieldName === "createdAt"
              ? monuments.createdAt
              : fieldName === "updatedAt"
                ? monuments.updatedAt
                : monuments.id;

        return isDesc ? desc(column) : asc(column);
      });

      query = query.orderBy(...orderColumns) as typeof query;
    } else {
      query = query.orderBy(asc(monuments.id)) as typeof query;
    }

    const results = await query.limit(limit).offset(offset);
    return results.map((row) => this.convertToMonument(row));
  }

  async getById(id: number): Promise<Monument | null> {
    const result = await this.db
      .select()
      .from(monuments)
      .where(eq(monuments.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.convertToMonument(result[0]);
  }

  async getByPoetId(poetId: number): Promise<Monument[]> {
    const results = await this.db
      .select({
        id: monuments.id,
        canonicalName: monuments.canonicalName,
        monumentType: monuments.monumentType,
        monumentTypeUri: monuments.monumentTypeUri,
        material: monuments.material,
        materialUri: monuments.materialUri,
        createdAt: monuments.createdAt,
        updatedAt: monuments.updatedAt,
      })
      .from(monuments)
      .innerJoin(inscriptions, eq(monuments.id, inscriptions.monumentId))
      .innerJoin(
        inscriptionPoems,
        eq(inscriptions.id, inscriptionPoems.inscriptionId),
      )
      .innerJoin(
        poemAttributions,
        eq(inscriptionPoems.poemId, poemAttributions.poemId),
      )
      .where(eq(poemAttributions.poetId, poetId));

    return results.map((row) => this.convertToMonument(row));
  }

  async getByLocationId(locationId: number): Promise<Monument[]> {
    const results = await this.db
      .select({
        id: monuments.id,
        canonicalName: monuments.canonicalName,
        monumentType: monuments.monumentType,
        monumentTypeUri: monuments.monumentTypeUri,
        material: monuments.material,
        materialUri: monuments.materialUri,
        createdAt: monuments.createdAt,
        updatedAt: monuments.updatedAt,
      })
      .from(monuments)
      .innerJoin(
        monumentLocations,
        eq(monuments.id, monumentLocations.monumentId),
      )
      .where(eq(monumentLocations.locationId, locationId));

    return results.map((row) => this.convertToMonument(row));
  }

  async getBySourceId(sourceId: number): Promise<Monument[]> {
    const results = await this.db
      .select({
        id: monuments.id,
        canonicalName: monuments.canonicalName,
        monumentType: monuments.monumentType,
        monumentTypeUri: monuments.monumentTypeUri,
        material: monuments.material,
        materialUri: monuments.materialUri,
        createdAt: monuments.createdAt,
        updatedAt: monuments.updatedAt,
      })
      .from(monuments)
      .innerJoin(inscriptions, eq(monuments.id, inscriptions.monumentId))
      .where(eq(inscriptions.sourceId, sourceId));

    return results.map((row) => this.convertToMonument(row));
  }

  async getByCoordinates(
    lat: number,
    lon: number,
    radius: number,
  ): Promise<Monument[]> {
    const results = await this.db
      .select({
        id: monuments.id,
        canonicalName: monuments.canonicalName,
        monumentType: monuments.monumentType,
        monumentTypeUri: monuments.monumentTypeUri,
        material: monuments.material,
        materialUri: monuments.materialUri,
        createdAt: monuments.createdAt,
        updatedAt: monuments.updatedAt,
      })
      .from(monuments)
      .innerJoin(
        monumentLocations,
        eq(monuments.id, monumentLocations.monumentId),
      )
      .innerJoin(locations, eq(monumentLocations.locationId, locations.id))
      .where(
        sql`(
          6371000 * 2 * ASIN(
            SQRT(
              POWER(SIN((${lat} - latitude) * PI() / 180 / 2), 2) +
              COS(${lat} * PI() / 180) * COS(latitude * PI() / 180) *
              POWER(SIN((${lon} - longitude) * PI() / 180 / 2), 2)
            )
          )
        ) <= ${radius}`,
      );

    return results.map((row) => this.convertToMonument(row));
  }

  async create(input: CreateMonumentInput): Promise<Monument> {
    const result = await this.db
      .insert(monuments)
      .values({
        canonicalName: input.canonicalName,
        monumentType: input.monumentType ?? null,
        monumentTypeUri: input.monumentTypeUri ?? null,
        material: input.material ?? null,
        materialUri: input.materialUri ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return this.convertToMonument(result[0]);
  }

  async update(
    id: number,
    input: UpdateMonumentInput,
  ): Promise<Monument | null> {
    const updateData: Record<string, unknown> = {};

    if (input.canonicalName !== null)
      updateData.canonicalName = input.canonicalName;
    if (input.monumentType !== null)
      updateData.monumentType = input.monumentType;
    if (input.monumentTypeUri !== null)
      updateData.monumentTypeUri = input.monumentTypeUri;
    if (input.material !== null) updateData.material = input.material;
    if (input.materialUri !== null) updateData.materialUri = input.materialUri;
    if (input.originalEstablishedDate !== null)
      updateData.originalEstablishedDate = input.originalEstablishedDate;
    if (input.huTimeNormalized !== null)
      updateData.huTimeNormalized = input.huTimeNormalized;
    if (input.intervalStart !== null)
      updateData.intervalStart = input.intervalStart;
    if (input.intervalEnd !== null) updateData.intervalEnd = input.intervalEnd;
    if (input.uncertaintyNote !== null)
      updateData.uncertaintyNote = input.uncertaintyNote;

    updateData.updatedAt = new Date().toISOString();

    const result = await this.db
      .update(monuments)
      .set(updateData)
      .where(eq(monuments.id, id))
      .returning();

    if (result.length === 0) {
      return null;
    }

    return this.convertToMonument(result[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(monuments)
      .where(eq(monuments.id, id))
      .returning();

    return result.length > 0;
  }

  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(monuments);

    return result[0].count;
  }

  async countByPrefecture(prefecture: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(monuments)
      .innerJoin(
        monumentLocations,
        eq(monuments.id, monumentLocations.monumentId),
      )
      .innerJoin(locations, eq(monumentLocations.locationId, locations.id))
      .where(eq(locations.prefecture, prefecture));

    return result[0].count;
  }

  private convertToMonument(row: {
    id: number;
    canonicalName: string;
    monumentType: string | null;
    monumentTypeUri: string | null;
    material: string | null;
    materialUri: string | null;
    createdAt: string;
    updatedAt: string;
  }): Monument {
    return {
      id: row.id,
      canonicalName: row.canonicalName,
      canonicalUri: null,
      monumentType: row.monumentType ?? null,
      monumentTypeUri: row.monumentTypeUri ?? null,
      material: row.material ?? null,
      materialUri: row.materialUri ?? null,
      createdAt: this.convertToISOString(row.createdAt),
      updatedAt: this.convertToISOString(row.updatedAt),
      inscriptions: null,
      events: null,
      media: null,
      locations: null,
      poets: null,
      sources: null,
      originalEstablishedDate: null,
      huTimeNormalized: null,
      intervalStart: null,
      intervalEnd: null,
      uncertaintyNote: null,
    };
  }

  private convertToISOString(date: string | Date): string {
    if (typeof date === "string") {
      return date;
    }
    return date.toISOString();
  }
}
