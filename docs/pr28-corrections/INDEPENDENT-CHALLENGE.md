# PR28 corrections: independent implementation challenge

Reviewed 24 October 2026 against the working implementation in `native-review-source`, with the original PR28 findings and acceptance criteria in `review-output/continuity-source-review.md` and `Minamo-V2-V22-Independent-Acceptance.md`.

**Result: no material correction required by this challenge.** The changes address F01 and F02 at their existing projection seams. This is source and isolated Worker/D1/MCP evidence; production release, installed-client and visual verification remain the lead agent's separate acceptance steps.

## F01: compact Note evidence discovery

The change forwards the existing, already-validated `noteEvidence` into the current resume (`lib/learning-perspective-view.ts:29`) and the tutor's prior/detail checkpoint projection (`lib/learning-work.ts:166`). It does not perform another Note read, add durable state, replace summaries with Note bodies, or change the focused Development retrieval route.

The important security boundary remains before either projection: `eligibleEvent` resolves the exact cited Note revision and retained rendition, under current owner/Trash/source/media eligibility, using the existing eight-revision read budget (`lib/learning-work.ts:29–49`). Invalid or deferred dependency sets expose neither the Note reference nor its purpose and dependent summary. The tutor only projects active prior checkpoints. Its chronological selection, changed-checkpoint receipts, historical page roles and authored-perspective checks are unchanged.

Independently inspected and reran all three new Note regressions. They exercise the actual `/mcp` adapter for default and explicit tutor profiles, current/prior/exact-detail references, later Note revision, correction without borrowing an old next action, Trash/restore, withdrawal, revoked source material, stale perspective suppression and whole-reference budget deferral. The one-reference example adds 354 UTF-8 bytes while omitting the 3,870-byte Note body; the resulting tutor response is 4,590 bytes. This is one isolated fixture example, not a latency or model-token measurement.

Additional adversarial probe: six checkpoints with six distinct supporting Notes. The default response returns four checkpoints with their compact Note evidence. Its next cursor returns the remaining two with Note evidence, `pageRole: history`, and no page-local resume or checkpoint-reading state. No Note-body canary appears. A second owner's Note cannot be cited: saving returns `409 evidence_unavailable`, and no identity or content from that owner appears in the caller's subsequent tutor response.

**Acceptance:** met in the inspected source and local MCP adapter. Current client/deployment verification is still required separately; the local adapter result alone is not proof of installed-client acceptance.

## F02: changed canonical reading on Home

`materialChange` compares the recorded reading rendition with the already-loaded current Journey head; it does not compare record revision numbers (`lib/learning-work.ts:23`). Both Continue and recent-card projections reuse that result (`:140`, `:148`). The cue changes neither saved account, question, next action, meaningful date, basis nor destination. It introduces no checkpoint, progress model, history store or extra record read.

The UI says “Journey updated since this checkpoint” (`app/learning-home.tsx:21`), which remains honest if only another stage changes. The card keeps its existing current-task destination and quiet inline treatment (`app/learning-home.css:6`). Stage-specific comparison would add complexity without satisfying a stronger requirement in PR28.

Independently inspected and reran both new Home regressions. They distinguish unchanged reading, status/relationship metadata edits, another-stage reading edits, this-stage edits, correction retaining the original recorded basis, a new explicit checkpoint against the current reading, withdrawal, synthetic exclusion and Investigation edits. The saved account remains byte-for-byte equivalent for the fields that define its learning account after the other-stage edit.

Additional adversarial probe: change a Journey's body, observe the cue, then restore exactly its original body. The canonical rendition returns to the recorded identity and the cue disappears, despite the higher record revision. The learner's original summary remains exact. Six Investigation checkpoints plus one Journey checkpoint remain exactly seven saved developments after the reads and content edits; no inferred activity was saved.

**Acceptance:** met in source and isolated MCP projections. Actual deployed desktop/narrow-screen rendering and navigation remain the lead agent's visual verification step.

## Reproducible validation

From `native-review-source`:

```sh
node --test tests/pr28-note-evidence.test.mjs tests/pr28-home-reading-change.test.mjs
node docs/pr28-corrections/independent-probe.mjs
git diff --check
```

Results: **5/5 focused regression tests passed**; all additional history/owner-isolation/reading-reversion probes passed; whitespace check passed. Probe source is `independent-probe.mjs` alongside this report; run it from the repository root. The probe uses the repository's real Worker adapter and private-storage fixture. Its two TEST ONLY principals and all records exist only inside a disposable local Miniflare instance, which was disposed in `finally`. It creates no production artefacts and touches no genuine learner records.

## Release judgement and limits

There is no material implementation finding to add to the backlog, and no source change was made by this reviewer. F01's existing exact-evidence validation remains authoritative; F02's whole-Journey reading identity is a proportionate match for the selected cue. No architecture expansion or new interface is justified by this challenge.

This review does not certify educational factual accuracy, measured learning gains, hosted persistence, native Android touch/IME/TalkBack behaviour, deployment identity, production synthetic cleanup or actual installed connector behaviour. Those claims require their corresponding independent receipts. It also does not repeat the whole-app V22 review or audit unrelated permissions/recovery machinery beyond the seams used by these corrections.
