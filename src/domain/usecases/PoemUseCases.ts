import type { PoemQueryParams } from "../common/QueryParams";
import type { CreatePoemInput, Poem, UpdatePoemInput } from "../entities/Poem";
import type { IPoemRepository } from "../repositories/IPoemRepository";

export class PoemUseCases {
  constructor(private poemRepository: IPoemRepository) {}

  async getAllPoems(queryParams: PoemQueryParams = {}): Promise<Poem[]> {
    return this.poemRepository.getAll(queryParams);
  }

  async getPoemById(id: number): Promise<Poem | null> {
    return this.poemRepository.getById(id);
  }

  async getPoemByText(text: string): Promise<Poem | null> {
    return this.poemRepository.getByText(text);
  }

  async getPoemsBySeason(season: string): Promise<Poem[]> {
    return this.poemRepository.getBySeason(season);
  }

  async getPoemsByKigo(kigo: string): Promise<Poem[]> {
    return this.poemRepository.getByKigo(kigo);
  }

  async createPoem(poemData: CreatePoemInput): Promise<Poem> {
    return this.poemRepository.create(poemData);
  }

  async updatePoem(
    id: number,
    poemData: UpdatePoemInput,
  ): Promise<Poem | null> {
    return this.poemRepository.update(id, poemData);
  }

  async deletePoem(id: number): Promise<boolean> {
    return this.poemRepository.delete(id);
  }

  async getPoemCount(): Promise<number> {
    return this.poemRepository.count();
  }
}
