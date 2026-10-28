CREATE TABLE `v2_bookmarks` (
	`owner` text NOT NULL,
	`target_key` text NOT NULL,
	`target` text NOT NULL,
	`target_rev` integer NOT NULL,
	`active` integer NOT NULL,
	`flag_id` text,
	`last_operation` text NOT NULL,
	PRIMARY KEY(`owner`, `target_key`)
);
