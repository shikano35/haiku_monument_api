// src/config/db.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import developmentConfig from "./development";
import { authors, sources, locations, haikuMonument, tags, haikuMonumentTag, users } from "../models/schema";

const sqlite = new Database(developmentConfig.dbFile, {
  verbose: console.log,
});
const db = drizzle(sqlite);

export { db, authors, sources, locations, haikuMonument, tags, haikuMonumentTag, users };
