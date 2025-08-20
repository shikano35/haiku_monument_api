import type { IPoetRepository } from "../../domain/repositories/IPoetRepository";
import type {
  CreatePoetInput,
  UpdatePoetInput,
  Poet,
} from "../../domain/entities/Poet";
import type { PoetQueryParams } from "../../domain/common/QueryParams";
import { getDB } from "../db/db";
import { poets } from "../db/schema";
import { eq, like, gte, lte, and, count, desc, asc } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";

const convertToPoet = (dbPoet: {
  id: number;
  name: string;
  nameKana: string | null;
  biography: string | null;
  birthYear: number | null;
  deathYear: number | null;
  linkUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}): Poet => {
  return {
    id: dbPoet.id,
    name: dbPoet.name,
    nameKana: dbPoet.nameKana ?? null,
    biography: dbPoet.biography ?? null,
    birthYear: dbPoet.birthYear ?? null,
    deathYear: dbPoet.deathYear ?? null,
    linkUrl: dbPoet.linkUrl ?? null,
    imageUrl: dbPoet.imageUrl ?? null,
    createdAt: dbPoet.createdAt ?? "",
    updatedAt: dbPoet.updatedAt ?? "",
  };
};

export class PoetRepository implements IPoetRepository {
  constructor(private readonly dbBinding: D1Database) {}

  private get db() {
    return getDB(this.dbBinding);
  }

  async getAll(queryParams?: PoetQueryParams): Promise<Poet[]> {
    const {
      limit = 50,
      offset = 0,
      ordering = [],
      search,
      createdAtGt,
      createdAtLt,
      updatedAtGt,
      updatedAtLt,
      nameContains,
      biographyContains,
      birthYear,
      deathYear,
    } = queryParams || {};

    let query = this.db.select().from(poets);

    const conditions = [];

    // 全文検索
    if (search) {
      conditions.push(like(poets.name, `%${search}%`));
    }

    if (nameContains) {
      conditions.push(like(poets.name, `%${nameContains}%`));
    }

    if (biographyContains) {
      conditions.push(like(poets.biography, `%${biographyContains}%`));
    }

    if (birthYear) {
      conditions.push(eq(poets.birthYear, birthYear));
    }

    if (deathYear) {
      conditions.push(eq(poets.deathYear, deathYear));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    if (ordering.length > 0) {
      const orderClauses = ordering.map((order) => {
        const isDesc = order.startsWith("-");
        const field = isDesc ? order.slice(1) : order;

        switch (field) {
          case "name":
            return isDesc ? desc(poets.name) : asc(poets.name);
          case "birth_year":
            return isDesc ? desc(poets.birthYear) : asc(poets.birthYear);
          case "created_at":
            return isDesc ? desc(poets.createdAt) : asc(poets.createdAt);
          case "updated_at":
            return isDesc ? desc(poets.updatedAt) : asc(poets.updatedAt);
          default:
            return asc(poets.id);
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
        (poet) => new Date(poet.createdAt) > new Date(createdAtGt),
      );
    }

    if (createdAtLt) {
      filteredResults = filteredResults.filter(
        (poet) => new Date(poet.createdAt) < new Date(createdAtLt),
      );
    }

    if (updatedAtGt) {
      filteredResults = filteredResults.filter(
        (poet) => new Date(poet.updatedAt) > new Date(updatedAtGt),
      );
    }

    if (updatedAtLt) {
      filteredResults = filteredResults.filter(
        (poet) => new Date(poet.updatedAt) < new Date(updatedAtLt),
      );
    }

    return filteredResults.map(convertToPoet);
  }

  async getById(id: number): Promise<Poet | null> {
    const result = await this.db
      .select()
      .from(poets)
      .where(eq(poets.id, id))
      .limit(1);

    return result.length > 0 ? convertToPoet(result[0]) : null;
  }

  async getByName(name: string): Promise<Poet[]> {
    const results = await this.db
      .select()
      .from(poets)
      .where(eq(poets.name, name));
    return results.map(convertToPoet);
  }

  async getByNameContains(nameFragment: string): Promise<Poet[]> {
    const results = await this.db
      .select()
      .from(poets)
      .where(like(poets.name, `%${nameFragment}%`));
    return results.map(convertToPoet);
  }

  async getByBirthYear(birthYear: number): Promise<Poet[]> {
    const results = await this.db
      .select()
      .from(poets)
      .where(eq(poets.birthYear, birthYear));
    return results.map(convertToPoet);
  }

  async getByBirthYearRange(
    startYear: number,
    endYear: number,
  ): Promise<Poet[]> {
    const results = await this.db
      .select()
      .from(poets)
      .where(
        and(gte(poets.birthYear, startYear), lte(poets.birthYear, endYear)),
      );
    return results.map(convertToPoet);
  }

  async create(poetData: CreatePoetInput): Promise<Poet> {
    const [inserted] = await this.db.insert(poets).values(poetData).returning();
    return convertToPoet(inserted);
  }

  async update(id: number, poetData: UpdatePoetInput): Promise<Poet | null> {
    if (!(await this.getById(id))) return null;

    const updateData: Record<string, unknown> = {};

    if (poetData.name !== null) updateData.name = poetData.name;
    if (poetData.nameKana !== null) updateData.nameKana = poetData.nameKana;
    if (poetData.biography !== null) updateData.biography = poetData.biography;
    if (poetData.birthYear !== null) updateData.birthYear = poetData.birthYear;
    if (poetData.deathYear !== null) updateData.deathYear = poetData.deathYear;
    if (poetData.linkUrl !== null) updateData.linkUrl = poetData.linkUrl;
    if (poetData.imageUrl !== null) updateData.imageUrl = poetData.imageUrl;

    const [updated] = await this.db
      .update(poets)
      .set(updateData)
      .where(eq(poets.id, id))
      .returning();

    return convertToPoet(updated);
  }

  async delete(id: number): Promise<boolean> {
    const results = await this.db
      .delete(poets)
      .where(eq(poets.id, id))
      .returning({ id: poets.id });
    return results.length > 0;
  }

  async count(): Promise<number> {
    const results = await this.db.select({ count: count() }).from(poets);
    return results[0]?.count ?? 0;
  }
}
