# Minamo V2 — MCP Authoring Reliability and Learning-Package Workflow

**Owner-directed engineering commission · 21 October 2026**

**Repository:** `frekland/minamo-v2` · **target:** existing owner-private V2 Site only · **this initial PR:** documentation-only commission, **not an implementation or release**.

## 0. Execution boundary — read first

This is a **new, self-contained commission** to improve how GPT/Work creates and connects rich Journeys and Library material through Minamo V2's shared domain/MCP interface. When handed to Work/Sites, implement **this commission only**. Do not resume issue #1's unrelated unfinished work, execute PR #12 or its merged semantic-retrieval brief, complete other V2 release tasks, rebuild the UI, or modify the original Minamo or `cyber-learning`. Existing work may be read **only** to establish interfaces and avoid regressions.

The initial PR deliberately changes no runtime files. Work must extend **this PR's branch**, `commission/mcp-authoring-workflow-20261021`, with the engineering implementation and focused tests, retaining the commission files. Do not merge, deploy, alter live learner records, or begin unrelated tasks as part of this handoff. If there is a genuine block, document precisely what is blocked rather than switching commissions.

Read `AGENTS.md`, `STATUS.md`, `docs/SOURCE-SYNCHRONISATION.md`, `docs/IMPLEMENTED-ARCHITECTURE.md` and only the affected code/tests identified below. If the repository changes while executing, re-check exact heads and integrate just relevant changes without pulling in unrelated work.

## 1. Reproduced owner-requested friction: the Sudoku authoring session

The V2 plugin successfully published a ten-stage Python Sudoku GUI Solver Journey, ten original Library articles and one Library area, then verified all twelve records and explicit links. It required **23 separate acknowledged writes**: twelve creates plus eleven additional relation updates. No permission failure, interrupted write or claimed execution occurred.

Six draft/preflight failures occurred:

1. `noncanonical_table`: create required manually duplicated TSV alongside structured headers/rows.
2. `invalid_reference` twice: a caller helper passed a description where an HTTPS URL belonged. Correct validation, but the error did not identify the exact offending block/field.
3. `linked_record_unavailable`: a new article linked to another not yet successfully created.
4. `invalid_destination`: a desired Journey-stage contextual link incorrectly used target `sectionId` without a target rendition. This exposed confusion between source-stage placement and target passage coordinates.
5. `noncanonical_diagram`: the Journey's flow graph metadata and parallel text did not match the exact canonical graph projection, resulting in a prose-only fallback.

**Interpretation:** strong validation, ownership fences and immutable rendition identity are assets. The problems are redundant author inputs, manual dependency ordering, poor contextual-link ergonomics, bulky command tooling, and insufficiently pinpointed diagnostics. The invalid URL values were an author-side mistake; correct validation must remain strict.

## 2. Actual code baseline and constraints

Consult exact **current** source rather than treating this as an invented redesign:

- `lib/domain.ts`: `validateRichPart` and `validateData` require exact table/diagram text on creation; `patchedData` already derives table TSV and diagram text for certain targeted patches. `admittedLinks` checks owned current target and pinned exact destination. `prepared`, `previewCommand`, `executeCommand`, `renditionFor` and the nonce/receipt/CAS/generation-guarded D1 statements are the current single-record backbone.
- `lib/contracts.ts`: `PassagePart`, `RecordData`, `ContentPatch`, `RecordLink`, `tableCanonicalText`, `canonicalReadingParts` and `CONTENT_CAPABILITIES`. `RecordLink.sectionId` / `partId` / `rendition` refer to the **destination**, not the source stage.
- `lib/diagrams.ts`: explicit `flow-v1` DAG codec, `flowDiagramError`, `diagramCanonicalText`. Preserve branch fidelity; do not infer structure from literal legacy diagram prose.
- `lib/reader-table-map.ts`: exact TSV cell-to-UTF-16 mapping. Preserve this mapping.
- `lib/domain-handler.ts`: MCP `domainTools` and `invoke`, shared HTTP endpoints, `partSchema` currently requiring `text`, compact summary, error adapter and authenticated owner/generation checks.
- `lib/reading-links.ts` / `app/reader.tsx` / `app/workspace.tsx`: family-qualified record links and current reading/authoring presentation. Reuse existing reader and local drafts rather than introducing a parallel UI.
- `lib/generations.ts`, `lib/assets.ts` / `lib/media.ts` and source-permission logic are security dependencies, not an invitation to reopen recovery or file-upload work.
- Tests: `tests/domain-rich-integration.test.mjs`, `tests/domain-diagrams.test.mjs`, `tests/domain-targeted-patch.test.mjs`, `tests/diagrams.test.mjs`, `tests/security-rich-content.test.mjs`, `tests/security-boundaries.test.mjs`, `tests/gpt-context.test.mjs` and the actual Worker/HTTP/MCP integration tests.

There are no open PRs in the current GitHub baseline, but `STATUS.md` explicitly says **do not execute PR #12**. Existing PR #12 documentation stays untouched. The active broad issue #1 remains outside this commission.

## 3. Required changes

### A. One canonical compiler for rich authored blocks (highest priority)

**Goal:** creation, insertion, editing and preview should agree about canonical text without requiring authors to manually reproduce derivable representations.

- Accept `text` **omitted** when structured metadata is sufficient: `table` with headers/rows; declared `diagram` with `flow-v1` nodes/edges; and (where safe and supported by the existing codec) owned `image` / `media` blocks with complete authorised description/alt metadata. Materialise `part.text` on the **server** with the existing canonical functions before ordinary admission, hashing, history and reading.
- Distinguish missing text from explicitly provided text. If text is supplied and disagrees with metadata, **reject** it with a precise `noncanonical_*` diagnostic. Never quietly overwrite an explicit mismatch. Invalid table widths/cells, cycles, unknown graph endpoints and unsupported codecs must still reject.
- Apply the same compiler to record `create`, `update` replacement sections, `insertBlock` and `patchBlock` in both HTTP and MCP. Keep the current patch behaviour and support old stored canonical text byte-for-byte.
- Do not generate text for arbitrary paragraphs/code/callouts or guess the semantics of legacy diagram prose. Do not alter explicit excerpt text, change admission rights, interpret image/media bytes, or silently repair malformed content.
- **Critically:** stored resulting `part.text`, `canonicalReadingParts`, rendition hashes, reader table mapping, UTF-16 selection/capture, history and exact retained reads must remain compatible. No batch migration or rewriting historical records.

Make `lib/contracts.ts` types and `lib/domain-handler.ts` MCP schemas accurately describe author-input optional text while continuing to guarantee fully canonical persisted `PassagePart`. Keep the schema narrow instead of making all text optional.

### B. Transactional authoring of a related learning package

**Goal:** a coherent Journey + Library articles + area + explicit relationships can be commissioned as **one deliberate, bounded operation**, instead of 23 dependent writes.

- Introduce a **purpose-scoped, owner-directed package preview and apply** over the same domain and authentication as the existing command API. Prefer discoverable separate MCP operations such as `preview_minamo_authoring_package` and `apply_minamo_authoring_package` plus matching HTTP routes over adding a huge union to the legacy command. Preserve existing tools and clients.
- The package manifest should supply a single immutable `operationId`, exact `expectedGeneration`, an ordered or keyed list of bounded record mutations with `family`, `id`, `action` (create or targeted update), each exact `expectedRev` (0 on creation), and declared links between record keys or existing family/IDs. Restrict the first package authoring surface to ordinary original Journey/Article/Area learning content, optionally Investigation where it uses the same rules. No flags, Runs, synthetic achievements, Source excerpt attestation, new asset uploads, deletion, restore or unrelated record mutation.
- Set explicit sustainable bounds (initial design target **up to 16 records, up to 64 declared relationships, within existing 220 KB request and per-record budgets**). Measure realistic SQLite/Worker limits and document justified adjustments. The Sudoku 12-record case is a required fixture.
- Prepare **all** records and structured blocks first; compute prospective renditions, resolve within-package targets, check external reference admission and exact target revisions, validate all directions and dependencies; only then commit. In current code `renditionFor` is based on reading content, not `links`, so internal target renditions can be computed before committing. Verify that invariant rather than assuming it through later refactors.
- An invalid record/link, wrong revision, stale generation, revoked/unavailable reference or write race must result in **no partial package records, links, history or activity**. Prove transaction semantics with actual D1 tests; do not just loop `executeCommand` or rely on a conditional no-op that permits other package rows to save.
- One durable package receipt must permit retry/recovery with the **same** payload and operation ID and reject reused IDs with changed payload. Return bounded record refs, revisions and canonical links, not a huge body dump by default. Keep `read_minamo_operation` meaningful for package receipts.
- Keep explicit owner direction and actor/evidence provenance. Never infer activity, execution, learning completion or source reuse permissions from content authoring.
- An author should be able to declare **both** Journey→article and article→Journey/area connections within one manifest, without temporarily creating orphan records or manually following up with eleven writes. No implicit backlink mutation: every affected record/relation must be explicitly selected and revision-guarded.

### C. Contextual relationships without abusing destination coordinates

**Goal:** place a purposeful link **at a Journey stage** while separately targeting a specific Article/section/part.

- Differentiate (1) the **source location** within the owning record, e.g. Journey `stage03`, from (2) the **target destination**, e.g. an Article `family/id` and optional target `sectionId/partId/rendition`. Current `RecordLink.sectionId` describes only the latter; do **not** reinterpret old data.
- Introduce a backward-compatible source-context field or a narrowly scoped relationship object with `from` and `to`. The implementation may choose the smallest maintainable contract, but must show that source and destination identity are unambiguous to authoring and readers.
- For a destination **inside the new package**, derive and pin its canonical rendition from the prepared proposed record; do not require the caller to know a rendition before creation. For existing targets, retain current permission/revision/current-edition rules. Rejected stale/unavailable targets must not degrade silently to general links.
- Render contextual links accessibly at the intended section in current reading UI, including phone/keyboard navigation, without changing the visual design or auto-inventing relations.
- For source-section removal or editing, define a tested policy to prevent orphaned or silently relocated contextual links. Preserve existing record-level links, historic rendition deep links and existing `RecordLink` semantics.

### D. Field-specific, safe diagnostics and compact previews

- Return structured, bounded error metadata for rich validation and packages, e.g. `code`, `message`, `path` such as `records[2].data.sections[1].parts[3].reference.url`, and a stable record key where relevant. Distinguish client shape errors, exact-target conflicts, owner eligibility, permission/floor rejection, and generation/CAS issues.
- Keep current status codes/error codes compatible. Do not include private prose, source excerpts, signed URLs, tokens or stored personal content in errors, logs, telemetry or unauthorised responses. Mask or omit sensitive values; small field path + format expectation is enough.
- By default, preview returns a **compact**, read-only result: validity, bounded ordered diagnostics, canonicalised block summaries, prospective record/section/link counts, unresolved dependencies, and predicted identity/renditions where safe. An explicit bounded detail option may return the compiled proposed content for an authenticated owner.
- A rejected preview must not allocate receipts, mutate D1/R2 or cause any learning records to appear. Apply must repeat authoritative checks; preview is **not** an authorisation grant or reservation.

### E. Discoverable, smaller authoring tools and coverage checks

- Offer a focused authoring surface whose tool descriptions/schema do not require a GPT client to ingest every unrelated bookmark/recovery/Run/source/asset operation. Preserve compatibility for the existing `apply_minamo_command` and installed clients. Update `CONTENT_CAPABILITIES` truthfully, including package limits and canonical-text behaviour.
- Before creating content, support a **bounded, targeted existing-coverage check** using explicit topic queries/family filters and return concise existing record identities/links. Reuse `queryRecords` where possible; if a new entrypoint is needed, keep it literal/deterministic and purpose-scoped. Do **not** add vector search, Transformers.js, embeddings, semantic equivalence inference or execute PR #12.
- Do not imply the currently installed GPT plugin has a newer tool catalogue solely because source files or local `tools/list` changed. Require actual installed-client confirmation *only after authorised publication*; otherwise state the limitation.

### F. Real rendered review before publishing a large package

- Add an **owner-private, read-only presentation preview** for proposed Journey/Article/Area content using the existing safe renderer and canonical compiled blocks (tables, graphs, references, code and contextual links).
- Preview does not publish drafts to ordinary collections, does not construct public share URLs, does not fetch third-party material, does not grant Source permission and does not fake a retained revision. If full previews cannot safely dereference all incoming relations before commit, label those links as proposed and show their exact target identity.
- Cover both desktop and narrow mobile layouts, keyboard navigation, clear code/table legibility and diagram branch fidelity. Preserve current selection/annotation semantics for committed readings; do not fabricate a persistent passage anchor on uncommitted preview content.
- Avoid introducing another permanent authoring UI framework. A minimal preview within existing reading/authoring surfaces is preferable.

## 4. Required technical and security behaviour

- Use **one shared domain implementation** for HTTP and MCP. Keep the owner-private Site identity and namespace, purpose scope, operation fences, immutable hash/receipt, revision CAS, permission floors, current Source eligibility, title/body/text bounds and asset-admission limits.
- No background or autonomous authoring; no auto-run from Flags, annotations, saved readings, search results or navigation. No fabricated Run evidence, tests, achievements or Kali activity.
- Exact authored text and reading identity require UTF-16 correctness (including surrogate pairs), stable section/part IDs, preserved old renditions and safe table-cell offsets. Do not substitute approximate section links for exact links or ignore changed destination renditions.
- Only explicitly original GPT-authored explanations and link-only external documentation are in scope for tests; no unlicensed source excerpts, real private learner records, external network imports or identity bypass.
- All integration fixtures must be synthetic/local, using actual domain/Miniflare D1 and Worker/MCP routes where applicable. Production owner data is read-only for independent verification unless the owner separately grants a specific write test. Never delete or reset private user data for this commission.
- No new paid provider, model, semantic index or cross-project integration. Do not refactor unrelated features merely because they are nearby.

## 5. Acceptance matrix — all required

**A01** Create a structured table with headers/rows and **no text** through both HTTP and current server MCP path; read canonical TSV; validate exact display cell→UTF-16 offsets. Explicit contradictory text still rejects with located diagnostics.

**A02** Create an explicit branching `flow-v1` diagram **without text**; verify deterministic canonical nodes+edges, every labelled/disconnected branch, mobile rendering and an exact retained selection. Explicit mismatched text/cycle/unknown endpoint rejects without writes.

**A03** Insert/replace/edit canonical blocks and prove existing `patchBlock` derivation still works. Legacy literal diagrams, unchanged article rendition hashes, old retained selections and old GPT return links still work.

**A04** A single owner-scoped manifest creates the **twelve-record Sudoku-shaped synthetic package** (one Journey, one area, ten articles) with ten stage→article links and declared reverse references. Verify all links and no follow-up mutation is needed.

**A05** Package preview returns a compact valid plan with actual prospective rendition IDs but **no DB writes**. An explicitly invalid table/URL/cycle/relation returns a precise located error and no objects.

**A06** Bad member #11, stale target CAS, wrong generation, deleted/revoked target, injected duplicate ID, and forced transaction failure each leave **zero partially persisted** new package records/revisions/activity/relations; failure remains recoverable and is not misreported as committed.

**A07** Same operation ID/same payload replay returns one coherent committed receipt with no duplicate activity. Same ID/changed payload rejects. Uncertain response is resolvable via operation status; package refs available with proper owner isolation.

**A08** Cross-owner package target/reference reads or writes are denied with no data leak. Current/revoked Source eligibility, existing immutable excerpt rules, image/media rights and generation isolation remain unchanged.

**A09** A Journey stage link displays **in its own stage**, and navigates to the intended exact Article/section/part. Source placement and destination rendition remain distinct. Tests cover edits/removal and archived retained renditions.

**A10** An existing `apply_minamo_command` writer continues to accept old valid schemas; legacy clients are not broken by optional text or added authoring operations. Current server `tools/list` advertises only implemented features.

**A11** A real user-style authoring request can discover existing literal coverage, preview a package, commit it, open the reader preview/committed articles and recover the receipt without unnecessary large responses. Mark synthetic evidence honestly.

**A12** Actual desktop/narrow-phone review checks the proposed rendered package and committed navigation using normal accessible controls. No decorative mockups presented as working UX.

**A13** Typecheck, build and full test suite pass. New tests explicitly cover HTTP + MCP paths, actual D1 transaction failure behaviour, stale generations, source/reference permissions and retention. Report counts and commands, not guessed success.

## 6. Implementation approach and delivery

1. **Establish exact starting commit** and verify no concurrent change to affected paths. Read focused code and existing regression tests. Record baseline. Do not restart discovery or another audit.
2. Implement the shared canonical author-input compiler and path-aware error plumbing first. Preserve existing output models and test current storage/reading.
3. Implement typed package preview, internal dependency/rendition resolution and truly atomic package commit with bounded idempotent receipt. If D1 cannot guarantee the intended all-or-none semantics with the chosen SQL strategy, redesign before committing; do not call a loop a transaction.
4. Implement source-placed contextual links and reader presentation using the least disruptive backward-compatible model.
5. Add compact authoring discovery, rendered draft preview, and cross-surface tests. Validate a twelve-record synthetic package end-to-end.
6. Run `pnpm run typecheck`, `pnpm run build` and `pnpm test`, plus targeted browser/Worker/HTTP/MCP checks. Record real outcomes, known limitations and tested versions.
7. Commit **only this commission's implementation** to the existing PR branch, with the focused evidence report under `docs/plugin-authoring/`. Follow `docs/SOURCE-SYNCHRONISATION.md` for native Sites and GitHub tree correspondence **when relevant**. Use expected-head checks; do not force-update refs, blindly overwrite concurrent work or fabricate matching trees.
8. **Stop at a reviewable implementation PR.** No automatic merge, production deployment, new installed-plugin claims, extra V2 features or unrelated issue closure. Request a separate release instruction if publication is needed.

Avoid many noisy per-file status updates. Report meaningful checkpoints, actual test evidence, change summary, remaining blockers and direct PR link.

## 7. Explicit exclusions

Do **not** implement `docs/semantic-retrieval/` or PR #12; resume media/recovery/Source imports; complete issue #1 at large; run independent UI audits; change the navigation/theme/Notes/Flags/annotations; modify original Minamo, `cyber-learning` or any non-V2 Site; invent learner evidence; introduce external models/services; merge or deploy without separate owner direction. Any unrelated failure discovered may be logged concisely as a follow-up **without executing the follow-up**.

