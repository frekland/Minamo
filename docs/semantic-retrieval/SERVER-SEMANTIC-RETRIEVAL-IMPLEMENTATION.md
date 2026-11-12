# Minamo V2 — Server-side semantic retrieval and trustworthy knowledge connections

**Implementation-ready, documentation-only continuation · 21 October 2026**  
**Repository:** frekland/minamo-v2 · **Active commission:** issue #1  
**Reviewed checkpoint:** V9, GitHub main merge 241236c4f2acaa17c8ff80daf3cf1996eb7830fd; native Site/GitHub common tree 4f50d09b6c32e1b5d7686a84957a57e5b5c53505. V8 is the retained interaction baseline, not the newest release.  
**Purpose:** make existing Minamo content easier to find by meaning, including from GPT when the Site is closed, while retaining exact retrieval, explicit relations, privacy, existing reading/Notes UX and recovery.

> This is a design and engineering handoff, **not an applied feature, resource provision or deployment**. Latest Site-native code, main, migrations, bindings and release receipt must be reconciled at implementation time. Do not reset the current build or displace its ongoing protected archive/export/recovery work. The original Minamo and cyber-learning remain untouched.

## 1. Owner decision and intended experience

The owner rejected browser-only embeddings because GPT must benefit when Minamo is closed. **Build a shared server-accessible semantic retrieval capability first.** Transformers.js is not a required dependency. A browser-side model or React Flow is neither required nor a substitute for the server path.

For a question such as “Why do Linux sockets behave like files?”, Minamo should provide, together and without duplicated explanations:

1. **Exact canonical definitions:** an exact alias/term such as “file descriptor”, preserving case-sensitive code and flags.
2. **Authored links:** existing purpose-labelled relations such as “This Investigation applies the socket explanation”.
3. **Semantic suggestions:** other eligible passages that discuss related concepts with different wording, explicitly identified as similarity suggestions rather than asserted conceptual equivalence.
4. **Precise return paths:** the actual eligible record/section/part, with recorded rendition identity where appropriate. Never relocate a pinned Flag or Annotation by fuzzy match.
5. **One retrieval service for Web and MCP:** GPT can invoke it when the web application is closed, subject to the same Site-authenticated owner and source-use checks.

All ordinary search must remain useful if the model, index or binding is unavailable. Search, opening a passage, accepting a suggestion and writing an authored relation are distinct acts. Searching is not editing; similarity is not learning achievement.

## 2. Actual V8 integration map — reuse, do not replace

| Current V2 owner | Verified role | Additive continuation |
|---|---|---|
| lib/contracts.ts | WorkspaceRecord, Article ConceptEntry, RecordLink with relation/reason/section/part/rendition, current content capabilities | Add bounded semantic result/options DTOs, NOT new canonical record families or authored relations |
| lib/domain.ts | queryRecords literal title/body/section/code/output search; queryConcepts exact term/alias; readContext, owner predicates, source and asset eligibility, D1 CAS/receipts | Add private semantic retrieval helpers and final D1-authoritative candidate rehydration; maintain literal query and concept precedence |
| lib/generations.ts, lib/recovery.ts and db/schema.ts | V9 active-generation namespace selection, generation guards and private restore checkpoints covering seven canonical product tables | Scope every semantic read, job, vector and index ledger entry to current generation; treat all vector state as derived and rebuild it after restore; never quietly change checkpoint completeness claims |
| lib/domain-handler.ts | Shared HTTP and eight MCP tools including query_minamo_records, get_minamo_context | Extend reads compatibly with opt-in hybrid mode/results; keep older parameter sets and existing tool names functional |
| app/workspace.tsx | Global search, concept matches, paged results, refresh/navigation | Enhance existing results minimally, without a new search page or main navigation |
| app/concepts.tsx | Exact, case-aware Article term/alias matches with ambiguity and pinned destinations | Keep exact matching authoritative; never fold command flags or infer aliases from vector similarity |
| app/learning-links.tsx | Purposeful authored relations, backlinks, section-level destinations | Present authored relations as distinct from “Related by meaning” candidates; never silently append candidates to RecordLink |
| app/reader.tsx, lib/reading-links.ts | Canonical retained renditions and UTF-16 part mapping, Flag/Annotate, deep links | Use exact source identities in candidates; do not make vector offsets or rewritten snippets canonical coordinates |
| lib/gpt-context.ts, app/gpt-handoff.tsx | Owner-selected, bounded GPT handoff using stable MCP arguments | Reuse existing context; optionally add semantic candidates via server once installed tool schema is verified; no auto-handoff/write |
| lib/assets.ts, source admission/projection | Authenticated images, source excerpts, current-rights redaction and history | Exclude prohibited/external raw text from indexing; revocation must invalidate derived vectors and revalidate each hit |
| app/notes-panel.tsx, Note revision/recovery modules | V8 rich Notes with tabs, four-way docking, drafts, CAS/retry | No re-render, autosave, draft, selection or window-management changes required by semantic retrieval |
| worker/index.ts and cloudflare-env.d.ts | V2 Worker entry routing and D1/R2 bindings, no AI/Vectorize binding declared at reviewed main | Investigate actual Sites-managed AI/Vectorize binding capability before promising an implementation |

The V9 issue receipt reports 391 passing tests and a private deployed checkpoint/restore continuation; V8 remains the regression baseline for Flag/Annotate and Notes. V9 added active-generation switching, root-scoped permission floors and recovery fences. These are baseline receipts, not proof of this proposed capability. See STATUS.md, AGENTS.md, docs/SOURCE-SYNCHRONISATION.md, docs/RELEASE-INTERACTION-RECOVERY-2026-10-21.md and latest issue #1 release comment.

## 3. Architecture selection — server AI + vector index + canonical D1

**Preferred V2-only implementation:** Cloudflare Workers AI + Cloudflare Vectorize, invoked from the same authenticated V2 Worker/domain used by HTTP and MCP.

- **D1 stays authoritative:** content, owner, lifecycle, current source eligibility, revisions, authored relationships and exact reading text are all owned by existing V2 D1/domain logic. Vectorize is an expendable derived index, not a record store or access authority.
- **Workers AI generates embeddings:** candidate model @cf/baai/bge-small-en-v1.5, 384 dimensions, maximum 512 input tokens. Use the same explicitly pinned model, preprocessing and pooling mode for all indexed passages and query vectors; do not mix incompatible embedding generations in one index.
- **Vectorize stores only numeric vectors and minimal opaque lookup metadata.** Avoid record titles, quotes, Note bodies, imported source passages, personal names, URLs or raw source excerpts in vector metadata. Embeddings themselves are private derived data and must be deletion-managed.
- **Owner and generation scoping:** require the verified authenticated Site owner and V9 active-generation resolution used by existing HTTP/MCP reads. Partition vectors by opaque root-owner + active-generation + model version, reflecting the resolved D1 namespace. Never use a stale generation token as authority. Vectorize namespaces are search partitions, **not a security boundary**. Every candidate must pass a fresh current-generation D1 owner/record/source-permission/rendition/part eligibility check before any content, title, score or metadata is returned; honour root-scoped permanent permission floors across restores.
- **Failures degrade gracefully:** unavailable AI/index, quota exhaustion, timeout or stale vectors must fall back to literal search + exact concepts + authored relationships. No false empty results and no failed Note save because index maintenance was unavailable.
- **No browser-only dependency:** no client-side model download, IndexedDB knowledge authority or requirement to keep the Minamo tab open. Do not adopt Transformers.js unless a later distinct need justifies it.

**Deployment capability gate (non-negotiable):** the reviewed source currently defines DB/R2 in cloudflare-env.d.ts and routes via Sites-managed Vinext. Cloudflare's documentation shows standard Workers AI / Vectorize bindings; it does NOT prove that this ChatGPT Sites project can provision and bind them. Verify supported Sites-native configuration, environment bindings, costs, permissions, private access, preview/production isolation, CI and source-tree transfer first. Never insert API keys into Git or route around unsupported Sites constraints using an unapproved external Worker, third Site or paid service. If bindings cannot be provisioned, document the blocker and a bounded, explicitly approved server-side alternative; do not silently ship browser-only inference as though it fulfilled the owner requirement.

### Reviewed official API contract (verify at implementation)

Cloudflare's published Worker examples use an AI binding under env.AI and an embedding call shaped as:

    const embeddings = await env.AI.run("@cf/baai/bge-small-en-v1.5", {
      text: inputTexts
    });

For Vectorize, the Worker binding exposes upsert, query and deleteByIds; queries can use a namespace, topK, metadata filters and returnMetadata. Creation uses an index with 384 dimensions and cosine metric for this model. Vectorize mutations are asynchronous/eventually consistent. IDs are limited to 64 bytes, so hash a stable internal opaque identity rather than packing full record/rendition strings into vector IDs. Specify namespaces and stable ID/version strategy before backfill. Cloudflare's model page also distinguishes mean vs cls pooling; pin and benchmark one choice, and treat a changed pooling mode like a model-version migration.

Reference documentation:
- https://developers.cloudflare.com/workers-ai/models/bge-small-en-v1.5/
- https://developers.cloudflare.com/workers-ai/configuration/bindings/
- https://developers.cloudflare.com/vectorize/reference/client-api/
- https://developers.cloudflare.com/vectorize/reference/metadata-filtering/
- https://developers.cloudflare.com/vectorize/platform/limits/
- https://developers.cloudflare.com/vectorize/platform/pricing/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/platform/data-usage/

These APIs and binding patterns were cross-checked against up-to-date Context7 Cloudflare Workers AI and Vectorize documentation on 21 October 2026. They are an implementation direction, not proof of a bound V2 resource.

## 4. Text projection, chunk identity and coverage

Create deterministic **eligible indexing passages** from existing shared canonical reading projections, not from rendered DOM, scraped browser text or a second Markdown copy. Do not re-run old rendition algorithms or change user-visible selection coordinates to accommodate embeddings.

Recommended indexing unit: one existing record section/part at a time; break long eligible parts into bounded contiguous UTF-16 ranges within their canonical text. Preserve both the exact original target (family, record ID, section ID, part ID, rendition, offsets where applicable) and an independent versioned embedding-input string. The latter may include a bounded contextual heading prefix but **never becomes the exact citation**. Match offsets are never fabricated from embedding chunks. Long text must be bounded by actual model token limits, not assumed characters-per-token.

A D1 semantic manifest/ledger should track at least:
- resolved owner/root scope, active generation ID + revision/namespace, opaque vector ID, model/pooling/preprocess version and stable chunk identity;
- family, record ID, source record revision and canonical rendition; section/part and exact source range;
- projection/content digest and source/asset dependency eligibility;
- desired status (index, refresh, withdrawn), last verified index status, retry/backoff and timestamps;
- no duplicate copy of private passage text where existing record/rendition storage suffices.

Use separate V2-only migrations, not table creation from SSR/GET. Index vectors must be rebuildable from currently eligible D1 data. **V9 recovery snapshots currently cover seven product tables, not auxiliary semantic state.** The semantic ledger is disposable derived infrastructure, explicitly excluded from product checkpoints and portable export; after activating a historical generation, reindex that generation from its eligible canonical records. Do not include it accidentally in existing manifest integrity counts, or imply the semantic index is independently backed up. Retained reading history stays governed by current source rights; old pinned text is not automatically an independent searchable current article.

**Initial corpus:** eligible original owner-authored Library Article sections, canonical concept definitions, and eligible Journey/Investigation original explanatory prose. Evaluate exact code/Run output with strong lexical weighting rather than relying on embeddings alone. Extend, after privacy/evaluation review, to owner-selected saved Notes and Annotation *own prose* and other suitable learning material. Do not index unsaved Notes drafts, pasted secrets, Flags as instructions, raw image pixels, third-party link-only pages, admitted excerpts without confirmed embedding/derivative-use rights, revoked assets or currently forbidden Source content. Never treat a Note or source claim as observed execution evidence.

The owner wants semantic discovery across personal learning records: the end-state should include eligible private personal work under a clear indexing scope, not permanently limit discovery to articles. Indexing additional sensitive families must be intentional and visible rather than silently broadening permissions in a background migration.

## 5. Maintaining the derived index reliably

Record writes remain identical: one existing guarded D1 command, receipt, CAS, revision and recovery path. **Do not embed or upsert synchronously inside the acknowledged save transaction** and never make the record's “Saved” state depend on Vectorize.

Use a small internal derivative-index work ledger/outbox tied atomically to relevant canonical changes, or an equivalent proven durable reconciliation mechanism, distinct from learner commands/activity. After commit, a bounded worker/job rebuilds the affected vectors. Use idempotent stable IDs, exact projection/version checks, retry/backoff and a bounded owner-scoped repair sweep. Avoid another generic mutation queue or automated editorial maintenance.

For a change or removal:
1. Mark previously indexed candidate identities ineligible in the **authoritative D1 query path immediately** on change/Trash/revocation/permission withdrawal.
2. Enqueue asynchronous vector delete/reindex using the same derived-index ledger, with lifecycle status retained until reconciled; Vectorize deletion is not instantaneous.
3. Before and after an upsert, re-read current owner/source/version eligibility so a late job cannot be treated as current; stale late upserts are removed on subsequent reconciliation.
4. At query time resolve candidates to current eligible exact content. A stale vector may exist physically during eventual consistency, **but must reveal no restricted text, title, provenance or existence through API/MCP responses**.
5. Make model upgrades and reindexing reversible: parallel versioned index/namespaces, compare coverage, switch reads, then retire old index only after rights and rollback verification. Index deletion/rebuild must never touch canonical records or user Notes.
6. On **V9 checkpoint activation or generation switch**, immediately reject search hits and maintenance jobs from the previous active generation; do not activate a prior index snapshot alongside a restored canonical workspace. Give the new generation an isolated vector namespace and rebuild eligible vectors from its restored D1 data with current root-level source/image restrictions. Recheck generation fencing before publishing any asynchronous upsert or candidate read. Old generation vectors may be cleaned up asynchronously, but must never surface in current read/MCP results.

Source-revocation, genuine vs synthetic content and image metadata checks must reuse existing domain policy; generic vector metadata filters alone do not implement that policy. Audit query logs to avoid persisting private query/passage text.

## 6. Hybrid result selection and authored versus suggested relationships

Start with existing literal query and concept matches. In parallel, embed the bounded query and retrieve a limited number of vector candidate IDs. Rehydrate and permission-filter first; then deduplicate by family/record/section/part/rendition, preserve target coordinates, and rank with an explainable rank-fusion approach (such as reciprocal-rank fusion). Do **not** sum incomparable cosine scores and keyword scores.

Proposed ranking and display rules:
- Exact Article concept/command/alias matches remain first-class and disambiguated. Case, flags, symbols and environment have precedence over embedding similarity.
- Exact literal matches remain visible even when the model/index is unavailable.
- Authored relationships remain explicit assertions with the existing relation type and reason. Treat them separately from search ranking.
- Semantic candidates are labelled “Related by meaning — suggested”, not “explains”, “prerequisite”, “you learned”, “confirmed source” or “GPT verified”.
- A suggestion is only a navigation candidate until a user or separately authorised GPT editorial action uses existing targeted upsertRelation or other canonical commands. Respect expected revision, immutable operation ID, CAS and source checks. No automatic relationship write, Flag, annotation, knowledge article, activity or learner-achievement change.
- Do not create an auto-recommendation feed, background GPT reasoning loop, compulsory graph, streaks, new primary nav item or alternate Library store.

The UI improvement should be quiet: a bounded, collapsible “Related by meaning” group inside existing search results and, only where actually relevant, below/alongside existing authored LearningConnections. A suggestion can show a short server-eligible text preview and exact destination; do not display a speculative explanatory “why” that the embedding model did not actually supply. Keep the same reader-first charcoal/blue/cyan theme, responsive layouts, existing Ctrl+K search, scroll/return, Notes docks/tabs, modal behaviour and direct Flag/Annotate toolbar. Disable or hide semantic suggestions cleanly when unavailable; never block core reading on inference.

## 7. Shared Web and MCP read contracts

Extend the existing **read** pipeline rather than creating a second search authority.

- Preserve the literal default behaviour and bounded pagination of /api/query and query_minamo_records for existing callers; consider explicit optional mode = literal | hybrid, with literal the compatibility default until clients are refreshed.
- Add a response sibling such as semanticMatches with bounded entries containing owner-safe opaque target, canonical section/part/rendition, grounded score/rank metadata internal to server, link, matchKind = semantic-suggestion, and explicit content/currentness or omission status. The exact types/names must be reconciled with the then-current contracts.ts. Never return raw embedding vectors, forbidden snippets or private data in public URLs.
- The Web UI may choose hybrid by default only after performance/accessibility/relevance acceptance, with a user-visible fallback. Literal search failure and semantic failure are distinguishable.
- Expose semantic retrieval to **the same authenticated MCP service** so GPT can search when Minamo is closed. If a new optional query argument is needed, publish the additive schema and verify it from a freshly connected **actual client**; existing eight tools and previously installed argument shapes keep working.
- get_minamo_context continues to return only eligible exact material and authored links plus explicitly selected related context. If suggested context is offered, keep it bounded and optional; require a subsequent exact read before GPT quotes or discusses the passage as inspected. No silent relatedRefs expansion or whole-corpus handoff.
- MCP search and semantic read never become implicit permission to make Library edits. Flags and Annotations remain context, not commands; preserve actor/source/observed-versus-illustrative distinctions.

GPT can use semantic search without a browser session because the Worker carries the service bindings, not the React page. Retrieval must be no more privileged in MCP than in HTTP.

## 8. Prioritised implementation inside active commission #1

This is a **compatible future increment** within the ongoing build, not a new overhaul, audit or restart:

**Phase A — verify service and privacy feasibility, without changing production behaviour**
- Reconcile current Sites-native and GitHub source/release receipt, current main and work in progress. Check AI and Vectorize availability through supported Sites project binding/provisioning mechanisms.
- Check V2 owner-private policy, model terms, Cloudflare Workers AI data processing, actual billing/quota and whether owner-selected content may be sent for embedding. Workers AI says standard inference does not retain content for longer than necessary and does not train on customer content; Vectorize is a deliberate storage feature. That is not equivalent to saying embeddings contain no private information.
- Select a small, explicit non-sensitive synthetic benchmark corpus first, confirm exact model dimensions/token/pooling and expected total costs. If any binding/permission gate fails, leave the feature disabled and document exactly what is unsupported.

**Phase B — server foundation and benchmark**
- Add migration-managed owner-scoped derivative index manifest/ledger, projection/chunk tests, no data duplication, deterministic IDs, idempotent maintenance/backfill on synthetic content.
- Verify storage and model errors are non-fatal to ordinary V2 commands and reads. Check active-generation token/namespace against V9 restore activation in real D1 tests. Backfill eligible genuine owner records only when scope and permissions have been established; never import original Minamo/cyber-learning corpora.
- Test exact alias and semantic tasks with real computing examples. Measure utility rather than shipping because the vector API works.

**Phase C — shared read path**
- Add guarded, bounded server-side hybrid retrieval and response typing in domain.ts/domain-handler.ts. Test D1 candidate eligibility and readContext independently of Vectorize filters.
- Verify with the actual installed fresh MCP client while Minamo web app is closed and with HTTP read. Keep literal-only unchanged for older clients.

**Phase D — minimal UX and relationship promotion**
- Add optional bounded suggestions in existing results and contextual authored-links surface without changing reading action toolbar, Notes or global layout.
- Add deliberate “link this context” route through existing targeted relation patches if no equivalent current affordance exists. No auto-write.

**Phase E — rollout, regression and repair**
- Feature-flag server path and UI independently, record model/index version and health. Keep instant rollback to literal search with no migrations that remove original data.
- Extend corpus families only after rights/privacy and quality acceptance, preserving genuine learning attribution. Index reconciliation and deletion monitoring must remain repairable without owner editing ceremonies.

V9 private checkpoint/generation-safe restore is already implemented and must be preserved. Remaining independently downloadable/importable recovery, source rights and any later protected recovery fixes remain higher priority where failure could lose existing work. Co-schedule this addition with those workstreams; do not overwrite concurrent fixes or claim they are already finished.

## 9. Required acceptance and adversarial tests

| ID | Required evidence before enabling broadly |
|---|---|
| SR-01 | Existing literal search, exact concept aliases and pagination produce the same eligible results with feature disabled/unavailable. |
| SR-02 | A paraphrase that literal search misses retrieves the expected eligible article or Investigation part; exact term/flag/command mismatches are not presented as equivalent. |
| SR-03 | Semantic search from the **actual connected MCP client** succeeds while the Minamo website is closed, with no browser-generated vector dependency. |
| SR-04 | D1 owner/permission/trash/source eligibility protects every candidate. Synthetic second-owner and same-ID different-family tests leak no title, snippet, score/existence or embedding metadata. |
| SR-05 | Revoked source/excerpt or stopped image remains invisible through semantic search during delete propagation, stale upsert and retry. Re-adding a stale vector does not restore access. |
| SR-06 | UTF-16, Markdown projections, code, table parts, retained edition links and existing Flag/Annotation coordinates are byte-for-byte unchanged by indexing. No vector-generated fuzzy retargeting. |
| SR-07 | Saving Notes, flags, source patches, rich content, trash/restore, retries/CAS/uncertain receipts remains correct when AI/Vectorize are down, slow or quota-limited. |
| SR-08 | Suggestions never mutate RecordLinks. Confirmed relation creation uses the same targeted guarded domain operation and renders with its explicit reason. |
| SR-09 | Search results are bounded, deduplicated and explainable; no raw private content in logs/URLs/index metadata. Mobile/keyboard/screen-reader access does not regress. |
| SR-10 | Model/version and **V9 recovery generation changes** cannot mix embeddings; stale pre-activation jobs cannot write into/read from active generation; index rebuild after restore respects permanent permission floors without modifying canonical records. |
| SR-11 | A blinded set of at least 20 realistic technical questions measures literal vs semantic vs hybrid relevance, false association rate, latency, and desktop/Android search experience. |
| SR-12 | Hosted V2-only deployment, binding identity, owner-only audience, current rights, separate private index, cost/usage cap and explicit disable/fallback are evidenced. Synthetic tests and production access claims are clearly distinguished. |

After implementing, run existing full regression suites, pnpm run typecheck, pnpm run build and pnpm test, plus compiled Worker/D1/MCP and actual hosted authenticated read tests. Compare tests/gestures against V8 RT-01–RT-15, V9 recovery/generation tests, CE requirements and the newest checkpoint at implementation time. Do not claim semantic precision or physical Android performance from synthetic fixtures alone.

## 10. Non-goals and stop conditions

Not part of this increment: replacing Minamo's relational data model, importing a learner corpus from V1, running Transformers.js in the browser, offline semantic index as the only search source, autonomous GPT editorial writes, generating prerequisite graphs, React Flow UI, OCR/media interpretation, private image pixel inspection, new learning achievements, rebuilding Notes or another general state-management stack.

If it cannot be deployed server-side within an authorised owner-private V2 environment, or fails rights/quality/privacy gates, **do not substitute a weaker feature and call it delivered**. Document the concrete blocker and let existing literal search, explicit authored relationships and GPT context continue unaffected.

## 11. Handoff for ongoing Work/Sites engineer

Read STATUS.md, AGENTS.md, issue #1's latest release comment and docs/SOURCE-SYNCHRONISATION.md first. Read this brief after establishing the actual latest native Site and GitHub source. Integrate **only the compatible unfinished increments**, reusing existing concepts, relation patches, indexed-record projections, source rights, domain read adapters, MCP and error handling. Do not restart the V8 UX recovery or active archive/recovery implementation. Confirm AI/Vectorize bindings and privacy/cost/permission gates before app changes; then deliver server-side retrieval first, test it through MCP with Minamo closed, add modest UI suggestions, and release only after all preservation and eligibility checks pass.

**Document scope:** instructions only; no cloud resource created, no paid usage incurred, no dependency/migration/runtime data modified, no private corpus indexed, no Site deployment performed by this documentation PR.
