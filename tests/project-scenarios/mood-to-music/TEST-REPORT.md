# Issue #112 — first fixture foundation, local evidence

**Date:** 29 October 2026. **Track:** SITES source only. **Data:** local fictional principal, disposable Miniflare D1/R2. **Deployment:** none.

## Scope and provenance

- Reused the existing `tests/private-storage-fixture.mjs`, `tests/journey-resume-fixture.mjs`, PR30 synthetic Mood-to-Music history/race example and canonical Project/learning-context contracts. No new domain model, D1 migration or production data write.
- The owner's private source inventory from #112 was used only as a design boundary. Real owner Steps, Notes, checkpoints and Library material were **not copied** into this fixture or PR.
- Five pinned React source versions are synthetic engineering artefacts, not five owner commits; scenario dialogue and learning activity are labelled fictional. No external Spotify access is claimed.

## Tests actually executed in the limited local source reconstruction

Environment: Linux, Node 24.22.1, pnpm 11.25.0, locked repository dependencies installed. The standard HTTPS Git clone was unavailable due to missing local credentials; relevant canonical source files were fetched through the connected GitHub API for this isolated local test workspace.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| `node --test examples/mood-to-music/tests/revisions.test.mjs` | **PASS, 3/3** | Fictional-track selection and immutable feedback; deliberately reproduced stale-response defect v3; guarded success, empty, error and stale-rejection behaviour v4 |
| `node --test --test-force-exit tests/mood-to-music-scenario.test.mjs` | **PASS, 3/3** | Pinned SHA-256 source verification; five chronological states through the real compiled domain handler and isolated D1/R2; exact checkpoint/old Note revision, Questions/Resource relationships, annotation/Flag, unrelated-record exclusion, CAS, tenant isolation, MCP read, fresh reconstruction and reset |
| `pnpm exec vite build --config examples/mood-to-music/vite.config.mjs` | **PASS** | 22 transformed modules, static production output generated in the uncommitted local `examples/mood-to-music/dist` |
| `node --test examples/mood-to-music/tests/browser.test.mjs` | **BLOCKED** | Playwright Chromium binary absent; attempted browser install, but download returned a truncated/non-zip archive. Browser assertions are versioned and ready to run in an environment with Chromium |
| Full repository `pnpm run typecheck`, `pnpm test`, `pnpm run build` | **NOT RUN** | Local source reconstruction is deliberately partial (the affected backend plus renderer dependencies); these commands require a full authenticated checkout. No CI/hosted result is claimed |

The confirmed production bundle build does not substitute for a visual Chromium/mobile test. The tests run in this workspace prove local commands and storage behaviour only, not live Sites hosting, a genuine independent GPT conversation, or owner usefulness.

## Reproduction and next bounded checks

Read `README.md` and `manifest.json`, install the root lockfile, run the replay and standalone build commands, then run Chromium interactions once a test browser is available. The `reset` command and test compare independently reconstructed logical readbacks. A later independent agent should verify Project/Question/code evidence navigation through MCP and browser at states A, D and E.

Before the later **live UI** slice, perform the documented protected owner-data/Library recovery and native source-identity preflight, then use an isolated test-only Project or clone for hosted fixture experiments. No Site release, genuine owner-record mutation, GitHub PR merge, Cloudflare external change or selection of further Project subjects is part of this increment.

## Public-source port and extensions (29 October 2026)

The tests listed above were reported by the author of private PR #113, not independently rerun for this public-source extension at the time of authoring. This port adds a real Project shape mutation at state E, source SHA pointers in Notes, and manifest-authored scenario dates in inspect results. Review the corresponding public GitHub Actions run for new evidence; do not infer success from the original report.
