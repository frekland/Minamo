CREATE TABLE `v2_manuscript_editions` (
 `owner` text NOT NULL,
 `id` text NOT NULL,
 `digest` text NOT NULL,
 `source` text NOT NULL,
 `refs` text NOT NULL,
 `created_at` text NOT NULL,
 PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE TRIGGER v2_manuscript_editions_immutable_update BEFORE UPDATE ON v2_manuscript_editions BEGIN SELECT RAISE(ABORT,'immutable manuscript edition'); END;
--> statement-breakpoint
CREATE TRIGGER v2_manuscript_editions_immutable_delete BEFORE DELETE ON v2_manuscript_editions BEGIN SELECT RAISE(ABORT,'immutable manuscript edition'); END;
--> statement-breakpoint
CREATE TRIGGER v2_manuscript_editions_namespace_insert AFTER INSERT ON v2_manuscript_editions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
