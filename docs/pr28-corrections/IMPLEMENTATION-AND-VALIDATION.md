# PR28 corrections: implementation and release validation

24 October 2026. Resolves the two findings in [the original V22 acceptance review](https://github.com/frekland/minamo-v2/pull/28). That review remains unchanged. The implementation PR will carry the final hosted acceptance and cleanup receipt in its Conversation and description; this source document records the pre-release engineering evidence.

## Changes

**F01 (P2):** Default and explicit tutor projections now expose already-validated compact global Note evidence in the current resume and prior/exact-detail checkpoints. Each reference retains exact Note id, cited revision, purpose, retained rendition and useful reading destination. Later Note edits do not silently substitute a newer edition. Checkpoint summaries remain separate from independently saved supporting Notes. No Note body, extra retrieval, durable state or new schema is introduced. Existing eligibility, source restrictions, evidence budget, correction, withdrawal, chronology and perspective logic remains authoritative.

Source: `lib/learning-perspective-view.ts` (`LearningResume`, `projectLearningResume`) and `lib/learning-work.ts` (tutor prior/detail projection). Regression: `tests/pr28-note-evidence.test.mjs`.

**F02 (P3):** Home Continue and recent learning cards show “Journey updated since this checkpoint” when the current eligible Journey reading identity differs from the checkpoint's recorded reading identity. Comparison uses rendition rather than record revision, so status/relationship metadata changes do not trigger the cue. Whole-Journey wording remains accurate when another stage changes. Saved learner summary, question, reasoning, dates, basis, navigation and next action remain untouched. No learner progress or automatic checkpoint is inferred.

Source: `lib/learning-work.ts` (`materialChange`, Home projections), `app/learning-home.tsx` and `app/learning-home.css`. Regression: `tests/pr28-home-reading-change.test.mjs`.

## Validation

- `pnpm run typecheck`: passed.
- Sites production build helper: passed.
- `pnpm test`, against the completed production build: **650 passed, 0 failed, 0 skipped**.
- Five focused real Worker/D1/MCP regression cases cover current/prior/detail tutor output, cited Note revisions, multiple checkpoints, correction without stale next-action reuse, Trash/restore, withdrawal, revoked source suppression, evidence-budget deferral, unchanged/metadata/other-stage/current-stage reading edits, current-reading checkpoints, synthetic Home exclusion and Investigation wording.
- Independent source challenge and repeated five focused tests: passed without material findings or source corrections. Additional real Worker/D1/MCP probes cover six-checkpoint cursor history, cross-owner citation refusal, reading reversion and absence of automatic checkpoints. See [independent review](INDEPENDENT-CHALLENGE.md) and [executable probe](independent-probe.mjs).
- `git diff --check`: passed.

One preliminary full-suite invocation overlapped the build and reached the built-worker test before `dist/server/wrangler.json` existed. The clean rerun above ran after build completion and passed. No failure was waived.

## Economy and boundaries

The isolated one-Note fixture adds 354 UTF-8 bytes of reference metadata while omitting a 3,870-byte Note body; total tutor response is 4,590 bytes, delivered by one context read. This is a bounded example, not a token, latency or learning-gain benchmark. The fix forwards an existing eligible projection rather than loading evidence again.

All automated records use disposable isolated D1 fixtures. Home positive fixtures use a local-only principal to exercise genuine-mode projection without ever creating falsely genuine production records. Live acceptance must keep TEST ONLY classification, withdraw its checkpoints, recoverably Trash its records and compare genuine Home/favourites before and after.

No migration, new dependency, external paid service, history system or progress model. Physical Android touch/IME/TalkBack/rotation remain outside a cloud browser's proof. Full hosted acceptance, release identity, MCP output and cleanup must be checked after deployment and recorded in the implementation PR receipt.
