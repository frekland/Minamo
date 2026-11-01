# Contextual Learning implementation — resumable progress log

**Status:** coding has begun on draft PR #78 (`docs/contextual-implementation-blueprint`); the product release is **not complete or deployed**. Owner choices 1B/2A and E1–E6 remain the acceptance authority in the [integrated brief](../CONTEXTUAL-LEARNING-INTEGRATED-IMPLEMENTATION-BRIEF.md) and [blueprint](2026-11-01-contextual-learning-implementation-blueprint.md).

## Checkpoint 1 — exact navigation contract (1 November 2026)

Baseline at start: PR #78 head `f0e4f040f588b768cb40da16e1ba0c1c37a79bca`; main inspected as `ec6c3ee` in the blueprint, with newer main commits present by implementation start. Do not assume public/main or native Sites parity without refreshing it before release. All work here is local synthetic/read-only testing, not hosted acceptance.

Implemented in the draft branch:

- `lib/navigation-origin.ts`: a bounded, strict, fixed-slot view-origin codec for source, Activity and originating task; canonical route target parsing shared by native and intercepted links. It rejects malformed/duplicate selectors, unchecked multi-segment ranges, recursive URLs and unbounded origin metadata. This is navigation context only, never a persisted `RecordLink` or permission grant.
- `app/project-navigation.ts` and `app/workspace.tsx`: exact click destination parsing now retains UTF-16 `start`, `end` and `segments`, along with edition, Stage, return context and valid origin. Workspace's URL parser uses the same rule. Existing record/deep-link semantics are preserved where valid.
- `app/navigation-context.tsx`, `app/learning-activity.tsx`, `app/learning-links.tsx`, `app/activity-studio.tsx`: native links and intercepted paths begin carrying the same validated origin. The first viewed source, Activity and originating Question/Stage remain separate; Q2 is not replaced by an unrelated Note's Q1 backlink. No autosave or command has been added to navigation.
- New `tests/contextual-navigation.test.mjs`, plus a failing-then-fixed regression in `tests/project-ui.test.mjs`. The red baseline showed intercepted Project clicks dropped an exact passage range. The first focused rerun passed all 15 navigation/Project tests; `pnpm run typecheck` also passed.

**Important limits:** The codec is a foundation, **not** complete E4. A visible, rights-checked multi-hop return action, precise source/Activity discovery (A01/A03/A05), continuity composition and bounded coverage (R1), deliberate Note passage anchoring/clear (R2/R4), mobile/browser navigation tests and rich-note preservation still need implementation and evidence. The current UI is not yet an integrated source-first design. No claim of a user-facing navigation pass is made from unit/SSR tests alone.

## Next implementation tasks

1. Add A01/A04 source-qualified Activity discovery, covering typed-only versus generic links, edition drift, rights, paging and zero/one/many cases, with focused red→green tests. Make the Reader action explicitly say **Activity** for authored Activities and preserve legacy Tool semantics.
2. Build one bounded read-only continuity evidence composer above the existing Project/work readers, wire the web and MCP scope additively, and exercise C-MOOD/C-CAP/C-PLANT/C-PARTIAL with truthful frontiers and revisions.
3. Integrate rights-checked return cues, selected 1B source-first Home/Project entry, independent/contextual Notes, deliberate anchor capture/clear and draft/flight preservation. Then run actual browser E1–E6 and full gates.
4. Before any merge/deployment, compare the exact public candidate with **current** main and native Sites source, preserve native-only recovery/configuration and follow the protected release workflow. No hosted learner/fixture mutation, reset or Site deploy has happened here.

## Resumption instructions

Read `AGENTS.md`, this log, the integrated brief and the blueprint; inspect this PR's latest head and `git diff` before changing code. Resume at the first unimplemented test oracle, not from historical chat conclusions. Update this log after each verified increment with exact tests, failing cases, SHA and unverified boundaries. Keep PR #78 a draft until full product gates and owner review are appropriate.
