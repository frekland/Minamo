# Notes and personal-work implementation evidence

Implementation branch: `implementation/pr19-integrated-20261022`. This records executed local evidence; the release receipt owns deployed/installed claims.

## Delivered contracts

- One Notes controller owns desktop bar, open tabs, zero-tab state, four docks, resize, focus, minimise and mobile sheet/restore launcher. Opening/closing presentation creates no server records. Tentative pen renaming commits only on Enter/blur; Escape cancels the buffer.
- Every input writes the complete local draft synchronously before remote dispatch. Independent browser-window recovery journals prevent one window's workspace cache from replacing another window's retained writing; copied window identities fork on a conflicting storage event. Storage failures are explicit. Server saves use 250 ms coalescing with a 750 ms maximum dispatch wait during uninterrupted typing, excluding composition, existing in-flight operations and paused conflicts. These are scheduler settings, not a measured network acknowledgement guarantee.
- Each Note has one immutable pending command and local edit sequence. Different Notes may save independently; typing remains enabled. Exact operation ID, family, record ID and expected committed revision are checked. A committed revision 2 with current server revision 3 pauses reconciliation even when only title/context changed. Newer local text/title/links survive acknowledgement.
- A Note save merges its returned head without refreshing the full workspace, search pagination or retained reading. The Note picker uses debounced server-wide family-scoped queries and bounded cursor pagination. Retained operations are checked on reopening/online; no automatic duplicate create follows an uncertain result.
- Inline images use standalone versioned placement markers plus existing owner-private typed image parts. Body, placement and attachment changes use the same CAS command. Only Notes with placements gain interleaved `__body-N` canonical parts; marker-free historical Notes keep `__body` unchanged. The reader uses the same order and omits duplicate end attachments.
- CodeMirror handles formatting, selections, per-Note undo/redo and scroll restoration. Pending image placement uses CodeMirror's native `invertedEffects` history: later typing undoes before the image intent, and cancellation fences late upload acknowledgements. Enlarge/Replace/Move/Remove act on the placement. Image decode/upload captures the originating Note and scope; final-tab closure cancels upload and retains a reselect warning without losing text. Pending image bytes are memory-only; reload/final-tab closure requires reselection.
- Current image-unavailable events remove already loaded editor previews and their metadata. Acknowledged images stop using local blob previews and follow authenticated asset delivery. No remote pasted URL is imported.

## Executed checks

- `pnpm run typecheck` passed during integration after the Notes changes.
- `node --test tests/note-continuity.test.mjs tests/notes-writing.test.mjs tests/note-draft-target.test.mjs`: **29 passed**. Covers lost ACK versus a later title/context revision, newer local intent, malformed receipt fences, zero tabs, exact Unicode/image ordering, legacy identity, formatting toggles and actual CodeMirror pending-image/text undo/redo.
- `node --test tests/domain-images.test.mjs`: **10 passed** against real local Worker/D1/R2. The new inline-Note case successfully creates annotations on `__body-0`, the image description and `__body-1`, captures all three in source order, rejects reordered segments, and reads the pre-image retained Note and its original `__body` annotation. The same fixture subsequently verifies image revocation redacts current/historical reads, captured quotes and bytes.
- The organiser workstream separately reports focused server-query/source-return/annotation-Flag tests; those results belong to its evidence and the aggregate release run.

## Evidence limits

No authenticated hosted Notes save, browser upload, real cross-window storage event, physical Android keyboard/Back/TalkBack, or measured hosted save latency is claimed here. Root integration performed local desktop/390px writing, minimise/restore, reload/rejected-save retention and menu checks; these remain distinct from authenticated hosted or physical-device acceptance. Large history/recovery and installed MCP evidence are owned by their integration workstreams and final release receipt.
