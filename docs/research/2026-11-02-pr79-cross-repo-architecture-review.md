# PR #79 independent cross-repository architecture review — required amendments

**2 November 2026 · review-only decision record; no implementation or acceptance claim.** This report reviews the proposed [learner-first blueprint](../LEARNER-FIRST-PRODUCT-RESET-CODE-BLUEPRINT.md) against the active public `frekland/Minamo` implementation and its private historical predecessor `frekland/minamo-v2`. It is deliberately sanitised: private learning text, IDs, screenshots, personal GitHub operations and host details are not copied here.

## Verdict

**Approve the direction of a structural replacement for further specification; do not approve the initial PR #79 blueprint as an executable final product plan without the amendments below.** The existing Project/Step/Question/Reader/Activity shell must be retired from ordinary learner composition. The strongest unaddressed risk is that Study/Find/Notebook becomes a cleaner archive of accurately saved records rather than a connected experience for *thinking, doing, changing direction and returning*. Replacing navigation alone is not sufficient.

The three permanent destinations are a **navigation candidate**, not a mandated learner ontology. Change them if actual connected tasks demonstrate friction; preserve the hard negative rule against nested legacy shells. No compulsory Projects, Stages, threads, sessions, status tables, formal assessment or new taxonomy may be introduced as a shortcut.

## Cross-repository historical evidence

| Engineering wave | What was implemented or established | Learner-facing lesson |
| --- | --- | --- |
| V2 source and V19–V22 ([private #2](https://github.com/frekland/minamo-v2/pull/2), [#5](https://github.com/frekland/minamo-v2/pull/5), [#19](https://github.com/frekland/minamo-v2/pull/19), [#20](https://github.com/frekland/minamo-v2/pull/20), [#27](https://github.com/frekland/minamo-v2/pull/27)) | Rich exact canonical reading, source rights, authentic Notes and explicit GPT checkpoints, multiple related record families | Capabilities existed early; separate destinations and target-bound progress still imposed assembly work on the learner |
| V24–V28 ([private #32](https://github.com/frekland/minamo-v2/pull/32), [#34](https://github.com/frekland/minamo-v2/pull/34), [#41](https://github.com/frekland/minamo-v2/pull/41), [#86](https://github.com/frekland/minamo-v2/pull/86)) | Task/Focus/Classic presentations and Activity Studio/Atlas, followed by retirement of alternate modes and Atlas | A fresh mode and more panels are not a new information architecture |
| V38–V49 ([private #60](https://github.com/frekland/minamo-v2/pull/60), [#62](https://github.com/frekland/minamo-v2/pull/62), [#63](https://github.com/frekland/minamo-v2/pull/63), [#71](https://github.com/frekland/minamo-v2/pull/71)) | Explicit task pins, single Note coordinator, navigation/Reader improvements, reduced interface filler | A learner-facing edit could still open a publishing package; task selection could leak into unrelated reading |
| V68–V72 ([private #93](https://github.com/frekland/minamo-v2/pull/93), [#98](https://github.com/frekland/minamo-v2/pull/98), [#101](https://github.com/frekland/minamo-v2/pull/101); [public crosswalk](../ux/V70-V72-CROSSWALK.md)) | Unified Projects, ordered Steps, Questions, continuation and 60-finding remediation | 53 resolved/5 deferred/2 partial were engineering dispositions, **not** a 60-item proof of a living Project |
| V75–V89 ([public #36](https://github.com/frekland/Minamo/pull/36), [#50](https://github.com/frekland/Minamo/pull/50), [#65](https://github.com/frekland/Minamo/pull/65), [#74](https://github.com/frekland/Minamo/pull/74), [#75](https://github.com/frekland/Minamo/pull/75)) | Longitudinal histories, recorded MCP operations, read-only relationship analysis and exact route regressions | Accurate individual evidence and successful GPT reconstruction do not make the visible working experience coherent |
| V91–V95 ([draft #78](https://github.com/frekland/Minamo/pull/78); [repeated failure review](2026-11-02-repeated-learner-experience-failure-review.md)) | Contextual Home/host around old Project/Reader/Activity, improved context read and origin code | The additive wrapper reproduced the original route hierarchy, duplicated headings and displayed technical coverage/record language |

[First-hand owner feedback in private #108](https://github.com/frekland/minamo-v2/issues/108) is stronger than any feature inventory: the owner wanted to open work, understand where it stood, see what changed and why, inspect evidence and ask questions in context. Stages were experienced as static, Notes disconnected, and learning developments repeated across panels. A regular `checkpoint` or `update Minamo` is an intentional conversation synchronisation request, not a mastery assessment. The [sanitised 1 November owner correction](../ux/2026-11-01-owner-firsthand-ux-feedback.md) confirms Notes disconnected; Projects/Stages the largest problem; Article→Activity discovery difficult; last activity, next intention, open problems, corrections and progress stale.

The [28 October product philosophy](https://github.com/frekland/minamo-v2/blob/991ab2898877ac8f6eb8d0d3e45eaea38a256cf8/docs/research/MINAMO-PRIOR-ART-AND-PRODUCT-PHILOSOPHY-2026-10-28.md) also rejects reduction to ChatGPT plus a passive Notes store. The valued loop is real activity → source/evidence → interpretation/Question → deliberate GPT interaction → explicit save → meaningful return; external work and learner understanding are distinct.

## Required architectural corrections (review outcome)

### R1 — Real connected working-context projection, not a latest-Note heuristic (P0)

Define a bounded, rights-checked **read-only work projection** combining admitted original Notes, Attempts, explicit developments, corrections, decisions, unresolved questions and source evidence. Group related entries only through valid explicit/typed paths and preserve one-to-many and conflicting relations. A latest event is not automatically the latest intention. The projection can offer an optional plain-language synthesis **with direct source citations, time, authorship and known gaps**, without silently persisting it or manufacturing a settled state. No second authoritative current-status database.

Specify empty, partial, deferred, revoked, multi-hop, chronological and superseded conditions as acceptance oracles. Source coverage is an internal correctness gate; the learner sees natural, accurate limitation language only where it affects a choice. Never say “latest/all/none” if the qualifying read was partial. Do not render raw `coverage.notice` as product copy.

### R2 — Preserve optional evolving work; do not equate Project with Guide (P0)

An authored Guide is optional teaching sequence. An **area of work** (old Project/Journey or a new source-linked undertaking) is an optional contextual lens over changing decisions, multiple sources, activity, Notes and Questions. Its outline is subordinate to actual work. Opening such a context should show recent explicit direction and meaningful change/why, unknowns and authored next actions where available, with original evidence one action away. No forced taxonomy, Session, status categories, graph or new persistent thread.

### R3 — Truly projectless, source-free explicit GPT update (P0)

The proposed `LearningTargetV2.kind='record'` removes the Stage restriction but still presupposes an existing target. Define a high-level, *single user-authorised* “Update Minamo” command for a conversation with **no previously selected record**. It should atomically persist an independently retrievable first-class Note/update (or an equivalent reviewed compatible domain operation), optionally associate selected source refs, retain genuine author/reason/uncertainty, and return one natural receipt. Do not make the learner coordinate a create then separately target a checkpoint. Existing v1 LearningDevelopments, supersession, operation idempotency, CAS, rights and generation checks remain readable. Installed MCP schema exposure and independent fresh-chat readback are actual acceptance gates.

### R4 — In-context optional multi-source work (P1)

The user may compare Article editions, a Note, a practical Attempt and contradictory evidence while keeping a primary focus. Replace single-source-only assumptions with bounded `selectedRefs` and an optional context focus. Exact independent source revisions and selection ranges persist through comparison, GPT handoff and native links only when eligible. No co-visit creates a saved relationship, and no default compulsory worktable is introduced.

### R5 — Useful Find plus natural content creation (P1)

A single search box is not a cross-family discovery contract. Specify server-side permissions, complete/partial pagination, space/language scope, title/body/content retrieval, relevance, exact/older/unpinned Activity relationship quality, historical editions and deliberate creation of missing reference/Activity material via GPT. The learner sees relevant Activity near eligible passages without being sent through a Tool or publishing package. Avoid automatic semantic relationship writes.

### R6 — Exact PR #78 donor dependency manifest and genuine renderer retirement (P0 engineering)

The following referenced modules were verified on PR #78's branch on 2 November but are **absent from public `main`**: `lib/continuity-evidence.ts`, `lib/working-context-read.ts`, `lib/navigation-origin.ts`, `lib/view-origin-return.ts`, `app/working-context.tsx`, `app/continuity-sources.tsx`, `app/continuity-gpt-handoff.tsx` and `lib/continuity-gpt-brief.ts`. A fresh-main branch cannot import them without deliberate extraction. Record every selected donor file, import dependency, invariant test and current-main alternative; never cherry-pick the old contextual host/legacy renderers as a unit. An import-graph and actual DOM assertion must prove the new route does not nest `JourneyRoute`, `LearningHome`, the `WorkingContextHost`, or full legacy Reader/Activity Studio shells.

### R7 — Product acceptance is one complete learning episode (P0 product gate)

Increment A is an **engineering checkpoint**, not a stand-alone proof of improved Minamo. The first product-candidate judgement must include unplanned Note, Article→Activity→Note→exact return, conflicting evolving-work return, projectless fresh GPT update/readback, multi-source comparison and narrow-mobile interaction in one cohesive implementation. Test ordinary discovery without fixture pollution. Use a non-technical/language task and practical external-work task; distinguish actual execution from supplied or simulated evidence. No technical test count or agent-designed satisfaction score can substitute for owner usefulness after a guarded real Site session.

## Repo and decision hygiene

On the PR #79 branch, this review and blueprint supersede PR #78's learner-facing wrapper **as a proposed design**. The old D1/D3, private V70 and Workbench documents remain historical evidence; do not erase them, change their findings or make them current coding authority. Update `AGENTS.md` and the PR description with this routing, conditional on owner acceptance before implementation. Keep PR #79 draft/docs-only until an explicit engineering commission. Any default-route cutover requires genuine authenticated browser evidence and owner judgement. An owner-authorised opt-in Sites candidate may use the documented fast targeted release gate without running the full suite before publication, but must retain source parity, bindings/access, privacy, focused invariants and rollback.

**No source code, database, test fixtures, live Site, MCP contract or real learner record was changed by this document.**
