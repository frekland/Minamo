# Independent integration architecture challenge

Reviewed 25 October 2026 against checkpoint `fe713d70ec17a86a4db4248545141400fd259a66` plus the live integration corrections. This reviewer was not the original Activity/Atlas implementation author. The review read `AGENTS.md`, the two release commission amendments and actual shared-domain, MCP, generation, canonical-reading, output and recovery control flow. It used synthetic owners and real local Miniflare D1/R2 only. No production data, merge, Site save or deployment was used.

## Concrete defect and correction

**IC-01 — exact Activity/Attempt relationships were disconnected from Atlas. Code-owned; corrected.**

Reproduction: publish an Activity, save an Attempt pinned to its first immutable rendition, then revise the Activity. The high-level Attempt writer saved an unpinned ordinary link. Atlas then emitted an Attempt edge to the current Activity, although `attempt.activity.rendition` still correctly identified the earlier edition. A native shared-domain Attempt carrying its typed target but no duplicated ordinary link did not appear in the focused Activity neighborhood at all. Likewise, an Activity's typed connected-reading block did not independently supply a graph relationship.

The new `tests/activity-independent-integration.test.mjs` was run before repair. Its exact relation assertion failed (`undefined` versus the earlier `r-…` rendition); its retained-edge assertion failed; and its reverse-neighborhood assertion failed because the native Attempt was absent. The default-off legacy edit check already passed.

Correction:

- `lib/activity/domain.ts`: new high-level Attempts save their exact target rendition in the ordinary link too.
- `lib/atlas/project.ts`: derive graph references from typed Attempt targets and Activity reading blocks; normalize legacy matching Attempt links from their immutable typed target without rewriting stored data.
- `lib/atlas/service.ts`: discover these typed references in both focused directions, then resolve each current/retained target through the existing permission-projected domain reads and exact canonical-part validation.

The graph remains a bounded read-only projection. It does not create records or infer learning outcomes. Derivation runs on permission-projected Activities, so a revoked reading block no longer contributes a source edge. Earlier saved editions remain distinguishable from current nodes via the historical edge and exact destination link.

The challenger authored this narrow repair after finding the defect. These passing tests are correction evidence; independent approval of the repair must come from another reviewer and the final release checks.

## Executed evidence

`node --test tests/activity-independent-integration.test.mjs tests/activity-domain.test.mjs tests/semantic-content.test.mjs tests/activity-security-lifecycle.test.mjs` — **28 passed, zero failed/skipped** after repair. Exact output: `INDEPENDENT-INTEGRATION-TESTS.txt`.

This exercises:

- New guarded Attempt links, old unpinned links, and native typed Attempts without duplicated links, all pinned to the earlier immutable edition after revision.
- Forward/reverse connected-reading neighborhoods and no projection writes.
- Every advertised Activity reading family: Journey, Investigation, Article, Area, Note, Source, Experiment and Run; each exact target becomes unavailable after Trash.
- Source revocation suppresses the graph source relationship and old graph cursors return `409 graph_changed`.
- Activity-disabled old-client editorial writes preserve stored cartridges; disabled projections omit Activity/Attempt fields while retaining immutable target metadata in storage.
- Actual typed MCP preview/publish/readback, replay and CAS; source/current-rights projections; canonical UTF-16 selection; source-code and image MIME bindings; real private PNG bytes; encrypted export/import and generation activation; foreign-owner reads; supplied-versus-observed evidence.

`node --test tests/activity-independent-integration.test.mjs tests/atlas-domain.test.mjs` — **14 passed, zero failed/skipped** after the initial repair, before two extra independent negative/target-variant subtests were added. Existing Atlas tests covered owner/scope/version cursor guards, retained destinations, unaccepted proposals, explicit checkpoints and Trash. The actual 10,000-row synthetic D1 test returned a 60-node page in approximately 66 ms and 20,649 response bytes in this run; this is a local measurement, not hosted latency or an Android benchmark.

Before repair, the broader selection `activity-domain`, `atlas-domain`, `semantic-content`, `activity-product-worker`, and `activity-security-lifecycle` passed **35/35**. Its product test used the existing production-compiled Worker with feature-on synthetic bindings, typed MCP, real migrations/D1, ordinary route SSR and gallery 404 checks. That compiled bundle predated this narrow source correction; final packaging must rebuild and rerun compiled acceptance.

## Release judgement

The reviewed shared domain/MCP/recovery workflows have concrete local integration proof and the discovered internal relationship blocker is corrected. This is suitable for the final combined candidate checks, subject to another role independently reviewing the repair. It is not evidence of a production release or refreshed installed catalogue.

Browser infrastructure was documented unavailable for this phase; this review did not start an alternate server or claim pointer/keyboard/390px browser success. Authenticated hosted three-mode interaction, native Sites tree/save/deploy parity, refreshed installed MCP catalogue/fresh-chat calls, and physical Android acceptance remain explicit external release gates. A source test, local Worker or SSR response cannot substitute for those gates. Root's exact-tree typecheck/build/full-suite and release receipt must identify the final packaged source.
