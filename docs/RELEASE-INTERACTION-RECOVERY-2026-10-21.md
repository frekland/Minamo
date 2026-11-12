# Contextual reading and personal-work recovery

This increment implements the owner-authorised correction of UX-01–UX-07 from [the source-mapped review](ux-regression-review/V1-V2-INTERACTION-REGRESSION-REVIEW.md). It continues V7; no V1 source, private learning corpus or cyber-learning data was copied or changed. Exact release commits, common tree, GitHub CI and private version/deployment are in the issue #1 release receipt.

## Implemented disposition

| Finding | Disposition and owner-visible result | Reproducible evidence |
|---|---|---|
| UX-01 | Confirmed and corrected: document selectionchange/pointer/touch/keyboard completion; adjacent two-action toolbar; frozen exact range; small nonmodal annotation editor. Closing writing parks its immutable target and permits another Flag without losing the draft. | Actual synthetic pointer drag, double-click, Shift+Arrow, Tab and Enter; exact anchor and recovery tests. |
| UX-02 | Confirmed and corrected: stable mark preview, overlapping chooser, direct Edit/Delete/restore recovery; independently accessible marker outside mapped text; Notes and annotation remain nonmodal. | Actual chooser, preview and direct edit; actual-D1 edit/delete/restore and revision tests. |
| UX-03 | Confirmed and corrected for whole-record and exact-passage targets. Desired state CAS, one active target, durable off tombstones, immutable receipts, current-state refresh; legacy duplicates retain original prose/history. External URL bookmarks intentionally deferred, explicitly false in capabilities. | Independent actual-D1 concurrency/stale-on/retry/owner tests; whole-record direct return and GPT context tests. |
| UX-04 | Confirmed and corrected: versioned Markdown writing with formatting, preview, code language, links, undo/redo. Existing plain Notes retain their text until deliberate conversion. Raw Markdown remains the durable body; reading and MCP share the visible canonical projection. | Actual typed heading/list/quote/code/link, undo/redo and preserved draft; CodeMirror EditorState and domain canonical tests. |
| UX-05 | Confirmed and corrected: four docks, pointer/keyboard resizing, maximise/restore, minimise/collapse/close, working tabs and quick find/reopen. Persistent editor state survives hiding and switching; blank tabs create no server Note. | Actual all four dock choices, keyboard left resize, pointer right resize, maximise/restore, collapse/expand/minimise/close, search and switching. |
| UX-06 | Confirmed and corrected: personal-work tabs, search, sort, context/topic filters, Unlinked/Trash, direct origin/containing-reading returns, optional existing knowledge-area topics, deliberate separate per-record relationship changes and receipt recovery. | Actual Unlinked and Trash filtering; eleven helper/SSR/CAS proposal tests. |
| UX-07 | Confirmed and corrected: distinct muted cyan annotation and blue dotted Flag treatment, overlap marker, focus/pressed states; neutral code and unchanged exact mapped text. | Synthetic visual/accessible preview and exact mapping tests. |

## RT-01–RT-15 evidence and limits

Builder-run UI observations below use the development-only synthetic fixture, with no authenticated identity. Rejected saves remain rejected, with drafts retained. Automated D1 tests use isolated synthetic owners; these are not successful hosted browser gestures. Separately, on 21 October 2026 the owner reported that Android is working for annotations and Flags. This confirms the owner’s basic Android flow; it is not an independent builder test of the complete device or assistive-technology matrix.

| ID | Evidence obtained | Remaining evidence |
|---|---|---|
| RT-01 | Real pointer drag across Unicode prose opens adjacent Flag/Annotate, quote stays partial; double-click selects a word. Existing multipart/code canonical tests pass. | Full natural mouse matrix of repeated words, multi-paragraph and code gestures on authenticated hosted UI. |
| RT-02 | Owner-confirmed basic flow: on 21 October 2026 the owner reported Android working for annotations/Flags. Document selectionchange/touch completion and viewport-aware placement also have source/automated evidence. | Independent physical Android Chrome long-press/handle-adjustment, keyboard overlap and full device/assistive-technology matrix remain unperformed: no builder Android/touch surface was available. CSS viewports do not establish those cases. |
| RT-03 | Real Shift+Arrow, Tab to Flag, Enter dispatch, Escape dismissal; range freeze and parked draft tested. | Physical assistive technology and authenticated keyboard saves. |
| RT-04 | Real drag includes café, Japanese and astral emoji; exact Unicode, multipart/table, rich decorations and Source/display-return automated tests pass. | Full natural table/code/inline gesture matrix on hosted browser. |
| RT-05 | Actual saved-marker chooser, preview, direct Edit and stable movement into editor. Actual-D1 CAS edit/delete/restore preserves independent prose and anchor. | Successful authenticated hosted browser delete/restore. |
| RT-06 | Actual overlapping two annotations and Flag remain separate choices; edit opens only chosen annotation. | Physical touch overlap chooser. |
| RT-07 | Independent actual-D1 concurrent separate on operations produce one active target; off/stale-on/old receipt/legacy retry cannot resurrect. | Two authenticated live browser tabs. |
| RT-08 | Header whole-reading action visible; canonical target and direct return/GPT context verified in tests. | Hosted browser pressed state and on/off gesture. |
| RT-09 | Actual rich typing, formatted preview and undo/redo; rejection retains words. Markdown shared-domain save/canonical/revision tests pass. | Successful authenticated browser save/reload and installed-MCP Markdown write round trip. |
| RT-10 | Actual four docks, maximise previous dock restore, collapse/expand, minimise/close, keyboard and pointer resize. 320-pixel sheet renders scrollable writing and controls. | Physical mobile keyboard/selection overlap. |
| RT-11 | Actual quick-find and second saved Note tab, switch back to rich unsaved draft without loss; state/undo isolation tests. | Cross-device working-set acceptance. |
| RT-12 | Actual organiser loaded examples, independent Unlinked Note and recoverable Trash; automated filters/sort/relationships/recovery. | Authenticated paginated bulk changes through browser. |
| RT-13 | Family-qualified exact original and containing-reading URLs, retained editions and multiple actual Journey relations tested; V7 mappings preserved. | Full hosted navigation and teaching acceptance. |
| RT-14 | Independent actual-D1 Source/image revocation redacts nested flag targets, bookmark state, workspace/query/context/MCP; independent annotation writing remains editable. | Live open authenticated browser revocation observation. |
| RT-15 | Actual bounded iframe layouts at 320/390/768/1440; body scrollWidth equals clientWidth (305/390/768/1425 respectively with scrollbar); narrow Notes controls and scrollable editor inspected. | Full independent Android/device matrix, screen reader, zoom and mobile keyboard evidence; the owner-confirmed basic Android flow is recorded separately in RT-02. |

## Data and source continuity

Migration 0003 only adds the owner-scoped bookmark intent table. It contains no backfill, private fixture or destructive migration. Legacy Flag reconciliation is a bounded read projection (up to 500 matching candidates), retaining original records/history; a duplicate create carrying different independent prose is rejected rather than discarded. Unflag is a target operation; generic Flag restore cannot reactivate stale intent.

Source quotation/display-return mapping, current rights, immutable anchor identity and independent own writing remain distinct. Source-origin uncertain-operation storage keeps operation metadata and own prose, not imported quotation. Private source/image projection and current-state recovery are tested. The organiser uses current eligible server projections and separate immutable per-record proposals; it does not claim atomic bulk success.

This increment does not claim full protected archive/generation recovery, document/audio/video uploads, external URL bookmarks or complete independent Android/device/assistive-technology acceptance. The owner-confirmed basic Android annotation/Flag flow is recorded above. Those remain tracked commission work. The production build excludes both preview fixture routes. Private deployment access remains owner-only.
