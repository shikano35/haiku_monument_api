import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";

export const getDB = (dbBinding: D1Database) => {
  return drizzle(dbBinding, { casing: "snake_case" });
};
