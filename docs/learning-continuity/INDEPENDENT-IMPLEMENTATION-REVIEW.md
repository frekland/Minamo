# PR19 independent implementation review

Date: 22 October 2026. Scope: the integrated implementation in this checkout against the eight approved learning-continuity documents and their T01–T13 shared scenarios. This is implementation review evidence, not a deployment receipt or a claim that every acceptance requirement was exercised on a physical device.

The implemented direction is coherent: one explicit learning-work authority serves Investigations and stable Journey stages; Notes remain independent writing; Home projects acknowledged work; catalogue metadata is separated from canonical readings; publication retains original source and exact reading identities. The useful distinction between learner-reported evidence, supplied artifacts, observations and interpretations is preserved. No extra inference service or parallel accepted-relationship database was introduced.

## Independent execution

The reviewer independently ran `tests/catalogue-command.test.mjs`, `tests/note-continuity.test.mjs` and `tests/learning-work.test.mjs`: **27/27 passed** in approximately 11 seconds. After corrections, the reviewer ran `tests/recovery-cutover-evidence.test.mjs`, `tests/manuscript-identity.test.mjs`, `tests/note-continuity.test.mjs` and `tests/learning-work.test.mjs`: **34/34 passed** in approximately 16.5 seconds. These runs overlap; they must not be added together as a count of distinct acceptance cases.

The corrected run includes actual isolated Worker/D1 checkpoint writes and atomic rollback, encrypted small and paged recovery, exact historical Note evidence redaction, direct non-first-stage work, stage relevance, correction invalidation, observed-evidence revision checks, and CodeMirror's native pending-image undo/redo. A separate bundled identity probe confirmed that a unique stage-heading rename preserves its section, part and stage IDs.

The review also independently reproduced the original cutover recovery defect using `validatePortableManifest` in Miniflare: a valid current Article with intentionally frozen historical concepts and an empty current sidecar was rejected as `bundle_schema`. That failure was corrected and the corresponding small and paged encrypted round trips subsequently passed. All probes used synthetic local disposable data; no genuine learner records were modified.

## Findings resolved during implementation

| Finding | Consequence | Correction and evidence |
| --- | --- | --- |
| Current import validation treated frozen legacy concepts as current references | A legitimate post-cutover Article could not restore from its own recovery file | `lib/recovery-bundle.ts` uses a cutover-aware validation projection without rewriting raw Article JSON; small and paged recovery regression tests passed |
| Recovery evidence filtering considered only current records and omitted Note revision dependencies | A newer clear Note could conceal the restricted Source basis of an older referenced revision | Exact historical Note evidence and `noteRefs` now participate in filtering; Development, revision and perspective recovery tests passed after Source revocation |
| Pending image widgets were outside native undo history | Undo before upload completion could still allow late insertion | Pending placement intent now participates in CodeMirror history; native undo/redo and cancelled-late-upload test passed |
| Formatting always wrapped text | Repeated bold/italic actions doubled delimiters | Active formatting detection and reversible changes added; toggling and nested-format regression tests passed |
| Explicit per-event stage relevance was stored but omitted from target reads | Stage work could disappear even though the exact stage was explicitly identified | Shared target projection includes exact per-event relevance without promoting broad Journey links; isolated D1 test passed |
| Relationship target revision was checked before, rather than inside, the mutation guard | A stale acceptance could silently use a newer target | Requested destination revision is passed into the atomic command guard; deterministic racing-target test passed |
| Observed evidence checked the current Run instead of the cited revision | A historical illustration could inherit a later observed label | Provenance now checks the exact retained Run revision; rejection regression passed |
| Multi-target checkpoint scope was initially absent | An explicitly requested two-target checkpoint could not be atomic | One bounded transaction and immutable receipt now cover explicit batches; forced later-target failure rolled back every event and receipt |
| Section identity depended only on heading text | A heading-only stage edit could orphan saved stage work | Unique exact-content carryover preserves section and stage identity; positive heading-rename test passed |
| Home correction and Favourites continuation fields differed between server and UI | Corrected entries lacked a label; larger favourite sets were inaccessible | Home now reads `supersededBy` and the independent Favourites cursor; final integrated UI verification remains the release owner's responsibility |

Additional bounded source checks confirmed metadata-only catalogue CAS leaves raw reading JSON and rendition unchanged, historical reads avoid current catalogue overlays, and ordinary source edits preserve stable reference destinations. The reviewer requested explicit catalogue/reading mismatch diagnostics rather than silently presenting a filtered historical catalogue as an exact edition; `exactCatalogueForReading` now supplies that diagnostic. Long batch event identities are bounded deterministic IDs rather than an overlength operation-ID suffix.

The reviewer also identified the legacy reverse-membership unlink case. `lib/relationship-command.ts` now reconciles the intended whole-record membership through the existing `RecordLink` authority, preserving contextual links. Final reverse-direction concurrency and integration test results must be included in the integrator's release evidence; they were being completed when this review file was written.

## Educational and workflow assessment

The saved-work model avoids turning every conversation, Note save or visit into progress. A direct Journey stage can own a checkpoint without manufacturing an Investigation. An Investigation remains a revisitable question. Native diagrams, exact reusable command entries and deliberate external-video activation support teaching without duplicating the Journey as the Library. Source-backed evidence links and corrections matter more than decorative progress indicators.

The review challenged successful ordinary edits as well as rejection cases: catalogue-only changes, source wording changes, stage insertion/reordering and heading-only edits all require useful success paths while old captures retain their original identity. The implementation contains targeted positive cases for these paths.

## Evidence limits and release follow-through

This independent review does **not** establish production deployment, source-tree synchronisation, installed-client discovery/invocation, genuine saved production-browser operation, physical Android/TalkBack behaviour, provider playback, or real-network autosave median/p95 latency. Those require the integrator's separate actual release evidence. Twenty synthetic read calls prove no writes in the exercised domain path; they are not twenty human conversational turns or a fresh installed-client session.

The corrected focused tests support integration, but do not replace the final full suite, build, source consistency, migration and permission gates. Any unavailable hosted/browser/device checks must remain explicitly labelled unavailable. Pending image bytes requiring reselection after reload are an honest limitation and must not be described as fully durable uploaded image recovery.

No further broad redesign is recommended. Finish the final source freeze and integrated checks, correct observed defects, and report the actual deployed and installed result with the remaining external evidence limits.

## Final live-found correction: Journey preamble

The integrator identified that rich text before the first authored H2 was being compiled into an extra Journey stage. The reviewer examined only the corrective diff in `lib/manuscript.ts`, `app/journey-route.tsx` and its tests. New Journeys now use authored H2 sections as stages, retaining rich introductory sections as canonical overview reading. Previously stored introductory stages retain their section/stage identities and existing checkpoint targets during targeted replacement. After identity carryover, the compiler explicitly assigns the actual preserved stage ID to each stage-specific relationship and removes a fabricated stage ID from new overview-only relationships.

The reviewer independently ran `manuscript-introduction`, `manuscript-independent-review`, `manuscript-identity` and `educational-reading-ui`: **14/14 passed** in approximately 4.7 seconds, including actual Worker/D1 publication, targeted replacement, preserved legacy introductory-stage checkpoint readback and retained-edition reading. No actionable defect was found in this corrective diff. This focused result is separate from, and overlaps with, the integrator's full-suite evidence.

## Installed-client finding: exact stage return destinations

The integrator's real installed-client acceptance found that `get_minamo_context` returned the correct exact `learningTarget` and saved learning work, but its reading/return links omitted the stage and opened the Journey overview. The reviewer independently confirmed the source defect and judged the narrow correction warranted under T04/LEARNMCP12.

The correction shares `stageReadingLink` between the client discussion brief and server context response. It adds stage navigation only to canonical links whose family and ID match the validated Journey target. Generic record links remain overview destinations; Source and other-record origins remain unchanged. Existing rendition, selection and UTF-16 coordinates are preserved, including an eligible retained stage that has since been removed from the current Journey.

The reviewer independently reran `tests/gpt-context.test.mjs` and `tests/learning-work.test.mjs`: **31/31 passed** in approximately 18.2 seconds. The run covers real local D1 HTTP/MCP no-selection second-stage returns, selected-passage coordinates, removed-stage historical returns, and matching-versus-unrelated link handling. No actionable defect was found in this corrective patch. Actual installed readback after its corrective deployment remains part of the integrator's release evidence.
