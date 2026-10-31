# Three-layer reconciliation acceptance — GPT Markdown, server MCP, canonical D1

Status: **PROTOCOL / NOT YET EXECUTED** (31 October 2026). Follow-on to [V85 observed-call acceptance](2026-10-31-v85-observed-mcp-state-diff-acceptance.md) and [V86 resilience matrix](2026-10-31-observation-adversarial-matrix.md). This protocol is TEST ONLY, synthetic-scoped and owner-gated.

## The acceptance objective

Establish whether **GPT's incremental model-reported Markdown account of a controlled synthetic test** agrees with the calls independently received by Minamo's MCP server and with canonical D1 revision/state changes. The three layers are complementary, not interchangeable:

| Layer | Source | Authority / limit |
| --- | --- | --- |
| A. Submitted transcript | `append_minamo_test_transcript`, read by `read_minamo_test_transcript` | GPT-reported assistant response, tool attempt, tool outcome or session note; not a ChatGPT host-attested transcript |
| B. Server observation | `manage_minamo_test_observation` `calls` | Qualifying synthetic-scoped requests that reached the Minamo server, with tool, receipt time, elapsed server ms and outcome/code; best-effort and intentionally filtered |
| C. Canonical diff | Observation `capture`/`diff`, plus exact record/operation readback | D1 record, bookmark, operation and learning-development metadata at two instants; a revision change alone does not prove authorship or causality |

**No separate host runner is a prerequisite for this acceptance.** Complete host-level capture is a different, stronger assurance objective requiring an independently consented host/API trace source. Neither GPT Markdown nor server observation can prove the existence or nonexistence of a host-side dispatch that left no independent receipt.

## Why the joint gate remains open

The V85 acceptance attached an observer to an already-open 40-event, source-pinned transcript run, then tested ten qualifying observed calls and canonical diffs. The transcript remained at revision/event count 40 in the post-V86 read-only check. Consequently, V85 passed its bounded server-observation and D1-diff criteria, **but did not append new GPT attempt/result Markdown entries corresponding to those ten V85 calls**. Run/session linkage was verified; per-call three-layer reconciliation was not. Do not retroactively label that historical interval reconciled.

Current code provides run/session binding and stable transcript segment IDs but **no shared per-call correlation token** joining an individual GPT segment to an observer-generated `callId`. Pairings by tool, order, bounded time and canonical receipt are analytical matches, not cryptographic dispatch attestations. Record ambiguity explicitly; do not silently infer an exact pairing.

## Mandatory preflight — read-only

1. Discover actual connected Minamo scenario, transcript, record, command and observation tools. Stop if any required tool is missing.
2. Read current scenario fixture/version/source pin, phase, epoch, generation, controller revision and pending status. Stop on a pending transition or inconsistent source/fixture identity.
3. List transcript runs and select the **existing** exact open run for this generation/epoch/fixture/source. Do not create a new transcript run, advance or reset the scenario. Read the exact latest transcript revision and next sequence.
4. List observation runs; resume only an exact matching paused/armed observation with registered current phase/session. Do not create a different observer if matching identity cannot be established; do not seal.
5. Confirm observer quota/headroom and state of any candidate synthetic Flag target. Never assume earlier report values remain current.

## One controlled coordinated experiment

Use unique, stable, TEST-ONLY step IDs in Markdown (for example `R-A1`, `R-A2`, `R-B1`, `R-C1`) and separate unique operation/entry IDs for each transcript append or canonical mutation. Capture the actual submitted tool name, **minimal synthetic selector**, outcome/error code and the order of operations. Avoid prompt bodies, private learner content, secrets or raw response payloads. Report model-side timestamps as model-reported, not server time.

1. Arm/resume the exact observer using current revision, run, phase/session, generation and a stable control operation ID. Verify armed status and revision.
2. Record the transcript baseline revision. For **each deliberate test call**, append a `model.transcript` / `tool-attempt` Markdown segment **before** dispatch, then append `tool-result` after actual receipt or failure. Use each append's exact expected revision/next sequence; never fabricate a tool result or rewrite immutable history. If transcript appends fail, record the gap and stop or classify as PARTIAL.
3. **Test A:** capture a unique `moment:before` checkpoint; issue (i) one bounded `query_minamo_records` with `includeSynthetic:true`, (ii) one exact current-epoch synthetic record read, (iii) one valid but nonexistent current-epoch synthetic Note read that reaches the server and returns its real code. Append the paired Markdown segments. Capture `moment:after`; retrieve calls, snapshots and diff. Expect two successes and a server error within the qualifying interval, timestamps and elapsed server milliseconds, and an unchanged canonical learning-state diff.
4. **Test B:** select an existing current-fixture/current-epoch synthetic Article, verify its generation, exact identity, record eligibility, initial inactive Flag, bookmark target revision and lack of conflict. Capture new before checkpoint. Append attempt, set `action:setFlag` `active:true` at exact `expectedTargetRev` with stable synthetic operation ID, append the actual result, read back canonical state/receipt and append its attempt/result. Capture after; expect one appropriate nonempty Flag/bookmark diff and no unrelated authored or learning-development change.
5. **Cleanup:** use the current exact target revision and a **new** operation ID to deactivate the same Flag. Append attempts/results, read back inactive state, and capture a separate cleanup checkpoint/diff as needed. Retain tombstones, revisions and receipts; do not erase history. On cleanup failure stop further mutations and report residual state.
6. Keep the observer armed during both tests and cleanup. Retrieve complete bounded transcript segments, observed calls and all snapshots/diffs. Pause the observer at the current exact revision with a stable operation ID; do not seal it. Verify unchanged scenario phase/epoch/generation and no pending transition.

Transcript append, scenario and observation controls are intentionally **not qualifying observed MCP calls**. Filter expected calls using the deployed V86 eligibility predicate (current-epoch synthetic targets, verified opaque synthetic Flag reads, explicit synthetic discovery and synthetic operation receipt reads). Do not equate transcript entries, total ChatGPT calls and observed-call counts.

## Reconciliation ledger and classification

Produce one row for every declared test attempt and every unmatched observed event:

| Field | Required handling |
| --- | --- |
| GPT step / sequence / entry and operation IDs | From immutable model-submitted Markdown; preserve reported intent and actual result separately |
| Expected eligibility | `qualifying`, `excluded-control`, `ordinary/unscoped`, or `uncertain`, with predicate reason |
| Server match | Observer `callId`, tool, received timestamp, elapsed ms, outcome and error code, or `unobserved` |
| Canonical result | Before/after diff identity/revision plus exact operation/target readback, or `no change` |
| Classification | `corroborated`, `expected exclusion`, `GPT-only`, `server-only`, `ambiguous pairing`, `unexpected state`, or `storage/host unknown` |

Missing observation is **not proof** of host suppression: possible causes include a nonqualifying selector, client-side non-dispatch, model-reporting error, observer pause/quota, best-effort D1 write loss and other failures. Conversely, an observed server event does not reveal a hidden host prompt or reasoning. A server-generated `callId` is not itself a shared GPT dispatch ID. A future privacy-safe explicit correlation token may strengthen pairing, but lack of one must not block honest bounded reconciliation.

## Verdict gates

- **PASS — bounded three-layer acceptance:** all intended qualifying synthetic attempts have defensible server matches or explicitly explained exclusions; successful and server-failed outcomes/timings agree; Test A diff empty; Test B diff and exact readback agree; cleanup inactive with retained history; no unrelated learner/authored change; source/epoch/session binding valid; every unmatched item disclosed.
- **PARTIAL:** instrumentation functions and cleanup are safe, but at least one attempted/server event cannot be confidently paired or attributed, Markdown append is incomplete, or an evidence layer is missing. Never silently repair the log.
- **FAIL:** unexpected canonical change, unremediated active test Flag, privacy leak, wrong fixture/source binding, incorrectly attributed server error, or other violated safety/integrity condition. Stop further mutations on cleanup failure.

Publish a dated, sanitized report under `docs/acceptance/`, link [Issue #17](https://github.com/frekland/Minamo/issues/17), and create a documentation-only PR. Merge only if PASS with verified cleanup; otherwise leave open and create a focused defect issue for any confirmed implementation defect. Do not deploy code, change access/retention policy or collect genuine learner material.

After this bounded gate, pursue separately: physical-byte/all-path D1 privacy inspection, production failure-injection/loss accounting, independently consented host-complete trace (only if required), cryptographic running-artifact attestation and measured learner outcomes. Event volume is not a learning-quality metric.
