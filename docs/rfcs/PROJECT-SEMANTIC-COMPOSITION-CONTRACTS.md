# RFC: Project semantic structure, composition and model-portable authoring

**Status:** Exploratory / for owner discussion, not approved for implementation  
**Date:** 2026-11-13  
**Change type:** Documentation only; no runtime, MCP schema, database or deployment changes  
**Target:** Minamo's existing Project experience, irrespective of AI model or hosting platform

## Why this RFC exists

Minamo has become significantly more capable, but authoring and presentation remain inconsistent across model interactions. We want a less capable but competent model to use Minamo *correctly* without needing intimate knowledge of its layout internals, while a more capable model remains free to produce exceptionally rich learning material.

**Principle: Minamo owns structural correctness and presentation consistency; the model owns educational judgment and composition.**

This is not a request for a fixed learning script, mandatory lessons, progress tracking, or uniform layouts. It is a proposal to inspect and simplify the *boundaries* between canonical content, its educational meaning, its organisation into readable views, and the components that render it.

## Current observations, provenance and uncertainty

Read-only inspection on 2026-11-13 of exposed Minamo MCP capabilities and the *Making Friends* Project (Project revision 12) shows:

- Six presentation patterns: `dashboard`, `notebook`, `workbench`, `board`, `research`, `guide`; these coexist with `primary`, `secondary`, `sidebar`, `history`, and `freeform` slots.
- Canonical sections contain typed content parts. Project compositions separately express sections, blocks, slots, reading pages, shortcuts and optional work threads.
- Reading pages have stable IDs, titles, ordered canonical `partIds`, a `purpose`, optional `source` links and optional cross-section `layoutId`. The exposed contract asks that every canonical part be covered once.
- The *Making Friends* Project retains canonical exchange blocks containing messages, translations, explanations, vocabulary and exercises, while its reading pages route parts into Messages, Grammar, Vocabulary, Practice and Tests.
- Several authoring surfaces coexist: manuscript publication, Project updates, targeted existing-page additions and global Project reorganisation. Detailed editorial guidance describes recommended structure and presentation.
- Explicit source identities, revisions, ownership restrictions, generated-content boundaries and user-authored Notes protections are already important and must survive any changes.

**Evidence limit:** The above are observations from current MCP responses and one live saved Project, *not* a complete audit of actual running Sites source or an assertion that every documented rule is enforced server-side. A future implementation task must verify invariants and all authoring routes in the native production source.

Related ongoing work:
- [PR #7](https://github.com/frekland/minamo/pull/7): cross-section reading-page routing and Project organisation.
- [PR #9](https://github.com/frekland/minamo/pull/9): shared topic/context reader, exact retrieval and guarded authoring.
- These PRs are still separate, in-flight development. Avoid duplicating, reverting or silently superseding their work.
- GitHub `main` may not contain the most recent native Sites deployment. This RFC deliberately targets `main` as a **standalone documentation branch**, not as an application-source baseline.

## Problem statement

The same material participates in at least four concerns, which need unambiguous contracts:

1. **Canonical identity:** What is the single authored content object, its stable identity, provenance, rights and exact revision?
2. **Educational semantics:** Is this a source, explanation, example, reference, translation, practice activity, observation, etc.? Which source does it explain, translate, expand or exercise?
3. **Reading organisation:** Where can a learner *find* it? Which topic/page groups it, in what order, and what is the distinction between grouping, originating section and displayed destination?
4. **Visual presentation:** How does that content render for a notebook, guide, dashboard, workbench or another chosen layout?

Today, the model may be asked to select or construct too much of (2)–(4) by supplying detailed reading-page and layout metadata. Conversely, the editor, manuscript publication and more granular Project tools may take different paths to an equivalent educational result. Repeated instruction text is not a substitute for server guarantees.

**Working hypothesis, to test:** Overlapping composition mechanisms and under-specified semantics contribute to inconsistent authoring, confusing presentation and model-dependent reliability. Do not prejudge whether the current underlying data model needs significant change; it might mostly need clearer adapters and validation.

## Observed gap: six layout patterns without six distinguishable experiences

**Owner observation (2026-11-13):** When viewing Projects, `dashboard`, `notebook`, `workbench`, `board`, `research` and `guide` are not meaningfully distinguishable visually or functionally. Treat this as a first-class UX and architecture problem, not a request to add six decorative themes.

**Targeted source check (GitHub `main`, V177-derived code):**

- `lib/project-composition.ts` defines these six strings as `patterns` and validates `composition.sections[].pattern` against that enum, alongside section slots and blocks.
- `app/project-reading.tsx` renders every active pattern via the same Project section navigation, topic tabs and shared `Reader` output. It adds a `pc-reading-${layout.pattern}` wrapper class.
- `app/project-reading.css` has no rules specifically selecting these six `pc-reading-*` pattern classes; the native reader's main layout is shared across patterns.
- **Scope limit:** This establishes a weak distinction in the inspected *native reading path*, not that every editor, legacy surface or other view is identical. Audit all routes and the actual rendered UI before deciding.

**Consequences to investigate:** A model or server may choose among six "layout" labels while the learner experiences nearly the same UI. This increases conceptual and authoring complexity without necessarily adding visible utility. It also risks confusing a *semantic Project purpose* (what content is for) with a *view mode* (how the user explores and interacts with it).

**Design choices to compare, without preselecting one:**

1. **Retain six only if each has justified function.** E.g. a workbench might coordinate runnable examples with explanation and observations; research might compare evidence; board might offer meaningful spatial organisation. Differences must be useful on desktop and mobile and not sacrifice accessibility.
2. **Reduce or merge patterns.** If two patterns deliver essentially the same reading and interaction, make them internal presets, aliases or one simpler view rather than requiring a model to choose between nominally different modes.
3. **Use adaptive semantic views.** A Project can contain prose, source dialogues, code, investigations and exercises regardless of a single top-level pattern. Give the user unobtrusive alternatives only where the content and task benefit; do not hard-code a fixed learning methodology.

**Proposed acceptance evidence:** Render the *same canonical learning material* through each current pattern and record actual differences in information hierarchy, navigation, affordances, supported interaction and mobile behaviour. Distinguish a change in labels or decorative CSS from a genuine task benefit. Verify that reading-page routing, exact part identities, the Project editor, advanced content (Japanese, code, drawing, interactive experiments) and Notes remain intact. Do not force users to select or understand an internal pattern to read and continue a Project.

**Open principle:** Neither six separately branded experiences nor a universal one-size-fits-all page is the goal. The number and identity of layouts should follow proven learning-use cases, with a compact, predictable interface.

## Proposed responsibility boundaries

| Concern | Model responsibility | Server / client responsibility |
|---|---|---|
| Content quality | Teach, explain, reason, give original examples, vary depth, choose pedagogy | Preserve content faithfully; do not pretend to certify educational quality |
| Intended learning role | Declare purpose and meaningful source relationships | Validate supported roles and exact references; report ambiguity instead of silently guessing |
| Canonical storage | Request an explicit authorised change | Stable IDs, revisions, CAS, operation replay, provenance, ownership and content immutability where required |
| Organisation | Express a meaningful grouping preference or justified override | Produce/validate a coherent topic map; maintain referential integrity and deterministic defaults |
| Presentation | Supply semantic emphasis and justified preferred format | Safe rendering, consistent spacing/typography/controls, bounded layout patterns and accessibility |
| Continuity | Select relevant existing context, propose useful next material | Exact retrieval, consistent indexes and relationships; no invented user achievements |

### Four separable layers — proposed conceptual model, not a new schema

**A. Canonical content graph.** Immutable or revisioned part identities, author, provenance, literal content, source rights and explicit record relationships. Notes remain learner-authored; GPT receives no implicit Note write authority.

**B. Semantic content roles.** A compact, extensible set of purposes and typed relationships, distinguishing a paragraph's *format* from its *learning role*. Start by mapping existing `purpose`, `part.kind` and `source` fields; do not introduce a redundant taxonomy by default. Roles are not compulsory pedagogical quotas.

**C. Reading projection.** One deterministic, inspectable map from canonical parts to learner-facing topics/pages, with ordering and explicit origins. Preserve useful cross-section routing; establish precisely what 'covered once' means for both canonical placement and multiple contextual links. Prefer links to copying content. Allow intentional custom arrangements without letting different authoring APIs silently disagree.

**D. Renderer and layout patterns.** Six existing patterns become view-level presentation options over validated semantic content. Domain-aware components (e.g. Japanese language with contextual ruby, code, diagrams, tables, interactive practice, drawings) render consistently regardless of which model authored them.

The boundary should be strict about **validity**, not restrictive about **teaching style**. A grammar topic should not require a fixed number of examples. A Linux investigation should not be forced into a Japanese lesson's Messages/Grammar/Tests structure.

## Model-facing API direction (illustrative only)

Explore a simpler *intent + typed educational content* authoring surface for ordinary cases, keeping existing expert composition editing for special layouts. For example, a model should be able to say:

> Add an explanation of 〜てもらう, linked to this specific saved exchange, with two contextual examples and a practice variation.

It should declare the target, the educational intent, relevant exact source references and the authored content. The server would handle stable identities, accepted placement defaults, relationship validation and renderable format. It **must not** invent educational classification when the intent is unclear; return a precise repair hint, or require an explicit choice.

Possible operation families to assess—not new approved MCP tool names:
- `read Project/topic` — compact outline, exact source, material, relationships, valid destinations.
- `add or improve material` — target + purpose + content + explicit links, guarded at a stable revision.
- `reorganise reading` — a deliberate, validated projection change without rewriting canonical material.
- `inspect and repair` — structured diagnostics and bounded suggestions; no silent mutations.

Rich/advanced authoring must remain possible. A simpler default surface should not remove the capabilities of `edit_project_globally`, interactive content, bespoke dashboards or deep research layouts.

## Validation: what should be enforced versus advised

**Hard server invariants (verify current coverage first):**
- Every selected part and relationship resolves to a permitted existing identity and appropriate exact revision; dangling references produce actionable errors.
- No silent content duplication, dropped parts, unexpected content replacement or unauthorised rewriting during reorganisation.
- Deterministic, conflict-safe writes: generation, expected revision, operation identity, replay protection and clear conflict responses.
- A well-defined reading projection with valid order/destinations, respecting any explicit hidden/collapsed state and intentional overrides.
- Preservation of original/source text, declared evidence versus hypothetical examples, source permissions and learner-authored Notes restrictions.
- Validation of supported typed structures and bounded content, including Japanese ruby/translation spans and executable-content safety.
- User-visible learning pages never acquire transport receipts, audit disclaimers, inferred mastery, fake progress or administrative status as learning content.

**Advisory quality checks (not mechanical vetoes):**
- Pedagogical usefulness, depth, example diversity, conceptual accuracy and whether explanations stand on their own.
- Whether the chosen arrangement best supports the subject, or could be less cluttered.
- Opportunities for consolidation, richer examples, alternate views or clearer source links.

Hard enforcement should address *observable structure and rights*; models and humans still evaluate meaning, accuracy and quality.

## Audit questions before implementation

1. Which of the rules described by `get_layout_capabilities` and `get_minamo_editorial_policy` are runtime assertions, which are validators and which are only natural-language suggestions?
2. Is there a single authoritative composition/reading projection shared by Project editor, targeted MCP authoring, global edits, manuscript publication, indexing and viewer?
3. Can two authoring paths produce meaningfully equivalent content but divergent identities, ordering, indexes or presentation? Trace concrete examples.
4. What exactly is the distinction between canonical section, block, reading page, context, topic, slot, `layoutId`, purpose and work thread? Which can be derived?
5. How do new parts become assigned to a page and displayed destination? What happens when that assignment is omitted or ambiguous?
6. How are one-to-many contextual references represented without copying canonical material or violating 'once' coverage?
7. Which typography, language, interactive-content and layout decisions can be made by the renderer rather than encoded in model instructions?
8. Which published and historical Projects—including old layouts—must render unchanged under any adapter or migration?
9. How do page edits, Notes, annotations, favorites, retained renditions, cross-links, source privileges and code packages survive reorganisation?
10. What must a competent smaller model provide to create valid and useful Project content? Which burdens can be removed safely?

## Cross-domain acceptance plan

Use *realistic* contrasting fixtures, with no claims about learner performance:

| Domain | Core test |
|---|---|
| Japanese conversation / *Making Friends* | Keep originals and replies intact; distinguish translations, grammar, vocabulary and practice; contextual furigana and audio remain correct |
| Computing / Linux or Python Project | Technical explanations, commands, code, observations and optional interactive environments stay coherent without forced lesson categories |
| Open-ended investigation | Question, evidence, competing explanations, uncertainty and evolving decisions remain traceable without false conclusions |

For each, exercise:
- Initial authoring, targeted amendment, cross-topic reorganisation and a fresh-session readback.
- At least two model capability levels using the same intent and input; compare structural validity separately from educational quality.
- All public writing paths and direct website editing; both ordinary and advanced layout overrides.
- Deterministic replay/conflict handling, ownership and Note restrictions, saved relationships, revision history and no lost content.
- Browser/mobile visual review: navigation density, page ordering, inline sources, rich media, Japanese presentation and accessibility.
- Retained old Project readback plus genuine current production data, after approval for any migration; no blind rewriting.

Success means **identical structural guarantees across models**, not identical prose or pedagogical choices.

## Phased investigation and implementation sketch (not authorised)

**Phase 0 — native-source architecture audit.** Inspect actual deployed Sites source/revision and current GitHub branch ancestry. Trace complete write/read/render paths, enforcement and tests. Produce an inventory and concrete failure examples. Do not infer production code from stale `main`.

**Phase 1 — contract decision record.** Agree a minimal semantic vocabulary, canonical identity/reference rules, authoritative projection, fallback/override behaviour and cross-domain counterexamples. Explicitly identify what remains advisory.

**Phase 2 — adapters/validators, small slices.** Prefer migration-free adapters and shared validation over a rewrite. Keep old Project versions and existing tools compatible. Add structured diagnostics and focused regression tests before exposing new model-facing conventions.

**Phase 3 — presentation and portability acceptance.** Refine the renderer to consume the agreed semantics; run side-by-side model authoring and visual/browser acceptance. Only then consider retiring redundant mechanisms or a data migration, with explicit owner approval and rollback plan.

Implementation tasks should test and fix failures they introduce during build, deployment and browser/MCP acceptance, with the release baseline established first. No implementation/deployment is requested by this RFC.

## Explicit non-goals and protections

- No immediate architectural rewrite, new mandatory layouts, fixed lesson schemas, progress/checkpoint/achievement records or ceremonial workflow.
- No model-generated Notes, automatic session diary or inferred user observations.
- No forced decomposition of every Project into Library Articles or Questions; owner-directed creation boundaries remain intact.
- No deletion of expressive advanced layouts, Python/drawing controls, data relationships, source revisions, or learner edits.
- No production data migration, deployment, merger or app-source modification from this exploratory PR.
- No coupling to Anna or any single alternative hosting/model provider; portability is a useful architectural stress test, not a platform change.

## Decisions to refine with owner

- Is the existing canonical section/part structure sufficient, with a derived semantic projection, or is a narrowly scoped schema extension justified?
- Should semantic purpose be primarily attached to parts, reading pages, or an explicit relation? How are mixed-purpose pages handled?
- When should the server choose a default destination, and when should it ask the model to be more specific?
- Which advanced override capabilities are essential, and how should they be surfaced without confusing ordinary authoring?
- How should visual presentation consistency be measured independently of teaching quality?
- What would genuinely demonstrate reliable use by less capable models, rather than a benchmark that rewards mechanical compliance?

## Decision log

- **2026-11-13:** Owner agreed to explore stricter, clearer MCP and server-side Project layout organisation, preserving flexibility of educational composition. Open documentation-only draft PR for discussion.
- **2026-11-13:** Owner identified weak user-visible distinction among six Project layouts. Initial source check confirms the native Project reader shares its component/structure and has no six-pattern CSS specialisation. Investigate whether to differentiate meaningfully, simplify the pattern vocabulary or move to adaptive semantic views; no implementation decision yet.
- **Pending:** Confirm production-source audit, target contract shape, migration/compatibility strategy and phased implementation. No architectural decisions are final.
