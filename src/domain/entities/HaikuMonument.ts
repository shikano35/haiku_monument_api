import type { Author } from './Author';
import type { Source } from './Source';
import type { Location } from './Location';

export interface HaikuMonument {
  id: number;
  text: string;
  authorId: number | null;
  author?: Author | null;
  sourceId: number | null;
  source?: Source | null;
  establishedDate: string | null;
  locationId: number | null;
  location?: Location | null;
  commentary: string | null;
  imageUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type CreateHaikuMonumentInput = Omit<Source, 'id' | 'createdAt' | 'updatedAt'>;