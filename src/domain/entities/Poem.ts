import type { Poet } from "./Poet";
import type { Source } from "./Source";
import type { Inscription } from "./Inscription";

export interface Poem {
  id: number;
  text: string;
  normalizedText: string;
  textHash: string;
  kigo: string | null;
  season: string | null;
  createdAt: string;
  updatedAt: string;
  attributions: PoemAttribution[] | null;
  inscriptions: Inscription[] | null;
}

export interface PoemAttribution {
  id: number;
  poemId: number;
  poetId: number;
  confidence: string;
  confidenceScore: number;
  sourceId: number | null;
  createdAt: string;
  poet: Poet | null;
  source: Source | null;
}

export interface CreatePoemInput {
  text: string;
  normalizedText: string;
  textHash: string;
  kigo: string | null;
  season: string | null;
}

export interface UpdatePoemInput {
  text: string | null;
  normalizedText: string | null;
  textHash: string | null;
  kigo: string | null;
  season: string | null;
}
