export type LocationResponse = {
  id: number;
  region: string;
  prefecture: string;
  municipality: string | null;
  address: string | null;
  place_name: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type LocationEntityResponse = {
  id: number;
  region: string;
  prefecture: string;
  municipality: string | null;
  address: string | null;
  place_name: string | null;
  latitude: number | null;
  longitude: number | null;
};