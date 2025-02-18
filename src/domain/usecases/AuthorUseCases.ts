import type { Author, CreateAuthorInput } from '../entities/Author';
import type { IAuthorRepository } from '../repositories/IAuthorRepository';
import type { QueryParams } from '../common/QueryParams';

export class AuthorUseCases {
  constructor(private readonly authorRepo: IAuthorRepository) {}

  async getAllAuthors(queryParams?: QueryParams): Promise<Author[]> {
    return this.authorRepo.getAll(queryParams);
  }

  async getAuthorById(id: number): Promise<Author | null> {
    return this.authorRepo.getById(id);
  }

  async createAuthor(authorData: CreateAuthorInput): Promise<Author> {
    return this.authorRepo.create(authorData);
  }

  async updateAuthor(id: number, authorData: Partial<Author>): Promise<Author | null> {
    return this.authorRepo.update(id, authorData);
  }

  async deleteAuthor(id: number): Promise<boolean> {
    return this.authorRepo.delete(id);
  }
}
