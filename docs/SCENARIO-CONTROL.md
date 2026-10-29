# TEST ONLY: owner-controlled Sites scenario replay

Small source increment for [issue #7](https://github.com/frekland/Minamo/issues/7), stacked on the versioned Mood-to-Music fixture in draft PR #6. This tool is **not a general MCP database/reset API** and is **not currently deployed**. It is not for the independent Cloudflare/Auth0 service.

## Contract

The existing authenticated `/mcp` server offers one optional tool, `manage_minamo_test_scenario`:

| Action | Required fields | Result |
| --- | --- | --- |
| `list` | `purpose` | Published scenario/phase catalogue, fixture version, active revision, generation and recovery-gate status |
| `inspect` | `purpose,expectedGeneration` | Exact active Project/Step/Question/Note/checkpoint IDs and revisions, last receipt, pending transition if interrupted |
| `load` | `purpose,scenarioId,phase,operationId,expectedGeneration,expectedRevision` | Fresh bounded synthetic run rebuilt through the published phase |
| `advance` | Same as load, without `phase` | Next phase in the versioned manifest |
| `reset` | Same as advance | Retire only the current synthetic run's known records, then rebuild the first published phase |

`phase` and `scenarioId` must match the checked-in manifest; neither remote code nor user-supplied commands are accepted. Reads and writes are tied to the current authenticated owner and Sites workspace generation. A mutation first claims the expected controller revision; one different concurrent operation receives a conflict. Retry a failed/interrupted mutation with **exactly the same operation ID and inputs**. The tool reports a pending transition instead of claiming an atomic rollback of a multi-record replay.

The seed reuses the existing canonical record, learning-development, relation, revision, Flag, and operation-receipt contracts, not direct learner-table inserts. An interrupted transition resumes through individual persisted receipts. `inspect` performs fresh domain readbacks and reports actual runtime data separately from the authored synthetic scenario dates.

## Deployment and safeguards

Required server bindings, set through the **reviewed native Sites release workflow**, never committed with personal values:

- `MINAMO_SCENARIO_CONTROL_ENABLED=1` — **absent/disabled by default**, including public/self-hosted builds.
- `MINAMO_OWNER_ID` — existing trusted Sites owner identity. Ordinary invited identities cannot list or invoke this controller.
- `MINAMO_SITE_HOSTS` — existing trusted private Site host allowlist.
- `MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED=1` — separate, deliberately set **only after** the current valued Library's protected export and recovery route have been verified. Without it, `load/advance/reset` refuse to mutate.
- Optional `MINAMO_SCENARIO_SOURCE_SHA` — reviewed public-source SHA for comparison with the actual Sites deployment. A declared SHA is **not proof of live source correspondence**; verify native Sites version/tree separately.

The generated migration `drizzle/0013_wide_robbie_robertson.sql` adds only the controller's operation journal. There are no edits to the Library schema or ordinary records in this source increment. Rebuilding a fixture uses a new `TEST-ONLY-m2m-rN-*` identity (100-run safety cap) and canonical Trash commands against the previous run's **known, synthetic** record IDs, including the exact synthetic bookmark. Canonical retained revisions and older checkpoint history are deliberately retained for recovery, rather than bulk-purged. Do not run `emptyTrash` as part of scenario control.

**Recovery is not yet cleared for hosted replacement.** Existing owner-private protected archives and source rollback are useful, but a fresh export must capture valued current Article/Area/catalogue, diagrams, media and reference assets; a separate verification/readback and appropriate restore-readiness check must confirm recoverability. Only then may the owner-controlled hosted mutation gate be enabled. An older verified archive alone cannot prove the newest Library is recoverable.

## Local engineering checks

```sh
node --test --test-force-exit tests/scenario-controller.test.mjs tests/mood-to-music-scenario.test.mjs
pnpm exec tsc --noEmit --incremental false
```

The controller tests use disposable Miniflare D1/R2 and synthetic identities. They check disabled-by-default tool visibility, non-owner rejection, recovery preflight, known IDs, generation/revision conflicts, A→B→E transitions, Project structure changes, cleanup, idempotent retries, simulated lost acknowledgement, and preservation of an unrelated Library record.

The *final review gate* remains full typecheck, app build, entire regression suite and relevant Chromium example/browser checks on the exact final candidate head. Then perform a narrow, reviewed source promotion into the existing private Sites project, recording both public candidate SHA and native Sites version/deployment ID. A real hosted test still needs an independent authenticated MCP + Cloud Browser sequence and, for claims about fresh-chat recovery, a genuinely separate conversation.

Do not merge PR #6 or this PR, publish a Sites version, enable the live flag, migrate/replace the owner database, or select another Project subject as collateral to this implementation.
