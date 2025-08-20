import type { Poem } from "./Poem";
import type { Source } from "./Source";

export interface Inscription {
  id: number;
  monumentId: number;
  side: string;
  originalText?: string;
  transliteration?: string;
  reading?: string;
  language: string;
  notes?: string;
  sourceId?: number;
  poems?: Poem[];
  source?: Source;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInscriptionInput {
  monumentId: number;
  side: string;
  originalText?: string;
  transliteration?: string;
  reading?: string;
  language?: string;
  notes?: string;
  sourceId?: number;
}

export interface UpdateInscriptionInput {
  side?: string;
  originalText?: string;
  transliteration?: string;
  reading?: string;
  language?: string;
  notes?: string;
  sourceId?: number;
}
