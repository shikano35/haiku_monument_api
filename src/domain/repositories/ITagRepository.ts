import type { QueryParams } from '../common/QueryParams';
import type { Tag } from '../entities/Tag';

export interface ITagRepository {
  getAll(queryParams?: QueryParams): Promise<Tag[]>;
  getById(id: number): Promise<Tag | null>;
  create(tag: Tag): Promise<Tag>;
  update(id: number, tagData: Partial<Tag>): Promise<Tag | null>;
  delete(id: number): Promise<boolean>;
}
