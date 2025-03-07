import type { Poet } from './Poet';
import type { Source } from './Source';
import type { Location } from './Location';
import type { CreatePoetInput } from './Poet';
import type { CreateSourceInput } from './Source';
import type { CreateLocationInput } from './Location';

type HaikuMonumentPoetInput = { id: number } | CreatePoetInput;
type HaikuMonumentSourceInput = { id: number } | CreateSourceInput;
type HaikuMonumentLocationInput = { id: number } | CreateLocationInput;

export type HaikuMonument = {
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
  createdAt: string;
  updatedAt: string;
}

export type HaikuMonumentInput = {
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
