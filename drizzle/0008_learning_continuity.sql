CREATE TABLE v2_learning_developments(owner TEXT NOT NULL,id TEXT NOT NULL,target_key TEXT NOT NULL,revision INTEGER NOT NULL,event_json TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,withdrawn INTEGER NOT NULL DEFAULT 0,last_operation TEXT NOT NULL,PRIMARY KEY(owner,id));
--> statement-breakpoint
CREATE TABLE v2_learning_development_revisions(owner TEXT NOT NULL,development_id TEXT NOT NULL,revision INTEGER NOT NULL,data TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(owner,development_id,revision));
--> statement-breakpoint
CREATE TABLE v2_learning_perspectives(owner TEXT NOT NULL,target_key TEXT NOT NULL,revision INTEGER NOT NULL,data TEXT NOT NULL,updated_at TEXT NOT NULL,last_operation TEXT NOT NULL,PRIMARY KEY(owner,target_key));
--> statement-breakpoint
CREATE INDEX v2_learning_target_chronology ON v2_learning_developments(owner,target_key,updated_at,id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS v2_catalogue_heads(owner TEXT NOT NULL,article_id TEXT NOT NULL,catalogue_rev INTEGER NOT NULL,edition_json TEXT NOT NULL,source_manuscript_id TEXT,last_operation TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(owner,article_id));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS v2_catalogue_revisions(owner TEXT NOT NULL,article_id TEXT NOT NULL,catalogue_rev INTEGER NOT NULL,edition_json TEXT NOT NULL,source_manuscript_id TEXT,created_at TEXT NOT NULL,PRIMARY KEY(owner,article_id,catalogue_rev));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS v2_catalogue_terms(owner TEXT NOT NULL,article_id TEXT NOT NULL,entry_id TEXT NOT NULL,alias_ordinal INTEGER NOT NULL,term_exact TEXT COLLATE BINARY NOT NULL,term_fold_ascii TEXT,kind TEXT NOT NULL,target_rendition TEXT NOT NULL,section_id TEXT NOT NULL,part_id TEXT,catalogue_rev INTEGER NOT NULL,PRIMARY KEY(owner,article_id,entry_id,alias_ordinal));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS v2_catalogue_terms_exact ON v2_catalogue_terms(owner,term_exact COLLATE BINARY);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS v2_catalogue_terms_fold ON v2_catalogue_terms(owner,term_fold_ascii);
--> statement-breakpoint
CREATE TRIGGER v2_learning_developments_namespace_insert AFTER INSERT ON v2_learning_developments BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_learning_developments_namespace_update AFTER UPDATE ON v2_learning_developments BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_learning_developments_namespace_delete AFTER DELETE ON v2_learning_developments BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_learning_development_revisions_namespace_insert AFTER INSERT ON v2_learning_development_revisions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_learning_development_revisions_namespace_update AFTER UPDATE ON v2_learning_development_revisions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_learning_development_revisions_namespace_delete AFTER DELETE ON v2_learning_development_revisions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_learning_perspectives_namespace_insert AFTER INSERT ON v2_learning_perspectives BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_learning_perspectives_namespace_update AFTER UPDATE ON v2_learning_perspectives BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_learning_perspectives_namespace_delete AFTER DELETE ON v2_learning_perspectives BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_catalogue_heads_namespace_insert AFTER INSERT ON v2_catalogue_heads BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_catalogue_heads_namespace_update AFTER UPDATE ON v2_catalogue_heads BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_catalogue_heads_namespace_delete AFTER DELETE ON v2_catalogue_heads BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_catalogue_revisions_namespace_insert AFTER INSERT ON v2_catalogue_revisions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_catalogue_revisions_namespace_update AFTER UPDATE ON v2_catalogue_revisions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(NEW.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;
--> statement-breakpoint
CREATE TRIGGER v2_catalogue_revisions_namespace_delete AFTER DELETE ON v2_catalogue_revisions BEGIN INSERT INTO v2_namespace_versions(owner,version) VALUES(OLD.owner,1) ON CONFLICT(owner) DO UPDATE SET version=v2_namespace_versions.version+1; END;

--> statement-breakpoint
INSERT OR IGNORE INTO v2_catalogue_heads(owner,article_id,catalogue_rev,edition_json,source_manuscript_id,last_operation,updated_at)
SELECT r.owner,r.id,1,json_object('version',1,'references',json(coalesce((SELECT json_group_array(json_patch('{}',json_object('id',json_extract(c.value,'$.id'),'kind',coalesce(json_extract(c.value,'$.kind'),'concept'),'term',json_extract(c.value,'$.term'),'aliases',json(json_extract(c.value,'$.aliases')),'caseSensitive',json(CASE WHEN json_extract(c.value,'$.caseSensitive')=0 THEN 'false' ELSE 'true' END),'definition',json_extract(c.value,'$.definition'),'signature',json_extract(c.value,'$.signature'),'usage',json_extract(c.value,'$.usage'),'environment',json_extract(c.value,'$.environment'),'target',json_object('rendition',json_extract(r.data,'$.rendition'),'sectionId',json_extract(c.value,'$.sectionId'),'partId',json_extract(c.value,'$.partId'),'examplePartId',json_extract(c.value,'$.examplePartId'))))) FROM json_each(r.data,'$.concepts') c),'[]'))),NULL,'catalogue-legacy-cutover',json_extract(r.data,'$.updatedAt') FROM v2_records r WHERE r.family='article' AND r.trashed_at IS NULL AND NOT EXISTS(SELECT 1 FROM v2_catalogue_heads h WHERE h.owner=r.owner AND h.article_id=r.id);
--> statement-breakpoint
INSERT OR IGNORE INTO v2_catalogue_revisions(owner,article_id,catalogue_rev,edition_json,source_manuscript_id,created_at) SELECT owner,article_id,catalogue_rev,edition_json,source_manuscript_id,updated_at FROM v2_catalogue_heads WHERE last_operation='catalogue-legacy-cutover';
--> statement-breakpoint
INSERT INTO v2_catalogue_terms(owner,article_id,entry_id,alias_ordinal,term_exact,term_fold_ascii,kind,target_rendition,section_id,part_id,catalogue_rev)
SELECT h.owner,h.article_id,json_extract(e.value,'$.id'),a.key,a.value,CASE WHEN json_extract(e.value,'$.caseSensitive')=0 THEN lower(a.value) ELSE NULL END,json_extract(e.value,'$.kind'),json_extract(e.value,'$.target.rendition'),json_extract(e.value,'$.target.sectionId'),json_extract(e.value,'$.target.partId'),h.catalogue_rev FROM v2_catalogue_heads h,json_each(h.edition_json,'$.references') e,json_each(json_insert(json_extract(e.value,'$.aliases'),'$[#]',json_extract(e.value,'$.term'))) a;
