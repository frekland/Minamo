# Frozen zero-code producer trial

Trial date: 25 October 2026. Frozen source: `908544161e1dc54b3c9ff32f6c3c377da7c96f74`. Execution checkout: `/workspace/scratch/51551cd86194/trial-zero-code`, detached from the working frontend checkout. Existing dependencies were reused through a `node_modules` symlink; no packages were added. This is a restricted-context integration trial, not a measurement of literal smaller-model performance or hosted acceptance.

## Inputs and original composition

The agent read only `docs/interface-foundry/SDK-RECIPES.md`, `scripts/interface-foundry-template.mjs`, the explicitly permitted `tests/interface-foundry-contract-domain.test.mjs` API fixture, and the corrected storage helper `tests/private-storage-fixture.mjs`. The dossier's suggested `tests/helpers/private-storage-fixture.mjs` location was corrected using the fixture's import. No frontend or runtime implementation was inspected or edited.

The new executable test is `tests/interface-trial-zero-code.test.mjs`. It authors a new TEST ONLY Activity, `synthetic-zero-code-tide-clock`, pairing original fictional Luma harbor prose (`text/plain-v1`) with an independently authored periodic expression (`math/tex-v1`). These are separate existing Foundry engines. All source, payloads, instructions, reflection, IDs and intent are original to this trial. The presentation recipe places prose in `source`, the formula in `explore`, the question in `task`, and the reflection in `evidence`.

Manual choices: reuse known admitted text/TeX payload shapes from the allowed fixture; choose the optional `mathematics-science` pattern; revise only the recipe to `predict-explore-compare` under ordinary CAS to prove retained-edition readback. No renderer, route, engine, architecture, dependency, production deployment, GitHub write, Run or checkpoint operation was introduced.

## Executable checks

The test discovers the actual isolated typed MCP catalogue before constructing its Activity. It checks both engines and patterns are already advertised, previews with zero Activity records, explicitly publishes, reads exact recipe and full canonical artefacts, creates a second edition by changing only the recipe, and reads the unchanged original rendition. A second synthetic principal must be denied both editions through typed MCP and the ordinary read endpoint without leaking source. Database counts for Run records, checkpoint records, checkpoint-named tables (if any), and `v2_learning_developments` must remain at their initial zero values. The acquired fixture is disposed in `finally`.

## Commands and observed evidence

- `git worktree add --detach /workspace/scratch/51551cd86194/trial-zero-code 9085441`: succeeded, detached HEAD `9085441`.
- `ln -s /workspace/scratch/51551cd86194/minamo-v2/node_modules /workspace/scratch/51551cd86194/trial-zero-code/node_modules`: succeeded; dependency reuse only.
- `node scripts/interface-foundry-template.mjs --id synthetic-zero-code-tide-clock --output /workspace/scratch/51551cd86194/trial-zero-code-draft.json`: succeeded. This inspected the generated recipe envelope; the test's final content is independently authored and does not publish that draft.
- `node --check tests/interface-trial-zero-code.test.mjs`: passed, exit 0.
- Extracted the original request factory from the new test into a temporary JSON file, then ran `node scripts/interface-foundry-template.mjs --validate <temporary request>`: passed, exit 0. Exact output: `Local Activity and renderer source validation passed. MCP preview still must recheck current owner/generation/source authority. No write performed.` The temporary validation directory was removed.

`node --test tests/interface-trial-zero-code.test.mjs`: final frozen-worktree execution passed, exit 0: 1 test, 1 pass, 0 fail, 0 cancelled, 0 skipped. Test duration 1722.967506 ms; total duration 1993.313433 ms. The real fixture completed and its final diagnostic confirmed disposal.

Completed assertions establish that the actual typed MCP advertised both engines and patterns; preview was valid with zero persisted Activities; both original publication and recipe-only revision committed; exact recipes and both complete canonical artefacts roundtripped; the first rendition remained unchanged; both editions denied a foreign principal without leaking source; there was exactly one current Activity record; Run, checkpoint and learning-development counts remained zero. This is successful local isolated acceptance; it does not establish hosted refresh/deployment acceptance.

## Startup observations and retries

Before the detached-worktree requirement was clarified, two attempted capability discoveries used the shared checkout. Neither completed fixture acquisition or reached a typed MCP response. One tool call discarded the returned process session ID inadvertently, so that process could not be explicitly interrupted from that ID; another was interrupted. These attempts are not claimed as valid frozen-source evidence.

The detached-worktree diagnostic reached `before fixture` and did not complete fixture acquisition. A separate frozen domain-worker esbuild invocation succeeded (4,822,105-byte bundle, approximately 0.2 seconds). A minimal Miniflare probe stalled at `await getD1Database('DB')`; removing proxy environment variables for one probe did not resolve it. The tracked diagnostic/probe processes were interrupted. These were observed startup stalls, not Activity/schema validation rejections; no actual capability or publish result was returned by those attempts. No persistent environment blocker is claimed: the parent's subsequent execution acquired and disposed the real fixture normally in approximately 1554 ms, and the final agent execution also succeeded without environment workarounds.

Validation retry #1: the parent's first frozen test execution failed at the consumer assertion `caps.presentation.patterns.includes('mathematics-science')`. The catalogue actually returns pattern objects containing `id` and `label`, rather than bare ID strings. The dossier calls them pattern IDs without documenting that envelope. Based only on the observed catalogue response, the test was corrected to map `pattern.id`; no runtime source was read or changed. The next complete test run passed. No Activity schema, canonical source/hash, preview, or publish rejection occurred, and no payload was retried after an uncertain publication response. The executable has no retry loop.

## Changed files

Only these two new repository files belong to this trial:

- `tests/interface-trial-zero-code.test.mjs`
- `docs/interface-foundry/TRIAL-ZERO-CODE.md`

The dependency symlink is local trial setup, not a repository implementation change. The inspection draft was removed after validation. No commit was made by the trial agent.
