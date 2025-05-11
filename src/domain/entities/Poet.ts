export type Poet = {
  id: number;
  name: string;
  biography?: string | null;
  linkUrl?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreatePoetInput = Omit<Poet, 'id' | 'createdAt' | 'updatedAt'>;