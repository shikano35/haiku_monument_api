import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

export const getDB = (dbBinding: D1Database) => {
  return drizzle(dbBinding, { casing: "snake_case" });
};
