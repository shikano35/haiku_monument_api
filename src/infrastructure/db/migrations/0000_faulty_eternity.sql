CREATE TABLE `haiku_monuments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inscription` text NOT NULL,
	`commentary` text,
	`kigo` text,
	`season` text,
	`is_reliable` integer DEFAULT 0,
	`has_reverse_inscription` integer DEFAULT 0,
	`material` text,
	`total_height` real,
	`width` real,
	`depth` real,
	`established_date` text,
	`established_year` integer,
	`founder` text,
	`monument_type` text,
	`designation_status` text,
	`photo_url` text,
	`photo_date` text,
	`photographer` text,
	`model_3d_url` text,
	`remarks` text,
	`poet_id` integer,
	`source_id` integer,
	`location_id` integer,
	`created_at` text DEFAULT (DATETIME('now','localtime')),
	`updated_at` text DEFAULT (DATETIME('now','localtime')),
	FOREIGN KEY (`poet_id`) REFERENCES `poets`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`region` text NOT NULL,
	`prefecture` text NOT NULL,
	`municipality` text,
	`address` text,
	`place_name` text,
	`latitude` real,
	`longitude` real
);
--> statement-breakpoint
CREATE TABLE `poets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`biography` text,
	`link_url` text,
	`image_url` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')),
	`updated_at` text DEFAULT (DATETIME('now','localtime'))
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`publisher` text,
	`source_year` integer,
	`url` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')),
	`updated_at` text DEFAULT (DATETIME('now','localtime'))
);
