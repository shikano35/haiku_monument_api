export type Location = {
  id: number;
  prefecture: string;
  region: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
}

export type CreateLocationInput = Omit<Location, 'id'>;