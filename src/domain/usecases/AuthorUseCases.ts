import type { Author } from '../entities/Author';
import type { IAuthorRepository } from '../repositories/IAuthorRepository';

export class AuthorUseCases {
  constructor(private readonly authorRepo: IAuthorRepository) {}

  async getAllAuthors(): Promise<Author[]> {
    return this.authorRepo.getAll();
  }

  async getAuthorById(id: number): Promise<Author | null> {
    return this.authorRepo.getById(id);
  }

  async createAuthor(authorData: Author): Promise<Author> {
    return this.authorRepo.create(authorData);
  }

  async updateAuthor(id: number, authorData: Partial<Author>): Promise<Author | null> {
    return this.authorRepo.update(id, authorData);
  }

  async deleteAuthor(id: number): Promise<boolean> {
    return this.authorRepo.delete(id);
  }
}
