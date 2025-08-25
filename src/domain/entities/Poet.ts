export interface Poet {
  id: number;
  name: string;
  nameKana: string | null;
  biography: string | null;
  birthYear: number | null;
  deathYear: number | null;
  linkUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePoetInput {
  name: string;
  nameKana: string | null;
  biography: string | null;
  birthYear: number | null;
  deathYear: number | null;
  linkUrl: string | null;
  imageUrl: string | null;
}

export interface UpdatePoetInput {
  name: string | null;
  nameKana: string | null;
  biography: string | null;
  birthYear: number | null;
  deathYear: number | null;
  linkUrl: string | null;
  imageUrl: string | null;
}
