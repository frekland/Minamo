# Testing and evidence

The repository includes Node test suites, isolated D1/R2/Worker exercises, browser-spec fixtures and development helpers.

## Current acceptance gate (31 October 2026)

The [coordinated three-layer reconciliation](acceptance/2026-10-31-three-layer-reconciliation-acceptance.md) has **bounded TEST-ONLY PASS** evidence for nine paired GPT-submitted attempt/result reports, eight qualifying server-received MCP calls, one explained selector exclusion, three canonical before/after comparisons and revision-safe synthetic Flag cleanup. This follows [V85 observed-call/state-diff acceptance](acceptance/2026-10-31-v85-observed-mcp-state-diff-acceptance.md) and [V86 adversarial local tests](acceptance/2026-10-31-observation-adversarial-matrix.md). The result is **not** a complete host transcript, a physical-byte privacy audit or a learner-experience PASS. The transcript is still open and the observer paused; no fixture reset or production learner data change was performed.

The owner-only registered-fixture continuation comparison is available at live K without weakening ordinary synthetic exclusions. The separate #14 source-linked temporal/efficiency diagnosis remains unfinished. Under #12, all **nine versioned fictional variants across three Project subjects** are now implemented as **local-only** disposable D1/R2 replay cases: Mood-to-Music's weekend (#57), documentation sceptic (#58), privacy-led reviser (#60); retired HTB Cap's command-log, packet/model and sparse-return variants (#61); and Plant-Screamer's breadboard, calibration and shared-space variants (#62). These tests do not constitute hosted persona selection, model/MCP longitudinal acceptance or a real learner-experience PASS. A strict local 3×3 registry and cross-subject isolation cases are included; shared hosted scenario/controller/transcript/observer selection and receipt alignment remain future engineering, as does the #14 source-linked context diagnosis. The [Project Workbench handoff](PROJECT-WORKBENCH-IMPLEMENTATION-HANDOFF.md) defers functional UI implementation until those applicable gates are accepted; #18 browser/visual testing remains distinct.

**V88 candidate update:** The previously local-only matrix is now also wired into the owner-gated hosted scenario/controller/transcript/observer APIs through a per-persona D1 key, exact run prefix, source-file SHA-256 pin and synthetic-only cleanup boundary. The local integration gate is `tests/hosted-three-by-three-controller.test.mjs`: one representative controlled transcript/server-observed/canonical-diff exercise, all nine variant F selections with run/session/source binding, and a reset/collision preservation case. The representative test is driven by a disposable **Node harness**, not GPT and not a cold-context run. Source readiness, reviewed release, live hosted reconciliation, actual fresh-chat coverage and learner experience require **separate** evidence after the exact-head CI and native Sites deployment; see [V88 control contract](SCENARIO-CONTROL.md#v88-hosted-33-selector-and-exact-provenance).

The dated section below records earlier decisions and should not override the newer live acceptance evidence.

## Current longitudinal acceptance and next architecture experiments (30 October 2026)

Mood-to-Music V3 **S01–S06** finished with a bounded independent conversational-continuity PASS, not full UI/runtime or learner-comprehension certification. The TEST-ONLY fixture and transcript remain preserved. See [the consolidated closeout, finding routes and learner-context architecture roadmap](acceptance/2026-10-30-m2m-v3-closeout-and-learner-context-roadmap.md).

Next research and test development: (1) owner-only synthetic-continuation fidelity plus server-observed MCP calls/errors/timing and canonical pre/post state diffs; (2) evidence-backed diagnosis of Project/learning-context projections and MCP efficiency on the same fixture; (3) a focused Minamo improvement and comparative replay. The **larger learner-visible experience redesign** requires its own [recovered product-research and UX strategy](LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md), including a still-unperformed comparative interaction study; a better GPT context payload is not UI acceptance. Additional scenario subjects and optional visual-agent acceptance are later steps. The fictional React app's imperfect storage/consent behaviour is learner-progress evidence, not an automatic product repair task. Preserve all historical reports.

## Basic checks

~~~bash
pnpm run typecheck
pnpm run build
pnpm test
~~~

The test command runs `tests/*.test.mjs` with bounded concurrency. Synthetic records, identities and outputs are marked as fixtures. Tests target domain rules, API/MCP paths, source admission, content anchors, writing/recovery, tools, learning interfaces and related navigation.

## Fast, gated development of the 3×3 fictional corpus (owner decision, 31 October 2026)

**Use one draft PR per Project subject, with small separately reviewable persona commits, not a new full CI cycle after every persona.** The existing [focused-test selector](../scripts/ci-focused-tests.mjs) and [Source checks workflow](../.github/workflows/check.yml) provide this path. This is a faster development cadence, **not** a waiver of the final acceptance or a new infrastructure layer.

| Change stage | Expected verification | What does not run yet |
| --- | --- | --- |
| Each new/updated fictional persona on a draft PR | Targeted local replay tests for that persona; draft CI typecheck plus selected changed and same-subject scenario/persona/controller tests | Full app build, full regression, Playwright/browser fixture suite |
| Project's three variants ready for review | Mark the Project PR ready; **full CI**: typecheck, app build, entire regression, Mood-to-Music source/browser fixture checks | No automatic Site deployment or genuine learner interaction |
| Merge of docs-/fixture-/persona-test-only reviewed PR | The PR's passing full gate remains the publication evidence; skip an identical main-push full run | No skipping checks for app, domain, schema, auth, source-rights or tooling changes |
| Final 3×3 corpus gate, after all subjects | Explicit cross-subject replay/identity/revision/provenance/receipt tests and #14 diagnosis; manual full workflow if no normal ready-PR run covers the exact candidate | Workbench information contract, UI slice and owner UX acceptance remain later gates |

**Working loop for each subject:**

1. Start from current public `main`, review #12 and the relevant canonical manifest/seed. Keep one **draft** PR for the subject: finish Mood-to-Music's privacy-led variant, then group all three retired HTB Cap variants in their own PR, and all three Automatic Plant-Screamer variants in a third. Make small commits per persona so its unique causal trajectory remains reviewable. Avoid copying the V3 chronology or inventing GPT responses.
2. Put each new subject under `tests/project-scenarios/<subject-slug>/` and its Node tests at `tests/<subject-slug>-<persona>-variant.test.mjs` (plus a subject-level scenario test). The focused selector automatically includes all root tests beginning with that subject slug when its scenario files change. Keep actual compiled-domain, disposable D1/R2 replay checks for revisions, source anchors, owner isolation, CAS/replay receipts, authored-vs-GPT boundaries and no accidental default-variant leakage. Record exact evidence and negative cases per persona.
3. During iteration run only the new/relevant tests, for example `node --test --test-force-exit --test-concurrency=1 tests/mood-to-music-docs-variant.test.mjs`. Draft PR pushes run CI's existing selected tests plus typecheck. Do not run full `pnpm test`, app build and browser fixture tests again after every fictional Note unless a failing signal or shared app/domain change warrants it. The test command must be run from the repository root.
4. At the **Project** milestone, mark the draft PR ready, require its complete green GitHub Source checks before merging, and record the exact run, skipped tests, source SHA, evidence boundaries and remaining corpus work. A fixture-only post-merge main push intentionally has no duplicate check; **do not bypass the review-ready PR full gate by pushing fixtures directly to `main`**. A mixed change containing app/lib/db/scripts/workflow files still runs full main-push checks. The `workflow_dispatch` manual full run remains available.
5. After all nine persona histories and three subject foundations exist, separately test the shared scenario/controller/transcript/observation selection and receipts and cross-subject isolation at the agreed gate. The #14 source-linked F/H/K efficiency/context diagnosis remains required. Hosted TEST-ONLY changes, Site deployment and any fixture reset still require their own explicit permissions. Passing these tests proves canonical synthetic replay **only**, not that a learner used Minamo successfully.

**Portability note:** A historical UI test in `tests/pr27-task-workspace.test.mjs` assumes UK-formatted dates. In a container defaulting to US locale/New York time, one assertion failed; the targeted test and complete 1,493-test run passed with `TZ=Europe/London LANG=en_GB.UTF-8`. Diagnose the environment before treating such a failure as a source regression; do not silently relabel failed results as passes.

Some focused tests compile actual Worker components or use Miniflare; the browser specs under `tests/interface-browser/` require a preview URL and Playwright setup. Visual baseline captures from the historical private development process were intentionally not imported; new baselines should be generated against a local synthetic preview.

## Interpreting the results

A green unit/integration suite does **not** prove:

- Hosted ChatGPT identity or invited second-account separation.
- Actual ChatGPT connector installation and MCP tool catalogue refresh.
- Every physical-device layout or browser history/navigation interaction.
- High-risk recovery against real user data.
- That a learner performed an external experiment.
- A provider-neutral deployment.

The final private V72-era review reported no observed P0/P1 issue in its sampled owner workflows but gave **conditional acceptance** because coverage remained incomplete. This clean repository has not yet received an independent end-to-end run. Any future public release should record its own fresh checks and limitations, not inherit private deployment claims.
