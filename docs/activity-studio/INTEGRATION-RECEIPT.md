# Exact combined integration receipt

Commission [PR40](https://github.com/frekland/minamo-v2/pull/40) frozen at `8d703ddb8f9894e1c771749d8106370b68f8d04b`. Draft implementation [PR41](https://github.com/frekland/minamo-v2/pull/41), branch `staging/activity-studio-atlas-20261025`, is rooted directly in current GitHub main. No stacked research branch was merged, no main merge occurred and no Site publication was performed.

| Identity | Exact ref |
|---|---|
| GitHub main baseline | `c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c` |
| Native baseline / saved V27 source | `6ce455608150b0983a654bcf071d94a2d96792e1` |
| Baseline common source tree | `a4d084d56d6979e26b89c13354132de9a424e991` |
| Frozen PR39 runtime code | `e2da40a16328191796e1d9b97a07e7bd67293696` |
| Frozen PR39 runtime tree | `18c2cb4cffca68ce35df2c3512587fa41b86d321` |
| PR39 latest report head imported | `222973816aa20fceb0a5765591efe3f9ff1ad29f` |
| Local combined code checkpoint | `50182d80108f90979150fc96573f399c7d97d6f2` |
| GitHub combined code commit | `8e7dd6067c258c72741f66a31368c52ad6eb9458` |
| Local-only native rehearsal commit | `36f4ac6047d6e8e0ebeea79ca76a8823b6eef9b5` |
| Exact combined common source tree | `35f83453d76e71e3e7b78c2d7ecf207b35abfd5c` |

Reports appended after this code checkpoint do not change build inputs. The final draft head carries the latest report-only receipt. SOURCE-MANIFEST.json hashes tracked runtime/build/test inputs against this checkpoint; GitHub source transfer returned the exact local tree, including historical PR39 binary screenshots.

## Reconciliation performed

Started at main's exact source tree. Imported the 70 Foundry runtime/dependency/test changes without importing PR38 ancestry, then retained PR39's source evidence and activation bank with its historic labels. Reconciled current Reader/Workspace, native content admission, command/rendition hashing, owner/source projections, recovery import, typed MCP and native Worker routing. No schema table or migration was added: Activity and Attempt have distinct typed lifecycle metadata on existing experiment/Run storage. Existing old clients may edit independent metadata while preserving these fields; disabled new writes fail server-side.

Pinned additions: @xyflow/react12.12.0 and tldraw5.5.2; the exact lockfile resolves their transitive dependencies. tldraw SDK only loads from its development-only all-synthetic wrapper. Existing CodeMirror, Web Audio, KaTeX, Three, Pyodide, sql.js and Foundry registry are reused. Optional science assets are checksum-verified locally but default production packaging excludes the science controller and its17-package bundle.

## Native source/release rehearsal

Read-only Sites APIs confirmed project `appgprj_6ad8a4e85eb48191accd6e78976b47e3`, version27 and access revision1. Saved V27 identifies native baseline6ce4556, whose tree exactly matches GitHub main. The supported source helper opened that baseline using a short-lived credential held only in memory. Opening mode fetched source; it did not push, save or deploy. An initial helper attempt from an unprepared working directory failed; a second correctly rooted empty checkout succeeded.

On a local-only `rehearsal/activity-studio-20261025` native checkout branch, fetched the frozen local candidate, materialised its tree and committed36f4ac6. `git show` returned the exact combined tree35f8345. Neither this rehearsal branch nor the candidate was pushed to native source. Native remote remains baseline. The selected credential explicitly reported publish_on_push_accepted:false.

Future owner-approved release must reopen native current source, compare expected head against6ce4556 (or reconcile legitimate later edits), transfer the exact approved tree, use supported build/package/source helper and preserve source-tree identity before a Site save. A GitHub commit does not grant native deployment parity automatically.

## Verification

Normal `pnpm run typecheck` and `pnpm run build` exited0 on the frozen checkpoint. Build policy reported scienceIncluded:false. Full `pnpm test`: **951 total,950 passed,0 failed,1 existing absent-Rust-toolchain skip**,107.3s. Actual scientific Node worker tests ran after staging existing verified assets; they are not skips in this final aggregate. Raw output is in evidence/.

Compiled Worker tests use real Miniflare/D1/R2 synthetic identities: MCP discover/preview/publish/replay, ordinary product SSR, explicit supplied Attempt, fresh natural-title continuation, Atlas endpoint, foreign-owner denial and no automatic Developments. Default-off compiled routes reject developer galleries and fixture proxy with404. The 10k Atlas benchmark and exact eager-bundle measurements are separately recorded, not presented as browser timings.

No new browser screenshot or actual gesture proof exists: supported managed preview returned a URL while cloud browser repeatedly returned ERR_CONNECTION_REFUSED, including after documented profile repair. No alternate server or browser path was substituted. Browser CSP/iframe enforcement, Android, installed catalogue and hosted owner acceptance remain unverified release gates.

## Remote CI qualification

GitHub Actions run [40222590385](https://github.com/frekland/minamo-v2/actions/runs/40222590385) for the banked code completed failure approximately3seconds after creation. Its verify job121257171310 exposes no steps through the connector; log retrieval returned404BlobNotFound. The cause is unestablished, so no GitHub CI success or specific account/build diagnosis is claimed. The actual local frozen checks above passed. Inspect the provider annotation/log availability before any release; do not change billing, permissions or source without evidence.
