import type { Poet } from './Poet';
import type { Source } from './Source';
import type { Location } from './Location';
import type { CreatePoetInput } from './Poet';
import type { CreateSourceInput } from './Source';
import type { CreateLocationInput } from './Location';

export type HaikuMonumentPoetInput = { id: number } | CreatePoetInput;
export type HaikuMonumentSourceInput = { id: number } | CreateSourceInput;
export type HaikuMonumentLocationInput = { id: number } | CreateLocationInput;

export interface HaikuMonument {
  id: number;
  text: string;
  poetId: number | null;
  poet?: Poet | null;
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

export interface HaikuMonumentInput {
  text: string;
  establishedDate: string | null;
  commentary: string | null;
  imageUrl?: string | null;
  poet?: HaikuMonumentPoetInput | null;
  source?: HaikuMonumentSourceInput | null;
  location?: HaikuMonumentLocationInput | null;
}

export type CreateHaikuMonumentInput = HaikuMonumentInput;
export type UpdateHaikuMonumentInput = Partial<HaikuMonumentInput>;
