import type { IHaikuMonumentRepository } from '../../domain/repositories/IHaikuMonumentRepository';
import type { HaikuMonument } from '../../domain/entities/HaikuMonument';
import { getDB } from '../db/db';
import { haikuMonument, authors, sources, locations } from '../db/schema';
import { eq } from 'drizzle-orm/expressions';
import type { D1Database } from '@cloudflare/workers-types';

export class HaikuMonumentRepository implements IHaikuMonumentRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(): Promise<HaikuMonument[]> {
    const results = await this.db
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
    return results;
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
      .limit(1);
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
  

  async update(id: number, monumentData: Partial<HaikuMonument>): Promise<HaikuMonument | null> {
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
    const results = await this.db.delete(haikuMonument).where(eq(haikuMonument.id, id)).returning();
    return results.length > 0;
  }
}
