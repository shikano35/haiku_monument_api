import { PoetResponse } from "./PoetResponse";
import { SourceResponse } from "./SourceResponse";
import { LocationResponse } from "./LocationResponse";

export type HaikuMonumentResponse = {
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
  sourceId: number | null;
  locationId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type HaikuMonumentResponseWithRelations = HaikuMonumentResponse & {
  poet: PoetResponse | null;
  source: SourceResponse | null;
  location: LocationResponse | null;
};
