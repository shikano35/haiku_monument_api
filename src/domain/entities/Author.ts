export interface Author {
  id: number;
  name: string;
  biography?: string | null;
  links?: string | null;
  imageUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type CreateAuthorInput = Omit<Author, 'id' | 'createdAt' | 'updatedAt'>;