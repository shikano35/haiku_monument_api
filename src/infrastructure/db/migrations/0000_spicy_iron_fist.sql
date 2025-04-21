CREATE TABLE `haiku_monuments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`poet_id` integer,
	`source_id` integer,
	`established_date` text,
	`location_id` integer,
	`commentary` text,
	`image_url` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')),
	`updated_at` text DEFAULT (DATETIME('now','localtime')),
	FOREIGN KEY (`poet_id`) REFERENCES `poets`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prefecture` text NOT NULL,
	`region` text,
	`address` text,
	`latitude` real,
	`longitude` real,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `poets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`biography` text,
	`links` text,
	`image_url` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')),
	`updated_at` text DEFAULT (DATETIME('now','localtime'))
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`year` integer,
	`url` text,
	`publisher` text,
	`created_at` text DEFAULT (DATETIME('now','localtime')),
	`updated_at` text DEFAULT (DATETIME('now','localtime'))
);
