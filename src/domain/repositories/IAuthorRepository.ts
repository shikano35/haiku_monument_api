import type { Author } from '../entities/Author';

export interface IAuthorRepository {
  getAll(): Promise<Author[]>;
  getById(id: number): Promise<Author | null>;
  create(author: Author): Promise<Author>;
  update(id: number, authorData: Partial<Author>): Promise<Author | null>;
  delete(id: number): Promise<boolean>;
}
