# Bounded high-reasoning implementation-architecture preflight

**Optional planning work; not a blocker before all coding, not a new product discovery study, and not permission to implement/deploy.** Owner decisions: **1B source-first continuation**, **2A repaired Reader→Activity and exact return**, and a **substantial integrated Contextual Learning Experience release**. Governing brief: [integrated implementation brief](../CONTEXTUAL-LEARNING-INTEGRATED-IMPLEMENTATION-BRIEF.md). Evidence: [D3 interaction study](2026-11-01-contextual-learning-interaction-study.md), [read-only continuity/route oracles](2026-11-01-contextual-study-evidence-and-test-oracles.md), current [AGENTS.md](../../AGENTS.md).

## Why spend one Sol 6.1 High task here?

This is a *coding-plan integration problem* rather than another creative design problem. Minamo already has source-aware Notes, activity/source links, Project continuation, GPT context, exact reader anchors, layout/session task state and revision-safe domain commands. The hard part is identifying their **cross-component contracts** without accidentally:

- treating incomplete Project direct relations as complete learner history;
- confusing navigation origin, explicit canonical relation and inferred current learner intention;
- losing original Article rendition/UTF-16 anchor when Activity/Note changes route;
- rewriting a Note edition referenced by an older checkpoint;
- compromising D1 ownership, current-rights redaction, CAS/draft/recovery and synthetic isolation;
- designing 5 unrelated UI features instead of one coherent source-first experience;
- assuming public GitHub source is identical to the private Sites native deployment.

A high-reasoning model can trace these boundaries, pressure-test the architecture against adversarial flows and propose a scoped file/function plan before a normal-chat coding commission. It **cannot** certify future UX or become a substitute for real tests.

## Exact bounded task for the stronger model

### Inputs to read

1. Current main and open PR status, [AGENTS.md](../../AGENTS.md), current product-design authority and [integrated brief](../CONTEXTUAL-LEARNING-INTEGRATED-IMPLEMENTATION-BRIEF.md).
2. Source and current tests for **only** the five workstreams: app/workspace.tsx, app/learning-activity.tsx, app/learning-links.tsx, app/reader.tsx, app/notes-panel.tsx, app/navigation-context.tsx, lib/project-context.ts, lib/learning-work.ts, lib/note-capture-context.ts, lib/layout-workspace.ts, lib/project-return-context.ts, lib/library-return.ts, lib/practice-return.ts, lib/practice-index.ts, lib/record-origin.ts, lib/gpt-context.ts, plus their direct domain/handler contracts and relevant tests. Follow concrete callers/dependencies where needed; no broad PR archaeology or repo-wide style review.
3. [Route regression spec](2026-11-01-pre-design-route-regression-spec.md), [five-question continuity contract](2026-11-01-pre-design-continuity-contract.md), [read-only MCP rehearsal](2026-11-01-contextual-study-evidence-and-test-oracles.md).
4. [Architecture](../ARCHITECTURE.md), [Testing](../TESTING.md), [Sites release workflow](../SITES-RELEASE-WORKFLOW.md). Treat the existing Site/native source differences as a release gate, not an excuse to modify protected private configuration.
5. Existing source-pinned Mood, Cap and Plant synthetic fixtures and test harness *as test inputs only*. No fixture load, reset or mutation for this preflight.

### Questions to settle at the code-plan level

- **Read side:** What exact projection or join is missing to show linked recent Notes across Project→Question, older checkpoints and multiple competing intentions without a persistent CurrentConcern? Where should coverage/asOf, source rendition and “unknown” be carried? What is the smallest read-only API contract and failure state?
- **Navigation:** Which route helpers and caller paths can preserve origin across Stage→Question→Note→Question and Article→Activity→Note→exact Article passage? How do native links, browser History/reload/new tab, multiple linked Questions and cold direct links behave? Which information belongs in URL, current layout session and canonical record?
- **Save side:** Where does Note autosave, local dirty draft, CAS/operation receipts and optional contextual relationship acceptance occur? How would a source-origin receipt survive but *not* silently create a canonical relation or GPT-authored intention?
- **Reader/Practice:** What exact visible Activity affordance can be added with semantic provenance and rights checks, without renaming legacy Tools or rebuilding the catalogue? How does an Activity pinned to Article edition e1 handle e2 and denied e1?
- **Project entry:** What is the smallest change that makes Projects/Stages genuinely optional guidance while maintaining authored sequences, search and old deep links? How to avoid a “new dashboard” that makes reading/doing slower?
- **Release/test architecture:** What integrated test fixtures are sufficient, what negative cases must precede implementation, and how should public-to-native Sites source transfer/rollback be staged?

### Required deliverables — do not code yet

Produce one focused repository-ready **implementation blueprint** with:

1. **As-is call/data-flow map** for (a) source-first Continue and MCP evidence closure, (b) Note save with optional source origin, (c) Article→Activity→Note→return. Cite actual file/functions and the observed gap; mark uncertainty instead of inventing internal APIs.
2. **To-be interface contracts** in TypeScript-like pseudotypes for bounded read-only continuity evidence/coverage, transient route/reading origin and explicit Note/link write intent. State which are *proposed view shapes*, not new persisted schema. Show one example for conflicting Mood, one for sparse Cap/Plant, one for rights-denied/partial history.
3. **File/function change map** grouped by the three build increments and five workstreams. For every nontrivial change include reuse vs new abstraction choice, dependency, possible regression and a deliberate cutline. Prefer a small coherent sequence of PRs, not dozens of micro-PRs or one monolithic unreviewable merge.
4. **Test-first matrix** mapping at least N01/N07, A01/A02/A03/A04, C-MOOD/C-CAP/C-PLANT and E1–E6 to exact existing test suites/new proposed test files, fixtures and success oracles. Identify which tests can run without database writes and which require isolated synthetic mutation under separate authorisation. Do not claim they pass.
5. **One integrated acceptance and release plan** covering public-source candidate, current protected Site-native source manifest, typecheck/build/full tests, browser/mobile/keyboard/draft cases, canonical readback, signed-in scope, rollback and honest incomplete acceptance status.
6. **Three decisive architecture tradeoffs**, with recommendation and rejection triggers: e.g. read-only projection vs persistence, URL-return vs session-only, inline task context vs a new workspace component. Identify one design simplification and one hard blocker if found.
7. A concise **commission-ready handoff** for an implementation chat. Use the owner's 1B/2A choice, not a new design election.

**Output bound:** a short technical report (roughly 2–4k words plus compact tables/pseudotypes) and at most one issue/PR update, if documentation writes are separately authorised. No UI/schema modifications, no deployment, no workflow run spam, no broad competitor survey and no all-nine fresh MCP acceptance programme.

### Completion standard

The preflight is useful only if a normal-chat coding agent can start with exact functions, contracts, first failing tests, dependency order and cutlines **without having to reverse-engineer the entire premise**. It is not useful if it produces another generic Workbench vision, recommends a new model without tracing current source, or just repeats existing audit findings.

A good stop condition: if the source reveals no compelling extra architecture problem beyond the documented route/projection flaws, say so and recommend implementing directly from the existing integrated brief. The high model's job is to reduce implementation uncertainty, not produce planning for its own sake.

## Copyable bounded task prompt

> Minamo — bounded implementation architecture preflight (no coding). In public frekland/Minamo, read AGENTS.md, the owner-selected 1B/2A Contextual Learning Integrated Implementation Brief, the D3 interaction study and the exact MCP/regression ledger. Inspect the current source and tests only where needed to trace source-first Continue, contextual Notes, adaptable Project entry, Article→Activity→Note→exact return, and explicit GPT save boundaries. Produce a 2–4k-word commission-ready file/function architecture blueprint with three call-flow maps, minimal proposed read/route/write contracts, tests-first matrix, coherent integrated PR sequence, release/rollback gates, three decisive tradeoffs and rejection triggers. Use source-pinned Mood/Cap/Plant as read-only adversarial inputs. Challenge added complexity; avoid new Inquiry/CurrentConcern/worktable unless required by concrete failed contract. Do not change application code, fixtures, learner data or Site, do not deploy, and do not claim unrun tests passed. Keep design choices 1B and 2A fixed; this task prepares the ordinary implementation chat rather than replaces it.