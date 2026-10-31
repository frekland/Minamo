# TEST ONLY: owner-controlled Sites scenario replay

Originally developed under [issue #7](https://github.com/frekland/Minamo/issues/7) in [public PR #8](https://github.com/frekland/Minamo/pull/8), then **squash-integrated into the PR #6 fixture feature branch on 30 October 2026** for coherent public-main review. The PR #8 source revision was fully checked by [public Actions run 40977371813](https://github.com/frekland/Minamo/actions/runs/40977371813), and the 18 changed source/file blobs were read back identical in the combined branch before its final checks. This tool is **not a general MCP database/reset API** and is not for the independent Cloudflare/Auth0 service. **Current hosted status (29 Oct):** it was promoted from reviewed public controller source `74ebe56885e7d1c01e9da2faf7e5b959bfe584f3` into private Sites source `6d40b3afc0de362b414bbe415d9673766af9d68c` and deployed as owner-private **Sites V75** (`appgdep_6ae380cd713481919bc15d5b29a998b9`). Authenticated owner-only list/load/advance/inspect/reset and independent fresh-chat retrieval were observed. GitHub source review/merge and native Sites deployment remain separate events. This is the controller contract, **not** evidence of conversational write-back; that acceptance is tracked in [#14](https://github.com/frekland/Minamo/issues/14).

## Contract

The existing authenticated `/mcp` server offers one optional tool, `manage_minamo_test_scenario`:

| Action | Required fields | Result |
| --- | --- | --- |
| `list` | `purpose` | Published scenario/phase catalogue, fixture version, active revision, generation and recovery-gate status |
| `inspect` | `purpose,expectedGeneration` | Exact active Project/Step/Question/Note/checkpoint IDs and revisions, last receipt, pending transition if interrupted |
| `compare-continuation` | `purpose,expectedGeneration` | Read-only ordinary vs registered-fixture continuation using the same resolver and bounded canonical source IDs; no phase transition |
| `load` | `purpose,scenarioId,phase,operationId,expectedGeneration,expectedRevision` | Fresh bounded synthetic run rebuilt through the published phase |
| `advance` | Same as load, without `phase` | Next phase in the versioned manifest |
| `reset` | Same as advance | Retire only the current synthetic run's known records, then rebuild the first published phase |

`phase` and `scenarioId` must match the checked-in manifest; neither remote code nor user-supplied commands are accepted. Reads and writes are tied to the current authenticated owner and Sites workspace generation. A mutation first claims the expected controller revision; one different concurrent operation receives a conflict. Retry a failed/interrupted mutation with **exactly the same operation ID and inputs**. The tool reports a pending transition instead of claiming an atomic rollback of a multi-record replay.

The seed reuses the existing canonical record, learning-development, relation, revision, Flag, and operation-receipt contracts, not direct learner-table inserts. An interrupted transition resumes through individual persisted receipts. `inspect` performs fresh domain readbacks and reports actual runtime data separately from the authored synthetic scenario dates.

### Owner-only synthetic continuation fidelity comparison (31 October 2026)

The ordinary Project continuation and Home projections deliberately exclude synthetic Notes and Developments. This means a synthetic K Project's normal outline can truthfully return `basis:start` while canonical synthetic Notes and checkpoints exist. That is a **test-instrument mismatch**, not evidence that genuine learner Projects restart.

`manage_minamo_test_scenario({action:"compare-continuation",purpose:"TEST ONLY continuation fidelity",expectedGeneration:"<generation from list>"})` is a read-only comparison path for the **already loaded** registered scenario. It requires the same trusted owner identity, configured private Sites host, enabled controller and current generation as other controller actions. There is no arbitrary Project ID, phase selector, checkpoint ID, test principal, or synthetic override in the MCP input. It refuses a pending transition or unregistered synthetic identities.

The action:

1. Verifies the active fixture identity/manifest boundary, checkpoint heads, Project and generation; records the active phase, epoch, revision and exact Project revision.
2. Runs the **same `resolveProjectContinuation()` algorithm twice**: ordinary production admission (synthetic excluded) and a controller-supplied admission limited to the manifest's exact synthetic checkpoint and User Note IDs, including the documented epoch-3 C01 legacy alias. Ownership, target membership, exact links, evidence eligibility, bounded chronology and destination selection remain in force.
3. Returns each continuation with its `basis` and coverage, plus whether the bases differ. A mixed genuine continuation, unregistered selected target, concurrently changed namespace or controller revision fails closed. It neither modifies canonical records nor inserts a Learning Development.
4. Leaves all normal Project/GPT/Home routes unchanged, including their synthetic exclusions. This is **not** a new public test mode, a synthetic Home feed, a temporal synthesis, or a server-observed MCP trace.

For verification, compare the returned `ordinary` value with the ordinary `/api/project-context` outline and confirm synthetic records remain absent from `scope:home`. Re-run against the already seeded K state with and without optional GPT outputs; this must not reset or advance the live epoch-3 fixture or append the open transcript. Run the disposable local fixture regression tests before proposing a Sites release. Source PR merging alone does not deploy this action.

**Visual acceptance is a separate, necessary follow-up—not a reason to hide the fixture from the owner.** Before issue #18's real UI journey tests, provide an owner-only way to reveal the registered synthetic Project in the **normal Projects, Notes, Library, Flags, annotations and navigation screens**, preserving those screens' actual behaviour and source links. Distinguish it visibly as TEST ONLY, isolate it from invited-account and routine learner views, and allow deliberate entry/exit without resetting the fixture. Whether it defaults to visible for the owner or uses an explicit test-data toggle is an owner UX choice to settle in that focused implementation. A special read-only MCP comparison cannot substitute for browser interaction evidence, and globally removing the production synthetic fences would not demonstrate a safe user experience.

### S04 checkpoint compatibility (30 October 2026)

The first live V3 S03 conversation saved its explicitly authorised, synthetic Question checkpoint under the literal manifest key `TEST-ONLY-m2m-save-c01`, rather than the epoch-scoped `TEST-ONLY-m2m-r3-save-c01`. This is **one exact historical alias**: it is accepted only for epoch 3, only when it remains synthetic and targets `TEST-ONLY-m2m-r3-question-storage`. The fail-closed validator still rejects unknown checkpoint identities and targets. `reservedOutputs` returned by the controller now resolves checkpoint IDs for the current epoch; future GPT-created checkpoints must use those epoch-scoped IDs. Do not reuse the legacy C01 ID in another epoch.

Checkpoint readback and controlled retirement cover Question-scoped developments as well as Project-stage developments, using the exact current synthetic target revision for canonical withdrawal. They never delete historical development editions. An existing pending transition is resumed **only with its original operation ID and exact inputs** after the corrected implementation is deployed; do not reset or create a second test epoch merely to clear it.

The `MINAMO_SCENARIO_SOURCE_SHA` setting identifies the **pinned scenario corpus baseline** for an in-flight transcript. A controller-only correction does not rewrite the fictional corpus or retroactively rebase the prior transcript. Keep that baseline pin unchanged for recovery; record the corrective deployment's actual Sites version and Git/source commit separately. Changing this setting while an existing run remains open would trigger its intentional transcript `test_source_conflict` guard.

## Deployment and safeguards

Required server bindings, set through the **reviewed native Sites release workflow**, never committed with personal values:

- `MINAMO_SCENARIO_CONTROL_ENABLED=1` — **absent/disabled by default**, including public/self-hosted builds.
- `MINAMO_OWNER_ID` — existing trusted Sites owner identity. Ordinary invited identities cannot list or invoke this controller.
- `MINAMO_SITE_HOSTS` — existing trusted private Site host allowlist.
- `MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER=1` — explicitly enables **only manifest-bounded synthetic fixture transitions** under the owner's 29 October decision in [issue #10](https://github.com/frekland/Minamo/issues/10). It is not a general restore, reset or deletion authorisation. The feature remains inaccessible unless the primary controller flag and identity/host checks also pass.
- `MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED=1` — legacy alternative mutation gate if a protected export/recovery route has actually been verified. Do not set this based on the waived backup or a historical archive. Either this flag **or** the synthetic-only waiver must be set for `load/advance/reset`.
- Optional `MINAMO_SCENARIO_SOURCE_SHA` — reviewed public-source SHA for comparison with the actual Sites deployment. A declared SHA is **not proof of live source correspondence**; verify native Sites version/tree separately.

The generated migration `drizzle/0013_wide_robbie_robertson.sql` adds only the controller's operation journal. There are no edits to the Library schema or ordinary records in this source increment. Rebuilding a fixture uses a new `TEST-ONLY-m2m-rN-*` identity (100-run safety cap), canonical withdrawal of only its own synthetic checkpoint heads, and canonical Trash commands against the previous run's **known, synthetic** record IDs, including the exact synthetic bookmark. Before each transition, the controller also rejects any unknown or non-synthetic record occupying the next run's reserved identity, including before old fixture cleanup. Canonical retained revisions and checkpoint history remain recoverable rather than bulk-purged. Do not run `emptyTrash` as part of scenario control.

**The fresh backup prerequisite was waived for this small synthetic-only controller by issue #10.** This does not approve broader replacement of Library, Notes, Areas, media, or arbitrary owner data. A production operator must establish the exact synthetic fixture namespace, current Sites generation, owner identity, applied migration and flag configuration before enabling the waiver. The existing full recovery/export defect remains tracked separately and must not be represented as fixed or verified.

## Local engineering checks

```sh
node --test --test-force-exit tests/scenario-controller.test.mjs tests/mood-to-music-scenario.test.mjs
pnpm exec tsc --noEmit --incremental false
```

The controller tests use disposable Miniflare D1/R2 and synthetic identities. They check disabled-by-default tool visibility, non-owner rejection, mutation-gate preflight, known IDs, generation/revision conflicts, A→B→E transitions, Project structure changes, cleanup, idempotent retries, simulated lost acknowledgement, an unrelated Library record and a genuine-record collision in the reserved fixture prefix.

The *final review gate* remains full typecheck, app build, entire regression suite and relevant Chromium example/browser checks on the exact final candidate head. The initial narrow, reviewed source promotion and hosted authenticated MCP/Cloud Browser checks **were completed for V75** on 29 October, with a genuinely separate read-only fresh-chat reconstruction. The original acceptance details are in [the stage-1 tracker](acceptance/2026-10-29-project-continuity-stage1-tracker.md). **Subsequent source changes** still require their own exact-head typecheck/build/tests, reviewed native promotion and real hosted checks; V75 evidence does not automatically verify later changes or conversation write-back.

Do not infer automatic GitHub merge or any further Sites deployment from the initial V75 acceptance; public PR review/merge is a separate owner-authorised process. Do not migrate/replace owner data or implement other Project subjects as collateral to this controller foundation. The owner has **subsequently selected** HTB `Cap` and the Automatic Plant-Screamer for later, separate synthetic-fixture evaluation ([#12](https://github.com/frekland/Minamo/issues/12)); this does not expand current controller support. A reviewed Sites V75 release has occurred, but source preparation or a later GitHub documentation commit alone is **not** a new publication.
