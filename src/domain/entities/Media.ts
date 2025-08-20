export interface Media {
  id: number;
  monumentId: number;
  mediaType: string;
  url: string;
  iiifManifestUrl?: string;
  capturedAt?: string;
  photographer?: string;
  license?: string;
  exifJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMediaInput {
  monumentId: number;
  mediaType: string;
  url: string;
  iiifManifestUrl?: string;
  capturedAt?: string;
  photographer?: string;
  license?: string;
  exifJson?: string;
}

export interface UpdateMediaInput {
  mediaType?: string;
  url?: string;
  iiifManifestUrl?: string;
  capturedAt?: string;
  photographer?: string;
  license?: string;
  exifJson?: string;
}
