CREATE TABLE `v2_scenario_control` (
	`owner` text NOT NULL,
	`scenario` text NOT NULL,
	`epoch` integer DEFAULT 0 NOT NULL,
	`phase` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`generation` text NOT NULL,
	`pending_json` text,
	`receipt_json` text,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner`, `scenario`)
);
