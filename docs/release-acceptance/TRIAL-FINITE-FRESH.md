# Fresh restricted finite registration trial

Frozen base: `9971481`. Isolated clone: `trial-finite-fresh`; candidate untouched. This is a restricted-context SDK trial, not literal model-performance evidence. No browser, production service, learner data, secrets or deployment was used.

Scaffold: `node scripts/interface-view-scaffold.mjs --id trace.fresh-beacon-v1 --title "Supplied beacon events"`. The untouched original generated fixture is retained at `.sites-runtime/interface-view-trace-fresh-beacon-v1.json` and copied verbatim to `docs/release-acceptance/fixtures/interface-view-trace-fresh-beacon-v1.json` for durable replay. The generated three-line module delegates to `finiteTraceView`; only the printed metadata and static loader entries were added. No new source kind or dependency.

Application-only patch: `TRIAL-FINITE-FRESH-APPLICATION.patch` (exactly catalogue, registry, generated module; reverse application check passed). This is a disposable trial registration, not a request to ship it. Reusable test: `tests/release-light-finite.test.mjs`; it reads the retained fixture, writes its bundle only under OS temporary storage, and disposes Miniflare in `finally`.

## Results and actual retries

- Before registration, fixture validation exited 1 as required: `ActivityShapeError: Invalid enum value ... received 'trace.fresh-beacon-v1'`, path `activity.presentation.slots.1.viewId`. After adding both printed entries, the identical fixture validated successfully.
- Native-DOM test proved initial previous/first boundaries, next through all three events, disabled final next, previous, first, full textual alternative, native `button` types, inert command text/no script nodes, exact canonical hash, forged payload denial, current-source denial, revocation cleanup, removed listeners and idempotent disposal. Shared extension tests also prove late-load rights recheck and exactly-once teardown.
- Initial omitted-view activation attempted the original React renderer in the native-DOM harness and failed `Target container is not a DOM element.` No application correction was needed. The final test instruments the original adapter loader with a sentinel and proves omitted view selects it once and never loads the enabled extension. This is loader identity evidence, not browser/React-rendering evidence.
- Real isolated Worker/D1 typed MCP capability discovery, read-only preview (zero Activity records), publish, exact rendition readback, outsider 404, and idempotent replay passed. Readback preserves the complete Activity, explicit `trace.fresh-beacon-v1`, source string and SHA-256.
- Receipt: `synthetic-trace-fresh-beacon-v1`, rev 1, rendition `r-c6e1a98ef0d950c2e90e833d89822b436674f231101a2aab1c1cbd6318b7fe98`. Canonical SHA-256 `df72799f0f79a1b0fa13a1e8cef4b839da79e779498563c65c3a36c904cffd95`. Run/Attempt records: 0; learning-development/checkpoint records: 0. Command text remains supplied data; no command execution was performed. All synthetic D1/R2 fixtures disposed.

Validation: `pnpm run typecheck` passed. `node --test tests/release-light-finite.test.mjs tests/interface-extension*.test.mjs tests/interface-foundry-contract*.test.mjs` passed 27/27; final targeted rerun after strengthening notice/text-alternative assertions passed 3/3. No runtime fixture writes from the reusable trial test. Desktop, 390px, actual keyboard gestures, Notes and visual accessibility were not tested because browser use was outside this trial's scope.

Replay on a disposable checkout of `9971481`: apply the application patch; copy the reusable test and retained JSON fixture at the paths above; link/install existing dependencies; run the validation commands above. Keep the trial registration out of the release candidate.
