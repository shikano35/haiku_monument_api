import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Poets テーブル
export const poets = sqliteTable("poets", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  biography: text("biography"),
  links: text("links"),
  imageUrl: text("image_url"),
  createdAt: text("created_at").default(sql`(DATETIME('now','localtime'))`),
  updatedAt: text("updated_at").default(sql`(DATETIME('now','localtime'))`),
});

// Sources テーブル
export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  year: integer("year"),
  url: text("url"),
  publisher: text("publisher"),
  createdAt: text("created_at").default(sql`(DATETIME('now','localtime'))`),
  updatedAt: text("updated_at").default(sql`(DATETIME('now','localtime'))`),
});

// Locations テーブル
export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey(),
  prefecture: text("prefecture").notNull(),
  region: text("region"),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  name: text("name"),
});

// Haiku Monument テーブル
export const haikuMonuments = sqliteTable("haiku_monuments", {
  id: integer("id").primaryKey(),
  text: text("text").notNull(),
  poetId: integer("poet_id")
    .references(() => poets.id, { onDelete: "restrict" }),
  sourceId: integer("source_id")
    .references(() => sources.id, { onDelete: "restrict" }),
  establishedDate: text("established_date"),
  locationId: integer("location_id")
    .references(() => locations.id, { onDelete: "restrict" }),
  commentary: text("commentary"),
  imageUrl: text("image_url"),
  createdAt: text("created_at").default(sql`(DATETIME('now','localtime'))`),
  updatedAt: text("updated_at").default(sql`(DATETIME('now','localtime'))`),
});

// Users テーブル
export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  displayName: text("display_name"),
  role: text("role").notNull().default("user"),
  createdAt: text("created_at").default(sql`(DATETIME('now','localtime'))`),
  updatedAt: text("updated_at").default(sql`(DATETIME('now','localtime'))`),
  lastLoginAt: text("last_login_at"),
  status: text("status").notNull().default("active"),
});
