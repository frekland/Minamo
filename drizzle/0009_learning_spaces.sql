CREATE TABLE IF NOT EXISTS v2_learning_scope_epochs(owner TEXT NOT NULL PRIMARY KEY,version INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS v2_learning_scopes(owner TEXT NOT NULL,family TEXT NOT NULL,id TEXT NOT NULL,rev INTEGER NOT NULL,scope_json TEXT NOT NULL,last_operation TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(owner,family,id));
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS v2_learning_scopes_namespace_insert AFTER INSERT ON v2_learning_scopes BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; INSERT INTO v2_learning_scope_epochs(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_learning_scope_epochs.version+1; END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS v2_learning_scopes_namespace_update AFTER UPDATE ON v2_learning_scopes BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; INSERT INTO v2_learning_scope_epochs(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_learning_scope_epochs.version+1; END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS v2_learning_scopes_namespace_delete AFTER DELETE ON v2_learning_scopes BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; INSERT INTO v2_learning_scope_epochs(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_learning_scope_epochs.version+1; END;

--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS v2_records_learning_scope_epoch AFTER UPDATE OF data ON v2_records WHEN coalesce(json_extract(OLD.data,'$.learningScope'),'')<>coalesce(json_extract(NEW.data,'$.learningScope'),'') BEGIN INSERT INTO v2_learning_scope_epochs(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_learning_scope_epochs.version+1; END;
