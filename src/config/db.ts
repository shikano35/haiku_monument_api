import { drizzle as drizzleD1 } from "drizzle-orm/d1";

// @ts-ignore
const d1: D1Database | undefined = globalThis.DB;

if (!d1) {
  throw new Error(
    "Cloudflare D1 binding not found. Please configure the D1 binding (e.g., global 'DB') in Cloudflare Workers."
  );
}

const db = drizzleD1(d1);

export { db };