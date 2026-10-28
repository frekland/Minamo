CREATE TABLE `v2_beta_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`principal` text NOT NULL,
	`kind` text NOT NULL,
	`body` text NOT NULL,
	`route` text,
	`state` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `v2_beta_members` (
	`principal` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`state` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`admin` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `v2_beta_members_code_unique` ON `v2_beta_members` (`code`);
