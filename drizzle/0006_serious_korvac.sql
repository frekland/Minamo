CREATE TABLE `v2_media` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`upload_id` text NOT NULL,
	`digest` text NOT NULL,
	`mime` text NOT NULL,
	`kind` text NOT NULL,
	`bytes` integer NOT NULL,
	`details` text NOT NULL,
	`state` text NOT NULL,
	`revision` integer NOT NULL,
	`expires_at` text,
	`object_key` text NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `v2_media_owner_upload_unique` ON `v2_media` (`owner`,`upload_id`);--> statement-breakpoint
CREATE TABLE `v2_media_attachments` (
	`owner` text NOT NULL,
	`asset_id` text NOT NULL,
	`family` text NOT NULL,
	`record_id` text NOT NULL,
	PRIMARY KEY(`owner`, `asset_id`, `family`, `record_id`)
);

--> statement-breakpoint
CREATE TRIGGER v2_media_namespace_insert AFTER INSERT ON v2_media BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_media_namespace_update AFTER UPDATE ON v2_media BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_media_namespace_delete AFTER DELETE ON v2_media BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_media_attachments_namespace_insert AFTER INSERT ON v2_media_attachments BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_media_attachments_namespace_update AFTER UPDATE ON v2_media_attachments BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_media_attachments_namespace_delete AFTER DELETE ON v2_media_attachments BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
