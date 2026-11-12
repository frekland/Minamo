# Deployed Minamo source baseline — Sites V174

This is source reconciliation only. No deployment, live data operation, database migration, access change or automatic merge is part of this work.

## Authority and provenance

- Site: https://minamo.jscymru.chatgpt.site/
- Successfully deployed version: **174**.
- Exact native Git revision: `79f1617fd466b07c79fcf475ec6e272eff648c5a`.
- Saved version: `appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_3af122979cc48191aa1358e8dd39e8cd`.
- Successful deployment: `appgdep_6af6007382348191a0125ae3e0fff0c8`.
- Source was obtained from the actual Sites Git repository, freshly fetched and checked out at the revision returned by Sites. The remote head matched that revision. It was not reconstructed from GitHub or extracted from the compiled deployment archive.
- GitHub integration branch: `integration/sites-v174-source`, targeting `main`. The PR records the final GitHub commit SHA; a document cannot contain the SHA of the commit that contains itself.

The complete source tree includes the V165/PR #99-era application baseline and its later deployed Project presentation/global-MCP editing and Library import/export functionality. The native implementation, not an older PR narrative, determines what this snapshot includes. No claim is made that every proposal in legacy PR #99 has been implemented.

## Reconciliation with GitHub history

The integration branch starts at public `main` and retains merge ancestry for:

| Open work | Reconciliation |
| --- | --- |
| PR #1, `feature/portable-content-foundation` | Already an ancestor of the Library branch; history and documentation retained |
| PR #3, `feature/library-zip-import-20261112` | Merged without rewriting history; implementation then compared with native V174 |
| PR #4, `docs/making-friends-organisation-review` | Merged; browser report remains independent evidence, not a new inspection |
| PR #5, `feature/project-presentation-global-edit` | Merged; deployed code matches native V174; later GitHub release documentation retained |

All remote feature branches visible at reconciliation were examined. No branch was deleted, force-pushed, merged into `main` or automatically closed.

Five branch-only files were not in the deployed application: `lib/portable-content-codec.ts`, the legacy snippet generator and generated snippet, and their two tests. Their removal from this integration snapshot deliberately avoids presenting undeployed utilities as deployed source. They remain in the merged feature history and original branches. The native package scripts/dependency ordering were restored, including removal of the undeployed `backup:snippet` command. Four native executable script modes are also restored. These decisions are enumerated in the manifest.

## Completeness and exclusions

`SITES-V174-SOURCE-MANIFEST.json` enumerates **every one of the 1,714 native tracked files**, recording native SHA-256, size, Git mode and its disposition:

- **1,621 files** are transferred byte-for-byte with their native Git modes.
- **92 generated evidence files** (screenshots, logs and compressed test-result archives) are excluded. Their paths and hashes are recorded, but their contents are not published by this reconciliation. They are not required application/build inputs.
- **One documentation override** retains the GitHub release receipt appended after the native source commit: `docs/PROJECT-PRESENTATION-GLOBAL-EDIT.md`. It is explicitly not byte-identical to the shorter native document.
- Four GitHub-only historical/review documents are preserved. The reconciliation document, manifest and verification script are additional engineering files, not deployed runtime source.

There are no unexplained application, server, MCP, dependency, configuration, migration or test discrepancies. All such files are covered by the exact native hash/mode comparison. The snapshot also retains the native vendored browser runtime dependencies (including Piper WASM/data files) already tracked in GitHub; these are required distributable assets, not generated application build outputs. Build-generated Pyodide/SQL.js assets, `dist`, dependency directories, local environment files, session state, private records and backup contents are not committed. Hosting identity and binding **names** remain source configuration; runtime values and secrets are not exported.

A high-confidence credential-pattern scan found only deliberate synthetic secret-rejection fixtures in existing activity tests. No credential values, private workspace exports or new browser screenshots were included. This bounded scan is not a claim to certify all historical repository content.

Run the committed completeness check from the checkout:

```sh
node scripts/verify-sites-source-snapshot.mjs
```

It checks every included native file's SHA-256 and indexed Git mode, rejects tracked excluded artefacts, and rejects undeclared supplemental files. The manifest's native revision is the source authority; GitHub-only documentation is explicitly declared rather than silently counted as deployed source.

## Build and test verification

The exact native `package.json` and `pnpm-lock.yaml` are included. `corepack pnpm install --frozen-lockfile --ignore-scripts` succeeded using pnpm 11.25.0, including fflate 0.8.3; lockfile resolution and supply-chain checks passed. Installation used the execution environment's existing package cache/dependencies; it was not a disconnected clean-room install.

Final verification passed: `pnpm typecheck`, `pnpm build`, and all **56 selected automated tests** (zero failures/skips). The committed completeness verifier passed with **1,621 exact files, 92 exclusions, one documentation override and zero discrepancies**. The final Sites version recheck still returned V174 at the same native revision. Native Git tree: `3a5bc2d8e5eaf853791f6c03258269af7fa5d3d2`. The PR records the exact GitHub commit SHA. Selected coverage includes Library backup/import, cyclic/partial recovery, native API and generation handling, archive security, foreground identity fences, global MCP Project editing, ownership/CAS/receipts, reading destinations, Japanese reading aids, Project history and collaboration preferences.

The broad historical suite was not rerun. PR #3 previously reported 1,472 passes / 242 failures / 4 skipped; those are inherited historical results, not results of this reconciliation. Any failure in the selected current checks must be reported separately rather than attributed to that old run. Browser, audio, mobile and refreshed-plugin authoring acceptance are outside this source-transfer task.

Generated verification logs and deployment build output remain local. No build artefacts are included in GitHub.
