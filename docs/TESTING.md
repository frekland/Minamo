# Testing and evidence

The repository includes Node test suites, isolated D1/R2/Worker exercises, browser-spec fixtures and development helpers.

## Current longitudinal acceptance and next architecture experiments (30 October 2026)

Mood-to-Music V3 **S01–S06** finished with a bounded independent conversational-continuity PASS, not full UI/runtime or learner-comprehension certification. The TEST-ONLY fixture and transcript remain preserved. See [the consolidated closeout, finding routes and learner-context architecture roadmap](acceptance/2026-10-30-m2m-v3-closeout-and-learner-context-roadmap.md).

Next research and test development: (1) synthetic server-observed MCP calls/errors/timing and canonical pre/post state diffs; (2) evidence-backed diagnosis of Project/learning-context projections and MCP efficiency on the same fixture; (3) a focused Minamo improvement and comparative replay. Additional scenario subjects and optional visual-agent acceptance are later steps. The fictional React app's imperfect storage/consent behaviour is learner-progress evidence, not an automatic product repair task. Preserve all historical reports.

## Basic checks

~~~bash
pnpm run typecheck
pnpm run build
pnpm test
~~~

The test command runs `tests/*.test.mjs` with bounded concurrency. Synthetic records, identities and outputs are marked as fixtures. Tests target domain rules, API/MCP paths, source admission, content anchors, writing/recovery, tools, learning interfaces and related navigation.

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
