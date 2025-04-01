export type HaikuMonumentResponse = {
  id: number;
  text: string;
  established_date: string | null;
  commentary: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};
