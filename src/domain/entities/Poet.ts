export interface Poet {
  id: number;
  name: string;
  biography?: string | null;
  links?: string | null;
  imageUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type CreatePoetInput = Omit<Poet, 'id' | 'createdAt' | 'updatedAt'>;