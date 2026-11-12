# Library catalogue, canonical reading and MCP publication — persistence contract

**22 October 2026 — architecture refinement informed by current source, official documentation and a local FTS5 probe.**  
**Status:** draft future implementation contract only. **No implementation, deployment, original-repo mutation or existing learning-record edit is authorised.**  
Read with `INTEGRATED-DESIGN.md`, **`LEARNING-WORK-AND-CHECKPOINTS.md`** (normative explicit-only learning writes, stage-targeted work and Home Favourites), `INTERACTION-AND-LIBRARY-RECONCILIATION.md`, `IMPLEMENTATION-SEQUENCE.md` and `ACCEPTANCE-AND-DECISIONS.md`.

## 1. The overlooked issue: catalogue and reading are currently entangled

The current source in `lib/domain.ts` defines `renditionFor(record)`. For `family='article'` it hashes **title, body, sections and Article.concepts**. If a `learningShape` exists (usually), the hash also incorporates that complete shape. In `lib/contracts.ts` the `library-topic` shape contains `subject` and `reusableBeyondProject`.

Consequences:
- Adding `curl --include` or `curl -I` to `Article.concepts` can create a new Article **reading rendition** even if the explanation is byte-for-byte unchanged.
- Rewriting a project's `learningShape.subject` to a broad subject label solely to improve Library organisation also changes reading identity.
- `WorkspaceRecord.links`, by contrast, is not included in `renditionFor`'s reading hash; accepted area/Journey relationship changes currently cause a *record revision* without necessarily changing the *reading rendition*. This is a useful existing invariant worth building on.
- `v2_revisions` retains historical record snapshots/renditions, and exact `PassageAnchor` stores family/id/rendition/section/part/UTF-16 offsets. An unnecessary new rendition does not automatically erase history, but produces false apparent content editions, extra compatibility concerns and invalid assumptions about concept deep links.
- PR #18's `lib/manuscript.ts` assigns sequential `s1/s2` and `p1/p2` IDs on each full compilation. A targeted whole-document update **can move these IDs** if material is inserted/reordered. Raw original manuscript/source editions survive but are not themselves a stable passage ID mapping. No promise should be made that an entire recompiled Article automatically preserves existing part anchors.

**Decision:** do NOT simply declare old reading guarantees unchanged. Keep old hashes/editions **immutable and resolvable**, and explicitly implement a separated catalogue authority for future indexing/organisation changes. Test both stable-current-reading and historical-retained-reading behaviours.

## 2. Authoritative layers and what is allowed to change

| Layer | Authoritative data | Version / identity | Changes |
| --- | --- | --- | --- |
| Authored manuscript | `v2_manuscript_editions` existing archived raw Markdown + full original brief/source mapping | Immutable edition digest + owning publication operation | Never rewritten by indexing; later source update creates new edition |
| **Canonical reading** | Existing Article/Area `title`, `body`, `sections.parts` and explicit teaching content; source/multimedia rights remain separate and current-eligible | Existing `rendition` + historical `v2_revisions` | An actual explanation, diagram, caption, quote, title or selected text change creates an honest new reading rendition |
| **Catalogue document** | New compact, owner-private **sidecar** summary, typed command/concept/reference entries, classification hints and editorial source/basis | Separate monotonic `catalogueRev` / immutable catalogue revisions | Indexing, summary, aliases, search snippets and categorical display changes do **not** change reading rendition |
| **Accepted associations** | Existing explicit `RecordLink`/targeted `upsertRelation` **initially**, extended safely for stage and area associations | Link identity + owner-scoped record revision and exact matching | Area membership and Journey/Investigation links can change without rewriting teaching content |
| **Derived search material** | Rebuildable exact-term/alias, eligible subject membership and optional D1 FTS5 projection | Index-generation/source-catalogue revision marker | Never independently authoritative; discard/rebuild after restore, reindex, rights or schema change |
| **Personal captures** | Flags, annotations, Note references to exact retained reading passages | Full `PassageAnchor` or pinned Note revision | Never retarget silently to revised text or a new subject/category |

**Important nuance:** an authored abstract or summary *displayed as part of the actual reading* is canonical reading text and SHOULD produce a new rendition if edited. A short Library **catalogue preview** that is not part of the learner's reading is metadata, not an excuse to change `Article.body`.

Keep exact current/historical Source permission filters and owner/generation restrictions; search metadata must not leak excerpt text through an index or preview after revocation.

## 3. Recommended additive D1 data design

Avoid a second global document store, new paid service or wholesale rewrite. Introduce **one authoritative catalogue sidecar** for metadata currently coupled to reading. Proposed migration/table names are illustrative; choose the next available migration and reconcile existing D1 limits.

```sql
-- Authoritative latest catalogue edition. One row per owned Article.
v2_catalogue_heads(
  owner TEXT, article_id TEXT, catalogue_rev INTEGER,
  edition_json TEXT, source_manuscript_id TEXT,
  last_operation TEXT, updated_at TEXT,
  PRIMARY KEY(owner,article_id)
)
-- Immutable revisions of that metadata (NOT a duplicate of Article reading).
v2_catalogue_revisions(
  owner TEXT, article_id TEXT, catalogue_rev INTEGER,
  edition_json TEXT, source_manuscript_id TEXT, created_at TEXT,
  PRIMARY KEY(owner,article_id,catalogue_rev)
)
-- Derived exact search index (rebuildable; NOT canonical).
v2_catalogue_terms(
  owner TEXT, article_id TEXT, entry_id TEXT, alias_ordinal INTEGER,
  term_exact TEXT COLLATE BINARY, term_fold_ascii TEXT,
  kind TEXT, target_rendition TEXT, section_id TEXT, part_id TEXT,
  catalogue_rev INTEGER,
  PRIMARY KEY(owner,article_id,entry_id,alias_ordinal)
)
-- Optional derived subject/FTS indexes may be added after measured tests.
```

```ts
type CatalogueEditionV1 = {
  version: 1;
  summary?: {text:string;origin:'author'|'editorial';sourceEditionId?:string};
  references: Array<{
    id:string;kind:'concept'|'shell-command'|'python-function'|'api'|'language-syntax';
    term:string;aliases:string[];caseSensitive:boolean;
    definition:string;signature?:string;usage?:string;environment?:string;
    target:{rendition:string;sectionId:string;partId?:string;examplePartId?:string};
    sourceEditionId?:string;
  }>;
  classificationHints?: Array<{areaId:string;reason:string;source:'author-intent'}>;
};
```

**Compatibility and budget constraints:** preserve existing `CONCEPT_LIMITS` (currently at most 40 entries per Article, 12 aliases per entry, bounded term/definition/signature) unless a separately tested schema/version change is authorised. Keep current manuscript operation limits (16 documents, 220 KB complete request and short audit `purpose` separate from full `brief`) as measured defaults; an oversized declaration must fail honestly with retained source, not silently omit indexes or truncate the teaching. Catalogue source/term rows must fit D1 per-statement/bound-parameter budgets and current owner-private recovery capacity. Existing absolute `https` reading links and exact `minamo:document-key` resolution remain valid.

**Authority boundaries:**
- `v2_catalogue_heads`/`revisions` are the ONE authoritative place for **new** catalogue metadata and reference definitions after cutover. `v2_catalogue_terms` and FTS5 are *derived* and can be rebuilt deterministically; they are never edited independently.
- Legacy `Article.concepts` in existing `v2_records`/`v2_revisions` remain historically valid. At cutover, migrate their current entries to one canonical sidecar edition, preserving IDs/aliases/targets and tying each to its actual current Article rendition. Older reading snapshots stay byte-for-byte unchanged.
- Update the `readRecord`/`get_minamo_context`/`queryConcepts`/`ConceptBrowser` adapters to expose the **current sidecar catalogue** through compatible `concepts` DTOs where necessary. **Pinned old renditions** must continue to use the historical snapshot's catalogue/reading context, not be silently overlaid with today's terms.
- Existing `ContentPatch.upsertConcept/removeConcept` and full `data.concepts` writes need an explicit adapter: route current index-only mutations to the new catalogue CAS/receipt (or reject with actionable migration guidance). **Do not permit independent edits to legacy concepts and sidecar** that create two authorities. Keep old installed-client contracts compatible where possible.
- Keep `RecordLink` explicit accepted link authority initially, as the current hash already excludes links. Use **one deterministic canonical direction** for new Article→Area membership (and Journey stage→Investigation stage context), and a backward-compatible projection/deduper for historical incoming Area→Article links. Deleting old links requires exact-source guarded mutation/acknowledgement; do not silently accept two conflicting membership truths. If auditing proves links-in-record unmanageable for multi-writer semantics, commission ONE central typed accepted-edge store and a migration—not another parallel writable list.
- **MCP publishing** submits desired accepted area links as explicit owner-authorised link intents (local document keys or exact eligible Area IDs), and identifies *suggested* matches separately. Never infer equality by similar title or automatically attach a new general article to whichever project generated it.

**Why sidecar?** It is the **chosen lower-risk implementation** for separating future catalogue-only metadata from authored readings without rewriting retained identities. Do **not** recompute/change stored old rendition hashes, even though the existing retained-read API uses persisted IDs (so alternative versioned hash schemes could theoretically preserve history). Versioned hashes or inline separately-revisioned metadata remain possible alternatives in theory, **not reasons to reopen design without evidence**. Any prospective versioned hash change requires an explicit compatible read adapter. Historical old rendition IDs remain authoritative.

### Stored versus projected records — an important implementation trap

**Never let the read adapter's projection become the next authoritative write payload.** Today `readRecord` returns a `WorkspaceRecord` and `authoringDomain.prepared`/`renditionFor` work from persisted record data. After cutover, **current** reads may *expose* catalogue references via a compatibility `record.concepts` DTO, while the **raw stored Article** must retain its pre-cutover concepts field unchanged for historical compatibility.

- Define an internal `StoredArticle` / `ProjectedArticle` boundary: D1 updates, canonical reading hash and exact rendition always use the **raw persisted reading record**, while UI/MCP current views may overlay eligible, separately-versioned sidecar concepts and summaries. A projected object must never be serialised back through generic `data.concepts` or `data.learningShape` mutation without explicit separate catalogue intent.
- Map legacy `upsertConcept/removeConcept` and full `data.concepts` requests to one authoritative sidecar write with exact `catalogueRev`/record/source guards; reject unsafe mixed canonical + catalogue snapshots. **After cutover, current/prospective reference validation must use the authoritative current sidecar**, not frozen raw legacy `Article.concepts` or their old `examplePartId` targets; otherwise an old obsolete concept can reject a legitimate source-part removal. Historical original entries must remain byte-for-byte present and valid when resolving the corresponding retained old rendition, but not act as an undeletable validator against new reading. `lib/domain.ts:validateData` and `lib/learning-validation.ts` both need this version-aware boundary. Current `v2_revisions` must not store a fake reading revision for an index-only edit.
- Represent `readingRevision`, `readingRendition`, `catalogueRev`, `catalogueSourceEdition` and `indexEpoch` as distinct internal and MCP fields. An Article record's `updatedAt` may change for normal provenance, but that alone is not learner work or an edited reading hash. Avoid a UI that assumes `rev` equals "current reading version".
- A catalogue search hit's rendition/part target must be *validated against the exact current eligible raw reading* before publishing link. When the source is updated, re-anchor catalogue entries deliberately; a current catalogue may temporarily be marked `needs-target-review`, never silently point at historical text as if current.

This separation is necessary for **correctness**, not just performance.

### When reading content itself changes

- A genuine Article text/diagram/title change uses a guarded Article mutation and stores a new reading rendition and historical `v2_revisions` row. The *current* catalogue's reference targets must then be **revalidated and deliberately repinned** to the new valid `rendition+section+part` before the updated article and catalogue are announced complete. Current reference destinations and accepted Area memberships are separate authorities; do not use a text-only update to overwrite either by accident.
- A content edit that removes/moves `sectionId`/`partId` referenced by a concept or passage must not silently bind the previous concept to a different paragraph. Return a targeted `reference_target_changed` / `anchor_migration_required` diagnostic. Historical captures remain on historical eligible reading.
- For `publish_minamo_manuscript` targeted updates, the current sequential `sN/pN` output is insufficient for guaranteed stable IDs. Implement **ordinary successful** stable-ID carryover (declared IDs or bounded deterministic mapping) for **unambiguous** insert/reorder edits to existing Article/Area/Journey, with correct current stage/reference targets and a source-span receipt. On **genuinely ambiguous** destination changes, reject with precise `anchor_migration_required` or equivalent, rather than guess. **Existing old capture anchors already pin a reading rendition; reusing a part ID in a new rendition does not by itself relocate an old correctly resolved capture.** The new stability proof primarily protects current catalogue targets and durable Journey-stage learning. Don't demand a general semantic-remapping framework. New manuscripts can generate IDs.
- If only catalogue membership/index/synopsis changes, **reading rendition must remain the same**. Catalogue revision changes, and search/projections refresh. A catalogue-only mutation must not edit `learningShape.subject`, `body`, `sections` or any source rights fields.

## 4. Library semantic organisation with no duplicate content

The agreed **Subject areas / Topics / References** are three facets over:
- ``area`: curated broader subject (e.g. Python, Web/HTTP); existing RPG-themed Areas are kept; no bulk automatic reparenting.
- `article`: one canonical reusable mechanism explanation; a Journey/Investigation or multiple areas can reference the same Article. Preserve its originally authored topic `learningShape.subject`; search classification comes from accepted Area links, not from rewording `subject`.
- `CatalogueEditionV1.references`: indexed short technical lookups anchored to that Article's **exact current or archived** reading part; no duplicated mini-lessons masquerading as new articles.

**Learning activity remains separate:** An owner's explicit Favourite on a Journey, Investigation or Library Article uses the existing whole-record bookmark and must not create a new catalogue edition, reclassify a topic, update a canonical reading or appear as learning progress. "Use minamo" conversations may **read** Library references without any write; only an explicit add/edit/publish request changes content and only an explicit checkpoint creates a learning Development. A Journey-stage checkpoint does not require an Investigation or mutate linked Articles. See `LEARNING-WORK-AND-CHECKPOINTS.md`.

**Area membership is not an ownership transfer.** An Article may be accepted into two subject areas without creating copies, relabelling its authored teaching, altering its stored historical rendition or creating Journey-stage Development events or implying learning progress.

**Sparse Library:** zero subject areas is valid. A new article with no accepted Area is still discoverable in *All topics* / neutral *Uncategorised*, never “More reading to explore” recommendation. Suggestions from literal/concept matches are not accepted relationships; Owner/GPT working under explicit editorial authority can deliberately connect them, with reason/provenance and source-rev checks.

## 5. Precise query and search strategy

**Official support:** Cloudflare D1 documents support for SQLite FTS5: https://developers.cloudflare.com/d1/sql-api/sql-statements/ and https://www.sqlite.org/fts5.html . FTS5 should be used only for prose/body search **if measured useful**. It does not replace exact indexed command lookup.

A local SQLite FTS5 `unicode61` probe confirmed:
- `-i` and `-I` both index as token `i`.
- Searches for `i`, `I`, quoted `"-i"` or `"-I"` match **both** flags.
- Thus flags/identifiers require an **exact case- and punctuation-preserving BINARY lookup**, with expressly opted-in alias folding only where editorially safe. This is not merely a ranking tweak.
- The suite must test `-i` versus `-I`, `--include`, `--head`, `dict.get()`, path separators and similar punctuation, plus ambiguous duplicate definitions across multiple articles. Never auto-collapse meanings.

**Single authoritative query engine:**
1. Input typed `{facet:areas|topics|references,query,areaId,kind,limit,cursor}`, authenticated server owner and generation (never from JSON).
2. Use exact eligible subject links/term index, bounded full-text and semantic *candidates* separately; return current `articleId+rendition+sectionId+partId` destinations, accepted membership context, summary/provenance, total-count semantics and transparent `truncated/nextCursor`.
3. FTS rows must not contain private Source excerpt or revoked remote media metadata; join to current authorised record/source eligibility **before display/snippet**, and refresh/rebuild derived indexes on revocation/Trash/generation changes. No leaked title/existence through a stale cursor.
4. Cursor binds owner, namespace generation, facet/filter/query, stable sort plus index epoch. On schema/epoch/relevance change, return deterministic stale-cursor restart, not a false gap/duplication. Never infer all content has loaded from a 40-record page.
5. Both Site UI and GPT MCP route through this **same** domain query. Avoid a new local array-only Library search. Use bounded response previews; exact record fetch when opening.
6. A fast topic summary is either **authored catalogue metadata**, a documented bounded excerpt drawn from current eligible canonical text, or *absent*. Don't write new body text just to fill a preview.

**Capacity:** D1 documented free-plan limits include **50 queries per Worker invocation, 2 MB row and 100 bound parameters per query** (as of 2026-04-21); these are Cloudflare platform limits, **not proof of GPT Sites quota or billing tier**. See https://developers.cloudflare.com/d1/platform/limits/ . Avoid N+1 queries when loading an area or querying many command aliases. Bounded set-based SQL, indexed owner joins and keyset cursors should be measured under actual Sites.

## 6. GPT/MCP publication contract — the user shouldn't curate D1 JSON

The existing `publish_minamo_manuscript` accepts Markdown + full brief and generates canonical sections. Extend it **backward compatibly**, not with dozens of compulsory per-record metadata fields.

Proposed small optional explicit author intent:

```ts
type ManuscriptDocumentV2 = {
  key:string; role:'article'|'area'|'journey'|'investigation';
  title?:string; markdown:string; target?:{family:string;id:string;rev:number};
  catalogue?: {
    summary?:string;
    areas?:Array<{ref:string;reason:string}>; // local manuscript key or exact declared eligible area
    references?:Array<{
      term:string;kind:string;aliases?:string[];definition:string;
      signature?:string;usage?:string;
      targetHeading?:string;exampleCodeLabel?:string;
    }>;
  };
};
```

Alternative: a bounded Markdown reference table/directive that the compiler recognises; **select one canonical authored source-of-intent mechanism** and document it. GPT writes useful explanatory content naturally; Worker derives canonical IDs, current reference targets and indexes. Do not make GPT construct `sectionId/partId/rendition` by hand.

### Publication omission, replacement and accepted-link ownership

**Default semantics to prevent data loss:** a *targeted wording-only manuscript update* that omits `catalogue`, `catalogue.areas`, `catalogue.references` or independently accepted subject links **preserves the authoritative current catalogue edition and those independent accepted links**. Omitted is **not** "replace with empty" or "clear all"; the compiler must not generate `data.links=[]` that silently removes external/owner-accepted relationships. Distinguish:
- **Authored inline/source-scoped relationships** extracted from the manuscript; deliberately replacing that source may add/remove its own authored links as declared and verified. Do **not** blindly preserve obsolete inline links merely because they existed.
- **Separately accepted Area/context memberships**, which are explicitly authorised operations independent of manuscript text. Their default is **preserve**, even if the new Markdown omits them. Explicit removal/replacement must name exact relation identities, expected owner/source/catalogue and target revision and produce a clear receipt. For legacy reverse Area→Article links, identify the single authoritative source and dedupe/reconcile, rather than leaving phantom membership.
- **Catalogue summary and references:** optional omission preserves current entries; an explicit well-defined empty list or precise remove operation changes only the named catalogue authority with CAS and target proof, never a silent global clear inferred from absent input.

Choose and document one natural author-facing syntax for catalogue intentions. Keep established publisher's one-call authoring semantics, but ensure the compiler's **fresh links array versus `prepared` update merging** cannot erase independent link authority. A one-sentence targeted publication must retain independently accepted Area membership; a subsequent explicit unlink must remove that exact membership. Test both in a real guarded D1 package and installed MCP. The 16-document/220 KB envelope and catalogue terms/aliases increase D1 batch statements; measure combined realistic payloads under the actual runtime before claiming capacity, rather than assuming tier limits.

### Read / write operations

| Operation | Needed change |
| --- | --- |
| `preview_minamo_manuscript` | Return candidate existing Areas/Articles/concepts and a **prospective catalogue plan**: authored summary, accepted versus suggested area links, exact generated reference terms/aliases and target parts, duplicate/rendition conflicts and rights; no writes. Preview optional and small. |
| `publish_minamo_manuscript` | Atomic guarded **Article/Area reading + immutable raw source edition + catalogue head/revision + derived exact term rows + accepted link updates + operation receipt** for this publication. Reuse `authoring-package.ts` D1 `batch`, generation fences, operation identity, expected record/catalogue revs and cross-record target checks. |
| `query_minamo_records` (or one focused `query_minamo_library`) | Owner/gen scoped typed facets (areas/topics/references), exact flags+aliases, current eligible summaries and deep links, stable filtered cursors. **One domain query shared with website.** |
| `get_minamo_context` / `read_minamo_record` | Return exact current authored reading identity and **separately labelled** catalogue revision/areas/references (or compatible projected concepts). **Rendition-only archived links pin reading, not a particular catalogue edit**. Return original publication-associated catalogue only if actually provable, else omit historical catalogue metadata; current metadata may be exposed only if clearly labelled **current**, never disguised as historical. Exact catalogue-as-of reads require explicit `catalogueRev` or immutable equivalent. No time-travel UI required. |
| `update_minamo_catalogue` / existing `apply_minamo_command` adapter | Targeted owner-directed category summary/entry/relation edit with exact record/catalogue expected revisions and operation receipt. Avoid a separate tool for every UI button. |
| `get_minamo_relationship_candidates` / `confirm_minamo_relationship` | Read-only suggested topical overlaps versus explicit accepted links; use same accepted relationship authority as Investigation↔Journey, no implicit project ownership. |
| `read_minamo_operation` | Reconcile uncertain catalogue + reading compound commits without rebuilding or resubmitting another giant package. |

**Publishing transaction:** D1 `db.batch` is officially documented as an atomic transaction: error rolls back the sequence. See https://developers.cloudflare.com/d1/worker-api/d1-database/#batch . Use authoritative preconditions for **every member**, including catalogue and associated link revisions, then write receipt. Do not claim R2 staging is in the D1 transaction; private images remain staged/attached through the existing separate guarded protocol and exact immutable asset ID.

**Rollbacks:** injection at the final catalogue-index statement leaves **zero** new Article, area link, catalogue edition, reference-index entry, raw manuscript edition, activity or receipt. Lost response → same operation replay/read status, not new op ID.

**Published result:** refs, reading renditions, catalogue revs, accepted area associations, indexed reference counts, unresolved editorial candidates and precise warnings. Never silently classify, overwrite a Source permission or invent exercise evidence.

## 7. Historical/compatibility migration — explicit requirements

Implement only on future owner-approved commission. Design and tests must precede any genuine data mutation.

- Schema additive. Existing `v2_records`, `v2_revisions`, `v2_manuscript_editions` and historical `rendition` IDs remain immutable/readable. No global recalculation or rewrite of `learningShape.subject`, old text parts or old captures.
- Backfill **current** legacy `Article.concepts` once into catalogue sidecar without changing `v2_records`. Keep legacy as historical snapshot. Use exact owner/record/source ID, immutable original target and current eligible `rendition`. Conflicts produce reviewable diagnostics; never silently choose similarly named entries.
- For **current** reads, project the eligible current sidecar catalogue separately from raw authored reading. A **rendition-only archived read pins the reading, not the catalogue timestamp**: return the original publication-associated historic concepts/catalogue only when its immutable edition association is actually known, otherwise omit ambiguous historical catalogue claims (optional current metadata must be labelled as current). For exact catalogue history, require an explicit `catalogueRev`/immutable edition selector with owner/generation/rights checks. R, C1, C2 and C3 can coexist; R alone cannot identify which of C1/C2/C3 was intended. Do not silently overlay latest metadata and call it historic, or demand a new UI.
- Legacy area→article and article→area relationships both remain valid during migration. New accepted article→area direction preferred; normalise/dedupe read projections with exact source relation identities. No unguarded dual-write. Explicit removal must inspect all authoritative legacy links, with CAS and a truthful receipt.
- Encrypted checkpoint/recovery **must include authoritative catalogue heads/revisions, accepted relations and new learning work**, including importer composite identities/redaction, current permission floors and same-generation mutation-watermark protection. Derived terms/FTS rebuild and must be complete or clearly unavailable before claimed search-readiness. Current `lib/recovery.ts` limits include **20,000 rows and 8 MiB JSON**, plus image-count/byte caps; **sustained Note autosave produces large full revisions and receipts and staged/expired asset rows**. For a **declared, realistically supported cumulative workspace workload** prove **complete checkpoint/export and the ordinary older-checkpoint stage+activation (including its preactivation backup)**. A safely rejected oversized archive is a necessary *outside-supported-envelope* error test, **not a passing normal recovery outcome**; do not silently omit, prematurely prune exact history or prescribe streaming before measuring simplest workable complete solution. Test 150/1,500 substantial Articles AND retained Note revisions, operation receipts, source/catalogue history and staged image metadata in isolated fixtures.
- Current Source rights, revocation floors, Trash and image/media permissions apply when rebuilding or querying the index, and when resolving retained target links. A stale Search index cannot resurrect a revoked excerpt.
- Versioned compatibility: old installed MCP clients/tool catalogues may still request `data.concepts` or old `RecordLink` shapes; route safely through new catalogue authority or return a clear documented validation error with the correct new path. No stale definition may silently bypass the new rules.

## 8. Mandatory proof before release (cross-reference acceptance register)

A. **No false reading churn** — add a new `curl --include` reference, edit synopsis, accept second subject Area: Article's `rendition` and existing capture offsets unchanged; catalogue revision/index changes as intended.  
B. **Genuine new reading edition** — edit one canonical explanation/diagram/alt: new rendition created; old selection still resolves, new index refs validated/re-pinned correctly.  
C. **Legacy history** — read retained pre-migration Article and a Flag to earlier rendition; same exact text/rendition; no new subject inferred.  
D. **Publisher one-call** — new deep reusable Python topic with two intended subject areas, a command flag table and source links; full GPT Markdown + brief archived once; catalogue/index/relations/receipt atomically committed.  
E. **Uncertain replay / conflicting readers** — duplicate ID replay, concurrent catalogue edit, obsolete Area rev and Source revocation; no duplicated index, wrong anchors or partial writes.  
F. **FTS5 and exact-flag probe** — `-i` !== `-I`, `--include`/`--head` distinct, duplicate terms shown as choices, no case-insensitive silent merging.  
G. **Scale/recovery** — 150 and 1,500 **substantial** synthetic Articles, >200-child Area and paginated query, but also **sustained acknowledged Note versions, full operation receipts, catalogue editions and staged/expired asset identities**. Define supported cumulative workload and prove complete encrypted checkpoint/export **and restore of an older valid checkpoint while current corpus is at that supported limit**. Oversize rejection beyond the supported envelope is separately safe; it cannot stand in for normal recoverability.  
H. **Source rights** — revoked excerpt/Trashed source never leaks through suggested/accepted index or preview, even with stale index and cached cursor.  
I. **Future targeted manuscript update** — **one ordinary unambiguous paragraph insertion/section reorder succeeds** and preserves stable stage/current reference targets; a separate genuinely ambiguous update fails with actionable `anchor_migration_required`. Old eligible Flag/Annotation retains exact historic rendition/offset; it is not automatically moved.

**This is a normative refinement of PR #19's Library workstream, not a second Library overhaul or separate implementation PR.** The final Work/Sites task must read it alongside all other planning documents and report all gate evidence. No design document grants authority to execute now.

