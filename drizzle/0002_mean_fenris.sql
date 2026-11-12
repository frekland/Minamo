CREATE TABLE `v2_image_attachments` (
	`owner` text NOT NULL,
	`asset_id` text NOT NULL,
	`family` text NOT NULL,
	`record_id` text NOT NULL,
	PRIMARY KEY(`owner`, `asset_id`, `family`, `record_id`)
);
--> statement-breakpoint
CREATE TABLE `v2_images` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`upload_id` text NOT NULL,
	`digest` text NOT NULL,
	`mime` text NOT NULL,
	`bytes` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`state` text NOT NULL,
	`revision` integer NOT NULL,
	`expires_at` text,
	`object_key` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `v2_images_owner_upload_unique` ON `v2_images` (`owner`,`upload_id`);