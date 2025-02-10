import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types'; // 必要に応じて型をインポート

export const getDB = (dbBinding: D1Database) => {
  return drizzle(dbBinding);
};
