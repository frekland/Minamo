# Minamo V2 — Integrated learning continuity, Notes synchronisation and rich learning media

**Status:** DRAFT FOR OWNER DISCUSSION · planning only · **NOT authorised for implementation, merge or deployment**  
**Written:** 22 October 2026  
**Repository:** `frekland/minamo-v2` · existing private V2 Site only  
**Technical review (22 October 2026):** `LIBRARY-DATA-AND-MCP-CONTRACT.md` is now the **normative storage, reading-identity and Library publishing contract**; `TECHNICAL-VALIDATION-20261022.md` contains Context7/SOFA/Firecrawl evidence and engineering risk findings. These correct the earlier assumption that catalogue/index changes can be layered on without reading-contract work.

**Latest owner decisions:** `LEARNING-WORK-AND-CHECKPOINTS.md` is the **normative learning-work and ChatGPT/MCP behaviour contract**. It replaces earlier Investigation-only Development, status/origin, session grouping and background/automatic checkpoint assumptions in this document. `LIBRARY-DATA-AND-MCP-CONTRACT.md` remains normative for Library reading/catalogue.

**Living plan:** reconcile this domain plan with `INTERACTION-AND-LIBRARY-RECONCILIATION.md` (latest owner agreement on navigation, Notes lifecycle, annotation routing and Library IA), `NOTES-MOBILE-AND-IMAGES.md`, the decisions/acceptance register and the implementation sequence as requirements arrive. Do not treat provisional design choices as binding owner approval.

## 0. What this plan is and is not

The owner wants one substantial future Work/Sites implementation once the specification is sufficiently mature, rather than repeated small tasks. The **core** is genuine Investigation learning development captured from GPT conversations and learner work, connected to Journeys, Library, Notes and Home without duplicate records or notification spam. Bundle the closely related deficits shown by the real curl Investigation test:

1. First-class **explicitly checkpointed** learning developments on either Investigations or **Journey stages**, with the same evidence/revision/HTTP/MCP semantics; an Investigation need not exist when learning directly on a stage.
2. Independent user Notes, associated with work when relevant but never used as a default GPT progress dump; rapid reliable autosave so GPT can see acknowledged changes during live collaboration.
3. Cross-context learning relationships and suggested/accepted semantic candidates; server-derived **Home Continue / Recent Developments / Favourites**, and compact Journey/Investigation projections with no sessions or progress statuses.
4. Purposeful *native rendered diagrams*, externally playable **embedded video** where rights, provider and user consent allow it; retained, useful link fallbacks.
5. Automatic, controlled publication of canonical Library concept/function/command index entries from intentionally authored technical references, including options such as `curl -i` and `--location`.
6. Note formatting as accessible **icons** and keyboard shortcuts with real toggle semantics.
7. **Mobile-first Notes presentation with a minimisable floating launcher, compact multi-Note tabs and pen-icon title renaming; in-canvas private screenshot/image insertion via desktop paste/drag-and-drop or one small mobile upload button.** These intended experiences are in `NOTES-MOBILE-AND-IMAGES.md`. Exact source-marker mechanics remain subject to validation.
8. **Owner-agreed interaction consolidation:** desktop bottom bar with open Note tabs/+ and Notes-only management link while sidebar Your Work remains All, correct zero-tab/minimise/restore/open-Note Trash lifecycle, source-first annotation navigation with safe prose fallback and exact-target Flag toggle, true V1 branding, and scalable Library subject-area/topic/reference search, summaries and pagination. Detailed source and acceptance contract: `INTERACTION-AND-LIBRARY-RECONCILIATION.md`.
9. **Verified reading/catalogue dependency:** current `renditionFor()` hashes `Article.concepts` and `learningShape.subject`; future catalogue-only edits must not falsely change content rendition. Separate an additive, revisioned Library catalogue sidecar for current summaries/commands/indexing from exact authored reading, preserve historical editions, and fix targeted manuscript `sN/pN` ID stability. See `LIBRARY-DATA-AND-MCP-CONTRACT.md`.
10. **Sessionless ChatGPT/MCP learning workflow:** “Use minamo.” warrants focused retrieval when needed, NOT per-turn reads/writes or automatic interaction receipts. Only explicit user checkpoint/write requests persist learning developments or content. Favourites reuse whole-record target-based bookmarks for eligible Journeys/Investigations/Library Articles; no Investigation started/active/parked/concluded or origin classification. See `LEARNING-WORK-AND-CHECKPOINTS.md`.

**This PR is planning-only.** Do not edit runtime, migration, tests or production; do not write to private learner data or run synthetic migrations. Implementation instructions here describe a *future* owner-approved commission. Add future requests to the change register and reconcile them across contracts, migrations, UI projections, tests and exclusions **before** the owner explicitly authorises the build.

### Goals

- Meaningful learning work belongs to its exact **Investigation or Journey stage** primary target, not a loose GPT-authored personal Note. It is saved only when the owner explicitly checkpoints or asks for a content change.
- GPT can naturally capture *what changed in understanding*, including mistakes, corrections, evidence and unknowns; it must never claim Kali execution not supplied or actually performed.
- One Investigation can be isolated or related to several Journeys/stages and Library concepts, with one authoritative history. **Journey stage work is also independently recordable** without inventing a parent Investigation; optional related contexts never duplicate the event.
- Home shows **Continue, Recent Developments, Favourites** from bounded owner-private server projections; Journeys and Investigations show targeted evidence-aware histories. Favourites are exact whole-record bookmarks, not activity/status. Browsing or editing Notes never counts as learning progress.
- Note typing is local-durable on every edit and rapidly server-acknowledged without pressing Save. GPT reads only authenticated current acknowledged server versions; stale/busy status is honest.
- GPT-authored rich manuscript content should be represented as readable diagrams, indexed commands and deliberately playable referenced video where possible, without paid model inference.
- Keep both writing and reading simple. Internal mechanics, generated IDs, exact relationships, permissions and recovery belong to Minamo server. **No learner-facing Investigation lifecycle/origin labels and no formal session start/stop/group IDs**.
- One authoritative Library Article can be used by multiple approved Subject areas and Journeys; the Library landing page and Your Work results are bounded, server-backed catalogues, not unbounded currently-loaded grids or administrative forms. Annotation titles return to the exact marked source, with owner-prose fallback when source is unavailable.
- **Catalogue metadata is not canonical reading text:** future authored preview summaries and current command/alias definitions live in a separately revisioned metadata authority. Old Article `concepts`, `learningShape`, all stored `rendition` hashes, historic source manuscript editions and exact captured UTF-16 ranges remain retrievable and unchanged. A real teaching-text edit does create a new rendition, with target revalidation.

### Non-negotiable boundaries

Preserve V2 owner-only auth, generation fences, D1/R2, source rights and permanent permission floors, retained canonical editions, UTF-16 selection positions, Flags and annotations, personal Notes, idempotent operations/receipts, safe recovery, exact external-reference provenance and current genuine learner records. Flags/annotations never auto-instruct GPT. No mandatory curriculum/completion achievements or user-visible progress percentages. No inference of observed execution from chat summaries. No second paid API, Workers AI, Vectorize, third-party model or additional hosted service as a dependency. Original `frekland/Minamo`, original Site and `cyber-learning` remain untouched; private corpus/prose never enters Git or telemetry.

## 1. Confirmed V2 source baseline (recheck before implementation)

| Location | Source-owned fact and change boundary |
| --- | --- |
| `lib/contracts.ts` / `lib/learning-validation.ts` / `lib/manuscript.ts` | Legacy v1 Investigation shape **requires question/mode/provenance** and publisher writes `suggested/gpt-prompt`; this learning shape contributes to `renditionFor()` hash. Introduce minimal v2 question-only authoring (legacy read untouched), shared Journey-stage/Investigation Development target, no status/origin requirement. |
| `lib/bookmarks.ts` / `lib/bookmark-targets.ts` | Existing whole-record `setFlag`/`BookmarkState` supports Journey, Investigation and Article target identity with CAS/off tombstones. Use as **Favourites** for Home and record UI, with bounded owner-scoped bulk read and current eligibility, not new Favourite table. |
| `app/investigation-workspace.tsx` | Current UI divides GPT-authored suggested versus active questions and exposes a **Start investigating** button that mutates hashed v1 `learningShape.mode`. Replace with question + checkpointed learning timeline/current interpretation, no status or origin controls. |
| `app/journey-route.tsx` | Stable stage IDs, authored stages, local `sessionStorage` last-visited position and general links. Add **direct stage-targeted Developments** and bounded related Investigation context; last-visited navigation must not be reported as learning progress. |
| `app/workspace.tsx` | Home currently composes lists from loaded records/`v2_activity` and separate Notes/editorial updates. Use server-derived **Continue / Recent Developments / Favourites** without sessions or recent-visit-as-progress; retain sidebar/Notes and appearance improvements from the interaction contract. |
| `app/learning-links.tsx` | Rendered explicit/incoming relationships and `LibraryIndex` that expands area/article grids from only the currently loaded records, including an arbitrary ungrouped “More reading to explore.” Retain authored versus suggested links; replace Library landing with server-backed Subject areas/Topics/References views and paginated area detail. See reconciliation document. |
| `lib/domain.ts` | Validated record CRUD, readContext, queryRecords, CAS + operation receipts, owner/gen D1 batches. **`renditionFor()` hashes Article concepts and learningShape** but excludes links. Reuse these invariants; add separate catalogue revisions/exact index, compatible current and retained reads, and high-level purpose-specific MCP/domain operations. |
| `app/personal-work-organiser.tsx` / `lib/personal-work-organiser.ts` | Two-search-box/large-management default and standalone Annotation open despite exact `workReturnLinks`. One query, compact tabs with server pagination; notes-only entry from bottom bar; direct annotation exact source return plus rights-safe fallback, bulk ops on demand. |
| `app/annotation-preview.tsx` / `app/bookmark-toggle.tsx` / `app/reading-interactions.css` | Contextual annotation editing already works; target-based Flag exists but dotted mark is unclear. Preserve proven flow, add underlying passage Flag toggle and unobtrusive glyph without changing canonical reading. |
| `frekland/Minamo/app/index.html` / `app/identity/` (read-only) | Verified V1 `/identity/minamo-header-refined.png` and `/identity/minamo-icon.svg` exist; planned V2 branding reuse without original source changes, after owner approval. |
| `lib/domain-handler.ts` / `worker/index.ts` | Thin authenticated MCP/HTTP routing. Expose small specialised functions; do not enlarge legacy tool unions further. |
| `lib/manuscript.ts` | PR18 Markdown AST compiler: plain ASCII diagrams are code, valid declared JSON diagrams become native; `mermaid` remains a fallback. It does not populate Article index or external video parts. Current section/part IDs are sequential `s1/p1`, so targeted full replacement needs stable-ID carryover or explicit conflict to protect existing captures. |
| `lib/diagrams.ts` / `app/flow-diagram.tsx` | `flow-v1`, `state-v1`, `grid-v1` and `graph-v1` safe native codecs/renderers exist. Extend only when semantics or legibility warrant it. |
| `lib/contracts.ts` / `app/concepts.tsx` | Canonical command index reads explicit `Article.concepts`; a prose/table list alone yields **zero** entries. **`lib/domain.ts:renditionFor` currently hashes that field**. Add a versioned catalogue sidecar authority for future entries/summary and adapt compatible current/retained reads; deliberate entries published with anchored targets, no false reading edition. |
| `app/note-attachments.tsx` / `app/image-attachment.tsx` / `lib/note-attachments.ts` / `lib/asset-client.ts` / `lib/assets.ts` | Existing owner-private image staging/attachment lives in separate reading sections. Plan precise inline source-marker/part mapping and CodeMirror in-flow widgets without weakening upload/revocation or old Notes. |
| `app/notes-workspace.css` / `app/note-writing-editor.tsx` / `app/note-markdown-view.tsx` | Desktop/mobile screenshots show desktop controls and previews crowding out writing. Dedicated minimisable mobile sheet, one restore bubble, compact tabs and pencil rename, private image paste/drop/screenshot in-flow. Desktop bottom Notes bar shares open tabs; don't create a second Notes controller. |
| `app/notes-panel.tsx` | Already retains drafts and 1,100ms idle autosave, but has manual Save, pending typing lock, hidden open-Note Trash and `closeTab()` **creates a blank draft when final tab is closed**. It can restore a tiny collapsed box from the bar. Replace with per-edit local/near-live sync and a shared explicit Note lifecycle controller (zero tabs valid), direct Trash and proper restore. |
| `app/note-writing-editor.tsx` / `lib/note-markdown.ts` | CodeMirror, text-labelled formatting buttons; Markdown formatting insertion (`noteFormatChange`) is not yet a true selection-aware toggle. No committed scoped keyboard shortcut map. |
| `lib/media.ts`, `lib/media-handler.ts`, `app/reading-media.tsx` | Private admitted original uploads (MP4/WebM/audio/docs) and explicit load are supported. This is **not** a general external video embed renderer. Never confuse a link-only URL with owned original bytes. |
| `lib/recovery.ts`, `lib/generations.ts`, `db/schema.ts`, `drizzle/` | Recovery explicitly enumerates tables, hashes and rights. Every new durable learning-work table needs migration, snapshot/restore/portable encrypted recovery, namespace switch and budget tests. |
| `docs/SOURCE-SYNCHRONISATION.md` | Sites native source and GitHub trees are separate; a future release must verify identical trees and actual installed MCP version. |

Current installed MCP contract observed in the curl test: `minamo-v2-2026-10-22.18`. Prior PR18 authored a real source-preserving manuscript pipeline, but the public end-to-end learning-work workflow is still absent. Implementation must read **current** `main`, installed contract, PR18 results and new changes before coding; this baseline is not a guarantee that all source files remain unchanged.

## 2. Domain language and separation of responsibilities

**Superseding requirement:** See [LEARNING-WORK-AND-CHECKPOINTS.md](LEARNING-WORK-AND-CHECKPOINTS.md) for the exact unified event schema, lifecycle compatibility, MCP intent boundaries and view projections. Investigations and Journey stages share one Development mechanism. Do not turn a Journey into an Investigation container, an Investigation into a personal Note, or GPT chat prose into verified evidence.

- **Investigation** — a persistent question and canonical authored reading. No started/active/suggested/parked/concluded state and no learner-facing user-versus-GPT origin classification. Old v1 mode/provenance remain archived for exact rendition compatibility but are not learning status.
- **Journey stage** — an authored stable stage of a Journey that can own its *own* learning developments, even if no Investigation exists. Stage navigation/last visited is not learning evidence.
- **LearningWorkTarget** — exact primary target: one Investigation OR one Journey stage. An event can reference accepted relevant secondary contexts without duplicating records or claiming that an entire multi-linked Investigation progressed every associated stage.
- **Development / checkpoint** — one meaningful owner-requested, append-or-revised learning update containing predictions, reported attempts, corrections, evidence and open questions. It is recorded **only on explicit user checkpoint/save request**; no autonomous learning-progress writes from "Use minamo" or ordinary chat.
- **Working perspective** — bounded current understanding attributed to eligible saved Development IDs, revised with correction/withdrawal; not necessarily objectively verified truth.
- **Evidence reference** — exact permitted Source, learner-supplied terminal excerpt, recorded Run, Note revision, commit or owner statement, explicitly classified by origin/basis **of the evidence**. This is not an Investigation creator/origin field.
- **Personal Note** — user-owned freeform writing, optionally associated with stage/Investigation/Library, never automatically a checkpoint or GPT progress dump.
- **Favourite** — an explicit whole-record bookmark via existing target-based Flag machinery for eligible Journey/Investigation/Article; independent of chronology and progress.
- **Derived view** — bounded read-only Home, Journey, Investigation or GPT context from the same Development and bookmark authorities. No duplicate histories, formal sessions or completion achievements.

### Provenance is a first-class field

A development fact must indicate whether it is `learner-reported` (learner described a result, not independently verified), `supplied-artifact` (learner supplied exact command/output, still not server-run), `minamo-observed` (a real tool receipt in Minamo), `gpt-interpretation` (model reasoning), `provisional`, or `illustrative`. Provenance describes a claim's basis, not learning merit. It can contain mixed claims with different sources in a single development.

Also record `author: user|gpt|system`, creation time, revision/operation IDs, and source references. An illustrative scenario must never be silently relabelled as real progress merely because the record's legacy `synthetic` flag is false. Reject invented `observed` claims unsupported by eligible records or explicit user-supplied data; when uncertain save clearly provisional interpretation, not a fabricated Run. No automatic achievements or completion assertions.

## 3. Persistent learning-work model (Investigations AND Journey stages)

**Normative schema/operations:** [LEARNING-WORK-AND-CHECKPOINTS.md](LEARNING-WORK-AND-CHECKPOINTS.md), sections 3–4. Existing earlier suggestions to create `v2_investigation_developments`, `v2_investigation_development_revisions` or require `investigationId` on all events are **superseded**. Those were planning sketches, not authorised migrations.

Store one versioned, owner-scoped Development stream keyed by exact `LearningWorkTarget = {kind:'investigation',investigationId} | {kind:'journey-stage',journeyId,stageId}`. Keep immutable-or-revised history, supporting evidence/provenance per fact, a separate current-perspective projection per exact target, operation receipts, generation fences and current-source checks. This adds no new Investigation mode or session concept. Work/development mutations must **not** alter canonical Investigation/Journey sections or rehash old reading renditions.

One event may include several typed facts and explicitly relevant secondary contexts. **Do not fan out one Investigation event to all linked Journey stages**: stage progress appears only when an event directly targets the stage or identifies the stage as explicitly relevant. Other related Investigations appear as labelled related reading/questions. Journey stage IDs must persist through safe canonical manuscript edits or fail with recoverable diagnostics; source/part anchors remain exact and eligible.

**Storage:** one provisional `v2_learning_developments` family, immutable revisions and owner-target perspectives as in the learning-work companion document; build any accepted relationships through the **single explicit link authority** already being reconciled with Library subject-area membership, not a second independent graph. `v2_activity` remains an audit of mutations, **not** evidence of learning and **not** the Home timeline. Preserve old v1 Investigation reading hashes by versioned read compatibility; avoid rewriting the old question merely to remove status/origin.

### Explicit checkpoint MCP operations

- `get_minamo_learning_context`: one bounded recent/Home/exact-target owner-scoped read with last meaningful checkpoints, evidence basis, Favourites and available exact destinations. Compatible with existing `get_minamo_context`; no giant Note or history dump.
- `record_minamo_learning_development`: on **explicit owner checkpoint**, atomic D1 append/revision/receipt for one exact Investigation or Journey-stage target. One call may contain multiple factual observations/corrections and, only where explicitly requested, a small bounded multi-target batch.
- `revise_minamo_learning_development`: current-CAS correction or withdrawal, preserving prior evidence and history.
- `get_minamo_relationship_candidates` / `confirm_minamo_relationship`: proposed connections read-only versus explicitly authorised accepted relationships, with stage/area permission and revision guards.
- Intentional content authoring via `publish_minamo_manuscript` and target bookmark `setFlag` remains a **separate explicit user-requested write**, not a checkpoint.

Do **not** simultaneously implement the old proposed Investigation-only `record_minamo_investigation_development`/read store and the new shared event service. If a comparable function turns out already installed, provide a tested compatibility wrapper over the **same canonical method**, never two write authorities.

### Provenance and boundaries

A development fact must identify whether its basis is `learner-reported`, `supplied-artifact`, `minamo-observed`, `gpt-interpretation`, `provisional` or `illustrative`. Keep operational `author`, operation identity and source/current-eligibility checks. **Evidence provenance is mandatory; creator/origin classification of the Investigation is not.** No invented Kali execution or arbitrary promotion from illustrative to observed. A Note link or page visit isn't a new Development.

### Use minamo: a low-friction conversation, not a background writer

Starting a ChatGPT conversation with "Use minamo." directs GPT to use relevant Minamo learning context. It does **not** authorise automatic checkpoints, an MCP write on every exchange, a conversation transcript log, mandatory access-history receipts or repeated "Would you like to save?" interruptions. GPT may make one focused read at the start, reuse that evidence in the chat, and read again when a different record or fresh requested evidence is needed. Ordinary recall, explanations and challenge brainstorming remain **read-only**. Only explicit checkpoint/save/add/update/favourite requests trigger writes. Never imply Minamo saw unsaved ChatGPT turns in a new conversation. No `sessionId` or session lifecycle.

## 4. ChatGPT continuity and Notes cooperation (no formal sessions)

**Owner mobile/desktop interaction clarification (22 October):** Notes is a writing-first sheet on mobile, **but must still minimise to a small floating restore control**, and still support **several compact switchable open Note tabs and inline renaming with a pen icon next to the active tab name**. Desktop Notes accepts screenshot/image **paste and drag/drop into the editing canvas**, with bounded in-flow previews that never cover following text; mobile has a small screenshot upload control. Existing private R2 image staging supplies the bytes and versioned exact-canonical placement must be tested. This is not a disconnected "Attachments" list. The complete implementation contract and user screenshot issues are in [NOTES-MOBILE-AND-IMAGES.md](NOTES-MOBILE-AND-IMAGES.md). Do not implement a simplified mobile one-Note-only mode.


### Notes must autosave from the first character

The current 1.1-second idle saving is useful groundwork but does not meet the intended model: editing is locked while pending, the explicit Save button creates an unnecessary interaction, blank new drafts may remain client-only, and GPT may read a stale acknowledged revision.

**Implementation default (owner-agreed interaction; latency to be measured):** immediate per-edit local persistence and one coalesced, rapid, CAS-guarded remote queue per Note. Server acknowledgement need not occur for every physical keystroke; no additional user decision is required to use this default.

1. Every editor transaction (typing, delete, formatting, paste, undo, IME composition commit, Note title/context changes) **immediately preserves a full owner- and generation-scoped local draft** before it can be lost on navigation. Use the existing retained draft store as a baseline, improving write-through rather than relying only on a later React effect. Keep a fallback if browser storage is unavailable.
2. New nonempty Notes get a stable private record identity at first meaningful input, with no explicit Save operation or mandatory title. Do not generate duplicate "Untitled" Notes from whitespace-only focus/blur.
3. Queue **detached immutable snapshots** per Note while writes are in flight. **Continue accepting edits during sync**; at most one CAS-backed mutation per Note in flight. Track three different identities: the local edit sequence, **the exact revision committed by the original operation**, and any **later current server revision** returned on subsequent readback. Drain newer local edits against the actual committed revision, **not an unrelated latest readback revision**; a concurrent newer title/context/sections/body edit must be explicitly reconciled across the whole Note or surfaced as a CAS conflict. Never silently rebase queued full-record content or overwrite a concurrent edit. Other Notes remain independently editable.
4. Start remote sync soon after input (initial engineering target: 300–500 ms idle; hard flush on blur, switching Notes, closing panel, visibility change; seek <=1s normal online server-ack delay in tests). These numbers are **acceptance hypotheses** to measure, not a guarantee. Do not send a D1 full-record revision on every physical keystroke without profiling writes/races/storage budget.
5. Distinguish **Saved locally**, **Syncing**, **Saved to Minamo (revision N)**, **Offline/awaiting confirmation**, **Conflict—local draft protected**. Only acknowledged owner-private server content is MCP-visible; never tell GPT it has read current keystrokes while a sync is pending.
6. Server-only reads return **last acknowledged revision and acknowledgement time** for currently eligible Note content. **Do not claim `pendingLocalEdits` is server knowledge**: the server cannot see an unsubmitted browser draft; return pending state as **unknown** to external MCP readers if necessary. The active editing client alone may overlay locally known dirty/pending status. GPT may report the last acknowledged revision, but may not imply that a browser-only draft was synchronised.
7. Preserve immutable `operationId` retry and `read_minamo_operation` uncertainty recovery, owner/gen/rev CAS and cross-tab divergent edits. **The returned operation receipt's committed revision is the acknowledgment for that operation**, not any newer current record; title, body, context links, attached image order and sections all participate in conflict reconciliation. A stale tab must not overwrite another writer; retain both drafts and report conflict honestly.
8. Remove the formal Save Note action from the **normal** path only after no-data-loss acceptance. Retain an unobtrusive "Retry sync / Check status" recovery control. Deletion remains deliberate.
9. Test note-dock changes, maximised/minimised/collapsed states, mobile virtual keyboard, tab switching, blur, app backgrounding, airplane mode, forced process closure and re-entry. **In `app/workspace.tsx`, do not abort unrelated search/pagination and await an entire workspace refresh on every frequent Note acknowledgement**: merge the precise committed Note receipt, coalesce only affected view revalidation, and preserve owner/generation/source-rights invalidation. Test typing while global search is paginated and retained reading is open. No silent loss or auto-created progress.
10. Never auto-share Notes to GPT. Read access remains available only when the owner requests task-relevant context; Notes associated with an Investigation are **candidates** to include, not automatic instructions or verified learning claims.

**Meaning of "every character saved":** immediately durable *locally* after each edit; rapidly synchronised to Minamo's server without an explicit Save button. A strictly server-acknowledged write for **every** keystroke would generate excessive D1 revisions and potentially worsen races. If the owner requires literal per-character remote acknowledgement, evaluate a separate append/coalescing draft stream and its cost before selecting it (open decision N-01). The user-visible promise must distinguish these models truthfully.

### Working context before publishing development

`get_minamo_learning_context` can return links to **acknowledged** current Note revisions and their availability, plus a small purposeful subset of related saved Notes for the exact Journey stage or Investigation when relevant. GPT may inspect selected relevant Notes and current chat. It records a Development **only when the user explicitly asks to checkpoint/save the learning**, never because it inferred that a conversation was significant. No background autopublish or automatic capture of entire ChatGPT history is claimed. GPT submits a concise account of what changed (with source provenance) rather than rewriting entire Notes/chat transcripts.

Reference exact `note id + revision` on a Development. If the user edits or Trashes the Note later, retain honest provenance while respecting current access/withdrawal controls; never silently substitute a newer Note meaning into an older Development. Investigations **or Journey stages** remain authoritative work targets; Notes remain freeform supporting work.

## 5. Cross-context projections: Home, Journey, Investigation, GPT

**Normative user-facing contract:** [LEARNING-WORK-AND-CHECKPOINTS.md](LEARNING-WORK-AND-CHECKPOINTS.md), section 5. Render different views of the **same** owner/private saved checkpoint events, accepted connections and exact whole-record bookmarks, not independently mutable histories, statuses or inferred sessions.

- **Home / Continue:** a small server-ranked list of exact Investigation or Journey-stage targets ordered by **last meaningful saved checkpoint**, with short current context, relevant next question and stable deep link. Not "active" flags, last visited, generic edit timestamps, Note typing or GPT reads.
- **Home / Recent Developments:** bounded meaningful checkpoint summaries; adjacent updates on one target may be grouped **at read time** for display without a stored `sessionId`, fabricated session boundary or duplicated records. Correction/withdrawal/source availability change the current view without rewriting immutable past.
- **Home / Favourites:** explicit eligible whole-record target bookmarks for Journeys, Investigations and Library Articles via `setFlag`/existing `v2_bookmarks`. Independent of recency; no separate Favourite entity or derived achievement. Where Continue and Favourites overlap, avoid noisy duplicate cards.
- **Journey stage:** direct stage-owned developments, explicitly relevant Investigation developments and **separately-labelled related Investigations**. Short latest development/open question, evidence refs and an optional checkpoint/edit affordance. Do not turn a general Investigation link into implied progress for every stage.
- **Investigation:** question, latest perspective, evidence-aware development chronology/corrections, open questions, optional linked personal Notes and accepted Journey/Library contexts. No Start button, question origin badge, active/parked/concluded state or percent-complete.
- **GPT/MCP:** one bounded `get_minamo_learning_context` read for recent or exact target, with actual saved evidence/classifications/freshness, eligible Favourites and deep links. "What happened last session?" means "what saved records were there recently?" not an invented server session or access to past unsaved chat.
- **Freshness and permissions:** each projection uses owner/generation-qualified D1 rows and a source version/freshness marker, stable cursor and current access checks. An acknowledged MCP checkpoint refreshes target and Home projections without editing canonical reading or requiring another client/tool read just to make the same acknowledgement meaningful.

Use a **quiet empty state** when no checkpoints exist, rather than fabricate a learning milestone or force the user to create an Investigation. Library/Journeys/Investigations remain available for discovery; there is no compulsory Home "Explore" feed. Last-opened Journey stage remains a separate navigation convenience, currently local `sessionStorage`, not saved progress.

### Semantic links with sparse content

Start with existing exact concept/alias matches and accepted relations, plus D1 FTS5 if compatible with Sites/D1. Use the **same authoritative accepted relationship model for both Investigation↔Journey stage and Library Article↔Subject area multi-membership**, with an explicit suggested-vs-accepted distinction. Retrieval suggestions should include matched canonical section IDs/terms and clear *why it might be relevant*; missing candidates are normal. GPT may propose a link, but only explicit user/GPT owner-directed confirmation records an **accepted** semantic/educational association with reason and source/target context. No Workers AI or Vectorize requirement. Never infer equivalence or completion from lexical overlap.

## 6. Rich diagrams as a publication capability, not author toil

The existing `graph-v1` and other codecs are capable of safe native rendering but manuscript intake still treats many common visual notations as code. Authoring should accept a friendly form and convert **only when the original relationships survive unchanged**:

1. Keep explicitly typed `minamo-diagram` and `graph-v1` with validated structured data as the guaranteed path.
2. Add a **bounded, documented Mermaid-compatible subset** for flowcharts, directed graphs and true state transitions if it can be compiled deterministically to a correct native codec. Validate every node, edge, label, branch, cycle and intended direction. No third-party Mermaid execution or arbitrary HTML/SVG injection.
3. If a diagram is unsupported or its meaning is ambiguous, preserve the source faithfully and display a bounded warning/fallback. **Do not** transform an ordinary room map into a state machine or turn a network topology into a linear DAG.
4. Provide author guidance/preview of accepted codecs, not a need to write internal JSON for every diagram. Link a diagram to the **section it explains**, with accessible captions/alternative text and textual edge list.
5. Reuse existing `app/flow-diagram.tsx`, only improving layout/zoom/mobile readability as needed; don't add decorative diagrams just to satisfy quantity.
6. Test canonical UTF-16 reading, selection/Flag/Annotate source identity, inherited renditions and safe fallback after diagram changes.

Baseline regression: the curl Library reading's ASCII request/response sketch should become a purposeful rendered HTTP exchange diagram **via a supported explicit or safely convertible input**, and each published record should preserve its original manuscript source.

## 7. Embeddable educational media without external paid services

Current private R2 video uploads are separate and remain supported. Add a **rights-aware external-media reference** that can display a safe, *user-activated* embedded player for an explicitly supported public video.

- Supported initial providers **provisionally** YouTube (privacy-enhanced `youtube-nocookie.com`) and Vimeo (`player.vimeo.com` with `dnt=1`). Only accept strict `https` watch URLs or documented player forms and extract validated video IDs/server-generated embed destinations. Do not accept author-supplied arbitrary iframe HTML or embed URLs.
- Render a safe static **consent/preview card by default**, with title, source, creator, description, transcript/captions URL if available and an explicit "Load external video" action. Before that action **no requests** to the video provider, including thumbnails/tracking pixels. Use responsive aspect ratio; show direct external-open link and errors/offline fallback.
- On activation, create a constrained iframe with explicit `title`, `loading="lazy"`, carefully selected `sandbox` and `allow`/Permissions Policy, `referrerPolicy`, and CSP `frame-src` allowlist. No automatic autoplay; player controls and keyboard/fullscreen must work. The precise sandbox must be verified against actual provider behaviour, not assumed compatible.
- Vimeo's DNT mode does not guarantee zero cookies; provider policies, consent and user agency must be explained truthfully. Do not claim YouTube privacy-enhanced mode implies no third-party requests after playback is explicitly activated.
- Do not proxy external video or bypass embedding restrictions, access controls, age restrictions, robots or licensing; provide link-only fallback when an embed is unavailable.
- Keep **owner-private uploaded media** and public linked/embedded media separate types with different provenance and rights. Source revocation and currently eligible canonical rendition must govern private files. External page/video content is not imported into Minamo.
- Preserve a meaningful author-supplied explanatory caption and user-controllable transcript/reference; do not generate a transcript or claim media playback was observed.
- The manuscript compiler should support an explicit bounded media declaration (e.g. an `external-video` directive or verified link + deliberate "embed" designation) that yields a native typed part. It must not embed every incidental external link automatically.
- Optional external images: prefer referenced image links or owned/staged uploads; external hotlinked media should not be auto-loaded without host/privacy/source checks. Do not conflate the Markdown image syntax with authorised file ownership.

Test curl article with an **actual direct embeddable video ID from a trusted source**, not the `https://curl.se/docs/videos/` listing (which isn't a video embed), and a fallback when the resource is unavailable.

## 8. Canonical command / function / concept indexing during manuscript publication

`app/concepts.tsx` already renders typed Article `concepts`. The PR18 manuscript publisher emits readable tables but no index metadata, so the curl article has zero command entries.

Provide an **intentional, editorially precise** authoring surface:

- Accept explicit `Commands` / `Reference entries` sections or a small structured directive/table with columns for term, aliases, kind, signature/usage, short definition, target section/part and environment.
- Compile selected entries into the **authoritative revisioned Library catalogue sidecar**, deriving stable entry IDs and exact `sectionId/partId/examplePartId`; project a compatible current `Article.concepts` read DTO only where existing clients require it. **Never write catalogue-only changes into frozen legacy Article concepts or rehash historical reading.** Preserve case-sensitive short/long flags and shell syntax.
- The server may extract **candidate** entries from code or prose, but should not silently publish every incidental token as a canonical command. GPT should be able to confirm the candidate set within its existing authoring flow without writing 15 separate upsert calls.
- Detect aliases such as `curl -i` versus `--include` and keep command syntax versus option names clear; one canonical entry with aliases where genuinely equivalent. Index `curl`, `-i`/`--include`, `-I`/`--head`, `-L`/`--location`, `--header`, `--write-out` and `--max-time` from the article under appropriate `shell-command` kind.
- Validate exact bounded `kind/signature/usage`, canonical target and source rendition; conflicts, ambiguity and duplicate indexing return actionable local diagnostics. No silent overwriting another Article's entries.
- On a later Article revision, reconcile entries with stable IDs and dropped/relocated destinations, preserving old exact citations and external permissions. The index is a *reference to the article*, not a duplicate lesson.
- The existing `ConceptBrowser` and unified Library References view must show these entries **regardless of what is loaded in the browser page**, with exact owner-eligible paginated search. GPT and web must share one source of query truth and resolve to the correct authoritative Article section.

## 9. Note formatting: compact icons and real keyboard toggles

Change `app/note-writing-editor.tsx` and `lib/note-markdown.ts` without rewriting the whole Notes shell. Use existing Lucide icons; prefer small controls with stable focus, tooltips, `aria-label` and indicated keyboard shortcuts. The icons are a local UI improvement, not a new rich text engine.

- Provide icons for **bold, italic, headings, bulleted list, numbered list if supported, block quote, inline/fenced code, link, undo and redo**. Put code-language and link destination settings in a small accessible popover/dialog rather than permanent text-heavy boxes.
- Scoped CodeMirror keymap (not global): `Mod-b` bold, `Mod-i` italic, and carefully chosen non-conflicting, discoverable shortcuts for heading, list, quote, code and link. For Windows/Kali `Mod` usually Control; macOS Command. Verify against browser/native shortcuts; offer toolbar access on Android.
- **Toggle behaviour**: when selected text already carries Markdown delimiters, pressing the same shortcut removes them without duplicating wrappers. Caret inside a formatted run, mixed selections and empty selections require deterministic behaviour with preserved selection/undo transactions. No repeated `****text****` corruption.
- Keyboard shortcuts must work while the CodeMirror editor is focused, but not when other inputs, the video player, contenteditable other records or selection/annotation toolbar has focus. Prevent only handled shortcuts; preserve accessibility, IME composition and normal browser keys.
- Render accessible pressed state, hover/keyboard tooltip, focus return and small-screen overflow. Do not sacrifice typing width for a giant toolbar. A formatting operation must enter the same local-per-edit preservation and remote autosave pipeline as typing.
- Keep exact Markdown source and current versioned visible-text rendition mapping. Test selection/cursor with mixed emoji, formatting, long links and code blocks.

## 8A. Source-preserving Library metadata, index and MCP contract — mandatory

**Revised architectural requirement after technical review:** the initial assumption that we can simply retain all reading mechanics unchanged while adding Library taxonomy and command indexing is **incomplete**. [LIBRARY-DATA-AND-MCP-CONTRACT.md](LIBRARY-DATA-AND-MCP-CONTRACT.md) is the normative detailed contract. It records:
- Current `lib/domain.ts:renditionFor` hashes `Article.concepts` and entire `learningShape`; indexing new commands or reclassifying `subject` can falsely create a new reading rendition. Keep old rendition IDs and snapshots byte-for-byte; use a separately versioned **authoritative Library catalogue sidecar** for future summaries/commands/aliases, with backwards compatible current/historical projections and explicit migration of legacy concepts.
- Current `RecordLink.links` is excluded from reading hash; retain it as the initial authoritative accepted relationship representation (with scoped/provenance-aware admission), derive/search multi-area membership and confirm stage links, avoid a parallel accepted-link store without demonstrated need. Do not rewrite `learningShape.subject` to organise a topic.
- The `publish_minamo_manuscript` contract must accept optional concise **authored catalogue intent**, resolve exact existing and bundle-local Area/Article refs, reject ambiguous duplicates, and commit reading+raw source edition+catalogue revisions/index+accepted links+receipt in one **D1** batch. A staged R2 image is still outside this D1 transaction.
- New full manuscripts may generate `sN/pN` parts; **targeted updates must successfully preserve stable section/stage/current reference identities for ordinary unambiguous insertions/reorders**, while genuinely ambiguous changes return `anchor_migration_required` with a useful diagnostic. Existing captures remain pinned to the eligible **old rendition**, so new-rendition ID reuse does not by itself move a correctly resolved historic capture; don't build an unnecessary general semantic remapper.
- D1 supports FTS5 for prose but FTS5 normalisation conflates `curl -i` and `curl -I`. A local SQLite unicode61 probe confirmed this. Use exact case/punctuation-preserving reference term/alias lookup for commands, plus optional FTS5 for prose.
- Historical catalogue revisions and accepted relationship sources belong in encrypted checkpoint/export; **derived indexes are rebuildable**. Existing `lib/recovery.ts` 8 MiB JSON/20k-row limits, operation receipts, repeated full Note history and retained asset metadata require **measured complete backup AND successful older-checkpoint restore under a declared realistic cumulative supported workload**. Safe rejection for *beyond-limit* archives is a separate negative test and does **not** satisfy ordinary-use recoverability. Do not silently omit/prune authoritative history; prefer the least complex complete approach validated on the deployed runtime.
- UI/MCP current views return separate `readingRendition` and `catalogueRevision` and an eligible current exact destination; retained-reading views never silently overlay latest subject/index onto prior historical content.

The supporting [TECHNICAL-VALIDATION-20261022.md](TECHNICAL-VALIDATION-20261022.md) cites current official CodeMirror, React, D1/FTS5 and SOFA evidence, with confidence and limitations. Source-focused tests and API-level compatibility are required before wider UI changes; no extra paid AI inference.

## 9A. Cross-cutting navigation, Notes lifecycle, annotations and scalable Library

**Normative implementation companion:** [INTERACTION-AND-LIBRARY-RECONCILIATION.md](INTERACTION-AND-LIBRARY-RECONCILIATION.md) captures the owner's latest agreements from three annotated reviews. That document governs UI routing, source ownership and Library catalogue behaviour where earlier sketches suggested something different; the core Investigation work and provenance contracts above still govern learning data.

- **Your Work vs Notes**: left nav Your Work = comprehensive organiser; bottom persistent Notes bar "Manage Notes" = same organiser with explicit Notes-only URL tab (URL selection takes precedence over remembered tabs). Desktop bottom bar shows open Note tabs and a [+] menu. Mobile uses one floating restore launcher while minimised and compact tabs while open.
- **Zero-tab rule**: closing final Note tab may hide/minimise editor but **must not create a blank draft**. Opening, minimising, tab-closing, saving and Trash are distinct operations. Move a saved Note to recoverable Trash from the open Note's header/menu, not through buried controls. Pending editor/image work survives.
- **Your Work simplification**: remove duplicate New Note/eyebrow/intro and two text filters; one owner-wide server-backed search with compact kinds and optional advanced filters. Keep source/relationship bulk functions accessible in Organise/Advanced.
- **Annotation**: a saved item in Your Work opens its *exact anchored passage and current contextual preview* by default, not a separate article-sized annotation management page; unavailable source shows eligible user-own prose and actions without restricted quote. In-annotation Flag toggles the **underlying saved passage bookmark**, and a small glyph clarifies dotted Flag marks while preserving canonical UTF-16.
- **Library**: Subject areas (current area), Topics (current article), References (current Article.concepts) are facets of one authoritative catalogue, with paginated server search, current eligibility, multiple approved area memberships, topic-specific summaries and neutral ungrouped topics. A project-origin topic is not forced to live only in that project's area. The Library landing is an **index**, not every knowledge area expanded into a giant grid.
- **Chrome**: remove redundant visible V2/private/tagline/sidebar text and global New Investigation/new Library controls from browse surfaces, while keeping contextual creation, Help/About, privacy and navigation; restore exact verified V1 logo assets rather than guessing.

**Don't build parallel authorities:** Notes state, accepted relationships, query/indexing and learning-history summaries each need one canonical server/client owner. Library topic summarisation never manufactures new learning achievements, chat content or sources.

**Independent Pro review (read-only; 22 October 2026):** The targeted amendment decisions are recorded under existing normative contracts and acceptance gates. This document does not grant execution authority or require independent pre-implementation owner checkpoints. A later explicit single full Work/Sites implementation-and-release commission covers integrated coding, internal test/correct/review cycles, merge and deployment once release gates pass. Specific unpassed gates must be reported, not silently waived.

## 10. Security, resilience and migration requirements

Every new table/part/command must be owner-scoped and generation-fenced; every accepted mutation has stable idempotent operation identity, CAS/revision check, recoverable receipt and explicit provenance. Unsafe or failed writes may not create partial Developments/links/perspectives/activity.

- D1 migrations must be additive with indexes for owner/investigation/time, accepted relations, and current work projections. Backfill **none** of the user's existing Notes as progress and don't auto-rewrite the curl Investigation/Library material. Existing content remains intact. Old `learningShape` and retained reading renditions remain valid.
- Update explicit `lib/recovery.ts` table snapshots, encrypted complete export/import, rights intersection, generation activation, row/byte ceilings and missing-table compatibility for old archives. Provenance and text references must not leak through summaries after Source revocation/Trash.
- Keep new derived search indexes/projections rebuildable and non-authoritative. Avoid writing a personal Note revision on every server heartbeat solely to keep an index warm. Keep privacy/owner eligibility and source rights at *final exact rehydration*.
- Use original Cloudflare Worker/D1/R2/Sites; no new paid inference. External embeds load only following explicit interaction, never fetched through model tools. No remote HTML imports or untrusted Markdown execution.
- Avoid huge private corpus dumps, server logs of Note keystrokes or verbatim ChatGPT conversation exports. Do not connect to arbitrary chat threads; GPT only forwards context from its *current* owner-requested session.
- Avoid unnecessary changes to legacy Note families, current markdown editor state, private media transport, Source attribution and Bookmarks. Diff against prior functioning builds if regressions appear, but this is not a broad UI audit.

## 11. Measured performance and acceptance before authorisation

**Mechanics first:** the user should be able to discuss a genuine Kali observation with GPT, record one meaningful Investigation development, close/open Minamo, and see that development plus appropriately brief Journey/Home views **without any GPT-created personal Note**. GPT later retrieves a small faithful context including errors, revisions, source classifications and linked Note references.

**Notes:** a character typed into a new or existing Note is immediately recoverable locally; no Save button; ack reaches D1 promptly under ordinary connectivity while typing continues; same Note content becomes retrievable to GPT only when acknowledged. Error cases remain honest.

**Notes screenshots/tabs:** an immediately available phone writing canvas with compact tabs and active-tab pencil rename, a minimised floating restore button, and desktop paste/drag or mobile screenshot upload at the caret. Images remain compact inside the writing flow and correctly private/retained; text can be written above/below without obstruction. No visible desktop docking selector or mandatory blank preview on mobile. See [NOTES-MOBILE-AND-IMAGES.md](NOTES-MOBILE-AND-IMAGES.md) for the full interaction, permission and recovery test matrix.

**Media and references:** native meaningful diagram in the curl material; externally playable explicit video under consent and safe fallback; Library concept/command index populated from deliberately authored source. No arbitrary third-party embedding.

**Quality:** executed curl/HTTP examples tested only in a supported safe environment, never presented as the owner's Kali output; author/reviewer assess understanding and transferred usefulness. Real saved page desktop/390px/320px and physical Android caveats are separately labelled.

See `LEARNING-WORK-AND-CHECKPOINTS.md` for explicit checkpoint/MCP, Home, Journey stage, Investigation and Favourites rules; `ACCEPTANCE-AND-DECISIONS.md` for test IDs and the change register, `NOTES-MOBILE-AND-IMAGES.md` for Notes images, `INTERACTION-AND-LIBRARY-RECONCILIATION.md` for current user-facing interaction decisions, **`LIBRARY-DATA-AND-MCP-CONTRACT.md` for canonical reading/catalogue/MCP authority**, and `TECHNICAL-VALIDATION-20261022.md` for checked technical evidence. Future implementation may be undertaken in a single substantial Work/Sites commission once this planning PR is explicitly approved by the owner. Until then this document authorises **no runtime change**.

## 12. External media source references (implementation guidance)

- [MDN: iframe element, permissions, lazy loading and sandbox attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe). Browser-level testing is necessary; simply adding an attribute is not proof a provider player works securely.
- [YouTube Help: embedding and privacy-enhanced mode](https://support.google.com/youtube/answer/171780). Use a validated direct video ID and the documented privacy-enhanced embed host when user-activated playback is permitted.
- [Vimeo: player parameters](https://help.vimeo.com/hc/en-us/articles/12426260232977-About-Player-Parameters) and [Vimeo player cookies](https://help.vimeo.com/hc/en-us/articles/26080940921361-Vimeo-Player-Cookies/). Vimeo `dnt=1` reduces analytics but does not prevent every essential cookie or the browser from sending existing ones.

These are reference design inputs, **not** proof of permission to embed a particular video or of playback in the existing GPT Sites runtime.

