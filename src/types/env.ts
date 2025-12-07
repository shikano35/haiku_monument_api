import type { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
  CLOUDFLARE_D1_TOKEN: string;
  WORKERS_PLAN?: "free" | "paid";
}
