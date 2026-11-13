# Project context v1 — normal-chat MCP acceptance handoff

This is a copy-ready independent acceptance plan for a **normal ChatGPT conversation connected to Minamo**, after the PR branch is available in the test environment. No live MCP acceptance was performed during Work. Run writes only against owner-authorised synthetic Projects and synthetic destination Articles/Questions. Do not use genuine learner material.

## Safe test setup

Use one disposable owner profile and three clearly marked synthetic Projects: Japanese grammar/conversation, computing with exact code and an explicitly labelled observation, and research/creative material with two distinct interpretations or revisions. Include a learner-authored Note with private text and a test Article plus Question. Record each exact family/id/revision/rendition. Do not change global MCP preferences on an ordinary owner profile; if preference-negative checks are required, use a disposable profile and restore its starting values through Minamo Settings.

Each MCP call below is a `tools/call`; Minamo tool schemas require the `purpose` property. Replace bracketed values with exact identities read from Minamo. Keep one operation ID and the exact same payload for retries.

## 1. Cold orientation and exact reading

In a new ChatGPT conversation with no prior Project text in its transcript:

```json
{"name":"get_project_learning_outline","arguments":{"purpose":"Orient to this owner-authorised synthetic Project","projectId":"[PROJECT_ID]"}}
```

Expected: exact Project ID/title/revision, named topic/context identities, purpose/provenance, exact internal relations, exact external references and saved continuation only where present. No full lesson prose, mastery claim, inferred recent activity or invented next task. A missing continuation remains absent. Try the three different subject Projects; no language-specific schema should be required.

Fetch one selected exact page:

```json
{"name":"get_project_learning_reading","arguments":{"purpose":"Read the selected exact synthetic topic","projectId":"[PROJECT_ID]","topicIds":["[TOPIC_ID]"]}}
```

Or fetch a single explicit context:

```json
{"name":"get_project_learning_reading","arguments":{"purpose":"Read this exact synthetic context","projectId":"[PROJECT_ID]","contextId":"[CONTEXT_ID]"}}
```

Expected: complete typed canonical parts, exact revision and identities; no unavailable part leakage, silent truncation, source substitution or inferred continuity. Try `revision` with a known earlier revision and verify its old text and old references remain exact. Try nine topic IDs / a response larger than the published bound; expect a clear validation/size error and no partial content presented as complete.

## 2. Extend one existing context in place

Choose a Project page with an existing canonical part, exact `blockId`, `pageId`, and (if set) `contextId` from the outline. Copy an exact `rendition` and destination `sectionId`/`partId` from a synthetic Article or Question. Preview:

```json
{"name":"update_project_learning_material","arguments":{"purpose":"At my request, add one example and one practice activity to this existing synthetic context","mode":"preview","projectId":"[PROJECT_ID]","expectedProjectRev":1,"expectedGeneration":"[CURRENT_GENERATION]","operationId":"acceptance-project-page-001","source":{"blockId":"[BLOCK_ID]","pageId":"[PAGE_ID]","contextId":"[CONTEXT_ID]"},"parts":[{"id":"acceptance-example-001","kind":"paragraph","text":"[new authored example]"},{"id":"acceptance-practice-001","kind":"interactive","text":"[short prompt]","interactive":{"version":1,"type":"language-pattern","language":"ja","slots":[{"id":"action","label":"Action","choices":[{"id":"eat","label":"Eat breakfast"},{"id":"read","label":"Read a book"}]}],"examples":[{"id":"example-1","choices":{"action":"eat"},"source":{"text":"朝ご飯を食べて、学校へ行きます。","translation":"I eat breakfast and go to school.","language":"ja"}}]}}],"relations":[{"kind":"explains","target":{"sectionId":"[EXISTING_PROJECT_SECTION_ID]","partId":"[EXISTING_PROJECT_PART_ID]"}}],"references":[{"family":"article","id":"[ARTICLE_ID]","rendition":"[ARTICLE_RENDITION]","sectionId":"[ARTICLE_SECTION_ID]","partId":"[ARTICLE_PART_ID]","relation":"explains","reason":"Reusable reference for this exact context."}]}}
```

Expected preview: `valid:true`, exact source page and destination identities; no write. Confirm the source Project section is not mistaken for the external Article destination. If the selected block is directly protected, retry preview with `explicitOverrideIds:["[BLOCK_ID]"]` only after the owner explicitly authorised that exact protected block. Otherwise do not override.

Copy the exact same content and operation ID, changing only `mode` to `apply`:

```json
{"name":"update_project_learning_material","arguments":{"purpose":"Apply the preview I just authorised to this synthetic Project","mode":"apply","projectId":"[PROJECT_ID]","expectedProjectRev":1,"expectedGeneration":"[CURRENT_GENERATION]","operationId":"acceptance-project-page-001","source":{"blockId":"[BLOCK_ID]","pageId":"[PAGE_ID]","contextId":"[CONTEXT_ID]"},"parts":[{"id":"acceptance-example-001","kind":"paragraph","text":"[new authored example]"},{"id":"acceptance-practice-001","kind":"interactive","text":"[short prompt]","interactive":{"version":1,"type":"language-pattern","language":"ja","slots":[{"id":"action","label":"Action","choices":[{"id":"eat","label":"Eat breakfast"},{"id":"read","label":"Read a book"}]}],"examples":[{"id":"example-1","choices":{"action":"eat"},"source":{"text":"朝ご飯を食べて、学校へ行きます。","translation":"I eat breakfast and go to school.","language":"ja"}}]}}],"relations":[{"kind":"explains","target":{"sectionId":"[EXISTING_PROJECT_SECTION_ID]","partId":"[EXISTING_PROJECT_PART_ID]"}}],"references":[{"family":"article","id":"[ARTICLE_ID]","rendition":"[ARTICLE_RENDITION]","sectionId":"[ARTICLE_SECTION_ID]","partId":"[ARTICLE_PART_ID]","relation":"explains","reason":"Reusable reference for this exact context."}]}}
```

Expected: one committed Project revision. Read outline + that exact page again and call `read_project_changes` below. Verify old passage text/IDs are byte-for-byte unchanged, both new parts are inside the selected existing page, source-page identity and external Article destination are separate and exact, and prior revision still reads the old structure. The Question variant uses `family:"investigation"`, with its exact current rendition and passage if applicable.

Retry the identical apply call with the same operation ID and payload. Expected: replay receipt and no duplicate parts/references/revision. Reuse that operation ID with changed text and expect `idempotency_mismatch`. Use an old `expectedProjectRev` with a new operation ID and expect `revision_conflict`; there must be no partial save. Use a nonexistent source page/context, unknown internal target part, or missing exact external destination and expect an actionable error with no write.

## 3. Exact saved change history

```json
{"name":"read_project_changes","arguments":{"purpose":"Inspect the exact saved revisions of this synthetic Project","projectId":"[PROJECT_ID]","limit":8}}
```

Expected: a bounded revision list and itemised metadata for exact title/description/cover, favourites, layout-section and layout-block/lock changes, reading-page relationships and record relationship destination including rendition/section/part. A saved revision is not reported as a learning session or progress. If you create competing research interpretations or a correction, preserve both exact sources and attribution; do not collapse them into one asserted answer.

## 4. Server-enforced Note boundary and correct routes

Use `tools/list` first. Expected: no advertised `set_note_page_pin` or `record_minamo_learning_update` authoring tool. A GPT read of a permitted learner Note with `read_minamo_record` is allowed. Never print private Note prose back unnecessarily.

Negative control: each of these direct calls must return an MCP error with `code:"gpt_note_authoring_forbidden"`, and the Note revision/content/pins/history must remain unchanged:

```json
{"name":"apply_minamo_command","arguments":{"purpose":"Negative control only: GPT cannot create a Note","command":{"operationId":"acceptance-gpt-note-create","action":"create","family":"note","id":"acceptance-gpt-note","data":{"title":"Must not exist","body":"No fallback content","synthetic":true}}}}
```

```json
{"name":"apply_minamo_command","arguments":{"purpose":"Negative control only: GPT cannot update a Note","command":{"operationId":"acceptance-gpt-note-update","action":"update","family":"note","id":"[LEARNER_NOTE_ID]","expectedRev":1,"data":{"body":"Must remain unchanged"}}}}
```

```json
{"name":"apply_minamo_command","arguments":{"purpose":"Negative control only: GPT cannot trash a Note","command":{"operationId":"acceptance-gpt-note-trash","action":"trash","family":"note","id":"[LEARNER_NOTE_ID]","expectedRev":1}}}
```

```json
{"name":"apply_minamo_command","arguments":{"purpose":"Negative control only: GPT cannot restore a Note","command":{"operationId":"acceptance-gpt-note-restore","action":"restore","family":"note","id":"[TRASHED_LEARNER_NOTE_ID]","expectedRev":2}}}
```

Also directly call `apply_project_update` with one `noteChanges` entry, `set_note_page_pin` for the learner Note, and `record_minamo_learning_update` with a valid-shaped request. Expected: the same forbidden code and no Note changes, even if a client cached a previous tool catalogue. A failed Project or Library request must not fall back to a Note.

Routing positive controls on synthetic material: add continuing subject material with `update_project_learning_material`; request a reusable reference resource using `publish_minamo_manuscript` as a Library Article; create a genuine open question using the manuscript Question/Investigation role and read its exact saved result. A learner Note is written by the owner through the website, then may be read/cited by GPT. A learner contribution stays in the contribution feature and is never silently made canonical. Confirm each receipt's family and exact identity before claiming it was saved.

## 5. Preference and ownership negatives

On a disposable profile only, read current preferences and revision, then set the six global values below with the returned current `expectedRevision` and `expectedGeneration` (do not guess either value). This temporarily exercises both server gates:

```json
{"name":"set_minamo_collaboration_preferences","arguments":{"purpose":"Temporary negative-control setup on a disposable acceptance profile","intent":"explicit-owner-preferences","scope":"global","expectedGeneration":"[CURRENT_GENERATION]","expectedRevision":0,"operationId":"acceptance-preferences-preview-only","values":{"contextDepth":"balanced","relatedMaterial":"saved","initiative":"requested","authoringDetail":"balanced","projectEditing":"preview-only","mcpTools":"authoring"}}}
```

Use the actual revision from `get_minamo_collaboration_preferences` in place of `0` if it is not the initial row. Test that targeted preview works and apply is server-rejected with `project_preview_only`; website-authored content remains available. Restore the initial values with the returned new revision. Then set `mcpTools:"read-only"` using a new operation ID and the current revision. Expected: `tools/list` removes saving tools and a raw/cached apply call is denied with `mcp_read_only` while orientation, exact reads and read-only previews still work. Restore the original values through website Settings because this setting deliberately hides the MCP preference writer. Do not run these global setting changes on an ordinary owner profile.

With a second synthetic owner, use the first owner's exact Project ID. Expected: unavailable/not-found response without body, title-sensitive leakage, destinations or notes. Do not treat ID obscurity as the owner boundary.

## Acceptance record

Record date, Minamo build/source hash, fresh conversation status, exact test Project IDs/revisions, tool calls and returned codes, whether old editions/content remained intact, and any errors. This is genuine MCP acceptance only after these calls run through the normal ChatGPT connector; source tests are not a substitute.
