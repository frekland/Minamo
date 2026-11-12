# Production dependency graph and package comparison

The dormant foundry adds a small emitted Home dependency cost, and does **not** put KaTeX, Three, scientific wheels or their fonts into Home's initial dependency set. A separate build-package risk was found: locally staged scientific files in `public/runtime/foundry-python` were copied by the ordinary build even with the gallery's production route unavailable. The parent programme applied a default-off compiled-asset filter; before/after measurements are retained separately.

## Compared source and method

- Baseline native commit `6ce455608150b0983a654bcf071d94a2d96792e1`, exact tree `a4d084d56d6979e26b89c13354132de9a424e991`, matching GitHub main `c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c`.
- Baseline built successfully in detached worktree `/workspace/scratch/3aa1a7b85df1/baseline-perf`, with shared installed `node_modules` and the same managed-linux build profile. No dependency installation, branch switch or source mutation occurred in the active foundry checkout.
- Current parent production build completed before comparison. `BUILD-COMPARISON*.json` records actual source hashes and emitted manifest hash; this is more precise than assuming a later documentation commit is the identical compiled tree.
- `dist/server/__vite_rsc_assets_manifest.js` declares the actual Workspace client-reference JS/CSS dependencies. We combine those with the root layout's emitted CSS. We also inspect the Vite static-import closure; dynamic imports are explicitly excluded from the initial set.
- File bytes are real emitted production bytes. Per-file `gzipSync` sizes are reproducible compression estimates; they are not observed HTTP transfer, Brotli, cache, heap, time-to-interactive or physical-device measurements.

The baseline uses the same installed dependency tree as the current build. Existing packages are therefore compared under one toolchain; this is not a claim to have freshly reconstructed the historical production installation in its own package store.

## Home emitted dependency set

| Measure | Baseline | Foundry build | Change |
|---|---:|---:|---:|
| JavaScript bytes | 977,808 | 981,204 | +3,396 (+0.35%) |
| JavaScript gzip estimate | 294,316 | 297,687 | +3,371 (+1.15%) |
| CSS bytes, including root layout | 315,326 | 315,327 | +1 |
| CSS gzip estimate | 54,019 | 55,040 | +1,021 |
| Combined JS/CSS bytes | 1,293,134 | 1,296,531 | +3,397 (+0.26%) |
| Combined per-file gzip estimate | 348,335 | 352,727 | +4,392 (+1.26%) |
| Emitted JS file count | 26 | 29 | +3 |

Source/code-sharing changes account for the extra files: Reader and NoteMarkdownView become shared chunks because the developer lab also exercises them. Reader CSS separates from Workspace CSS, so independent gzip compression is slightly less efficient even though combined raw CSS differs by one byte. Framework chunk size changes by only 19 bytes (190,152 → 190,171); no large renderer library was merged into it. Browser entry grows by 1,559 bytes, including its dormant route/reference dependency map.

No emitted Home dependency filename contains foundry, KaTeX, visual-three or math-render. Additional content sentinels `KaTeX_Main`, `WebGLRenderer`, `GLTFLoader`, the pinned SciPy/Matplotlib wheel names and `foundry-python-isolate` are absent from the whole Home JS/CSS set. The JS entry can contain a **reference** to the lazily loaded gallery; that string is distinct from downloading/evaluating the gallery or its dependencies.

The compiled production foundry route calls `notFound()` unconditionally before returning its gallery. The gallery remains a build-generated dynamic client reference due to the framework's client-component discovery. Its CSS/font declarations belong to that client reference, not Workspace or the root layout. This analysis finds no service worker/precache code in app/public/lib/scripts that would automatically fetch all emitted assets.

The +3 asset requests and small compression delta may still affect cold mobile startup; no browser network-timing or heap claim is made. They are a measured bounded change, not literally zero idle cost.

## Package-only assets and remedy

Before the filter, the full `dist/client` grew from 15,389,914 to 67,818,978 bytes (+52,429,064). Of that, 23 locally staged scientific runtime assets contributed 50,260,722 bytes, and 60 KaTeX font format files contributed 1,076,572 bytes. The scientific controller added another 5,244 bytes. These values describe the package, not Home's initial load.

The science staging directory is generated/ignored and not recreated by a normal clean checkout build. Nevertheless, relying on absence is unsafe: a developer who ran the foundry scientific proof could otherwise accidentally package its dormant assets later. The implemented parent remedy is an explicit post-build filter for the two fixed **compiled** locations:

- `dist/client/runtime/foundry-python/`
- `dist/client/foundry-python-isolate.js`

Default behavior removes them after a successful production build, without touching `public` developer assets. Deliberate `MINAMO_FOUNDRY_PACKAGE_SCIENCE=1` can retain already staged, validated assets for a future approved activation. It does not download or stage missing wheels. This policy separates dev proof assets from ordinary production packaging.


After applying `scripts/foundry-package-policy.mjs` with its default settings, the actual output is:

| Full client package | Baseline | Before filter | After default filter |
|---|---:|---:|---:|
| All file bytes | 15,389,914 | 67,818,978 | 17,553,012 |
| Scientific runtime bytes | 0 | 50,260,722 | 0 |
| Scientific controller bytes | 0 | 5,244 | 0 |
| Font bytes | 0 | 1,076,572 | 1,076,572 |

The fixed-path filter removes **50,265,966 bytes** from this locally staged build. The remaining package increase is **2,163,098 bytes (+14.06%)**, comprising dormant renderer/lab assets and associated build metadata; no claim of zero total deployment cost is made. Home's dependency-set hashes and the initial-load figures above are unchanged by the filter.

`BUILD-COMPARISON-BEFORE-ASSET-FILTER.json` preserves the pre-remedy output. `BUILD-COMPARISON.json` describes the default filtered output and includes the source hashes for the build integration and package policy. Source dev assets remain available and are not deleted.

KaTeX fonts remain emitted package assets for the dormant lab client reference. No font is declared in Home's CSS graph. A later release can omit all lab compilation through framework build configuration if deployment package minimization warrants that engineering; no source/runtime gate is weakened to force a smaller number here.

## Reproduce

Build both checkouts with the normal `node scripts/build-app.mjs` command, keeping the active checkout and dependencies stable while comparing. Then run from the foundry checkout:

```sh
node docs/capability-foundry/performance/compare-builds.mjs \
  /workspace/scratch/3aa1a7b85df1/baseline-perf \
  /workspace/scratch/3aa1a7b85df1/minamo-v2/minamo-v2 \
  docs/capability-foundry/performance/BUILD-COMPARISON.json
```

The comparison script only reads build outputs and writes its requested JSON report. It starts no preview/server and changes no source or dependencies. JSON includes every measured Home dependency, byte/gzip/hash, manifest/source identities, static/dynamic closure separation and total package categories.

No production source push, Site save/deploy, owner authentication, learner data or permission changes occurred. Browser/GPU/physical-device evidence remains in the programme browser acceptance report rather than being inferred from these files.
