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

const convertToBoolean = (value: number | null): boolean | null => {
  if (value === null) return null;
  return value === 1;
};

const convertToNumber = (value: boolean | null): number | null => {
  if (value === null) return null;
  return value ? 1 : 0;
};

export class HaikuMonumentRepository implements IHaikuMonumentRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(queryParams: QueryParams): Promise<HaikuMonument[]> {
    let query = this.db
    .select({
      id: haikuMonuments.id,
      inscription: haikuMonuments.inscription,
      commentary: haikuMonuments.commentary,
      kigo: haikuMonuments.kigo,
      season: haikuMonuments.season,
      isReliable: haikuMonuments.isReliable,
      hasReverseInscription: haikuMonuments.hasReverseInscription,
      material: haikuMonuments.material,
      totalHeight: haikuMonuments.totalHeight,
      width: haikuMonuments.width,
      depth: haikuMonuments.depth,
      establishedDate: haikuMonuments.establishedDate,
      establishedYear: haikuMonuments.establishedYear,
      founder: haikuMonuments.founder,
      monumentType: haikuMonuments.monumentType,
      designationStatus: haikuMonuments.designationStatus,
      photoUrl: haikuMonuments.photoUrl,
      photoDate: haikuMonuments.photoDate,
      photographer: haikuMonuments.photographer,
      model3dUrl: haikuMonuments.model3dUrl,
      remarks: haikuMonuments.remarks,
      poetId: haikuMonuments.poetId,
      sourceId: haikuMonuments.sourceId,
      locationId: haikuMonuments.locationId,
      poet: poets,
      source: sources,
      location: locations,
      createdAt: haikuMonuments.createdAt,
      updatedAt: haikuMonuments.updatedAt,
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
            like(haikuMonuments.inscription, `%${queryParams.search}%`),
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
              case 'inscription':
                return direction === 'asc'
                  ? asc(haikuMonuments.inscription)
                  : desc(haikuMonuments.inscription);
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

    const result = await query.all();
    
    return result.map(item => ({
      ...item,
      isReliable: convertToBoolean(item.isReliable),
      hasReverseInscription: convertToBoolean(item.hasReverseInscription),
      poetId: item.poetId || null,
      sourceId: item.sourceId || null,
      locationId: item.locationId || null,
    }));
  }

  async getById(id: number): Promise<HaikuMonument | null> {
    const result = await this.db
    .select({
      id: haikuMonuments.id,
      inscription: haikuMonuments.inscription,
      commentary: haikuMonuments.commentary,
      kigo: haikuMonuments.kigo,
      season: haikuMonuments.season,
      isReliable: haikuMonuments.isReliable,
      hasReverseInscription: haikuMonuments.hasReverseInscription,
      material: haikuMonuments.material,
      totalHeight: haikuMonuments.totalHeight,
      width: haikuMonuments.width,
      depth: haikuMonuments.depth,
      establishedDate: haikuMonuments.establishedDate,
      establishedYear: haikuMonuments.establishedYear,
      founder: haikuMonuments.founder,
      monumentType: haikuMonuments.monumentType,
      designationStatus: haikuMonuments.designationStatus,
      photoUrl: haikuMonuments.photoUrl,
      photoDate: haikuMonuments.photoDate,
      photographer: haikuMonuments.photographer,
      model3dUrl: haikuMonuments.model3dUrl,
      remarks: haikuMonuments.remarks,
      poetId: haikuMonuments.poetId,
      sourceId: haikuMonuments.sourceId,
      locationId: haikuMonuments.locationId,
      poet: poets,
      source: sources,
      location: locations,
      createdAt: haikuMonuments.createdAt,
      updatedAt: haikuMonuments.updatedAt,
    })
      .from(haikuMonuments)
      .leftJoin(poets, eq(haikuMonuments.poetId, poets.id))
      .leftJoin(sources, eq(haikuMonuments.sourceId, sources.id))
      .leftJoin(locations, eq(haikuMonuments.locationId, locations.id))
      .where(eq(haikuMonuments.id, id))
      .limit(1)
      .all();

    if (result.length === 0) return null;
    
    const monument = result[0];
    return {
      ...monument,
      isReliable: convertToBoolean(monument.isReliable),
      hasReverseInscription: convertToBoolean(monument.hasReverseInscription),
    };
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
      inscription: monumentData.inscription,
      establishedDate: monumentData.establishedDate,
      commentary: monumentData.commentary,
      kigo: monumentData.kigo,
      season: monumentData.season,
      isReliable: convertToNumber(monumentData.isReliable ?? null),
      hasReverseInscription: convertToNumber(monumentData.hasReverseInscription ?? null),
      material: monumentData.material,
      totalHeight: monumentData.totalHeight,
      width: monumentData.width,
      depth: monumentData.depth,
      establishedYear: monumentData.establishedYear,
      founder: monumentData.founder,
      monumentType: monumentData.monumentType,
      designationStatus: monumentData.designationStatus,
      photoUrl: monumentData.photoUrl,
      photoDate: monumentData.photoDate,
      photographer: monumentData.photographer,
      model3dUrl: monumentData.model3dUrl,
      remarks: monumentData.remarks,
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
      inscription: haikuMonuments.inscription,
      commentary: haikuMonuments.commentary,
      kigo: haikuMonuments.kigo,
      season: haikuMonuments.season,
      isReliable: haikuMonuments.isReliable,
      hasReverseInscription: haikuMonuments.hasReverseInscription,
      material: haikuMonuments.material,
      totalHeight: haikuMonuments.totalHeight,
      width: haikuMonuments.width,
      depth: haikuMonuments.depth,
      establishedDate: haikuMonuments.establishedDate,
      establishedYear: haikuMonuments.establishedYear,
      founder: haikuMonuments.founder,
      monumentType: haikuMonuments.monumentType,
      designationStatus: haikuMonuments.designationStatus,
      photoUrl: haikuMonuments.photoUrl,
      photoDate: haikuMonuments.photoDate,
      photographer: haikuMonuments.photographer,
      model3dUrl: haikuMonuments.model3dUrl,
      remarks: haikuMonuments.remarks,
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

    const monument = fullRecord[0];
    return {
      ...monument,
      isReliable: convertToBoolean(monument.isReliable),
      hasReverseInscription: convertToBoolean(monument.hasReverseInscription),
    };
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
      inscription: monumentData.inscription ?? exists.inscription,
      establishedDate:
        monumentData.establishedDate !== undefined ? monumentData.establishedDate : exists.establishedDate,
      commentary:
        monumentData.commentary !== undefined ? monumentData.commentary : exists.commentary,
      kigo: 
        monumentData.kigo !== undefined ? monumentData.kigo : exists.kigo,
      season:
        monumentData.season !== undefined ? monumentData.season : exists.season,
      isReliable:
        monumentData.isReliable !== undefined ? convertToNumber(monumentData.isReliable ?? null) : convertToNumber(exists.isReliable),
      hasReverseInscription:
        monumentData.hasReverseInscription !== undefined ? convertToNumber(monumentData.hasReverseInscription ?? null) : convertToNumber(exists.hasReverseInscription),
      material:
        monumentData.material !== undefined ? monumentData.material : exists.material,
      totalHeight:
        monumentData.totalHeight !== undefined ? monumentData.totalHeight : exists.totalHeight,
      width:
        monumentData.width !== undefined ? monumentData.width : exists.width,
      depth:
        monumentData.depth !== undefined ? monumentData.depth : exists.depth,
      establishedYear:
        monumentData.establishedYear !== undefined ? monumentData.establishedYear : exists.establishedYear,
      founder:
        monumentData.founder !== undefined ? monumentData.founder : exists.founder,
      monumentType:
        monumentData.monumentType !== undefined ? monumentData.monumentType : exists.monumentType,
      designationStatus:
        monumentData.designationStatus !== undefined ? monumentData.designationStatus : exists.designationStatus,
      photoUrl: 
        monumentData.photoUrl !== undefined ? monumentData.photoUrl : exists.photoUrl,
      photoDate:
        monumentData.photoDate !== undefined ? monumentData.photoDate : exists.photoDate,
      photographer:
        monumentData.photographer !== undefined ? monumentData.photographer : exists.photographer,
      model3dUrl:
        monumentData.model3dUrl !== undefined ? monumentData.model3dUrl : exists.model3dUrl,
      remarks:
        monumentData.remarks !== undefined ? monumentData.remarks : exists.remarks,
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
      
    return {
      ...updated,
      isReliable: convertToBoolean(updated.isReliable),
      hasReverseInscription: convertToBoolean(updated.hasReverseInscription),
    };
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
        inscription: haikuMonuments.inscription,
        commentary: haikuMonuments.commentary,
        kigo: haikuMonuments.kigo,
        season: haikuMonuments.season,
        isReliable: haikuMonuments.isReliable,
        hasReverseInscription: haikuMonuments.hasReverseInscription,
        material: haikuMonuments.material,
        totalHeight: haikuMonuments.totalHeight,
        width: haikuMonuments.width,
        depth: haikuMonuments.depth,
        establishedDate: haikuMonuments.establishedDate,
        establishedYear: haikuMonuments.establishedYear,
        founder: haikuMonuments.founder,
        monumentType: haikuMonuments.monumentType,
        designationStatus: haikuMonuments.designationStatus,
        photoUrl: haikuMonuments.photoUrl,
        photoDate: haikuMonuments.photoDate,
        photographer: haikuMonuments.photographer,
        model3dUrl: haikuMonuments.model3dUrl,
        remarks: haikuMonuments.remarks,
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
      isReliable: convertToBoolean(item.isReliable),
      hasReverseInscription: convertToBoolean(item.hasReverseInscription),
      poetId: item.poetId || null,
      sourceId: item.sourceId || null,
      locationId: item.locationId || null,
    }));
  }

  async getByLocationId(locationId: number): Promise<HaikuMonument[]> {
    const result = await this.db
      .select({
        id: haikuMonuments.id,
        inscription: haikuMonuments.inscription,
        commentary: haikuMonuments.commentary,
        kigo: haikuMonuments.kigo,
        season: haikuMonuments.season,
        isReliable: haikuMonuments.isReliable,
        hasReverseInscription: haikuMonuments.hasReverseInscription,
        material: haikuMonuments.material,
        totalHeight: haikuMonuments.totalHeight,
        width: haikuMonuments.width,
        depth: haikuMonuments.depth,
        establishedDate: haikuMonuments.establishedDate,
        establishedYear: haikuMonuments.establishedYear,
        founder: haikuMonuments.founder,
        monumentType: haikuMonuments.monumentType,
        designationStatus: haikuMonuments.designationStatus,
        photoUrl: haikuMonuments.photoUrl,
        photoDate: haikuMonuments.photoDate,
        photographer: haikuMonuments.photographer,
        model3dUrl: haikuMonuments.model3dUrl,
        remarks: haikuMonuments.remarks,
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
        isReliable: convertToBoolean(item.isReliable),
        hasReverseInscription: convertToBoolean(item.hasReverseInscription),
        poetId: item.poetId || null,
        sourceId: item.sourceId || null,
        locationId: item.locationId || null,
      }));
  }

  async getBySourceId(sourceId: number): Promise<HaikuMonument[]> {
    const result = await this.db
      .select({
        id: haikuMonuments.id,
        inscription: haikuMonuments.inscription,
        commentary: haikuMonuments.commentary,
        kigo: haikuMonuments.kigo,
        season: haikuMonuments.season,
        isReliable: haikuMonuments.isReliable,
        hasReverseInscription: haikuMonuments.hasReverseInscription,
        material: haikuMonuments.material,
        totalHeight: haikuMonuments.totalHeight,
        width: haikuMonuments.width,
        depth: haikuMonuments.depth,
        establishedDate: haikuMonuments.establishedDate,
        establishedYear: haikuMonuments.establishedYear,
        founder: haikuMonuments.founder,
        monumentType: haikuMonuments.monumentType,
        designationStatus: haikuMonuments.designationStatus,
        photoUrl: haikuMonuments.photoUrl,
        photoDate: haikuMonuments.photoDate,
        photographer: haikuMonuments.photographer,
        model3dUrl: haikuMonuments.model3dUrl,
        remarks: haikuMonuments.remarks,
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
        isReliable: convertToBoolean(item.isReliable),
        hasReverseInscription: convertToBoolean(item.hasReverseInscription),
        poetId: item.poetId || null,
        sourceId: item.sourceId || null,
        locationId: item.locationId || null,
      }));
  }
}