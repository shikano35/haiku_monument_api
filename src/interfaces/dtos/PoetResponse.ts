export type PoetResponse = {
  id: number;
  name: string;
  biography: string | null;
  links: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PoetEntityResponse = {
  id: number;
  name: string;
  biography: string | null;
  links: string | null;
  imageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
