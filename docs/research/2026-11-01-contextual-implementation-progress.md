# Contextual Learning implementation — resumable progress log

**Status:** coding has begun on draft PR #78 (`docs/contextual-implementation-blueprint`); the product release is **not complete or deployed**. Owner choices 1B/2A and E1–E6 remain the acceptance authority in the [integrated brief](../CONTEXTUAL-LEARNING-INTEGRATED-IMPLEMENTATION-BRIEF.md) and [blueprint](2026-11-01-contextual-learning-implementation-blueprint.md).

## Checkpoint 1 — exact navigation contract (1 November 2026)

Baseline at start: PR #78 head `f0e4f040f588b768cb40da16e1ba0c1c37a79bca`; main inspected as `ec6c3ee` in the blueprint, with newer main commits present by implementation start. Do not assume public/main or native Sites parity without refreshing it before release. All work here is local synthetic/read-only testing, not hosted acceptance.

Implemented in the draft branch:

- `lib/navigation-origin.ts`: a bounded, strict, fixed-slot view-origin codec for source, Activity and originating task; canonical route target parsing shared by native and intercepted links. It rejects malformed/duplicate selectors, unchecked multi-segment ranges, recursive URLs and unbounded origin metadata. This is navigation context only, never a persisted `RecordLink` or permission grant.
- `app/project-navigation.ts` and `app/workspace.tsx`: exact click destination parsing now retains UTF-16 `start`, `end` and `segments`, along with edition, Stage, return context and valid origin. Workspace's URL parser uses the same rule. Existing record/deep-link semantics are preserved where valid.
- `app/navigation-context.tsx`, `app/learning-activity.tsx`, `app/learning-links.tsx`, `app/activity-studio.tsx`: native links and intercepted paths begin carrying the same validated origin. The first viewed source, Activity and originating Question/Stage remain separate; Q2 is not replaced by an unrelated Note's Q1 backlink. No autosave or command has been added to navigation.
- New `tests/contextual-navigation.test.mjs`, plus a failing-then-fixed regression in `tests/project-ui.test.mjs`. The red baseline showed intercepted Project clicks dropped an exact passage range. The first focused rerun passed all 15 navigation/Project tests; `pnpm run typecheck` also passed.

**Limits at checkpoint 1:** The codec is a foundation, **not** complete E4. Source/Activity discovery (added in checkpoint 2), a visible rights-checked multi-hop return action, continuity composition and bounded coverage (R1), deliberate Note passage anchoring/clear (R2/R4), mobile/browser navigation tests and rich-note preservation all require separate implementation/evidence. The current UI is not yet an integrated source-first design. No claim of a user-facing navigation pass is made from unit/SSR tests alone.

## Checkpoint 2 — source-qualified authored Activity discovery (1 November 2026)

Implemented after checkpoint 1:

- `lib/practice-index.ts` / `lib/domain-handler.ts`: additive `sourceFamily/sourceId/sourceRendition/sourceSection/sourcePart` filters for the existing read-only `/api/activities/browse` endpoint. The same feature gate, owner/generation/scope admission, retained edition rights, bounded scanning and namespace-version cursor are used. Explicit generic and typed Activity block references are considered; an old e1 cannot silently retarget e2. Exact-part, section and whole-edition matches are visibly distinguished.
- `app/source-activities.tsx` / `.css` and `app/workspace.tsx`: source-qualified, clearly named **Activity** entry points are now rendered above reading material on eligible Articles/topics/Sources. The UI respects disabled Studio, retained editions, new-tab/native links, current learning space, incomplete pagination, narrow layout and foreground refresh. It issues read requests only; it does not add a relationship, Note or checkpoint.
- `tests/contextual-source-activities.test.mjs` exercises isolated real-D1 e1/e2, typed-only and generic links, no guessing, second principal, disabled gate, source Trash and read-only state. The existing `practice-index` suite and SSR native link/origin tests were also run.

Verification after checkpoint 2: `pnpm run typecheck` **PASS**; `pnpm run build` **PASS** (existing large-chunk warnings); `node --test tests/contextual-navigation.test.mjs` **6/6 PASS**; `node --test tests/contextual-source-activities.test.mjs tests/practice-index.test.mjs` **12/12 PASS**; earlier `tests/project-ui` **10/10 PASS**. `pnpm test` and the real Classic browser journey are still unrun on this evolving candidate, and no owner usefulness verdict exists.

**Remaining:** the Reader's visible action is only a source-qualified discovery surface, not proof of a complete A→X→N→A return or an exact saved Note anchor. Source-first continuity projection, explicit return cues, Note lifecycle work and integrated acceptance remain required. Live Site parity, identity, mobile assistive behaviour and native manifest checks are unverified.

## Next implementation tasks

1. Add rights-checked return cues to the shared view-origin contract and an actual Classic browser A e1/p→X→N→X→A regression. Extend A01 negative cases for empty partial pages and later source/Activity changes; preserve legacy Tools.
2. Build one bounded read-only continuity evidence composer above the existing Project/work readers, wire the web and MCP scope additively, and exercise C-MOOD/C-CAP/C-PLANT/C-PARTIAL with truthful frontiers and revisions.
3. Integrate selected 1B source-first Home/Project entry, independent/contextual Notes, deliberate anchor capture/clear and draft/flight preservation. Then run actual browser E1–E6 and full gates.
4. Before any merge/deployment, compare the exact public candidate with **current** main and native Sites source, preserve native-only recovery/configuration and follow the protected release workflow. No hosted learner/fixture mutation, reset or Site deploy has happened here.

## Resumption instructions

Read `AGENTS.md`, this log, the integrated brief and the blueprint; inspect this PR's latest head and `git diff` before changing code. Resume at the first unimplemented test oracle, not from historical chat conclusions. Update this log after each verified increment with exact tests, failing cases, SHA and unverified boundaries. Keep PR #78 a draft until full product gates and owner review are appropriate.
