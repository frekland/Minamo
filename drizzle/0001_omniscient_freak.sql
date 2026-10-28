CREATE TABLE `v2_activity` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`family` text NOT NULL,
	`record_id` text NOT NULL,
	`verb` text NOT NULL,
	`actor` text NOT NULL,
	`synthetic` integer NOT NULL,
	`at` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE TABLE `v2_operations` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`hash` text NOT NULL,
	`nonce` text NOT NULL,
	`status` integer NOT NULL,
	`response` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE TABLE `v2_records` (
	`owner` text NOT NULL,
	`family` text NOT NULL,
	`id` text NOT NULL,
	`data` text NOT NULL,
	`rev` integer NOT NULL,
	`trashed_at` text,
	`last_operation` text NOT NULL,
	PRIMARY KEY(`owner`, `family`, `id`)
);
--> statement-breakpoint
CREATE TABLE `v2_revisions` (
	`owner` text NOT NULL,
	`family` text NOT NULL,
	`id` text NOT NULL,
	`revision` integer NOT NULL,
	`data` text NOT NULL,
	`rendition` text,
	PRIMARY KEY(`owner`, `family`, `id`, `revision`)
);
