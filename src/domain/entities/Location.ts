export interface Location {
  id: number;
  imiPrefCode?: string;
  region?: string;
  prefecture?: string;
  municipality?: string;
  address?: string;
  placeName?: string;
  latitude?: number;
  longitude?: number;
  geohash?: string;
  geomGeojson?: string;
  accuracyM?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationInput {
  imiPrefCode?: string;
  region?: string;
  prefecture?: string;
  municipality?: string;
  address?: string;
  placeName?: string;
  latitude?: number;
  longitude?: number;
  geohash?: string;
  geomGeojson?: string;
  accuracyM?: number;
}

export interface UpdateLocationInput {
  imiPrefCode?: string;
  region?: string;
  prefecture?: string;
  municipality?: string;
  address?: string;
  placeName?: string;
  latitude?: number;
  longitude?: number;
  geohash?: string;
  geomGeojson?: string;
  accuracyM?: number;
}
