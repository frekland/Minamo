# Minamo Project reader V2 — coherent learning experience first

**Status:** Draft proposal; implementation scope is under owner discussion after a wider learning-first paradigm correction. No application implementation or deployment in this PR yet.

**Baseline:** `main` after [merged PR #10](https://github.com/frekland/minamo/pull/10), merge `811222cc6391e824cd15d658b86a85113d726963`. Its deterministic reading projection, canonical source identity, revision guards and routine MCP authoring are accepted. Do not reopen MCP schema work or repeat source reconciliation.

## Fundamental scope qualification — Projects are optional, learning is cumulative

**Do not assume that every valuable learning interaction belongs to a Project.** The owner has clarified that general learning often arises in ordinary GPT conversations (for example Japanese grammar encountered while messaging a friend), without an intention to create or contribute to any Project. The desired primary Minamo experience is a coherent, cumulative, organically organised body of saved learning that can be enriched across conversations. Projects are optional intentional workspaces. Library provides reusable technical/reference support and must not be overloaded with casual learner attempts by default.

The larger paradigm and unresolved architectural questions are recorded separately in [Learning-first organic banking discussion](LEARNING-FIRST-ORGANIC-BANKING-DISCUSSION.md). It compares reusing Article/Area and existing record/part/link/revision primitives against a distinct personal-learning role, without approving a new schema.

**Decision gate before implementation:** Confirm with the owner whether to proceed with this narrowly scoped *Project reader quality* slice as an intentionally limited improvement, or adapt the commission to explore a *learning-first entry/reading experience* that works outside Projects. Do not start implementation, deploy or treat the Project-centric first view below as Minamo's universal default until that discussion. PR #10 remains accepted and is not reopened.

The remaining sections specify useful **Project-local** interaction requirements only, contingent on the scope decision.

## Product problem and order of priorities

A learner opens a Minamo Project to understand and use **what they are learning**, not to admire how records are interconnected.

The **first, unassisted view** must answer three practical questions:

1. **What does this Project contain?** A logical, legible organisation of subjects, material and activities that suits the discipline. Avoid forcing a generic educational template.
2. **What is relevant to the work just discussed or saved?** Make recently added material and the actual current reading location easy to find **within the existing subject**, not as a detached feed or opaque list of updates.
3. **How does this connect to earlier work?** Let someone resume reading and revisit previously explored examples, explanations, conversations, code or evidence without mentally reconstructing an entire conversation history.

The primary product is a **refined, evolving learning resource**: readable, current to the content actually saved, navigable by meaningful subject, and capable of substantial accumulated material. An elegant compare panel is not a substitute for getting that initial reading experience right.

**Success order:** ordinary content-first orientation → precise recent/revisited material → effortless focused reading → optional related-material exploration. If trade-offs arise, prioritise the first three. Relationships are data the reader may use; they are not the default UI.

## Grounded existing capabilities and constraints

- `app/project-reading.tsx` already selects one destination section/topic from `projectLearningMap`; it presents section tabs, topic navigation, `Reader` content, related-material links, Explore, a saved last-opened topic and edit affordances.
- `app/project-reading.css` has common responsive rules; six legacy `composition.sections[].pattern` labels do not make six distinct normal reading experiences. Do not solve this through six themes.
- `app/project-context-overview.tsx` already offers a subject/context overview and optional purpose index. Reuse and improve these rather than creating another dashboard and overlapping navigation systems.
- `lib/project-learning-map.ts` / `lib/project-reading-topics.ts` provide exactly resolved visible sections, topics, contextual groupings and optional explicit relationships. PR #10 established destination ordering, hidden-origin routing and canonical identity safety.
- Existing `Reader` renders prose, ruby/furigana, TTS, annotations, contributions, code, tables, interactive content and exact passage anchors. Preserve its capabilities and primary reading state.
- The current Project record, revision/retained changes, optional explicit continuation targets and local last-opened state provide **different types of evidence**. Do not conflate “last opened”, “recently saved”, “last discussed” and “completed”. No omniscient record of learning progress exists.

If a Project-local reader slice is approved, inspect these components narrowly before implementation; keep it focused on visible user outcomes rather than a new architecture review. Do not claim it solves general-learning capture or organisation.

## Required implementation: the everyday Project experience

### A. Make the initial view a useful representation of learning material

- Present the saved Project's **actual subjects/contexts and meaningful topics** in a hierarchy the learner can scan. Titles, section placement, and content types should communicate what is there. Avoid displaying internal `layoutId`, `blockId`, operation receipts, generic type labels or verbose administrative metadata.
- Make the **selected material** substantial and enjoyable to read, with sensible hierarchy, spacing, page titles and continuity of examples. Avoid duplicate headings, redundant navigation rows and competing “Explore / Related / Next” controls.
- Preserve the Project's authored disciplinary organisation. For example, Japanese may contain messages, grammar, vocabulary and practice; computing may contain concepts, code, observations and tests; research may contain questions, evidence and interpretations. **Do not impose one universal set of sections.**
- Keep navigation proportional to content volume. A three-topic Project should not look like a dashboard. A Project with dozens of topics across repeated sessions should remain discoverable without a wall of topic tabs or a timeline of disconnected fragments.
- Choose a calm **single-reading default**, with contextual navigation available but not dominating content. Responsive behaviour must support real narrow mobile screens.

### B. Make the actually current/recent material findable *in context*

- A new passage added through PR #10's routine authoring under an existing topic/context must be discoverable **where it belongs**. It must not appear lost in an undifferentiated list or require the reader to know an internal layout.
- Distinguish **user-selected/currently open topic**, **saved last-opened topic**, **explicit saved continuation**, and **newly added content** when actual revision/source evidence is available. Use clear, unambiguous labels; never call “last opened” or the newest database revision “what you're currently learning” as a factual assertion.
- Only show “recently added” or chronological ordering when the UI has reliable, accessible source revision/time evidence for the relevant pages. If that evidence isn't available without expanding this slice, provide accurate “last opened”/topic orientation and a clear route to new content; **do not fabricate recency or infer it from array order**.
- After a verified save or re-opening a Project, make relevant saved changes findable through the existing topic/context structure. Do not automatically replace the user's current reading, scroll position or chosen topic merely because new content arrives.
- Earlier content remains readily accessible through stable subject/context grouping and exact source links; avoid a separate diary, mandatory checkpoint, learner ability scores, artificial “next step” or presumed mastery.
- Where authored material is broad or poorly titled, preserve its literal canonical content and present existing meaningful metadata; don't silently rewrite prose or invent a better curriculum.

### C. Refine the core reading/navigation interaction

- Reduce existing duplicated Project headers, navigation and edit actions only where inspection of actual rendered UI shows a concrete benefit. Preserve a reliable route to section and topic changes, context overview and direct user editing.
- Keep the ordinary reading flow continuous: navigate within one context, return to an earlier topic, follow an exact saved link and return without losing place. Support long accumulations of pages and older material.
- Retain current `onVisibleTopic`, deep-link/anchor targets, last-opened semantics, keyboard/focus handling, accessible labels and safe mobile scrolling. Never render fake “sessions”, “learning achievements” or status banners as the primary content.
- Preserve furigana, Japanese voice controls, tables, code readability, interactive components and learner contributions. A cleaner reader must not strip pedagogical richness.

### D. Relationships and comparison are **supporting**, not primary

- Existing explicit `source`, `relations` and `references` must remain findable in context **without presenting a web of links as the headline of the Project**.
- When useful and safely implementable, offer an unobtrusive, **user-invoked** way to inspect one exactly related passage without abandoning the current one. The default state must not display a second pane or consume extra screen space.
- An automatically offered pairing requires a real local relationship (`source` or `relations[].target`) resolving to a visible available canonical passage. Same context, proximity and purpose labels alone do not imply semantic equivalence, translation or contrast. Existing relation kinds are `explains`, `practises`, `corrects`, `continues`, `related`; do not invent `translates` or `contrasts`.
- A user may intentionally choose a second topic within an exact context for comparison, but it must be identified as **user-selected**, not an inferred relationship. Do not add a permanent comparison tab to every page.
- Do not naïvely mount two full `Reader` instances with duplicate anchor/DOM IDs or conflicting selection, annotations, focus, TTS, contribution actions, scroll state, last-opened state or `onVisibleTopic`. A secondary read-only excerpt with an exact “Open full passage” action is preferable to destabilising the primary Reader.
- **Full side-by-side comparison is optional in this first slice**. Implement only if the first-view and navigation acceptance is already strong and it fits without a substantial Reader refactor. Otherwise defer it explicitly; the PR should still be considered complete when the core experience passes.

## User acceptance scenarios: prioritise lived usefulness

1. **First open, Japanese:** Open a substantial synthetic language Project accumulated over multiple conversations. Without choosing Explore or Comparison, see a comprehensible overview of what it contains and the selected saved learning material. Find a recently added grammar/example page in its proper subject/context; find the original exchange again; read Japanese with functioning furigana/TTS.
2. **Return after additional material:** Append a paragraph/table through the accepted routine MCP contract to an existing context, then reopen or refresh the reader. Confirm it is findable within its subject, the original example has not changed, and the user can move between new and older material without losing their reading location. Verify any “recent” or “last viewed” labels are genuinely supported by their data.
3. **Long-running computing Project:** Use a realistic multi-topic, multi-session synthetic Project with code, explanations, observations, reference tables and exercises. Find a specific earlier concept and a newly added explanation quickly; do not demand scanning a wall of chips/tabs, navigating internal block IDs or scrolling through an activity log. Confirm code and interactions remain readable.
4. **Research Project:** Find the current question/material and earlier source and interpretation independently. Explicit source relationships remain available but do not overshadow the actual research prose and evidence.
5. **Minimal and legacy Projects:** A small Project, a Project with no explicit semantic purposes and a read-only historical rendition should remain legible and truthful. Do not invent “current focus” when data doesn't support it.
6. **Responsive and accessible:** Run real browser acceptance on desktop and mobile-sized viewports. Verify content hierarchy, long topics, table/code overflow, controls, anchors, keyboard/focus, annotations and return navigation. No horizontal page-wide overflow or nested scroll traps.
7. **Secondary relation smoke test (only if implemented):** Check explicit valid link, no link, hidden/unavailable passage, shared context without relationship and same canonical-section sources. Verify safe primary Reader identity and easy return.

**Evaluate the first screen and the ordinary return-to-Project journey before any optional relationship interaction.** Capture concise screenshots/observations of both; fix issues found. Prefer naturalistic material over skeletal test fixtures; synthetic data only, no modifications to genuine learner Projects.

## Conditional implementation and release controls

- **Do not commission this implementation until the preceding scope decision is made.** If the owner elects the Project-local slice, work only on this PR branch. Retain it **open, draft and unmerged** until owner review.
- Frontend-first changes in `app/project-reading.tsx`, `app/project-reading.css`, `app/project-context-overview.tsx` and small relevant helpers/tests. Reuse the existing Reader, Project topic map, design tokens and rendering components.
- No new Project store, MCP schema or authoring rules; no migration, canonical rewrite, Note editing, invented progress or large cross-record retrieval subsystem.
- Do not broaden into a redesign of global navigation, Library, Notes or Project administration. Avoid six cosmetic layouts.
- **Efficiency:** do not repeat PR #10 baseline reconciliation or broad backend tests. Focused UI/state regressions; one stabilised typecheck and production build when warranted.
- Commit actual source, targeted tests and concise evidence into this existing PR, **then deploy to the existing Minamo Site** preserving application identity, authentication, data and bindings.
- Test the actual deployment in desktop and mobile contexts. Fix pertinent failures and record exact GitHub/Natives Sites source/deployment parity. Do not claim an unavailable browser test was performed; do not deploy a patch that loses user data.
- Defer nonessential secondary comparison, runnable-workbench integration and broader Project redesign rather than sacrificing first-view quality to deliver more features.

## Project-local definition of done (only if approved)

A learner can open an existing Project and readily tell **what the saved material covers**, identify the **actual selected or recently saved material where evidence permits**, read it comfortably, and recover **relevant earlier material through clear organisation**. The experience is calm and content-first, handles growing real-world Projects, and preserves the underlying canonical learning material and rich interactions.

A polished graph, relationship explorer or two-column comparison **does not satisfy this PR** if the basic Project reading experience is still confusing, stale or cluttered.

## Not solved by this Project-only brief

Ordinary GPT-driven, Project-independent banking of valuable incidental learning; non-Project cumulative organisation and enrichment; the Library/personal-learning role boundary; and a learning-first Home/read experience remain **open decisions**, not acceptance claims of this PR. See the companion discussion before implementing new patterns that might reinforce Project-first assumptions.
