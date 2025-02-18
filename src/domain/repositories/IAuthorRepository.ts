import type { Author, CreateAuthorInput } from '../entities/Author';
import type { QueryParams } from '../common/QueryParams';

export interface IAuthorRepository {
  getAll(queryParams?: QueryParams): Promise<Author[]>;
  getById(id: number): Promise<Author | null>;
  create(author: CreateAuthorInput): Promise<Author>;
  update(id: number, authorData: Partial<Author>): Promise<Author | null>;
  delete(id: number): Promise<boolean>;
}
