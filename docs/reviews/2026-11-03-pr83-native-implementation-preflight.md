# PR #83 — bounded native implementation preflight

3 November 2026. Read-only architecture review, except for this report. Review target: `frekland/Minamo`, draft #83, branch `design/v100-plus-flexible-projects-artifacts-test-runs-20261103`, inspected head `462e3f6e17495bc8a201f0dd98f016f2379fcc11`.

## Verdict

**Ready for one full implementation commission, with the concrete integration decisions below included in its working instructions.** The agreed capabilities are credible on V100. There is no demonstrated need for a new product hierarchy, generic executable UI platform, drawing backend, independent artefact revision ledger, or staggered deployment. This is substantial integration work, however, not four components that can simply be switched on.

Three matters deserve early implementation probes inside that commission: native tldraw loading/licence injection; the bounded Python Canvas protocol inside the existing opaque runtime boundary; and one explicitly supported packaged-Pygbag delivery profile. These are internal engineering checkpoints, not owner approval stages or separate releases. None was executed in this documentation-only review. A failing isolation, persistence, native-build or supported-package probe would be a genuine release blocker.

The most consequential code findings are:

1. Existing Project CAS, receipts, history, direct-edit protection and Project-plus-Note transactions are reusable. Arrangement extensions must participate in their existing protection semantics, not bypass them.
2. Artefact definitions fit canonical Project content. Editable drawing snapshots fit a dedicated ordinary Note plus immutable existing R2/media attachments. Do not put drawing changes into Project revisions on every pen stroke.
3. Nested images/assets need explicit admission, attachment, rights projection and recovery changes. Current guards recognise specific `image`/`media` parts, not arbitrary objects containing an asset ID.
4. There is already an opaque-iframe-plus-Worker Python implementation. Reuse it; do not replace it with a same-origin Worker. Scientific Foundry assets are explicitly excluded from an ordinary release. Python presence in package.json is not Canvas support.
5. Current transcript/observer services are genuinely fixture/epoch/session dependent. Arbitrary TEST histories need a small independent membership contract and an ad-hoc adapter to the evidence mechanisms, not more fixture registrations.
6. An already-packaged Pygbag app can still fetch its Python/WASM runtime externally. Define the accepted delivery profile and prove its loader under isolation before claiming support for supplied packages.

## 1. Verified baseline and limits of this review

### Source, deployment and configuration

| Item | Observed result |
| --- | --- |
| Public main/base of #83 | `242245238321f03ff9787c87408cd82dfcf7ac7d` |
| PR #83 | Open, draft; seven commits and three changed files before this report; head above. Its changes are guidance/product documentation, not renderer implementation. |
| Site | Minamo, `appgprj_6ad8a4e85eb48191accd6e78976b47e3`, [production](https://minamo.jscymru.chatgpt.site) |
| Saved/deployed version | **V100**, saved version `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_04b6247e2d3c8191b06d7e403e787703` |
| Native source | `a10709c9cfb7b0de819dc392de01ce29e576e1d4`; protected native Git checkout HEAD independently matches the saved V100 source |
| Deployment | `appgdep_6ae9503af8e8819184c1c5d01cd2e4ca`, native status **succeeded**, MCP enabled |
| Access | Existing custom audience, policy revision **1**; owner plus one invited external viewer. No identity details are reproduced here. |
| Hosting | Native `.openai/hosting.json`: existing project ID, D1 `DB`, R2 `BUCKET`, capability `mcp`; retained Vinext/Sites/Cloudflare build integration |
| Runtime configuration | Current environment revision **10**; beta admission, Activity Studio, Atlas and historical scenario control flags enabled; host configured as `minamo.jscymru.chatgpt.site`. Historical scenario source pin is a fixture pin, not the deployed app SHA. |
| tldraw key | `TLDRAW_LICENSE_KEY` is listed as a secret, value redacted. This verifies configuration metadata, not its contents, hostname entitlement, expiry or successful client validation. Deployment receipt records environment revision 9; the subsequently listed revision 10 must not be described as a licence test performed by the V100 build. |

Inspected the PR-branch AGENTS.md, complete V100+ product blueprint, baseline/cleanup audit, PR80 composition brief/implementation blueprint/progress and V100 release receipt, and fast Sites workflow. The corrected PR83 AGENTS.md and V100 receipt control. The older PR80 documents and the workflow's residual “current native caution” still mention V91/V98: those are stale historical instructions, **not** a reason to restore V91 or redeploy V98. Record this precedence in implementation instructions; no blueprint/workflow edits were made here.

### Public and native code are different

Focused byte comparisons found the same `lib/project-service.ts`, `app/project-sections.tsx`, its CSS, `lib/assets.ts`, `lib/media.ts`, `lib/test-observation.ts`, `lib/test-transcript.ts`, `lib/scenario-control.ts` and `worker/index.ts` in the inspected sources. `pnpm-lock.yaml` is also identical. Dependency and devDependency maps match; package identity/licence metadata differ.

Differences exist in `lib/project-composition.ts`, `lib/contracts.ts`, `lib/domain.ts`, `lib/domain-handler.ts`, `app/reader.tsx`, `lib/recovery.ts`, `lib/recovery-bundle.ts` and `vite.config.ts`. In particular, native retains the `work` family/metadata, additional exact selected-source context support, `clearNoteAnchor`, and recovery validation for native learning corrections. Native imports its protected hosting manifest directly; public has an example-manifest fallback. These are concrete reasons to port focused patches, not replace whole native modules. Retained native semantics do not authorise reviving the rejected Work/Study UI.

Declared and locked dependencies in both sources include React/React DOM **19.2.6**, tldraw **5.5.2**, Pyodide **0.28.3**, Next **16.3.8**, Vinext **1.0.0-beta.5**, Vite **8.0.13**, Wrangler **4.92.0**, CodeMirror, three and Recharts. The tldraw lock entry accepts React/React DOM `^18.2.0 || ^19.2.1` and Node `>=22.12.0`; the app requires Node `>=22.13.0`. No declared peer-version blocker was found. This is lock/source verification, not a fresh installation/build or executed SDK compatibility test.

### Evidence actually obtained

The refreshed Minamo plugin exposes the existing Project tools. A read-only `get_layout_capabilities` call succeeded and returned generation `legacy@0`, all six patterns, the 64 KB layout/220 KB update budgets and authenticated image-upload transport. An initial call without a purpose was rejected; the corrected purpose-bearing read succeeded. No Project/Note mutation or test-controller action was performed.

This review did not install packages, run a production build, execute Python/Pygbag/tldraw, inspect licence bytes, change production data, or perform a fresh browser interaction. Existing V100 browser evidence is supporting historical evidence, not a new mobile or renderer test. Native source and deployment provenance were inspected directly. The focused verification in section 9 remains implementation work.

## 2. Existing capabilities and reuse

| Existing code | Reuse and exact limitation |
| --- | --- |
| `lib/project-composition.ts`: `compositionSchema`, `validateComposition`, `adaptedComposition`, `protectedSnapshot`, `layoutCapabilities` | Flat six-pattern layout, exact references, one placement per block, hidden blocks, layout locks, deterministic legacy adaptation. Current layout sections/blocks have no explicit collapse/highlight/width fields. Slot roles are enums; pattern-specific compatibility is not yet a complete placement policy. |
| `lib/project-service.ts`: `projectCommand`, `applyProjectUpdate`, `applyProjectBatch`, `getProjectComposition` | Semantic create/update and optional preview; stable operation digest before adaptation, existing Project revision CAS; recent 12 revisions and exact historical reads; atomic Project plus up to eight Notes. `noteChanges` currently accepts only title/body/revision, not drawing attachments. Project update currently does not admit synthetic/test-run metadata. |
| `lib/domain.ts`: `validateData`, `prepared`, `executeCommand`, `renditionFor`, projected reads | Shared principal/rights/generation/record write path, revisions, receipt replay, source guards, asset attachment and protection. Strict part kinds/allowed keys reject new renderer data until deliberately extended. |
| `app/project-sections.tsx` and CSS | Existing Edit/Save/Cancel, recovered local draft and operation, Add section, inline text/code/table/image editing, reference rendering and six responsive patterns. Existing `arrange()` omits hidden blocks in both view and edit; a reveal interface must be added. Reader contents are currently suppressed by CSS. |
| `app/reader.tsx`, `lib/contracts.ts` | Rich reading, canonical UTF-16 text/selection, exact editions, image/media fallback and inline references. Interactive controls must not be mistaken for canonical selected text. |
| `lib/assets.ts`, `lib/media.ts`, client/handler/format modules | Owner-scoped immutable R2 upload, staging, atomic attachment, revocation, retained eligibility, private reads. Current formats are raster images, limited audio/video and PDF/plain text/Markdown; there is no packaged app or typed snapshot admission. |
| `lib/tool-runtime.ts`, `public/tools/python-isolate.*`, `lib/foundry/python-runtime.ts`, `vendor/foundry-python-isolate.js` | Existing opaque iframe, offline bytes, Worker, explicit execution/cancel/timeout, source-window/token checks and bounded results. Foundry adds scientific tables/PNG capture, not an animation Canvas protocol. |
| `lib/python-output-save.ts`, `lib/foundry/python-results.ts`, `lib/typed-outputs.ts` | Captured code digest, bounded browser-reported output, image staging and truthful save preparation. Reuse for deliberately saved observations; do not label server-observed execution. |
| `tests/pr80-projects.test.mjs`, `tests/private-storage-fixture.mjs` | Five existing targeted D1 cases cover real MCP loop, CAS/retry/mismatch, owner denial, direct-edit protection/override, atomic late failure, Note pins and portable recovery. Extend these fixtures rather than launch the historical corpus. |
| `lib/test-transcript.ts`, `lib/test-observation.ts`, `db/schema.ts` | Append-only model transcript segments, metadata-only received-call observer, bounded canonical before/after projections, idempotent writes. Their current public APIs require registered fixtures/epochs/phases/sessions. |
| `lib/recovery.ts`, `lib/recovery-bundle.ts` | Existing record/revision/media recovery and watermark-fenced paged capture. Strict import keys/formats and rights filtering must learn the new fields and asset references. TEST observer/transcript tables are not included in the existing full-product recovery table list. |

No active Project integration of the four new renderers was found. Existing diagram exploration, Python Tools and Foundry prototypes are donors, not evidence that PR83 is already implemented.

## 3. Composition and direct/GPT parity

### Minimal durable additions

Keep optional additive fields on the existing composition version: section `hidden?`, `collapsed?`; block `pinned?` and bounded `width?: 'full'|'split'|'compact'`. Existing `hidden`, `layoutLock`, section order and slot block order remain authoritative. Defaults reproduce V100. Width is responsive presentation, never coordinates; unsupported pattern/destination combinations fail with valid choices.

Use **Project-local persisted favourites** for this commission: an optional bounded list of section/block IDs in composition, available to both learner controls and MCP. This is the smallest way to meet durable GPT parity without inventing an account-wide preference service. The blueprint explicitly leaves cross-device personal preference policy open. Label these as this Project's shortcuts. Temporary accordion toggles/scroll remain owner/workspace/Project-scoped local view state; an explicit “save collapsed by default” changes the canonical field. No automatic server write on reading or scrolling.

Extend `changes` with only missing operations: section rename/reorder/visibility/default-collapse, block emphasis/width and favourite toggle. Keep `moveBlock`, `setBlockVisibility`, `upsertSection` and `upsertBlock`. A full valid composition can already express most changes, but small semantic operations avoid sending a stale whole layout. New operations must be exposed through the same `updateSchema`/generated MCP schema as the UI, not implemented as React-only state.

Pin means prominent display, not immovability: render the same keyed block at its highlight position, without duplicating it or moving its canonical source. Favourite means shortcut; `layoutLock` remains the separate explicit protection mechanism; Note-page pins remain unchanged. Document deterministic order for multiple pins and hidden+pinned blocks (hidden wins in reading; Arrange can reveal). A shortcut to a hidden block must explain/reveal it, not appear broken.

### UI reuse and hazards

Add one compact Contents/Arrange disclosure inside `ProjectSections`, with anchored section jumps and a small current-location indicator. Mobile uses a disclosure, not a permanent sidebar. Arrange mode shows hidden items and per-item context actions; keyboard Move up/down and destination selection precede optional drag support. Reuse current design tokens and existing Reader anchors/Project navigation; ensure container anchors do not collide with content section IDs or retained Stage links.

V100's `protectedSnapshot` compares content and placement for protected blocks. Direct UI changes currently add protections, and the existing layout-lock implementation compares a broad snapshot. Add new presentation fields to the comparison deliberately. Otherwise a harmless collapse/favourite can accidentally protect an entire content block, or an arrangement change can escape a position lock. Preserve title/description/body protections and existing protected IDs. For each semantic operation define what it changes and what protection it must respect; do not simply exempt all new metadata from protection.

The current editor saves a retained whole draft against `record.rev`, and `ProjectCover` can independently advance that revision. New arrangement/board saves must not advance the editor's base revision while leaving a stale whole draft eligible to overwrite newer content. Prefer bounded operation payloads against the draft's actual base revision. On conflict retain the draft, read current state and reapply only intended changes; never silently replace it. A readback failure after a receipt remains uncertain/readback failure, not a second new save.

Metadata-only changes continue to advance Project record revision without changing reading rendition. Moving a block keeps its canonical section/part IDs, source rendition, Note identity, unsaved draft and active renderer instance. Key renderer instances by stable Project/block/part identity, not array position, width or Project revision.

## 4. Shared artefact and persistence contract

### One whitelist, one authoring path

Recommend one new strict **Project content part** kind, `interactive`, whose `interactive` payload is a discriminated union of `flashcards`, `drawing`, `python-canvas`, `parameter-explorer`, plus the bounded `pygbag` package adapter. This is a proposed code contract, not an existing API. Do not put large renderer definitions in the 64 KB composition manifest.

Each part has existing stable `id` and canonical `text` fallback, a payload `version: 1`, renderer-specific validated definition, and optional exact references to existing saved Notes/assets. Keep the fallback intelligible for search, quotation, exports and inaccessible runtimes. Put configuration in canonical sections so meaningful definition changes follow existing content rendition/history; layout fields remain composition-only. Leave existing passage hashing unchanged for records without interactive parts. Pure live state never rewrites canonical text.

GPT flow for **each** renderer: read capabilities/current Project → submit bounded `contentSections` or content patch plus existing placement operations → shared validation/asset admission → one Project CAS/receipt → native renderer. Updates preserve part/block IDs. GPT can change a deck, Python source, parameter defaults, drawing definition/state reference or packaged-app reference and move it through the same tool. It need not manufacture a raw tldraw snapshot to create an empty board. The native direct editor must edit the same supported fields. Update capability metadata, read projections and host tool schema together; no separate artefact authoring server or dynamic component import by name.

Use explicit numeric/card/source/message limits and actual UTF-8 byte accounting. Existing effective limits include 30 canonical content sections, 40 parts/section, 20,000 characters/part text, 100,000 aggregate part text, 32 composition sections, 128 composition blocks, 64 KB layout and 220 KB update. `contentSections`' Zod max of 64 is not permission to exceed the domain's 30. Publish the effective limits, reject oversized updates atomically and paginate histories. Do not inflate all global budgets to make drawings fit.

### Saved learner output uses existing records/assets

Use a **dedicated ordinary Note per editable board**, with a normal document/media part referencing its immutable JSON snapshot attachment and a concise human-readable description. The drawing definition references that Note by exact ID; the saved editable document is resolved from that Note's current eligible revision. Historical Project reads must describe that distinction honestly; an exact historical drawing restore selects an exact Note revision, not merely an older Project layout. No per-artefact head/revision table.

Extend existing document asset admission with a typed drawing-snapshot JSON format; reuse `v2_media`, attachment tables and R2 immutable bytes. Validate bounded document/schema/assets before activation. Save snapshot bytes under a retry-stable upload identity, then CAS the dedicated Note's attachment reference through normal commands. A conflict cannot attach the new asset or replace an unseen newer drawing. Failed staging can remain an uncommitted staged upload; do not promise atomic D1+R2 transactions. Only the acknowledged Note CAS makes it canonical. Use existing history/retained attachment eligibility for earlier snapshots.

Expand the bounded `noteChanges` variant to permit these typed Note sections and preserve their existing prose/pins, when initial Project+state-Note creation genuinely needs one transaction. Board edits thereafter save the Note only. Never route every pen stroke through Project CAS or the prose Notes dock. Use explicit Save with dirty/saved/error state, retained local recovery draft, flush/retry of the same captured save and deliberate conflict resolution. This is enough for persistence without a live collaboration protocol.

Flashcard flips/shuffle and unsaved parameter changes remain ephemeral. Saving a parameter/Python observation creates or updates an explicitly selected ordinary Note/Run with input values, seed, exact definition/code identity, actual browser execution time and truthful output classification. `preparePythonOutputSave` is useful for PNG/table/Run output. Do not force observations into a new assessment family or save success on a mere variable change.

### Asset and recovery closure is mandatory

Current `imageAttachmentStatements`, image eligibility SQL and media equivalents traverse `sections[].parts[]` of particular kinds (plus Project cover). Flashcard faces and drawing assets nested under `interactive` would otherwise be missed. Add a shared, bounded typed asset-reference extractor and use its equivalent consistently in preparation, atomic D1 guards/attachment, projected current/retained reads, revocation, cleanup and export/import. Retained-reference SQL must recognise the new shapes; a JavaScript collector alone does not fix SQL eligibility.

For drawing images, the snapshot attachment Note must also carry normal admitted image parts/inventory for the SDK assets it uses. Do not rely on opaque JSON being searched for arbitrary URLs. Sanitize snapshot asset sources to internal asset identities; resolve current permitted image bytes via the parent's existing authenticated pipeline. Blob URLs/base64 are temporary presentation, never the sole persisted image. Denied/revoked assets stay unavailable across current and historical snapshots, even when a JSON file contains a stale URL. Do not publish private object keys.

Extend `validateRichPart`/normalisation, `projectRecord` image/media projections, canonical fallback/export, patch schemas and recovery import validation together. Recovery currently whitelists fields, MIME types and redaction sentinels: unknown interactive fields will fail or be mishandled until these paths change. A focused mixed old/new recovery round trip is required; no mass migration of existing Notes or old rendition recalculation is needed.

## 5. Four renderers: concrete runtime decisions

### 5.1 Image-backed flashcards

Native React; stable card IDs, front/back text and optional admitted raster image on either face with alt/caption/source reference. Use the existing private image component/transport and nested asset admission above. Direct editing changes a bounded card definition, not a separate deck database. GPT updates the same definition. Provide reveal, previous/next, shuffle/reset and keyboard/touch controls; maintain focus and announce position/reveal without exposing the answer as the currently visible face. Reduced-motion preference removes 3D animation, not flipping capability. No scores/mastery or implicit writes. Image failure preserves text and alt/source fallback.

### 5.2 Persistent tldraw SDK board

Lazy-load a browser-only tldraw component and `tldraw/tldraw.css` in a bounded container. Server code reads `env.TLDRAW_LICENSE_KEY` through the existing Cloudflare request environment and supplies **only** that intentionally public SDK key to the client `licenseKey` prop. Extend `cloudflare-env.d.ts`; do not serialize `env`, use a `NEXT_PUBLIC` build substitution, or commit/log the key. A targeted authenticated runtime-config endpoint is an alternative if prop plumbing is awkward; not a new secret service.

Use standard SDK tools/shapes, undo/redo, zoom and export. Official APIs provide `getSnapshot`/`loadSnapshot`; persist document data, keep camera/selection/session state local. Validate snapshot schema/migrations with the pinned SDK and explicit count/byte limits. A load replaces the document: do not load a new server snapshot over dirty local work on every Project refresh. Keep save operation/Note revision fixed until acknowledged. A Project rearrangement must not reset the store.

Use the standard `TLAssetStore` upload/resolve seam with Minamo's raster pipeline. Provide supported image insertion, not SDK-default data URLs that disappear across devices. Bound pasted files; disable unsupported video/remote embed/unfurl ingestion rather than creating new backends or allowing authenticated network fetches from arbitrary pasted URLs. Standard drawing tools remain available; no custom tools/shapes, sync package or multiplayer service is needed.

The configured hobby licence is owner-reported to cover the production hostname. Verify live HTTPS host operation beyond the initial render, visible “made with tldraw” watermark and successful save/reload. Local development success is insufficient. Current official docs also describe hobby/trial analytics containing SDK/licence/page-URL metadata; avoid private learner text/IDs in page URLs and verify pinned-version behaviour rather than claiming no network traffic. This observation does not call for changing the licence or sharing policy.

### 5.3 Pyodide/Python-to-Canvas

Reuse the opaque runtime pattern already present in `lib/tool-runtime.ts` and `lib/foundry/python-runtime.ts`: authenticated parent loads fixed, verified runtime assets; sandboxed iframe has `allow-scripts` **without** `allow-same-origin`; code runs in a terminable Worker created inside that frame. The child receives code, numeric inputs, seed and approved bytes, never owner identity/session headers, generation tokens, connectors or a persistence callback.

Start with core Pyodide 0.28.3 and a small native-owned Python drawing module emitting a finite protocol: clear, line, circle/rectangle/text and a bounded frame batch. Validate finite coordinates, colour/text lengths, dimensions, command count, frame rate and message bytes in the parent before drawing onto its Canvas. This meets visualisation/animation without a desktop GUI compatibility claim. A trusted controller owns messages and execution; Python source is untrusted data even when GPT authored it. Do not interpolate source into executable JavaScript.

Use main-thread Canvas2D consumption first; OffscreenCanvas is an optimisation, not a compatibility dependency. A parent watchdog and Worker termination implement Stop/timeout/reset without requiring SharedArrayBuffer or app-wide COOP/COEP. Continuous animations should yield frames under a bounded run budget, retain controls and permit explicit rerun. Restart clears the isolated runtime/state reproducibly with the captured seed. Limit stdout/errors as existing runtimes do; drop stale messages after stop/restart or definition change. One active Python runtime per page initially avoids multiplying WASM memory across a long Project; every artefact remains available to run.

Important packaging fact: `scripts/prepare-tool-assets.mjs` already stages core Pyodide. `scripts/foundry-package-policy.mjs` removes the Foundry science controller/asset output unless explicitly opted in, while `loadScienceAssets()` expects it. Do **not** wire Project Canvas to that optional scientific loader and discover missing files in production. Reuse core assets and trusted isolation code, adding only the Canvas module/controller. If a required visualisation actually needs NumPy/other approved packages, deliberately include the pinned subset and hashes in packaging; do not enable/download the entire science stack by default. Loading, checksum, package and CSP failures remain visible with fallback text and no false successful run.

The existing fetch replacement is defence in depth, not isolation by itself. Preserve child CSP denying app-origin/network/frame/form access, no opener/top-navigation/popups/download permissions, no credential-bearing URLs and no generic parent fetch bridge. Validate `event.source`, one-use run identity, message kind/schema and bounds; an opaque child's origin is `null`, so an origin-string check alone is inadequate. A browser cannot promise a strict process memory quota for arbitrary Python: apply admission/output/canvas/concurrency limits and termination; record this practical limit without inventing a remote sandbox service.

### 5.4 Reusable parameter explorer

One typed controls model: stable parameter ID, label/unit, slider/toggle/select, finite min/max/step/default, plus bounded outputs. No JavaScript expressions, function names to dynamically import, arbitrary callbacks or eval. Native-owned graph/visualisation evaluators are a finite renderer union; reuse existing React/Canvas/chart primitives.

For Python-coupled exploration prefer a `parameter-explorer` definition whose target is `python-canvas` with the same controls/seed contract, within **one** interactive part. This avoids mandatory cross-block links or an executable graph platform while delivering coupled controls. A native preview updates immediately; Python inputs are debounced/coalesced, each result tagged with captured input/definition identity. While an explicit run session is active, changing a control can rerun that session under its limits; merely opening a Project never executes Python. Latest requested result wins, cancellation works, and a saved observation identifies the actual completed input, not the newest slider position. Reset restores authored defaults/seed. Keep numeric controls usable on narrow screens.

## 6. Already-packaged pygame-ce/Pygbag admission

This is the least specified runtime boundary in the blueprint. Pygbag is a separate WASM/Python delivery system, not a Pyodide package. Official upstream exposes `--html` embedded-assets output and `--archive` web ZIP output, and explicitly notes that Python runtimes can remain online. A ZIP upload or iframe tag alone does not establish working or isolated support.

**Bounded correction recommended:** define one supported browser-package profile in this commission, rather than imply every existing Pygbag template/CDN/relative-file arrangement works. Start with owner-supplied standalone `--html` output, its declared pinned runtime dependencies and a documented size budget. Admit/reference and retain the exact original immutable asset; execute only after explicit Run in an opaque frame with controlled dependency loading. This is package *admission/display*, not compilation, source editing or repackaging Python. Do not silently reduce support to a non-running download/link.

Extend the existing document/media pipeline with a typed packaged-app asset format. Keep original HTML as a download-only attachment; never serve it as executable app-origin HTML. The parent reads admitted bytes and supplies a native-owned isolated loader. Enforce CSP before package scripts, strip/reject conflicting bases/unsupported capabilities, pass no Minamo credentials, and permit only the declared runtime resources. Prefer preloaded immutable runtime bytes/blob mapping where the supplied template supports it. If the package needs CDN fetch, require a pinned compatible runtime origin with CORS/credential-free loading and narrowly scoped CSP; never allow Minamo API origins or a generic URL bridge. `sandbox` alone does not prevent network requests.

An opaque iframe cannot simply fetch protected relative `/api/media/...` files as if it shared the parent's session; a bare blob URL also does not preserve a directory's relative-resource resolution. Therefore reject unsupported directory/ZIP profiles with actionable packaging requirements unless an actual bounded resource-map adapter is implemented and verified. Do not promise arbitrary ZIP extraction/service-worker hosting as “free” reuse. A separate credential-free origin may be warranted for a future general directory host, but is not a prerequisite to the standalone profile and must not be silently commissioned here.

The Project part stores admitted package identity/digest, entry/profile/version, authored description, required runtime identity and fallback. GPT positions/revises that reference via the normal Project update; binary bytes use authenticated upload, not invented MCP file transport. Show load progress, focus/escape, Restart, Stop and timeout/failure. Stop removes the runtime frame. Browser audio/fullscreen/pointer capabilities require deliberate user activation; no automatic start, privileged parent messaging, arbitrary persistence bridge or claim of saved in-game progress. External learner observations use ordinary Notes.

No owner-supplied package was available/loaded in this preflight. The implementation must prove the chosen delivery profile with minimal prepackaged technical material, not commission a demonstration game. If the chosen Pygbag template cannot run with the stated security/delivery constraints, that is a runtime blocker to fix or report explicitly before the integrated release; it must not be disguised by relaxing same-origin isolation.

## 7. Arbitrary owner-directed TEST histories

### Small canonical run model

Use a synthetic ordinary Project as the run root, with a small validated `testRun` descriptor: version, run ID, owner's natural-language scenario, fictional date range/stop instruction and selected evidence depth. Add an immutable `testRunId` membership marker to **newly created** synthetic records, including root, generated Notes/marks/sources, state Notes and observations. Add optional separately labelled fictional event metadata; never let GPT overwrite `createdAt`, `updatedAt`, real receipt timestamps or observed execution dates.

Server validates membership and root ownership at creation, and writes it in the same canonical transaction. It must not be an arbitrary manifest array that can claim pre-existing genuine or unrelated records. Existing external originals can be referenced without acquiring run ownership. Inventory is a paginated server query over exact membership and owner/generation, including opaque/hash-derived Flag IDs; title/prefix matching is never cleanup authority. An ID prefix is a useful diagnostic, not proof of membership.

Current `applyProjectUpdate` lacks synthetic/run metadata, and `noteChanges` creates Notes without a TEST inheritance contract. Extend those typed paths explicitly; otherwise a synthetic-looking Project title can still create genuine-classified records. Propagate membership only for explicit TEST creation or UI content intentionally created inside that run, not to unrelated Notes merely open in the dock. Preserve immutable synthetic classification. Ordinary direct editing, continuation and extension then work without resetting a run.

“Arbitrary” means arbitrary topic/history and requested stopping point, not unbounded single payloads. Generate large histories through multiple existing bounded writes with receipts and paginated inventory. The stop point is authored content, not a controller state. Run retention has no TTL or end-of-test cleanup. Current/old runs remain readable by exact selection and explicit TEST discovery; do not reclassify retained TEST records as genuine to make them visible.

### Reuse evidence mechanisms without fixture lifecycle

Keep current historical fixture controller/registry and reports intact. Add a separate ad-hoc mode, admitted by the canonical run root and exact membership. Extract reusable append/dedup/read-page/observed-call/diff code from `test-transcript.ts` and `test-observation.ts`; do not call `load`, register a persona, advance a phase, or reuse an active fixture as an arbitrary run.

Existing evidence tables can be reused with an unambiguous ad-hoc scenario namespace per run. Where non-null legacy epoch/session/phase columns require compatibility values, use internal constant sentinels confined to that adapter; they must not acquire transitions, incrementing epochs or user-facing lifecycle meaning. Existing fixture uniqueness constraints remain respected and legacy reads keep working. This avoids new evidence tables solely for renamed columns. A small typed `manage_minamo_test_run` tool can expose start/list/inventory/continue/preview-cleanup/cleanup, while existing transcript/observer tools accept an exact ad-hoc run selector. Normal content still uses normal creation tools.

Observer eligibility must inspect admitted run membership/current synthetic targets, including Project writes, Note batches, source/asset operations and opaque Flags. An `includeSynthetic` discovery can be attributed only when unambiguous and explicitly scoped; do not log an entire discovery payload or infer membership from the purpose/operation-ID string. Retain metadata-only calls/error/timing, no prompt bodies or private learner telemetry. State capture projects exact member IDs/revisions/renditions, relevant saved state/assets and receipt identities, with a namespace watermark before/after capture. It attests persisted differences, not causation or external execution.

Current observer limits are 600 calls, 80 snapshots and **256 combined state entries**; transcript limits are 512 events, 16 KiB per entry and 4 MiB/run. Preserve bounded transport and honest truncation, but do not silently treat 256 entries as an arbitrary-history volume limit. Page inventories/snapshot data under a verified watermark or return an explicit capacity error before claiming complete coverage. Extract the existing paged/watermark capture pattern rather than accumulate an unlimited in-memory diff. Evidence depth is optional: canonical readback only, browser, or transcript+observer+state diff. GPT transcript remains model-submitted; observer remains best effort/server-received; neither is a complete host recorder.

Run Projects/Notes/assets participate in normal recovery. Current observer/transcript tables are outside the product recovery list: do not promise those logs survive a portable restore automatically. When deep evidence is requested and must travel with the run, save bounded evidence exports as existing synthetic Note/document attachments. This preserves the evidence without adding a second test archival service or expanding every recovery checkpoint into historical fixture logs.

### Exact cleanup, only on explicit owner instruction

Preview returns the exact current run-owned records/revisions and assets, excluded/externally referenced items, counts, generation and a digest of the complete scoped inventory. Preview has no side effects. Cleanup requires the explicitly authorised preview digest and current membership/revision checks; concurrent extensions/edits or new outside references invalidate the plan. Scan genuine outside references, composition refs, Note pins and asset attachments, not just direct record links. Fence the validated namespace watermark/membership and outside-reference conditions in the same D1 mutation transaction; a read-then-trash check alone leaves a race. Recheck per chunk for a larger plan.

Use recoverable ordinary trash commands and existing revision/receipt machinery; do not delete receipts, historical revisions or shared original sources. Prefer a bounded atomic cleanup batch when small; for larger cleanup use explicit deterministic chunks and per-chunk receipts, honestly reporting partial completion, never claiming a global atomic delete. Preview must state that execution shape. Do not route through workspace-wide empty-trash, seed/reset, generation activation or prefix SQL deletion. Retain assets needed by surviving genuine work; no automatic R2 purge. Test all destructive behaviour on disposable synthetic records only.

## 8. File/module change map and minimal schema/MCP changes

Existing paths below were inspected; suggested new filenames are proposals, not files already present.

| Change area | Files/modules and bounded responsibility |
| --- | --- |
| Composition | `lib/project-composition.ts`: additive fields/limits/placement validation/protection projections/capabilities. `lib/project-service.ts`: missing semantic ops, TEST metadata and typed attachment-bearing Note batch support. |
| Shared content | `lib/contracts.ts`, `lib/domain.ts`: interactive part union, canonical fallback, direct-edit protection, run membership, asset collectors, rights-projected read and atomic attachment. Add a small `lib/project-interactive.ts` for strict union schemas; no arbitrary `any` renderer config. |
| MCP/HTTP | `lib/domain-handler.ts`, `lib/domain-routes.ts`: same schemas for web and tools, refined part schemas, capabilities and optional ad-hoc run tool; preserve purpose/generation/principal checks. Do not fork a second mutation pipeline. |
| Project UI | `app/project-sections.tsx`, `app/project-sections.css`, existing `app/project-navigation.ts`: outline/Arrange/hidden reveal, stable keyed blocks, bounded edits and conflict retention. Add `app/project-interactive.tsx` and small lazily loaded renderer components as needed. |
| Reader | `app/reader.tsx` and relevant selection helpers: interactive host with canonical fallback, source anchors, selection exclusion for controls; preserve native exact-selection differences. No Library redesign. |
| Drawing | Proposed `app/project-drawing.tsx` and small snapshot validator/asset adapter; standard SDK and Note CAS. `app/page.tsx` or targeted authenticated config handler, `cloudflare-env.d.ts`: runtime key prop only. |
| Assets | `lib/assets.ts`, `lib/media.ts`, `lib/media-formats.ts`, corresponding handlers/clients and `lib/asset-deletions.ts`: typed snapshot/package admission, nested reference eligibility/retention and safe download. Reuse existing tables/R2. |
| Python | `lib/tool-runtime.ts`, `lib/foundry/python-runtime.ts`, `public/tools/python-isolate.js`/HTML and/or a new trusted Canvas controller: factor isolation/lifecycle, add finite protocol. `lib/python-output-save.ts`/typed outputs for deliberate observations. Avoid breaking existing Tools cancellation with a new per-artefact runtime manager. |
| Packaging/CSP | `scripts/prepare-tool-assets.mjs`, `scripts/foundry-package-policy.mjs`, existing build helpers; `worker/index.ts` only if a proven resource/frame restriction needs adjustment. Keep main app policy narrow; no blanket `unsafe-eval`, CDN wildcard or `allow-same-origin` fix. |
| TEST histories | Proposed `lib/test-runs.ts`; `lib/test-transcript.ts`, `lib/test-observation.ts`, `lib/domain.ts`, relevant query/continuation/graph projections and tool descriptions. Leave `lib/scenario-control.ts`/`lib/hosted-scenario-registry.ts` as historical fixture adapters. |
| Recovery | `lib/recovery.ts`, `lib/recovery-bundle.ts`: new JSON/format validators, nested-asset rights/redaction and member metadata round trip; preserve native-only corrections/batching. |
| Focused tests | Extend `tests/pr80-projects.test.mjs` and disposable storage fixtures; add small runtime/artefact/TEST safety cases using existing tool-runtime/foundry/test-observation/recovery donors. No nine-persona replay. |

**Expected storage changes:** optional fields on existing Project/Note/record JSON, strict renderer definition schemas and additional validated existing-media formats. No composition table, drawing table, artefact revision ledger or new deployment service is required. Existing media tables have the metadata needed for immutable snapshot/package bytes; confirm actual migration constraints before widening admitted formats. No destructive migration is indicated. Reuse old evidence tables through the adapter above; do not add epoch machinery to content records.

**Expected MCP changes:** extend existing Project capabilities/update/part schemas, ordinary record creation with validated TEST membership, typed Note attachment writes, ad-hoc evidence selectors and one compact run-management tool if needed. No tool per card, shape or slider. Binary upload remains a web transport. Refresh the existing personal plugin after schema deployment and verify host-visible schemas/read-only capabilities before relying on new writes; current successful V100 capability discovery does not prove future schema freshness.

## 9. Implementation sequence and proportionate verification

One implementation branch, internal progress commits, one integrated Sites release. No checkpoint below is a separate approval or mandatory deployment gate.

1. **Pin V100 and reconcile touched native files.** Keep current native source/hosting/access and rollback receipt. Establish the whitelist, effective budgets, state-Note/asset reference model and TEST membership contract. In parallel-independent engineering work, the three small native/runtime probes can settle tldraw loading, Canvas isolation and supported Pygbag profile. No feature/demo seeding in the retained TEST Project.
2. **Complete shared validators/asset/recovery seams first.** Make a typed interactive definition round-trip through actual Project MCP and canonical D1 storage. Extend Note attachment transaction support and nested asset eligibility. This prevents each renderer inventing persistence and avoids a UI-only success.
3. **Add composition operations/UI.** Reuse the six layouts, implement hidden reveal/outline/semantic moves and protection behaviour. Confirm metadata-only rendition preservation before coupling dirty renderers to arrangement.
4. **Finish all four renderers.** Flashcards and explorer controls are small; tldraw/state assets and Python isolation/protocol are the heavier paths. Integrate their direct edits and ordinary GPT operations while preserving V100 reading/Notes. Complete owner-supplied packaged-app admission and actual isolated load.
5. **Finish ad-hoc TEST histories/evidence/cleanup.** Use ordinary content paths plus membership; page large inventory, choose evidence depth and prove cleanup refusal for genuine/outside references. Historical fixtures remain available without running them.
6. **Integrate native build and focused checks, then publish once when commissioned.** Port only reviewed shared changes while preserving native-only semantics. Save/deploy under existing custom audience and D1/R2/MCP bindings, with V100 rollback available. Complete brief real browser verification and host schema refresh/readback. This preflight does not authorise that publication.

### Focused check matrix

| Capability/risk | Minimum meaningful evidence during implementation |
| --- | --- |
| Shared writes/composition | Existing PR80 D1 cases plus new ops: create/read/update via real tools, stale CAS, identical replay/payload mismatch, denied owner, invalid destination atomic rejection, late Project+Note failure, protected direct edits, metadata-only unchanged rendition and exact source refs. |
| Artefact authoring | Each of four kinds created, edited and positioned via actual Project MCP schema, then read back unchanged and rendered. Reject unknown type/version/oversize. Native direct edit of the same fields persists. Do not count a manually rendered React fixture as this test. |
| Private assets/drawing | Nested flashcard image and board image attach only on winning save; other owner/revoked asset denied; standard pen/shape/text/image, save → reload → editable restore; stale Note save retains dirty drawing and current server state; arrangement does not clear store. |
| Python/explorer | Run/stop/reset; control changes alter actual visual output; captured seed/input reproducible; stale result discarded; timeout/infinite loop leaves page usable; oversized/invalid draw messages rejected; failed load honest. Child cannot read authenticated APIs/parent DOM/storage, obtain tokens, navigate top or use disallowed network. A controlled frame cannot trigger a parent write by forging a save message. |
| Packaging | Inspect final archive for required core runtime/controller/assets; no accidental optional 180 MiB scientific bundle. Test the actual native CSP, blob frame/Worker path and WASM load, not only static strings. |
| Pygbag | Admit one minimal already-packaged supported-profile artefact, verify reference/readback, loading and running, focus/stop/restart and missing dependency/error. Reject unsupported relative/ZIP profile, unsafe resource origin and oversized bytes. No commissioned game. |
| TEST histories | A small novel scenario with fictional dates, chosen counts and unfinished stop point; extend after reload; ordinary discovery/continuation excludes it while exact TEST selection works. Include Notes, marks/opaque Flag and interactive output. Verify observer attribution cannot be enabled by a TEST-looking operation ID targeting genuine data. |
| Cleanup | Preview no-op; exact authorised plan only; refuse changed inventory/revision/generation, other owner, genuine member and outside-reference/shared-asset cases. Verify deterministic chunk/partial outcome if used. Retention test has no automatic expiry/delete. |
| Recovery | One mixed V100/new Project + drawing snapshot/image + saved observation + TEST membership portable round trip in disposable storage, including revocation withholding and native-only record compatibility. This is directly relevant recovery verification, not a recovery-suite campaign. |
| Native/browser | Typecheck and successful native production build. Brief authenticated desktop and genuinely resized narrow viewport: outline/Arrange, card reveal, tldraw watermark and persistence, Python/explorer control, isolated Pygbag and Notes dock coexistence. Record actual viewport/method or mark mobile unverified. |
| Release | Native publish status terminal success; unchanged audience/bindings; exact source/archive/version; refreshed host tools and one small GPT→MCP→Project→interaction/save/readback loop using explicitly scoped technical material. Keep originals and retained TEST gallery untouched unless separately authorised. |

This review itself ran source comparisons and read-only capability/provenance checks only. No fresh build/test/browser passes are claimed. A default full `pnpm test`, fixture matrix, broad UX/Library review or 30-minute campaign is not required. The implementer should stop on an actual critical failure, not widen testing solely because many old suites exist.

## 10. Answers to the critical questions and remaining blockers

| Question | Code-supported conclusion |
| --- | --- |
| More complicated than blueprint assumes? | Yes: tldraw assets/snapshot save conflicts, private nested-asset/recovery closure, executable resource delivery and fixed-fixture evidence coupling. Plain flip UI and semantic arrangement are comparatively small. None requires changing the product direction. |
| Simplify without losing capability? | Reuse Project CAS and atomic Note batch; put big board state in a dedicated ordinary Note/media attachment; finite typed renderer/control catalogue; core Pyodide plus finite drawing protocol; no sync/custom drawing tools or arbitrary executable UI schema. |
| Hidden composition/MCP dependencies? | Stable block/part identity, effective byte budgets, direct-edit protections, hidden retrieval and dirty-state preservation must be shared. New JSON shape must reach both actual MCP schema and native renderer/asset checks. |
| Persistence compatible? | Yes with Project definitions and existing Note/R2 saved outputs, plus explicit typed admission/projection/recovery extensions. A raw snapshot in composition or IndexedDB-only board is incompatible with the intended guarantees. |
| All four composable through GPT? | Yes through one whitelisted interactive-part union and existing content+placement update. GPT supplies declarative definitions and explicit Python source; native code owns controls/runtime. No model-authored executable HTML/JS catalogue. Pygbag is the separately admitted owner-supplied package path. |
| V100 disruption risk? | Real on native source replacement, rendition changes, stale whole drafts, Notes coordinator interference and overly broad CSP. Avoid whole-module sync, keep V100 hashes for unchanged content, use dedicated board Notes and unchanged admission, and verify only directly affected safety paths. |
| Integrated commission realistic? | Yes as a substantial coherent implementation with resumable commits and early runtime probes. It is not credible as a small UI-only pass or a dependency-enable change. One release is reasonable; no evidence justifies splitting owner approvals/releases. |

**No verified pre-commission platform blocker was found.** The existing tldraw secret is configured but not runtime-validated; peer declarations are compatible; D1/R2 and required canonical mechanisms exist. There is no need to change Site access, purchase another integration, deploy a second service or touch PR84 to begin.

**Technical qualifications:** final SDK API behaviour must be checked against pinned 5.5.2 types/native build; real-host hobby licence operation remains to be tested; supported Pygbag package profile and loader must be proven; Python has browser resource limits rather than a guaranteed process memory quota; no complete host-level trace is available from the current observer. These are explicit limits, not evidence of delivered capabilities.

**Bounded specification clarifications recommended:** Project-local durable favourites versus temporary local folds; a dedicated Note/media snapshot save contract; a declared standalone Pygbag delivery profile with honest rejection of unsupported bundles; exact run membership/fictional-date semantics. They resolve implementation ambiguity while retaining every agreed capability. If implementation discovers the supported package cannot run safely, report that specific gap and propose the smallest delivery correction before claiming completion. Do not silently substitute a link, weaken isolation, add a packaging service, or omit the feature.

## Sources and review provenance

Repository references are relative to the inspected #83 branch unless a pin is stated:

- [Corrected AGENTS.md](../../AGENTS.md), [complete V100+ blueprint](../product/2026-11-03-v100-plus-interactive-projects-and-test-runs.md), [baseline/cleanup audit](../product/2026-11-03-v100-repository-baseline-and-cleanup.md).
- [PR80 implementation blueprint](../PROJECT-COMPOSITION-IMPLEMENTATION-BLUEPRINT.md), [progress](../PR80-IMPLEMENTATION-PROGRESS.md), [V100 release receipt](../releases/2026-11-03-pr80-candidate.md), [fast Sites workflow](../SITES-RELEASE-WORKFLOW.md), [historical V100 learner review](2026-11-03-v100-simulation-playground-learner-review.md).
- Source functions/files named throughout were read from public #83 and the protected native V100 checkout. Native-only source/identity/logs/secret values are not copied into this public report. Focused source comparison is not a whole-tree parity claim.
- Official upstream [tldraw persistence](https://github.com/tldraw/tldraw/blob/main/apps/docs/content/docs/persistence.mdx), [asset store](https://github.com/tldraw/tldraw/blob/main/apps/docs/content/docs/assets.mdx) and [licence key](https://tldraw.dev/sdk-features/license-key) guidance; Context7 retrieved upstream `getSnapshot`/`loadSnapshot`, document/session separation, `store.listen` and `TLAssetStore` APIs. Current documentation is not proof an example ran against 5.5.2; lock metadata and native execution must settle that.
- Official [Pyodide 0.28.3 Worker guidance](https://pyodide.org/en/0.28.3/usage/webworker.html) and [upstream interrupt guidance](https://github.com/pyodide/pyodide/blob/main/docs/usage/keyboard-interrupts.md), consulted through Firecrawl alongside the actual Minamo isolation code. Termination avoids adding SharedArrayBuffer isolation headers.
- Official [Pygbag guidance](https://pygame-web.github.io/wiki/pygbag/) and [upstream package options/runtime note](https://github.com/pygame-web/pygbag), consulted through Firecrawl. No third-party package/runtime was executed.
- SOFA was queried read-only for relevant Pyodide/iframe isolation experience; no matching posts were returned and no SOFA claim underpins the verdict. No external post, message or verification was published.

Only this Markdown report is authorised for the review commit. Application source, blueprint, settings, secrets, production records and PR84 remain unchanged.
