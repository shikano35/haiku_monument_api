// ドメインエンティティとしてLocationの型定義
export interface Location {
  id?: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
}
