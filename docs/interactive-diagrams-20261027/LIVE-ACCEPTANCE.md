# Live V42 acceptance and accessibility follow-up

This records the initial acceptance stage. See ROUTING-CORRECTION.md for the subsequent owner-reported connector correction and newly authored diagram trial.

PR65 merged as `2016db77245f9d1b4b5b54620154ad3c1fa7ec73`. Native source `5dc52481749873ce284662d6f40a1609bbc2f5a9` and merged GitHub share tree `f2e76c95240c2dcca0527b2cc45aafb13dd6e69e`.

Saved V42: `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_c8a94ce3eba48191be634a43d227b09f`.
Deployment: `appgdep_6ae02eaf74d48191ab4d8622e74b7142`, native status succeeded, MCP enabled, existing environment revision 5. Existing owner-only access is preserved. URL: https://minamo.jscymru.chatgpt.site

Final full regression on the feature implementation: 1,264 tests, 1,260 passed, zero failures, four existing skips (281,239 ms). Typecheck and complete supported production build passed. No remote CI success is claimed.

## Installed MCP and permanent article

The actual installed MCP preview returned valid with no warnings for static, explore and guided source. Publication `diagram-system-20261027-live-trial-v1` committed exactly one explicitly synthetic article. Exact canonical readback retained all three diagrams and all eight guided steps. Immutable manuscript readback matched the original Markdown exactly. The published synthetic article's three renderers and keyboard exploration also worked in the authenticated production browser.

Permanent command `netcat-interactive-diagram-20261027-permanent-v1` changed only section `s2`, part `p3` of article `ms-fb0e058af34ae2f0c40a9665e5334946ada49d48`, from revision 1 to revision 2.

- Previous rendition: `r-ec8996418a7ce4bc3950932c0e457ae739a33b98528f022195abc0eb506afc48`.
- New rendition: `r-67e1cb482dafa7a639e22c52a69d917db74381ff925514aa0d311d9ca338de0f`.
- Readback exactly matched the authored interactive model, including exact related-reading destinations.
- All surrounding sections/parts, title, links, scope and concepts compared equal.
- The `reference-1` nc entry, aliases, definition, environment, summary and section `s3` remain unchanged. Normal catalogue revision 2→3 binds that same entry to the new reading rendition; it was not reset or duplicated.
- The complete previous article sections compared equal under retained-rendition readback.
- The authenticated production browser rendered the genuine eight-step model, selected its client with Enter, exposed an exact old-edition `s8` destination and advanced to the client-initiation stage.

The article is permanent and was not trashed.

## Malformed, fallback and CAS trials

`diagram-system-20261027-live-invalid-preview-v1`: unsupported executable interaction metadata rejected with `invalid_diagram`; no publication.

`diagram-system-20261027-live-fallback-preview-v1`: unsupported Mermaid sequence notation retained exactly as code with `diagram_fallback` guidance; preview valid, no publication.

`diagram-system-20261027-live-revision-v1`: disposable static orientation update committed at article revision 2. Original synthetic edition remained exact.

`diagram-system-20261027-live-stale-v1`: stale revision rejected. Its exact operation readback returned `status:conflict`, with the instruction to refresh. The synthetic head remained revision 2.

## Exact recoverable cleanup

Only synthetic article `ms-727c7c3a8ec809599937323bb5e5e9fb5a8e939e` was moved to Trash, using `diagram-system-20261027-live-cleanup-v1`, expected revision 2. Server acknowledgement: committed at revision 3, `trashedAt:2026-10-27T04:59:26.861Z`. Exact cleanup operation readback confirmed the same family/ID/revision. Nothing was purged. Rejected-operation receipts and immutable publication editions remain as normal recovery/audit history; they are not extra active learning records.

This initial acceptance stage created no additional live test records, Attempts, checkpoints or learner evidence. Dev-only browser fixtures contain original synthetic source and do not provide production write authority.

## Accessibility follow-up

The final review found that a short `aria-describedby` could override the SVG's complete canonical node/connection description. The follow-up names the `<desc>` element and explicitly includes both descriptions. It changes no diagram source, record contract, geometry, permissions or lifecycle.

The follow-up passed typecheck, a new complete production build, and 26 targeted diagram/MCP/compiled-production security tests, including a regression proving the complete canonical description is referenced. The earlier 1,264-test full result belongs to the feature implementation; it is not relabelled as a rerun after this two-attribute correction. Final follow-up source/merge/deployment identities are appended to the PR after they exist.

Physical Android/TalkBack, hardware touch/pinch certification and a separate fresh human GPT conversation remain unperformed. No independent external reviewer or actual Netcat execution is claimed. Rollback references remain in RELEASE.md.
