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

## 5. Build path and gates

### Phase 0 — Source-backed feasibility and experience contract (first task)

Perform a **bounded code/API spike**, not a production refactor:

- Trace current persistence, canonical reading, exact passage links, scopes, search, owner permissions, revision/edition semantics, and append/update routes. Identify concrete entry points; inspect native Sites source only if it differs from this PR's GitHub baseline.
- Compare candidates for independently retained items and versioned arrangements: reuse an existing record family, discriminated existing record subtype, or a minimal new table/family. Document where the existing Project-only readingPages cannot apply cross-record, and what access/revocation checks a general renderer needs.
- Build a read-only **material inventory/selection adapter** using existing eligible records and passages; do not mutate Projects or duplicate source content.
- Define an acceptance scenario using a naturalistic subset of `Making Friends` and `Japanese Speaking Practice` plus a separate computing example. Capture actual source IDs/edition permissions in test evidence, without publishing personal prose in the public PR.
- Produce a minimal human-readable UI walkthrough: discover content by subject/context, inspect an original and return, deliberately assemble an alternative useful study arrangement. Compare against current Project UX using the same saved material.

**Decision gate:** Can a view over multiple real canonical sources be rendered accurately and understandably with existing components? Choose a source-record/arrangement architecture based on demonstrable constraints. Don't start a big migration on speculation.

### Phase 1 — Read-only composition prototype (first user-visible implementation)

Implement a small **cross-record selection → saved/serialisable arrangement preview → deterministic reader** vertical slice, using existing sources with read-only rights.

- Arrange a set of original Japanese material into **at least two genuinely different useful experiences** (for example an explanation-oriented view and an interactive practice-oriented view) *from overlapping exact sources* without moving or duplicating the content.
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
- Test repeat/retry, concurrent update, unavailable source, revoked access and idempotent capture.

### Phase 3 — Deliberate arrangement and evolution

- Introduce GPT-assisted organisation of a selected eligible corpus, with limited authoring input: target purpose, candidate source refs, grouping/ordering, supported interaction layout and optional explicitly differentiated derived content.
- Reuse an existing arrangement, create a new one or preview alternatives. The model supplies pedagogical/work judgement; server enforces identity, source rights, structural validity and safe rendering.
- Let new retained material be found and added later without silently changing the user's saved view. Support edits, removal from one arrangement (without deleting originals), and membership in multiple arrangements.
- Revisit whether current Projects should be treated as a richer optional arrangement, and how Library remains a curated reference lens. Implement compatibility/transition only with an explicit owner-approved plan.

### Phase 4 — Refine product entry/navigation based on use

Only after end-to-end behaviour is proven, determine whether Home/Projects/Library/Your Work navigation should change. Avoid inventing permanent destinations based on our illustrative terms. Test several genuinely different focuses, sparse usage, long histories, and cross-device consistency. Preserve current production entry until evidence favours replacement.

## 6. Acceptance contract (not merely tests of APIs)

**Must demonstrate:**

1. **Unassigned first:** a new retained item exists and is retrievable without creating/selecting a Project or Library Article.
2. **Independent use:** the same exact original passage appears in two substantially different arrangements; its canonical text/ID is unchanged. Removing it from one arrangement does not delete it or break the other.
3. **No starting from scratch:** existing content from multiple sessions/Projects can be assembled through GPT into a useful study/working experience without reauthoring originals or manually moving them.
4. **Presentation quality:** a human can find an earlier Japanese sentence/correction or an important computing observation without knowing the source chat, Project ID or storage hierarchy. Test first-screen clarity and ordinary navigation, not link counts.
5. **Relevance without false certainty:** distinguish actual chronology of retained material from recently opened material and from guesses about current learning focus. No invented completion or progress.
6. **Rich interaction:** source-authorised Japanese ruby/TTS, explanation, table, code and at least one appropriate interactive component survive the arrangement where supported; safe fallbacks link to full source.
7. **Durability and security:** revisions, retries, revoked sources, hidden/unavailable data, exact rendition pins, ownership, user-authored Notes restrictions, external rights and same-source duplicate anchors remain correct.
8. **Stable experience:** after reloading, the same saved arrangement renders deterministically without requiring an online GPT response; reorganisation is intentional and inspectable.
9. **Growing corpus:** cross-source navigation still works with 100+ topics and mixed purposes without exhausting the UI, copying whole documents or scanning everything on every render.

Test on isolated synthetic acceptance fixtures modelled on the real distribution; use real Japanese Projects only for authorised, read-only usability evaluation. Record actual acceptance outcomes and limitations, not assumed passes.

## 7. Engineering risks to solve explicitly

- **Identity/lifecycle:** existing content *inside* a Project is still owned by that record. Cross-record views can reuse it without copying, but independence from deletion requires separate retained canonical material and a deliberate promotion/recovery policy. Never claim independence solely from linking.
- **Cross-record permissions:** read-time authorisation is mandatory for every source and edition; a composition must not leak eligible records to a different owner, after revocation, or across a historical rendition.
- **Mixed rich parts:** existing Reader may assume one parent record and unique DOM anchor IDs; multi-source composition requires scoped anchors, selections, contributions and navigation. Don't naïvely render several full Readers with duplicate IDs.
- **Source fidelity vs AI synthesis:** arranging is distinct from rewriting. If GPT adds a bridge or summary, store it as clearly GPT-authored derived content, linked to but not replacing originals.
- **Ordering and time:** preserve explicit interaction/excerpt order when available; never imply Minamo can reconstruct missing unsaved chat history or infer precise session times from record-level revision timestamps.
- **Complexity:** avoid a universal knowledge graph, generalized page-builder platform, uncontrolled per-view storage copies, and expensive all-corpus inference on every small operation. Start with bounded selection and typed rendering.
- **Backward compatibility:** existing Project authoring/editor, Library concept catalogue, Notes, reader links, source rights, work threads, media, interactive blocks and MCP contracts must remain functional during the experiment.

## 8. PR boundary and next commission

**This PR #12 is the product/architecture baseline and explicit phased delivery plan, not a claim that the model, schema or frontend has been implemented.** Its former Project-reader-first and general-learning-to-Library approaches are superseded as the guiding design. Preserve their rationale in Git history, not as competing implementation instructions.

**Next bounded Work commission:** complete **Phase 0** and, if no blocking rights/architecture flaw emerges, produce an isolated **Phase 1 read-only cross-record composition prototype** with focused tests and a desktop/mobile inspection. Use the existing Minamo Site and current GitHub/native-source reconciliation rules; do not replace production Home or mutate genuine Projects. Report whether the proposed source/arrangement split genuinely works, what minimal additional persistence is necessary, and any architectural revision justified by code and observed UX. Keep PR draft and unmerged until owner review.

Do not silently expand into Phase 2–4, a migration, a new MCP tool contract, arbitrary browser/HTML authoring, or an unapproved production UI redesign.
