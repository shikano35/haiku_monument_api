export interface Poet {
  id: number;
  name: string;
  nameKana?: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
  linkUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePoetInput {
  name: string;
  nameKana?: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
  linkUrl?: string;
  imageUrl?: string;
}

export interface UpdatePoetInput {
  name?: string;
  nameKana?: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
  linkUrl?: string;
  imageUrl?: string;
}
