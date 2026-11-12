# PR19 Library and manuscript implementation evidence

Implementation branch scope: additive current catalogue metadata, retained canonical reading, one-call manuscript authoring and bounded Library browsing. This receipt describes local source and isolated Worker/D1 evidence. It does not certify installed client, hosted browser or physical Android acceptance.

## Authorities and compatibility

- `lib/catalogue.ts` stores separately revisioned catalogue heads/editions. Frozen raw legacy Article concepts and old reading hashes remain unchanged. Current DTO overlays are never authoritative write payloads. Pinned retained reads keep historical reading rather than inheriting today's catalogue.
- Migration 0008 idempotently backfills legacy current concepts without rewriting records/revisions. Exact case/punctuation terms are derived indexes, rebuilt after restore.
- Library areas/topics/references share `queryLibrary` through HTTP/MCP; eligible exact targets are filtered before returning previews. Subject membership uses existing accepted links, including deduped legacy incoming links.
- `lib/manuscript-identity.ts` carries unique exact section/part identity through insertion and reorder, preserving original Journey-stage IDs. An ordinary single changed part retains its unique position identity. A heading-only rename with uniquely identical section content preserves its section and Journey-stage IDs; ambiguous identical destinations reject. Repeated ambiguous destinations reject with `anchor_migration_required`; old captures always retain their old rendition.
- Targeted manuscript replacement preserves independent Area links omitted from source, while source-scoped inline links follow the newly supplied source. Catalogue reference omission preserves the current catalogue; deliberate supplied references replace only that authority.
- New Investigation manuscripts use `{version:2,kind:'investigation',question}`. Version 1 remains accepted historically. Editorial checks still reject fabricated learner findings and role/coverage mismatches.

## Atomic publication and envelope

`authoring-package.ts` uses one nonce-guarded D1 batch with set-based record, history and activity statements. `catalogue-batch.ts` adds constant-count catalogue CAS/head/revision/delete/index statements across all members. Original Markdown/full brief, reading, catalogue, links and immutable operation receipt commit together. R2 remains outside D1 atomicity.

`tests/manuscript-envelope.test.mjs` executed a **217,277-byte**, **16-Article** original request with catalogue references and aliases: **45 prepared statements**, maximum **9 bound parameters per statement**. This is local actual Worker/D1 evidence, not a claim about a hosted billing tier. Original input remains capped at 220 KB; already-validated generated manuscript packages have a separate 1 MiB internal compilation ceiling so compiler metadata does not shrink the advertised source envelope. Direct authoring packages retain their 220 KB cap.

## Executed isolated cases

- `tests/catalogue-core.test.mjs`: 10 passing cases, including 1,500 substantive topics, a 230-topic Area, keyset paging without omissions/duplicates, exact `-i` versus `-I`, rights-filtered targets, current removal without legacy resurrection, legacy SQL migration and restore index rebuild.
- `tests/manuscript-catalogue.test.mjs`: one complete Worker/MCP/D1 publication with two exact curl references, original source, independent Area link, ordinary paragraph insertion and retained prior reading. A trigger at the final index insert rolls back source/reading/catalogue/link/activity/receipt publication.
- `tests/manuscript-identity.test.mjs`: successful section reorder/paragraph insertion preserving non-first stage IDs and source maps; separate genuinely ambiguous heading rejection; natural catalogue author declarations compile without client-generated pointers.
- `tests/manuscript-stage-rename.test.mjs`: actual saved checkpoint on the second Journey stage, successful heading-only manuscript replacement, same stage/checkpoint lookup afterwards and unchanged retained old heading.
- `tests/domain-concepts.test.mjs`: all current concept, exact alias, stale revision, invalid destination, privacy and pagination cases pass with separate catalogue-as-of metadata and stable reading rendition.
- Existing manuscript publication tests continue to exercise owner/generation fences, exact historical captures, duplicate replay, changed-payload rejection, concurrent writers and source-store/member failure rollback.

## Exact legacy membership removal

`lib/relationship-command.ts` reconciles deliberate broad Article/Area membership removals in both stored directions, using the existing RecordLink authority. An Article-directed unlink also handles a legacy incoming-only Area link. Source and reverse-target revisions, generation and all remaining link-admission guards share one atomic operation receipt. Exact contextual references are retained and do not imply broad subject membership. Preview is read-only; uncertain replay returns the original compact edge-identity receipt.

`tests/relationship-unlink.test.mjs` executes reverse-only and bidirectional unlink, context preservation, lost-response replay, a reverse-target interleaving race, explicit stale expected target revision, mixed-edit rejection and a final-statement rollback. These are isolated real D1 tests; no genuine corpus was rewritten.

## User experience and review

`app/library-browser.tsx` provides one server-backed search with Subject areas / Topics / References facets. Area browsing uses real route navigation and a paginated topic list beneath the retained canonical Area reading. Technical reference cards preserve authored syntax and open the exact explanation. Preview-only local fixtures remain explicitly separate.

A source/render educational review checked Home's saved-work meaning, direct stage work, question-only Investigations and canonical reference reuse. It identified an in-app correction form that would replace richer facts/evidence with summary-only prose; the learning workstream was asked to correct that loss within this commission. Hosted/mobile interaction, physical Android, installed catalogue refresh and actual external-player availability remain release-integrator gates.

## Production acceptance correction: authored stage boundaries

V15 acceptance exposed a real compiler mismatch: an H1 preamble before two H2 headings created a third, unauthored Introduction stage. New manuscripts now derive stages from authored H2 sections when present; the rich preamble remains a canonical overview section, rendered in the Journey overview with its exact source mapping, formatting and code intact. No-H2 fallback behaviour remains compatible. Targeted republication preserves a previously stored Introduction stage and its stable ID/checkpoint history rather than silently removing it. No stored Journey is migrated.

`tests/manuscript-introduction.test.mjs` proves exactly two authored stages, retained rich preamble and stage-free overview links; it also simulates a legacy stored intro stage, checkpoints it, republishes a deliberate wording edit and verifies the exact checkpoint and prior reading survive. `tests/educational-reading-ui.test.mjs` checks rich overview rendering separately from stage-only reading. Combined introduction, heading rename, ordinary manuscript publication and educational-render suites passed **25/25**; TypeScript passed. This correction is source/localD1 evidence pending the integrator's corrective release.
