import type { MediaQueryParams } from "../common/QueryParams";
import type {
  CreateMediaInput,
  Media,
  UpdateMediaInput,
} from "../entities/Media";
import type { IMediaRepository } from "../repositories/IMediaRepository";

export class MediaUseCases {
  constructor(private mediaRepository: IMediaRepository) {}

  async getAllMedia(queryParams: MediaQueryParams = {}): Promise<Media[]> {
    return this.mediaRepository.getAll(queryParams);
  }

  async getMediaById(id: number): Promise<Media | null> {
    return this.mediaRepository.getById(id);
  }

  async getMediaByMonument(monumentId: number): Promise<Media[]> {
    return this.mediaRepository.getByMonumentId(monumentId);
  }

  async getMediaByType(mediaType: string): Promise<Media[]> {
    return this.mediaRepository.getByMediaType(mediaType);
  }

  async createMedia(mediaData: CreateMediaInput): Promise<Media> {
    return this.mediaRepository.create(mediaData);
  }

  async updateMedia(
    id: number,
    mediaData: UpdateMediaInput,
  ): Promise<Media | null> {
    return this.mediaRepository.update(id, mediaData);
  }

  async deleteMedia(id: number): Promise<boolean> {
    return this.mediaRepository.delete(id);
  }

  async getMediaCount(): Promise<number> {
    return this.mediaRepository.count();
  }
}
