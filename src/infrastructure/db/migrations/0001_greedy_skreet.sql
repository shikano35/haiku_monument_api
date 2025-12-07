CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monument_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`hu_time_normalized` text,
	`interval_start` text,
	`interval_end` text,
	`uncertainty_note` text,
	`actor` text,
	`source_id` integer,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	FOREIGN KEY (`monument_id`) REFERENCES `monuments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `events_monument_idx` ON `events` (`monument_id`);--> statement-breakpoint
CREATE INDEX `events_type_idx` ON `events` (`event_type`);--> statement-breakpoint
CREATE INDEX `events_time_idx` ON `events` (`interval_start`);--> statement-breakpoint
CREATE TABLE `monuments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`canonical_name` text NOT NULL,
	`monument_type` text,
	`monument_type_uri` text,
	`material` text,
	`material_uri` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	`updated_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `monuments_canonical_name_idx` ON `monuments` (`canonical_name`);--> statement-breakpoint
CREATE INDEX `monuments_type_idx` ON `monuments` (`monument_type`);--> statement-breakpoint
CREATE TABLE `inscription_poems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inscription_id` integer NOT NULL,
	`poem_id` integer NOT NULL,
	`position` integer DEFAULT 1,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	FOREIGN KEY (`inscription_id`) REFERENCES `inscriptions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`poem_id`) REFERENCES `poems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `inscription_poems_inscription_idx` ON `inscription_poems` (`inscription_id`);--> statement-breakpoint
CREATE INDEX `inscription_poems_poem_idx` ON `inscription_poems` (`poem_id`);--> statement-breakpoint
CREATE INDEX `inscription_poems_unique_idx` ON `inscription_poems` (`inscription_id`,`poem_id`);--> statement-breakpoint
CREATE TABLE `inscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monument_id` integer NOT NULL,
	`side` text DEFAULT 'front' NOT NULL,
	`original_text` text,
	`transliteration` text,
	`reading` text,
	`language` text DEFAULT 'ja',
	`notes` text,
	`source_id` integer,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	`updated_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	FOREIGN KEY (`monument_id`) REFERENCES `monuments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `inscriptions_monument_idx` ON `inscriptions` (`monument_id`);--> statement-breakpoint
CREATE INDEX `inscriptions_text_idx` ON `inscriptions` (`original_text`);--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monument_id` integer NOT NULL,
	`measurement_type` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`measured_at` text,
	`measured_by` text,
	`source_id` integer,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	FOREIGN KEY (`monument_id`) REFERENCES `monuments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `measurements_monument_idx` ON `measurements` (`monument_id`);--> statement-breakpoint
CREATE INDEX `measurements_type_idx` ON `measurements` (`measurement_type`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monument_id` integer NOT NULL,
	`media_type` text NOT NULL,
	`url` text NOT NULL,
	`iiif_manifest_url` text,
	`captured_at` text,
	`photographer` text,
	`license` text,
	`exif_json` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	`updated_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	FOREIGN KEY (`monument_id`) REFERENCES `monuments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `media_monument_idx` ON `media` (`monument_id`);--> statement-breakpoint
CREATE INDEX `media_type_idx` ON `media` (`media_type`);--> statement-breakpoint
CREATE TABLE `monument_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monument_id` integer NOT NULL,
	`location_id` integer NOT NULL,
	`assigned_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	`is_primary` integer DEFAULT 0,
	FOREIGN KEY (`monument_id`) REFERENCES `monuments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `monument_locations_monument_idx` ON `monument_locations` (`monument_id`);--> statement-breakpoint
CREATE INDEX `monument_locations_location_idx` ON `monument_locations` (`location_id`);--> statement-breakpoint
CREATE INDEX `monument_locations_unique_idx` ON `monument_locations` (`monument_id`,`location_id`);--> statement-breakpoint
CREATE TABLE `poem_attributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`poem_id` integer NOT NULL,
	`poet_id` integer NOT NULL,
	`confidence` text DEFAULT 'certain',
	`confidence_score` real DEFAULT 1,
	`source_id` integer,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	FOREIGN KEY (`poem_id`) REFERENCES `poems`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`poet_id`) REFERENCES `poets`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `poem_attributions_poem_idx` ON `poem_attributions` (`poem_id`);--> statement-breakpoint
CREATE INDEX `poem_attributions_poet_idx` ON `poem_attributions` (`poet_id`);--> statement-breakpoint
CREATE INDEX `poem_attributions_unique_idx` ON `poem_attributions` (`poem_id`,`poet_id`);--> statement-breakpoint
CREATE TABLE `poems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`normalized_text` text NOT NULL,
	`text_hash` text NOT NULL,
	`kigo` text,
	`season` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	`updated_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `poems_normalized_text_unique` ON `poems` (`normalized_text`);--> statement-breakpoint
CREATE INDEX `poems_text_idx` ON `poems` (`text`);--> statement-breakpoint
CREATE INDEX `poems_normalized_idx` ON `poems` (`normalized_text`);--> statement-breakpoint
CREATE INDEX `poems_season_idx` ON `poems` (`season`);--> statement-breakpoint
DROP TABLE IF EXISTS `haiku_monuments`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`imi_pref_code` text,
	`region` text,
	`prefecture` text,
	`municipality` text,
	`address` text,
	`place_name` text,
	`latitude` real,
	`longitude` real,
	`geohash` text,
	`geom_geojson` text,
	`accuracy_m` real,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	`updated_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_locations`("id", "region", "prefecture", "municipality", "address", "place_name", "latitude", "longitude") SELECT "id", "region", "prefecture", "municipality", "address", "place_name", "latitude", "longitude" FROM `locations`;--> statement-breakpoint
DROP TABLE `locations`;--> statement-breakpoint
ALTER TABLE `__new_locations` RENAME TO `locations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `locations_pref_idx` ON `locations` (`prefecture`);--> statement-breakpoint
CREATE INDEX `locations_coord_idx` ON `locations` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `locations_geohash_idx` ON `locations` (`geohash`);--> statement-breakpoint
CREATE INDEX `locations_imi_idx` ON `locations` (`imi_pref_code`);--> statement-breakpoint
CREATE TABLE `__new_poets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`name_kana` text,
	`biography` text,
	`birth_year` integer,
	`death_year` integer,
	`link_url` text,
	`image_url` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	`updated_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_poets`("id", "name", "biography", "link_url", "image_url", "created_at", "updated_at") SELECT "id", "name", "biography", "link_url", "image_url", "created_at", "updated_at" FROM `poets`;--> statement-breakpoint
DROP TABLE `poets`;--> statement-breakpoint
ALTER TABLE `__new_poets` RENAME TO `poets`;--> statement-breakpoint
CREATE INDEX `poets_name_idx` ON `poets` (`name`);--> statement-breakpoint
CREATE INDEX `poets_birth_idx` ON `poets` (`birth_year`);--> statement-breakpoint
CREATE TABLE `__new_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`citation` text NOT NULL,
	`author` text,
	`title` text,
	`publisher` text,
	`source_year` integer,
	`url` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL,
	`updated_at` text DEFAULT (DATETIME('now','localtime')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_sources`("id", "title", "author", "publisher", "source_year", "url", "created_at", "updated_at", "citation") SELECT "id", "title", "author", "publisher", "source_year", "url", "created_at", "updated_at", "title || '（' || COALESCE(author, '') || '、' || COALESCE(source_year, '') || '年）'" FROM `sources`;--> statement-breakpoint
DROP TABLE `sources`;--> statement-breakpoint
ALTER TABLE `__new_sources` RENAME TO `sources`;--> statement-breakpoint
CREATE INDEX `sources_title_idx` ON `sources` (`title`);--> statement-breakpoint
CREATE INDEX `sources_author_idx` ON `sources` (`author`);--> statement-breakpoint
CREATE INDEX `sources_year_idx` ON `sources` (`source_year`);