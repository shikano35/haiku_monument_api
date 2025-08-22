import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, count, and, like, desc, asc } from "drizzle-orm";
import type { IMediaRepository } from "../../domain/repositories/IMediaRepository";
import type {
  Media,
  CreateMediaInput,
  UpdateMediaInput,
} from "../../domain/entities/Media";
import type { MediaQueryParams } from "../../domain/common/QueryParams";
import { media } from "../db/schema";

export class MediaRepository implements IMediaRepository {
  constructor(private db: DrizzleD1Database) {}

  async getAll(queryParams?: MediaQueryParams): Promise<Media[]> {
    const {
      limit: paramLimit = 50,
      offset: paramOffset = 0,
      ordering: paramOrdering = [],
      search,
      monumentId,
      mediaType,
      photographer,
    } = queryParams || {};

    const limit = paramLimit ?? 50;
    const offset = paramOffset ?? 0;
    const ordering = paramOrdering ?? [];

    let query = this.db.select().from(media);

    const conditions = [];

    if (monumentId) {
      conditions.push(eq(media.monumentId, monumentId));
    }

    if (mediaType) {
      conditions.push(eq(media.mediaType, mediaType));
    }

    if (photographer) {
      conditions.push(eq(media.photographer, photographer));
    }

    // 全文検索
    if (search) {
      conditions.push(like(media.url, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    if (ordering.length > 0) {
      const orderClauses = ordering.map((order) => {
        const isDesc = order.startsWith("-");
        const field = isDesc ? order.slice(1) : order;

        switch (field) {
          case "monumentId":
            return isDesc ? desc(media.monumentId) : asc(media.monumentId);
          case "mediaType":
            return isDesc ? desc(media.mediaType) : asc(media.mediaType);
          case "photographer":
            return isDesc ? desc(media.photographer) : asc(media.photographer);
          case "capturedAt":
            return isDesc ? desc(media.capturedAt) : asc(media.capturedAt);
          case "createdAt":
            return isDesc ? desc(media.createdAt) : asc(media.createdAt);
          case "updatedAt":
            return isDesc ? desc(media.updatedAt) : asc(media.updatedAt);
          default:
            return asc(media.id);
        }
      });
      query = query.orderBy(...orderClauses) as typeof query;
    }

    const results = await query.limit(limit).offset(offset);
    return results.map((row) => this.convertToMedia(row));
  }

  async getById(id: number): Promise<Media | null> {
    const results = await this.db.select().from(media).where(eq(media.id, id));

    return results.length > 0 ? this.convertToMedia(results[0]) : null;
  }

  async getByMonumentId(monumentId: number): Promise<Media[]> {
    const results = await this.db
      .select()
      .from(media)
      .where(eq(media.monumentId, monumentId));

    return results.map((row) => this.convertToMedia(row));
  }

  async getByMediaType(mediaType: string): Promise<Media[]> {
    const results = await this.db
      .select()
      .from(media)
      .where(eq(media.mediaType, mediaType));

    return results.map((row) => this.convertToMedia(row));
  }

  async create(mediaData: CreateMediaInput): Promise<Media> {
    const results = await this.db
      .insert(media)
      .values({
        monumentId: mediaData.monumentId,
        mediaType: mediaData.mediaType,
        url: mediaData.url,
        iiifManifestUrl: mediaData.iiifManifestUrl,
        capturedAt: mediaData.capturedAt,
        photographer: mediaData.photographer,
        license: mediaData.license,
        exifJson: mediaData.exifJson,
      })
      .returning();

    return this.convertToMedia(results[0]);
  }

  async update(id: number, mediaData: UpdateMediaInput): Promise<Media | null> {
    const updateData: Record<string, unknown> = {};

    if (mediaData.mediaType !== null)
      updateData.mediaType = mediaData.mediaType;
    if (mediaData.url !== null) updateData.url = mediaData.url;
    if (mediaData.iiifManifestUrl !== null)
      updateData.iiifManifestUrl = mediaData.iiifManifestUrl;
    if (mediaData.capturedAt !== null)
      updateData.capturedAt = mediaData.capturedAt;
    if (mediaData.photographer !== null)
      updateData.photographer = mediaData.photographer;
    if (mediaData.license !== null) updateData.license = mediaData.license;
    if (mediaData.exifJson !== null) updateData.exifJson = mediaData.exifJson;

    const results = await this.db
      .update(media)
      .set(updateData)
      .where(eq(media.id, id))
      .returning();

    return results.length > 0 ? this.convertToMedia(results[0]) : null;
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(media)
      .where(eq(media.id, id))
      .returning();

    return results.length > 0;
  }

  async count(): Promise<number> {
    const results = await this.db.select({ count: count() }).from(media);

    return results[0]?.count ?? 0;
  }

  private convertToMedia(row: typeof media.$inferSelect): Media {
    return {
      id: row.id,
      monumentId: row.monumentId,
      mediaType: row.mediaType,
      url: row.url,
      iiifManifestUrl: row.iiifManifestUrl ?? null,
      capturedAt: row.capturedAt ?? null,
      photographer: row.photographer ?? null,
      license: row.license ?? null,
      exifJson: row.exifJson ?? null,
      createdAt: this.convertToISOString(row.createdAt),
      updatedAt: this.convertToISOString(row.updatedAt),
    };
  }

  private convertToISOString(dateString: string): string {
    try {
      return new Date(dateString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}
