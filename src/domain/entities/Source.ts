export type Source = {
  id: number;
  title: string;
  author?: string | null;
  year?: number | null;
  url?: string | null;
  publisher?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type CreateSourceInput = Omit<Source, 'id' | 'createdAt' | 'updatedAt'>;