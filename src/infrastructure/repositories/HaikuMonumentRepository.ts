import type { IHaikuMonumentRepository } from '../../domain/repositories/IHaikuMonumentRepository';
import type { CreateHaikuMonumentInput, HaikuMonument, UpdateHaikuMonumentInput } from '../../domain/entities/HaikuMonument';
import { getDB } from '../db/db';
import { haikuMonuments, poets, sources, locations } from '../db/schema';
import {
  eq,
  and,
  or,
  like,
  asc,
  desc,
  gt,
  lt,
} from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';
import type { QueryParams } from '../../domain/common/QueryParams';

export class HaikuMonumentRepository implements IHaikuMonumentRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(queryParams: QueryParams): Promise<HaikuMonument[]> {
    let query = this.db
      .select({
        id: haikuMonuments.id,
        text: haikuMonuments.text,
        establishedDate: haikuMonuments.establishedDate,
        commentary: haikuMonuments.commentary,
        imageUrl: haikuMonuments.imageUrl,
        createdAt: haikuMonuments.createdAt,
        updatedAt: haikuMonuments.updatedAt,
        poetId: haikuMonuments.poetId,
        sourceId: haikuMonuments.sourceId,
        locationId: haikuMonuments.locationId,
        poet: poets,
        source: sources,
        location: locations,
      })
      .from(haikuMonuments)
      .leftJoin(poets, eq(haikuMonuments.poetId, poets.id))
      .leftJoin(sources, eq(haikuMonuments.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonuments.locationId, locations.id));

    if (queryParams) {
      const conditions = [];

      if (queryParams.search) {
        conditions.push(
          or(
            like(haikuMonuments.text, `%${queryParams.search}%`),
            like(haikuMonuments.commentary, `%${queryParams.search}%`)
          )
        );
      }
      if (queryParams.title_contains) {
        conditions.push(like(sources.title, `%${queryParams.title_contains}%`));
      }
      if (queryParams.description_contains) {
        conditions.push(like(haikuMonuments.commentary, `%${queryParams.description_contains}%`));
      }
      if (queryParams.name_contains) {
        conditions.push(like(poets.name, `%${queryParams.name_contains}%`));
      }
      if (queryParams.biography_contains) {
        conditions.push(like(poets.biography, `%${queryParams.biography_contains}%`));
      }
      if (queryParams.prefecture) {
        conditions.push(eq(locations.prefecture, queryParams.prefecture));
      }
      if (queryParams.region) {
        conditions.push(like(locations.region, `%${queryParams.region}%`));
      }
      if (queryParams.created_at_gt) {
        conditions.push(gt(haikuMonuments.createdAt, queryParams.created_at_gt));
      }
      if (queryParams.created_at_lt) {
        conditions.push(lt(haikuMonuments.createdAt, queryParams.created_at_lt));
      }
      if (queryParams.updated_at_gt) {
        conditions.push(gt(haikuMonuments.updatedAt, queryParams.updated_at_gt));
      }
      if (queryParams.updated_at_lt) {
        conditions.push(lt(haikuMonuments.updatedAt, queryParams.updated_at_lt));
      }
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      if (queryParams.ordering?.length) {
        const orderClauses = queryParams.ordering
          .map((order) => {
            const direction = order.startsWith('-') ? 'desc' : 'asc';
            const columnName = order.startsWith('-') ? order.substring(1) : order;
            switch (columnName) {
              case 'created_at':
                return direction === 'asc'
                  ? asc(haikuMonuments.createdAt)
                  : desc(haikuMonuments.createdAt);
              case 'updated_at':
                return direction === 'asc'
                  ? asc(haikuMonuments.updatedAt)
                  : desc(haikuMonuments.updatedAt);
              case 'established_date':
                return direction === 'asc'
                  ? asc(haikuMonuments.establishedDate)
                  : desc(haikuMonuments.establishedDate);
              case 'text':
                return direction === 'asc'
                  ? asc(haikuMonuments.text)
                  : desc(haikuMonuments.text);
              case 'poet':
              case 'poet_name':
                return direction === 'asc'
                  ? asc(poets.name)
                  : desc(poets.name);
              case 'source':
              case 'source_title':
                return direction === 'asc'
                  ? asc(sources.title)
                  : desc(sources.title);
              case 'prefecture':
                return direction === 'asc'
                  ? asc(locations.prefecture)
                  : desc(locations.prefecture);
              case 'region':
                return direction === 'asc'
                  ? asc(locations.region)
                  : desc(locations.region);
              default:
                return undefined;
            }
          })
          .filter(
            (clause): clause is Exclude<typeof clause, undefined> => clause !== undefined
          );
        if (orderClauses.length > 0) {
          query = query.orderBy(...orderClauses) as typeof query;
        }
      }
      if (typeof queryParams.limit === 'number') {
        query = query.limit(queryParams.limit) as typeof query;
      }
      if (typeof queryParams.offset === 'number') {
        query = query.offset(queryParams.offset) as typeof query;
      }
    }

    return await query.all();
  }

  async getById(id: number): Promise<HaikuMonument | null> {
    const result = await this.db
      .select({
        id: haikuMonuments.id,
        text: haikuMonuments.text,
        establishedDate: haikuMonuments.establishedDate,
        commentary: haikuMonuments.commentary,
        imageUrl: haikuMonuments.imageUrl,
        createdAt: haikuMonuments.createdAt,
        updatedAt: haikuMonuments.updatedAt,
        poetId: haikuMonuments.poetId,
        sourceId: haikuMonuments.sourceId,
        locationId: haikuMonuments.locationId,
        poet: poets,
        source: sources,
        location: locations,
      })
      .from(haikuMonuments)
      .leftJoin(poets, eq(haikuMonuments.poetId, poets.id))
      .leftJoin(sources, eq(haikuMonuments.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonuments.locationId, locations.id))
      .where(eq(haikuMonuments.id, id))
      .limit(1)
      .all();

    return result.length > 0 ? result[0] : null;
  }

  async create(monumentData: CreateHaikuMonumentInput): Promise<HaikuMonument> {
    let poetId: number | null = null;
    if (monumentData.poet) {
      if ('id' in monumentData.poet) {
        poetId = monumentData.poet.id;
      } else {
        const [insertedPoet] = await this.db
          .insert(poets)
          .values({
            name: monumentData.poet.name,
            biography: monumentData.poet.biography,
            links: monumentData.poet.links,
            imageUrl: monumentData.poet.imageUrl,
          })
          .returning();
        poetId = insertedPoet.id;
      }
    }

    let sourceId: number | null = null;
    if (monumentData.source) {
      if ('id' in monumentData.source) {
        sourceId = monumentData.source.id;
      } else {
        const [insertedSource] = await this.db
          .insert(sources)
          .values({
            title: monumentData.source.title,
            author: monumentData.source.author,
            year: monumentData.source.year,
            url: monumentData.source.url,
            publisher: monumentData.source.publisher,
          })
          .returning();
        sourceId = insertedSource.id;
      }
    }

    let locationId: number | null = null;
    if (monumentData.location) {
      if ('id' in monumentData.location) {
        locationId = monumentData.location.id;
      } else {
        const [insertedLocation] = await this.db
          .insert(locations)
          .values({
            prefecture: monumentData.location.prefecture,
            region: monumentData.location.region,
            address: monumentData.location.address,
            latitude: monumentData.location.latitude,
            longitude: monumentData.location.longitude,
            name: monumentData.location.name,
          })
          .returning();
        locationId = insertedLocation.id;
      }
    }

    const monumentToInsert = {
      text: monumentData.text,
      establishedDate: monumentData.establishedDate,
      commentary: monumentData.commentary,
      imageUrl: monumentData.imageUrl,
      poetId,
      sourceId,
      locationId,
    };

    const [insertedMonument] = await this.db
      .insert(haikuMonuments)
      .values(monumentToInsert)
      .returning();

      const fullRecord = await this.db
    .select({
      id: haikuMonuments.id,
      text: haikuMonuments.text,
      establishedDate: haikuMonuments.establishedDate,
      commentary: haikuMonuments.commentary,
      imageUrl: haikuMonuments.imageUrl,
      createdAt: haikuMonuments.createdAt,
      updatedAt: haikuMonuments.updatedAt,
      poetId: haikuMonuments.poetId,
      sourceId: haikuMonuments.sourceId,
      locationId: haikuMonuments.locationId,
      poet: poets,
      source: sources,
      location: locations,
    })
    .from(haikuMonuments)
    .leftJoin(poets, eq(haikuMonuments.poetId, poets.id))
    .leftJoin(sources, eq(haikuMonuments.sourceId, sources.id))
    .leftJoin(locations, eq(haikuMonuments.locationId, locations.id))
    .where(eq(haikuMonuments.id, insertedMonument.id))
    .limit(1)
    .all();

  return fullRecord[0];
  }

  async update(id: number, monumentData: UpdateHaikuMonumentInput): Promise<HaikuMonument | null> {
    const exists = await this.getById(id);
    if (!exists) return null;

    let poetId: number | null = exists.poetId;
    if (monumentData.poet !== undefined) {
      if (monumentData.poet) {
        if ('id' in monumentData.poet) {
          poetId = monumentData.poet.id;
        } else {
          const [insertedPoet] = await this.db
            .insert(poets)
            .values({
              name: monumentData.poet.name,
              biography: monumentData.poet.biography,
              links: monumentData.poet.links,
              imageUrl: monumentData.poet.imageUrl,
            })
            .returning();
          poetId = insertedPoet.id;
        }
      } else {
        poetId = null;
      }
    }

    let sourceId: number | null = exists.sourceId;
    if (monumentData.source !== undefined) {
      if (monumentData.source) {
        if ('id' in monumentData.source) {
          sourceId = monumentData.source.id;
        } else {
          const [insertedSource] = await this.db
            .insert(sources)
            .values({
              title: monumentData.source.title,
              author: monumentData.source.author,
              year: monumentData.source.year,
              url: monumentData.source.url,
              publisher: monumentData.source.publisher,
            })
            .returning();
          sourceId = insertedSource.id;
        }
      } else {
        sourceId = null;
      }
    }

    let locationId: number | null = exists.locationId;
    if (monumentData.location !== undefined) {
      if (monumentData.location) {
        if ('id' in monumentData.location) {
          locationId = monumentData.location.id;
        } else {
          const [insertedLocation] = await this.db
            .insert(locations)
            .values({
              prefecture: monumentData.location.prefecture,
              region: monumentData.location.region,
              address: monumentData.location.address,
              latitude: monumentData.location.latitude,
              longitude: monumentData.location.longitude,
              name: monumentData.location.name,
            })
            .returning();
          locationId = insertedLocation.id;
        }
      } else {
        locationId = null;
      }
    }

    const monumentToUpdate = {
      text: monumentData.text ?? exists.text,
      establishedDate:
        monumentData.establishedDate !== undefined ? monumentData.establishedDate : exists.establishedDate,
      commentary:
        monumentData.commentary !== undefined ? monumentData.commentary : exists.commentary,
      imageUrl: monumentData.imageUrl !== undefined ? monumentData.imageUrl : exists.imageUrl,
      poetId,
      sourceId,
      locationId,
      updatedAt: new Date().toISOString(),
    };

    const [updated] = await this.db
      .update(haikuMonuments)
      .set(monumentToUpdate)
      .where(eq(haikuMonuments.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(haikuMonuments)
      .where(eq(haikuMonuments.id, id))
      .returning();
    return results.length > 0;
  }

  async getByPoetId(poetId: number): Promise<HaikuMonument[]> {
    const result = await this.db
      .select({
        id: haikuMonuments.id,
        text: haikuMonuments.text,
        establishedDate: haikuMonuments.establishedDate,
        commentary: haikuMonuments.commentary,
        imageUrl: haikuMonuments.imageUrl,
        createdAt: haikuMonuments.createdAt,
        updatedAt: haikuMonuments.updatedAt,
        poetId: haikuMonuments.poetId,
        sourceId: haikuMonuments.sourceId,
        locationId: haikuMonuments.locationId,
        poet: poets,
        source: sources,
        location: locations,
      })
      .from(haikuMonuments)
      .leftJoin(poets, eq(haikuMonuments.poetId, poets.id))
      .leftJoin(sources, eq(haikuMonuments.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonuments.locationId, locations.id))
      .where(eq(haikuMonuments.poetId, poetId))
      .all();
  
    return result.map(item => ({
      ...item,
      poetId: item.poetId || null,
      sourceId: item.sourceId || null,
      locationId: item.locationId || null,
    }));
  }

  async getByLocationId(locationId: number): Promise<HaikuMonument[]> {
    const result = await this.db
      .select({
        id: haikuMonuments.id,
        text: haikuMonuments.text,
        establishedDate: haikuMonuments.establishedDate,
        commentary: haikuMonuments.commentary,
        imageUrl: haikuMonuments.imageUrl,
        createdAt: haikuMonuments.createdAt,
        updatedAt: haikuMonuments.updatedAt,
        poetId: haikuMonuments.poetId,
        sourceId: haikuMonuments.sourceId,
        locationId: haikuMonuments.locationId,
        poet: poets,
        source: sources,
        location: locations,
      })
      .from(haikuMonuments)
      .leftJoin(poets, eq(haikuMonuments.poetId, poets.id))
      .leftJoin(sources, eq(haikuMonuments.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonuments.locationId, locations.id))
      .where(eq(haikuMonuments.locationId, locationId))
      .all();
  
      return result.map(item => ({
        ...item,
        poetId: item.poetId || null,
        sourceId: item.sourceId || null,
        locationId: item.locationId || null,
      }));
  }

  async getBySourceId(sourceId: number): Promise<HaikuMonument[]> {
    const result = await this.db
      .select({
        id: haikuMonuments.id,
        text: haikuMonuments.text,
        establishedDate: haikuMonuments.establishedDate,
        commentary: haikuMonuments.commentary,
        imageUrl: haikuMonuments.imageUrl,
        createdAt: haikuMonuments.createdAt,
        updatedAt: haikuMonuments.updatedAt,
        poetId: haikuMonuments.poetId,
        sourceId: haikuMonuments.sourceId,
        locationId: haikuMonuments.locationId,
        poet: poets,
        source: sources,
        location: locations,
      })
      .from(haikuMonuments)
      .leftJoin(poets, eq(haikuMonuments.poetId, poets.id))
      .leftJoin(sources, eq(haikuMonuments.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonuments.locationId, locations.id))
      .where(eq(haikuMonuments.sourceId, sourceId))
      .all();
  
      return result.map(item => ({
        ...item,
        poetId: item.poetId || null,
        sourceId: item.sourceId || null,
        locationId: item.locationId || null,
      }));
  }
}