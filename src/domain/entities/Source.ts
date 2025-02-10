export interface Source {
  id?: number;
  title: string;
  author?: string | null;
  year?: number | null;
  url?: string | null;
  publisher?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
