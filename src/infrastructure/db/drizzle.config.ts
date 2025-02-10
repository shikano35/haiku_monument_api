import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

function getEnv(key: string): string {
  const value = process.env[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing or empty environment variable: ${key}`);
  }
  return value;
}

export default defineConfig({
  out: './drizzle',
  schema: './src/models/schema.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: getEnv('CLOUDFLARE_ACCOUNT_ID'),
    databaseId: getEnv('CLOUDFLARE_DATABASE_ID'),
    token: getEnv('CLOUDFLARE_D1_TOKEN'),
  },
});
