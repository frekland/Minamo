CREATE TABLE `v2_test_transcript_events` (
	`owner` text NOT NULL,
	`scenario` text NOT NULL,
	`run_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`entry_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`session_id` text NOT NULL,
	`phase` text NOT NULL,
	`event_kind` text NOT NULL,
	`segment_type` text,
	`provenance` text NOT NULL,
	`markdown` text NOT NULL,
	`links_json` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`owner`, `scenario`, `run_id`, `sequence`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `v2_test_transcript_entry_unique` ON `v2_test_transcript_events` (`owner`,`scenario`,`run_id`,`entry_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `v2_test_transcript_operation_unique` ON `v2_test_transcript_events` (`owner`,`scenario`,`run_id`,`operation_id`);--> statement-breakpoint
CREATE TABLE `v2_test_transcript_runs` (
	`owner` text NOT NULL,
	`scenario` text NOT NULL,
	`run_id` text NOT NULL,
	`generation` text NOT NULL,
	`epoch` integer NOT NULL,
	`fixture_version` text NOT NULL,
	`persona_variant` text,
	`source_commit` text,
	`site_version` text,
	`model_label` text,
	`start_operation_id` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`bytes` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner`, `scenario`, `run_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `v2_test_transcript_epoch_unique` ON `v2_test_transcript_runs` (`owner`,`scenario`,`generation`,`epoch`);