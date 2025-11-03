import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// ============================================================================
// CIDOC-CRM準拠のスキーマ設計
// ============================================================================

// Monuments（句碑）- 物体（E22 Human-Made Object）
export const monuments = sqliteTable(
  "monuments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    canonicalName: text("canonical_name").notNull(), // 正式名称
    monumentType: text("monument_type"), // 分類（石碑、記念碑など）
    monumentTypeUri: text("monument_type_uri"), // Getty AAT等のURI
    material: text("material"), // 材質ラベル
    materialUri: text("material_uri"), // 材質のURI
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("monuments_canonical_name_idx").on(table.canonicalName),
    index("monuments_type_idx").on(table.monumentType),
  ],
);

// Inscriptions（碑文）- 碑面のテキスト情報
export const inscriptions = sqliteTable(
  "inscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    monumentId: integer("monument_id")
      .notNull()
      .references(() => monuments.id, {
        onDelete: "cascade",
      }),
    side: text("side").notNull().default("front"), // front, back, left, right等
    originalText: text("original_text"), // 碑文原文
    transliteration: text("transliteration"), // 翻字
    reading: text("reading"), // 読み
    language: text("language").default("ja"), // 言語コード
    notes: text("notes"), // 注記
    sourceId: integer("source_id").references(() => sources.id, {
      onDelete: "restrict",
    }),
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("inscriptions_monument_idx").on(table.monumentId),
    index("inscriptions_text_idx").on(table.originalText),
  ],
);

// Poems（句）- 重複を防ぐ正規化されたテーブル
export const poems = sqliteTable(
  "poems",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    text: text("text").notNull(), // 俳句
    normalizedText: text("normalized_text").notNull().unique(), // 正規化テキスト
    textHash: text("text_hash").notNull(), // テキストハッシュ
    kigo: text("kigo"), // 季語
    season: text("season"), // 季節
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("poems_text_idx").on(table.text),
    index("poems_normalized_idx").on(table.normalizedText),
    index("poems_season_idx").on(table.season),
  ],
);

// Poets（俳人）- 人物（E21 Person）
export const poets = sqliteTable(
  "poets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    nameKana: text("name_kana"),
    biography: text("biography"),
    birthYear: integer("birth_year"),
    deathYear: integer("death_year"),
    linkUrl: text("link_url"),
    imageUrl: text("image_url"),
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("poets_name_idx").on(table.name),
    index("poets_birth_idx").on(table.birthYear),
  ],
);

// Poem Attributions（俳句の帰属）- 俳句と俳人の関係
export const poemAttributions = sqliteTable(
  "poem_attributions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    poemId: integer("poem_id")
      .notNull()
      .references(() => poems.id, {
        onDelete: "cascade",
      }),
    poetId: integer("poet_id")
      .notNull()
      .references(() => poets.id, {
        onDelete: "restrict",
      }),
    confidence: text("confidence").default("certain"), // certain, probable, uncertain
    confidenceScore: real("confidence_score").default(1.0),
    sourceId: integer("source_id").references(() => sources.id, {
      onDelete: "restrict",
    }),
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("poem_attributions_poem_idx").on(table.poemId),
    index("poem_attributions_poet_idx").on(table.poetId),
    index("poem_attributions_unique_idx").on(table.poemId, table.poetId),
  ],
);

// Locations（場所）- 場所（E53 Place）
export const locations = sqliteTable(
  "locations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    imiPrefCode: text("imi_pref_code"), // IMI共通語彙基盤の都道府県コード
    region: text("region"),
    prefecture: text("prefecture"),
    municipality: text("municipality"),
    address: text("address"),
    placeName: text("place_name"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    geohash: text("geohash"), // 地理検索高速化用
    geomGeojson: text("geom_geojson"), // GeoJSON形式の地理情報
    accuracyM: real("accuracy_m"), // 測位誤差（メートル）
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("locations_pref_idx").on(table.prefecture),
    index("locations_coord_idx").on(table.latitude, table.longitude),
    index("locations_geohash_idx").on(table.geohash),
    index("locations_imi_idx").on(table.imiPrefCode),
  ],
);

// Sources（出典）- 情報資源（E31 Document）
export const sources = sqliteTable(
  "sources",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    citation: text("citation").notNull(), // 文献引用文字列
    author: text("author"),
    title: text("title"),
    publisher: text("publisher"),
    sourceYear: integer("source_year"),
    url: text("url"),
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("sources_title_idx").on(table.title),
    index("sources_author_idx").on(table.author),
    index("sources_year_idx").on(table.sourceYear),
  ],
);

// Media（メディア）- デジタル資源
export const media = sqliteTable(
  "media",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    monumentId: integer("monument_id")
      .notNull()
      .references(() => monuments.id, {
        onDelete: "cascade",
      }),
    mediaType: text("media_type").notNull(), // photo, model3d, video, audio, other
    url: text("url").notNull(),
    iiifManifestUrl: text("iiif_manifest_url"), // IIIF マニフェストURL
    capturedAt: text("captured_at"), // 撮影・作成日時
    photographer: text("photographer"),
    license: text("license"),
    exifJson: text("exif_json"), // EXIF情報（JSON形式）
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("media_monument_idx").on(table.monumentId),
    index("media_type_idx").on(table.mediaType),
  ],
);

// Measurements（寸法・測定値）
export const measurements = sqliteTable(
  "measurements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    monumentId: integer("monument_id")
      .notNull()
      .references(() => monuments.id, {
        onDelete: "cascade",
      }),
    measurementType: text("measurement_type").notNull(), // height, width, depth, weight等
    value: real("value").notNull(),
    unit: text("unit").notNull(),
    measuredAt: text("measured_at"), // 測定日
    measuredBy: text("measured_by"), // 測定者
    sourceId: integer("source_id").references(() => sources.id, {
      onDelete: "restrict",
    }),
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("measurements_monument_idx").on(table.monumentId),
    index("measurements_type_idx").on(table.measurementType),
  ],
);

// Events（出来事）- 時間的エンティティ（E5 Event）
export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    monumentId: integer("monument_id")
      .notNull()
      .references(() => monuments.id, {
        onDelete: "cascade",
      }),
    eventType: text("event_type").notNull(), // erected, restored, designated, observed等
    huTimeNormalized: text("hu_time_normalized"), // HuTime正規化文字列
    intervalStart: text("interval_start"), // ISO 8601形式 開始日時
    intervalEnd: text("interval_end"), // ISO 8601形式 終了日時
    uncertaintyNote: text("uncertainty_note"), // 不確実性に関する記述
    actor: text("actor"), // 関与者・団体
    sourceId: integer("source_id").references(() => sources.id, {
      onDelete: "restrict",
    }),
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("events_monument_idx").on(table.monumentId),
    index("events_type_idx").on(table.eventType),
    index("events_time_idx").on(table.intervalStart),
  ],
);

// Monument Locations（句碑と場所の関連）- 空間的関係
export const monumentLocations = sqliteTable(
  "monument_locations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    monumentId: integer("monument_id")
      .notNull()
      .references(() => monuments.id, {
        onDelete: "cascade",
      }),
    locationId: integer("location_id")
      .notNull()
      .references(() => locations.id, {
        onDelete: "cascade",
      }),
    assignedAt: text("assigned_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
    isPrimary: integer("is_primary").default(0),
  },
  (table) => [
    index("monument_locations_monument_idx").on(table.monumentId),
    index("monument_locations_location_idx").on(table.locationId),
    index("monument_locations_unique_idx").on(
      table.monumentId,
      table.locationId,
    ),
  ],
);

// Inscription Poems（碑文と句の関連）
export const inscriptionPoems = sqliteTable(
  "inscription_poems",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    inscriptionId: integer("inscription_id")
      .notNull()
      .references(() => inscriptions.id, {
        onDelete: "cascade",
      }),
    poemId: integer("poem_id")
      .notNull()
      .references(() => poems.id, {
        onDelete: "cascade",
      }),
    position: integer("position").default(1),
    createdAt: text("created_at")
      .default(sql`(DATETIME('now','localtime'))`)
      .notNull(),
  },
  (table) => [
    index("inscription_poems_inscription_idx").on(table.inscriptionId),
    index("inscription_poems_poem_idx").on(table.poemId),
    index("inscription_poems_unique_idx").on(table.inscriptionId, table.poemId),
  ],
);

export const haikuMonuments = monuments;
