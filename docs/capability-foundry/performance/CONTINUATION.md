# Performance packet completed — 25 October 2026

An actual baseline production build at native6ce4556 was compared with the completed foundry production build without changing the active checkout's source/dependencies or starting a server. Native baseline tree a4d084d56d6979e26b89c13354132de9a424e991 equals verified GitHub main c40ebcc9 tree.

- Home emitted JS+CSS: +3,397 bytes raw (+0.26%), +4,392 per-file gzip estimate (+1.26%);3 extra shared JS chunks.
- No KaTeX/Three/science/font assets in Home's emitted set. Core framework bytes change by19 only. Idle heap/browser HTTP transfer/physical device performance remain unmeasured.
- Found genuine default-package risk from locally staged generated scientific assets. Parent implemented `scripts/foundry-package-policy.mjs`, called after ordinary build steps, default stripping fixed compiled runtime/controller paths; public developer assets preserved.
- Before filter: full client67,818,978 bytes, including50,260,722-byte science runtime plus5,244-byte controller.
- After filter: full client17,553,012 bytes vs baseline15,389,914 (+2,163,098); science/controller absent. Dormant KaTeX font assets1,076,572 bytes remain package-only. Home hashes unchanged.

Exact emitted/source/manifest identities, every Home dependency, baseline/current totals and limitations are in BUILD-COMPARISON.json. Original pre-remedy data preserved in BUILD-COMPARISON-BEFORE-ASSET-FILTER.json. Reproduce with compare-builds.mjs after normal builds.

Detached baseline worktree remains at `/workspace/scratch/3aa1a7b85df1/baseline-perf`, node_modules symlink points to active installed dependencies. No private files/data or deployed records were involved. Parent owns final commit/PR receipt and may remove the scratch worktree after review; the baseline can be recreated from its exact Git commit.
