import type { Poet } from "./Poet";
import type { Source } from "./Source";
import type { Location } from "./Location";
import type { Inscription } from "./Inscription";
import type { Event } from "./Event";
import type { Media } from "./Media";

export interface Monument {
  id: number;
  canonicalName: string;
  canonicalUri?: string;
  monumentType?: string;
  monumentTypeUri?: string;
  material?: string;
  materialUri?: string;
  createdAt: string;
  updatedAt: string;
  
  inscriptions?: Inscription[];
  events?: Event[];
  media?: Media[];
  locations?: Location[];
  poets?: Poet[];
  sources?: Source[];
  
  originalEstablishedDate?: string;
  huTimeNormalized?: string;
  intervalStart?: string;
  intervalEnd?: string;
  uncertaintyNote?: string;
}

export interface CreateMonumentInput {
  canonicalName: string;
  monumentType?: string;
  monumentTypeUri?: string;
  material?: string;
  materialUri?: string;
  originalEstablishedDate?: string;
  huTimeNormalized?: string;
  intervalStart?: string;
  intervalEnd?: string;
  uncertaintyNote?: string;
}

export interface UpdateMonumentInput {
  canonicalName?: string;
  monumentType?: string;
  monumentTypeUri?: string;
  material?: string;
  materialUri?: string;
  originalEstablishedDate?: string;
  huTimeNormalized?: string;
  intervalStart?: string;
  intervalEnd?: string;
  uncertaintyNote?: string;
}

export type HaikuMonument = Monument;
export type CreateHaikuMonumentInput = CreateMonumentInput;
export type UpdateHaikuMonumentInput = UpdateMonumentInput;
