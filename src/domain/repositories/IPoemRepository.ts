import type { Poem, CreatePoemInput, UpdatePoemInput } from "../entities/Poem";
import type { PoemQueryParams } from "../common/QueryParams";

export interface IPoemRepository {
  getAll(queryParams?: PoemQueryParams): Promise<Poem[]>;
  getById(id: number): Promise<Poem | null>;
  getByText(text: string): Promise<Poem | null>;
  getByNormalizedText(normalizedText: string): Promise<Poem | null>;
  getBySeason(season: string): Promise<Poem[]>;
  getByKigo(kigo: string): Promise<Poem[]>;
  create(poemData: CreatePoemInput): Promise<Poem>;
  update(id: number, poemData: UpdatePoemInput): Promise<Poem | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
}
