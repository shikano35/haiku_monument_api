import { sqliteTable, integer, text, real, integer as bool } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Poets テーブル
export const poets = sqliteTable("poets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  biography: text("biography"),
  linkUrl: text("link_url"),
  imageUrl: text("image_url"),
  createdAt: text("created_at").default(sql`(DATETIME('now','localtime'))`),
  updatedAt: text("updated_at").default(sql`(DATETIME('now','localtime'))`),
});

// Sources テーブル
export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author"),
  publisher: text("publisher"),
  sourceYear: integer("source_year"),
  url: text("url"),
  createdAt: text("created_at").default(sql`(DATETIME('now','localtime'))`),
  updatedAt: text("updated_at").default(sql`(DATETIME('now','localtime'))`),
});

// Locations テーブル
export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  region: text("region").notNull(),
  prefecture: text("prefecture").notNull(),
  municipality: text("municipality"),
  address: text("address"),
  placeName: text("place_name"),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

// Haiku Monument テーブル
export const haikuMonuments = sqliteTable("haiku_monuments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inscription: text("inscription").notNull(),
  commentary: text("commentary"),
  kigo: text("kigo"),
  season: text("season"),
  isReliable: bool("is_reliable").default(0),
  hasReverseInscription: bool("has_reverse_inscription").default(0),
  material: text("material"),
  totalHeight: real("total_height"),
  width: real("width"),
  depth: real("depth"),
  establishedDate: text("established_date"),
  establishedYear: integer("established_year"),
  founder: text("founder"),
  monumentType: text("monument_type"),
  designationStatus: text("designation_status"),
  photoUrl: text("photo_url"),
  photoDate: text("photo_date"),
  photographer: text("photographer"),
  model3dUrl: text("model_3d_url"),
  remarks: text("remarks"),

  poetId: integer("poet_id")
    .references(() => poets.id, { onDelete: "restrict" }),
  sourceId: integer("source_id")
    .references(() => sources.id, { onDelete: "restrict" }),
  locationId: integer("location_id")
    .references(() => locations.id, { onDelete: "restrict" }),
  
  createdAt: text("created_at").default(sql`(DATETIME('now','localtime'))`),
  updatedAt: text("updated_at").default(sql`(DATETIME('now','localtime'))`),
});
