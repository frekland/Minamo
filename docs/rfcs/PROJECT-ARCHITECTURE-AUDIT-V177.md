# Minamo Project architecture audit — V177 source

**Date:** 13 November 2026  
**Status:** Read-only source assessment, attached to [PR #10](https://github.com/frekland/minamo/pull/10); findings and proposed direction are **not implementation approval**.  
**Source baseline:** V177-matched GitHub application head `2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a` from the merged PR #9 branch. PRs #7 and #9 were merged into `main` with no tracked-file differences against the verified V177 application source; subsequent licence-only changes do not change the audited runtime.  
**Method:** Targeted inspection of Project domain, schemas, command validation, multiple authoring entry points, reading projection, current/legacy renderer, tests and existing engineering guidance. Supplemented with read-only inspection of the saved *Making Friends* Project revision 12. No source build/test run or controlled browser interaction was performed in this audit.

## Executive assessment

**The underlying storage/ownership/revision foundation is stronger than the organisation and rendering contract layered above it.** The critical opportunity is to clarify and simplify the existing design rather than create a parallel Project model or another authoring framework.

The server already has a useful separation between canonical content and reading projection, but the model must still manually assemble a large amount of implementation metadata. Many optional declarations govern the semantic usefulness of the resulting experience without an equally strong server-owned composition default. The native **reading** UI largely ignores the six named layout patterns, although older/editor-oriented rendering retains distinct CSS for them.

### Evidence-based findings (ranked by design priority)

| Priority | Finding | Current evidence | Implication |
|---|---|---|---|
| **P1** | Six named patterns are not six normal reading experiences | `ProjectReading` chooses a `pc-reading-${pattern}` wrapper but uses one common tabs/topics/`Reader` tree; its CSS lacks pattern-specific rendering rules. Older `ProjectSections` arrangement/editor and its CSS **do** have differentiated styles. | Extra layout vocabulary and choices without corresponding learner-facing function; don't promise meaningful modes that the user cannot experience. |
| **P1** | Model-facing authoring is structurally demanding | `append_project_learning_material` needs `layoutId`, `parts`, exact `readingPages` with `partIds`, sometimes `contextId`/relationships; `update_project_learning_material` needs `blockId`, `pageId` and new part IDs; global edits require a complete composition. | A good teaching model can still create confusing or inconsistent organisation; server should own mechanical assembly. |
| **P1** | Semantic classification remains mostly authored, not consistently guaranteed | `readingPageSchema.purpose`, `contextId`, `source`, `relations` and `continuation` are optional. The shared topic map groups primarily by declared `contextId` or block identity and creates indexes only from explicitly set page purposes. | A valid Project can lack useful purpose navigation/context grouping. Stronger schema alone is not the answer; add a small semantic-intent contract and deterministic default projection. |
| **P2** | Different authoring routes have different composition defaults | Manuscript-created Projects map H2 sections to separate `notebook` layouts; later manuscript edits preserve an arrangement and add missing headings as new notebook layouts; existing Project tools permit named cross-section reading pages; the website edits full canonical sections/composition. | Equivalent educational content can enter the system in noticeably different visual/organisational forms. Audit route equivalence before consolidating tools. |
| **P2** | Placement and page order conflate source traversal and destination | `projectReadingTopics` walks visible *origin* layout slots/blocks and emits pages carrying optional *destination* `layoutId`. The native viewer filters by destination, keeping ordering inherited from origin traversal. | Destination ordering and hiding behaviour may not match user expectations; a canonical projection with explicit ordering/visibility semantics is needed. |
| **P2 / investigate** | Page-level external references and duplicated source placement need a targeted invariant audit | `validateComposition` checks exact internal source/relation/continuation targets and per-block part coverage, but does not itself resolve `page.references` to an external current/retained record; duplicate canonical section IDs across distinct blocks are not explicitly forbidden in this validator. Other guards exist for `data.links` and direct block references. | Confirm which operations add admission guards, whether unresolved references are intentionally allowed, and whether duplicate source placement is legitimate multi-view reuse or an accidental double projection. Do not call this an exploited vulnerability from static reading. |
| **P3** | A bounded reading fetch appears more expensive than necessary | `getProjectLearningReading` calls `getProjectComposition` first, which resolves external references, Note pins, history and code-package inventory; it then reads only selected topic parts. | Opportunity for a lighter, revision-pinned exact read path, subject to retained permission checks; measure actual latency before altering. |

### Source locations supporting the findings

- Composition schema, `validateComposition`, six patterns and legacy adapter: [`lib/project-composition.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/project-composition.ts#L4-L50).
- Guarded update/read operations and request schemas: [`lib/project-service.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/project-service.ts#L20-L149), [`lib/project-service.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/project-service.ts#L361-L435), [`lib/project-service.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/project-service.ts#L470-L485).
- Shared browser/MCP topic map: [`lib/project-reading-topics.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/project-reading-topics.ts#L1-L33), [`lib/project-learning-map.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/project-learning-map.ts#L18-L70).
- Current reader: [`app/project-reading.tsx`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/app/project-reading.tsx#L14-L83), [`app/project-reading.css`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/app/project-reading.css#L1-L46).
- Editor/legacy layout path with pattern CSS: [`app/project-sections.tsx`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/app/project-sections.tsx#L25-L81), [`app/project-sections.css`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/app/project-sections.css#L1-L16).
- Manuscript Project creation/targeted revision: [`lib/manuscript.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/manuscript.ts#L190-L231).
- Server record validation, ownership and revision safeguards: [`lib/domain.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/domain.ts#L107-L130), [`lib/domain.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/domain.ts#L414-L480).
- MCP description/schema publication: [`lib/domain-handler.ts`](https://github.com/frekland/minamo/blob/2ae92ea6c13580b9aa66cdaf2bb1c73b23481e6a/lib/domain-handler.ts#L126-L155).

## What already works and should be preserved

1. **Canonical part identities and exact retained editions.** Reading pages reference existing `sectionId/partId` and can expose content under another top-level section without copying its text. Old editions and annotations remain tied to their exact source.
2. **Substantial structural enforcement.** `validateComposition` checks block/section/slot uniqueness, placement, internal passage links, unique page IDs and full exactly-once coverage *within a block that declares reading pages*, plus size limits. It is a genuine validator—not merely authoring guidance.
3. **Actual server-side authority.** `projectCommand`, `applyProjectUpdate` and `authoringDomain.prepared` perform revision/generation checks, operation replay handling, protected direct-edit checks, owner/source admission and GPT Note write rejection. Do not weaken these checks to make smaller models succeed.
4. **Shared exact reading projection.** The website and outline/read MCP paths use `projectLearningMap`/`projectReadingTopics`, avoiding two independent prose extraction systems.
5. **Cross-domain extensibility.** Existing canonical parts support code, tables, diagrams, images, media and interactive learning components. Work threads, contributions, Note pins and code packages are separate legitimate capabilities; none should be recast as compulsory learner progress.
6. **Legacy adaptation.** `adaptedComposition` supports older Projects without rewriting their stored identity. Existing learning resources should not need a bulk schema migration as the first step.

These are reasons **not** to rewrite the Project store.

## Deep dive: the six-pattern mismatch

The normal non-editing Project path in `ProjectSections` uses `ProjectReading` (or a separate Questions view when Work threads exist). The `ProjectReading` component selects sections/topics and calls the shared `Reader`. Pattern value is used for a wrapper CSS class, yet its stylesheet does not specialise any of the six values. This accords with the owner's observation that a dashboard, notebook, workbench, board, research and guide do not feel distinct when reading a Project.

During **editing**, `ProjectSections` instead composes blocks using `arrange`, and its older `project-sections.css` distinguishes dashboard grid, notebook width, workbench two columns, board card grid, research split and guide numbering. These styles are real, but they are not the ordinary native reading experience.

**Design conclusion:** Do not commission six decorative versions of the current reader. First distinguish three separate decisions:
- **Task/category:** what the learner is doing or looking for (Messages, Grammar, Evidence, Code, Practice, Sources, etc.).
- **Information hierarchy:** which material is overview, core, supporting or optional; what is grouped and ordered.
- **Interaction/presentation:** continuous reading, side-by-side evidence, runnable workbench, drawing workspace, interactive practice, etc.

A single Project may need several forms. Rather than making `pattern` a compulsory top-level choice, treat it as optional layout/presentation advice behind an adaptive renderer, with clear overrides only when meaningful. Compare retaining a small number of genuinely distinct *behaviours* against consolidating synonymous patterns.

## Deep dive: the model is still doing server composition work

A model using today's focused MCP authoring often must:
- inspect a composition/outline and select an implementation-level `layoutId` (and sometimes `slotId`);
- author typed passage records with IDs;
- assign every new part to a new or existing `readingPage` by IDs, plus a title, purpose and sometimes `contextId`, source/relations and continuation;
- handle exact expected revisions, generation and immutable operation identity.

The last group of guards **must remain**, but ordinary authoring can hide mechanical details behind a server-controlled adapter. The model should describe *learning intent* and compose content; the server should mint deterministic IDs, validate source targets and build the accepted Project projection. Existing precision/expert tools should remain for exceptional, deliberate reorganisation.

**Illustrative adapter concept, not an approved new MCP API:**

```ts
{
  project: { id: "exact-project", expectedRev: 12 },
  intent: "extend-existing-topic",
  target: { topicId: "exact-existing-topic" },
  material: [
    { role: "explanation", content: /* existing typed canonical part */ },
    { role: "example", content: /* existing typed canonical part */ },
    { role: "practice", content: /* existing typed interactive part */ }
  ],
  relationships: [{ kind: "explains", target: { sectionId: "saved-source", partId: "saved-part" } }]
}
```

The transport would still have `operationId` and `expectedGeneration`, but it would not require the caller to fabricate internal section/block/page IDs. A declared role is a semantic *intent*, not a fixed template or a pedagogy score. The server must not invent meanings for ambiguous material; return a bounded, specific alternative or choose a safe generic presentation while preserving content.

**Importantly:** An explanation could contain one sentence or several rich examples. A research argument could include conflicting interpretations. A computing Project could combine code, documentation and a controlled experiment. The model's quality and creativity must not be restricted to make the server easier.

## Deep dive: composition, purpose and visibility

- `readingPageSchema.purpose` is **optional** and restricted to `source | translation | explanation | practice | reference | overview`. Other pedagogically meaningful roles—example, evidence, observation, decision, hypothesis—can currently be content *kinds* or authored prose, but do not map clearly to page-level roles. **Don't simply add a giant enum**; first decide whether purpose belongs at page level, part level, or to relationships.
- `contextId` is optional. Otherwise context grouping defaults to the block. This is a valid fallback but can split what is conceptually the same learning topic across new blocks.
- The `indexes` returned by `projectLearningMap` are only built from declared page purposes. A Project with missing purpose metadata may read correctly but lack useful Explore indexes. This is **consistent with current code**, not a general-purpose semantic classification service.
- The projection is derived by walking each *origin* section's placed blocks and then applying page `layoutId` to determine which section tab displays them. There is no separate authoritative order of pages in the *destination* section. Hidden origin sections/blocks can suppress pages even when their declared destination is visible. The existing tests explicitly exercise hidden destinations, but not every origin/destination ordering combination.
- `validateComposition` ensures every *block* is placed once. A Project can use no named reading pages, and the reader splits long canonical sections automatically (16-or-fewer parts in one topic; otherwise groups of 8). That compatibility is valuable but may produce weak titles/purpose semantics. Coverage of *all canonical source sections* and possible duplication across multiple source blocks warrants focused verification.

**Refinement direction:** Define an explicit, deterministic **reading projection** as the single output of composition. It must resolve source identity, logical topic membership, page order, visibility, target category and renderable content. Maintain a clear model of *why* a view refers to content without copying or rewriting it.

## Route parity: manuscript, MCP, website

| Entry route | What it currently does | Concern to investigate |
|---|---|---|
| Manuscript publication | Converts authored Markdown H2 sections into Project canonical sections; creates notebook layouts for new Projects; follows existing composition on revision and adds newly authored headings. | Useful convenience, but source headings may become top-level navigation even when a richer task-based presentation is desirable. |
| Focused MCP append | Creates a new canonical block/section from the operation ID and consumes explicit `pages`, `partIds` and destination `layoutId`. | Stable and exact, but structurally expensive for models. |
| Focused MCP targeted update | Adds new parts to one existing page using exact block/page/part references. | Robust for small improvements; cannot naturally suggest a new sibling topic/page without a more complex operation. |
| Global MCP edit | Rewrites complete composition; optionally content sections, retaining IDs, permissions, favourites, locks and work threads. Returns an actual topic outline and narrow mixed-purpose warnings. | Powerful expert interface, but impractical as the ordinary model action for a simple teaching change. |
| Website editor | Edits canonical sections/composition as a retained draft, then submits a whole Project update; its editing renderer retains rich pattern layouts. | Visual behaviour and editing mental model differ from normal reading; verify safe preservation and consistency after concurrent remote edits. |

All paths ultimately use core guarded record operations, which is valuable. The missing piece is a shared *semantic compilation contract* **before** a Project reaches storage, not a competing source of truth or an additional learner record.

## Suggested architecture — refine with the owner

### 1. Canonical content remains authoritative

Retain the current sections/parts, source references, contribution ownership, revisions, Notes restrictions and source-rights model. Do **not** treat every paragraph as a separate new record, and do not infer user progress.

### 2. A compact semantic intent vocabulary, separate from part format

Map existing data first. For instance, `part.kind='code'` is presentation/content syntax, while `role='example'` or `role='evidence'` indicates why the part matters. Avoid enforcing every possible role. It should be possible to author a coherent unstructured passage when structure adds no value.

Suggested candidate role families for evaluation (not a schema commitment):
- **Source/material:** message, reference, source passage, translation.
- **Understanding:** explanation, example, comparison, alternative.
- **Doing:** practice, interactive exploration, worked example.
- **Inquiry:** question, evidence, observation, hypothesis, interpretation, decision.

A Project should not be obliged to populate all of them. The server can normalise their *relationships and presentation* once deliberately declared.

### 3. One server-owned topic/reading projection

Produce a canonical mapping of: `canonical part → topic/context → optional task-category destination → ordered view` with stable IDs and visibility rules. Both MCP and website consume this map. Do not store a second copy of prose or a new independent Project collection. Prefer an adapter that derives maps from current composition and augments them with narrowly justified metadata.

### 4. Task-appropriate presentation instead of six compulsory templates

Keep a coherent default reading experience. Offer optional *functional* modes where they help: side-by-side evidence, interactive workbench, spacious drawing, structured conversation/translation, etc. Prefer a few meaningful behaviours to six decorative banners. A Project can mix them across pages without an all-or-nothing `pattern`.

### 5. Simple model-facing entry, expert escape hatch

Offer an intent-driven writer for ordinary requests with server-generated IDs and deterministic placement. Retain the exact existing manipulation tools for advanced workflows, including full reorganisation and interactive compositions. All routes invoke the **same revision/rights validator** and produce the **same reading projection**.

### 6. Keep educational quality advisory

The server should reject malformed structure, unauthorised writes, duplicate identities or broken links. It should **not** certify that an analogy is insightful, require three examples, mandate self-checks, turn text into a lesson template or constrain model reasoning.

## Prioritised implementation programme — proposal, not authorisation

**Slice A — invariants and reproducible diagnostics (lowest-risk first).**
- Add focused tests to demonstrate current behaviour for (a) six patterns in normal reading vs editor; (b) reading-page destination ordering, hidden origin/target semantics; (c) same canonical source appearing via more than one block; (d) page-level external reference validation and current source rights; (e) purpose/context omission; (f) source preservation across three authoring routes.
- Inventory the existing schema and validators; document which fields are truly required, derived or advisory. Agree desired behaviour rather than making speculative fixes.
- Capture real browser/mobile examples of Making Friends and one computing/investigation Project. No claim of live UX acceptance from this static audit.

**Slice B — unify semantic compilation.**
- Define the minimum authored semantic intent and generated structural output; produce a server-side pure adapter/validator behind existing storage, maintaining legacy compatibility.
- Tests show all ordinary entry routes compile to a coherent topic map, rejecting ambiguity and preserving exact identities. Include duplicate request replay and stale revision tests.
- Introduce any new MCP intent tool only after proving an adapter can compile it without a migration. Keep expert tools.

**Slice C — presentation behaviour.**
- Prototype a default reader and 1–2 genuinely task-specific treatments over *the same saved content*. Compare rather than blindly implement all six labels. Validate desktop/mobile, source links, Japanese ruby/TTS, interactive tools, annotations, code, and accessibility.
- Consolidate legacy layout aliases only where a tested compatibility adapter preserves existing Projects and preferences.

**Slice D — model parity acceptance and measured performance.**
- Give two or more models of different capability levels the same authoring intentions in Japanese, computing and open investigation, with ordinary append/targeted updates and fresh-session readback. Measure structural validity, need for repair, duplication/loss, source integrity and organisation; review teaching quality separately.
- Measure Project outline/selected-page read latency and payload. Investigate the avoidable full-composition enrichment in `getProjectLearningReading` if proven material.
- Focused regression, browser/MCP acceptance and release checks on the **current** native source when implementation is commissioned. Agents implementing changes should repair failures they introduce in those processes.

### Non-negotiable acceptance invariants

- Every visible passage links to one authoritative canonical identity and revision; cross-category reuse is never silent prose duplication.
- User-owned Notes cannot be written by GPT; direct user edits, retained renditions, annotation anchors, contributions, file packages, source permissions and explicit overrides retain their protections.
- A normal learning request never creates check-ins, diary entries, achievements, scores, fabricated observations or required self-check steps.
- A model that supplies valid educational content should not need to understand Minamo's section/slot/block/page internals to save it coherently.
- Rich teaching/exploration remains unrestricted by a fixed subject-specific template.

## Questions that need a product decision

1. In ordinary use, should a Project expose one predictable reading surface with optional context-sensitive interactions, or multiple explicit user-chosen views? What would prompt a view switch?
2. Do `dashboard/board/workbench/research/guide/notebook` encode useful interactions, or should they become legacy aliases after comparison?
3. Is the primary unit of semantic role a passage, a reading page, or a relationship? How should a mixed-purpose page be handled?
4. Should a missing role/purpose receive a safe neutral default or prompt the model to clarify? Which mistakes would be more harmful?
5. How much reorganisation should Minamo do automatically versus preserve the learner's exact arrangement? What is the visible, reversible override mechanism?
6. Which organisational inconsistencies are genuinely observed on current Projects, and which are merely potential gaps in the schema?
7. What does success look like beyond structural validity—findability, readability, navigation effort, and independent learner comprehension?

## Evidence quality and boundaries

**Confirmed by inspected V177 source:** presence of distinct editor CSS and shared native reading surface, composition validator rules, role/context optionality, shared browser/MCP topic projection, differing manuscript and MCP creation paths, role-index generation, origin-first page traversal, and existing guard paths.

**Risk candidates requiring targeted tests:** external `page.references` admission across *all* write routes; duplicate canonical section placements; intended semantics of hidden origins and destinations; effective ordering when pages cross sections; actual runtime cost of composition enrichment. A static audit does not establish a live bug, exploit or performance regression.

**Not done:** live browser control, rendered screenshot comparison, runtime test execution, full source-wide dependency proof, user data mutation, new tool/schema rollout, migration or deployment. Those belong in a bounded implementation/acceptance commission after design decisions.

**Recommendation:** The first implementation PR should concentrate on the **projection contract and authoring-path equivalence**, not six new styles. That is the lowest-risk route toward model-independent correctness and a more coherent learner experience.
