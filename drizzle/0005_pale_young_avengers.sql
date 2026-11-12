CREATE TABLE `v2_namespace_versions` (
	`owner` text PRIMARY KEY NOT NULL,
	`version` integer NOT NULL
);

--> statement-breakpoint
CREATE TRIGGER v2_records_namespace_insert AFTER INSERT ON v2_records BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_records_namespace_update AFTER UPDATE ON v2_records BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_records_namespace_delete AFTER DELETE ON v2_records BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_revisions_namespace_insert AFTER INSERT ON v2_revisions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_revisions_namespace_update AFTER UPDATE ON v2_revisions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_revisions_namespace_delete AFTER DELETE ON v2_revisions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_operations_namespace_insert AFTER INSERT ON v2_operations BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_operations_namespace_update AFTER UPDATE ON v2_operations BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_operations_namespace_delete AFTER DELETE ON v2_operations BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_activity_namespace_insert AFTER INSERT ON v2_activity BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_activity_namespace_update AFTER UPDATE ON v2_activity BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_activity_namespace_delete AFTER DELETE ON v2_activity BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_bookmarks_namespace_insert AFTER INSERT ON v2_bookmarks BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_bookmarks_namespace_update AFTER UPDATE ON v2_bookmarks BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_bookmarks_namespace_delete AFTER DELETE ON v2_bookmarks BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_images_namespace_insert AFTER INSERT ON v2_images BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_images_namespace_update AFTER UPDATE ON v2_images BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_images_namespace_delete AFTER DELETE ON v2_images BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_image_attachments_namespace_insert AFTER INSERT ON v2_image_attachments BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_image_attachments_namespace_update AFTER UPDATE ON v2_image_attachments BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
CREATE TRIGGER v2_image_attachments_namespace_delete AFTER DELETE ON v2_image_attachments BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
