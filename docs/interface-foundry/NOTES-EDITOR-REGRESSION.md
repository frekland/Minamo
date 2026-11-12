# Rich Notes update-depth correction and browser receipt

## Observed defect

The constrained bytes trial reported a real `Maximum update depth exceeded` overlay while typing a long synthetic Note through the existing rich writer in Task. Independent reproduction on the unchanged writer confirmed the same stack: `NotesPanel.change → patch → onChange → NoteWritingEditor.dispatchTransaction → ProseMirror readDOMChange`. Short edits passed; an indexed CUA `typeText` of approximately eighty characters reproduced the failure. This was not dismissed as an automation-only success/failure discrepancy.

Temporary length-only transaction instrumentation showed one genuine document transaction per character, with source length increasing by one, rather than alternating or duplicated source content. The probe was removed before source freeze.

## Bounded correction

`app/note-writing-editor.tsx` previously invoked a React `setMarks` updater after every ProseMirror transaction and again from the parent-prop synchronization effect. Even unchanged formatting submitted a no-op updater to React while the external editor and controlled source were acknowledging rapid edits. The correction compares the computed marks with a ref **before calling the React setter**, both for external transactions and source/identity acknowledgements. Actual mark changes update the ref and toolbar state together.

No source save was deferred or debounced. Every changed character still follows the existing immediate local retention, atomic autosave, original writer identity, scope/generation, pending receipt and CAS paths. The Note editor, Note coordinator and undo history remain the same owners. No changes to `NotesPanel`, markdown/source serialization, draft reconciliation or learner evidence semantics were required.

## Actual browser acceptance

Managed Chromium used `http://terminal.local:4173/preview-interface` and the actual isolated synthetic Workspace/D1 domain. No production request or genuine learner record was modified.

A newly created blank Note received the full string below through indexed CUA rich-editor input, exceeding the previously failing rapid-update threshold:

```text
TEST ONLY long rich writing — A😀é remains exact across Classic Focus Task. 012345678901234567890123456789012345678901234567890123456789.
```

Checks actually performed:

1. Full rich DOM text matched exactly; no new update-depth error appeared. The previous baseline error remained in the console at 19:18:09; it was distinguished from a new error rather than treating the console as empty.
2. Classic → Focus → Task retained the complete text in each mode.
3. Selecting text and applying Bold set the real toolbar's `aria-pressed` to `true`; Undo restored the exact original source. Switching to original source displayed the complete identical string; returning to rich writing preserved it.
4. Renamed the synthetic Note `TEST ONLY Notes depth acceptance` through the existing UI and obtained actual local-domain query readback: id `bb1214e6-3324-4d49-94fd-109a791e81fa`, revision `3`, rendition `r-39ad26e1a5268103cc3cbcfe5e14c426a7615591b1f273d1143495a7c24e77ce`. Persisted `body` matched the complete string, including emoji and combining acute accent. That Note used the ordinary writer's `synthetic:false` field inside the wholly isolated TEST ONLY owner; it is not a production learner record.
5. Changed the actual iframe document to 390 × 420 pixels. The same Note became the mobile modal sheet with exact text. Minimise → Restore retained the full text, and the dedicated image/screenshot control remained visible.

A first overlong `pressSequentially` diagnostic exceeded the browser tool's call timeout after a partial prefix; that incomplete input was not counted as a successful full-string test. The subsequent complete indexed input above is the acceptance evidence.

## Regression infrastructure and limits

`tests/interface-browser/notes-editor.spec.mjs` adds long first-edit, original writer retention across modes, formatting/undo/source checks, real local-domain readback and phone reduced-height minimise/reopen checks. Test discovery succeeds. Full execution of that suite still requires the pinned supported Playwright browser environment; the managed CUA runs above provide the actual browser evidence here. Existing rich-writing/terminal/lifecycle domain tests and TypeScript are checked separately in the combined validation log.

This is emulated 390px/420px browser geometry, not physical Pixel keyboard, Android IME, TalkBack or human assistive-technology certification.
