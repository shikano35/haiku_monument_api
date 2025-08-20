export interface Media {
  id: number;
  monumentId: number;
  mediaType: string;
  url: string;
  iiifManifestUrl: string | null;
  capturedAt: string | null;
  photographer: string | null;
  license: string | null;
  exifJson: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMediaInput {
  monumentId: number;
  mediaType: string;
  url: string;
  iiifManifestUrl: string | null;
  capturedAt: string | null;
  photographer: string | null;
  license: string | null;
  exifJson: string | null;
}

export interface UpdateMediaInput {
  mediaType: string | null;
  url: string | null;
  iiifManifestUrl: string | null;
  capturedAt: string | null;
  photographer: string | null;
  license: string | null;
  exifJson: string | null;
}
