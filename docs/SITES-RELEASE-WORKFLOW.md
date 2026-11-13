# Fast PR → Sites releases

Use the existing Site from `.openai/hosting.json`. The former Visual Lab is now production; never create another Site or use an obsolete Lab target. Preserve audience, authentication, D1/R2/MCP bindings and learner data.

## Check only the affected contracts

The owner requested this workflow on 13 November 2026. It replaces historical blanket full-suite gates. The command prints exactly what it will run:

```sh
node scripts/release-check.mjs --plan --base <comparison-commit>
node scripts/release-check.mjs --base <comparison-commit>
```

Use an exact comparison commit from the verified current release, not `HEAD^` for a multi-commit PR. `LATEST-SITES-RELEASE.json` supplies the last published public/native application identities; check current Sites status before using it. The CLI requires committed tracked changes, so its evidence identifies the source being released. Run it in the checkout being qualified; a public copy of the script can also run with the native checkout as the working directory and a native comparison commit.

| Change | Default checks |
| --- | --- |
| Documentation | No install, build or tests |
| Tests/release tooling | Changed/mapped tests; no application rebuild |
| CSS/assets/content | One production build and affected checks |
| Typed application code | Typecheck, one production build and affected checks |
| MCP/domain writes | Current ownership, generation, recovery, CAS/retry and permission checks |
| Compiled-worker tests | Build before the selected tests |

The selector includes directly changed tests and explicit current-contract mappings. Unmapped runtime changes receive a smoke check and a visible diagnostic: inspect that coverage and add a meaningful mapping when needed. More than 40 selected suites stops for baseline/mapping review rather than silently becoming a historical audit. This is a bounded aid, not a claim of complete impact analysis.

A full historical audit is available only through an explicit `--full` request or the Actions manual `full_suite` option. Routine PRs, review-ready transitions and main pushes do not opt in. When a relevant failure may predate the PR, compare that file on the baseline and head; reuse recorded historical results instead of rerunning both complete suites. Preserve failures in the receipt; do not hide a failed safety assertion.

## One production build and publication

1. Inspect current successful Sites version/native commit and native remote HEAD. Reconcile newer changes before porting. Reuse the established baseline comparison when identities still match; hash/mode-check the reviewed changed files and preserve native-only material.
2. Install pinned dependencies with the frozen lockfile if missing or changed. Otherwise reuse the verified installation. Qualify the exact committed native source with the bounded checks above. CI is feedback; avoid a redundant local public build followed by an identical native build.
3. Keep builds and test selections sequential. The focused runner uses two workers and a bounded per-test timeout, preserves nonzero exit codes and exits after completed tests. Synthetic fixtures must still dispose resources on startup failures; the cleanup regression test verifies natural child-process exit.
4. Package once, after the build, and leave the archive unchanged until upload succeeds:

```sh
tar -czf /absolute/path/minamo-release.tar.gz .openai/hosting.json dist
```

5. Mint a short-lived source credential immediately before pushing. Never print/store tokens or put credentials in Git remotes. Check the expected native HEAD, push without force, and publish that exact SHA/archive to the existing audience using Sites. Use the combined private save/deploy operation when owner-only access is confirmed. If a version is already saved, deploy it rather than saving another copy.
6. Poll the returned deployment until terminal. Record GitHub application SHA, native SHA, version, deployment ID, relevant results and outstanding acceptance. Update the latest-release receipt. Documentation/test-only follow-ups do not require another Site version.

Use synthetic data for acceptance writes; do not alter genuine Projects as test fixtures. Where requested, the owner reinstalls MCP and runs fresh-chat/browser checks after deployment. A successful build or Sites status does not establish that those checks passed. Leave PRs unmerged unless separately authorised.

## CI behaviour

`.github/workflows/check.yml` runs focused checks for PRs and main pushes, fetches only the comparison commit when needed, caches the pnpm store, cancels superseded runs, and avoids duplicate feature-push plus PR jobs. Documentation-only plans skip dependency setup. Full history remains a manual audit option. The local release planner is the same code CI runs. Focused jobs have a 20-minute ceiling; explicit full audits have 90 minutes. A process-only end-to-end check exercised 26 assertions in about 11 seconds without a build or typecheck; runtime PRs still receive their required build and safety checks.

The older V80/Lab instructions remain in Git history as historical evidence; they are not current release requirements.
