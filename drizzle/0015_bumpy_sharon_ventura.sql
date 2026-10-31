CREATE TABLE `v2_test_observation_runs` (
	`owner` text NOT NULL,
	`scenario` text NOT NULL,
	`run_id` text NOT NULL,
	`generation` text NOT NULL,
	`epoch` integer NOT NULL,
	`source_commit` text,
	`status` text NOT NULL,
	`session_id` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`start_operation` text NOT NULL,
	`last_operation` text NOT NULL,
	`last_payload` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner`, `scenario`, `run_id`)
);
--> statement-breakpoint
CREATE TABLE `v2_test_observed_calls` (
	`owner` text NOT NULL,
	`scenario` text NOT NULL,
	`run_id` text NOT NULL,
	`call_id` text NOT NULL,
	`session_id` text NOT NULL,
	`phase` text NOT NULL,
	`tool_name` text NOT NULL,
	`outcome` text NOT NULL,
	`error_code` text,
	`elapsed_ms` integer NOT NULL,
	`received_at` text NOT NULL,
	PRIMARY KEY(`owner`, `scenario`, `run_id`, `call_id`)
);
--> statement-breakpoint
CREATE INDEX `v2_test_observed_calls_order` ON `v2_test_observed_calls` (`owner`,`scenario`,`run_id`,`received_at`,`call_id`);--> statement-breakpoint
CREATE TABLE `v2_test_state_snapshots` (
	`owner` text NOT NULL,
	`scenario` text NOT NULL,
	`run_id` text NOT NULL,
	`checkpoint_id` text NOT NULL,
	`moment` text NOT NULL,
	`session_id` text NOT NULL,
	`phase` text NOT NULL,
	`controller_revision` integer NOT NULL,
	`namespace_version` integer NOT NULL,
	`state_json` text NOT NULL,
	`observed_at` text NOT NULL,
	PRIMARY KEY(`owner`, `scenario`, `run_id`, `checkpoint_id`, `moment`)
);
--> statement-breakpoint
CREATE INDEX `v2_test_state_snapshots_order` ON `v2_test_state_snapshots` (`owner`,`scenario`,`run_id`,`observed_at`);