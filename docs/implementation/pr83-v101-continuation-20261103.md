# PR83 V101 continuation — live verification and guarded handover

**Date:** 2026-11-03 UTC. **Status:** INCOMPLETE / NOT READY FOR MERGE. This is a continuation record in addition to `pr83-progress.md` and `pr83-pause-20261103.md`. No V100 rollback, no database reset, no cleanup, no access-policy change, and no production deployment were performed in this session.

## Starting and current identities

- Public draft PR #83 branch: `design/v100-plus-flexible-projects-artifacts-test-runs-20261103`, starting HEAD `7473063703c7c114605273d7a06801c4dac6dde9`. This contains the unshipped candidate fix in `app/project-drawing.tsx`.
- Native protected Git `main` HEAD checked read-only with scoped Git credential: `eb1a1475390d788405405db405475ac989e6527c`.
- Sites live V101 saved version `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_267d9de1a7f481919f0bc5dca2379d88`; deployment `appgdep_6aea56b6ac94819185671c0137402fbe` was confirmed **succeeded**, MCP present, runtime env revision 10.
- Live URL `https://minamo.jscymru.chatgpt.site/`; custom invitation audience still revision 1. No policy edit.
- Public integrated application commit `27bdbf9abdbdfb7685deb38fb350d22f1eab3822`, as recorded in the original pause.
- V101 remains live. **The candidate drawing correction is not in that deployment.**

## Actual Cloud Browser work on V101

All observations below came from authenticated real Cloud Browser interaction with the deployed Site, in the retained `test-pr83-release-20261103` Project, not a static screenshot or local preview.

1. **Confirmed tldraw defect:** selected Rectangle and dragged a shape on the actual drawing board. The tldraw UI remounted, the canvas became blank, and the Site displayed `Drawing draft could not be retained locally. Save before leaving.` The Save drawing button became active, but was deliberately **not clicked**, avoiding an empty/corrupt snapshot write. The separate drawing Note remains unchanged. The public branch candidate correction memoizes the asset store and shape utilities and calls `getStoreSnapshot('document')`; it is still *unbuilt and unverified on the native host*.
2. **Python Canvas Stop and restart:** clicked Run during bundled-runtime loading; clicked Stop; status became `Stopped.` and Run re-enabled. Restarted, waited for `Completed with these captured inputs.`, and visually saw the blue circle. Saved one observation into the already-existing synthetic Note `test-pr83-observations-20261103`.
3. **Python parameter explorer:** changed Radius from 24 to 65, ran the actual isolated Python engine, saw a visibly larger blue circle, saved an observation recording `{"radius":65}`.
4. **Native parameter explorer:** changed amplitude 70→30 and frequency 2→4; the displayed wave visibly updated to four narrower, lower-amplitude cycles. Saved an observation recording `{"amplitude":30,"frequency":4}`.
5. **Observation MCP readback:** `minamo_read_minamo_record` returned the observation Note at rev **4**, containing three timestamped observations with exact artefact identity, definition SHA-256 and input JSON; its original introduction remained. These are browser observations, not an independent statement about physical execution.
6. **Direct Project editing:** on the synthetic Project, collapsed Flashcards by default, favourited that section, moved it after Drawing, saved in the real UI, then reloaded. `get_project_composition` confirmed rev **4**, reordered sections, `collapsed:true`, `favourites:["layout-cards"]`, and all six blocks retained.
7. **MCP Project operations:** used `preview_project_update` then `apply_project_update` (operation `pr83-synthetic-layout-hide-pin-20261103`) to hide native-explorer and pin/compact the Python block. Rev **5** committed; reload showed the hidden section absent. A stale expected rev 4 write (`pr83-stale-layout-reject-20261103`) was refused with `revision_conflict`. A scoped `apply_project_update` (`pr83-layout-restore-20261103`) restored the hidden section and temporary pin/width at rev **6** while preserving the earlier direct UI arrange/favourite/collapse and all six content sections. Existing genuine Projects were not edited.
8. **Image-backed flashcards:** downloaded the Site's own Minamo logo as harmless technical input, uploaded a PNG to front and back of the *existing* first synthetic card with different descriptive alt text. An initial save from a deliberately stale browser edit was correctly rejected with `Read the current Project before updating it.`; refreshed the Project rather than forcing a revision. The fresh edit saved successfully to Project rev **7**. MCP readback confirmed two distinct `image-...` private asset IDs on first card's front/back, unchanged card texts and six sections. Cloud Browser rendered both sides on reveal; after a full reload, front private image fetched/rendered again. Images are intentionally technical/synthetic, no ownership of learning outcomes inferred.
9. **TEST histories:** `manage_minamo_test_run inventory` returned exactly Project plus two Notes, with no extra member. `continue` returned the existing root and explicit instruction for ordinary future bounded updates, with no reset or phase gate. `preview-cleanup` returned exactly those three records, no exclusions, an atomic recoverable 3-record chunk and a preview digest; **no cleanup was executed**. Preview needs refreshing after the new revisions.
10. **Python timeout and recovery:** temporarily changed only the existing synthetic Python Canvas code to `while True:\n    pass` through the direct editor (Project rev **8**), pressed Run, and observed the actual status `Execution interrupted: Python exceeded the 20 second limit. No automatic rerun.` Run re-enabled. Restored the original finite animation through the direct editor (Project rev **9**), confirmed exact code and both retained flashcard images through MCP, restarted Python, observed `Completed with these captured inputs.` and visually saw the blue circle again. No infinite-loop code was left in the Project.\n11. **Layout/MCP contract:** `get_layout_capabilities` advertised all six layouts, all five interactive type variants (four core plus Pygbag), drawing Note persistence, Python limits, and Project composition fields.

## Current synthetic record state

- Project `test-pr83-release-20261103`: rev **9**, six sections, Flashcards after Drawing, Flashcards default-collapsed/favourited, no temporary hide or pin/compact override.
- Observation Note `test-pr83-observations-20261103`: rev **4**, three saved runs; preserve it.
- Drawing Note `test-pr83-drawing-state-20261103`: rev **1** as last verified; no canvas save.
- These exact records and their existing histories remain retained. No synthetic cleanup and no modifications to retained playground or genuine learner Projects.\n- Final refreshed `manage_minamo_test_run inventory` and `preview-cleanup` after all writes: watermark **9683**, exactly Project rev **9**, drawing Note rev **1** and observations Note rev **4**; zero excluded, zero remaining outside one prospective chunk, **no cleanup performed**. The prior preview digest is stale; generate a fresh one for any future owner-authorised cleanup.

## Unverified/blocked release work

- **Drawing is critical and failing on V101.** Need protected native source code update from the public candidate, focused typecheck/build, Sites V102+ deploy and actual shape/text/image → explicit save → Note/R2 readback → reload/edit/undo → conflict check. Do not save the current blank/corrupted in-memory V101 drawing or report the fix as verified.
- This session's executor exposed a **read-only filesystem workspace**. The public GitHub connector can commit documentation, but this execution environment cannot make a compliant local protected native checkout, edit, build or deployment tarball. A scoped Sites Git credential confirmed the protected native HEAD; a read-only `git archive --remote` request was unsupported by the server. **Native file-level reconciliation and deployment are not complete.** The correct next step is a writable authorised code workspace and the existing fast Sites workflow; do not deploy the old native HEAD as a fake fix.
- No genuine Pygbag package was uploaded or run. The package section remains a text placeholder; use `pr83-pygbag-packaging.md` and `pr83-pygbag-probe.md` for the exact 0.9 CPython3.12 standalone format, then verify graphical output/Stop/Restart in an opaque frame. No general ZIP service.
- Flashcard upload/render/save/reload verified. Additional image access revocation, failure recovery and drawing image insertion remain untested in this continuation.
- **Stop, 20-second timeout and post-timeout restart are now verified in live Cloud Browser**; the original finite code was restored and checked by MCP at Project rev 9.
- Narrow viewport/mobile interaction, drawing Note conflict/draft recovery, Pygbag resource/CSP success, final native build and source identity are not verified.
- The prior agent reported **11/11 focused tests and native typecheck/build passed** for the *older integrated V101 source*. This continuation did **not** rerun tests/typecheck/build and does not attribute those checks to the unpublished drawing fix.

## Final status check\n\nAt the end of this continuation, `sites_get_site` still reported **V101**, active, custom audience revision **1**, current live URL unchanged. PR #83 was still **draft/unmerged**, branch HEAD at this documentation update, and the critical drawing correction was not published. No Sites version greater than 101 was saved or deployed.\n\n## Exact next actions

1. Obtain writable native workspace, compare touched drawing file with native V101 and public PR83 HEAD, copy only the candidate correction without replacing native-only content.
2. Run focused drawing/interactive tests, `typecheck`, production build. Commit native source; save/deploy new version to unchanged custom audience, record native SHA and deployment ID/status.
3. Live Cloud Browser: draw shape/text, upload an image, save, reload and edit; verify both drawing Note revision and snapshot/media after save. Test stale Note conflict without overwriting other edits.
4. Complete the genuine Pygbag supported-package run and narrow viewport/drawing image tests. Python Stop/timeout/restart already passed on V101; reconfirm after any runtime code changes.
5. Refresh exact TEST inventory and non-mutating cleanup preview; retain records. Update this report, PR body and release receipt, and only mark ready for review when all required runtime features pass. Leave PR unmerged.

**Boundaries:** V101 stays deployed until a tested succeeding version is published; do not rollback, reset, delete, weaken audience or silently drop features.
