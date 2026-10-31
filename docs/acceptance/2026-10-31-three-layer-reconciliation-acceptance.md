# TEST ONLY — coordinated three-layer MCP / D1 reconciliation (31 October 2026)

**Verdict: PASS — bounded synthetic-scoped three-layer reconciliation, with one explicitly classified selector exclusion.** This is the executing chat's controlled evidence and source-based reconciliation, not an independent ChatGPT host audit, cryptographic tool-dispatch attestation, production privacy certification or learner-experience assessment.

Related: [#17](https://github.com/frekland/Minamo/issues/17), [#14](https://github.com/frekland/Minamo/issues/14), [#12](https://github.com/frekland/Minamo/issues/12), [protocol](three-layer-reconciliation-protocol.md), [V85 acceptance](2026-10-31-v85-observed-mcp-state-diff-acceptance.md), [V86 matrix](2026-10-31-observation-adversarial-matrix.md). Public source inspected at `5bb53b648824591c37bc1f891aa27575e9fd1fee`; actual hosted reference is the previously documented restricted Sites **V86** release, native SHA `f5c604062f7a6829f3121424d6223a8424615523`. GitHub source and deployed native bytes are separate evidence layers.

## Exact registered identity and safety preflight

- Scenario `mood-to-music`, fixture `mood-to-music/3`, fixture-source pin `f7cc6dc54064b669929a384ea9464eb310b6d397`, generation `legacy@0`, active K / epoch 3 / controller revision 21, no pending transition at preflight. These are fictional TEST-ONLY records, not the owner's genuine learning history.
- Existing open transcript `TEST-ONLY-m2m-r3-s01-v77-20261030` at revision 40, 40 events, `S06` registered for phase K. The historic V77 model/site metadata remain model-reported, not a claim that the current deployed Site is V77.
- Matching observation run was **paused** at observer revision 1, 10 existing observed events, six previous canonical snapshots; capacity 600 calls / 80 captures was not exhausted. Re-armed the same run/session with a new idempotent control operation; did not create a new run, change the fixture, or seal the observer.
- Exact synthetic Article `TEST-ONLY-m2m-r3-reference` was revision 1 with unchanged rendition `r-3dff1a6295cc5badac59ef7a0045d621f20fb237cb1adfd2bb067fb3fa0758df`; its record Flag was inactive at target revision 2. The target was validated from a fresh canonical record read before any mutation.

## Paired transcript and received-call ledger

The existing append-only transcript advanced **40 → 58** via nine model-reported attempt/result pairs (sequences 41–58), with unique entry and operation identities and no missing sequences. Each attempt was appended *before* dispatch and each result after actual client return/error. Only minimal selectors/outcomes were submitted; not prompt bodies or raw learner content. The observer gained **eight** new server-received events (10 → 18), all on `S06` / K. Every received timestamp fell between the corresponding immutable attempt and result entry timestamps. Pairing uses tool, outcome, order and bounded time; there is **no common host/server dispatch token**, so this is a defensible analytical match rather than a cryptographic individual-call identity proof.

| Step | Transcript sequences | Submitted tool | Received server call / outcome / elapsed server time | Classification |
| --- | --- | --- | --- | --- |
| A1 | 41-42 | `query_minamo_records` | `81e4b1ab-93c9-479e-b009-6517a12e3e66` · success · 1959 ms | Corroborated by tool, outcome, sequential timing window |
| A2 | 43-44 | `read_minamo_record` | `d7720af7-168c-411c-930b-bf08c42456c2` · success · 645 ms | Corroborated by tool, outcome, sequential timing window |
| A3 | 45-46 | `read_minamo_record` | `a3ac87d6-bd1b-4516-aa9c-83bfebee86c0` · error (`record_unavailable`) · 127 ms | Corroborated by tool, outcome, sequential timing window |
| B1 | 47-48 | `apply_minamo_command` | `a7a0c30d-4380-4dc2-8035-2d0b7a661f02` · success · 1716 ms | Corroborated by tool, outcome, sequential timing window |
| B2 | 49-50 | `read_minamo_record` | `bcf418d2-2a3e-4919-9fa6-668f7bc22708` · success · 895 ms | Corroborated by tool, outcome, sequential timing window |
| B3 | 51-52 | `read_minamo_operation` | Expected exclusion — non-epoch receipt ID | Model + canonical receipt; not observer-eligible |
| C1 | 53-54 | `apply_minamo_command` | `2954ea01-d12d-440a-a5a7-a118716389b0` · success · 1870 ms | Corroborated by tool, outcome, sequential timing window |
| C2 | 55-56 | `read_minamo_record` | `0477c954-c64a-4b8a-9003-f619ad8f3e00` · success · 915 ms | Corroborated by tool, outcome, sequential timing window |
| C3 | 57-58 | `read_minamo_operation` | `9467667f-c5c0-4d4d-a136-5f6ce04813ff` · success · 127 ms | Corroborated by tool, outcome, sequential timing window |

**Excluded B3:** The activation operation ID `TEST-ONLY-three-layer-B-flag-activate-20261031-01` is a valid canonical operation identity but is outside V86's *current-epoch* receipt-read observation prefix `TEST-ONLY-m2m-r3-`. The `read_minamo_operation` response succeeded and matched its canonical receipt, but it was intentionally not selected into the observer. The activating command B1 **was** observed because its exact synthetic Article target qualified. The C3 cleanup receipt used a current-epoch operation ID and **was** observed, demonstrating the predicate contrast. This is a documented selector exclusion, not evidence of a lost call; it also explains why the activation operation metadata was not included as a synthetic-prefix snapshot entry.

## Canonical before/after state evidence

| Interval | Before → after namespace | Observed qualified calls | Canonical change | Other state |
| --- | --- | ---: | --- | --- |
| A: reads and deliberate server error | 7074 → 7074 | 3 | None | 104 entries unchanged |
| B: synthetic Flag activation | 7074 → 7080 | 2 | One bookmark, inactive target rev 2 → active target rev 3 | 103 entries unchanged |
| C: cleanup | 7080 → 7086 | 3 | Same bookmark active target rev 3 → inactive target rev 4; one current-epoch operation receipt added | 103 entries unchanged |

- A: `query_minamo_records` and existing synthetic Note read succeeded; a valid missing current-epoch Note read returned server error `record_unavailable` (127 ms). Server observed count = 3; the snapshot remained 104/104 unchanged.
- B: exact revision-guarded `setFlag active:true` committed once, `replayed:false`; target readback showed rev 3 / active. The Article itself stayed revision 1; no authored Note, Project, Question, checkpoint or Library text was changed. The diff observed one bookmark change and 103 unchanged entries. Server observed count = 2.
- C: `setFlag active:false` with expected target revision 3 and a new idempotent operation ID committed once; readback and receipt showed inactive target rev 4. The diff recorded the bookmark correction plus one new operation receipt and 103 other unchanged entries. Server observed count = 3. The inactive Flag/tombstone and the two committed mutation receipts are **retained**, rather than erased; this is expected recoverable test history.
- Final separate read-only verification found the same Article revision 1 and rendition, inactive Flag rev 4, controller phase K / revision 21 / epoch 3, observer **paused** at revision 3, transcript still **open** at revision 58. No scenario load, advance or reset; no genuine learner-record mutation, schema migration or Site publication.

## Outcome and interpretation

**PASS for the existing protocol's bounded claim.** All eight qualifying deliberate attempts agree with server-received tool/outcome/error metadata in distinct attempt/result time windows; the ninth has a source-explained exclusion. Test A's diff is empty; B's revisioned activation and C's cleanup agree with exact canonical record and operation readbacks, with no unrelated state change in the bounded synthetic projection. Idempotent receipt reads reported `replayed:true` without additional target mutations. Both instrumentation layers retained their independent provenance.

**Not established:** a complete ChatGPT host transcript or calls blocked before server receipt; exact cryptographic one-to-one dispatch correlation; complete physical-byte privacy/ordinary-tenant isolation or live D1 fault injection; independent executing-runtime attestation; learner orientation, comprehension, UI interaction, Note autosave or source-anchor experience. The observer is best-effort and only admits qualifying synthetic selectors. Snapshot comparison establishes metadata changes between instants; causality is supported here by the narrow command and receipts, not by a D1 diff alone.

## Next gated engineering work — not implemented by this report

1. Treat #17's *bounded* coordinated reconciliation as accepted, retain the explicit host-completeness and physical audit limitations. No additional host-side runner is necessary just to build the 3×3 synthetic corpus.
2. Under #12, begin a **small local-only versioned corpus increment**: one distinct Mood-to-Music persona overlay in disposable Miniflare/D1, preserving the accepted V3 default history unchanged. Verify deterministic replay, stable reserved identities, authored-vs-GPT boundaries, negative isolation and revision/source fidelity; use the existing controller/transcript/observer patterns instead of new infrastructure. Inspect hard-coded single-scenario binding in `lib/scenario-control.ts`, `lib/test-transcript.ts`, `lib/test-observation.ts` before enabling hosted multi-scenario control. Do not reset live K or migrate the database.
3. Complete the remaining two Mood-to-Music variants, HTB Cap and Plant-Screamer with three distinct variants each, plus #14 source-linked F/H/K context-read/efficiency diagnosis and cross-variant replay before accepting the 3×3 test corpus. The Workbench information contract and real UI vertical slice remain behind that gate; #18 browser comparisons are later, optional and not product acceptance alone.

**Testing and publication boundary:** This report documents actually executed connected synthetic MCP operations and programmatic nine-pair/three-diff reconciliation. No application source was changed, so `pnpm` typecheck/build/full suite were **not rerun** for this documentation PR; the V86 automated matrix and release checks are separately cited, not claimed freshly executed. No connected browser UI task was part of this test.