import type { Poet } from "./Poet";
import type { Source } from "./Source";

export interface Poem {
  id: number;
  text: string;
  normalizedText: string;
  textHash: string;
  kigo?: string;
  season?: string;
  createdAt: string;
  updatedAt: string;
  attributions?: PoemAttribution[];
}

export interface PoemAttribution {
  id: number;
  poemId: number;
  poetId: number;
  confidence: string;
  confidenceScore: number;
  sourceId?: number;
  createdAt: string;
  poet?: Poet;
  source?: Source;
}

export interface CreatePoemInput {
  text: string;
  normalizedText: string;
  textHash: string;
  kigo?: string;
  season?: string;
}

export interface UpdatePoemInput {
  text?: string;
  normalizedText?: string;
  textHash?: string;
  kigo?: string;
  season?: string;
}
