# Testing and evidence

The repository includes Node test suites, isolated D1/R2/Worker exercises, browser-spec fixtures and development helpers.

## Current acceptance gate (31 October 2026)

The [coordinated three-layer reconciliation](acceptance/2026-10-31-three-layer-reconciliation-acceptance.md) has **bounded TEST-ONLY PASS** evidence for nine paired GPT-submitted attempt/result reports, eight qualifying server-received MCP calls, one explained selector exclusion, three canonical before/after comparisons and revision-safe synthetic Flag cleanup. This follows [V85 observed-call/state-diff acceptance](acceptance/2026-10-31-v85-observed-mcp-state-diff-acceptance.md) and [V86 adversarial local tests](acceptance/2026-10-31-observation-adversarial-matrix.md). The result is **not** a complete host transcript, a physical-byte privacy audit or a learner-experience PASS. The transcript is still open and the observer paused; no fixture reset or production learner data change was performed.

The owner-only registered-fixture continuation comparison is available at live K without weakening ordinary synthetic exclusions. The separate #14 source-linked temporal/efficiency diagnosis remains unfinished. Under #12, the accepted default Mood-to-Music V3 history remains the only substantial completed subject; its three distinct overlays and the HTB Cap / Plant-Screamer subjects (three variants each) are still to be built and independently checked. The [Project Workbench handoff](PROJECT-WORKBENCH-IMPLEMENTATION-HANDOFF.md) explicitly defers functional UI implementation until the 3×3 corpus is accepted; #18 visual testing remains a distinct later gate.

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
