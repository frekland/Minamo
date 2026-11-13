# PR #9 regression triage and release checks

V177 is deployed. The comparison found one application regression: a cached GPT Note write with missing/old generation received `gpt_note_authoring_forbidden` before the required `generation_conflict`. V177 restores generation admission first while denying current-generation GPT Note writes before classification, receipt replay or mutation. All 16 affected recovery/MCP/preference checks passed.

## Results and scope

| Qualification | Tests | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: | ---: |
| V175 baseline with explicit reruns below | 1,732 | 1,488 | 240 | 4 |
| V176 candidate with explicit reruns/current-contract test below | 1,741 | 1,498 | 239 | 4 |
| V177 affected recovery/Note/preference selection | 16 | 16 | 0 | 0 |
| Current semantic-content file | 9 | 9 | 0 | 0 |
| Fixture startup/exit regression | 1 | 1 | 0 | 0 |

These are qualified comparison counts, not a claim that an unmodified historical full suite is green. The raw full runs were V175: 1,718 tests, 1,475 passed, 239 failed, 4 skipped; V176: 1,741 tests, 1,496 passed, 241 failed, 4 skipped. Neither raw run had cancelled tests. The V177 ordering fix was verified with affected checks rather than another full audit.

After excluding the fixed recovery case and its failed parent group, **237 remaining failed results (including parent groups) reproduce V175 failing test names**. Individual failure messages were compared as well. One old Project-context assertion changes from its earlier failed checkpoint expectation to an undefined-record error because it expects GPT Note creation; that operation is now intentionally forbidden. The current MCP Note-denial checks and owner-written semantic-content checks pass. Other remaining names/messages reproduce their baseline failures. They cover retired Activity/checkpoint authoring and older continuity, catalogue and UI contracts; they are not all repaired by this Project release.

Three baseline results now pass: two Project overview/reader expectations and the updated typed-terminal/Note-ownership test. They are listed alongside every remaining named result in [the comparison evidence](PR9-REGRESSION-COMPARISON.json). No genuinely new failing application case remains unexplained.

## Explicit reruns and test repairs

- An interrupted preliminary build left incomplete V175 compiled assets. After a completed V175 build, the eight compiled-worker suites were rerun: 38 tests, 30 passed and 8 baseline failures. Their complete results replace the incomplete-build results, which had skipped nested tests through startup failure.
- The V175 10,000-record Atlas case initially failed with `fetch failed`. Its isolated file rerun passed that case; the two unrelated retired-checkpoint results in the same file remain failed. This is an environment qualification, not an Atlas product fix.
- A V176 scenario fixture startup failed under competing build load and retained its local runtime after all case results. The idle failed worker was terminated; the scenario was rerun in isolation. All three scenario errors exactly match V175's `legacy_authoring_retired` messages. Fixture setup now disposes Miniflare if startup/migration fails before returning a disposer. A child-process test proves that failed startup exits naturally (no forced child exit), and passes.
- The semantic-content fixture still expected GPT to publish a Note. It now asserts denial/no saved Note, creates the semantic Note through the learner website command, and verifies eligible read-only MCP access. Its full nine-test file passes, retaining source/ruby/math, private outputs, CAS, recovery, revocation and owner-isolation coverage.

The comparison matches file/test identity, normalises checkout paths, and compares the first error line and scalar assertion evidence; named parent results are retained, not counted as independent defects. Complete test names and the intentional Note-policy exception are recorded in the JSON. Only synthetic local D1/R2 fixtures were used; no genuine learner records or private correspondence are included.

## Reproduction and future releases

The one-time audit used `pnpm test` on the V175 public baseline `1fdfb8b` and the unchanged V176 checkout `9107bbd`. For the compiled qualification, rerun `activity-product-worker`, `activity-security-compiled`, `beta-compiled-worker`, `built-worker`, `foundry-packaging`, `interface-lab-production`, `worker-domain-routes` and `product-worker` test files after a completed build. Other isolated qualifications are `atlas-domain.test.mjs`, `mood-to-music-docs-variant.test.mjs`, `semantic-content.test.mjs` and `private-storage-fixture-cleanup.test.mjs`. The V177 fix selection is `domain-recovery.test.mjs`, `project-learning-mcp.test.mjs` and `collaboration-preferences.test.mjs`.

Routine releases now use [the bounded release workflow](SITES-RELEASE-WORKFLOW.md), not these two full historical runs. The selector includes recovery admission for shared writer changes, so this regression is caught in the normal path. The historical suite is an explicit manual audit; relevant safety failures still block release.

All 566 shared application/configuration files match the deployed native source in content and Git mode. Public-only follow-ups are release tooling, test qualification and receipts; V177 application source is unchanged. Fresh-chat MCP and browser acceptance remain owner-run checks against the deployed release. PR #9 remains draft and unmerged.
