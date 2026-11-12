# Fresh cross-domain viability trial — PASS

Frozen source: `9971481eda2444014a53055ac1fade2ebd1370bc`. Isolated clone: `/workspace/scratch/10fcadaf9a6c/trial-cross-fresh`. This is a restricted-context future-Light authoring trial, not literal Light timing/cost, browser evidence, hosted acceptance or production approval.

The actual compiled local Worker/D1/R2 typed `/mcp` catalogue advertised `language/ruby-v1`, `math/tex-v1` and `language-reading` (`activity-studio-interface-foundry-2026-10-25.2`). I independently authored a TEST ONLY Activity joining Japanese counters with `N(d)=3(2+d),\quad N(0)=6,\quad N(1)=9`. Adding d seeds per dish is explicitly an authored assumption, not observed growth.

Original reading, with **CRLF** between these lines:

```text
TEST ONLY — 🪁雨の庭で、三つの皿に二粒ずつ種を置く。
記録: é / é。
```

It has **46 UTF-16 units, 45 code points, 96 UTF-8 bytes**. Exact original readings and end-exclusive UTF-16 ranges: 雨→あめ 14–15; 庭→にわ 16–17; 三つ→みっつ 19–21; 皿→さら 22–23; 二粒→ふたつぶ 24–26; 種→たね 28–29; 置く→おく 30–32; 記録→きろく 35–37. The astral kite is 12–14; decomposed e+U+0301 and precomposed U+00E9 remain distinct.

| Exact source | UTF-8 SHA-256 |
| --- | --- |
| Original reading | `908486af986d6a8483fe94a4b159ba7aee65dadc49fa900ee6759fdf13b6539a` |
| Canonical language JSON | `1a9ce3fc4560699f7f793d9055d8f5e644e93239f28cff4e585ae2abacf8ef46` |
| Canonical TeX | `37c31e02ae8a9922fe487ff0352a53b843aa77930b200fce636b8668fe660238` |

Seven deliberate malformed previews failed before publication:

| Case | Actual error/path suffix |
| --- | --- |
| Duplicate slot | A block can be mounted only once / `presentation.slots.4.blockId` |
| Dropped block | Every Activity block must remain reachable exactly once / `presentation.slots` |
| Foreign block ID | The exact Activity block is unavailable / `presentation.slots.0.blockId` |
| Ruby in guidance role | This trusted block cannot occupy that slot / `presentation.slots.1.slot` |
| Injected component field | Unrecognized key(s) in object: 'component' / `presentation.slots.1` |
| Wrong hash | Canonical source hash does not match / `blocks.1.artefact` |
| Split astral span | Annotations need exact nonempty UTF-16 boundaries / `blocks.1.artefact` |

All seven rejected previews and the repaired original's valid preview preserved **every application DB table count and zero R2 objects**. Publication committed one experiment with `learningDevelopmentCreated:false`. Reading that exact returned rendition matched the entire Activity/recipe, complete artefacts, UTF-16LE bytes, all original readings/ranges, CRLF, accent forms and recomputed hashes. Foreign owner MCP read returned `activity_unavailable` without source leakage; API read returned HTTP 404. No run/checkpoint family or learning-development rows existed. Every fixture was disposed in `finally`.

Validation: template `--validate` passed. Final `node --test tests/release-light-cross-domain.test.mjs` passed **1/1**, 0 failures, 9.114s total (8.348s test). Initial harness attempt hit `D1_ERROR: not authorized: SQLITE_AUTH` by counting reserved Cloudflare tables; excluding `_cf_`/`sqlite_` internals repaired observation without changing app/SDK. The next run passed; final harness added portable output-directory/source-ref capture and explicit R2 checks. Intentional malformed requests were repaired by restoring the original specimen before the sole publication.

Exact created paths: `tests/release-light-cross-domain.test.mjs`; this report; `.sites-runtime/discover-cross.mjs`; `.sites-runtime/cross-seed-dishes.json`; `.sites-runtime/cross-seed-evidence.json`; `.sites-runtime/cross-seed-test.tap`; existing-dependency `node_modules` symlink. The temporary `interface-trial-cross-fresh.test.mjs` filename was removed. No frontend/application source, new dependency, credentials, browser, production or saved checkpoint was used. Allowed dossier/schema reads sufficed. Catalogue names kinds/patterns but does not itself expose full per-kind payload schemas; existing schema access was necessary to author ruby.
