# Owner-only synthetic GPT/MCP transcript — stage 1

Engineering scope: [public issue #17](https://github.com/frekland/Minamo/issues/17), building on the **unmerged** Mood-to-Music V3 fixture/controller [PR #15](https://github.com/frekland/Minamo/pull/15). Run index: [#16](https://github.com/frekland/Minamo/issues/16). This is an implementation/verification guide, **not** evidence of a genuine GPT conversation or a Sites deployment.

## Purpose and truthful evidence boundary

The ordinary executing ChatGPT conversation uses Minamo's existing MCP operations, then records its **own intended responses and observed tool attempts/results incrementally** using a new test-only MCP append tool. A separate authorised ChatGPT chat can read the persisted ordered events directly from Minamo's D1 database, with no pasted transcript or GitHub handoff.

Three different authorities must never be confused:

1. `fixture.user-turn` / `fixture-defined`: exact prompt from the committed fictional scenario. This proves the fixture text saved, **not** that a host delivered it to GPT.
2. `model.transcript` / `model-submitted`: Markdown that the executing GPT sent to the tool. This does **not** attest to invisible reasoning, the whole ChatGPT message stream, an unsuccessful request that never reached Minamo, or a model's honesty/completeness.
3. Canonical Minamo records and committed operation receipts: **independent** application evidence retrieved through ordinary `read_minamo_record`, `read_minamo_operation` and `manage_minamo_test_scenario inspect`. An operation reference in the transcript is only a claim/pointer until checked.

Server-observed MCP metadata, canonical state-diff snapshots, browser-observed UI events and any consented natural-user telemetry are **not implemented** here. The structured `toolContract`, `schemaVersion`, run/session/event IDs, source pin, epoch, evidence references, event kind and provenance allow later complementary observations without relabelling old model-reported segments as independently observed. Future visual probes can target any registered phase and, when saved snapshots/receipts exist, specific post-GPT-interaction states. Replaying generated text requires actual recorded outputs; a fixture baseline must never pretend to recreate unrecorded GPT content.

## MCP interface

Both tools appear only for the configured Sites owner when `MINAMO_SCENARIO_CONTROL_ENABLED=1` and the private Sites hostname, owner identity and workspace generation checks pass. They share the existing scenario-controller gate, **not** normal account Notes, generic Article storage or a public route.

### `append_minamo_test_transcript`

- `start`: `purpose`, `action:"start"`, `scenarioId:"mood-to-music"`, `runId`, `epoch`, `expectedGeneration`, `fixtureVersion:"mood-to-music/3"`, `operationId`. Optional `personaVariant`, `siteVersion`, `modelLabel` are **reported labels**, not independent host facts. The current scenario must be at one of F–K. One run is reserved per `(owner, scenario, generation, epoch)`.
- `append`: same scope plus `action:"append"`, `expectedRevision`, `sequence`, `entryId`, `operationId`, `sessionId` (`S01`–`S06`), `eventKind`. The next contiguous global sequence is `expectedRevision + 1`. For `fixture.user-turn`, **omit** Markdown: the server obtains the exact prompt from the registered case. For `model.transcript`, pass the actual intended/reported Markdown and `segmentType` (`assistant-response`, `tool-attempt`, `tool-result`, `session-note`). Optional bounded `links` are exact synthetic run-prefixed operation/record/development references. For receipt-generated `ms-*` Articles, link the **synthetic operation ID** and retrieve the generated record ID independently from the receipt.
- `seal`: same run scope, `action:"seal"` and `expectedRevision`; ends further appends. Sealing is **not** a claim that every ChatGPT utterance was captured.

Every append is immutable, stored in D1 separately from learning tables, and returns a committed event and run revision. The **same operation ID, entry ID and identical contents** may be retried after an uncertain acknowledgement; changed contents are rejected. Concurrent CAS/unique-index races fail without appending a second event. The source commit/generation/epoch is pinned, with 16 KiB UTF-8 per entry, 512 events and 4 MiB Markdown per run. The tool deliberately accepts no arbitrary record family or general-purpose user transcript.

### `read_minamo_test_transcript`

- `list`: discover run identities, source/fixture pins, epoch, retained/retired status and revision.
- `turn`, `sessionId:"S01"` (or relevant phase): read the **exact** pending fictional User request and declared requested writes for the current registered phase. This removes owner role-playing.
- `read`, `runId`, optional `afterSequence` and `limit` (1–50): return chronological immutable events, links, pagination, session prompt/assistant coverage and missing committed sequence numbers. Lack of gaps **cannot prove full ChatGPT capture**. Read the actual canonical record/receipt independently.

## Run lifecycle and replay

1. Inspect or load the known Mood-to-Music V3 corpus and deliberately reach phase F (S01). A–E are **historical setup**, not six observed GPT conversations. Never insert a canned assistant answer in the fixture.
2. Read S01's prompt through the test-only read tool; start a new run with a unique ID and the current exact generation/epoch. Append its `fixture.user-turn` entry.
3. Use actual Minamo reads/commands to serve the fictional request. After each meaningful result/error, append a concise, true `model.transcript` segment while the interaction is still in context; include synthetic receipt IDs where known. Append the Markdown answer **actually intended for the user**, then deliver it. If log append fails, retry its original ID and openly mark coverage uncertain; do not invent a committed receipt.
4. Do **not** reset between S01–S06. Advance to G–K deliberately, preserving generated Library content and checkpoints. A separate cold GPT conversation should independently recover the current Project from canonical Minamo records **before** reading the recorded transcript, then compare the two layers.
5. Seal at end if appropriate. `reset` or `load` into a new scenario epoch **logically retires** previous runs: their immutable rows remain available through the read tool, but cannot accept more events. No unrelated owner learning record or Library entry is deleted by these transcript tools. Controller fixture cleanup retains its separate fail-closed manifest boundary. Old transcript storage has **no bulk deletion endpoint** in this increment; retention/pruning is a future explicitly reviewed policy, not a hidden wipe.

If the model supplies a `siteVersion` or `modelLabel`, it is labelled *model-reported*. Compare against an actual Sites deployment record before treating either as verified. The source pin comes from the server's existing `MINAMO_SCENARIO_SOURCE_SHA` configuration and should be updated to the promoted source SHA during release.

## Local technical acceptance

`tests/test-transcript.test.mjs` operates only in isolated Miniflare D1/R2 with invented owner/principal IDs and **explicit test-harness sentinels**. These sentinels are *not* fabricated GPT dialogue or evidence that a genuine assistant has run a session. Coverage includes feature flag, non-owner visibility/denial, fixture-turn read, start/retry, append/retry, stale revision, wrong phase, sequence gap, conflicting content, bounded size, synthetic link scope, concurrent CAS, sealing, old-run readback, epoch reset/reload isolation and a second independent MCP client retrieving the persisted ledger alongside canonical fixture receipts.

The **genuine** S01/F Library generation, recorded real assistant response and second *actual* cold-chat comparison are **post-deployment acceptance**, not tests that a local fixture runner can honestly replace. UI/visual acceptance also remains a separate optional stage under [#18](https://github.com/frekland/Minamo/issues/18).

## Deployment gate (not performed in this change)

1. Review/land or explicitly stack the prerequisite V3 [PR #15](https://github.com/frekland/Minamo/pull/15) and this issue's separate PR, preserving exact source SHAs and the established guarded Sites source transfer. The public GitHub push **does not** deploy the private Site.
2. Re-run final-source tests/typecheck/build on the native Sites release source; review the exact file diff, private host/owner/environment settings and migration plan.
3. Apply `drizzle/0014_test_transcript.sql` to the **correct** Site D1 before publishing the code. Back up/check migration readiness per established Sites change control; **no existing learning data migration** is required. Ensure the generated migration is recorded exactly once.
4. Set/update `MINAMO_SCENARIO_SOURCE_SHA` to the promoted version's exact source commit. Leave `MINAMO_SCENARIO_CONTROL_ENABLED` enabled **only** in the owner-only synthetic test context; do not expose it to invited users. Do not turn on any ordinary-user tracing.
5. Save a new Sites version from the exact pushed source, then deploy with the **private** operation after explicit release approval. Verify deployment ID/version, owner/non-owner tool list, required D1 tables and real MCP calls. Only then undertake the genuine S01/F conversation and independent second-chat test.

## First genuine ChatGPT execution prompt (after release)

> I authorise a **TEST ONLY** Mood-to-Music V3 transcript acceptance run through Minamo MCP. Use `manage_minamo_test_scenario` to inspect the current synthetic epoch; deliberately advance the published fixture from A to F if needed (only registered TEST-ONLY operations, no owner records). Discover S01's exact fictional request with `read_minamo_test_transcript` action `turn`. Start a uniquely identified run with `append_minamo_test_transcript`; append the fixture prompt and then your actual tool observations, errors, decisions and intended answer **incrementally** as you work. Perform the S01 Library request using ordinary Minamo MCP, subject to the fictional user's explicitly bounded authorisation; don't edit User Notes or assert unverified execution. Link exact operation receipts and read back any generated records. Do not pre-seed answers, reset the fixture or deploy. Finish with a useful natural response and tell me the run ID/revision and any missing transcript coverage. If an append fails, retry with the same operation ID; distinguish what was committed from what you merely reported.

## Independent cold-review prompt

> This is a **read-only, cold-context** Mood-to-Music V3 acceptance review. With Minamo MCP only, first independently reconstruct the active synthetic Project/Notes/Questions/Library/checkpoints, latest decisions and canonical operation receipts **without reading any test transcript**. Cite record IDs/revisions and distinguish reported from verified activity. Then use `read_minamo_test_transcript` action `list` to discover the relevant run and `read` to page every event. Compare what the first GPT reported against canonical receipts/records, identify omissions, conflicts, unverified tool claims and whether the scripted User request and intended GPT answer are actually present. Do not claim a host-attested complete chat, infer missing responses or mutate/advance/reset anything. No transcript needs to be copied into this conversation.
