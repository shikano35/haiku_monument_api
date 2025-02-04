import dotenv from "dotenv";
dotenv.config({ path: ".env.production" });

export default {
  env: process.env.NODE_ENV || "production",
  dbFile: process.env.DB_FILE || "./data/db.sqlite",
  port: process.env.PORT || 3000,
};
