export interface Source {
  id: number;
  citation: string;
  author?: string;
  title?: string;
  publisher?: string;
  sourceYear?: number;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSourceInput {
  citation: string;
  author?: string;
  title?: string;
  publisher?: string;
  sourceYear?: number;
  url?: string;
}

export interface UpdateSourceInput {
  citation?: string;
  author?: string;
  title?: string;
  publisher?: string;
  sourceYear?: number;
  url?: string;
}
