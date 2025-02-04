import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

export default {
  env: process.env.NODE_ENV || "development",
  dbFile: process.env.DB_FILE || "./data/db.sqlite",
  port: process.env.PORT || 3000,
};
