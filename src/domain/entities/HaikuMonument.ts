import type { Poet } from "./Poet";
import type { Source } from "./Source";
import type { Location } from "./Location";
import type { CreatePoetInput } from "./Poet";
import type { CreateSourceInput } from "./Source";
import type { CreateLocationInput } from "./Location";

type HaikuMonumentPoetInput = { id: number } | CreatePoetInput;
type HaikuMonumentSourceInput = { id: number } | CreateSourceInput;
type HaikuMonumentLocationInput = { id: number } | CreateLocationInput;

export type HaikuMonument = {
  id: number;
  inscription: string;
  commentary: string | null;
  kigo: string | null;
  season: string | null;
  isReliable: boolean | null;
  hasReverseInscription: boolean | null;
  material: string | null;
  totalHeight: number | null;
  width: number | null;
  depth: number | null;
  establishedDate: string | null;
  establishedYear: number | null;
  founder: string | null;
  monumentType: string | null;
  designationStatus: string | null;
  photoUrl: string | null;
  photoDate: string | null;
  photographer: string | null;
  model3dUrl: string | null;
  remarks: string | null;

  poetId: number | null;
  poet?: Poet | null;
  sourceId: number | null;
  source?: Source | null;
  locationId: number | null;
  location?: Location | null;

  createdAt: string | null;
  updatedAt: string | null;
};

export type HaikuMonumentInput = {
  inscription: string;
  commentary?: string | null;
  kigo?: string | null;
  season?: string | null;
  isReliable?: boolean | null;
  hasReverseInscription?: boolean | null;
  material?: string | null;
  totalHeight?: number | null;
  width?: number | null;
  depth?: number | null;
  establishedDate?: string | null;
  establishedYear?: number | null;
  founder?: string | null;
  monumentType?: string | null;
  designationStatus?: string | null;
  photoUrl?: string | null;
  photoDate?: string | null;
  photographer?: string | null;
  model3dUrl?: string | null;
  remarks?: string | null;

  poet?: HaikuMonumentPoetInput | null;
  source?: HaikuMonumentSourceInput | null;
  location?: HaikuMonumentLocationInput | null;
};

export type CreateHaikuMonumentInput = HaikuMonumentInput;
export type UpdateHaikuMonumentInput = Partial<HaikuMonumentInput>;
