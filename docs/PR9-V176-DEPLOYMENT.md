# PR #9 — V176 deployment

Published to https://minamo.jscymru.chatgpt.site on 13 November 2026. Sites reports `succeeded`, MCP enabled, and environment revision 5.

- GitHub implementation: `ca191e3` (PR #9, based on `26930c79580bff598deb86aa7925a1561ebfce72`).
- Native source: `cbeb72b02efaa914f9c17977e15fec1046a5e8a5`.
- Version: **176**, `appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_00f82d829fdc8191aa96fd99ed40ca87`.
- Deployment: `appgdep_6af6d5aa0b208191874ef4d10df80ecc`.
- Archive: 528 files, 112,619,520 uncompressed bytes, SHA-256 `74eca500165af1d00fbfd3e2a73de0bffb6516ed42e3b38e1411a887c7bec1e4`.

All 29 reviewed PR paths match the native transfer byte for byte. Native-only files were retained, and the source push was gated on the existing V175 native HEAD. The V175 reconciliation verifier passed with zero discrepancies. Dependencies and the lockfile are unchanged from V175; the existing installed dependency tree was reused.

The release adds the Project context reader, exact relationships, bounded MCP retrieval, targeted authoring and learner-owned Note enforcement described in the PR. Additional refinements reuse the shared topic projection instead of calculating it twice, explain an empty purpose index, and show readable, wrapping reference labels instead of internal record IDs.

## Verification

Native typecheck and production build passed. All **36** tests in the focused Project map/MCP/structure/topic, collaboration-preference, Project UI and retired-checkpoint selection passed. An earlier run under excessive parallel load timed out; that result was superseded by the successful rerun.

The broader V175/head suite comparison is in progress. Earlier concurrent comparison runs were interrupted because competing builds and suites caused resource contention; they are not acceptance evidence. Broad-suite results must be classified before declaring regression triage complete.

No live MCP or browser acceptance is claimed. The owner will reinstall MCP and perform those checks against V176. PR #9 remains draft and unmerged. Deployment preserved the existing owner-only audience and bindings; no genuine learner Project or Note was edited as part of this release.
