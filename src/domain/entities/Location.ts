export type Location = {
  id: number;
  region: string;
  prefecture: string;
  municipality: string | null;
  address: string | null;
  placeName: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type CreateLocationInput = Omit<Location, "id">;
