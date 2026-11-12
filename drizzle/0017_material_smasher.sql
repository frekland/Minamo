CREATE TABLE `v2_collaboration_preference_operations` (
	`owner` text NOT NULL,
	`operation_id` text NOT NULL,
	`payload_hash` text NOT NULL,
	`nonce` text NOT NULL,
	`receipt_json` text NOT NULL,
	PRIMARY KEY(`owner`, `operation_id`)
);
--> statement-breakpoint
CREATE TABLE `v2_collaboration_preferences` (
	`owner` text NOT NULL,
	`namespace` text NOT NULL,
	`scope` text NOT NULL,
	`target_id` text NOT NULL,
	`revision` integer NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_operation` text NOT NULL,
	PRIMARY KEY(`owner`, `namespace`, `scope`, `target_id`)
);
