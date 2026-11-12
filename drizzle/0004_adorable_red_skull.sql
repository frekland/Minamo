CREATE TABLE `v2_generation_heads` (
	`owner` text PRIMARY KEY NOT NULL,
	`generation_id` text NOT NULL,
	`revision` integer NOT NULL,
	`namespace` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `v2_permission_floors` (
	`owner` text NOT NULL,
	`kind` text NOT NULL,
	`target_id` text NOT NULL,
	`revoked` integer NOT NULL,
	`export_denied` integer NOT NULL,
	PRIMARY KEY(`owner`, `kind`, `target_id`)
);
--> statement-breakpoint
CREATE TABLE `v2_recovery_archives` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`summary` text NOT NULL,
	`manifest_key` text NOT NULL,
	`digest` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE TABLE `v2_recovery_operations` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`hash` text NOT NULL,
	`result` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE TABLE `v2_recovery_stages` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`archive_id` text NOT NULL,
	`namespace` text NOT NULL,
	`summary` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
