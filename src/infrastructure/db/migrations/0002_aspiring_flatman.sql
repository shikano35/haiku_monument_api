ALTER TABLE `monuments` ADD `is_reliable` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `monuments` ADD `verification_status` text DEFAULT 'unverified';--> statement-breakpoint
ALTER TABLE `monuments` ADD `verified_at` text;--> statement-breakpoint
ALTER TABLE `monuments` ADD `verified_by` text;--> statement-breakpoint
ALTER TABLE `monuments` ADD `reliability_note` text;--> statement-breakpoint
CREATE INDEX `monuments_reliability_idx` ON `monuments` (`verification_status`);