# Notes: mobile writing workspace, compact tabs and inline private images

**22 October 2026 — owner-reviewed UI direction, draft engineering design.**  
Companion: `INTEGRATED-DESIGN.md` · `INTERACTION-AND-LIBRARY-RECONCILIATION.md` (later owner routing/lifecycle decisions) · `ACCEPTANCE-AND-DECISIONS.md` · `IMPLEMENTATION-SEQUENCE.md`. **Plan only — no implementation/merge/deployment authority.**

## 1. Problem and intended experience

The owner provided three actual Android screenshots of V2 Notes: an empty Note's writing area sits below search, recent tabs, mobile guidance, "Dock bottom", multiple creation controls, large formatting buttons, code/link input fields, an empty preview, attachments, Save and lengthy sync instructions. A simple Note requires extensive vertical scrolling.

**Preserve capabilities while removing visible obstruction.** Notes on mobile is a dedicated editor-first sheet, but the user explicitly wants: (1) minimise it to a small floating Notes launcher and restore it while using the rest of Minamo, (2) open and switch multiple Note tabs without taking much space, (3) tap a small **pen/pencil icon beside the tab name to rename that Note**, (4) use a small screenshot/image button, and (5) keep existing desktop multi-dock controls.

Desktop must allow **pasting a copied image or dragging an image into the writing canvas** at the actual caret/drop position; it should appear in the text flow with a restrained preview that **does not float over, obscure or shove subsequent writing far down the canvas**.

This design is bundled with Note autosync and the desktop bottom Notes bar, source-accurate annotation routing and Your Work navigation detailed in `INTERACTION-AND-LIBRARY-RECONCILIATION.md`. It must share one Note/tab/sync controller, not invent parallel mobile or desktop-bar state.

**Later desktop agreement:** bottom Notes bar shows open Note tabs/+ and links to Notes-filtered Your Work, while left-nav Your Work remains full; closing the last Note tab must leave zero tabs, rather than manufacturing another blank; the open Note's header/menu must expose recoverable Move to Trash. Photos are independent user Notes, **not** automatic Journey-stage/Investigation checkpoints or GPT-recorded progress; they can be associated with an app area when the user chooses.

## 2. Source-mapped current implementation

| Current file | Implication |
| --- | --- |
| `app/notes-panel.tsx` | Editor Notes tabs/retained drafts, chosen Note, desktop docking, local draft store and a 1,100ms idle autosave. Save-pending temporarily locks editing; formal Save and overlong explanatory controls remain visible. Maintain its guarded identity and receipt recovery while changing layout and sync. |
| `app/note-writing-editor.tsx` | CodeMirror 6 with persistent editor states per Note identity, toolbar and Markdown. It is the correct place for `paste`/`drop` interception and caret-anchored image widgets; don't replace the whole editing architecture. |
| `app/notes-workspace.css` | At mobile widths the open window currently uses a 75dvh sheet with desktop controls and reduced editor viewport; design proper mobile writing-sheet versus minimised floating-button states. |
| `app/note-attachments.tsx` and `lib/note-attachments.ts` | Current Note attachments are appended into a separate `sections` block and edited apart from Markdown; not in-canvas. Retain compatibility with existing saved append-only attachments. |
| `app/image-attachment.tsx`, `lib/asset-client.ts`, `lib/assets.ts` and `lib/asset-handler.ts` | Private validated PNG/JPEG/WebP selection/staging, per-owner/generation D1/R2 admission and revocation exist. Reuse instead of creating an external upload service. |
| `lib/note-markdown.ts`, `app/note-markdown-view.tsx`, `lib/contracts.ts`, `app/reader.tsx`, `lib/domain.ts` | Existing Markdown source/visible text projections and canonical reading/UTF-16 selections must remain correct. Inline image placement needs a versioned explicit source-to-image mapping; cannot just overlay DOM images over an unrelated body string. |
| `lib/notes-window.ts`, `lib/note-draft-target.ts`, `lib/recovery.ts` | Draft/identity/tab retention, CAS, generation/owner fences and complete encrypted recovery; every new durable placement/version must be covered. |

Reference the supplied screenshots when testing; **do not commit actual private screenshots into Git without separate permission**.

## 3. Mobile layout and interaction contract

### Open sheet

- The mobile Notes surface is a near-full-height dedicated **writing sheet** with a compact top bar, one line of horizontally scrollable Note tabs, a large editor occupying the remaining space, and a narrow icon toolbar reachable while the Android keyboard is visible. Respect `100dvh`, `visualViewport.height` and safe-area insets; avoid keyboard and Chrome browser bar covering the caret.
- The first focus/tap should reach the writing cursor without scrolling through search, administrative settings, preview, attachment controls or docking instructions. The open sheet should not duplicate Minamo's own navigation/search inside it.
- Desktop retains its existing left/right/top/bottom docks, resize, collapse, focus and minimisation. **Hide desktop-only docking selector and irrelevant window management controls on mobile**, rather than deleting functionality.
- Put Note search/picker, contextual association, attachments management, formatted preview and organisation in compact, accessible toolbar/menu surfaces that open on demand. Blank formatted preview is **closed by default**; no instructional text blocks occupying editor height.

### Minimise and restore

- A clearly labelled **minimise** control in the mobile sheet hides the editor and restores the underlying Minamo page to normal interaction. Minimise ≠ close a tab; closing the final tab leaves **zero tabs and never automatically creates a replacement Note**. Reopening with no tabs offers Open Note/New Note instead of manufacturing a draft.
- Exactly **one small floating Notes launcher** appears when minimised (above safe-area/bottom navigation, not over key page controls or keyboard). It must be tappable by touch, keyboard and assistive technology. Pressing it restores the same active Note and open tab group, caret/selection/scroll position and pending sync state; **no new blank draft** is created.
- Distinguish **minimise sheet** from **close a Note tab**, **close overlay**, and **Trash the saved Note**. Closing a tab never deletes its Note; minimising is always reversible. Android Back/minimise should not inadvertently navigate out of the current learning context; test browser-history handling instead of globally hijacking keypresses.
- Float placement must not collide with page navigation, selection Flag/Annotate toolbar, bottom navigation or the on-screen keyboard. An unobtrusive local/remote sync state icon is enough; not an achievement badge.

### Compact multi-Note tabs, creating and renaming

- Show one horizontally scrollable **single-line tab strip** beneath the header. Truncate long Note names, keep an accessible `+` to create a new tab. Switch instantly without losing per-Note CodeMirror state, caret, scroll, drafts, links or the independent pending operation queue. A new tab may be a local blank draft until meaningful input occurs.
- **The active tab shows a little pencil/pen icon beside its displayed name**. Pressing it opens a focused inline title editor *in the tab*, without opening a full naming panel or adding another tall title input beneath the strip. **Keep the tentative rename buffer distinct from the committed Note model:** Enter/blur confirms into the shared Note sync queue; Escape cancels even after the autosave idle interval has elapsed, without accidentally sending tentative title text. Blank committed titles gracefully display `Untitled`. IDs and contextual relationships do not change when renamed.
- A close-tab affordance or compact tab menu hides that tab from the currently open set; **does not delete the Note**. Closing the final tab leaves zero tabs and hides the panel as appropriate; opening again offers an existing-or-new choice. A compact active-tab/header menu contains **Move to Trash** with exact recoverable acknowledgement, distinct from tab close/minimise. A small header picker allows reopening saved Notes and retained drafts; don't keep full "Find/reopen" and "Recently closed" controls permanently above writing.
- Make tabs accessible on mobile touch and keyboard, with focus/ARIA semantics and user-visible unsynced/conflict indication per tab. Tab strip must not wrap into multiple rows or consume the writing canvas. When >4 tabs are open, horizontal scroll or accessible overflow handles the excess.

### Conceptual minimum, NOT final UI

```text
┌──────────────────────────────────┐
│ −  Notes           ☁ Saved   ⋯  │
│ [HTTP ✎] [Ideas] [Draft]   [+]  │
├──────────────────────────────────┤
│                                  │
│  Begin writing immediately...    │
│                                  │
│  [small inline screenshot]       │
│                                  │
│  Continue typing underneath...  │
│                                  │
├──────────────────────────────────┤
│ B   I   H   •   </>   🔗   🖼  │
└──────────────────────────────────┘

When minimised: [✎ Notes]  ← one small floating restore button
```

The screenshot should remain in the text flow and never obscure those following paragraphs. Existing lower-level conveniences can be opened from a compact menu.

## 3A. Desktop Notes bar and shared zero-tab lifecycle

**Additional owner browser-review agreement:** desktop persistent Notes bar currently wastes wide space, open tabs only switch after opening the panel, and the bar can restore a tiny collapsed secondary Notes box. Fix these state transitions alongside mobile and continuous autosave.

- **Desktop bar** uses free horizontal width for open Note tabs, [+] creation menu and a clear right-side **Manage Notes** link to `/?view=work&tab=notes`; left-nav `Your Work` remains the All Work entry. Tabs are directly selectable while panel minimised. The bar contains no decorative “Your thinking stays with you...” sentence.
- [+] menu contains **Blank Note** and **Note about this page** (only when the current record is eligible). Make icons accessible with labels; don't use two opaque glyphs.
- **One shared controller** owns `openTabIds: string[]` (empty valid), `activeTabId: string|null`, `visible` and `presentation: docked|focused|minimised`, plus last usable dock. Notes body/acknowledged rev stay server-owned and independent of presentation.
- `closeTab(id)` on last tab must **NOT manufacture a blank draft** (current code does). Hide panel/minimise; preserve pending local work and retrieval. Restore with zero tabs shows only Open existing/New choices, not an automatically created record.
- **Move a saved Note to recoverable Trash from its active tab/header menu** without needing to scroll to the panel footer or use another management screen. Confirmation, CAS and operation recovery apply. Draft discard, tab close, panel hide, minimise and Trash are separate intentions.
- Closing/minimising/switching while saving text/title/images must **not block or discard typed content**, and a later acknowledgement must not replace newer local edits. Reopen saved tabs at original caret/scroll and resolve pending operations; no tiny box requiring a second click.
- Desktop four-way docking/resize survives via compact top-right menu; mobile hides those controls and uses one floating launcher. Use `NAV01–08` and relevant NOTE/MOBILE gates in the acceptance register.

## 4. In-canvas image paste/drop and mobile screenshot upload

### Research-confirmed implementation cautions (CodeMirror, React, D1/R2)

The technical review in [TECHNICAL-VALIDATION-20261022.md](TECHNICAL-VALIDATION-20261022.md) established these specifics from [CodeMirror 6 official docs](https://codemirror.net/examples/decoration/), [React official docs](https://react.dev/reference/react/useSyncExternalStore) and [Cloudflare D1](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch):

- **CodeMirror**: in-flow image `Decoration.widget` / `Decoration.replace` and `StateField` `RangeSet.map(tr.changes)` are supported; block widgets affect measured vertical layout. Handle image paste/drop with scoped `EditorView.domEventHandlers` and tested caret/drop mapping. But a widget is a **rendered representation**, not a persisted image reference. Rebuild widgets only from the canonical versioned Note document and owner-eligible attached asset IDs. Test unmount/remount, undo/redo, Unicode, touch, image resize and changed-height measurement.
- **Notes history and autosave**: use CodeMirror's built-in undo/redo transactions. The remote queue must serialise **immutable snapshots per Note**, enforce CAS and recover lost acknowledgements. Keep **original operation committed revision**, any **newer current read revision**, and **newer local edit sequence** separate. A current record at rev3 does not prove a lost-ACK save committed there at rev2. If another writer changed title/links/sections/images/body, don't silently rebase a queued full Note against rev3; reconcile across all mutable Note fields or report a conflict, preserving local text. Do not implement a second debounced undo history; the [SOFA undo/autosave discussion](https://agents.stackoverflow.com/questions/2d0baac0-f0d3-431c-9bea-16ee4c24d4bb) provides scoped test ideas, not a tested Minamo fix.
- **Shared UI store**: desktop Notes bar, docked window and mobile sheet need one state owner. A parent React controller is acceptable; `useSyncExternalStore` is an option only with cached immutable snapshots, stable subscriptions and server/hydration consistency. No component-specific tab copy should independently manufacture a blank Note.
- **D1/R2**: `db.batch` provides atomic D1 statement commit, **not** atomic R2 upload+SQLite transaction. Stage image bytes separately with stable owner/generation/upload identity, verify exact persisted original and metadata, then atomically attach eligible ID + source placement to Note revision. Uncertain R2 completion, pending upload and concurrent Trash/revocation need explicit reconciliation/orphan cleanup tests; a promised full transaction across products would be incorrect.



### Insertion and selection

- **Desktop:** intercept CodeMirror-scoped `paste` and `drop` when clipboard/DataTransfer contains an actual supported image file. Paste at current caret; drop at `EditorView.posAtCoords` position. Offer accessible file-picker fallback and explicit selection when clipboard offers conflicting HTML/text/file representations. Never automatically import images by following pasted URLs or injecting arbitrary HTML.
- **Mobile:** small icon (e.g. image/screenshot) in the editor toolbar opens the Android system file picker with `accept="image/png,image/jpeg,image/webp"`; do not force camera capture. Insert at current caret, retaining writing focus when appropriate. Only owner-selected image bytes are submitted.
- Validate type/dimensions/size through existing `validateImageFile` + server container checks. Default allowed still-image formats are PNG/JPEG/WebP; no SVG, remote hotlinks, PDF/MP4 masquerading as images, embedded base64 strings or unsanctioned resizing that changes original bytes. A useful alt description/caption is requested in a **small contextual edit**; do not interrupt the writing flow with a giant modal for every screenshot.

### Inline ordering and source/canonical semantics — a core implementation gate

The current Note stores `body` Markdown **separately** from image/media `sections`. Simply attaching another `PassagePart` and rendering it at the end doesn't meet this request. Likewise, inserting a visual overlay into CodeMirror without a persisted source anchor will break ordering, save/recovery and exact canonical text.

**Preferred implementation to prototype first:** a bounded, *versioned*, opaque image-placement marker in the Note's Markdown source, pointing to one typed eligible `image` part and stable part ID. The CodeMirror 6 editor draws a local `Decoration.widget` / replacement at the source marker, not a separate floating element. On save, one guarded Note mutation validates source marker ⇄ image part ⇄ owner-eligible staged private `assetId` and persists the placement/attachment **atomically**. Reader and Note Markdown parser must project the same ordered text/image blocks with correct exact UTF-16 mapped visible text; rich editing must not rewrite earlier retained reading hashes. Local marker text is not a public image URL and never grants byte access.

**Architectural escape hatch:** if direct source markers cannot preserve backward-compatible Note rendering/anchors and stable identifiers, introduce a new versioned structured Note-canvas block ordering instead. Keep **one authoritative ordering representation**; do not maintain independently editable Markdown and image-position lists that can silently diverge. The implementing agent must demonstrate why the chosen model is safe with tests, not select solely by convenience.

- Existing saved `sections`-based attachments remain readable and recoverable; do **not** auto-migrate or reorder them. If edited, preserve the eligibility and old identities.
- Don't use image bytes or data URLs in the body. Images remain owner-private, served only through currently eligible asset endpoints and never automatically interpreted by GPT through an alt description.
- Supports reorder/move, replace with explicitly chosen image, remove (without accidental permanent deletion), caret editing above/below and keyboard Undo/Redo as real editor transactions with correct source position.

### Display: image does not block writing

- Render a **compact responsive, in-flow image card** with `object-fit:contain` and bounded height (initial hypothesis ~180–220 CSS px desktop, ~140–180px mobile, verify in saved site), optional small caption, loading/retry status and accessible action to view larger if requested.
- It occupies one normal block **between the text before and after**. It must not float over selection, cover later lines, force horizontal page scroll, steal focus or introduce huge blank space. Full-size viewing occurs only on deliberate tap/click in a separate lightbox/reader, not permanently in the editor.
- The editor's cursor/drop location, scroll anchor and current Note tab persist when async upload finishes. CodeMirror decorations must not produce phantom text in copied selections or off-by-one UTF-16 offsets.

### Workbench refresh, committed receipts and cancellation correctness

- **Avoid the current global-write coupling:** `app/workspace.tsx` currently invalidates search and paging and calls a broad `refresh()` after each successful shared command. Frequent Notes autosaves must **not** reset unrelated search, bookmarks, pagination, retained reader selection or Journey navigation. Update the exact Note from the committed operation receipt and coalesce the minimum affected view refreshes; preserve mandatory generation/owner/source-rights revalidation without rebuilding the whole client state on each edit.
- The local queue's original `operationId`, immutable payload and **committedRevision** remain identifiable after a lost response. Status/readback may indicate a **later currentRevision**, which is a different actor's later state, not the save receipt's revision. Test concurrent body edits **and title-only/context-only edits**; never silently replace a newer server field with a stale local snapshot because the bodies happen to match.
- A user may undo or remove an image placeholder before upload completes, switch tabs or Trash a Note. **Only a still-valid insertion intent** may attach to that Note after R2 staging; reconcile abandoned/uncertain staged objects and don't re-insert an image simply because the upload eventually finishes. Keep adjacent text/undo state intact through failure, cancellation, tab change and reload.
- Use an actual sustained mixed workload: live editor and open paginated search/retained reading while 100+ Note sync acknowledgements are observed. Measure local-durability, remote acknowledgements **separately** from background refresh, search pagination continuity, and memory/source integrity. This remains an **internal gate in the one later Work commission**, not a standalone owner approval or separate Notes PR.

### Non-blocking upload, durable sync and recovery

- On insert, show an inline local placeholder and begin R2 staging through existing owner/gen endpoints; **continue accepting typing, changing tabs and minimising** while uploading.
- Persist a unique insertion identity and a bounded pending image intent alongside the local Note draft. If possible, retain pending image Blob in owner/generation-scoped IndexedDB until upload/attachment acknowledged; handle quota/private-mode denial with an honest "choose this image again" fallback. Do not claim a local `blob:` preview URL will survive reloading.
- Once staged **and the insertion intent is still valid**, commit **image attachment + stable placement + correct Note revision** in one guarded D1 operation; use the same Note autosync coordinator and retain immutable payload/receipt for uncertain responses. A stale upload/undo/removal/Trash must not resurrect a removed image. Unresolved staging is never published as a broken inline marker. Other Notes sync independently; concurrent new text must remain durable and reach its own correct acknowledgement.
- On failure, leave a small **Retry / Remove** placeholder without discarding adjacent writing. On success, update the marker projection to the authenticated asset. Never write private bytes, clipboard metadata or Note plaintext into Git/telemetry.
- Respect existing image limits and `v2_images/v2_image_attachments`, Source rights and revocation. Revoked/unavailable images render unavailable in the correct location without leaking protected alt text/caption. Recovery checkpoints and note revisions retain attached image placement; historical captures are not silently remapped to newer content.
- GPT sees the latest **acknowledged** private Note text and only authorised image metadata; it cannot claim image pixel understanding or read an unsynced clipboard image. The presence of screenshots, Note autosaving or GPT reading acknowledged Note revisions does **not** automatically create a Journey-stage/Investigation Development or Run. Only an **explicitly user-requested checkpoint** can reference a relevant Note revision in the shared learning-work event store; see `LEARNING-WORK-AND-CHECKPOINTS.md`.

## 5. Required regressions before a future release

- **Mobile open:** immediately see title/tab strip, cursor and compact toolbar at 320px/390px, with keyboard visible, and no preliminary scroll; no empty formatted preview or "Dock bottom" admin controls.
- **Minimise:** one small floating restore control, main Minamo app completely interactive, no duplicate bottom bar, reopened Note retains tab, cursor, scroll and pending sync; Android Back tested.
- **Tabs:** open three different Notes, type/change title using active tab's pencil, switch quickly during offline/slow network writes, minimise/restore, close/reopen a tab; no duplicate Note, lost text, body/ID change on rename or silent conflict overwrite.
- **Desktop:** paste valid clipboard PNG at caret; drag JPEG between paragraphs; code/paragraph after the image remains visible and editable immediately; no page-overflow or giant permanent preview.
- **Mobile:** choose Android screenshot via image icon, keep typing as upload progresses, restore after switching app; bounded image preview appears at original caret.
- **Staging failure:** offline/503/expired staged image/quota denial/cancel, retry without repeated duplicate image, no orphan marker, text and queued intent retained, honest sync status and recovery.
- **Private lifecycle:** revoke/Trash/restore, other owner and old generation denial, encrypted checkpoint/export restore with same image placement, unchanged old Note images, full source and exact UTF-16 selection/Flag/Annotate identity.
- **MCP:** after an acknowledged Note edit, `read_minamo_record` returns the updated Note; before that it returns only last acknowledged content. Image metadata isn't misrepresented as observed pixels.
- **Accessibility:** icon/tabs/screenshots keyboard and touch access, screen-reader labels, focus return, safe-area/visualViewport/landscape, no global keyboard-shortcut collisions.

Implement this in the **same owner-approved bundled task** as Note autosync, formatting, desktop bar/organiser navigation and explicit Journey-stage/Investigation work, not as a separate mobile-only rebuild. Run real saved 320/390 desktop/Android checks and write source-backed findings. **PR #19 remains planning-only pending further owner discussion.** The canonical Library data/reading contract in `LIBRARY-DATA-AND-MCP-CONTRACT.md` is complementary and must not be conflated with Note image/canonical source ordering.

