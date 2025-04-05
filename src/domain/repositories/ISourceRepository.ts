import type { QueryParams } from '../common/QueryParams';
import type { CreateSourceInput, Source } from '../entities/Source';

export type ISourceRepository = {
  getAll(queryParams: QueryParams): Promise<Source[]>;
  getById(id: number): Promise<Source | null>;
  create(source: CreateSourceInput): Promise<Source>;
  update(id: number, sourceData: Partial<Source>): Promise<Source | null>;
  delete(id: number): Promise<boolean>;
}
