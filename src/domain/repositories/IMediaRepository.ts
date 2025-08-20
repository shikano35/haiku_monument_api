import type { Media, CreateMediaInput, UpdateMediaInput } from "../entities/Media";
import type { MediaQueryParams } from "../common/QueryParams";

export interface IMediaRepository {
  getAll(queryParams?: MediaQueryParams): Promise<Media[]>;
  getById(id: number): Promise<Media | null>;
  getByMonumentId(monumentId: number): Promise<Media[]>;
  getByMediaType(mediaType: string): Promise<Media[]>;
  create(mediaData: CreateMediaInput): Promise<Media>;
  update(id: number, mediaData: UpdateMediaInput): Promise<Media | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
}
