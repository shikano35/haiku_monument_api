import type { Poet } from "./Poet";
import type { Source } from "./Source";
import type { Location } from "./Location";
import type { Inscription } from "./Inscription";
import type { Event } from "./Event";
import type { Media } from "./Media";

export interface Monument {
  id: number;
  canonicalName: string;
  canonicalUri: string | null;
  monumentType: string | null;
  monumentTypeUri: string | null;
  material: string | null;
  materialUri: string | null;
  createdAt: string;
  updatedAt: string;

  inscriptions: Inscription[] | null;
  events: Event[] | null;
  media: Media[] | null;
  locations: Location[] | null;
  poets: Poet[] | null;
  sources: Source[] | null;

  originalEstablishedDate: string | null;
  huTimeNormalized: string | null;
  intervalStart: string | null;
  intervalEnd: string | null;
  uncertaintyNote: string | null;
}

export interface CreateMonumentInput {
  canonicalName: string;
  monumentType: string | null;
  monumentTypeUri: string | null;
  material: string | null;
  materialUri: string | null;
  originalEstablishedDate: string | null;
  huTimeNormalized: string | null;
  intervalStart: string | null;
  intervalEnd: string | null;
  uncertaintyNote: string | null;
}

export interface UpdateMonumentInput {
  canonicalName: string | null;
  monumentType: string | null;
  monumentTypeUri: string | null;
  material: string | null;
  materialUri: string | null;
  originalEstablishedDate: string | null;
  huTimeNormalized: string | null;
  intervalStart: string | null;
  intervalEnd: string | null;
  uncertaintyNote: string | null;
}

export type HaikuMonument = Monument;
export type CreateHaikuMonumentInput = CreateMonumentInput;
export type UpdateHaikuMonumentInput = UpdateMonumentInput;
