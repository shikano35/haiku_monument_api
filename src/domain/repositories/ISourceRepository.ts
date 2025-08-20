import type {
  CreateSourceInput,
  UpdateSourceInput,
  Source,
} from "../entities/Source";
import type { SourceQueryParams } from "../common/QueryParams";

export interface ISourceRepository {
  getAll(queryParams?: SourceQueryParams): Promise<Source[]>;
  getById(id: number): Promise<Source | null>;
  getByTitle(title: string): Promise<Source[]>;
  getByAuthor(author: string): Promise<Source[]>;
  getByPublisher(publisher: string): Promise<Source[]>;
  getByYear(year: number): Promise<Source[]>;
  getByYearRange(startYear: number, endYear: number): Promise<Source[]>;
  create(source: CreateSourceInput): Promise<Source>;
  update(id: number, sourceData: UpdateSourceInput): Promise<Source | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
}
