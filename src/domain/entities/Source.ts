import type { Monument } from "./Monument";

export interface Source {
  id: number;
  citation: string;
  author: string | null;
  title: string | null;
  publisher: string | null;
  sourceYear: number | null;
  url: string | null;
  monuments: Monument[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSourceInput {
  citation: string;
  author: string | null;
  title: string | null;
  publisher: string | null;
  sourceYear: number | null;
  url: string | null;
}

export interface UpdateSourceInput {
  citation?: string | null;
  author?: string | null;
  title?: string | null;
  publisher?: string | null;
  sourceYear?: number | null;
  url?: string | null;
}
