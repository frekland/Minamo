# V85 — Server-observed MCP tracing and canonical state-diff acceptance

Date: 2026-10-31 (UTC)  
Scope: Owner-authorised, TEST-ONLY, connected Minamo MCP; independent infrastructure acceptance  
Verdict: **PASS for the specified bounded synthetic-scoped tests; coverage limitations remain.**  
Related: [Issue #17](https://github.com/frekland/Minamo/issues/17), [Issue #16](https://github.com/frekland/Minamo/issues/16)

## Identity and safeguards

Fresh, read-only preflight using scenario `list`, transcript `list`, and observation `list` established:

| Field | Verified value |
| --- | --- |
| Scenario / fixture | `mood-to-music` / `mood-to-music/3` |
| Fixture source pin | `f7cc6dc54064b669929a384ea9464eb310b6d397` |
| Generation / epoch | `legacy@0` / `3` |
| Phase / controller revision | `K` / `21` |
| Pending transition | `false` |
| Existing transcript | `TEST-ONLY-m2m-r3-s01-v77-20261030`, open, revision 40 / 40 events |
| Transcript source and identity | Matched fixture version, source pin, epoch, generation |
| Observation runs before test | None |
| Registered current session | `S06` (read back from the versioned K turn) |
| Observer | Same run ID, session `S06`, schema/contract `test-observation/1`; armed at revision 0, paused at revision 1 |

An initial `start` attempt using historical session `S01` was rejected as `observation_phase_conflict`; no observer was created. Read-only inspection of the registered K turn identified `S06`; a fresh, uniquely identified start succeeded. No scenario advance, reset or new transcript was performed. Source pin here identifies the *fixture*, not a cryptographically attested V85 deployment artifact.

## Reproducible controls

The observer was started on the existing transcript with `sessionId:S06`, `expectedGeneration:legacy@0`, and stable operation `TEST-ONLY-v85-observation-start-s06-20261031-01`. All checkpoints used the same existing transcript run and `moment:before` / `moment:after`, with no scenario control operation.

1. Test A checkpoint: `TEST-ONLY-v85-nochange-20261031-01`. Query `family:article`, bounded `limit:5`, `query:React`, `includeSynthetic:true`; read the exact synthetic Note `TEST-ONLY-m2m-r3-note-next`; deliberately read nonexistent but syntactically valid `TEST-ONLY-m2m-r3-note-v85-nonexistent-20261031`. Capture after, retrieve calls, snapshots and diff.
2. Test B target: synthetic Article `TEST-ONLY-m2m-r3-reference`, canonical record revision 1, untrashed, initial bookmark target revision 0/inactive. An initial preview omitted `target.kind` and returned `invalid_flag_target`; public `lib/domain-handler.ts` schema confirmed `{kind:"record",family:"article",id:...}`. Corrected preview succeeded.
3. Test B checkpoint: `TEST-ONLY-v85-flag-activation-20261031-01`. Activate only that record Flag with `action:setFlag`, `active:true`, `expectedTargetRev:0`, `expectedGeneration:legacy@0`, operation `TEST-ONLY-v85-flag-activate-20261031-01`. Read target and operation receipt. Capture after, retrieve diff and calls.
4. Cleanup checkpoint: `TEST-ONLY-v85-flag-cleanup-20261031-01`. Deactivate the same Flag at confirmed `expectedTargetRev:1` with operation `TEST-ONLY-v85-flag-deactivate-20261031-01`. Read target and receipt, capture after, retrieve cleanup diff. Pause observer at exact revision 0 using `TEST-ONLY-v85-observation-pause-20261031-01`; observer is **paused**, not sealed.

No operation wrote any authored Article/Note/Project body.

## Test A — no-change read/error observation: PASS

The two successful MCP requests and deliberately failed exact Note read reached Minamo. The immutable D1 snapshots covered 103 state entries, controller K/21 and namespace version 7062 on both sides.

| Tool | Outcome | Server-received timestamp (UTC) | Elapsed server ms |
| --- | --- | --- | ---: |
| `query_minamo_records` | success | 11:37:53.206 | 2610 |
| `read_minamo_record` | success | 11:38:00.820 | 625 |
| `read_minamo_record` | error, `record_unavailable` | 11:38:06.298 | 132 |

Before 11:37:39.373; after 11:38:19.874. Canonical diff: **0 changes; 103 unchanged**. Interval aggregation: **3 calls, 1 error**, by-tool totals 2,610 ms query and 757 ms two reads. This matches the observed events exactly. The negative test was a valid server-received request, not malformed local input.

## Test B — real Flag mutation: PASS

The candidate Article was synthetic, in the current registered fixture/epoch and generation, untrashed, revision 1, and initially unflagged. Exact command preview returned valid; activation receipt returned **committed, replayed:false**.

| Evidence | Before | After activation |
| --- | --- | --- |
| Checkpoint time (UTC) | 11:40:00.071 | 11:40:52.097 |
| Controller | K / revision 21 | K / revision 21 |
| Namespace version | 7062 | 7068 |
| Tracked state entries | 103 | 104 |
| Bookmark `bookmark-122cba4856919c2b3e55506e23455cf8cb67f6ce4666ee2916453ae4a4cc74a1` | absent (target rev 0 / inactive on canonical target read) | added, rev 1, active true |
| Other tracked entries | — | 103 unchanged |
| Article rev / rendition | 1 / `r-3dff1a6295cc5badac59ef7a0045d621f20fb237cb1adfd2bb067fb3fa0758df` | unchanged |

Canonical diff: **one added active bookmark, no unrelated change**. Activation created synthetic Flag record `flag-122cba4856919c2b3e55506e23455cf8cb67f6ce4666ee2916453ae4a4cc74a1` at revision 1; readback and the exact operation receipt agreed. Interval observer aggregate: `apply_minamo_command` success (1819 ms) and one qualifying `read_minamo_record` success (884 ms). A diff of two D1 instants does not independently establish causality, authorship or external source execution; operation receipt and target readback provide the additional association.

## Cleanup: PASS, not history-erasing

Deactivation receipt: **committed, replayed:false**. Canonical Article readback: bookmark target rev 2, **active:false**, same Article revision 1 and same rendition. Synthetic Flag record revision 2 is retained with `trashedAt` populated (a tombstone), not physically erased. Both activation/deactivation operation receipts persist.

Cleanup checkpoint before 11:41:27.013 (namespace 7068) and after 11:42:12.733 (namespace 7074): **one changed bookmark** from `rev:1, active:true` to `rev:2, active:false`; **103 other tracked entries unchanged**. Interval observer aggregate: `apply_minamo_command` success 1910 ms; `read_minamo_record` success 929 ms. Final scenario readback remained K, controller rev 21, epoch 3, no pending transition, same generation and source pin. The six pre-existing active fixture bookmark keys remained unchanged; **no active test-created Flag remains**.

Final observer status: **paused, revision 1** at 2026-10-31T11:42:40.770Z.

## Whole-run observed events and completeness

Ten stored server-observed events were read back, across three acceptance windows and intervening setup:

- Test A: 3 events (2 success, 1 `record_unavailable`).
- Intervening target inspection/preview: 3 events (Article read success, malformed target preview `invalid_flag_target` error with reported 0 ms, corrected preview success 767 ms).
- Test B: 2 events (activation 1819 ms, Article read 884 ms).
- Cleanup: 2 events (deactivation 1910 ms, Article read 929 ms).

The 0 ms preview error is an observed *reported* server duration, not proof of zero execution time. All ten events had tool, outcome, timestamp, elapsed milliseconds and session/phase; errors had codes. The observed-call limit was 600, quota not reached.

**Not all calls made in this acceptance chat appear in observation.** In particular, `read_minamo_operation`, direct Flag reads with `flag-...` IDs, and scenario/observation/transcript controls did not qualify. Public `lib/test-observation.ts` confirms the classifier admits selected current-epoch `TEST-ONLY-m2m-r3-` IDs or `includeSynthetic:true` on selected discovery tools; it expressly excludes scenario/observation/transcript controls. Thus interval counts are internally consistent with the observer's **scoped** event set; they are not totals of all attempted MCP calls. Calls blocked before reaching the server, unscoped calls, and best-effort D1 logging failures remain outside evidential coverage.

The state snapshot covers bounded **D1 metadata** (record identity/revision/rendition, bookmark state, development and selected operation metadata); it is not a content hash of all ordinary learner material or a complete database audit. No body/credential/private learner content appeared in the observation `calls`, `snapshots` or `diff` payloads. Public source for the observed-call insert persists only tool name, outcome/error code, elapsed ms, received timestamp and scoped run/session/phase/opaque call identity; the snapshot serialization contains metadata. This is an evidence-backed *schema and sampled readback* privacy check, not an independent inspection of physical D1 storage, runtime logs, or every possible request path.

## Three evidence layers

1. **GPT-submitted transcript** (the existing open run): model-reported historical interactions, not host-attested.
2. **Server-observed MCP calls** (this paused observation): bounded receipt-side, qualifying request/error/timing metadata, not a full ChatGPT host transcript or hidden reasoning.
3. **Canonical state diffs** (three named checkpoints): verified D1 metadata at two instants, not intrinsic action causality or an independent browser/source execution trace.

The test assesses instrumentation integrity only. Ten observed events do **not** demonstrate better teaching, learning continuity or learner understanding.

## Acceptance criteria, gaps and next step

| Criterion | Result |
| --- | --- |
| Correct scenario/fixture/source/session binding; no pending transition | PASS |
| Server-observed successful calls and a genuine server error with code/timing | PASS |
| Test A aggregate and unchanged canonical diff | PASS |
| Synthetic-only Flag CAS activation, receipt/readback, nonempty diff | PASS |
| Deactivation, final inactive state, tombstone history and scenario isolation | PASS |
| No prompt bodies/private learner content in sampled observation payload or stored schema | PASS within inspected scope |
| Host-complete capture and independent physical D1/privacy audit | NOT TESTED / outside contract |
| Browser/UI observation, source runtime execution, multi-user isolation, trace failure injection, limits/retry/race coverage | NOT TESTED |

No confirmed implementation defect was demonstrated. The corrected target-shape validation error and first session mismatch were tester input errors, both rejected safely. One documentation/usability opportunity is to surface the synthetic selector predicate and phase-to-session requirement more prominently in client guidance; these did not break the supported contract.

**Recommended next step:** Add a focused automated matrix around observation eligibility and best-effort failure modes (exact synthetic/non-synthetic selectors, server errors, idempotent retry, pause/re-arm, quota, concurrent CAS and D1-write failure) before using this infrastructure as the evidence backbone for the learner-context/UI evaluation under Issues #14 and #18. Treat visual acceptance and learning quality as separate tests.