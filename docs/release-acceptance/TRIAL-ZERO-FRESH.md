# Fresh restricted-context Tier 0 trial

Frozen source: `9971481eda2444014a53055ac1fade2ebd1370bc`. Isolated local clone: `/workspace/scratch/10fcadaf9a6c/trial-zero-fresh`; source `candidate` was not edited. Its dependency directory was linked into this clone. This was a fresh restricted-context integration trial simulating a future small-model task, not a literal small-model performance or cost benchmark.

The original TEST ONLY specimen is `synthetic-nacre-lantern-fold`: fictional paper-lantern prose plus independently authored finite TeX expression, using the existing `text/plain-v1` and `math/tex-v1` kinds. It includes an astral character, combining accent and literal CRLF to make exact-source preservation observable. No frontend, registry, runtime, dependency or SDK implementation changed.

## Executable evidence

Run from the clone:

```sh
node --test tests/release-light-zero-code.test.mjs
```

The test compiles the existing domain handler and calls the real local `/mcp` tools through `privateStorageFixture`, Miniflare Worker, D1 and R2. It discovers both existing kinds and both recipe patterns through `get_minamo_activity_capabilities`, previews, explicitly publishes, reads the exact saved Activity, revises its recipe with CAS and a new operation ID, reads the current edition and then reads the retained original edition. It uses original authored synthetic principals only.

Both initial and revision previews compare complete rows in every accessible D1 table, and all R2 object keys/etags/sizes, before and after the call. They were identical. Cloudflare's protected `_cf_` internal metadata is excluded because D1 refuses its contents; all application tables remain included.

Exact Activity, recipe, artefact, payload source and independently recomputed SHA-256 equality are asserted on publication and readback. Recipe revision changes `mathematics-science` to `predict-explore-compare` and preferred focus from `explore` to `source`. Original retained recipe and sources remain exact. Both edition reads deny a different synthetic owner without leaking the original source text; its direct API read returns 404.

| Source | SHA-256 of exact UTF-8 text |
| --- | --- |
| Original prose | `19b650284e71c4c8e4cb496386e558a64947f2da566795d2af0ad5e8113a4aa8` |
| Original TeX | `f77fca1be466517e08c31f6fb7a11eaaf116f77801b3a25f06902e9c047898f5` |

Initial revision: 1, rendition `r-a8c9d0690c29b714cba150e030e8721198cef42ccb841a22a673ee5f6f9fb4b4`.
Revised revision: 2, rendition `r-e7e09eccb7ee4ed518a96cf52a5ad40b64ac5b94d5574cc5fb965af1407f53b9`.

The final application record count is one `experiment`. Counts remained zero for record families `attempt`, `run`, `checkpoint`, `learning`, `achievement` and tables `v2_learning_developments`, `v2_learning_development_revisions`, `v2_learning_perspectives`. Both publish responses explicitly returned `learningDevelopmentCreated:false`. The fixture is disposed in `finally`, including the failed first execution.

## Errors and retries

1. Documentation lookup of permitted `lib/mcp.ts` returned rg exit 2: file absent. A bounded filename search found current `lib/activity/mcp.ts`; its Activity capability and tool schema catalogue was inspected. No implementation edit was needed.
2. First executable attempt failed before preview: `D1_ERROR: access to _cf_METADATA.key is prohibited: SQLITE_AUTH`. The test had attempted to snapshot every table, including Cloudflare-protected metadata. Result: 1 test, 0 pass, 1 fail, 3013.551317 ms; fixture disposal diagnostic confirmed cleanup. Corrected only the trial snapshot to exclude reserved `_cf_` tables.
3. Second execution passed: 1 test, 1 pass, 0 fail, 3185.327205 ms. All specified preview, publication, readback, retained edition, ownership and zero-achievement assertions passed.
4. The parent requested the reusable filename `tests/release-light-zero-code.test.mjs`. The unchanged test was renamed and rerun under that filename: 1 test, 1 pass, 0 fail, 3485.655974 ms (test body 3103.812948 ms). Exact final Node output is preserved in `trial-zero-fresh-results.txt`.

No product/schema gap was encountered. The retry was a trial introspection correction, not an SDK correction.

## Scope and files

Read context was limited to `AGENTS.md`, `LIGHT-ACTIVATION.md`, `SDK-RECIPES.md`, `lib/interface-extension-catalogue.ts`, `scripts/interface-foundry-template.mjs`, current `lib/activity/mcp.ts` catalogue lines, and the two permitted reusable test/fixture files. The fixture itself compiles the actual application and loads its existing migrations; no other architecture documentation was read.

Created files are the test above, this report, `trial-zero-fresh-request.json` (exact original request), and `trial-zero-fresh-results.txt` (final execution output). The only execution harness dependency is the existing reusable fixture. No checkpoints, external credentials, production calls, browser use, deployment, or learner records were involved.

This proves isolated local Worker/D1/R2/MCP behavior. It provides no browser gesture, screenshot, hosted service, installed-client catalogue refresh, production deployment, or learning achievement evidence.
