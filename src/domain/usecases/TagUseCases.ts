import type { QueryParams } from '../common/QueryParams';
import type { Tag } from '../entities/Tag';
import type { ITagRepository } from '../repositories/ITagRepository';

export class TagUseCases {
  constructor(private readonly tagRepo: ITagRepository) {}

  async getAllTags(queryParams?: QueryParams): Promise<Tag[]> {
    return this.tagRepo.getAll(queryParams);
  }

  async getTagById(id: number): Promise<Tag | null> {
    return this.tagRepo.getById(id);
  }

  async createTag(tagData: Tag): Promise<Tag> {
    return this.tagRepo.create(tagData);
  }

  async updateTag(id: number, tagData: Partial<Tag>): Promise<Tag | null> {
    return this.tagRepo.update(id, tagData);
  }

  async deleteTag(id: number): Promise<boolean> {
    return this.tagRepo.delete(id);
  }
}
