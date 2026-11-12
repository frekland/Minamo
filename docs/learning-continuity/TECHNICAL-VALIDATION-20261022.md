# Technical research and adversarial review of PR #19

**22 October 2026 · Research-only evidence · No live Minamo edits, new model service or application build.**  
**Reviewed:** current `frekland/minamo-v2` main and draft PR #19, current official CodeMirror/React/Cloudflare/SQLite documentation via Context7 and Firecrawl, and relevant SOFA agent posts. References below are precise evidence for **design decisions**, not proof that proposed features have been tested in Minamo.

**Owner decision update (22 October 2026):** this appendix describes earlier research; the learning-work product contract has since been revised in `LEARNING-WORK-AND-CHECKPOINTS.md`. Question origin/status, sessions and automatic checkpoints are rejected; direct Journey-stage checkpoints, Home Favourites and explicit-only writes supersede any earlier Investigation-only tool recommendation. Official technical findings remain applicable.

## Executive conclusions

1. **Material architecture correction required:** Article `renditionFor` currently includes `concepts` and `learningShape`. A Library index/subject-metadata change can produce a new reading rendition despite unchanged teaching text. The separate Library catalogue authority and compatibility migration in `LIBRARY-DATA-AND-MCP-CONTRACT.md` must be established before UI rebuild/publishing changes.
2. **MCP is part of the work, not UI follow-up.** `publish_minamo_manuscript` and context/search/edit tools must handle authored summary, reusable classifications, deliberate command entries, exact targets and owner-eligible discovery without turning GPT back into a huge record-schema compiler.
3. **Use existing D1 + typed exact index first.** FTS5 is supported for prose but loses meaningful punctuation/case with normal tokenisation; exact `curl -i` versus `curl -I` requires a separate preserved-term index.
4. **CodeMirror 6 can present in-flow images, but widgets alone do not persist image identity.** Add a single versioned source-order authority, recoverable staging, and source/reading map tests.
5. **Notes autosync must serialize per-Note server writes, separate undo/redo from network persistence, and reconcile uncertain receipts.** A debounce without this ordering is insufficient.
6. **React shared Notes state should have stable external snapshots or one shared owner.** Multiple disconnected panel/bar/tab states are avoidable and likely recreate collapse/restore issues.
7. **D1 transaction means D1 only.** `db.batch` can atomically commit a reading plus catalogue and receipt. It cannot atomically include an R2 upload; retain the existing staged+verified attachment lifecycle.
8. **Recovery capacity is a release gate.** The existing `lib/recovery.ts` uses hard row/JSON budgets (20,000 rows; 8 MiB JSON); a 1,500-topic test must consider complete encrypted recovery, not just paging speed.

## Source and code evidence register

| Evidence | Finding | Design effect / confidence |
| --- | --- | --- |
| [V2 `lib/domain.ts`](https://github.com/frekland/minamo-v2/blob/main/lib/domain.ts) — `renditionFor` | Article title/body/sections/**concepts** plus optional full `learningShape` are hashed. `links` aren't in Article reading hash. | **Direct source**; catalog metadata must not inadvertently mutate canonical reading identity. |
| [V2 `lib/contracts.ts`](https://github.com/frekland/minamo-v2/blob/main/lib/contracts.ts) | `RecordLink` supports `relationId`, `sourceContext.stageId`; `ConceptEntry` attached to Article; `PassageAnchor` pins rendition, section, part and UTF-16 offsets. | **Direct source**; preserve current historical captures, leverage accepted links and avoid rewriting metadata as prose. |
| [V2 `lib/manuscript.ts`](https://github.com/frekland/minamo-v2/blob/main/lib/manuscript.ts) | PR18 compiler creates sequential `sN/pN` IDs; `Article.body=''`; `Article.learningShape.subject=displayTitle`; new command index/subject category is not automatic. | **Direct source**; targeted full replacement needs stable ID carryover or conflict, plus one-call catalogue compilation. |
| [V2 `lib/authoring-package.ts`](https://github.com/frekland/minamo-v2/blob/main/lib/authoring-package.ts) | D1 batch for guarded Article/Area edits, revisions, activity, raw manuscript edition and receipt. Packages still lack catalogue sidecar. | **Direct source**; extend existing transaction rather than serial post-publication indexing calls. |
| [V2 `lib/learning-validation.ts`](https://github.com/frekland/minamo-v2/blob/main/lib/learning-validation.ts) | Checks `sourceContext` points at existing Journey stage, and concept code targets exist within sections. | **Direct source**; extend owner/revision/target proof for catalogue sidecar/area membership. |
| [V2 `lib/recovery.ts`](https://github.com/frekland/minamo-v2/blob/main/lib/recovery.ts) | Explicit table enumeration, 20,000-row cap and 8 MiB JSON snapshot. | **Direct source**; authoritative new catalogue editions and relationships must be backed up, derived FTS indexes rebuilt. |
| [CodeMirror 6 reference](https://codemirror.net/docs/ref/) and [decorations guide](https://codemirror.net/examples/decoration/) | `Decoration.widget` / `Decoration.replace` support in-flow content, block widgets and state-field `RangeSet.map(tr.changes)`. Height-changing block widgets must cooperate with measurements. `EditorView.domEventHandlers` supports scoped paste/drop interception. | **Official docs via Context7 and Firecrawl**. Viable presentation technique, **not** proof of persistent placement or correct selection mapping. |
| [React `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) | Stable `subscribe/getSnapshot` protocol, immutable cached snapshot and SSR-consistent `getServerSnapshot`. | **Official docs via Context7/Firecrawl**; suitable for shared Notes bar/sheet state if chosen, not compulsory over a single parent controller. |
| [D1 batch documentation](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) | D1's `batch` guarantees a transaction; later SQL error aborts/rolls back all statements. | **Official docs via Firecrawl**; scope is one D1 batch, not R2. |
| [D1 SQLite statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/) | D1 explicitly supports SQLite FTS5 (and JSON extension). | **Official docs via Firecrawl**; use FTS for prose if measured, not exact shell syntax. |
| [SQLite FTS5 tokenization](https://www.sqlite.org/fts5.html#unicode61_tokenizer) | Default unicode61 tokenises by character classes and folds case. | **SQLite primary docs**; exact symbols and case must be stored outside tokenised index. |
| Local SQLite 3 FTS5 `unicode61` probe | `-i` and `-I` both index as `i`. Querying either or `"-i"`/`"-I"` returned **both**; also `curl -i` and `curl -I` matched. | **Executed isolated probe**, not tested on hosted D1. Regression fixture added to design; exact case/punctuation BINARY index mandatory. |
| [D1 limits](https://developers.cloudflare.com/d1/platform/limits/) | As of Apr 21 2026 Cloudflare Docs list 50 queries/invocation on Free, 100 bound parameters/query, 2 MB row, 100 KB SQL statement. | **Official docs**, but *do not assume* GPT Sites billing/quota; test actual existing host. |
| [SOFA: debounced undo and autosave](https://agents.stackoverflow.com/questions/2d0baac0-f0d3-431c-9bea-16ee4c24d4bb) | Distinguish committed mutation and selection, clear redo at edit time, flush pending history before undo; serialize autosave writes; reconcile uncertain server status. | **Agent evidence**, scored answer 37 with limited isolated verifications. Neither integrated with Minamo nor an alternative to CodeMirror's native history; extract race tests, not wholesale reuse of code. |
| [SOFA: stale agent finalisation](https://agents.stackoverflow.com/questions/26a3cac5-5101-47cc-8234-13993b75333e) | CAS + narrow actor-owned patch + dependency revalidation, deterministic interleaving barriers instead of timing. | **Agent evidence**, answers scored ~38–40; relevant to model-proposed catalogue link/ref edits and Note conflict handling, not a complete D1 design. |
| [SOFA: R2 ambiguous completion](https://agents.stackoverflow.com/tils/b41aa0ff-3d6c-4f73-b091-ae87fc71123d) | A failed acknowledgement can coexist with persisted object; inspect exact immutable key and verify actual bytes/digest before retry. | **Agent evidence**, score 15, narrow hosted-R2 scope. Supports existing upload recovery assumptions; does not show that cloud storage usually fails. |
| [SOFA: D1/R2 mid-flight deletion race](https://agents.stackoverflow.com/tils/65cedf9c-0b8e-47a5-a793-af75ce94a0cc) | A separately persisted D1 row and later R2 PUT can be orphaned by concurrent delete; `UPDATE` matching zero rows may not throw. | **Agent evidence**, unverified post; worthwhile targeted interleaving test for Note images, not proof of current Minamo bug. |

### Tool use and reliability

- Context7 was used for CodeMirror 6, Cloudflare and React. **Caution:** a broad Cloudflare query surfaced Durable Objects' transaction API, which is **not D1's API**. We explicitly rejected that as evidence for D1 transactions and verified the D1 `batch` contract independently from the official D1 Worker API.
- SOFA read-only search and post inspection were used. Its agent-generated posts are not canonical library documentation; evidence/trust scopes are recorded above. Nothing was posted, upvoted or independently verified against the live Minamo application.
- Firecrawl supplied current official CodeMirror/React/Cloudflare/SQLite references. Documentation retrieval and the isolated local SQLite probe are **not** an installed MCP integration test.
- No external inference calls or new paid service were required. No private owner Notes, credentials, learning records or proprietary code were submitted to external technical research services.

## Adversarial review: plan weaknesses and corrective actions

### A. Library reading identity is over-broad today

A catalogue-only index update currently changes an Article reading hash. **Fix:** one sidecar catalogue revision and exact reading target pointers; historic `v2_revisions` and all stored `rendition` values unchanged. Work must prove that updating a summary or command flag preserves reading identity, while changing canonical explanatory text deliberately creates a new reading. See `LIBRARY-DATA-AND-MCP-CONTRACT.md`.

### B. Manuscript compiler's position-based IDs threaten targeted replacements

`sN/pN` and H2-based grouping are deterministic for a *single* input, but not stable across insertion/deletion/reordering. **Fix:** targeted update stable-ID carryover or abort with human-reviewable diagnostic; don't automatically remap a saved annotation/Flag to a different paragraph. Require tests that insert a new paragraph before one with historic captures.

### C. Relationship model is usable but needs canonical direction and write contract

`RecordLink` updates are outside reading hash, a good property; the current app can represent area⇄article and stage→Investigation. **Fix:** one exact accepted relation authority with canonical direction for new writes, explicit provenances, deduped legacy incoming links, no silent data migration. A separate sidecar edge table is *not* automatically necessary. Upgrade only if strong multi-writer atomic constraints require it; don't create competing stores.

### D. Editorial indexing isn't textual search

Catching `curl -I` and `-i` distinctly requires authored command reference metadata and exact binary term/alias indexes; FTS5 tokenisation alone is unsafe. **Fix:** indexed canonical catalogue entry anchored to actual reading part, separate owner-eligible query and stable cursor, no classification based only on current loaded page. Prevent misleading “readings” and generic placeholder descriptions.

### E. Autosave and the editor can reintroduce ordering races

Potential scenario: a remote save for Note B commits after a user's undo to Note A, falsely overwriting the newer desired text. **Fix:** one immutable operation in flight per Note, queued latest revision and server CAS; undo/redo are CodeMirror editor transactions captured locally and synced through the same queue. Do not implement independent custom history unless needed; preserve native CodeMirror undo groups. Network cancellation alone cannot undo a committed server write. Test deliberately interleaved acknowledgements and multi-tab conflicts.

### F. Image widgets are not the Note's source-of-truth

A CodeMirror decoration maps UI positions; it does not automatically store image ownership or text/image ordering in D1. **Fix:** versioned Note document insertion reference/ordered content, staged asset attached with exact rev and placement, owned asset availability, locally durable placeholder plus correct camera/screenshot input. Rebuild widgets from saved document and eligible asset metadata. Keep old Markdown/source+selection ranges and historical reading versions intact. No hidden HTML embedding.

### G. Do not claim D1/R2 single-transaction atomicity

D1 `db.batch` works for D1 rows/receipts. R2 uploads remain separate; staged identity, digest validation, two-phase final attachment, abandoned staging cleanup and uncertain-receipt recovery are necessary. Deletion while image staging must not orphan committed media or lose Note text. Do not market this as an all-or-none cloud-storage transaction.

### H. Recovery is part of the data model, not a release checklist

New authoritative catalogue editions and **explicitly checkpointed Journey-stage/Investigation learning events** must be included in encrypted archive/restore with current rights intersections. Derived indexes need deterministic rebuild and version/epoch invalidation. Current 8 MiB JSON/20,000-row archive ceilings may cap scalability before search does; 1,500 substantive topics need an actual backup/restore exercise or a truthful and safely bounded capacity policy.

## Mandatory MCP contract review outcomes

- **Updated after owner decision:** one high-level `record_minamo_learning_development` for exact Investigation **or Journey-stage** checkpoint on explicit request, and bounded `get_minamo_learning_context` for recent/Home/exact-target reads. Do not deploy the earlier unshipped Investigation-only pair as a competing API. The model must not auto-checkpoint, log sessions/interaction transcripts, make per-turn reads/writes or create personal Notes as a substitute for reporting learning; see `LEARNING-WORK-AND-CHECKPOINTS.md`.
- `publish_minamo_manuscript`: one full brief + rich Markdown + optional concise authored catalogue declaration, preview candidates and atomic D1 reading/source/catalogue/index/link receipt. Existing manuscript tool remains backward compatible.
- `query_minamo_library` or compatible typed extension of `query_minamo_records`: unified facet area/topic/reference, exact aliases/terms, eligible current targets, stable paginated result, same domain code used by React.
- `get_minamo_context` / `read_minamo_record`: distinguish canonical `rendition` from `catalogueRev` and source edition; report last acknowledged Note revision, not browser-only draft; archive exact past links by rendition.
- `set/minamo_relation`: owner-directed confirmation of accepted stage/area relevance with exact IDs, no title similarity promotion, source/target rev and reason; suggested candidates read-only.
- Existing tools remain useful for precise action/recovery, but aren't a reason to ask GPT to handcraft `sections.parts` or to use a dozen separate mutations for one learning event.

## Release feasibility gates

**Required source proof before UI polish:**
1. Unit/regression tests for reading hash separation and retained old exact passage.
2. D1 mutation and mixed change rollback, idempotent receipt replay, source rights/Trash and stale catalogue search permission.
3. CodeMirror editor paste/drop widget mapping, Android screenshot fallback, undo and new Note sync while pending; no late response clobbers.
4. 150/1,500 synthetic Library Articles including 200-member area, two-subject topic, exact `-i`/`-I`, duplicate command matches, stale cursor and recovery size.
5. One end-to-end GPT/MCP authoring test: rich new Library Article correctly catalogued and indexed **without editing authored explanation later** just to make it searchable; its exact reading rendition stays stable after approved catalogue-only edits.
6. A held-out Kali/ChatGPT learner-reported checkpoint explicitly targets a Journey stage **without an Investigation**, or an Investigation if so requested; Home and stage projections remain truthful, and Notes/Flags/read-only chats don't auto-produce progress. Cold-start read and 20 normal discussion turns need no automatic write.
7. Real owned Site/browser playback and source-identity acceptance, no extra paid service and original data intact.

**No later Work/Sites implementation should claim completeness based solely on this desk review.** These are selected technical assumptions and falsifiable engineering gates, not an implemented or deployed system.

