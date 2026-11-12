# Protected workspace recovery

Continuation of [issue #1](https://github.com/frekland/minamo-v2/issues/1), preserving V8. Exact source/CI/private-deployment identities and post-publication evidence are recorded in the issue's release receipt. Original Minamo and cyber-learning remain unchanged. Jon's subsequent report that Android annotations/Flags work is owner evidence for that basic V8 flow, not independent physical-device or TalkBack testing.

## Delivered behavior

The quiet header recovery control opens private checkpoints, integrity verification, an isolated restore candidate and a concrete activation review. Creating or inspecting a checkpoint does not switch workspaces. Activation first protects current saved work in a checkpoint, then switches the active workspace by revision CAS. Closing the panel never activates a restore. Ordinary workspace saves pause while recovery is open, preserving drafts.

Checkpoints include all seven V2 product tables: current records, retained editions, operation receipts, activity, bookmark intent/tombstones, image metadata and attachments. Immutable private R2 objects preserve exact image bytes. This is complete product state within the supported budget, including recoverable Trash; the old synthetic foundation-lab tables are explicitly excluded. No learner content or archive bodies enter Git or browser storage.

A separate portable JSON download projects current rights and reports omissions. It contains eligible current records and image references; it does **not** contain private image files, retained history, receipt archives or a restorable checkpoint. It cannot be uploaded or activated as a checkpoint. Complete downloadable/importable off-platform recovery remains unfinished; private checkpoints rely on this Site's D1/R2 and are not an independent-provider disaster backup.

## Correctness and privacy

- Snapshots read the complete bounded corpus in one D1 batch; they do not reuse the paginated workspace screen or silently drop records after the first page. Over-budget attempts fail explicitly.
- The manifest and each required image are checked by SHA-256/size before staging and activation. Missing/tampered bytes cannot activate. A checkpoint whose immutable manifest was written before acknowledgement/index failure can be recovered by its original operation identity.
- Staging writes a fresh inactive namespace. All originals, record IDs, exact rendition IDs and histories remain intact. Owner-salted bookmark keys are recomputed for the new namespace while preserving record identity, target revision and durable off state.
- Current Source/export/image restrictions narrow old snapshots. Root-scoped monotonic restriction floors apply across generations and at read time; older recovery cannot restore revoked access. Independent personal prose remains available. Legacy restrictions created before this mechanism are intersected from current records as well.
- Namespace mutation-version triggers cover all seven product tables. Activation atomically requires both the expected active generation and the version captured by its pre-activation checkpoint. A save arriving during the asynchronous backup window causes a conflict, leaving current work active.
- Active-generation changes fence old Web/API/MCP mutations and browser reads. The public token includes pointer revision, so rollback does not reuse an earlier client epoch. Existing legacy draft keys and omitted legacy command fields remain unchanged for exact receipt replay. Later generations get separate draft scopes.
- Root-scoped recovery operation receipts are readable/replayable after activation even with the old generation token, allowing a lost activation acknowledgement to be resolved. Ordinary operations do not gain that exception.
- Earlier local Note/annotation writing can be explicitly reviewed, selected or copied as read-only text. Selectors, imported quotations, permission fields and pending operation payloads are excluded; nothing is automatically re-targeted or resent. Old local keys remain untouched.

## Bounds and interaction limits

The supported checkpoint budget is 20,000 aggregate product rows, 8 MiB manifest JSON and 32 MiB image bytes across at most 64 images. These are aggregate bounds, not per-page claims. Restore uses bounded JSON bulk inserts rather than a request query per row. The recovery list is bounded and reports truncation. Resource/time limits may still reject a large attempt; rejection must not change active saved work or claim a complete checkpoint.

The UI distinguishes saved work from browser drafts. Before activation the owner must finish/cancel uploads and source admissions: a reload loses unsaved File objects, imported quotation fields and editor undo. Retained own writing remains separate for manual review. Portable export is a deliberate local download, not automatic sharing.

## Verification

Independent integration tests compile the shared handlers and use real Miniflare D1/R2, including a corpus beyond 300 records, histories, actual PNG bytes, active/off bookmarks, owner isolation, tampered manifest, missing staged bytes, current and legacy restrictions, stale generations, lost activation acknowledgement, interrupted manifest/index writes, and a forced ordinary save after the pre-activation manifest was written. Unit/SSR tests cover client generation scopes, immutable proposals, activation review and local own-writing privacy/budgets.

Actual cloud-browser synthetic checks cover discovery/opening, rejected unauthenticated access, keyboard focus/close, and narrow responsive layout. Synthetic fixtures never grant an owner identity or acknowledge a durable save. Successful authenticated hosted browser checkpoint/activation and physical-device recovery interaction remain unperformed. Hosted production generation activation is deliberately not used as a synthetic test on genuine work; any hosted checkpoint verification must leave current generation and real record revisions unchanged.

Final aggregate test/typecheck/build results, exact Worker route checks and installed-client evidence belong to the release receipt. Full document/audio/video uploads, independent downloadable/importable recovery and physical accessibility/teaching acceptance remain ongoing commission work.
