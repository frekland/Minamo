# Notes integration and independent challenge

This review inspected the production `NotesPanel`, `NoteWritingEditor`, actual immutable-save reconciliation and attachment domain. It exercised isolated Worker/D1/R2 fixtures, not connected learner records. Browser execution is recorded separately in the acceptance report; the tests below do not operate React layout switching or certify a physical Android keyboard.

## One writing owner

Classic, Focus and Task retain the same `NotesPanel` position and generation-scoped draft identity. Layout choice is absent from its draft key, Note ID, save command, editor memory and image operation. Existing rich/plain/source editing, per-Note undo histories, four docking dimensions, minimisation, tabs, rename, conflict comparison and exact receipt recovery remain with that coordinator. No alternative save engine or layout-owned editor is introduced.

Opening a saved Note is a read/select request to this owner. The caller resolves the eligible **current** Note; an old retained Note reading remains a distinct exact reading. Structural editing remains separately available in Your Work. Recoverably trashed Notes offer Restore rather than an ineligible Open in Notes action. Opening an existing tab never replaces its dirty, paused or in-flight source, title, links or attachments. A clean retained editor based on an older saved revision now prompts for explicit comparison instead of silently replacing its source, undo history or pending-image insertion state. The existing “Keep my draft using this revision” and “Use saved version” actions resolve the comparison deliberately.

## Material challenges and corrections

| Finding | Correction |
| --- | --- |
| The narrow modal's capture-phase Escape minimised the full sheet before a rename input or open Note menu could dismiss. | Rename owns its Escape; an open New Note/Note options menu closes and returns to its summary first. A subsequent Escape minimises the sheet. Native image dialogs and IME composition retain priority. |
| An explicit current-Note open could show a clean retained editor based on an older revision without exposing that distinction. | `noteDraftForOpening` preserves the editor and pauses with both revision numbers for comparison. Dirty/paused/in-flight state remains byte-for-byte authoritative. Opening creates no write. |
| Saved-ID editor aliases survived recovery-generation changes although their editor maps were cleared. | Alias bookkeeping clears with generation-scoped editor memory. Image callbacks additionally reject identities outside the current draft scope. |

The narrow full-height Notes sheet now enables its modal semantics by default, while retaining the same aside/editor. Its background siblings are inert while obscured, focus is contained, nested native dialogs take precedence, minimisation restores focus, and returning to desktop removes the trap. This is not a second mobile editor.

## Executable evidence

Command:

```sh
node --test tests/multi-layout-notes.test.mjs tests/pr30-note-lifecycle.test.mjs tests/note-continuity.test.mjs tests/note-rich-writing.test.mjs tests/note-draft-target.test.mjs
```

Independent result: **40 passed, 0 failed, 0 skipped**. `tests/multi-layout-notes.test.mjs` supplies five actual local domain cases:

1. An original acknowledgement arrives after newer CRLF/tab/Unicode/path writing and selection of another Note. Only the originating Note advances; newer source and original links survive.
2. A committed operation loses its acknowledgement, then a competing title/context revision commits. Exact replay proves the original revision; the independent draft pauses rather than adopting the later head. Changed replay payloads reject.
3. A stale save rejects; local serialization retains its exact text and actionable pause. Only explicit revision resolution permits the next save.
4. A real private PNG is staged; a stale containing-Note CAS rejects, leaving bytes private and staged. Explicit resolution attaches only to the originating Note. Another Note's text, revision and attachment rows remain unchanged.
5. A retained rev1 and eligible current rev2 are independently read through the actual domain. Initial opening uses current rev2, but an existing stale editor is retained for explicit comparison. Dirty, rejected and pending-operation drafts survive; opening does not alter the server revision.

The remaining tests exercise actual rich-codec/editor commands, independent undo/redo, CRLF fidelity/source fallback, attachment placement, autosave timing, exact immutable receipts, missing-record admission and persistent rich/plain host structure. All isolated fixtures dispose their Miniflare backend in `finally`. No connected records, checkpoints or assets require cleanup from these tests.

## Browser acceptance to read alongside these tests

Verify the connected editor host remains the same through Classic/Focus/Task, dock/resize/maximise/minimise, multi-Note rich/plain/source transitions and project changes. Exercise a held save, rejection/reload, lost acknowledgement, competing current revision and pending image while another Note is active. Check mobile Tab/Shift+Tab, rename/menu Escape hierarchy, native image-dialog closure, focus return and reduced visual viewport. DOM structure tests do not establish these lifecycle/focus results.

Raw pending file bytes remain intentionally browser-memory-only. A full reload reports the interrupted image and requires reselecting it; surrounding writing and immutable committed-operation recovery remain retained. No unsaved cross-device synchronisation is promised.
