export type SourceResponse = {
  id: number;
  title: string;
  author: string | null;
  publisher: string | null;
  source_year: number | null;
  url: string | null;
  created_at: string;
  updated_at: string;
};

export type SourceEntityResponse = {
  id: number;
  title: string;
  author: string | null;
  publisher: string | null;
  sourceYear: number | null;
  url: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
