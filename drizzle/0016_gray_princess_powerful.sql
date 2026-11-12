CREATE TABLE `v2_project_contribution_operations` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`hash` text NOT NULL,
	`nonce` text NOT NULL,
	`receipt_json` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE TABLE `v2_project_contribution_revisions` (
	`owner` text NOT NULL,
	`project_id` text NOT NULL,
	`id` text NOT NULL,
	`revision` integer NOT NULL,
	`snapshot_json` text NOT NULL,
	PRIMARY KEY(`owner`, `project_id`, `id`, `revision`)
);
--> statement-breakpoint
CREATE TABLE `v2_project_contributions` (
	`owner` text NOT NULL,
	`project_id` text NOT NULL,
	`section_id` text NOT NULL,
	`part_id` text NOT NULL,
	`id` text NOT NULL,
	`revision` integer NOT NULL,
	`kind` text NOT NULL,
	`columns_json` text NOT NULL,
	`cells_json` text NOT NULL,
	`review_json` text,
	`deleted` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`last_operation` text NOT NULL,
	PRIMARY KEY(`owner`, `project_id`, `id`)
);
--> statement-breakpoint
CREATE INDEX `v2_project_contributions_scope` ON `v2_project_contributions` (`owner`,`project_id`,`section_id`,`part_id`);