// ユーザーのエンティティ定義
export interface User {
  id?: number;
  username: string;
  email: string;
  hashedPassword: string;
  displayName?: string | null;
  role?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastLoginAt?: string | null;
  status?: string;
}
