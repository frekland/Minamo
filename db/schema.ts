import { sqliteTable, text, integer, primaryKey, unique } from "drizzle-orm/sqlite-core";
// Admission and intentionally submitted feedback are separate from tenant
// learning generations; recovery never silently restores revoked membership.
export const betaMembers=sqliteTable('v2_beta_members',{
 principal:text('principal').primaryKey(),code:text('code').notNull().unique(),state:text('state').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),admin:text('admin'),
});
export const betaFeedback=sqliteTable('v2_beta_feedback',{
 id:text('id').primaryKey(),principal:text('principal').notNull(),kind:text('kind').notNull(),body:text('body').notNull(),route:text('route'),state:text('state').notNull().default('new'),createdAt:text('created_at').notNull(),
});
// Bounded internal test-run journal. Unlike canonical records, this is not
// learner content and is disabled by default at the authenticated MCP layer.
export const scenarioControl=sqliteTable('v2_scenario_control',{
 owner:text('owner').notNull(),scenario:text('scenario').notNull(),
 epoch:integer('epoch').notNull().default(0),phase:text('phase'),
 revision:integer('revision').notNull().default(0),
 generation:text('generation').notNull(),pendingJson:text('pending_json'),
 receiptJson:text('receipt_json'),updatedAt:text('updated_at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.scenario]})]);
// Owner-only TEST ONLY instrumentation, deliberately outside learner records.
// Run identity is pinned to a fixture epoch; entries are immutable once written.
export const testTranscriptRuns=sqliteTable('v2_test_transcript_runs',{
 owner:text('owner').notNull(),scenario:text('scenario').notNull(),runId:text('run_id').notNull(),
 generation:text('generation').notNull(),epoch:integer('epoch').notNull(),
 fixtureVersion:text('fixture_version').notNull(),personaVariant:text('persona_variant'),
 sourceCommit:text('source_commit'),siteVersion:text('site_version'),modelLabel:text('model_label'),
 startOperationId:text('start_operation_id').notNull(),revision:integer('revision').notNull().default(0),
 bytes:integer('bytes').notNull().default(0),status:text('status').notNull().default('open'),
 createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.scenario,t.runId]}),unique('v2_test_transcript_epoch_unique').on(t.owner,t.scenario,t.generation,t.epoch)]);
export const testTranscriptEvents=sqliteTable('v2_test_transcript_events',{
 owner:text('owner').notNull(),scenario:text('scenario').notNull(),runId:text('run_id').notNull(),
 sequence:integer('sequence').notNull(),entryId:text('entry_id').notNull(),operationId:text('operation_id').notNull(),
 sessionId:text('session_id').notNull(),phase:text('phase').notNull(),
 eventKind:text('event_kind').notNull(),segmentType:text('segment_type'),provenance:text('provenance').notNull(),
 markdown:text('markdown').notNull(),linksJson:text('links_json').notNull(),createdAt:text('created_at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.scenario,t.runId,t.sequence]}),
 unique('v2_test_transcript_entry_unique').on(t.owner,t.scenario,t.runId,t.entryId),
 unique('v2_test_transcript_operation_unique').on(t.owner,t.scenario,t.runId,t.operationId)]);
export const investigations = sqliteTable("investigations", {
 owner: text("owner").notNull(), id: text("id").notNull(), title: text("title").notNull(),
}, t => [primaryKey({ columns: [t.owner, t.id] })]);
export const notes = sqliteTable("notes", {
 owner: text("owner").notNull(), investigationId: text("investigation_id").notNull(),
 body: text("body").notNull(), revision: integer("revision").notNull(), updatedAt: text("updated_at").notNull(),
}, t => [primaryKey({ columns: [t.owner, t.investigationId] })]);

// V2's record/revision/operation boundary is intentionally independent of the foundation lab.
export const workspaceRecords=sqliteTable('v2_records',{
 owner:text('owner').notNull(),family:text('family').notNull(),id:text('id').notNull(),
 data:text('data').notNull(),rev:integer('rev').notNull(),trashedAt:text('trashed_at'),lastOperation:text('last_operation').notNull(),
},t=>[primaryKey({columns:[t.owner,t.family,t.id]})]);
export const workspaceRevisions=sqliteTable('v2_revisions',{
 owner:text('owner').notNull(),family:text('family').notNull(),id:text('id').notNull(),revision:integer('revision').notNull(),data:text('data').notNull(),rendition:text('rendition'),
},t=>[primaryKey({columns:[t.owner,t.family,t.id,t.revision]})]);
export const workspaceOperations=sqliteTable('v2_operations',{
 owner:text('owner').notNull(),id:text('id').notNull(),hash:text('hash').notNull(),nonce:text('nonce').notNull(),status:integer('status').notNull(),response:text('response').notNull(),
},t=>[primaryKey({columns:[t.owner,t.id]})]);
export const workspaceActivity=sqliteTable('v2_activity',{
 owner:text('owner').notNull(),id:text('id').notNull(),family:text('family').notNull(),recordId:text('record_id').notNull(),verb:text('verb').notNull(),actor:text('actor').notNull(),synthetic:integer('synthetic').notNull(),at:text('at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.id]})]);

export const privateImages=sqliteTable('v2_images',{
 owner:text('owner').notNull(),id:text('id').notNull(),uploadId:text('upload_id').notNull(),digest:text('digest').notNull(),mime:text('mime').notNull(),
 bytes:integer('bytes').notNull(),width:integer('width').notNull(),height:integer('height').notNull(),state:text('state').notNull(),revision:integer('revision').notNull(),expiresAt:text('expires_at'),objectKey:text('object_key').notNull(),
},t=>[primaryKey({columns:[t.owner,t.id]}),unique('v2_images_owner_upload_unique').on(t.owner,t.uploadId)]);
export const privateImageAttachments=sqliteTable('v2_image_attachments',{
 owner:text('owner').notNull(),assetId:text('asset_id').notNull(),family:text('family').notNull(),recordId:text('record_id').notNull(),
},t=>[primaryKey({columns:[t.owner,t.assetId,t.family,t.recordId]})]);

export const workspaceBookmarks=sqliteTable('v2_bookmarks',{owner:text('owner').notNull(),targetKey:text('target_key').notNull(),target:text('target').notNull(),targetRev:integer('target_rev').notNull(),active:integer('active').notNull(),flagId:text('flag_id'),lastOperation:text('last_operation').notNull()},t=>[primaryKey({columns:[t.owner,t.targetKey]})]);

export const generationHeads=sqliteTable('v2_generation_heads',{owner:text('owner').notNull(),generationId:text('generation_id').notNull(),revision:integer('revision').notNull(),namespace:text('namespace').notNull()},t=>[primaryKey({columns:[t.owner]})]);
export const permissionFloors=sqliteTable('v2_permission_floors',{owner:text('owner').notNull(),kind:text('kind').notNull(),targetId:text('target_id').notNull(),revoked:integer('revoked').notNull(),exportDenied:integer('export_denied').notNull()},t=>[primaryKey({columns:[t.owner,t.kind,t.targetId]})]);
export const recoveryArchives=sqliteTable('v2_recovery_archives',{owner:text('owner').notNull(),id:text('id').notNull(),summary:text('summary').notNull(),manifestKey:text('manifest_key').notNull(),digest:text('digest').notNull()},t=>[primaryKey({columns:[t.owner,t.id]})]);
export const recoveryStages=sqliteTable('v2_recovery_stages',{owner:text('owner').notNull(),id:text('id').notNull(),archiveId:text('archive_id').notNull(),namespace:text('namespace').notNull(),summary:text('summary').notNull()},t=>[primaryKey({columns:[t.owner,t.id]})]);
export const recoveryOperations=sqliteTable('v2_recovery_operations',{owner:text('owner').notNull(),id:text('id').notNull(),hash:text('hash').notNull(),result:text('result').notNull()},t=>[primaryKey({columns:[t.owner,t.id]})]);

export const namespaceVersions=sqliteTable('v2_namespace_versions',{owner:text('owner').notNull(),version:integer('version').notNull()},t=>[primaryKey({columns:[t.owner]})]);

export const privateMedia=sqliteTable('v2_media',{
 owner:text('owner').notNull(),id:text('id').notNull(),uploadId:text('upload_id').notNull(),digest:text('digest').notNull(),mime:text('mime').notNull(),kind:text('kind').notNull(),bytes:integer('bytes').notNull(),details:text('details').notNull(),state:text('state').notNull(),revision:integer('revision').notNull(),expiresAt:text('expires_at'),objectKey:text('object_key').notNull(),
},t=>[primaryKey({columns:[t.owner,t.id]}),unique('v2_media_owner_upload_unique').on(t.owner,t.uploadId)]);
export const privateMediaAttachments=sqliteTable('v2_media_attachments',{owner:text('owner').notNull(),assetId:text('asset_id').notNull(),family:text('family').notNull(),recordId:text('record_id').notNull()},t=>[primaryKey({columns:[t.owner,t.assetId,t.family,t.recordId]})]);

/** Immutable original author input, inserted in the same guarded publication batch. */
export const manuscriptEditions=sqliteTable('v2_manuscript_editions',{
 owner:text('owner').notNull(),id:text('id').notNull(),digest:text('digest').notNull(),source:text('source').notNull(),refs:text('refs').notNull(),createdAt:text('created_at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.id]})]);

export const learningDevelopments=sqliteTable('v2_learning_developments',{
 owner:text('owner').notNull(),id:text('id').notNull(),targetKey:text('target_key').notNull(),revision:integer('revision').notNull(),eventJson:text('event_json').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),withdrawn:integer('withdrawn').notNull().default(0),lastOperation:text('last_operation').notNull(),
},t=>[primaryKey({columns:[t.owner,t.id]})]);
export const learningDevelopmentRevisions=sqliteTable('v2_learning_development_revisions',{
 owner:text('owner').notNull(),developmentId:text('development_id').notNull(),revision:integer('revision').notNull(),data:text('data').notNull(),createdAt:text('created_at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.developmentId,t.revision]})]);
export const learningPerspectives=sqliteTable('v2_learning_perspectives',{
 owner:text('owner').notNull(),targetKey:text('target_key').notNull(),revision:integer('revision').notNull(),data:text('data').notNull(),updatedAt:text('updated_at').notNull(),lastOperation:text('last_operation').notNull(),
},t=>[primaryKey({columns:[t.owner,t.targetKey]})]);
export const catalogueHeads=sqliteTable('v2_catalogue_heads',{
 owner:text('owner').notNull(),articleId:text('article_id').notNull(),catalogueRev:integer('catalogue_rev').notNull(),editionJson:text('edition_json').notNull(),sourceManuscriptId:text('source_manuscript_id'),lastOperation:text('last_operation').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.articleId]})]);
export const catalogueRevisions=sqliteTable('v2_catalogue_revisions',{
 owner:text('owner').notNull(),articleId:text('article_id').notNull(),catalogueRev:integer('catalogue_rev').notNull(),editionJson:text('edition_json').notNull(),sourceManuscriptId:text('source_manuscript_id'),createdAt:text('created_at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.articleId,t.catalogueRev]})]);
export const catalogueTerms=sqliteTable('v2_catalogue_terms',{
 owner:text('owner').notNull(),articleId:text('article_id').notNull(),entryId:text('entry_id').notNull(),aliasOrdinal:integer('alias_ordinal').notNull(),termExact:text('term_exact').notNull(),termFoldAscii:text('term_fold_ascii'),kind:text('kind').notNull(),targetRendition:text('target_rendition').notNull(),sectionId:text('section_id').notNull(),partId:text('part_id'),catalogueRev:integer('catalogue_rev').notNull(),
},t=>[primaryKey({columns:[t.owner,t.articleId,t.entryId,t.aliasOrdinal]})]);

export const learningScopes=sqliteTable('v2_learning_scopes',{owner:text('owner').notNull(),family:text('family').notNull(),id:text('id').notNull(),rev:integer('rev').notNull(),scopeJson:text('scope_json').notNull(),lastOperation:text('last_operation').notNull(),updatedAt:text('updated_at').notNull()},t=>[primaryKey({columns:[t.owner,t.family,t.id]})]);
export const learningScopeEpochs=sqliteTable('v2_learning_scope_epochs',{owner:text('owner').notNull().primaryKey(),version:integer('version').notNull()});
