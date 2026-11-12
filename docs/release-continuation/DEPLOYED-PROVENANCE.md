# Independent deployed source and package provenance

This read-only audit independently checked GitHub merge metadata, native Git/source inputs, the final local package, saved Site version and deployment/access metadata. It did not operate the browser, read environment-variable values, run builds/tests, mutate production or declare the still-ongoing workflow acceptance/cleanup complete.

## Verified source chain

| Layer | Exact identity |
| --- | --- |
| Final independently tested runtime | GitHub `6252b6535c448888a1a16d517a0590b5456395b4`, tree `b6ac05c1cfde049dc74d645a737f5950b1fd6cc1` |
| Actual PR45 merge | GitHub main `791881e90614c4822587b13bf76c973cd2913641`, tree `1ec130ba723576c803d91732b50ddc6638fd173f` |
| Actual pushed native source | `0e961cab2e5d27b45d486f5cebc49679dc26a9a6`, same tree `1ec130ba723576c803d91732b50ddc6638fd173f` |
| Saved production version | **V28**, source commit `0e961cab2e5d27b45d486f5cebc49679dc26a9a6` |

The GitHub connector confirms PR45 is merged and closed with the exact merge commit above. Native checkout status is clean. Comparing the tested tree to the merged/native tree yields documentation changes only. All **663 runtime/build/test inputs** still match digest `3c7f7c01e087b6608458dbb70a8a23a500fb0c15790f075ae24f92cbbe714feb`, with zero mismatches. Source and packaged hosting manifests retain the intended project ID, D1 binding `DB`, R2 binding `BUCKET` and MCP capability.

## Local archive and saved-version qualification

The official local package `/workspace/scratch/10fcadaf9a6c/minamo-release-pr45.tar.gz` is **10,452,347 bytes**, SHA-256 `3c4813c06b1d703dab620ec47a3ef0f9d75eeae9aaaa7e7d0bdcc67d800d4cfe`. It contains **459 entries: 433 regular files and 26 directories**. Every one of those 433 file payloads independently matches the corresponding final native build file byte-for-byte. There are no absolute/traversal/symlink/hardlink entries and no optional science controller or scientific package distribution.

The saved version's archive metadata reports a separately stored **tar** container: 25,446,400 bytes, SHA-256 `9f3b754c418758720ce3b6a31fb3e9613c46ae1384fb808972d1c0accffbbc52`, 433 files. The local gzip and its decompressed tar have different container hashes/sizes. The exact storage transformation was not independently established. These values are deliberately recorded separately: **this audit does not assert all 433 deployed file bytes equal the local package**. The native API accepted the supplied package and associates V28 with the exact pushed source commit. No source or local package payload mismatch was found.

The supplied final same-package compiled-guard log independently parses as **17 tests passed, zero failed, zero skipped**, 5,819 ms. Its raw output and digest are retained in `evidence/deployed-package-compiled-guards.log.gz` and the JSON. This auditor inspected the log and did not rerun the tests.

## Actual private deployment and identity

Both native deployment-status reads independently report success for the **same saved V28**:

| Deployment | Environment revision | Result |
| --- | --- | --- |
| `appgdep_6ade82e5ccb08191b4530744511f6308` | **2** | Succeeded |
| `appgdep_6ade8325be8c8191803fb820f97a9c4b` | **3** | Succeeded; saved version's latest deployment |

The current Minamo project remains `appgprj_6ad8a4e85eb48191accd6e78976b47e3`, live at [https://minamo.jscymru.chatgpt.site](https://minamo.jscymru.chatgpt.site). The control plane reports V28, owner role, custom owner-only access revision **1**, one allowed account, no allowed editors/groups and **zero external visitors**. Its MCP endpoint is `https://minamo.jscymru.chatgpt.site/mcp`; endpoint metadata does not by itself prove a freshly installed client catalogue.

The distinct Legacy project remains `appgprj_6acfb08219e48191895dd6171f289ecb`, slug `minamo-legacy`, **V62 / access revision 1 / zero external visitors**. Only a read was performed on Legacy during this audit.

Deployment metadata proves environment revisions 2 and 3 without reading their variable values. The two core-feature flag changes and unchanged licence value are release-owner-reported configuration actions. No `TLDRAW_LICENSE_KEY` value was requested, printed or stored by this audit.

GitHub-hosted CI is not reclassified as green. The owner-accepted independent G03 alternative, actual private workflow acceptance, fresh MCP continuity, genuine-corpus comparison and synthetic cleanup are tracked in their own receipts. Cleanup and overall post-deployment acceptance were still ongoing when this provenance audit completed.

Machine-readable identities, selected control-plane responses, all 433 local file hashes, documentation-only delta paths and precise qualifications are in `DEPLOYED-PROVENANCE.json`.
