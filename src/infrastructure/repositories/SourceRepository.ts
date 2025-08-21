import type { ISourceRepository } from "../../domain/repositories/ISourceRepository";
import type {
  CreateSourceInput,
  UpdateSourceInput,
  Source,
} from "../../domain/entities/Source";
import type { SourceQueryParams } from "../../domain/common/QueryParams";
import { getDB } from "../db/db";
import { sources } from "../db/schema";
import { eq, like, gte, lte, and, count, desc, asc } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";

function convertToSource(dbSource: {
  id: number;
  citation: string;
  author: string | null;
  title: string | null;
  publisher: string | null;
  sourceYear: number | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}): Source {
  return {
    id: dbSource.id,
    citation: dbSource.citation,
    title: dbSource.title ?? null,
    author: dbSource.author ?? null,
    publisher: dbSource.publisher ?? null,
    sourceYear: dbSource.sourceYear ?? null,
    url: dbSource.url ?? null,
    createdAt: dbSource.createdAt,
    updatedAt: dbSource.updatedAt,
  };
}

export class SourceRepository implements ISourceRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(queryParams?: SourceQueryParams): Promise<Source[]> {
    const {
      limit: paramLimit = 50,
      offset: paramOffset = 0,
      ordering: paramOrdering = [],
      search,
      createdAtGt,
      createdAtLt,
      updatedAtGt,
      updatedAtLt,
      titleContains,
      authorContains,
      publisherContains,
      sourceYear,
      sourceYearGt,
      sourceYearLt,
    } = queryParams || {};

    const limit = paramLimit ?? 50;
    const offset = paramOffset ?? 0;
    const ordering = paramOrdering ?? [];

    let query = this.db.select().from(sources);

    const conditions = [];

    // 全文検索
    if (search) {
      conditions.push(like(sources.title, `%${search}%`));
    }

    if (titleContains) {
      conditions.push(like(sources.title, `%${titleContains}%`));
    }

    if (authorContains) {
      conditions.push(like(sources.author, `%${authorContains}%`));
    }

    if (publisherContains) {
      conditions.push(like(sources.publisher, `%${publisherContains}%`));
    }

    if (sourceYear) {
      conditions.push(eq(sources.sourceYear, sourceYear));
    }

    if (sourceYearGt) {
      conditions.push(gte(sources.sourceYear, sourceYearGt));
    }

    if (sourceYearLt) {
      conditions.push(lte(sources.sourceYear, sourceYearLt));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    if (ordering && ordering.length > 0) {
      const orderClauses = ordering.map((order) => {
        const isDesc = order.startsWith("-");
        const field = isDesc ? order.slice(1) : order;

        switch (field) {
          case "title":
            return isDesc ? desc(sources.title) : asc(sources.title);
          case "author":
            return isDesc ? desc(sources.author) : asc(sources.author);
          case "year":
          case "source_year":
            return isDesc ? desc(sources.sourceYear) : asc(sources.sourceYear);
          case "publisher":
            return isDesc ? desc(sources.publisher) : asc(sources.publisher);
          case "created_at":
            return isDesc ? desc(sources.createdAt) : asc(sources.createdAt);
          case "updated_at":
            return isDesc ? desc(sources.updatedAt) : asc(sources.updatedAt);
          default:
            return asc(sources.id);
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
        (source) => new Date(source.createdAt) > new Date(createdAtGt),
      );
    }

    if (createdAtLt) {
      filteredResults = filteredResults.filter(
        (source) => new Date(source.createdAt) < new Date(createdAtLt),
      );
    }

    if (updatedAtGt) {
      filteredResults = filteredResults.filter(
        (source) => new Date(source.updatedAt) > new Date(updatedAtGt),
      );
    }

    if (updatedAtLt) {
      filteredResults = filteredResults.filter(
        (source) => new Date(source.updatedAt) < new Date(updatedAtLt),
      );
    }

    return filteredResults.map(convertToSource);
  }

  async getById(id: number): Promise<Source | null> {
    const result = await this.db
      .select()
      .from(sources)
      .where(eq(sources.id, id))
      .limit(1);
    return result.length > 0 ? convertToSource(result[0]) : null;
  }

  async getByTitle(title: string): Promise<Source[]> {
    const results = await this.db
      .select()
      .from(sources)
      .where(like(sources.title, `%${title}%`));
    return results.map(convertToSource);
  }

  async getByAuthor(author: string): Promise<Source[]> {
    const results = await this.db
      .select()
      .from(sources)
      .where(like(sources.author, `%${author}%`));
    return results.map(convertToSource);
  }

  async getByPublisher(publisher: string): Promise<Source[]> {
    const results = await this.db
      .select()
      .from(sources)
      .where(like(sources.publisher, `%${publisher}%`));
    return results.map(convertToSource);
  }

  async getByYear(year: number): Promise<Source[]> {
    const results = await this.db
      .select()
      .from(sources)
      .where(eq(sources.sourceYear, year));
    return results.map(convertToSource);
  }

  async getByYearRange(startYear: number, endYear: number): Promise<Source[]> {
    const results = await this.db
      .select()
      .from(sources)
      .where(
        and(
          gte(sources.sourceYear, startYear),
          lte(sources.sourceYear, endYear),
        ),
      );
    return results.map(convertToSource);
  }

  async create(sourceData: CreateSourceInput): Promise<Source> {
    const [inserted] = await this.db
      .insert(sources)
      .values(sourceData)
      .returning();

    return convertToSource(inserted);
  }

  async update(
    id: number,
    sourceData: UpdateSourceInput,
  ): Promise<Source | null> {
    if (!(await this.getById(id))) return null;

    const updateData: Record<string, unknown> = {};

    if (sourceData.citation !== null) updateData.citation = sourceData.citation;
    if (sourceData.author !== null) updateData.author = sourceData.author;
    if (sourceData.title !== null) updateData.title = sourceData.title;
    if (sourceData.publisher !== null)
      updateData.publisher = sourceData.publisher;
    if (sourceData.sourceYear !== null)
      updateData.sourceYear = sourceData.sourceYear;
    if (sourceData.url !== null) updateData.url = sourceData.url;

    const [updated] = await this.db
      .update(sources)
      .set(updateData)
      .where(eq(sources.id, id))
      .returning();

    return convertToSource(updated);
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(sources)
      .where(eq(sources.id, id))
      .returning({ id: sources.id });
    return results.length > 0;
  }

  async count(): Promise<number> {
    const results = await this.db.select({ count: count() }).from(sources);
    return results[0]?.count ?? 0;
  }
}
