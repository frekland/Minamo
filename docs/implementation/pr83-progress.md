# PR83 integrated implementation progress

Owner commissioned full implementation/deployment on 3 November 2026. Baseline verified: production V100, native `a10709c9cfb7b0de819dc392de01ce29e576e1d4`, public PR83 `a45b73a39059fd2d0b3c314944f24be4a78426ba`. Existing custom audience revision 1 and DB/BUCKET/MCP/auth retained.

## Current checkpoint: integrated candidate, live verification pending

Implemented bounded section/block composition and native UI/MCP parity; stable mounted blocks across arrangement/visibility/editing; typed interactive content and actual MCP schemas; image flashcards; ordinary Note/R2-backed tldraw; finite Canvas over the existing opaque Pyodide/Worker runtime; native/Python parameter explorers and explicit captured observations; supported standalone Pygbag admission/isolation; arbitrary TEST roots, immutable exact membership, fictional dates, continuation/inventory, optional evidence over existing tables, and namespace-fenced preview-digest recoverable cleanup.

Shared changes were applied deliberately to both checkouts. Native-only families, exact-source context, recovery batching, hosting configuration, auth, bindings, package metadata and Vite integration were retained. No whole-tree replacement, migration, reset, deletion, existing Project changes or retained gallery seeding performed.

Local preview returned a running URL but Cloud Browser could not connect. The owner explicitly directed Cloud Browser verification **after deployment**, superseding that temporary early-probe blocker. Production Cloud Browser access subsequently succeeded, authenticated; no owner handoff was needed.

## Checks

- Native typecheck passed after integration.
- Native production builds passed; final publication helper is rebuilding the exact candidate before packaging.
- Focused D1/R2/MCP/recovery checks: **11 passed, 0 failed** across `pr80-projects`, `pr83-composition` and `pr83-interactive`.
- Coverage includes real tool authoring of all four artefact definitions, CAS/replay/protection/atomic rollback, metadata rendition preservation, nested image isolation/revocation, typed drawing/TEST portable recovery, Pygbag exact-profile admission/digest rejection, arbitrary TEST evidence/retention and stale/outside-reference cleanup refusal.
- No full suite or historic learner matrix run.

## Remaining release work

1. Capture final public/native source commits and exact archive; save/deploy candidate to the existing Site under its unchanged custom policy.
2. Create a **separate scoped technical TEST Project** through GPT/MCP; leave existing Projects/playgrounds intact. Verify actual cards, drawing licence/save/reload, Python/parameters/Stop and packaged runtime in Cloud Browser, with a narrow viewport check where supported. Retain technical material; no automatic production cleanup.
3. Verify refreshed native capabilities and host-visible MCP catalogue. If the personal plugin cache needs owner refresh, state that exact limitation.
4. Record deployment version, browser outcomes and practical limits. Merge PR83 when appropriate after the runtime checks.

## Practical limits

Python uses one active isolated Worker per page, 20-second termination, bounded stdout and up to 120 frames/600 Canvas commands. Browsers do not enforce a strict memory quota. Pygbag accepts only the documented standalone profile (up to 128 embedded files / 16 MiB), with no ZIP/directory loader, sound facility or arbitrary remote resources; external runtime/package paths remain versioned dependencies. Evidence remains optional and partial; it is not a host-complete recorder. Evidence tables are not automatically included in portable product recovery; selected evidence can be exported into ordinary synthetic Notes/documents. Cleanup is atomic per chunk up to 100 records, never a globally atomic purge or R2 deletion; any outside record reference conservatively retains the run.

Packaging instructions and source-inspected runtime details: `pr83-pygbag-packaging.md` and `pr83-pygbag-probe.md`. Actual execution must be verified live; source inspection alone is not evidence of a working runtime.

## Owner-requested pause

Work is parked. **Read [the exact pause/resume record](pr83-pause-20261103.md) before continuing.** V101 was deployed for live verification; a drawing store-reset bug was found and a candidate fix is committed but not live-verified. **The owner explicitly directed that V101 remain live; no rollback was performed.** PR83 is not complete and must remain draft/unmerged.

## V101 continuation (later on 3 November 2026)

Authenticated Cloud Browser verification has continued on the retained synthetic Project. Confirmed real Python Stop/restart, visual Canvas and parameter changes, three persisted observation Notes, direct UI arrangement persistence, MCP hide/pin/restore/stale-CAS protections, image-backed flashcards uploaded on both faces and rendering after reload, and exact TEST inventory/continuation/cleanup preview. The live V101 tldraw reset was reproduced. **The unpublished correction has not been deployed**, and Pygbag remains unverified. See [detailed continuation and exact next actions](pr83-v101-continuation-20261103.md). Current filesystem workspace is read-only; native build/deployment requires a writable code workspace. PR stays draft and V101 stays live.

## Owner continuation decision — 4 November 2026 (documentation only)

See [the binding V101 UX-polish addendum](pr83-v101-ux-polish-addendum-20261104.md), now linked at the top of PR #83 and AGENTS.md. The existing paused Work commission should **resume from live V101** and complete the unpublished tldraw correction, bounded Pygbag path and **seven selected learner-UX/MCP fixes in one run**, not commission a new design or PR. The specific additions are Expand/Focus, responsive Workbench/Board, compact image flashcards, scoped editing, default maths/diagram improvements, authenticated MCP image upload via existing storage, and Save-to-Project observations without Notes. Flashcard npm package selection remains conditional, following subsequent visual review.

During Work, prioritise changed-path tests, typecheck/build, native/public reconciliation, fast Sites deployment and essential publication verification; **defer extensive Cloud Browser interaction/visual acceptance to a separate follow-up chat**, recording it unverified. Keep PR #83 draft/unmerged until that acceptance and owner review. At this documentation update no code, Site deployment, database, TEST records, access configuration or user content was changed. Previous reports remain accurate historical state, subject to a fresh Sites/native check on resume.

## 4 November resumed implementation — prepublication checkpoint

Resumed from public `40562afcc446204708712dcdd46e6d6940eee141` and verified live/native V101 `eb1a1475390d788405405db405475ac989e6527c`, unchanged custom access revision 1. Writable public/native checkouts were reopened; no old transient workspace state was assumed.

Implemented the seven approved changes: in-place section/block Expand/Restore with Escape and stable keyed children; intermediate-width Workbench/Board layout; compact click/keyboard flashcards with private card-sized images; block-scoped editing plus separately disclosed arrangement and retained Project draft/CAS; automatic safe KaTeX with source fallback and diagram sizing/region borders; `upload_minamo_project_image` through existing raster staging; Project-local observations as adjacent ordinary callout + typed JSON code parts with no Note creation. Existing Save-to-Note remains. No new package or schema/table/ledger. Existing cover-derived catalogue thumbnails are reused.

The image MCP transport deliberately fits the existing 220 KB envelope: standard base64 up to 160,000 characters / 120,000 decoded bytes; signature/MIME/dimensions/owner/retry identity remain the existing asset checks. Larger files use existing authenticated browser upload (8 MiB); no remote URL fetching.

Project observation saves capture exact inputs, seed, timestamp and definition SHA-256, check current definition and Project CAS, append only beside that artefact, and replay a retry-stable receipt without duplication. Classification is browser-reported, never server-observed execution. A neighbouring dirty Project edit retains its original base revision instead of silently overwriting an observation.

Reconciled the saved drawing fix (memoized asset store, stable shape utilities, document-only SDK snapshots) into native. Live save/reload/conflict and graphical Pygbag execution remain explicitly deferred to the separate browser chat. Existing exact standalone-package admission/negative tests passed; the isolated loader/profile was not broadened.

Focused results before publication: 13 D1/R2/MCP/recovery tests passed, one React mount/state/scoped-draft test passed, four diagram/escaping/region tests passed; typecheck passed; production build passed before the final KaTeX stylesheet/region-border additions. Publication rebuilds the final exact source. No full suite, screenshots, learner matrix or comprehensive browser tour.

Approved content-only adjustment: `test-sudoku-20261103` revision 7 → 8, only `s-grid` / `sudoku-grid` now explicitly declares existing `regionRows:3, regionColumns:3` and matching canonical fallback. Operation `pr83-sudoku-region-boundaries-20261104`. Other parts/sections, retained technical fixture, Notes and histories are preserved; no cleanup/reset.

PR83 stays draft/unmerged. Final source/version/deployment receipt follows publication. This checkpoint does not claim visual acceptance or a proven live drawing/Pygbag fix.
