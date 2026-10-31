# Sites V81: direct public-source to native Git publication

**Verified 31 October 2026.** This was a documentation-only source-promotion smoke release to retire the intermediate private GitHub implementation/promotion workflow. It was not an application feature release or a claim of whole-tree parity.

## Source and evidence

| Boundary | Exact evidence |
| --- | --- |
| Public candidate | `frekland/Minamo` PR [#37](https://github.com/frekland/Minamo/pull/37), head `2e23d3e25568eb9b0cb99a51e5305c00d27fb3d4` |
| Public integration | Squash-merged into `main` as `9450e3ad779ab27a407378e68a96f854d3de1585` |
| Public checks | [Actions run 41179867866](https://github.com/frekland/Minamo/actions/runs/41179867866): full source checks and browser fixture acceptance **success** |
| Previous native source | Sites V80, `e7a7c111490bbf1b56da3473ca6ca62a8fe99a03` |
| Native release source | `8159685e18147da90674ae815b7a4d5ad4bd03a3`, fast-forward on the same native main branch |
| Selected file manifest | Only `docs/SITES-RELEASE-WORKFLOW.md` was added; exact SHA-256 on both public and native copies: `88f7cf865f84019cfe1426872e6fa2476656cff83c4027e0e3594ba741a110ba` |
| Native verification | `pnpm install --frozen-lockfile` lockfile/supply-chain check succeeded; `pnpm run typecheck` and `pnpm run build` succeeded; `pnpm test`: **1,469 passed, 4 skipped, 0 failed** |
| Sites publication | Version **V81**, successful on the existing Site using the saved-version deployment operation; no application source file changed from V80 |
| Post-release checks | Source/version readback matched native commit; MCP scenario-catalogue read succeeded; existing custom access list retained **2 allowed-user entries**, access policy revision **1**, runtime environment revision **9**, MCP available |

## Observed release-path lessons

1. A source comparison identified explicit V80 native-only differences in host/origin defaults, private branding, preview material and recovery-export code still associated with draft public PR #9. A full-tree replacement would have risked silently removing real current Site behaviour. Those differences were preserved; no source port beyond the documentation file occurred.
2. The first local archive was rejected before publication because its Worker entrypoint was packaged under `server/` instead of the expected root `dist/server/` path. The corrected archive included `.openai/hosting.json`, `dist/server/index.js` and the rest of the built assets.
3. The owner-only deploy helper refused the existing Site's **custom invitation policy**. It had nevertheless saved V81, so the already-saved exact version was published with the documented standard deployment helper. The audience was not broadened or altered.
4. The first failed package and owner-only publication attempts did not publish a new version. Only the subsequent standard V81 deployment succeeded. V80 remains a known saved rollback version.

No fixture advance/reset, transcript sealing, database migration, learning-record write, runtime environment update, media migration or external Cloudflare deployment was performed. This evidence establishes the **direct GitHub-to-native-Sites promotion mechanism**, not complete compatibility of every future code change, browser UX acceptance or a general automatic-deploy pipeline.

The former private GitHub repository is retained for historical/private material and marked as superseded for active implementation. Future shared changes and release receipts belong in this public repo, using [the direct Sites release procedure](../SITES-RELEASE-WORKFLOW.md).
