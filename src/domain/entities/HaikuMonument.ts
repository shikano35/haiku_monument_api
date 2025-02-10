export interface HaikuMonument {
  id?: number;
  text: string;
  authorId: number;
  sourceId?: number | null;
  establishedDate?: string | null;
  locationId?: number | null;
  commentary?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
