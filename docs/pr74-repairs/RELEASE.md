# PR 74 repairs — 27 October 2026

This release addresses the fifteen findings in the Minamo v49 review PR #74. Engineering fixtures are synthetic/local; no existing learner record was changed, restored or purged to validate these repairs. Owner-only hosting and existing storage bindings are preserved.

| Finding | Implemented behavior |
| --- | --- |
| F01 | Targeted manuscript replacement uses normalized document keys; omitted keys preserve stable Journey stages as explicit keys do. |
| F02 | Worker and domain HTTP methods share one route registry, including Empty Trash and investigation order. |
| F03 | Purge atomically queues original object keys before removing metadata. Durable deletion retries, shared-reference checks, upload tombstones, rotating reconciliation and post-PUT cleanup address orphaning/resurrection. |
| F04 | Archived manuscript reads project eligible surviving members; unavailable sibling documents and shared briefs are withheld. Complete-edition digest scope is explicit. |
| F05 | MCP conflict classification inspects nested Activity/Attempt receipts; successful results include structuredContent. |
| F06 | Relationship candidates filter eligible families before pagination; returned cursors are consumable and bound to their query/scope. |
| F07 | Listening answers retain separate unsaved drafts per stable segment and reset correctly across owner/generation scope. |
| F08 | All terminal captures follow first-save Note identity, preserve origins on failed migration, retain conflicting copies, and expose failed storage. |
| F09 | Recovery accepts current v3 base/per-writer Note keys and legacy v2, with exact owner/generation filtering and duplicate handling. |
| F10 | Explicit linked-reading scope/language switches preserve the exact destination and passage coordinates. |
| F11 | Indexed candidate windows precede byte budgeting; collection pagination uses one extra row instead of full remaining counts. |
| F12 | Settings exposes Data and recovery, with guards for pending changes and retained writing. |
| F13 | Navigation overlay manages focus entry/trapping, Escape, background inertness and focus restoration. |
| F14 | Activity read purpose, exact-read scope metadata, independent capability versions and optional compact discovery are aligned. |
| F15 | Optional feature failures have bounded retry controls with fresh lazy imports; math failures retain source and offer retry. |

## Validation and limits

Release gates passed: TypeScript typecheck; complete production build; default suite **1,314 tests: 1,310 passed, 0 failed, 4 skipped**. After the final recovery authentication-order correction, all **32 compiled Worker/SSR/MCP/media/routing tests** were also rerun successfully against the final build. Focused regressions exercise manuscript/stage lifecycle, actual outer Worker/MCP dispatch, D1/R2 purge failure/replay/late-PUT races, draft storage failure/migration, recovery parsing, navigation and retry behavior.

The isolated local query-cost regression measured one collection statement and 248 SQLite rows read for a 40-record page against both 100 and 5,000 synthetic records. Five local samples per size had median 2 ms; these are not hosted latency measurements.

Managed browser preview could not start: the preview daemon mailbox was unavailable. Focus tests use a synthetic DOM, and draft/UI tests use source/component and storage harnesses; they do not establish browser, physical device or assistive-technology acceptance. Compiled Worker tests use isolated local D1/R2, not production learner data.

The new MCP schema and capability contract do not establish that an already installed client catalogue refreshed. Clients with an older signature may require a fresh conversation/catalogue refresh to send new cursor/detail fields.

Empty Trash removes the selected current-generation originals; protected checkpoint copies and other retained generations have independent retention. Provider failures or a bounded cleanup backlog require subsequent Trash checks or exact purge replay; no scheduled sweep is introduced. Existing historical orphan objects whose metadata was already deleted cannot be reconstructed by this patch. No broad bucket sweep or live purge was performed. Mixed immutable manuscript editions remain retained, while reads withhold unavailable members.

Migrations 0010 and 0011 add the operational asset-deletion ledger and record-page sort indexes. The ledger is intentionally excluded from recovery archives so restoring a checkpoint cannot replay deletion work.

Final verification, native/GitHub tree correspondence, merge and production deployment identities are recorded in the implementation PR completion receipt.
