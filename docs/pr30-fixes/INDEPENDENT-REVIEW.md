# Independent review of the PR30 repairs

24 October 2026. Reviewed the actual working implementation and shared contracts, independently of the two implementers. **No scoped blocking finding remains in the reviewed source and local executions.** Actual application/browser acceptance, installed-client checks, complete build/test validation and release receipts remain the lead agent's separate gates.

## Scope and independence

Read AGENTS.md, the current diffs, `NoteWritingEditor`, its identity/scope/image effects, the shared learning write path, recovery admission/activation and the new permanent tests. I did not implement either product correction, change product modules, use production records, control the browser or publish anything. I added two corrected-contract adversarial tests in `tests/pr30-independent-challenge.test.mjs` and ran real local Worker/D1 fixtures.

## Note editor ownership

The repair in [the actual component](../../app/note-writing-editor.tsx) preserves one host element across rich, plain, source and fallback layouts. Hiding the host is preferable here to the experimental teardown: the retained `EditorView` continues owning an attached DOM node, while the existing identity effect saves the outgoing Note's state and restores/parses the incoming Note. The fix does not introduce a second owner for source, history, autosave acknowledgements or pending images.

Checked these failure paths in source:

- A switch to plain mode does not call `onChange` merely because a cached rich document is parsed behind the hidden host. The deliberate formatting conversion still escapes literal Markdown through the existing parent callback.
- The existing scope boundary clears owner/generation memory and pending assets. The patch does not retain a previous scope's document intentionally.
- Pending image insertion retains its originating identity: a result for another Note uses that identity's cached state and original callback identity, rather than inserting into the currently displayed Note. The stable host adds no new abort/retry path.
- Source fallback retains its compatibility refusal and destroys an incompatible view as before. Source-mode visibility does not detach a compatible view. Unmount still preserves state and performs the existing image interruption cleanup.
- The component-scoped `hidden` rule prevents author display styles from exposing the cached document. The existing workspace hidden rule already protects the dock; the explicit component rule also covers the direct-component development fixture.

The new component regression is structural SSR evidence: V23 lacks the host in plain layout, whereas the corrected component requires exactly one hidden host. It is **not** proof that a browser mounted an editor or that a remote save succeeded. The lead must exercise the real application, including formatting transitions, switching, undo/redo and save uncertainty.

Existing `scrolls` memory records the editor DOM's scroll value, while the surrounding `.rn-note-body` is normally the workspace scroll container. Preserving the host avoids a new teardown regression; it does not establish a new guarantee of per-Note parent-container scroll restoration. Likewise, an OS textarea undo stack is not transferred into ProseMirror by this patch. Describe measured browser behavior accurately rather than claiming either stronger guarantee.

## Correction graph and immutable recovery

[The shared write path](../../lib/learning-work.ts) recovers an existing immutable operation before reading the current target or inspecting ancestry. A changed payload still fails its original operation ID. This preserves the counterexample that rejected PR30's guard-before-recovery adapter.

The current ancestry query reads only bounded head metadata within the owner namespace. It checks active ancestry and stops at a withdrawn terminator. Crucially, its transaction claim guards **every inspected head's** revision, withdrawn state, target key and outgoing edge, not only the immediate predecessor. Opposing writes that both passed preflight cannot both commit.

My additional forced-barrier test goes beyond the implementer's two-node example: `A → B → C` races a concurrent `C → A` revision. One transaction commits and one conflicts; an acyclic active account remains. This specifically challenges distant-ancestor guards. A second independent test builds an active path ending at withdrawn B, rejects a cyclic restoration of B, and recovers B's original committed receipt with its original revision despite later graph changes. Reusing that operation ID with different data is rejected.

The implementer's tests additionally exercise direct and MCP self/cycle rejection without event/history/perspective/receipt writes; ordinary corrections without invented next actions; owner/target refusal; batch-generated IDs; chain bounds; opposing revisions; and withdrawn-head restoration races.

## Recovery admission

[Recovery](../../lib/recovery.ts) validates current staged heads across metadata pages at admission and again before activation. It does not incorrectly treat one page as a complete graph. The compact head map is bounded by the existing archive row budget; iterative path colouring is linear and does not recursively consume the JavaScript stack. A completed path is used only after checking its target membership.

Executed tests cover a self-edge after the first 128 metadata rows, cross-page ancestry, missing/cross-target edges, hostile encrypted current-cycle import, and an invalid pre-release staged generation. They also accept a valid 45-head legacy archive: the live write's 40-head inspection bound does not become an arbitrary new recovery limit. Retained historical revisions containing a past mistake do not invalidate an otherwise valid current graph. Active generation remains unchanged on refusal.

## Executed validation

```sh
node --test tests/pr30-independent-challenge.test.mjs \
  tests/pr30-correction-graph.test.mjs \
  tests/pr30-note-lifecycle.test.mjs \
  tests/note-rich-writing.test.mjs tests/note-continuity.test.mjs
```

**36 passed, zero failed, zero skipped.** These include two independently authored adversarial tests, six correction/recovery tests, the actual-component host regression and existing formatting/history/source/image/save-acknowledgement contracts. They overlap later complete-suite validation and must not be added to that total. `git diff --check` passed.

A separate ad hoc target-encoding probe did not return a result and was not counted as evidence or promoted into a regression expectation. No wider audit or unrelated product change follows from it.

## Release judgement

The two repairs fit the existing architecture and preserve the reviewed ownership, idempotency and guarded-write seams. Proceed through the lead's actual browser, full-suite, installed MCP and cleanup gates. Local fixtures do not prove refreshed installed definitions, production persistence, physical Android behavior or a successful deployment.
