export interface Location {
  id: number;
  imiPrefCode: string | null;
  region: string | null;
  prefecture: string | null;
  municipality: string | null;
  address: string | null;
  placeName: string | null;
  latitude: number | null;
  longitude: number | null;
  geohash: string | null;
  geomGeojson: string | null;
  accuracyM: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationInput {
  imiPrefCode: string | null;
  region: string | null;
  prefecture: string | null;
  municipality: string | null;
  address: string | null;
  placeName: string | null;
  latitude: number | null;
  longitude: number | null;
  geohash: string | null;
  geomGeojson: string | null;
  accuracyM: number | null;
}

export interface UpdateLocationInput {
  imiPrefCode: string | null;
  region: string | null;
  prefecture: string | null;
  municipality: string | null;
  address: string | null;
  placeName: string | null;
  latitude: number | null;
  longitude: number | null;
  geohash: string | null;
  geomGeojson: string | null;
  accuracyM: number | null;
}
