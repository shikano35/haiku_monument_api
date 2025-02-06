import { sqliteTable, integer, text, real, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Authors テーブル
export const authors = sqliteTable("authors", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  biography: text("biography"),
  links: text("links"),
  imageUrl: text("image_url"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Sources テーブル
export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  year: integer("year"),
  url: text("url"),
  publisher: text("publisher"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Locations テーブル
export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey(),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  name: text("name"),
});

// Haiku Monument テーブル
export const haikuMonument = sqliteTable("haiku_monument", {
  id: integer("id").primaryKey(),
  text: text("text").notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => authors.id, { onDelete: "cascade" }),
  sourceId: integer("source_id")
    .references(() => sources.id, { onDelete: "set null" }),
  // DATE型は ISO 8601 形式の文字列として保存
  establishedDate: text("established_date"),
  locationId: integer("location_id")
    .references(() => locations.id, { onDelete: "set null" }),
  commentary: text("commentary"),
  imageUrl: text("image_url"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tags テーブル
export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

// Haiku Monument Tag テーブル（複合主キーかつ外部キー制約）  
export const haikuMonumentTag = sqliteTable("haiku_monument_tag", {
  haikuMonumentId: integer("haiku_monument_id")
    .notNull()
    .references(() => haikuMonument.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.haikuMonumentId, table.tagId] }),
}));

// Users テーブル
export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  hashedPassword: text("hashed_password").notNull(),
  displayName: text("display_name"),
  role: text("role").notNull().default("user"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text("last_login_at"),
  status: text("status").notNull().default("active"),
});