import type { Poet, CreatePoetInput } from '../entities/Poet';
import type { QueryParams } from '../common/QueryParams';

export type IPoetRepository = {
  getAll(queryParams: QueryParams): Promise<Poet[]>;
  getById(id: number): Promise<Poet | null>;
  create(poet: CreatePoetInput): Promise<Poet>;
  update(id: number, poetData: Partial<Poet>): Promise<Poet | null>;
  delete(id: number): Promise<boolean>;
}
