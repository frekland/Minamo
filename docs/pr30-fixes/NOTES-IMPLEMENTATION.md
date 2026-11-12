# PR30 rich Note lifecycle repair

## Final implementation versus the experimental teardown

V23 rendered the rich editor host only for a formatted, supported Note. Switching to a plain Note removed that DOM host while the component retained the ProseMirror `EditorView`; enabling formatting then created another host, but initialization correctly saw an existing view and skipped mounting. Its toolbar therefore appeared enabled above an empty host. The saved body was not deleted.

The finished correction keeps one host mounted for the lifetime of `NoteWritingEditor` and hides it in plain, source and fallback layouts. The existing Note-identity effect remains responsible for saving the outgoing state and restoring or parsing the incoming Note; the existing scope effect continues clearing owner/generation-specific memory and pending assets. The CSS explicitly honours `hidden`, including narrow docks whose author display rules otherwise override the browser's hidden default.

This differs deliberately from PR30's tested teardown prototype. Keeping the view's owned DOM attached avoids an additional destruction/recreation path and retains selection, undo/redo plugins, code views, scroll state, private-image views and pending upload references. No autosave, operation receipt, source serialization, image admission or draft-controller code changes are required. An actual component unmount still uses the existing complete cleanup and memory retention path.

Plain text is never sent through an `onChange` callback merely because the host is retained. The existing `onEnableRich` path escapes literal Markdown before changing format; parsing and identity reconciliation do not write the source. A pending upload belonging to another Note still resolves through its original identity's cached state rather than the currently displayed Note. Source fallback retains its existing compatibility guards and destroys incompatible views as before.

## Permanent regression and supporting contracts

`tests/pr30-note-lifecycle.test.mjs` renders the actual production component in rich and plain layouts and requires one persistent owned host, hidden only in the plain layout. V23 fails that contract because it renders no host in the plain layout. This is a structural lifecycle regression, not proof that a browser mounted an editor.

Executed focused check:

```sh
node --test tests/pr30-note-lifecycle.test.mjs tests/note-rich-writing.test.mjs tests/note-continuity.test.mjs
```

**28/28 passed.** The existing tests exercise actual ProseMirror formatting/history and separate Note states, private-image markers and code-byte round trips, delayed/lost/wrong save acknowledgements, newer drafts and queued attachments. These are local automated contracts, not a physical-device or production save claim. TypeScript checking also passed after adding the development fixture.

## Actual component browser reproduction

The development-only `/preview-notes` route mounts `NoteWritingEditor` directly. It returns not-found in production and has no account, durable save or server acknowledgement. It supplies rich, plain and incompatible source Notes, shared editor memory, isolated scope switching, minimise/restore and component unmount/reopen controls. The exposed source/write/memory receipts allow browser inspection without mutating hidden application state. It supplements, rather than replaces, actual workspace acceptance.

Suggested focused checks:

1. Edit the rich Note, select a nonempty range, switch to plain, enable formatting. Require the plain `**literal**` and backticks to remain literal text and exactly one visible rich editor.
2. Return to the original rich Note; require its edited text, selection and independent undo/redo. Switch repeatedly through the plain and unsupported-source Notes. No switch may emit an unsolicited source write.
3. Navigate away/reopen with shared memory. Minimise/restore. Inspect the receipt and verify independent Note state; change the isolated scope and require old-scope memory to be cleared.
4. Repeat at a narrow CSS width. The plain/fallback layout must not expose a second cached editor beneath its textarea.
5. Use the actual workspace for remote autosave, interrupted acknowledgement, exact operation recovery and private image acceptance. If an image is pending on A, switching to plain B must not cancel it or insert it into B. A full reload continues to require reselecting unsaved image bytes under the pre-existing contract.

Root-owned actual preview/live browser acceptance and screenshots are recorded in the overall implementation receipt. No physical Android acceptance follows from a narrow browser viewport. This change does not promise preservation of an OS text editor's undo stack across conversion from plain textarea to rich format; it preserves the existing rich editor histories and original source contract.
