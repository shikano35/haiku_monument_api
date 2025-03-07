export type User = {
  id: number;
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

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'status'>;