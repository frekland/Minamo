CREATE TABLE `investigations` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`title` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`owner` text NOT NULL,
	`investigation_id` text NOT NULL,
	`body` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner`, `investigation_id`)
);
