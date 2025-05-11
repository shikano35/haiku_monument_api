export type Source = {
  id: number;
  title: string;
  author?: string | null;
  publisher?: string | null;
  sourceYear?: number | null;
  url?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateSourceInput = Omit<Source, 'id' | 'createdAt' | 'updatedAt'>;