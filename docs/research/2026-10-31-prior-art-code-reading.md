# Open-source prior-art code inspection: Project continuity and evolving inquiry

**31 October 2026 · Research note · Static source inspection, not UX acceptance**

This note extends [the learner-experience redesign strategy](../LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md) and the [broader product philosophy](../PRODUCT-CONTEXT-AND-PRIOR-ART.md). It records findings from actual shallow Git clones of three public repositories, with file-level links pinned to the inspected commit. The preceding product comparison relied partly on documentation; the observations below are narrower, traceable implementation findings.

**Scope:** GitLearnOS, DeepTutor, Logseq. Source reading only: no third-party application was run, no dependencies installed, no UI usability test conducted, no code copied into Minamo, and no Minamo product/schema change authorised. These findings describe selected code paths, not an exhaustive security or feature audit.

## Inspected revisions

| Repository | Revision inspected | Licence at repository root | Role in comparison |
| --- | --- | --- | --- |
| [Guojiz/gitlearnos](https://github.com/Guojiz/gitlearnos) | [3db0bac](https://github.com/Guojiz/gitlearnos/commit/3db0bac03ff655fe7c833f941486a7db3ecde264) | MIT | Durable evidence, change semantics, derived current view |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | [1ea7df1](https://github.com/HKUDS/DeepTutor/commit/1ea7df155447f4caf0e3abc86b3ff5395479cd4a) | Apache-2.0 | Workspace snapshots, synthesis, contextual recall, learner-facing controls |
| [logseq/logseq](https://github.com/logseq/logseq) | [e7e9c97](https://github.com/logseq/logseq/commit/e7e9c97c7fcb9c95d1bea156124a12bb20eea053) | AGPL-3.0 | Explicit and unlinked references, contextual block retrieval |

The licence labels above reflect root licence files, not a licence audit of every submodule or asset. In particular, **do not transplant Logseq code into Minamo's MIT source** without an appropriate rights review. Architectural lessons and original implementations are the purpose of this study.

## 1. GitLearnOS: the meaning of change is a first-class record

**Observed:** Its [learning-event template](https://github.com/Guojiz/gitlearnos/blob/3db0bac03ff655fe7c833f941486a7db3ecde264/templates/event-record.md) distinguishes source availability, original judgement, outcome, evidence, what changed, what remains unknown, explicit supersession and conflicts. The [dashboard template](https://github.com/Guojiz/gitlearnos/blob/3db0bac03ff655fe7c833f941486a7db3ecde264/templates/dashboard.md) says that a current dashboard is a linked view derived from canonical records, not another source of truth. Its [source/learner-state guide](https://github.com/Guojiz/gitlearnos/blob/3db0bac03ff655fe7c833f941486a7db3ecde264/docs/source-and-learner-state.md) distinguishes source material, learner-state interpretation and agent memory.

**Useful for Minamo:** A revision of the learner's current understanding is not the same as an edit to a Note or an overwrite of a checkpoint. A derived Project view should keep source identity, versions, uncertainty and superseded interpretations inspectable, without duplicating them as independent truth.

**Limit:** This repository is primarily a protocol of Markdown/Git records and automation templates, not a mature integrated web Project experience. Its prescriptive gap/model/mastery state machine is *not* Minamo's intended learner-directed interaction. Do not expose version-control chores or inferred ability grading.

## 2. DeepTutor: rich memory layering, with consequential trade-offs

**Observed architecture:** [UnifiedContext](https://github.com/HKUDS/DeepTutor/blob/1ea7df155447f4caf0e3abc86b3ff5395479cd4a/deeptutor/core/context.py) separates current conversation, recalled memory, learning journal, selected sidebar passage, source manifest and private runtime state. The [snapshot API](https://github.com/HKUDS/DeepTutor/blob/1ea7df155447f4caf0e3abc86b3ff5395479cd4a/deeptutor/services/memory/snapshot/__init__.py) separately exposes full entities, cheap identity/fingerprint stamps, pending changes, refreshed change logs and paginated history. Its [recall helper](https://github.com/HKUDS/DeepTutor/blob/1ea7df155447f4caf0e3abc86b3ff5395479cd4a/deeptutor/services/memory/recall.py) distinguishes a snapshot of what exists from traces of learner questions and avoids implying unsupported event chronology from a knowledge-base timestamp.

**Useful for Minamo:** Separate (a) authoritative source material, (b) change detection, (c) higher-level interpretation and (d) the current conversation/selected passage. Reading lightweight change stamps can avoid repeatedly sending full Project history to GPT. A selected passage should remain part of contextual navigation.

**Important caveat A — changed entity versus new entity:** In the inspected [L2 update path](https://github.com/HKUDS/DeepTutor/blob/1ea7df155447f4caf0e3abc86b3ff5395479cd4a/deeptutor/services/memory/consolidator/modes/update.py), new material is selected by unseen entity IDs. A revision to an existing entity ID does not itself qualify for that particular incremental extraction path, even though the snapshot subsystem can detect modified fingerprints. Separate audit/update mechanisms may mitigate this; this is a **code-path limitation to investigate, not a proven end-to-end product bug**. For Minamo, the current Project interpretation must not silently become stale when a saved Note or an external source revision changes.

**Important caveat B — provenance granularity:** The same L3 update source explicitly chooses references to whole L2 surface files rather than individual entries. That is simpler to display, but is potentially too coarse when a Minamo learner asks which exact Note or experiment supports a consequential Project conclusion. Keep per-record anchors available even if the default UI is concise.

**Observed UI choice:** [MemoryHub](https://github.com/HKUDS/DeepTutor/blob/1ea7df155447f4caf0e3abc86b3ff5395479cd4a/web/components/memory/MemoryHub.tsx) exposes internal L1/L2/L3 memory layers and their maintenance operations. This might be right for DeepTutor but would be inappropriate default chrome for Minamo. In contrast, [LearningCapturePanel](https://github.com/HKUDS/DeepTutor/blob/1ea7df155447f4caf0e3abc86b3ff5395479cd4a/web/app/%28workspace%29/learning/books/components/LearningCapturePanel.tsx) hides itself when there are no captures, gives a plain-language destination for saved highlights and allows confirmation/rejection when needed. That pattern fits Minamo's aim of meaningful control without routine administration.

## 3. Logseq: reuse a source in context; distinguish references from mentions

**Observed:** The [reference engine](https://github.com/logseq/logseq/blob/e7e9c97c7fcb9c95d1bea156124a12bb20eea053/deps/db/src/logseq/db/common/reference.cljs) resolves explicit backward links, aliases, includes/excludes, nested block context and an independent set of title-only/unlinked mentions. The [reference UI](https://github.com/logseq/logseq/blob/e7e9c97c7fcb9c95d1bea156124a12bb20eea053/src/main/frontend/components/reference.cljs) and [page composition](https://github.com/logseq/logseq/blob/e7e9c97c7fcb9c95d1bea156124a12bb20eea053/src/main/frontend/components/page.cljs) embed related material near the current page instead of requiring copied content.

**Useful for Minamo:** A source Note, source passage or Question can appear in several relevant Project contexts while retaining one identity. Contextual retrieval is more valuable than a mandatory full graph. A textual mention is a candidate link, **not** evidence that one record supports a proposition; confirmation and provenance still matter.

**Limit:** The underlying graph/block infrastructure and its visual vocabulary should not become a compulsory Minamo information architecture. Prior owner feedback explicitly rejected Atlas/graph-style answers to the Project-experience problem.

## Cross-cutting interpretation for Minamo

The following are **design hypotheses**, not decisions to introduce a schema or UI layout:

1. **Canonical evidence and authorship first.** Preserve the learner's original Notes, Questions, evidence links, passage revisions, GPT-authored updates and external verification status distinctly.
2. **Revisable interpretations with source receipts.** Represent important current understandings, corrected assumptions, contradictions and superseded directions *as attributable interpretations*, without erasing earlier versions.
3. **Derived Project read model.** Offer a concise, reconstructible present-tense Project account supported by exact record/revision anchors. The view is not a second authoritative store.
4. **Contextual action, not administrative work.** The learner should be able to ask, inspect an original result, write a thought, return to the inquiry, and explicitly authorise a Minamo update. The system should shoulder indexing and reconciliation.
5. **No unearned certainty.** A code commit is not execution proof; a saved learner report is not an independent observation; a title mention is not a supporting link; an LLM synthesis is not a validated judgement about understanding.

One possible interaction anatomy is **current meaning / active inquiry / inspectable evidence and evolution**, but these are functional needs, **not three mandated panels or tabs**. Minamo should test genuinely different approaches before choosing a layout. A complete rebuild remains an option only after the evidence justifies it.

## Proposed focused experiment (research/design only)

Use the same versioned, changed-direction Project history (initially the existing synthetic Mood-to-Music corpus) to test **two distinct integrated Project interaction hypotheses**:

- **A — focused investigation:** immediate current problem/uncertainty, contextual source exploration, writing and a reliable return path.
- **B — decision-and-evidence return:** current interpretation, consequential change/reason, historical/source inspection, active continuation.

Neither is a prescribed UI screen composition; both must handle the same underlying source identities and revise gracefully after changed direction.

For each, test realistic tasks: orient after interruption; recover one revised decision and its *specific* supporting evidence; distinguish reported from verified observations; follow a linked Question/Note/Library/code passage and return; add thinking without premature classification; explicitly request an update, then verify a fresh GPT recovers committed state.

Record successes and failures separately for **canonical data**, **server/MCP projection**, **visible interaction**, and **model interpretation**. Compare wrong claims, missing source links, navigation/backtracking, unnecessary user chores and actual measured operations/time only when observable. Begin with a narrow viewport; later compare at desktop size. Do not use subjective model ratings as evidence of genuine learner satisfaction.

**Sequence / ownership:** Current testing-fidelity/observability and source-linked continuity work remains with [#17](https://github.com/frekland/Minamo/issues/17) and [#14](https://github.com/frekland/Minamo/issues/14). The visual acceptance runner is [#18](https://github.com/frekland/Minamo/issues/18), deferred until a promising candidate exists. This research is an input to the separate Project-experience design issue; it does not commission a new UI, data migration, external paid competitor trials or a production release.

## Limits and still-open prior-art work

- This is a **first code-inspection pass**, not a full feature-parity comparison or a browser-observed head-to-head study.
- Heptabase, Tana/Capacities and RemNote remain relevant interaction counterexamples; their proprietary UI behaviour has not been verified in this pass.
- Plane/OpenProject/Huly could provide a later targeted comparison of derived state and event history, but generic task-management patterns are not presumed to fit Minamo.
- Source citations are version-pinned; upstream may change. No runtime tests were performed against these three cloned revisions.
