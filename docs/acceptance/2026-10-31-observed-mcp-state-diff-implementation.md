# Observed MCP tracing and canonical state diffs — source implementation (31 October 2026)

**Status:** source-only implementation candidate; no hosted Minamo records were changed, no scenario was advanced, and this document is not a Site deployment or connected-ChatGPT acceptance receipt.

**Scope:** [#17](https://github.com/frekland/Minamo/issues/17) stages 2–3, on top of the accepted append-only GPT-submitted transcript. The learner-context analysis under [#14](https://github.com/frekland/Minamo/issues/14) can use these measurements, but this PR does not choose a new learner UX or change ordinary Project continuation.

## Evidence layers and authority

| Layer | Source | What it establishes | What it cannot establish |
| --- | --- | --- | --- |
| `model.transcript` | Existing `append_minamo_test_transcript` | What the executing GPT submitted and intended to say | Complete host transcript, all failed pre-server tool attempts |
| `mcp.observed-call` / `mcp.observed-error` | New Minamo MCP handler instrumentation | An eligible authenticated synthetic-scoped tool invocation reached Minamo; tool name, outcome/code, elapsed server tool time | Hidden reasoning, complete ChatGPT calls, client-side/transport failures, unscoped calls, execution in another system |
| `state.verified-diff` | New D1 before/after metadata projection | Which owner-scoped synthetic record heads, revisions, checkpoint/perspective heads, bookmark heads and operation metadata changed between two successful captures | Content meaning, authorship inferred from a revision, causal attribution of a change to a single tool, external code/runtime proof |

The new `manage_minamo_test_observation` tool is visible only through the existing configured owner/host/scenario gate. It is **not** real-user telemetry and must not be repurposed for invited users. It does not store prompt/response bodies, request arguments, tokens, headers, authenticated principal IDs, or full records.

## Use in a new, explicitly authorised TEST ONLY run

1. Use the existing owner-only scenario controller and transcript tools to inspect the active published fixture. Ensure a transcript run already exists for its exact `generation`, `epoch`, fixture version and source pin.
2. Explicitly call `manage_minamo_test_observation` with `action:start`, the registered `scenarioId`, exact `runId`, matching fictional `sessionId`, `expectedGeneration`, a stable `operationId` and a brief TEST ONLY `purpose`. This is the opt-in boundary. Starting a run does not mutate learning content.
3. For an experiment, capture `action:capture`, `checkpointId:<stable test label>`, `moment:before`. Run the ordinary *synthetic-scoped* MCP reads/writes with their usual per-operation authority and receipts. Capture the same `checkpointId` with `moment:after` after canonical readback.
4. Read `action:calls` (paginated), `action:snapshots` and `action:diff` with the checkpoint ID. `diff` returns exact identity/revision metadata changes plus counts, errors and summed elapsed tool time for observed calls received between the capture timestamps.
5. Use `action:pause` to suspend collection, or after moving to another fixture phase call `action:arm` with the new registered `sessionId` and exact observer control revision. `action:stop` seals collection. Control operations use stable IDs and compare-and-swap revisions; duplicate control retries are idempotent.

This is a separate observer-control revision from the scenario controller and from the GPT-submitted transcript revision. It is never a learner checkpoint.

## Guardrails and failure interpretation

- Opt-in requires an existing exact-epoch transcript and the configured Sites owner/host/generation/fixture source; disabled and invited-user surfaces cannot expose or operate it.
- The observer captures only calls with explicit current-epoch synthetic IDs in recognised selectors, or synthetic-enabled read discovery routes. It does not automatically follow a phase transition; the next session must be explicitly armed. Scenario-control and observation/transcript tools are excluded from passive call capture.
- Call storage is best-effort, capped at **600 events per run**. Recording failures never turn a successful learner operation into an error. `calls` reports the cap and warns that unobserved/missing calls may exist. Silence is never proof that GPT did not attempt a tool.
- Canonical snapshots are capped at **80 captures per run** and **256 metadata entries per capture**. They are immutable; retrying an existing checkpoint/moment reads the original capture. A namespace-version/controller change during projection is rejected rather than producing a knowingly mixed snapshot.
- No full authored record bodies enter the snapshot. Prefix-colliding non-synthetic records or developments targeting unregistered work fail closed. Past-epoch observation events remain readable, but cannot be extended after a fixture reset.
- There is no live migration or rollback in this source change. The new D1 migration must be applied to a deliberately promoted Site before the tool is usable there. Existing transcript events and the canonical learner schema are unchanged.

## Verification before any release

New isolated Miniflare/D1 tests cover owner-only visibility and denial, explicit start/retry, successful and failed received calls, exclusion of unscoped reads, immutable snapshot retry and before/after new-checkpoint diff, paused/stopped collection, revision conflicts, epoch retirement and cross-session re-arm. The existing transcript tests remain unchanged and serve as a separate regression gate.

When promoted through the reviewed [native Sites release workflow](../SITES-RELEASE-WORKFLOW.md), apply the migration, verify tools/list visibility as owner versus invited user, then use a *new explicitly authorised synthetic run* to measure call coverage and F/H/K continuation paths. Do not silently activate tracing for existing non-test activity or treat the old S01–S06 transcript as retrospectively server-observed evidence.
