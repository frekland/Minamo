# Testing and evidence

The repository includes Node test suites, isolated D1/R2/Worker exercises, browser-spec fixtures and development helpers.

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
