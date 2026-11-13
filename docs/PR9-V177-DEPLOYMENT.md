# PR #9 — V177 deployment

Published to https://minamo.jscymru.chatgpt.site on 13 November 2026. Sites reports `succeeded`, MCP enabled, and environment revision 5. The owner-only audience, bindings and genuine learner data were preserved.

- GitHub application fix: `2f0a1f8`, following V176 implementation `ca191e3`.
- Native source: `399ca17891bdbc675e1acb9ab3b1571bba8d9d6c`.
- Version: **177**, `appgprj_6aeba0aa528c81918be19dd51427b2cb~appgver_cbf1c18f997c819190dc132df7a40f4d`.
- Deployment: `appgdep_6af6dfeb5ef881918136f78f24188dee`.
- Archive: 528 files, 112,619,520 uncompressed bytes, SHA-256 `2cd2cee06fd32bff865638ffab5a5739bee36b318f8052423ddc975b0caf6e66`.

V177 includes all [V176 Project reader and MCP changes](PR9-V176-DEPLOYMENT.md). The comparison against V175 identified a regression in command admission: a stale/missing-generation GPT Note request received `gpt_note_authoring_forbidden` instead of the established `generation_conflict` response. Namespace admission now runs first; Note denial still runs before classification, receipt replay or any mutation. Current-generation GPT Note authoring remains forbidden.

Native typecheck and production build passed. All **16** recovery, Project-learning MCP and collaboration-preference checks passed, including the previously failing recovery/rollback case and the current-generation Note-denial cases. The earlier V176 release passed 36 focused checks. Tool schemas are unchanged from V176.

The completed [regression comparison](PR9-REGRESSION-TRIAGE.md) identifies the generation-admission regression fixed here, qualifies the current Note-authoring tests, and lists 237 remaining baseline failing results. The historical full suite remains red; no full V177 rerun is claimed. Routine future checks use the bounded release workflow instead of repeating both historical suites.

The owner will perform fresh MCP and browser acceptance against the deployed release. Neither is claimed as completed here. PR #9 remains draft and unmerged.
