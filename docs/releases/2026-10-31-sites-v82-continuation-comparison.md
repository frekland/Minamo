# Sites V82: registered-synthetic continuation comparison

Date: 2026-10-31 UTC  
Target: existing Minamo Site, <https://minamo.jscymru.chatgpt.site>  
Status: **deployed**; read-only K comparison verified

## Exact source handoff

- Public source: `frekland/Minamo` `main` at `0d96b82ca0d9b76a470e495efa4694a09b191286`, including merged PR #38.
- Separate native Sites source: `2928fc59b5bf03ad99931d33cde90e7cce092c80` (fast-forward from V81 `8159685e18147da90674ae815b7a4d5ad4bd03a3`).
- Only these four reviewed public files were promoted; their Git blobs were byte-identical in both trees before the native commit:

  | File | Git blob SHA |
  | --- | --- |
  | `lib/project-context.ts` | `ed3cd570c847f2a89543b294830f29dcc8ff6965` |
  | `lib/scenario-control.ts` | `ac4277368dc05c9d97eae11298d46b65d9d9c140` |
  | `tests/scenario-controller.test.mjs` | `95d6169e586487ff4457970c8198c6a7d7e86611` |
  | `docs/SCENARIO-CONTROL.md` | `7c01c688f09af890cfef6ca52d570d4c2b38f8cd` |

The private native source still owns its existing hosting identity and configuration, Site-specific assets, branding, and other already documented native-only differences. No whole-tree replacement, D1/R2 data migration, or public-to-private token copy occurred.

## Validation and deployment

- Native dependency install with frozen lockfile: passed.
- Native TypeScript check: passed.
- Native production build: passed; packaged root `.openai/hosting.json`, `dist/server/index.js`, built client assets, and `public/`.
- Full native tests: **1,469 passed, 4 skipped, 0 failed** (1,473 total).
- Saved **Sites V82** from the pushed native commit with the matching 526-file build archive; production deployment succeeded.
- Access remained `custom`, at the same access-policy revision `1` and the same one invited external viewer. The site's URL did not change. Existing runtime bindings were not modified.
- Rollback reference: the previously deployed **V81**, native source `8159685e18147da90674ae815b7a4d5ad4bd03a3`.

## Live read-only acceptance

The owner-only scenario controller reported Mood-to-Music fixture **K**, epoch **3**, revision **21**, with no pending transition. Invoking the new `compare-continuation` action with the exact generation returned:

| Admission | Continuation | Basis | Result |
| --- | --- | --- | --- |
| Ordinary production exclusion | “Define subjective suggestions” | `start` | Complete |
| Exact registered fixture read | “Do personal labels survive refresh?” | `recent-note` | Complete |

`basisDiffers: true`. The second read used the same canonical continuation resolver with owner-authorised, manifest-registered synthetic IDs. The difference demonstrates why ordinary synthetic exclusion must not be mistaken for an accurate test of the learner's historical continuation. Neither path mutated the fixture. This comparison is **not** passive MCP tracing, temporal evaluation, a browser observation, or a claim that general learners can now see synthetic records.

The broader scenario `inspect` call returned a generic MCP internal error during this check; the narrower `list` and newly deployed `compare-continuation` calls succeeded. Investigate that inspection failure separately if reproducible.

## Remaining work

1. Issue #17: bounded, server-observed, opt-in synthetic MCP operation/error/timing provenance, then independent canonical pre/post state-diff evidence. Do not conflate this with model-submitted transcript text.
2. Issue #14: use these measurements to improve the actual source-linked continuation decision, and replay K afterward.
3. Issue #18: make registered synthetic material visible **in the normal app UI for the owner only**, clearly labeled `TEST ONLY`, while retaining exclusion from invited viewers and ordinary production data paths. Visual analysis is otherwise incomplete.

This receipt contains no owner identity, deployment credential, private manifest contents, or live user records.
