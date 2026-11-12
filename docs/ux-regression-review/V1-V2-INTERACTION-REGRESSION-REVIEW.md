# Minamo V2 — Interaction Regression Review (V1 versus V2)

**Date:** 21 October 2026  
**Type:** Source-mapped UX/parity review, not an application change  
**Purpose:** Recover the best V1 interactions in the cleaner React V2 experience, without mechanically copying the old UI.  
**Owner report:** Directly selecting and Flagging/Annotating text is not working naturally in V2; V1 was better.

## Authority, reviewed revisions and limitations

The active implementation authority remains [V2 issue #1](https://github.com/frekland/minamo-v2/issues/1), including the [core learning experience](../core-learning-experience/CORE-LEARNING-EXPERIENCE.md). This document and the companion handoff do **not** launch correction work by themselves. The owner intends to give the builder a prompt later.

- Original Minamo V1: [V62 source e2879dd](https://github.com/frekland/Minamo/tree/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327), including its [current owner decisions](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/reports/owner-review-1/CURRENT-DECISIONS.md), [reading contract §7](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/docs/contracts/03-reading-and-learning.md), [reader](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/app/reader-app.mjs) and [Notes editor](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/app/notes-editor.mjs).
- Minamo V2: [post-PR #7 source fa28ef](https://github.com/frekland/minamo-v2/tree/fa28efdb9cd794b5798926f2bc4f5e0706c17b27), [reader](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/reader.tsx), [Notes](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/notes-panel.tsx), [workspace](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/workspace.tsx), [CSS](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/reader-notes.css) and [contracts](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/lib/contracts.ts).
- The Site-native source may be ahead of this GitHub checkpoint. Reconcile it and demonstrate any corrections already implemented before modifying code. Never reset ongoing V2 work to these review coordinates.

**Subsequent-source check:** While this review was being written, [V2 PR #8](https://github.com/frekland/minamo-v2/pull/8) merged, introducing bounded owner-attested source excerpts, exact source/display return and permission handling. Its newer reader still uses mouseup/limited keyup followed by the separate selection panel; its marks still lack direct contextual edit handlers. The Notes panel source was unchanged. Treat the excerpt admission work as real progress, not an unimplemented feature. Recheck still newer native source before correction.

**Evidence categories:** O = owner-observed behaviour; S = confirmed code-level difference; R = plausible risk needing direct verification; D = known unfinished feature parity, not necessarily a UX defect; P = existing V2 improvement to preserve.

The connected browser could not be accessed from this chat (it requires the originating browser/extension context). This is **not** a claim to have independently reproduced every issue on the live V2 Site. The prior synthetic browser tests and test counts prove selected technical paths, not the natural gestures listed below. The review is deliberately stricter than a pass/fail assertion drawn from source alone.

## 1. Findings that warrant targeted correction

### UX-01 — P0: Select precise text, then immediately Flag or Annotate

**Evidence:** O + S; specific mobile event cause is R.

V1 uses a compact selection toolbar containing only **Flag** and **Annotate**, positioned beside the selected Range. Its dedicated [ReadingController](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/app/reading-controller.mjs) listens to document selection changes, validates canonical text, and freezes the candidate before clicking/keyboard focus destroys the browser selection. See V1 reader and the owner-approved annotation contract.

V2 Reader captures selection on the React article's **onMouseUp** plus limited **onKeyUp** events and then shows a separate sticky **Selected passage** panel, with additional Capture passage/Select whole passage controls. No explicit selectionchange, pointerup or touch-selection completion listener appears in the reviewed reader. Some browsers synthesise mouse events after touch; that cannot be relied upon as proof that Android long-press text handles work. The owner reports the direct gesture is not working.

**Expected correction:** Preserve V2's exact family/record/rendition/UTF-16/multipart/table/Unicode mapping. Change the **interaction presentation** to a compact anchored two-action toolbar after ordinary desktop/native mobile text selection. Flag immediately stores the exact target; Annotate opens a small context-anchored editor. Freeze and revalidate selection on toolbar activation. Clicking must not silently broaden a quote to a whole paragraph. Keep whole-passage controls as unobtrusive keyboard/screen-reader alternatives. On small screens place actions where visible and not obscured by selection handles or keyboard.

**Acceptance:** Desktop drag, double-click and Shift+Arrow; Android Chrome long-press/handle adjustment; selection across inline code, repeated identical phrases, paragraphs, lists, tables and captions; native scroll, back/forward, focus; unsupported cross-source range fails explicitly. No detached selection management step.

### UX-02 — P0: Saved annotation is directly usable from the highlighted passage

**Evidence:** S; complements UX-01.

V1's [reader](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/app/reader-app.mjs) has annotation markers, a stable preview with the owner's text and direct **Edit / Delete / Close**, supports pointer moving into the preview, keyboard focus/Escape and tap/accessible alternatives.

V2's [reader](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/reader.tsx) renders annotations/Flags with inert highlighted **mark** elements and a native title tooltip. The related annotation body is also repeated below the passage in expandable sections containing **Edit or organise annotation →**, routing away from the reading. That is a real interaction departure.

**Expected correction:** Clicking/tapping/focusing/hovering the passage marker opens a stable accessible preview containing the annotation text and direct Edit/Delete, with safe recovery and a meaningful way to close. Provide an adjacent focusable marker when native highlights cannot be focused. Preserve read position, current draft and the exact source anchor. Multiple overlapping annotations remain separate and selectable, not merged. No generated title/date noise or duplicated full prose after every paragraph. An open Note and annotation editor must coexist without a modal blocking the other.

### UX-03 — P0/P1: Flag must work as a bookmark with an on/off state

**Evidence:** S for different mechanics; R for duplicates and two-tab behaviour until exercised.

V1's [Flag contract §7.5](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/docs/contracts/03-reading-and-learning.md) specifies canonical target identity (whole-record, exact passage or external URL), idempotent desired active state and a convenient header toggle. A flag is a bookmark and an on-demand GPT context bridge, never a mandatory reason or action instruction.

V2's [reader](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/reader.tsx) creates a new record in the **flag** family using a fresh record ID whenever the selected Flag action runs; [Your work](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/workspace.tsx) presents Flag records as cards. This is not equivalent on its face to a target-scoped toggle. V2 command-operation idempotence handles retries of **one operation ID**, but does not by itself establish unique bookmarking of the same target across separate deliberate actions. Whether duplicate active flags are admitted must be tested, not assumed.

**Expected correction:** A quiet whole-record toggle and a selected-passage toggle that reflect actual active state, permit direct Unflag and cannot leave two active bookmarks for one canonical target. Retry/operation conflict protection and two-tab ordering must prevent a stale Flag-on operation from reactivating after a newer Unflag. Retain exact source return and accessible pressed/selected state. Determine whether external URL bookmarks need reinstatement now or should be an explicitly tracked parity exception. Reconcile existing V2 Flag records safely; do not blindly transplant the V1 schema.

### UX-04 — P1: Notes has lost rich, immediate formatting

**Evidence:** S.

V1's [Notes editor](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/app/notes-editor.mjs) mounts a rich [Tiptap/Markdown editor](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/app/editor.mjs) with bold, italic, headings, bullet lists, block quotes, code block/language and links. V2's [persistent Notes panel](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/notes-panel.tsx) currently edits the body with a plain **textarea**. V2's separate rich record authoring does not supply the same friction-light Notes interaction.

**Expected correction:** A genuinely good Notes writing surface with inline formatting and useful code/links, consistent with V2's shared rich content and MCP. Reuse existing Note draft, CAS, receipt and uncertain-save mechanisms; do not create another autosave authority. Preserve cursor, composition, undo and Markdown/export, do not flatten unrelated rich sections when changing prose, and keep the editor pleasant rather than permanently exposing a toolbar wall.

### UX-05 — P1: Notes docking, resizing and multi-Note working set are reduced

**Evidence:** S. V1 V62 specifically restored these interactions.

V1's [V62 release](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/STATUS.md) and [Notes window](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/app/notes-editor.mjs) provide **left/right/top/bottom dock**, maximise/restore, minimise, collapse, pointer and keyboard resize, multiple working tabs and a Note quick-search field.

V2's [Notes panel](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/notes-panel.tsx) offers right/left/bottom/focus/minimised/collapsed plus a plain select Note picker. No top dock or resize handle/keyboard separator or tab strip with local quick search is present in the reviewed source. Focus mode may be useful, but is not automatically equivalent to V1's maximised/resizable window.

**Expected correction:** Restore the useful control and working-set capabilities in a responsive React design, allowing different mobile-specific presentation. Preserve the active editing service across docking, navigation and other records, sensible maximum dimensions, good keyboard/pointer resize, explicit close versus collapse, working tab/search/reopen and focus/scroll return to reading. Don't create server Notes by opening a blank tab. Preserve V2's clean shell and working draft/conflict behaviour.

### UX-06 — P1/P2: Notes/Annotations/Flags organiser has lost useful depth

**Evidence:** S.

V1's [organiser](https://github.com/frekland/Minamo/blob/e2879dd24dfebbba0dc9c4851c4e5a90f5d6d327/app/notes-organiser.mjs) includes Notes, Annotations, Flags, Unlinked, Trash, search, sorting, optional flat topics, previews and individual/bulk relationship management. V2's [Your work](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/workspace.tsx) is principally an All/Notes/Annotations/Flags/Runs filter and clickable record cards. V2's global server search/pagination are improvements, not substitutes for practical organising and choosing multiple related items. The [V2 contract](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/lib/contracts.ts) has links but not equivalent optional Note topics.

**Expected correction:** One pleasant, responsive personal-work organiser with contextual filtering, meaningful source return, Note/annotation previews, Unlinked and Trash, useful sorting, optional topic handling (or an explicit owner-facing choice), and deliberate bulk/context relationship management. Distinguish Flag deactivation, annotation deletion and Note Trash. Do **not** restore retired Pool/Unpool controls or turn the organiser into a mandatory filing workflow.

### UX-07 — P1: Highlight styles are too similar and weak

**Evidence:** S.

The owner already required that text selection, personal annotations, Flags, code and canonical references remain visually distinct. V2's [reader-notes.css](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/app/reader-notes.css) gives annotation and Flag marks the same neutral surface and weak neutral underline; the difference is mainly solid versus dotted. The [theme specification](../core-learning-experience/THEME-IMPLEMENTATION.md) calls for a quiet cyan-based annotation state, distinct blue dotted Flag and separate neutral inline-code treatment.

**Expected correction:** Improve differentiation using shape/marker/underline and the existing muted blue/cyan tokens, not neon or colour-only signals. Active, hover, selected and focus states must be recognisable; overlapping annotations/Flags and annotated code must be clear. Keep exact mapped DOM text unchanged.

## 2. Known unfinished V1 capabilities: track separately from accidental interaction regressions

- **GAP-01 — Source reading/admission (D, now partially/meaningfully closed):** V1 supports protected source excerpts, current-rights checks and exact source reading. After the review baseline, [V2 PR #8](https://github.com/frekland/minamo-v2/pull/8) implemented bounded owner-attested manual excerpt admission, exact source/display return and revocation protections. **Reuse and verify that completed work**. Further parity questions concern other supported source forms, real hosted/UI usability and continued rights enforcement, not the absence of all V2 excerpt admission. Do not fake copied third-party content.
- **GAP-02 — Full protected archive/restore (D):** V2 has revisions, CAS, recoverable Trash and save receipts, but its [STATUS](https://github.com/frekland/minamo-v2/blob/fa28efdb9cd794b5798926f2bc4f5e0706c17b27/STATUS.md) expressly says full archive/generation recovery is still in progress. V1 V62 has the larger recovery system. Keep the existing workstream; don't equate Undo/Trash with a tested full backup.
- **GAP-03 — Complete media/document/export (D):** V2's private image blocks improve on V1 in some ways; general document/audio/video and archive/export behaviour are unfinished and should remain accurately labelled.
- **GAP-04 — Broad Flag targets (R/D):** V1 supports selected passages, whole-record and external URL bookmarks. V2 currently emphasises capture records; confirm actual whole-record/URL capabilities in live V2. Include that in UX-03, not only the button treatment.

## 3. V2 improvements to retain — do not restore old mistakes

- **P-01:** V2's new exact family-qualified reading/renditions, Unicode/table/caption anchors, retained editions and appropriate rights checks. Selection UI can improve while these contracts remain unchanged.
- **P-02:** The owner's preferred neutral charcoal and muted blue/cyan theme, cleaner V2 composition, purposeful Library relationships, concepts and branching diagrams.
- **P-03:** Bounded search pagination, targeted records and return context, current Note drafts and operation recovery.
- **P-04:** V2's safe image assets, rich block patching, RSC/Vinext foundations and working optional execution engines.
- **P-05:** The owner's later removal of repeated Help/Copy GPT page controls, pooling, achievement trackers and clutter is intentional. **Do not bring these back.**
- **P-06:** A better-than-V1 interaction can differ from V1's DOM, internal Note family or desktop panel geometry if its experience and correctness are demonstrated.

## 4. Evidence-led interaction acceptance matrix

Record owner observation, current source, synthetic browser test and authenticated hosted/device result **separately**. Do not claim physical-device testing from a CSS viewport, or a successful touch gesture from a desktop mouse test.

| ID | User flow to verify | Expected result |
|---|---|---|
| RT-01 | Select a word, sentence, repeated word, multi-paragraph and code text with mouse | Immediate adjacent Flag / Annotate; exact saved quote, not whole paragraph |
| RT-02 | Android Chrome long-press and adjust selection handles | Toolbar usable by touch, no lost selection or covered action |
| RT-03 | Keyboard Shift+Arrow, Tab, Enter/Space and Escape | Range frozen correctly; focus/return and actions accessible |
| RT-04 | Select across Unicode astral/composed text, tables, code and rich inline decorations | Stable canonical part offsets and original bytes |
| RT-05 | Tap/hover/focus an existing annotation; Edit/Delete/Restore | Direct in-reading actions; distinct Note prose; historical anchor preserved |
| RT-06 | Multiple overlapping annotations and Flag | Accessible chooser, distinct markers and no unintended deletion |
| RT-07 | Flag/unflag/reflag same target and retry stale op across two tabs | One active bookmark, correct final intent, no stale resurrection |
| RT-08 | Whole-record Flag and direct saved return | Honest target scope, visible pressed state, easy Unflag |
| RT-09 | Write a heading, code, bullets, quote and links in a Note; save/reload/read through MCP | Rich readable content, no formatting or undo loss |
| RT-10 | Dock Notes four ways where space permits, maximise, minimise, collapse, pointer/keyboard resize | No overlap or lost draft; meaningful mobile alternative |
| RT-11 | Switch between several open Notes, quick-search, close tab without deleting Note | Consistent working-set identity, no accidental saves/deletions |
| RT-12 | Find Notes/Annotations/Flags/Unlinked/Trash by content and relationship | Helpful sort/filter and contextual return without duplicate records |
| RT-13 | Open a record from a direct link and return after related source navigation | Accurate multiple-Journey context, historic target and focus |
| RT-14 | Revoke a linked source/image while annotation or Note is open | Restricted information disappears; independent prose remains |
| RT-15 | Compare 320/390/768/1440 widths, zoom/reflow, pointer and screen-reader alternatives | Usable controls and reading, no horizontal page overflow or unreachable editor |

**Priority order:** jointly fix UX-01/02/03 (selection and bookmark/annotation gestures), then UX-04/05/06 (writing/work organiser), then UX-07 (visual cues) and integrated cases. Parallelise non-overlapping work; avoid a single mouseup patch that leaves the detached sticky panel and inert annotation highlights. Fix regressions through actual interactive tests, including mobile native selection, and demonstrate the whole reading → annotating → Note → exact return flow.

The specific code findings are a **review baseline only**: the builder should first inspect current V2 Site-native and GitHub trees. If newer code already corrects a case, provide evidence and do not repeat it. Preserve existing data and private deployment gates; original Minamo and cyber-learning remain unchanged.

## 5. Builder disposition requirements

For each UX finding, record: **confirmed / disproved / already fixed / intentionally deferred**, owner-visible behaviour, source/PR links, one reproducible test, and remaining device/host evidence. A regression is not resolved by deleting the feature or substituting a technically successful save for a usable gesture. Neither do we require V1 pixel parity where V2's design is objectively clearer.

No application code, tests, Site, user records or original-project data were modified in writing this review. This document should be shared with Work only when the owner decides to start the correction task.

