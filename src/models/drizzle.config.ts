import { defineConfig } from "drizzle-kit";

const config =
  process.env.NODE_ENV === "production"
    ? defineConfig({
        schema: "./src/models/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        driver: "d1-http",
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID!,
          databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
          token: process.env.CLOUDFLARE_D1_API_TOKEN!,
        },
      })
    : defineConfig({
        schema: "./src/models/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: {
          url: "./data/db.sqlite",
        },
      });

export default config;
