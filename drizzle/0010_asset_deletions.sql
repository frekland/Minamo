-- Physical deletion work is not a restorable product record. Completed rows remain
-- as upload-identity tombstones; backups and previous generations retain their own copies.
CREATE TABLE IF NOT EXISTS v2_asset_deletions(owner TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('image','media')),asset_id TEXT NOT NULL,object_key TEXT NOT NULL,operation_id TEXT NOT NULL,state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','complete')),attempts INTEGER NOT NULL DEFAULT 0,last_error TEXT,created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),completed_at TEXT,checked_at TEXT NOT NULL DEFAULT '',PRIMARY KEY(owner,kind,asset_id));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS v2_asset_deletions_pending ON v2_asset_deletions(owner,state,created_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS v2_asset_deletions_reconcile ON v2_asset_deletions(owner,checked_at,kind,asset_id);
