# Independent clean-tree CI-equivalent attestation

25 October 2026. This is an independently reproduced local alternative contemplated by PR44's G03 gate. It is **not** a green GitHub Actions result, a diagnosed provider fault, browser acceptance or authority to bypass another release gate.

## Current provider evidence

GitHub PR45 report head `890152e41eb65a9c311bf202b3bbd37a57d20776` has two actual failing checks: push run `40233800046` and PR run `40233804127`. The PR job is `121290951206`. Raw provider jobs have zero steps and runner ID zero; its timing endpoint reports Ubuntu execution **0 ms**, with overall run duration 3,000 ms. No deployment approval is pending.

The commit's approved `commits/{sha}/check-runs` endpoint exposes **two annotations per failing check**, but output title/summary/text are null. The connector rejects the exact `check-runs/121290951206/annotations` endpoint as an unsupported URL before retrieving provider diagnostic content. This is not evidence that the owner lacks GitHub permission. No annotation text, billing diagnosis, account restriction or runner-failure cause is invented. No further unsupported rerun or account/billing/permission change was performed.

There is independent historical provider success: run `40219549276`, at `2026-10-25T18:05:05Z`, commit `e2f2bad6b7b97f1c7d577be49dda505c4b9d2bef`, job `121247917609`. Its actual provider steps successfully completed checkout, Node setup, pnpm installation, frozen dependency installation, typecheck, build and tests. Its `.github/workflows/check.yml` Git blob is `1216893981f6b8ddb7617e8a3cd46fc5f678c56c`, **identical to the current workflow blob**. This corroborates an unchanged working workflow recipe and a current failure before application execution; it does not establish the precise new startup cause.

Exact provider metadata is retained in `CI-PROVIDER-EVIDENCE.json`, including annotation URL rejection and historical step conclusions.

## Clean reproduction

A new isolated checkout, `continuation-ci-attestation`, was cloned from the local object database. GitHub's Git-data API independently confirms that remote commit `890152e41eb65a9c311bf202b3bbd37a57d20776` owns tree `fb4bd3f64cfc5e34d879613c45380f6b3945f4e8`. The clean local commit `7fbb119faea56f35a58ccf68ffb9bce8e8b01af4` has exactly that same full tree. Commit identities differ; exact tree identity is verified.

All **628 non-document source/build/test inputs** matched the frozen input manifest before and after validation, with zero mismatches. Input digest: `b20a951c783d52df7743d9a0ff6d5bc17cf3948de5f52fdd7ee249479d8c25ae`. After validation the checkout remains clean and its tree remains unchanged. No source was patched to obtain these results.

Dependencies were freshly installed through the supported Sites installer into a new actual `node_modules` directory, not borrowed through a symlink from the earlier candidate. The existing exact pnpm pin is **11.25.0**, Node is **v24.22.1** (the workflow specifies Node major 24). The supported repository installer uses `--frozen-lockfile`, allows required install scripts and prefers the cache; it reused 623 packages and downloaded 218. No dependency inputs or lockfile were changed.

| Phase | Actual result |
| --- | --- |
| Supported clean dependency installation | Exit 0; dependency setup passed |
| `pnpm run typecheck` | Exit 0 |
| `pnpm run build` | Exit 0; ordinary production build, `scienceIncluded:false` |
| `pnpm test` | Exit 0; **1,020 total, 1,016 passed, zero failed, four explicit skips**; 230,834 ms |
| Post-suite optional distribution check | Public controller absent; distribution controller absent; science distribution absent |
| Post-suite source verification | Clean checkout; unchanged full tree; all 628 source hashes match |

The full suite retains the repository's two-file concurrency bound. The four skips are three optional unstaged scientific execution cases and one absent Rust/Cargo compiler case. They are not counted as execution. The suite uses synthetic local Miniflare D1/R2 fixtures; no genuine owner records, production Site/source, access settings, credentials or paid services were changed.

Compressed raw install/typecheck/build/full-suite logs, their uncompressed hashes and exact summary are in `CI-ATTESTATION.json` and `evidence/ci-independent-*.log.gz`. This fresh full-suite count overlaps earlier candidate evidence and must not be added to it as a unique combined test count.

## Scoped recommendation

The current candidate has independently reproduced technical command coverage equivalent to the workflow's install/typecheck/build/test stages, pinned to the exact remote source tree and lockfile. An independent release reviewer can therefore assess this explicit alternative under PR44 G03, preserving the residual fact that **GitHub-hosted execution remains failed and its startup annotations remain unread**. Branch protection/check conclusions have not been changed, and no local result is described as remote CI.

The remaining provider diagnostic action is precisely to inspect the two annotations on [the actual failing job](https://github.com/frekland/minamo-v2/actions/runs/40233804127/job/121290951206) through a supported authenticated interface or a connector that exposes check-run annotations. Any account/billing/provider action must follow that actual diagnostic, not speculation. This diagnostic limitation is separate from browser, native Site identity/authentication, source synchronization, private deployment and fresh installed MCP acceptance; their gates must still pass independently.
