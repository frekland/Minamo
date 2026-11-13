# Discussion: learning-first Minamo, optional Projects and organic knowledge banking

**Status: Product hypothesis and architectural questions — NOT an approved implementation contract.**  
**Raised:** 2026-11-13 in owner discussion.  
**Related:** [PR #12](https://github.com/frekland/minamo/pull/12) (Project reading presentation), [merged PR #10](https://github.com/frekland/minamo/pull/10) (deterministic Project reading and routine authoring).

## Owner's central correction

A learning experience does not begin with a Project. People learn in ordinary, unscripted GPT conversations, including Japanese grammar prompted by a message from a friend, quick Linux experiments, explanations, corrections and diversions. Those valuable moments should be easy to **bank** into an evolving personal body of learning without inventing a dedicated Project or awkwardly attaching the material to an unrelated existing one.

The user should experience a **logical, usable and cumulative representation of what they have learned and are exploring**, presented in the context of what they discussed and what they may want to return to. Connections alone do not make a resource useful. The first view must be coherent, navigable and grounded in actual saved material. Projects remain available for deliberate, bounded efforts, but are **optional** rather than the compulsory owner of new material.

A possible user utterance: “Bank that in Minamo.” GPT should be able to save a useful grammar explanation, the user's original example where explicitly included, meaningful correction, example and uncertainty to a durable appropriate subject context, enrich prior coverage where justified, and make it readily findable later. This is **not** an instruction to store every conversation or automatically perform unrequested writes.

## Working roles to test rather than assume

- **General learning (primary lived experience):** Cumulative personal knowledge and practice across casual conversations, changing interests and subjects. Organisation grows naturally, but stays understandable, correctable and under owner control. This is not a forced new Project called “Japanese Grammar,” an activity timeline or a series of detached micro-notes.
- **Projects (optional workspaces):** Intentional, bounded investigations, language exchanges, software projects and sustained work. They may reuse general learning without owning or duplicating it; Project-specific work stays contextual. A discussion can refer to a Project without all its educational value becoming Project-exclusive.
- **Library (technical/reference support):** Reusable concepts, authoritative explanations, syntax, definitions, working examples and resources that can deepen as coverage develops. The Library supports the learning journey but should not force all personal exercises, attempts, corrections or context into timeless reference Articles.
- **Learner-owned Notes:** Remain independent and user-authored; GPT must not create or alter Notes via indirect paths.

These are **conceptual roles, not an instruction to add new storage families, tabs, services or a rigid taxonomy**. Investigate which existing records can express them.

## Evidence from current contracts (bounded inspection; no new code)

- `lib/contracts.ts` already distinguishes canonical `journey` Projects, `article` Library topics, `area` subject areas, `investigation` Questions, notes and source/capture families. Existing records support versioned rich sections, `learningScope`, exact links, retained renditions and concept references.
- The connected Library can discover subject Areas and canonical Articles, with topical metadata and indexing. A separate graph tool exposes saved links with rights/proposal distinctions. That is an **architectural foundation**, not proof of a satisfactory organic banking workflow or default reader.
- Current editorial policy explicitly describes Library as reusable **reference/further reading**, excluding compulsory exercises, self-checks, prompts and Note-taking instructions. It recommends revising existing canonical coverage rather than duplicating Articles.
- PR #10's simple `append_project_learning_material` writes to an **existing Project**, and therefore cannot by itself answer the general-learning use case. Its identity, provenance, CAS/replay and client-portable authoring principles may be reusable elsewhere.
- No evidence yet establishes that unsaved chat history is available to Minamo as structured source data, that cross-session recency can be attributed correctly, or that natural-language “bank this” can safely select and update existing general learning without excess curation work.

**Provisional architecture assessment:** Existing primitives plausibly support much of the need. Do **not** rush to a new database/store, but do **not** declare the use case solved just because Library Areas, record links and manuscript publishing exist. The missing contract may be capture/organisation/update/retrieval and first-view presentation rather than persistence.

## A user journey worth proving

1. In an ordinary ChatGPT conversation, discuss 〜たあとで and its usage following a Japanese exchange; no Project was selected.
2. The learner deliberately asks to “bank that in Minamo.” The assistant identifies the **actual material worth keeping**: what the user wrote, the explanation, corrected distinctions and small useful examples. It does not claim completion/mastery, save a wholesale transcript or manufacture a learner Note.
3. Minamo searches the relevant existing Japanese coverage and can explain a sensible choice: enrich an existing topic, add a distinct section/topic, or start a new reusable coverage area if nothing fits. Names/placement should be legible, not purely determined by literal keyword overlap.
4. The operation preserves the original example, declared source/provenance and exact revisions, with preview and conflict-safe apply where useful. Any model-suggested associations are proposals until appropriately substantiated/approved; no silent duplication or rewriting of user words.
5. Next week, another natural chat revisits the construction. “Bank this too” should **improve cumulative coverage** rather than create “Japanese chat 17” or a second disconnected explanation. New nuance/history remains recoverable and the current reading improves.
6. From an unrelated intentional Project, the learner may consult this general Japanese knowledge without copying or reassigning its canonical ownership.
7. Opening Minamo shows the learner a **clear, subject-centred view of genuinely saved material**, with recent additions situated naturally and earlier material easy to return to. No graph or Project selector is required to make sense of it.

## Decisions requiring owner discussion and source-backed feasibility analysis

1. **Canonical location of banked learning.** Can existing Article/Area structures be enhanced to hold the right combination of living explanations and personal examples without diluting the Library's reference contract? Is some separately distinguished personal-learning material needed? Do not invent another family until the current one is proven insufficient.
2. **Authority for organisation.** What is an acceptable level of model initiative after an explicit banking request: automatically pick a subject and propose a merge, or apply a reversible, non-destructive well-evidenced edit? How can the learner correct an occasional misclassification without managing tags, IDs or elaborate confirmations?
3. **Update versus append.** How to improve a canonical explanation when a later insight arrives while retaining the learner's original examples, source context, previous revisions and valuable differences? Avoid unbounded append-only clutter and silent replacement.
4. **Cumulative connections.** What evidence can support a material relation (same concept, extends, example, contrast, depends on) and how should uncertain associations be shown without pretending a link establishes pedagogical value? Connections should help retrieval and understanding, not become a visualization goal.
5. **Source and memory boundaries.** What does the ordinary GPT conversation explicitly supply at capture time? How are authored vs supplied translations, feedback, corrections and uncertain claims represented? Do not claim access to an unsaved chat or infer user progress from usage/recency.
6. **What surfaces first.** Home/general learning should represent subjects and the actually saved learning content; Projects can be a distinct intentional view; Library remains usable for reference. Is the existing Home/Library/Project presentation sufficient or does it require one coherent learning-centred entry? First-screen usability is the acceptance target.
7. **Separation of practice and reference.** Japanese free conversation and computational experiments may contain attempts, mistakes, observations and generated exercises that are valuable personally but unsuitable as authoritative Library reference. Decide how these can coexist and cross-reference without corrupting a technical knowledge resource.
8. **Control, privacy and cost.** Owner-initiated save by default; no automatic background capture, no writing learner Notes, no required progress tracking and no constant organisational ceremony. Support small ordinary-chat writes; repeated expensive global scans are undesirable.

## Architectural options to compare, not yet choose

**Option A — reuse existing Article/Area canonical resources with a lightweight personal-learning presentation and capture adapter.** Advantages: mature rich parts, revisions, links, search, no migration. Risk: Reference Library becomes cluttered with casual attempts and provenance is unclear.

**Option B — distinguish cumulative personal learning from curated Library resources while reusing the existing record/part/link/revision infrastructure.** Advantages: honest distinction between working understanding and established reference. Risks: duplicate concepts, another organisational surface and potential need for an explicit source-of-truth/update policy.

**Option C — attach learning to Projects by default and surface a cross-Project overview.** Not acceptable as the default: contradicts the owner's explicit requirement that casual learning not belong to a Project. It may still support deliberately Project-specific material.

Evaluate options against the seven-step journey above and actual source before proposing a schema. Hybrid approaches may be best.

## PR #12 scope and decision gate

PR #12 was originally framed as a **Project reader-only implementation**. That remains a useful, bounded frontend improvement, but it must not quietly establish Projects as the universal container or require users to enter a Project to access general cumulative learning.

**Pause a wholesale reader implementation/deployment decision until the owner chooses whether this is (a) a Project-only quality slice deliberately independent of wider learning architecture, or (b) the start of a learning-first presentation slice across Home/Library/optional Projects.** Either choice can preserve PR #10. A constrained Project-reader improvement may still proceed later, but should not be marketed as solving organic general learning.

Next discussion should settle the conceptual roles, the ordinary “bank this” experience and first-screen goal *before* commissioning a new storage layer, new authoring MCP tools or an elaborate relationship UI.

**Non-goals:** automatic archiving of all chats; inferred mastery; mandatory Projects; duplicative user Notes; forced curriculum, taxonomy, journaling or progress metrics; a knowledge graph masquerading as good UX.
