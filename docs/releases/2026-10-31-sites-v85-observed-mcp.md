# Sites V85 — observed MCP tracing and canonical state diffs

**Released 31 October 2026** to the existing [Minamo Site](https://minamo.jscymru.chatgpt.site). This is a production source and schema deployment, **not** evidence that a new hosted synthetic observation run or fresh ChatGPT client session has been exercised.

## Release identity and boundaries

| Boundary | Evidence |
| --- | --- |
| Public feature integration | [PR #44](https://github.com/frekland/Minamo/pull/44), squash merge `3e116e92891a0128e53e4e30b7ce058017b16e57` |
| Previous native production source | V84, `638e5e733990e9dbb9f3c29f04e9db99288ec1cd` |
| Released native source | `ec9a02fff7d6f766b08e74280622e419d6b17507`, fast-forward child of V84 |
| Production version | **V85**, deployment succeeded with MCP enabled |
| Release archive | SHA-256 `c9e0f64e292a622fee19641baa406e3351a6bcb469d053afa0a7a4e2151a75f4`; packaged `.openai/hosting.json`, `dist/server/index.js`, static assets and Drizzle SQL |
| Rollback source/version | Saved V84 remains the previous known-good publication target |

The native repository remains a distinct protected Git/hosting target; this release did not alter its Site identity, private `.openai/hosting.json`, owner/host authentication, D1/R2 bindings, brand assets or unrelated native implementation. The existing **custom** access policy retained two allowed-user entries and policy revision **1**; runtime environment revision remained **9**. This release did not migrate or mutate existing learner records by application command, reset a synthetic fixture, or run a hosted observation session.

## Bounded file manifest

Ten files were transferred from the public #44 implementation and **14 pre-existing public-main synthetic-discovery test opt-ins** were synchronized where the V84 native test copies still expected synthetic results without `includeSynthetic:true`. These test-only reconciliations restored the final native regression gate and did not change production behavior. All selected files match their public counterparts byte-for-byte except `drizzle/meta/_journal.json`, `drizzle/meta/0015_snapshot.json` and `drizzle/0015_bumpy_sharon_ventura.sql`, whose content is identical except for an added terminal newline in the native copy. The SHA-256 values below identify the **released native bytes**.

| Selected native file | SHA-256 |
| --- | --- |
| `db/schema.ts` | `15c51a04d266bd04108ff1d4a4a1f8aaa8b7ba7dd39a5bdba0c63ed5b44628bb` |
| `drizzle/meta/_journal.json` | `0c8c08ba28fb125b58bda422030a4a25443556a289281a4029d264e51bbf0353` |
| `lib/domain-handler.ts` | `07ccebf5c169312589df19849e729054bec2aa56c12aaea18d8c8de2b0501082` |
| `scripts/ci-focused-tests.mjs` | `ae4b2ce3734d9ce70a6b57a65f4cdb62105a3e98ab2ef2acfe3cdff046d602bb` |
| `tests/ci-focused-tests.test.mjs` | `96f0c6871a9b98f798a01ba4d9bdc7ce53a2dd82b404dea4153706cc6c4f257f` |
| `docs/acceptance/2026-10-31-observed-mcp-state-diff-implementation.md` | `fb1a72e4b32097b351f56e23bef3796e8b73c1586649c846cd09ae736a25b1e7` |
| `drizzle/0015_bumpy_sharon_ventura.sql` | `a5feec58659fbb7cf454ee61ac0813d13b39abb5daee0c7469d2656b31c2a19e` |
| `drizzle/meta/0015_snapshot.json` | `41d8491499b8cbeb56580cd2b295f4bf204b0dddb32ae99be2143c66f2a3d111` |
| `lib/test-observation.ts` | `a8bf3fb955ed1c8344ba38030f91918dae5ca96f72bc6d28b37fc1ea4ed4173b` |
| `tests/test-observation.test.mjs` | `3dd345ea915338f1c0fc4dd4a17b9cec5dede80aa9decc163b2e9e1e0c6e7c3b` |
| `tests/domain-concepts.test.mjs` | `1f8dd7213863d2302494a8456e3c02a5e8d7bacf57b26f5746a96a8a57d3330c` |
| `tests/domain-pagination.test.mjs` | `14975f734c415234dee4cee380f1cdcdacd674c699d95d2d7f4b7709d3e47e77` |
| `tests/future-authoring-guidance.test.mjs` | `f7ae9ab128535ab4a6d889d21abe0e8bfacfa8ccf7f09a0e2ea7d95485c8930b` |
| `tests/interaction-regression-integration.test.mjs` | `98024528a5555a61cfecfb1c9721799ea6d13959e71d33965f48be9ea57b060b` |
| `tests/journey-resume.test.mjs` | `8c38fde349ccc3cc95a80a071995cbab94311a747ca5383365b34945b4bce559` |
| `tests/learning-spaces-continuity.test.mjs` | `e67fbbaa2d9992acd6c068ebf7b9f986f8e5c4161e450ac018bb513950ac2129` |
| `tests/manuscript-rich-workflow.test.mjs` | `d8e6124ec1cda3eb50a453a03d5f8ce37d549cb28c98323a1dd278caac798dfd` |
| `tests/pr26-independent-authoring.test.mjs` | `ff9d4c29a1a0c26e8266e694ed4da4859a40137d4c9653c228db5c749fab403e` |
| `tests/pr27-authoring-quality.test.mjs` | `246a8a22baf44c30daeaf08f54bd4c639240fc77af8b6ccdc39c54c2438a57c7` |
| `tests/pr27-personal-discovery.test.mjs` | `ff07398ed4ed40a532f687fb6be0dd1c0f574babde13b261be47d4ee5272dc6e` |
| `tests/pr74-mcp-contracts.test.mjs` | `48b82ce416ef4a0baf49f1bb591a0b3153be2d3c49342c1e2102fe000194abd5` |
| `tests/search-evidence.test.mjs` | `dd5deefbf5191be313aef8576213f0eb739724adf832aa676af84db2e924ba24` |
| `tests/search-ranking.test.mjs` | `7ca09189611ac5e6cd2a298911952c92b1fa45f10e15c4f9312447007582e577` |
| `tests/unified-projects-acceptance.test.mjs` | `4a058b1500608fafe9ffa046fa437281d9dcc27854bb72e1db16e51450c5f5b1` |

No whole-tree public/native parity claim is made. This source manifest explicitly excludes older native-only hosting, branding, recovery and testing material.

## Validation and hosted readback

- Native locked dependency install succeeded with no downloads; `pnpm run typecheck` passed.
- `pnpm run build` passed, including the final release-tree rebuild. Only existing chunk-size, route-classification and test-time `import.meta` warnings remained.
- **Full native regression**: **1,477 passed, 0 failed, 4 skipped** of **1,481 tests**. The first run exposed stale synthetic test-helper expectations; the bounded parity updates were validated in isolation and the final whole-suite run was green.
- New observation coverage passed on isolated actual D1: owner visibility/denial, explicit activation and idempotent control, successful/failed received calls, bounded immutable before/after snapshots, diffs, pause/stop, epoch retirement and session re-arming.
- Sites saved V85 from the exact pushed SHA, published successfully to the existing URL, and returned MCP enabled and environment revision 9.
- Live D1 overview after publication confirmed `v2_test_observation_runs`, `v2_test_observed_calls` and `v2_test_state_snapshots` (35 user tables versus 32 before). The added `0015` schema migration ran before Worker publication.
- Post-release Site readback confirmed V85 native SHA, unchanged custom access policy, same two invite entries, and an authenticated read-only `get_minamo_workspace` MCP call without a tool error.

## Remaining acceptance boundary

The new `manage_minamo_test_observation` tool is **opt-in** and limited to authorized owner TEST ONLY fixture epochs; merely deploying it does not start recording. The installed tool list in the already-open ChatGPT session was cached and has **not** yet been proven to show the new tool. A fresh ChatGPT conversation or personal-plugin reconnect may be needed for catalogue refresh. A new explicitly authorized hosted synthetic run is still required to validate actual observed-call coverage, before/after diffs and F/H/K continuation behavior in the connected client. No invited-user browser or physical-device acceptance is claimed.

This release followed [the direct public-to-native Sites workflow](../SITES-RELEASE-WORKFLOW.md); the independent staging environment was not promoted.
