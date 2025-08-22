import type { Poem } from "./Poem";
import type { Source } from "./Source";
import type { Monument } from "./Monument";

export interface Inscription {
  id: number;
  monumentId: number;
  side: string;
  originalText: string | null;
  transliteration: string | null;
  reading: string | null;
  language: string;
  notes: string | null;
  sourceId: number | null;
  poems: Poem[] | null;
  monument: Monument | null;
  source: Source | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInscriptionInput {
  monumentId: number;
  side: string;
  originalText: string | null;
  transliteration: string | null;
  reading: string | null;
  language: string | null;
  notes: string | null;
  sourceId: number | null;
}

export interface UpdateInscriptionInput {
  side: string | null;
  originalText: string | null;
  transliteration: string | null;
  reading: string | null;
  language: string | null;
  notes: string | null;
  sourceId: number | null;
}
