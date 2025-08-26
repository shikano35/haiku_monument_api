import { eq, count, sql, and,  like, desc, asc } from "drizzle-orm";
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
  poems,
  events,
  media,
  poets,
  sources,
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
      limit: paramLimit = 50,
      offset: paramOffset = 0,
      search,
      prefecture,
      region,
      monumentType,
      q,
      canonicalNameContains,
      ordering: paramOrdering = [],
    } = params;

    const limit = paramLimit ?? 50;
    const offset = paramOffset ?? 0;
    const ordering = paramOrdering ?? [];

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
    if (ordering && Array.isArray(ordering) && ordering.length > 0) {
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
    return Promise.all(
      results.map(async (row) => this.convertToMonumentWithRelations(row)),
    );
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

    return this.convertToMonumentWithRelations(result[0]);
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

    return Promise.all(
      results.map(async (row) => this.convertToMonumentWithRelations(row)),
    );
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

    return Promise.all(
      results.map(async (row) => this.convertToMonumentWithRelations(row)),
    );
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

    return Promise.all(
      results.map(async (row) => this.convertToMonumentWithRelations(row)),
    );
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

    return Promise.all(
      results.map(async (row) => this.convertToMonumentWithRelations(row)),
    );
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

  private async convertToMonumentWithRelations(row: {
    id: number;
    canonicalName: string;
    monumentType: string | null;
    monumentTypeUri: string | null;
    material: string | null;
    materialUri: string | null;
    createdAt: string;
    updatedAt: string;
  }): Promise<Monument> {
    const relatedInscriptions = await this.db
      .select()
      .from(inscriptions)
      .where(eq(inscriptions.monumentId, row.id));

    const inscriptionsWithPoems = await Promise.all(
      relatedInscriptions.map(async (inscription) => {
        const relatedPoems = await this.db
          .select({
            id: poems.id,
            text: poems.text,
            normalizedText: poems.normalizedText,
            textHash: poems.textHash,
            kigo: poems.kigo,
            season: poems.season,
            createdAt: poems.createdAt,
            updatedAt: poems.updatedAt,
          })
          .from(poems)
          .innerJoin(inscriptionPoems, eq(poems.id, inscriptionPoems.poemId))
          .where(eq(inscriptionPoems.inscriptionId, inscription.id));

        const inscriptionSource = inscription.sourceId
          ? await this.db
              .select()
              .from(sources)
              .where(eq(sources.id, inscription.sourceId))
              .limit(1)
          : [];

        return {
          id: inscription.id,
          monumentId: inscription.monumentId,
          side: inscription.side,
          originalText: inscription.originalText,
          transliteration: inscription.transliteration,
          reading: inscription.reading,
          language: inscription.language ?? "ja",
          notes: inscription.notes,
          sourceId: inscription.sourceId,
          poems: relatedPoems.map((poem) => ({
            id: poem.id,
            text: poem.text,
            normalizedText: poem.normalizedText,
            textHash: poem.textHash,
            kigo: poem.kigo,
            season: poem.season,
            attributions: null,
            inscriptions: null,
            createdAt: this.convertToISOString(poem.createdAt),
            updatedAt: this.convertToISOString(poem.updatedAt),
          })),
          monument: null,
          source:
            inscriptionSource.length > 0
              ? {
                  id: inscriptionSource[0].id,
                  citation: inscriptionSource[0].citation,
                  author: inscriptionSource[0].author,
                  title: inscriptionSource[0].title,
                  publisher: inscriptionSource[0].publisher,
                  sourceYear: inscriptionSource[0].sourceYear,
                  url: inscriptionSource[0].url,
                  monuments: null,
                  createdAt: this.convertToISOString(
                    inscriptionSource[0].createdAt,
                  ),
                  updatedAt: this.convertToISOString(
                    inscriptionSource[0].updatedAt,
                  ),
                }
              : null,
          createdAt: this.convertToISOString(inscription.createdAt),
          updatedAt: this.convertToISOString(inscription.updatedAt),
        };
      }),
    );

    const relatedEvents = await this.db
      .select()
      .from(events)
      .where(eq(events.monumentId, row.id));

    const eventsWithSources = await Promise.all(
      relatedEvents.map(async (event) => {
        const eventSource = event.sourceId
          ? await this.db
              .select()
              .from(sources)
              .where(eq(sources.id, event.sourceId))
              .limit(1)
          : [];

        return {
          id: event.id,
          monumentId: event.monumentId,
          eventType: event.eventType,
          huTimeNormalized: event.huTimeNormalized,
          intervalStart: event.intervalStart,
          intervalEnd: event.intervalEnd,
          uncertaintyNote: event.uncertaintyNote,
          actor: event.actor,
          sourceId: event.sourceId,
          source:
            eventSource.length > 0
              ? {
                  id: eventSource[0].id,
                  citation: eventSource[0].citation,
                  author: eventSource[0].author,
                  title: eventSource[0].title,
                  publisher: eventSource[0].publisher,
                  sourceYear: eventSource[0].sourceYear,
                  url: eventSource[0].url,
                  monuments: null,
                  createdAt: this.convertToISOString(eventSource[0].createdAt),
                  updatedAt: this.convertToISOString(eventSource[0].updatedAt),
                }
              : null,
          createdAt: this.convertToISOString(event.createdAt),
        };
      }),
    );

    const relatedMedia = await this.db
      .select()
      .from(media)
      .where(eq(media.monumentId, row.id));

    const relatedLocations = await this.db
      .select({
        id: locations.id,
        imiPrefCode: locations.imiPrefCode,
        region: locations.region,
        prefecture: locations.prefecture,
        municipality: locations.municipality,
        address: locations.address,
        placeName: locations.placeName,
        latitude: locations.latitude,
        longitude: locations.longitude,
        geohash: locations.geohash,
        geomGeojson: locations.geomGeojson,
        accuracyM: locations.accuracyM,
        createdAt: locations.createdAt,
        updatedAt: locations.updatedAt,
      })
      .from(locations)
      .innerJoin(
        monumentLocations,
        eq(locations.id, monumentLocations.locationId),
      )
      .where(eq(monumentLocations.monumentId, row.id));

    const relatedPoets = await this.db
      .select({
        id: poets.id,
        name: poets.name,
        nameKana: poets.nameKana,
        biography: poets.biography,
        birthYear: poets.birthYear,
        deathYear: poets.deathYear,
        linkUrl: poets.linkUrl,
        imageUrl: poets.imageUrl,
        createdAt: poets.createdAt,
        updatedAt: poets.updatedAt,
      })
      .from(poets)
      .innerJoin(poemAttributions, eq(poets.id, poemAttributions.poetId))
      .innerJoin(poems, eq(poemAttributions.poemId, poems.id))
      .innerJoin(inscriptionPoems, eq(poems.id, inscriptionPoems.poemId))
      .innerJoin(
        inscriptions,
        eq(inscriptionPoems.inscriptionId, inscriptions.id),
      )
      .where(eq(inscriptions.monumentId, row.id));

    const relatedSources = await this.db
      .select()
      .from(sources)
      .innerJoin(inscriptions, eq(sources.id, inscriptions.sourceId))
      .where(eq(inscriptions.monumentId, row.id));

    return {
      id: row.id,
      canonicalName: row.canonicalName,
      canonicalUri: `https://api.kuhi.jp/monuments/${row.id}`,
      monumentType: row.monumentType ?? null,
      monumentTypeUri: row.monumentTypeUri ?? null,
      material: row.material ?? null,
      materialUri: row.materialUri ?? null,
      createdAt: this.convertToISOString(row.createdAt),
      updatedAt: this.convertToISOString(row.updatedAt),
      inscriptions: inscriptionsWithPoems,
      events: eventsWithSources,
      media: relatedMedia.map((mediaItem) => ({
        id: mediaItem.id,
        monumentId: mediaItem.monumentId,
        mediaType: mediaItem.mediaType,
        url: mediaItem.url,
        iiifManifestUrl: mediaItem.iiifManifestUrl,
        capturedAt: mediaItem.capturedAt,
        photographer: mediaItem.photographer,
        license: mediaItem.license,
        exifJson: mediaItem.exifJson,
        createdAt: this.convertToISOString(mediaItem.createdAt),
        updatedAt: this.convertToISOString(mediaItem.updatedAt),
      })),
      locations: relatedLocations.map((location) => ({
        id: location.id,
        imiPrefCode: location.imiPrefCode,
        region: location.region,
        prefecture: location.prefecture,
        municipality: location.municipality,
        address: location.address,
        placeName: location.placeName,
        latitude: location.latitude,
        longitude: location.longitude,
        geohash: location.geohash,
        geomGeojson: location.geomGeojson,
        accuracyM: location.accuracyM,
        createdAt: this.convertToISOString(location.createdAt),
        updatedAt: this.convertToISOString(location.updatedAt),
      })),
      poets: relatedPoets.map((poet) => ({
        id: poet.id,
        name: poet.name,
        nameKana: poet.nameKana,
        biography: poet.biography,
        birthYear: poet.birthYear,
        deathYear: poet.deathYear,
        linkUrl: poet.linkUrl,
        imageUrl: poet.imageUrl,
        createdAt: this.convertToISOString(poet.createdAt),
        updatedAt: this.convertToISOString(poet.updatedAt),
      })),
      sources: relatedSources.map((sourceResult) => ({
        id: sourceResult.sources.id,
        citation: sourceResult.sources.citation,
        author: sourceResult.sources.author,
        title: sourceResult.sources.title,
        publisher: sourceResult.sources.publisher,
        sourceYear: sourceResult.sources.sourceYear,
        url: sourceResult.sources.url,
        monuments: null,
        createdAt: this.convertToISOString(sourceResult.sources.createdAt),
        updatedAt: this.convertToISOString(sourceResult.sources.updatedAt),
      })),
      originalEstablishedDate: null,
      huTimeNormalized: null,
      intervalStart: null,
      intervalEnd: null,
      uncertaintyNote: null,
    };
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
