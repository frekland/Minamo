# PR #83 — V102 live findings and V103 continuation commission

**Owner-approved 4 November 2026.** This addendum is binding for the **same draft, unmerged PR #83**. It records authenticated Cloud Browser and refreshed Minamo MCP evidence after V102, and specifies a focused V103 implementation/deployment pass. It supersedes earlier V101/V102 verification scheduling where they conflict. It is not a new product design or architecture commission.

## Starting state and preservation

- Production starting point is **V102**, saved Site version `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_237f08c7d4988191ad611fac7a45d9ea`, deployment `appgdep_6aeae3a9a2008191920c1b8412de0b63`, native source `4ecf2a5e47d9ed276dadb3a5c58899c8612f63d5`, public V102 implementation commit `05487f7ced053c60ffeb4c2273445bf407b92e25`. Verify actual current identities before changing or deploying; do not assume they remain unchanged.
- Protected Site: `https://minamo.jscymru.chatgpt.site`, custom owner-private access policy revision 1. Preserve authentication, policy, generation, records, assets, Notes, Library, all six Project patterns and native-only source. No reset, destructive fixture cleanup, automatic rollback, PR merge or unrelated redesign.
- PR head when this addendum was prepared: `bbf7ca0f66899173f10b7a904274054c6a693b33`; branch `design/v100-plus-flexible-projects-artifacts-test-runs-20261103`. Follow `AGENTS.md`, the PR83 blueprint, preflight, the V102 handover, and `docs/SITES-RELEASE-WORKFLOW.md`.
- Retain synthetic test Projects and histories: `test-pr83-release-20261103` (technical drawing/flashcards/Python/Pygbag), `test-sudoku-20261103` (`test sudoku`, fictional three-week history), and their existing Notes/records. No fixture recreation. Do not touch genuine owner or family Projects.

## Actual V102 live evidence — independently observed

These are **browser observations**, not code-test assumptions. Cloud Browser was authenticated and the refreshed Minamo MCP tools were callable.

### Confirmed critical failure — tldraw P0

1. Opened retained technical Project and its existing tldraw drawing surface. It showed `Drawing loaded.` and an enabled tldraw editor, with hobby watermark visible.
2. Chose the native Rectangle tool and dragged a visible rectangle onto the canvas. A selected rectangle appeared; `Save drawing` became enabled.
3. Clicked `Save drawing`. The live status showed **`Unsupported drawing record.`** It did not acknowledge a save.
4. Reloaded the Project: status returned to `Drawing loaded.`, the previously drawn rectangle was absent and Save was disabled. A real shape was **not persisted or recovered**.
5. Therefore **tldraw persistence is not accepted** and its image/save/reload/edit/concurrency behavior remains unverified. Do not promote PR #83 to ready-for-review until fixed and independently demonstrable.

Initial source lead, not a proven root cause: `app/project-drawing.tsx` calls `drawingDocument(editor.current.store.getStoreSnapshot('document'))`, whereas `lib/drawing-document.ts` rejects any store record whose `typeName` is not in a short whitelist. The fixture `tests/pr83-drawing-document.json` has an **empty `store`**, so existing tests may not exercise real shape records. Inspect the **actual editor-produced document** and validator response; do not merely widen a whitelist speculatively or suppress the error. Maintain document-only snapshots, asset restrictions and private access.

### Confirmed working behavior

- **Flashcards:** the retained technical two-card set displayed its private raster front/answer images, flipped by mouse and by Space on the focused control, moved to the next card, and rendered its front image again after reload. Current component is adequate; **do not adopt an npm flashcard package** in V103. Minor visual styling only.
- **Python Canvas:** in `test sudoku`, Run rendered the authored nine-row board-dot visualisation. The Python parameter explorer at row `5` rendered a cyan sixth row among gold givens/blue blanks and reported `Completed with these captured inputs.` No claim of real learner mastery.
- **Project-local observation:** browser `Save to Project` appended a synthetic verification observation and captured-input JSON directly inside the Sudoku Project. MCP readback confirmed it at revision **9** (from 8), without requiring a Note, Flag or Annotation. Observation part ID `observation-cc08d0d37272e19142696e3f692495e3`.
- **MCP raster upload and Project attachment:** refreshed `upload_minamo_project_image` accepted a 720×405, 15,662-byte PNG as private asset `image-5fb74688025b5e0fdcf25231914a912bec64141674741367f9dd86b599143ade`; `apply_project_update` attached it as the `test sudoku` Project cover with CAS revision 9→10. Reload showed the cover with correct accessible alt text. Other Project content was preserved.
- **Expansion and scoped edit:** Sudoku section/block expansion and restore operated inline; the selected block alone exposed part-edit fields in edit mode. The enlarged Sudoku 9×9 table had visibly distinct 3×3 boundaries. No broader mobile pass yet.

### Confirmed visual quality issues

- **Project cover crop:** the 16:9 uploaded Sudoku illustration was rendered as a very shallow hero strip, cutting off important title/artwork. Correct full-image fitting/readability (and catalogue thumbnail treatment separately); preserve accessible alt text and an attractive text-only fallback.
- **Control clutter and spacing:** repeated `Expand section`, block `Expand/Restore width`, `Collapse` and `Edit this block` controls feel technical and visually prominent. Expanded Workbench columns can be disproportionately tall/spacious. Improve progressive disclosure/visual hierarchy while retaining keyboard/touch accessibility and direct editing. Do not add another layer of layout machinery.
- **Flashcard visual fit:** current card image presentation and interaction work, but buttons have generic styling and spacing could be harmonised with Minamo's design. Polish existing component rather than replace it.

### Incomplete, not failed

- **Pygbag graphical runtime:** the retained technical Project initially had no attached standalone package. The independent review inspected the repository's documented `standalone-html-v1` fixture and reached the authenticated `Packaged pygame-ce` interactive-material upload control. The file-chooser attempt was interrupted before a verified upload or save. **No live pygame-ce output, Stop or Restart conclusion may be claimed.** The fixture at `tests/pr83-pygbag-standalone.html` and packaging doc remain the bounded test basis. Do not build a packaging service.
- Comprehensive mobile/responsive, image-backed Sudoku flashcards, drawing image handling, conflict, and true full learner journey re-acceptance remain unverified. Earlier V101/V102 evidence may guide checks but must not be mislabelled as V103 acceptance.

## V103 Work commission — differentiated autonomy

### A. tldraw: autonomous diagnose → implement → real-browser retest (required)

**Give Work materially more autonomy here.** It may inspect current installed tldraw APIs/schema and official documentation; capture valid diagnostic evidence; revise client snapshot handling, strict server validation, asset upload/reference handling, draft recovery, existing Note CAS/receipt handling and relevant tests as evidence requires. A larger correction is allowed **within the existing tldraw integration only** if necessary. Do not invent a separate drawing backend, ledger, custom canvas, multiplayer system or weakened security boundary.

Work must itself use authenticated Cloud Browser on the actual deployed candidate and repeat the diagnosis/fix/test cycle until demonstrated working (or document a precise real blocker). Required evidence:

1. Create a rectangle/other basic shape and text; Save shows an acknowledged success and Note/revision readback.
2. Reload the Site and verify shapes and text remain visible.
3. Edit existing content and save a second time; verify after another reload.
4. Insert a permitted private raster image and verify save/reload and asset resolution. Exercise an unavailable image reference safely if relevant.
5. Exercise a real revision conflict/stale client and confirm no silent overwrite; draft remains recoverable. Distinguish intentional local draft recovery from server persistence.
6. Confirm no repeated reset on drawing, no unexpected remount, and expected license watermark.
7. Add focused regression fixtures/tests containing **real records and images** and both valid/invalid shapes; typecheck/build.

**A passing unit test or disappearance of `Unsupported drawing record.` is insufficient.** If Work runs out of access/time, leave the exact failed browser step, raw status/message, source commit and next action in the PR; do not claim acceptance or mark ready.

### B. Other V103 changes: bounded implementation, later independent UX acceptance

1. Make Project cover render an intelligible whole image at typical desktop/mobile widths; distinct, sensible catalogue thumbnail crop; preserve focal/alt behavior and text-only Project presentation. No new image management UI.
2. Reduce always-visible expand/edit/arrange chrome; improve concise labels/focus, discoverability on keyboard/touch and restored layout consistency. Preserve all six Project patterns, durable arrangement and runtime instance state.
3. Tighten Workbench/Board layout spacing and responsive overflow. Avoid empty oversized panels, code/table viewport clipping and excess whitespace. Keep content-first hierarchy.
4. Give existing flashcards a light visual polish (button palette, spacing, image fit, reduced motion); no npm replacement unless a later independent review finds concrete insufficiency.
5. Preserve currently working Python Canvas/parameter controls and Project-local observations; focused regression checks only.

For **B**, run narrow relevant tests, typecheck, production build and the fast Sites publication smoke. **Defer comprehensive Cloud Browser desktop/mobile and learner-experience inspection to the next independent ChatGPT chat after V103 deployment**, as the owner explicitly requested. Work should not spend its limited implementation budget on exhaustive screenshots or synthetic acceptance campaigns for these items. Do not claim those deferred interactions verified.

### C. Pygbag disposition

Preserve the existing bounded `standalone-html-v1` implementation/packaging. Work may complete a cheap focused technical check, but **the live package upload/graphics/Stop/Restart acceptance can be done independently after V103**, unless Work can establish it without displacing the required tldraw live work. Record it honestly as unverified if deferred.

## Deployment, documentation, completion gates

- Keep V102 live until a later successful deployment; publish a corrected **V103** only after focused relevant checks, native typecheck/build and the required **tldraw live browser save/reload/edit** passes. Preserve production auth/access/bindings/data, do not reset database or rollback automatically.
- Maintain a continuously updated PR #83 implementation report with starting public/native commit IDs, every meaningful change, focused test/build results, exact new Sites version/deployment/source identities, observed browser operations/results and any limitations. Commit checkpoints so work survives usage exhaustion.
- **Keep PR #83 draft and unmerged.** Completion of the Work run is not independent UX acceptance. Owner retains final review/merge; an independent Sol 6.1 code review/tidy may follow.
- If tldraw remains broken, explicitly leave PR draft and report V103 as incomplete rather than dressing up technical tests as success. Preserve latest successful production deployment and hand over exact continuation.
