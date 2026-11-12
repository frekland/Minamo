# Minamo PR27: integrated learning workspace improvements

**Execution, 24 October 2026:** the selected design is implemented. Start with [implementation evidence](IMPLEMENTATION-EVIDENCE.md) and the [PR27 release receipt](https://github.com/frekland/minamo-v2/pull/27) for current source, deployment and installed-client verification. The design/investigation statements below describe their original checkpoint; they are not the final release status.

**Draft implementation design with research evidence · 23 October 2026.** This PR began as an open exploration and now contains a selected scope, implementation map and reproducible synthetic experiments. Proposed product changes are not yet implemented or released. No genuine learner records or current production source were changed.

## Start here

1. [Integrated implementation design](IMPLEMENTABLE-PLAN.md) — synthesis of the owner's original workflow goals and both drafts; selected decisions; exact frontend/backend/MCP seams; data and recovery implications; delivery slices and acceptance gates.
2. [Focused product and learning-quality challenge](FOCUSED-CHALLENGE.md) — four-area assessment, justified refinements, measured continuity/personal-discovery gaps and integrated acceptance. The selected plan incorporates its decisions.
3. [Validation and experiment receipts](VALIDATION-AND-SPIKES.md) — actual source rendering, hosted preview-only MCP, local D1/SQLite and browser prototype observations, with limitations.
4. [Initial exploration](INITIAL-EXPLORATION.md) and [UX/UI and Library growth review](UX-UI-AND-LIBRARY-GROWTH.md) — retained reasoning and alternatives. Their feature lists are superseded by the integrated design for scope/sequence; they are not an additional backlog to execute.
5. [Evidence register](EVIDENCE.md) — pinned source/history, primary research and original authoring experiments.

## Recommended product change

Deliver three connected learner outcomes:

- **Find and use a useful reference:** curated subject hubs, clear technical lookup, useful summaries, exact destinations and a bounded reference preview beside a task.
- **Do practical work, retain reasoning and resume:** focused Journey stages, question-led Investigations, rich Notes, honest evidence, explicit checkpoints and quiet exact handoff into GPT.
- **Create, reuse and revise independent knowledge:** ordinary Markdown authoring, server-owned mechanics, meaningful educational evaluation and revision without losing exact marks or personal work.

Modern visual hierarchy, local reading/workspace settings, responsive layout, accessibility and truthful save/loading feedback are part of those outcomes. Reuse the existing domain, canonical reading, Notes and tutor projections. No new durable learning family, paid inference service or broad architecture rewrite is proposed.

The retrieval experiment supports a conditional lexical improvement with current eligibility and corpus-independent ranking. Exact technical lookup remains intact. Direct Site connectors, extra runtimes, offline packs, cloud preference sync and a new taxonomy remain explicitly deferred unless simpler completed workflows show a concrete need.

The focused challenge strengthens existing continuity with explicit history roles/chronology and optional eligible saved perspective, complete personal rediscovery, richer interaction acceptance and an authored optional self-study case. It adds no memory store, learning-management layer or new taxonomy.

## What the experiments changed

- Seven-checkpoint local-domain/MCP scenarios exposed older-rationale omission, historical-page resume ambiguity and correction chronology; existing wider reads and saved perspective provide bounded remedies. A verbose checkpoint still produced 21.8 KB in tutor mode.
- Actual personal-work filtering over 100 synthetic Notes found an older context match only after the full fixture was supplied; complete personal query is now selected independently of optional Article FTS.
- Two unchanged current Readers produced four duplicate DOM IDs: use an isolated passive preview first or scope the full reader before dual interaction.
- Existing manuscript preview successfully produced curated Area section links plus independent Article memberships: no new Topic entity is needed for first subject hubs.
- FTS AND found a useful destination in 24/33 labelled positive cases versus 16/33 for a strict literal comparator; broad OR added false-positive candidates. Existing GPT reformulation was not measured.
- Global BM25 changed visible order when excluded owner rows were added. Per-passage local scoring retained order under other-owner and old-generation additions in the fixture.
- The UI prototype exposed lost focus and off-screen writing. Corrections were tested with retained synthetic writing, Back/close behaviour and a 390-pixel layout container. This is not physical Android acceptance or production integration.

## Boundaries

All written artifacts in this PR are documentation or clearly labelled non-production research code/data. The production Site remains owner-private V21. Research did not deploy, merge, alter learner records, install infrastructure, expand connector permissions or require a reinstall. PR23 remains draft evidence-only; PR12 is not revived.

The owner's authorisation for this investigation includes focused synthetic experiments. A later execution request can implement the selected design continuously through integration, independent review, realistic testing, correction and private release. It should not restart an unrestricted exploration or treat every deferred idea as a requirement.
