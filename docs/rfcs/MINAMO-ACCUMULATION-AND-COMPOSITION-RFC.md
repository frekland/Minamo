# Minamo — accumulate independently, compose experiences on demand

**Status:** Authoritative proposal for PR #12; architecture/UX validation before production implementation.  
**Scope:** Reframe the whole Minamo product, not merely Project reading or Library filing.  
**Baseline:** Existing production code and merged [PR #10](https://github.com/frekland/minamo/pull/10). Preserve its accepted identity, revision, exact-reference and routine Project-authoring safeguards.  
**Not approved:** New record families, a database migration, automatic chat ingestion, new navigation labels, new fixed UX templates, deployment or merging. Those require evidence and explicit follow-on decisions.

## 1. The problem, stated without product metaphors

People work and learn through GPT in ordinary, sometimes disconnected conversations. They produce explanations, original examples, corrections, experiments, code, observations, questions and decisions. **This accumulated material should remain available even when no Project, category or curated Library destination was chosen when it arose.**

Later, the user should be able to ask GPT to select and arrange existing material to suit a present purpose: exploring a subject, reviewing attempted examples, revisiting a particular discussion, building an interactive lesson, examining an experiment, or sustaining a more formal piece of work. The arrangement may be saved and refined. **The material is not copied into, or owned by, the arrangement.** More useful material may arrive after the arrangement was created, without forcing subsequent interactions into it.

Projects and Library are *possible uses and presentations* of existing material; neither is the mandatory destination or the centre of the product. The user is describing a capability, not proposing literal terms, page names, commands, a "bank" button or a fixed set of views. Avoid turning example vocabulary into frontend labels.

### Explicit non-goals

- No system that models or certifies what the learner understands; no inferred progress, mastery, confidence, achievements or compulsory checkpoints.
- No constant automatic parsing of all GPT chats; no assumption Minamo can access unsaved conversation history or another provider's private data.
- No default creation of mini-Projects or generic Library Articles for every new fact.
- No magical self-reorganising graph, opaque AI page generated afresh at every load, infinite activity feed or purely aesthetic relationship visualisation.
- No loss of original user wording, evidence, timestamps, provenance, retained renditions, permissions, Notes ownership or existing Projects.
- No automatic UI derived from incidental expressions in owner discussion.

## 2. Ground truth in the codebase, and actual friction

### Confirmed primitives worth reusing

- `lib/contracts.ts`: `WorkspaceRecord` offers stable `family/id`, rich `sections[].parts[]`, `rev`, `rendition`, `createdAt`, `updatedAt`, exact `RecordLink`, `learningScope` and actor/source metadata. `ContentPatch` supports bounded part/relation edits. There is **not** currently a universal first-class retained-interaction/arrangement contract.
- `lib/learning-spaces.ts`: coarse spaces/languages/subjects and scoped search are already separated from Project composition. They are classification/index hints, **not** the only acceptable organisational hierarchy.
- `lib/project-composition.ts` and `lib/project-learning-map.ts`: saved Project arrangements, exact part/page references and deterministic reading projections already work for Projects. These are useful **precedents**, but their schema depends on a single `journey` record and its canonical sections; don't merely rename a Project composition into a global knowledge system.
- `app/reader.tsx`, `app/project-reading.tsx`, `app/project-context-overview.tsx`: rich rendering, Japanese ruby/TTS, code, tables, interactive parts, annotations and Project-local navigation exist. The current presentation remains largely tied to the record currently open.
- Library `article` and `area` resources plus query tools support durable curated reference. Editorial policy explicitly excludes making Library the default home for personal exercises and practice. `note` remains user-owned; GPT cannot write Notes.
- Revision-protected, retry-stable MCP authoring and source permissions already exist. Preserve and reuse infrastructure rather than inventing a second permission/versioning system.

### Read-only live evidence (2026-11-13)

The current Minamo MCP outlines show **63 topics across 10 context groupings** in `Making Friends`, and **26 topics across 26 contexts** in `Japanese Speaking Practice`. The Project reader can expose these individually, and GPT can retrieve their exact content. This is strong evidence of content/organisation pressure across two closely related activities—not proof that all 89 pages are unique, that every existing explanation is high quality, or that a new global view already works.

Use these original Projects as **read-only source examples** in design evaluation. Never reorganise or mutate real user Projects as synthetic acceptance fixtures.

### The real content goes deeper than topic counts

A subsequent **read-only MCP inspection of full canonical content and selected exact page readings** found:

| Measurement | Making Friends | Japanese Speaking Practice | Combined |
|---|---:|---:|---:|
| Reading topics | 63 | 26 | 89 |
| Canonical parts | 86 | 52 | 138 |
| Interactive parts | 12 | 21 | 33 |
| Flashcard decks | 4 | 6 | 10 |
| Cards inside decks | 55 | 72 | **127** |
| Dialogue components | 3 | 3 | 6 |
| Turns inside dialogues | 22 | 18 | **40** |
| Comprehension reveals | 2 | 12 | **14** |
| Tables | 18 | 0 | 18 |
| Diagrams | 0 | 3 | 3 |

The figures concern **saved authored material**, not learner achievement, number of actual practice attempts or proof of a day-by-day rate. Some large GPT-authored batches were created rapidly. Material generated in minutes can contain dozens of distinct exercises. Linear extrapolation from these Projects to annual usage would be misleading.

**Source fidelity gap:** `Making Friends` contains original human-authored exchanges and attempts, translations, grammar analysis, corrections, tables and generated practice, but only **two** pages carry explicit `provenance`; 47 pages have explicit local `source` pointers. `Japanese Speaking Practice` contains grammar diagrams, extensive flashcards, reveals, dialogues and practice guidance, but **zero** reading pages expose `provenance` or `source` pointers. Some original/generated distinctions are present in paragraph text, which is not sufficient as a reliable cross-corpus machine-readable attribution contract. The absence of typed provenance does not prove content is false, but it prevents safe assumptions.

**Organisation gap:** The first Project yields 63 topics in 10 context groupings, largely inferred from content blocks, while the second yields 26 contexts for 26 topics, with only 20 explicit context IDs. The same grammar, expression or use case can appear in conversations, examples, grammar explanations and generated drills in different places, without a reliable cross-record topical index. A coherent resource cannot simply display all those page titles together.

**Granularity gap:** A flashcard deck is one canonical `interactive` part yet may hold 8–20 cards. A dialogue part can hold multiple turns. An 8-page MCP reading limit and Project-local page enumeration are suitable for bounded exact reading, **not** an efficient long-term discovery strategy across thousands of such units. Discovery must index sufficiently precise canonical passages and, where supported, stable sub-items; subsequent reads must resolve permissions and the actual source. Do not pretend a nested card has a globally stable identity until verified and validated.

**Lifecycle gap:** Stored Project content is only the portion of ordinary GPT interaction deliberately authored into Minamo. Current Project timestamps and revisions do not reconstruct when every grammar point was discussed or practised. A later general accumulation feature must record genuine capture provenance and sequence going forward; it must not retroactively fabricate a transcript timeline.

**Implication:** The first prototype cannot pass merely because GPT manually retrieves both Project outlines and arranges a small hand-picked subset. That would fail again at six months. It must exercise representative fine-grained discovery, source distinction, progressive selection and incremental reuse under volume.

### Proven gap, not solved by PR #10

PR #10 improves *authoring into an existing Project*. It does not allow useful, Project-independent accumulation, nor give a general composition mechanism over material drawn from several records, nor provide an independently useful frontend for such compositions. Two better-organised Project readers would not solve this issue.

## 3. Proposed separation of responsibilities

Treat this as a **logical architecture**, not a demand for three databases or three tabs.

### A. Durable material (source of truth)

Retain deliberately selected useful information and interaction excerpts as canonical, ordered content with independent identity and a precise origin. Possible forms include a learner's utterance, explanation, corrected example, dialogue exchange, code, observation, diagram or interactive part.

Requirements:

- Can exist *unassigned*, with no Project, Library Area or predetermined subject. Classification can be absent, provisional or revised later.
- Each retained unit has stable identity, owner/rights, author/provenance, timestamp/sequence where genuinely available and exact source context; never invent chat URLs, dates or author claims.
- Preserve meaningful local order and exchange context: a sentence, answer and correction can be captured together without requiring a full transcript, while allowing an exact original excerpt to be recovered.
- Distinguish existing Project-owned passages referenced as source from **new independently retained items**. A reference to a Project passage is not magically independent if that Project is deleted.
- Immutable or revisioned originals, with explicit corrections or subsequent developments; no silent rewriting of the learner's words.
- Multiple downstream arrangements may reference the same canonical material. No duplication just to make a new experience.

**Storage decision remains open:** adapt an eligible `work`/other existing `WorkspaceRecord` family, add a discriminated sub-type, or introduce the smallest new record/sidecar that preserves the above. Use actual constraints/tests—not preference for minimal migrations—to decide. Never misuse learner-owned Notes or curated Library Articles to avoid a schema change.

### B. Saved arrangements (organisation, not ownership)

A saved arrangement is a versioned **manifest of canonical references**, order, grouping, optional filters, explanatory connective text (clearly marked as derived), and suitable presentation instructions. It is not a copy of its source content.

A possible internal contract to assess, **not a final schema**:

```ts
type MaterialRef = {
  family: ExistingReadingFamily;
  id: string;
  rendition?: string;            // explicit pinned edition when required
  sectionId?: string;
  partId?: string;
  // distinguish 'follow eligible current head' from 'pin this edition'
};
type Arrangement = {
  id: string;
  rev: number;
  title: string;
  purpose?: string;              // owner/model-supplied, not a mandatory taxonomy
  groups: Array<{
    title?: string;
    entries: Array<{
      ref: MaterialRef;
      // optional presentation hint from a bounded supported registry
    }>;
  }>;
};
```

The production contract must also define owner scope, revision protections, source eligibility, canonical order, broken/revoked source behaviour, derived-content provenance, limits, and deterministic render behaviour. A manifest alone does not grant access to any ref. It must allow a genuinely **purpose-built presentation**, not just a generic folder list.

Different arrangements can gather the same items into different learning/working experiences. Projects can become one richer arrangement type (with active working state, code, artefacts, decisions and editing); reference Library remains curated coverage. Neither should absorb all unassigned material.

When new content accumulates, existing arrangements stay stable and understandable. The owner can request a refresh/extension using new eligible material; if a dynamic view is offered later, make membership rules visible and distinguish it from a curated saved arrangement.

### C. Presentation (deterministic, flexible experience)

GPT is good at selecting, grouping, sequencing and choosing an appropriate interaction for a **specific requested purpose**. Minamo should persist the result and render it reliably without a live model call on each page load.

Build on existing typed rich parts, language components, code/interactive reading and reader primitives. Allow authored compositions within a **bounded, expandable set of safe components** rather than six near-identical Project templates or arbitrary executable HTML.

Examples of *behaviour*, not fixed app sections:
- Read and explore original Japanese examples next to explanations where useful.
- Practise Japanese interactively using already retained attempts and authentic dialogue.
- Consult structured grammar/reference material.
- Investigate code beside an earlier observation and runnable component.
- Bring material into a sustained workspace without reauthoring its sources.

**A good default first view matters more than the number of modes**: it should display comprehensible accumulated material and straightforward routes to current/recently retained and earlier items; avoid admin metadata and a wall of tiny topic tabs. Don't create a permanent UI mode for each example above.

## 4. Capture and organisation: realistic boundaries

The two operations must be **decoupled**:

1. **Retain:** when the user authorises persistence in an ordinary interaction, save selected eligible material with source, order, and provenance. No destination required. Do not depend on a magic phrase or assume the model can search unshared chats. A website-origin selection or explicit existing source selection may be equally valid.
2. **Arrange:** later, when useful, GPT and/or the user can retrieve bounded eligible materials across sources and assemble a suitable representation, with exact source references and clear intent. A saved result is a stable edition until deliberately changed.

This separation permits frequent low-friction accumulation and occasional creative reorganisation. A later request might append to an arrangement, create a new one, or simply read a different subset, without moving the originals. Preserve conflict-safe writes and retry receipts.

**Design question, not preordained answer:** How much extraction from an ongoing GPT chat should be retained verbatim vs as a source-linked distilled item? Start with owner-selected material and bounded current-conversation context, preserve enough exact original words and attribution, and measure actual usability before broadening.

Search need only provide candidate discovery (scope, keywords, title, references, time when real). GPT may interpret and rank candidates, but must never turn search similarity into an unverified source relationship or an automatic write. Semantic/vector search is optional, only if plain discovery proves inadequate.

## 5. A growing corpus should make Minamo more useful, not more burdensome

The design must produce **compounding practical benefit** without treating volume as achievement:

1. **Retrieval becomes richer:** more authentic phrases, previous attempts, corrections and examples are available when the user revisits a topic, asks GPT a new question or chooses to assemble a view. The learner need not remember which chat or Project contained a passage.
2. **Useful reuse without repetition:** existing approved material can support multiple contexts and interactive presentations without copying 100 near-identical flashcards or republishing the same explanation. The system distinguishes *existing usable material* from a need to author something genuinely new.
3. **Source context survives:** GPT and the frontend can distinguish authentic examples, corrections, teacher explanations, generated exercises and unverified observations by origin/evidence, not word similarity or a fabricated mastery state.
4. **Stable navigation alongside growth:** small material remains approachable; long-lived subjects should offer clear layered orientation and selectively reveal detail rather than dumping everything into one massive Project. A saved arrangement stays stable while the corpus grows; new material is discoverable without automatically rewriting it.
5. **Productive variety:** old content may support a new purpose-built reading or practice experience when specifically requested, without requiring the learner to have predicted that organisational goal at initial retention.
6. **Deliberate restraint:** new material does not automatically create a new page, diagram, section, exercise, learning claim or link. Duplicates, repetitive boilerplate and redundant generated exercises do not improve the default experience merely by existing.

### Scaling mechanism required from the start

- Maintain an **owner-scoped, incrementally updated discovery projection/index** over eligible canonical material: record/section/part identity, safe source title/snippet, typed kind, available nested sub-item keys, source/provenance where available, declared language/scope, actual update/capture timestamps when supported, and version/eligibility markers. A separate table/index may be justified; its existence need not change canonical ownership.
- The index is **derived and rebuildable**; it is not a second source of truth, a silently persisted AI interpretation, or permission authority. Reads resolve exact source eligibility/current rights and version. Stale index entries must be repaired or withheld.
- Query in bounded stages: subject/scope and relevant lexical/structured matches → inspect a small candidate set → GPT chooses/arranges with verified exact refs → deterministic UI. **No reading all records into the model on every query or screen load**, and no regeneration of saved arrangements every time Minamo opens.
- Search needs **more than Project titles and Library Articles**. It must reach content parts and potentially individual existing card/turn members, while safely falling back to the containing part when sub-item identity is not durable.
- Preserve distinctions among **retained source material**, **GPT-authored teaching content**, **generated practice resources**, **user-authored attempts and corrections**, and **saved representations**. Where historical provenance is missing, label it unknown/unspecified, not implicitly user-authored.
- Support many-to-many membership without duplication; removal from an arrangement must not delete an independent original. Define archival/supersession/version behaviour that suppresses repetitive retrieval clutter **without hiding or deleting valuable older material**.
- Keep explicit source-linked chronological/interaction order when available, but support nonchronological topical exploration. Do not treat recently saved/generated material as evidence of what was learned last.

### Capacity and quality tests (engineering fixtures, not user-growth predictions)

Test with both real content patterns and synthetic corpora at **100, 1,000, 10,000 and 50,000 discoverable parts/sub-items**, across months and years, including repetitive generated exercises, evolving original examples, corrections, multilingual sources, revision churn, missing metadata, revoked entries and partially inaccessible renditions. These are stress-test sizes, not forecasts.

Record query scope/candidate counts, index refresh work, page-load and discovery latency, result precision, fidelity to original material, invalid reference leakage, model input size and usability at the first view. Define acceptable performance budgets empirically after a baseline; do not assert unmeasured millisecond targets. Tests must prove that ordinary lookups do **not** require O(total corpus) model reads or view construction. A large corpus should not make small interactions disproportionately expensive.

**Critical scenario:** After simulated two-year accumulation, a new Japanese question still discovers an earlier authentic attempted sentence and its correction, differentiates them from GPT-generated drills, and can place them into a fresh appropriate experience in bounded steps; no bulk manual re-filing or full-corpus prompt is necessary.

## 6. Reusable real-data development environment (early prerequisite)

**Change in development strategy:** The owner explicitly permits the existing Minamo learning material to be used in the public GitHub repository. Do not waste effort creating repeated hand-picked fake Projects or an unnecessary privacy/anonymisation pipeline. Use the genuine saved corpus as a **versioned, first-class test fixture**.

The operational design, exact extraction/refresh contract, local loader, compatibility tests and justified third-party-rights exclusions are defined in [PR #12: real-corpus development and compatibility harness](MINAMO-REAL-CORPUS-DEVELOPMENT-HARNESS.md). This is an **initial Work deliverable**, useful regardless of which future architecture is selected.

Create a repeatable snapshot initially spanning both Japanese Projects' canonical rich parts, nested interactive payloads, references and genuinely available edition history. Use **existing MCP reads** to obtain or deliberately refresh the snapshot; ordinary development and test runs use the local dataset, not repeated live MCP queries or connector reinstallations. Make covered/missing historical data explicit. Exclude credentials and content lacking publication rights; do not presume omissions or invent restored transcripts.

Run old and proposed architectures against identical content in an **isolated local D1/R2 environment**, taking advantage of `tests/private-storage-fixture.mjs` and existing migrations. Compare source text/identity, exact links, revisions, source permissions, rich component rendering, interface usability and intentionally differing outcomes. Extend the same dataset synthetically for longer-term stress tests.

**The dataset must not drive the product architecture.** It is evidence and a repeatable acceptance baseline. Preserve normal canonical source-reader and rights checks in any public deployment. No production recovery activation, original Project edit or schema change is required merely to try a new frontend.

## 6. Build path and gates

### Phase 0 — Real-corpus harness, source-backed feasibility, discovery scaling and experience contract (first task)

Perform a **bounded code/API spike**, not a production refactor:

- Establish the versioned **real-content fixture** and isolated local replay/harness described above, then trace current persistence, canonical reading, exact passage links, scopes, search, owner permissions, revision/edition semantics, and append/update routes. Identify concrete entry points; inspect native Sites source only if it differs from this PR's GitHub baseline.
- Compare candidates for independently retained items and versioned arrangements: reuse an existing record family, discriminated existing record subtype, or a minimal new table/family. Document where the existing Project-only readingPages cannot apply cross-record, and what access/revocation checks a general renderer needs.
- Build a read-only **material inventory/selection adapter** using existing eligible records and passages; do not mutate Projects or duplicate source content. Design and benchmark a **bounded part-level search/index path** with incremental updates and exact permission checks. Examine nested card/turn discovery without claiming a new canonical identity prematurely.
- Define an acceptance scenario using representative authentic structures from `Making Friends` and `Japanese Speaking Practice`: original user attempts and corrections, linked grammar, 127 flashcards across decks, dialogue turns, translation/grammar tables and diagrams, plus a separate computing example. The owner authorises publishing their Minamo learning content in the public repository; avoid unnecessary sanitisation, but check third-party rights and do not publish tokens or credentials. Capture exact source IDs and eligible editions in versioned fixture evidence. The owner permits public inclusion of their Minamo learning material; respect credentials and independent third-party publication rights.
- Evaluate a 100/1,000/10,000/50,000 synthetic scale fixture, with sparse provenance, repeated generated examples and archival/revision churn. Do not postpone discovery and indexing until after the demo.
- Produce a minimal human-readable UI walkthrough: discover content by subject/context, inspect an original and return, deliberately assemble an alternative useful study arrangement. Compare against current Project UX using the same saved material.

**Decision gate:** Can a view over multiple real canonical sources be rendered accurately and understandably with existing components? Choose a source-record/arrangement architecture based on demonstrable constraints. Don't start a big migration on speculation.

### Phase 1 — Scalable discovery plus read-only composition prototype (first user-visible implementation)

Implement a small **cross-record selection → saved/serialisable arrangement preview → deterministic reader** vertical slice, using existing sources with read-only rights.

- Use the bounded index/query path to discover and choose, rather than manually hard-coding, an appropriate set of Japanese material. Arrange **at least two genuinely different useful experiences** (for example an explanation-oriented view and an interactive practice-oriented view) *from overlapping exact sources* without moving or duplicating the content. Demonstrate surfacing a specific earlier original utterance/correction amidst many generated drills.
- Use bounded typed arrangement data rather than free-form generated HTML, and reuse existing Reader/interactive parts safely. Derived instructional text, if used, has its own provenance and must not misrepresent source material.
- Show this without opening either original Project as the required starting point. Keep existing Project views intact.
- Prototype should be isolated/feature-flagged, not an unreviewed replacement of Home, Library or Projects.
- Validate default first-screen clarity, finding earlier examples, correctness of source attributions, safe interaction, mobile accessibility, and refresh stability. Persisted arrangements, if introduced in this phase, need owner-scoped revision and CAS/idempotency.

**Gate:** Show a useful frontend improvement **before** committing to a new ingestion subsystem or navigation redesign. If every useful view still amounts to a giant list of links or stale summaries, redesign the representation.

### Phase 2 — Independent accumulation

After Phase 1 proves the consumer experience:

- Implement the smallest general retention path for useful material outside Projects/Library, using the storage choice validated in Phase 0. Its API accepts explicit eligible source material and preserves origin, sequence, attribution, stable IDs, owner rights and revision safety.
- It must work with **no container selected**, then support search and later inclusion into multiple arrangements. Provenance/permissions still apply when material originated in another Project or chat.
- Avoid automatic unrequested capture, duplicate blind appends, forced categories and auto-generated progress. Add a simple user correction/undo path.
- Test repeat/retry, concurrent update, unavailable source, revoked access and idempotent capture. The new retention path should update discovery metadata incrementally and preserve per-item origin/sequence where actually supplied, rather than relying on a subsequent expensive global reclassification.

### Phase 3 — Deliberate arrangement and evolution

- Introduce GPT-assisted organisation of a selected eligible corpus, with limited authoring input: target purpose, candidate source refs, grouping/ordering, supported interaction layout and optional explicitly differentiated derived content.
- Reuse an existing arrangement, create a new one or preview alternatives. The model supplies pedagogical/work judgement; server enforces identity, source rights, structural validity and safe rendering.
- Let new retained material be found and added later without silently changing the user's saved view. Support edits, removal from one arrangement (without deleting originals), and membership in multiple arrangements. Demonstrate what happens to a long-lived saved arrangement when fresh source material arrives: new relevant items are discoverable, but membership changes only under an explicit, bounded refresh or transparent rule.
- Revisit whether current Projects should be treated as a richer optional arrangement, and how Library remains a curated reference lens. Implement compatibility/transition only with an explicit owner-approved plan.

### Phase 4 — Refine product entry/navigation based on use

Only after end-to-end behaviour is proven, determine whether Home/Projects/Library/Your Work navigation should change. Avoid inventing permanent destinations based on our illustrative terms. Test several genuinely different focuses, sparse usage, long histories, and cross-device consistency. Preserve current production entry until evidence favours replacement.

## 7. Acceptance contract (not merely tests of APIs)

**Must demonstrate:**

1. **Unassigned first:** a new retained item exists and is retrievable without creating/selecting a Project or Library Article.
2. **Independent use:** the same exact original passage appears in two substantially different arrangements; its canonical text/ID is unchanged. Removing it from one arrangement does not delete it or break the other.
3. **No starting from scratch:** existing content from multiple sessions/Projects can be assembled through GPT into a useful study/working experience without reauthoring originals or manually moving them.
4. **Presentation quality:** a human can find an earlier Japanese sentence/correction or an important computing observation without knowing the source chat, Project ID or storage hierarchy. Test first-screen clarity and ordinary navigation, not link counts.
5. **Relevance without false certainty:** distinguish actual chronology of retained material from recently opened material and from guesses about current learning focus. No invented completion or progress.
6. **Rich interaction:** source-authorised Japanese ruby/TTS, explanation, table, code and at least one appropriate interactive component survive the arrangement where supported; safe fallbacks link to full source.
7. **Durability and security:** revisions, retries, revoked sources, hidden/unavailable data, exact rendition pins, ownership, user-authored Notes restrictions, external rights and same-source duplicate anchors remain correct.
8. **Stable experience:** after reloading, the same saved arrangement renders deterministically without requiring an online GPT response; reorganisation is intentional and inspectable.
9. **Growing corpus:** discovery/selection work at 100, 1,000, 10,000 and 50,000 synthetic parts/sub-items with recorded latency, query scope, bounded model input, incremental index maintenance, missing provenance and permission failures. No full-corpus prompt or scan on routine reading; the learner can find an older authentic example amidst plentiful generated content.
10. **Accumulative advantage:** as successive material arrives, retrieval is demonstrably more helpful for a given question or experience without forcing extra organisational work. Compare early-corpus vs mature-corpus performance on finding relevant prior examples and assembling a purposeful view; measure precision and user task success, not total retained items or graph links.
11. **Fine-grained provenance:** generated exercises, authentic learner utterances and corrections remain distinguishable when actual source metadata exists. Historical items with insufficient metadata remain honestly unclassified instead of being assigned invented provenance.

Test on the versioned real-content fixture loaded into an isolated environment, supplemented by deterministic synthetic growth. Use live Japanese Projects only for authorised, read-only acceptance; do not mutate them. Record actual acceptance outcomes and limitations, not assumed passes.

## 8. Engineering risks to solve explicitly

- **Identity/lifecycle:** existing content *inside* a Project is still owned by that record. Cross-record views can reuse it without copying, but independence from deletion requires separate retained canonical material and a deliberate promotion/recovery policy. Never claim independence solely from linking.
- **Cross-record permissions:** read-time authorisation is mandatory for every source and edition; a composition must not leak eligible records to a different owner, after revocation, or across a historical rendition.
- **Mixed rich parts:** existing Reader may assume one parent record and unique DOM anchor IDs; multi-source composition requires scoped anchors, selections, contributions and navigation. Don't naïvely render several full Readers with duplicate IDs.
- **Source fidelity vs AI synthesis:** arranging is distinct from rewriting. If GPT adds a bridge or summary, store it as clearly GPT-authored derived content, linked to but not replacing originals.
- **Ordering and time:** preserve explicit interaction/excerpt order when available; never imply Minamo can reconstruct missing unsaved chat history or infer precise session times from record-level revision timestamps.
- **Complexity:** avoid a universal knowledge graph, generalized page-builder platform, uncontrolled per-view storage copies, and expensive all-corpus inference on every small operation. Start with indexed, bounded selection and typed rendering.
- **Large-project limits:** current Project composition validates at 64KB, 128 blocks and 32 layout sections; these are Project-local limits, not a viable whole-user knowledge capacity model. `get_project_learning_reading` returns up to eight pages per call. Do not design whole-user retrieval as repeated enumeration of every Project or expansion of those limits.
- **Nested interactive granularity:** substantial real material lives in flashcard `cards[]`, dialogue `turns[]` and language-pattern `examples[]` inside one canonical part. Search needs suitable nested discovery, while rendering/revision/rights remain attached to valid source identities.
- **Provenance and dilution:** original learner content may be rarer and more valuable to revisit than a hundred auto-generated drills. Define honest source-derived kinds, avoid pretend learner achievements, and avoid allowing generation volume alone to dominate search or the default presentation.
- **Backward compatibility:** existing Project authoring/editor, Library concept catalogue, Notes, reader links, source rights, work threads, media, interactive blocks and MCP contracts must remain functional during the experiment.

## 9. PR boundary and next commission

**This PR #12 is the product/architecture baseline and explicit phased delivery plan, not a claim that the model, schema or frontend has been implemented.** Its former Project-reader-first and general-learning-to-Library approaches are superseded as the guiding design. Preserve their rationale in Git history, not as competing implementation instructions.

**Next bounded Work commission:** critically examine the product/architecture options, establish the reusable real-corpus harness and complete **Phase 0** including source-level provenance and bounded discovery, then demonstrate a credible **Phase 1 read-only cross-record UX concept/prototype** if feasible. The investigation should challenge this RFC where evidence supports a better approach; report data-model and frontend trade-offs, compatibility, tests and desktop/mobile inspection rather than blindly implementing this design. Use GitHub `main` as the owner-confirmed current production-aligned source, unless actual evidence shows a discrepancy; do not replace production Home or mutate genuine Projects. Report whether the proposed source/arrangement split genuinely works, what minimal additional persistence is necessary, and any architectural revision justified by code and observed UX. Keep PR draft and unmerged until owner review.

Do not silently expand into Phase 2–4, a migration, a new MCP tool contract, arbitrary browser/HTML authoring, or an unapproved production UI redesign.
