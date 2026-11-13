# Discussion: cumulative learning across conversations; optional Projects and Library

**Status: Product hypothesis and architectural questions — NOT an approved implementation contract.**  
**Raised:** 2026-11-13 in owner discussion.  
**Related:** [PR #12](https://github.com/frekland/minamo/pull/12) (Project reading presentation), [merged PR #10](https://github.com/frekland/minamo/pull/10) (deterministic Project reading and routine authoring).

## Owner's central correction

A learning experience does not begin with a Project. People learn in ordinary, unscripted GPT conversations, including Japanese grammar prompted by a message from a friend, quick Linux experiments, explanations, corrections and diversions. Valuable material from those moments should be possible to **retain and organise** in an evolving personal body of learning without inventing a dedicated Project or awkwardly attaching the material to an unrelated existing one.

The user should experience a **logical, usable and cumulative representation of what they have learned and are exploring**, presented in the context of what they discussed and what they may want to return to. Connections alone do not make a resource useful. The first view must be coherent, navigable and grounded in actual saved material. Projects remain available for deliberate, bounded efforts, but are **optional** rather than the compulsory owner of new material.

The owner's casual language about retaining learning is **not** a proposed product name, button, command, prompt template, compulsory phrase or default action. Do not implement “Bank this,” “Save learning,” or any other specific UI string from this discussion without separate UX evidence and approval. The real request concerns the resulting experience: meaningful material may be intentionally retained from an ordinary conversation, developed into coherent cumulative coverage, and found again without assigning it to a Project. Do not archive conversations or write unrequested material by default.

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
- No evidence yet establishes that unsaved chat history is available to Minamo as structured source data, that cross-session recency can be attributed correctly, or that varied ordinary user intent can safely select and update existing general learning without excessive curation.

**Provisional architecture assessment:** Existing primitives plausibly support much of the need. Do **not** rush to a new database/store, but do **not** declare the use case solved just because Library Areas, record links and manuscript publishing exist. The missing contract may be capture/organisation/update/retrieval and first-view presentation rather than persistence.

## Behavioural scenarios to evaluate — NOT suggested UI copy

1. A learner has an ordinary GPT conversation about a Japanese construction arising from a message; no Project was selected. At some point they **deliberately request durable retention of some useful material**, using natural language of their own choosing. Do not assume a keyword, command phrase or predefined button.
2. The assistant identifies **what is actually worth retaining**: original learner wording where appropriate, explanations, corrected distinctions, examples, and unresolved questions. It distinguishes saved source material from GPT-authored interpretation and does not claim mastery, store a wholesale transcript or create a learner Note.
3. The system examines **relevant existing coverage**, then selects among a grounded non-destructive extension, a genuinely distinct subject entry, a reusable reference update, or no write. The learner should not need to classify records manually; when uncertain, make the decision intelligible rather than acting confidently on a weak text match.
4. A later unrelated conversation develops a similar point. When the learner again requests retention, Minamo should enrich or relate material where justified, not scatter duplicate fragments or silently overwrite an authentic example. Retain source/revision evidence and meaningful differences.
5. An optional Project may use this knowledge without becoming its mandatory home. Existing Library reference material may support it without becoming a repository for personal attempts.
6. The learner returns and **understands the material itself**, can find both newer and earlier coverage by meaningful subject, and can resume the context that matters. Neither a graph, a Project selector nor any record-management verb is a prerequisite.
7. Negative cases: the learner is only asking a question and does **not** want persistence; the material already exists; the relevant context is ambiguous; the later conversation contradicts the earlier explanation; the learner's original wording must be preserved. The system must avoid writing, duplicating or silently rewriting as appropriate.

## Decisions requiring owner discussion and source-backed feasibility analysis

1. **Canonical location of retained personal learning.** Can existing Article/Area structures be enhanced to hold the right combination of living explanations and personal examples without diluting the Library's reference contract? Is some separately distinguished personal-learning material needed? Do not invent another family until the current one is proven insufficient.
2. **Authority for organisation.** What is an acceptable level of model initiative after an explicit retention request: automatically pick a subject and propose a merge, or apply a reversible, non-destructive well-evidenced edit? How can the learner correct an occasional misclassification without managing tags, IDs or elaborate confirmations?
3. **Update versus append.** How to improve a canonical explanation when a later insight arrives while retaining the learner's original examples, source context, previous revisions and valuable differences? Avoid unbounded append-only clutter and silent replacement.
4. **Cumulative connections.** What evidence can support a material relation (same concept, extends, example, contrast, depends on) and how should uncertain associations be shown without pretending a link establishes pedagogical value? Connections should help retrieval and understanding, not become a visualization goal.
5. **Source and memory boundaries.** What does the ordinary GPT conversation explicitly supply at capture time? How are authored vs supplied translations, feedback, corrections and uncertain claims represented? Do not claim access to an unsaved chat or infer user progress from usage/recency.
6. **What surfaces first.** Home/general learning should represent subjects and the actually saved learning content; Projects can be a distinct intentional view; Library remains usable for reference. Is the existing Home/Library/Project presentation sufficient or does it require one coherent learning-centred entry? First-screen usability is the acceptance target.
7. **Separation of practice and reference.** Japanese free conversation and computational experiments may contain attempts, mistakes, observations and generated exercises that are valuable personally but unsuitable as authoritative Library reference. Decide how these can coexist and cross-reference without corrupting a technical knowledge resource.
8. **Control, privacy and cost.** Owner-initiated save by default; no automatic background capture, no writing learner Notes, no required progress tracking and no constant organisational ceremony. Support small ordinary-chat writes; repeated expensive global scans are undesirable.

## Objective design gates — avoid designing from metaphors or example phrases

A compelling description of “organic learning” is insufficient evidence of a usable system. Evaluate the actual behaviours along these axes:

- **Capture boundary:** Which content is available in the current ChatGPT conversation, what does the learner authorise Minamo to persist, and what can be safely extracted without misrepresenting the learner?
- **Content quality and identity:** Does the retained result stand on its own, preserve the original example and provenance, and distinguish a learner's attempt from a reusable reference explanation?
- **Placement correctness:** Can a reasonably capable model select an existing semantic home, avoid near-duplicates, and explain uncertainty? Do not claim semantic understanding from exact link storage or keyword search.
- **Cumulative refinement:** When new material arrives, can existing coverage become more useful *without* silent replacement, endless append-only fragments or inappropriate merging of unlike concepts?
- **Retrieval and first-view quality:** On returning days later, can the learner locate a specific example, correction or concept without remembering which chat or Project contained it? Measure first-screen clarity and time/steps to find material; do not count mere numbers of links as improvement.
- **Failure behaviour and agency:** What happens when the system cannot place something confidently, gets it wrong, cannot retrieve source context or hits a revision conflict? Correction must be simple and non-destructive, not an elaborate content-management workflow.
- **Operational cost:** Prefer low-friction routine operations. Do not repeatedly scan all material or require GPT to maintain an entire personal knowledge graph with every small update.

No specific frontend copy, “bank” button, automatic suggestion mechanism, new route or view hierarchy is approved here. A prototype or focused usability test using realistic accumulated content must establish a need before proposing those artefacts.

## Architectural options to compare, not yet choose

**Option A — reuse existing Article/Area canonical resources with a lightweight personal-learning presentation and capture adapter.** Advantages: mature rich parts, revisions, links, search, no migration. Risk: Reference Library becomes cluttered with casual attempts and provenance is unclear.

**Option B — distinguish cumulative personal learning from curated Library resources while reusing the existing record/part/link/revision infrastructure.** Advantages: honest distinction between working understanding and established reference. Risks: duplicate concepts, another organisational surface and potential need for an explicit source-of-truth/update policy.

**Option C — attach learning to Projects by default and surface a cross-Project overview.** Not acceptable as the default: contradicts the owner's explicit requirement that casual learning not belong to a Project. It may still support deliberately Project-specific material.

Evaluate options against the seven-step journey above and actual source before proposing a schema. Hybrid approaches may be best.

## PR #12 scope and decision gate

PR #12 was originally framed as a **Project reader-only implementation**. That remains a useful, bounded frontend improvement, but it must not quietly establish Projects as the universal container or require users to enter a Project to access general cumulative learning.

**Pause a wholesale reader implementation/deployment decision until the owner chooses whether this is (a) a Project-only quality slice deliberately independent of wider learning architecture, or (b) the start of a learning-first presentation slice across Home/Library/optional Projects.** Either choice can preserve PR #10. A constrained Project-reader improvement may still proceed later, but should not be marketed as solving organic general learning.

Next discussion should settle the conceptual roles, ordinary conversation-to-retained-learning flow, user control and first-screen goal *before* commissioning any new storage layer, authoring MCP tools or an elaborate relationship UI.

**Non-goals:** automatic archiving of all chats; inferred mastery; mandatory Projects; duplicative user Notes; forced curriculum, taxonomy, journaling or progress metrics; a knowledge graph masquerading as good UX.
