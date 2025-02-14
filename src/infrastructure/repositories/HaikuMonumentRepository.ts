import type { IHaikuMonumentRepository } from '../../domain/repositories/IHaikuMonumentRepository';
import type { HaikuMonument } from '../../domain/entities/HaikuMonument';
import { getDB } from '../db/db';
import { haikuMonument, authors, sources, locations } from '../db/schema';
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

  async getAll(queryParams?: QueryParams): Promise<HaikuMonument[]> {
    let query = this.db
      .select({
        id: haikuMonument.id,
        text: haikuMonument.text,
        establishedDate: haikuMonument.establishedDate,
        commentary: haikuMonument.commentary,
        imageUrl: haikuMonument.imageUrl,
        createdAt: haikuMonument.createdAt,
        updatedAt: haikuMonument.updatedAt,
        authorId: haikuMonument.authorId,
        sourceId: haikuMonument.sourceId,
        locationId: haikuMonument.locationId,
        author: authors,
        source: sources,
        location: locations,
      })
      .from(haikuMonument)
      .leftJoin(authors, eq(haikuMonument.authorId, authors.id))
      .leftJoin(sources, eq(haikuMonument.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonument.locationId, locations.id));

    if (queryParams) {
      const conditions = [];

      if (queryParams.search) {
        conditions.push(
          or(
            like(haikuMonument.text, `%${queryParams.search}%`),
            like(haikuMonument.commentary, `%${queryParams.search}%`)
          )
        );
      }
      if (queryParams.title_contains) {
        conditions.push(like(sources.title, `%${queryParams.title_contains}%`));
      }
      if (queryParams.description_contains) {
        conditions.push(like(haikuMonument.commentary, `%${queryParams.description_contains}%`));
      }
      if (queryParams.name_contains) {
        conditions.push(like(authors.name, `%${queryParams.name_contains}%`));
      }
      if (queryParams.biography_contains) {
        conditions.push(like(authors.biography, `%${queryParams.biography_contains}%`));
      }
      if (queryParams.prefecture) {
        conditions.push(eq(locations.prefecture, queryParams.prefecture));
      }
      if (queryParams.region) {
        conditions.push(like(locations.region, `%${queryParams.region}%`));
      }
      if (queryParams.created_at_gt) {
        conditions.push(gt(haikuMonument.createdAt, queryParams.created_at_gt));
      }
      if (queryParams.created_at_lt) {
        conditions.push(lt(haikuMonument.createdAt, queryParams.created_at_lt));
      }
      if (queryParams.updated_at_gt) {
        conditions.push(gt(haikuMonument.updatedAt, queryParams.updated_at_gt));
      }
      if (queryParams.updated_at_lt) {
        conditions.push(lt(haikuMonument.updatedAt, queryParams.updated_at_lt));
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
                  ? asc(haikuMonument.createdAt)
                  : desc(haikuMonument.createdAt);
              case 'updated_at':
                return direction === 'asc'
                  ? asc(haikuMonument.updatedAt)
                  : desc(haikuMonument.updatedAt);
              case 'established_date':
                return direction === 'asc'
                  ? asc(haikuMonument.establishedDate)
                  : desc(haikuMonument.establishedDate);
              case 'text':
                return direction === 'asc'
                  ? asc(haikuMonument.text)
                  : desc(haikuMonument.text);
              case 'author':
              case 'author_name':
                return direction === 'asc'
                  ? asc(authors.name)
                  : desc(authors.name);
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
        id: haikuMonument.id,
        text: haikuMonument.text,
        establishedDate: haikuMonument.establishedDate,
        commentary: haikuMonument.commentary,
        imageUrl: haikuMonument.imageUrl,
        createdAt: haikuMonument.createdAt,
        updatedAt: haikuMonument.updatedAt,
        authorId: haikuMonument.authorId,
        sourceId: haikuMonument.sourceId,
        locationId: haikuMonument.locationId,
        author: authors,
        source: sources,
        location: locations,
      })
      .from(haikuMonument)
      .leftJoin(authors, eq(haikuMonument.authorId, authors.id))
      .leftJoin(sources, eq(haikuMonument.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonument.locationId, locations.id))
      .where(eq(haikuMonument.id, id))
      .limit(1)
      .all();
    return result.length > 0 ? result[0] : null;
  }

  async create(monumentData: HaikuMonument): Promise<HaikuMonument> {
    let authorId: number | null = monumentData.authorId;
    if (monumentData.author) {
      const [insertedAuthor] = await this.db
        .insert(authors)
        .values({
          name: monumentData.author.name,
          biography: monumentData.author.biography,
          links: monumentData.author.links,
          imageUrl: monumentData.author.imageUrl,
        })
        .returning();
      authorId = insertedAuthor.id;
    }

    let sourceId: number | null = monumentData.sourceId;
    if (monumentData.source) {
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

    let locationId: number | null = monumentData.locationId;
    if (monumentData.location) {
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

    const monumentToInsert = {
      text: monumentData.text,
      authorId: authorId,
      sourceId: sourceId,
      establishedDate: monumentData.establishedDate,
      locationId: locationId,
      commentary: monumentData.commentary,
      imageUrl: monumentData.imageUrl,
    };

    const [insertedMonument] = await this.db
      .insert(haikuMonument)
      .values(monumentToInsert)
      .returning();

    return insertedMonument;
  }

  async update(
    id: number,
    monumentData: Partial<HaikuMonument>
  ): Promise<HaikuMonument | null> {
    const exists = await this.getById(id);
    if (!exists) return null;
    const [updated] = await this.db
      .update(haikuMonument)
      .set(monumentData)
      .where(eq(haikuMonument.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(haikuMonument)
      .where(eq(haikuMonument.id, id))
      .returning();
    return results.length > 0;
  }

  async getByAuthorId(authorId: number): Promise<HaikuMonument[]> {
    const result = await this.db
      .select({
        id: haikuMonument.id,
        text: haikuMonument.text,
        establishedDate: haikuMonument.establishedDate,
        commentary: haikuMonument.commentary,
        imageUrl: haikuMonument.imageUrl,
        createdAt: haikuMonument.createdAt,
        updatedAt: haikuMonument.updatedAt,
        authorId: haikuMonument.authorId,
        sourceId: haikuMonument.sourceId,
        locationId: haikuMonument.locationId,
        author: authors,
        source: sources,
        location: locations,
      })
      .from(haikuMonument)
      .leftJoin(authors, eq(haikuMonument.authorId, authors.id))
      .leftJoin(sources, eq(haikuMonument.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonument.locationId, locations.id))
      .where(eq(haikuMonument.authorId, authorId))
      .all();
  
    return result.map(item => ({
      ...item,
      authorId: item.authorId || null,
      sourceId: item.sourceId || null,
      locationId: item.locationId || null,
    }));
  }

  async getByLocationId(locationId: number): Promise<HaikuMonument[]> {
    const result = await this.db
      .select({
        id: haikuMonument.id,
        text: haikuMonument.text,
        establishedDate: haikuMonument.establishedDate,
        commentary: haikuMonument.commentary,
        imageUrl: haikuMonument.imageUrl,
        createdAt: haikuMonument.createdAt,
        updatedAt: haikuMonument.updatedAt,
        authorId: haikuMonument.authorId,
        sourceId: haikuMonument.sourceId,
        locationId: haikuMonument.locationId,
        author: authors,
        source: sources,
        location: locations,
      })
      .from(haikuMonument)
      .leftJoin(authors, eq(haikuMonument.authorId, authors.id))
      .leftJoin(sources, eq(haikuMonument.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonument.locationId, locations.id))
      .where(eq(haikuMonument.locationId, locationId))
      .all();
  
      return result.map(item => ({
        ...item,
        authorId: item.authorId || null,
        sourceId: item.sourceId || null,
        locationId: item.locationId || null,
      }));
  }

  async getBySourceId(sourceId: number): Promise<HaikuMonument[]> {
    const result = await this.db
      .select({
        id: haikuMonument.id,
        text: haikuMonument.text,
        establishedDate: haikuMonument.establishedDate,
        commentary: haikuMonument.commentary,
        imageUrl: haikuMonument.imageUrl,
        createdAt: haikuMonument.createdAt,
        updatedAt: haikuMonument.updatedAt,
        authorId: haikuMonument.authorId,
        sourceId: haikuMonument.sourceId,
        locationId: haikuMonument.locationId,
        author: authors,
        source: sources,
        location: locations,
      })
      .from(haikuMonument)
      .leftJoin(authors, eq(haikuMonument.authorId, authors.id))
      .leftJoin(sources, eq(haikuMonument.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonument.locationId, locations.id))
      .where(eq(haikuMonument.sourceId, sourceId))
      .all();
  
      return result.map(item => ({
        ...item,
        authorId: item.authorId || null,
        sourceId: item.sourceId || null,
        locationId: item.locationId || null,
      }));
  }
}