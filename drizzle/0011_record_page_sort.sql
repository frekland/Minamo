-- Match collection keyset ordering; active pages avoid scanning retained Trash.
CREATE INDEX IF NOT EXISTS v2_records_owner_updated ON v2_records(owner,json_extract(data,'$.updatedAt') DESC,family,id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS v2_records_active_owner_updated ON v2_records(owner,json_extract(data,'$.updatedAt') DESC,family,id) WHERE trashed_at IS NULL;
