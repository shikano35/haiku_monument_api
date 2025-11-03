import type { MediaQueryParams } from "../common/QueryParams";
import type {
  CreateMediaInput,
  Media,
  UpdateMediaInput,
} from "../entities/Media";

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
