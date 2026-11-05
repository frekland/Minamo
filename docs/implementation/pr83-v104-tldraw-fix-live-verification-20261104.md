# PR #83 — V103/V104 tldraw repair and live verification (4 November 2026)

## Outcome

**The confirmed V102 P0 shape-persistence fault is fixed and was verified against the actual authenticated production Site.** V103 fixed the server/client snapshot validator mismatch; V104 followed after a concurrency test exposed a stale-draft recovery visibility defect. V104 is the current production release. PR #83 remains **draft and unmerged**.

This report documents actual observations, not inferred acceptance of untested features. It complements the V102 browser findings and V103 commission.

## Source and deployment identity

| Stage | Native Sites source | Production | GitHub PR #83 |
| --- | --- | --- | --- |
| Starting state | `4ecf2a5e47d9ed276dadb3a5c58899c8612f63d5` | V102 | `b42d4a603d73156c10bf78b5d9917d7737b391c8` |
| Validator correction | `c1b2317b03e016617c1ee50df881c88a47e8d557` | V103 | `8ba8f924` (validator), `2ef20f8f` (regression test) |
| Draft recovery | `16713e81d9952673b2e57ad744941b690cae4390` | **V104, currently live** | `ef1c189c` (UI) |

- Site project ID: `appgprj_6ad8a4e85eb48191accd6e78976b47e3`.
- V103 version: `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_8759eb304de48191a62ccfbd2f8fc975`. Deploy `appgdep_6aeafb9de80c8191a25ba77d6f0043e8` succeeded.
- V104 version: `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_7647903964288191961f41a09d59f627`. Deploy `appgdep_6aeafdd86a3881918d203fea8952f3de` succeeded.
- Production URL: https://minamo.jscymru.chatgpt.site.
- Sites readback after V104: `latest_version_number=104`, `status=active`, `access_mode=custom`, `access_policy.revision=1`, owner role. No access/auth configuration, database, Notes, existing Projects or Library records were reset.
- Public and native Git commits differ by design, but the three corrected source files were synchronised on the PR branch. Native source is the protected deploy authority.

## Root cause and corrections

1. **Real drawing rejected:** tldraw 5.5.2 defines document-scoped `user` attribution records, populated when a shape is drawn. The Minamo `drawingDocument` validator only admitted `shape`, `asset`, `page`, `binding`, `document`. The old test fixture had an empty store and never exercised attribution. Actual rectangle → Save failed `Unsupported drawing record.`. The validator now admits bounded `user` attribution records while continuing to reject camera/session records, unsupported shapes, external raster assets, oversized documents and prototype keys.
   - Source: `lib/drawing-document.ts`.
   - Regression tests: `tests/pr83-drawing-attribution.test.mjs` (populated document, malformed user/session exclusion, asset/shape exclusion).
2. **Stale draft invisible on reload:** the initial load branch set a meaningful stale-draft message but subsequently overwrote it with `Drawing loaded.`. The older browser-local draft was retained but offered no visible recovery action. The corrected UI displays an explicit older-revision notice and `Restore older draft for review` button. Restoring loads the draft locally, marks it unsaved and warns that a later save would replace the newer server drawing. It does not write server state automatically.
   - Source: `app/project-drawing.tsx`.

## Tests/builds

- `node --test tests/pr83-drawing-attribution.test.mjs`: **3/3 passed**.
- `node --test tests/pr83-interactive.test.mjs`: **4/4 passed** (MCP authoring/image permissions, TEST membership/recovery, typed drawing/media recovery, bounded Pygbag package admission).
- `pnpm typecheck`: passed after both V103 and V104 source changes.
- `pnpm build`: passed after both V103 and V104 source changes.
- Existing warnings: duplicate switch cases in `lib/domain-handler.ts` during the focused integration harness and oversized bundle/vinext route warnings during build. Not introduced or modified by this focused repair.
- Full historical suite intentionally not run.

## Actual Cloud Browser observations

Browser: authenticated Chrome/CDP against the **live production Site**, not a preview. Fixture Project `test-pr83-release-20261103`; no reset/recreation. Drawing Note `test-pr83-drawing-state-20261103`.

1. **V102 reproduced**: selected Rectangle tool and dragged to create a real shape. Save returned `Unsupported drawing record.`. This was the motivating failing case.
2. **V103 save and reload passed**: created rectangle `shape:my7Vo9x6MzdawP0PXKagP`. Save showed `Drawing saved.` and disabled the Save button. Reload showed the same shape ID in the tldraw DOM.
3. **V103 edit existing, save and reload passed**: added `shape:P6BUeVAvTWdn49YaXfQwN`; Save showed `Drawing saved.`. Reload restored both exact IDs.
4. **V103 optimistic concurrency passed**: two separate browser tabs opened the same Drawing Note. Editor B saved a newer third shape. Editor A then tried to save its stale revision and was blocked with a conflict message (`The saved Note is now revision 4. Your drawing draft remains open.`). A subsequent reload of editor B retained its server-side third shape, not the rejected competing edit.
5. **V103 defect discovered**: after reloading editor A, it showed `Drawing loaded.` with the server drawing, without disclosing the older retained local draft. This prompted V104.
6. **V104 conflict/recovery passed**: a later concurrent edit showed the explicit stale-draft notice and the `Restore older draft for review` control. Clicking restored the older locally retained shape `shape:TZTH0w-7qEOpc4Bb6yoXC` into the canvas, displayed `Older draft restored for review. Saving will replace the newer server drawing.`, and left Save available. **We deliberately did not perform the overwrite**. Server snapshot remained protected by revision checks.
7. Cloud Browser screenshots timed out twice at the browser capture API. The actual canvas was interacted with and its rendered shape elements, status text and exact IDs inspected through the browser; **do not claim screenshot-based pixel-level visual acceptance**.

The synthetic fixture now has additional persisted test drawing shapes and a retained browser-local conflict draft. These are intentionally within the technical fixture. Existing Notes/history were not reset.

## Still unverified / next focused acceptance

- **tldraw private image upload, image rendering after reload and image-edit recovery**: not exercised live in this session. Asset restrictions were regression-tested, but do not equate that with a browser image pass.
- Text, freehand, arrows, multiple pages, larger boards, touch/mobile gestures, and precise canvas visual polish: not exhaustively tested.
- Stale draft deliberately restored to the editor, but not committed over a newer server revision; this is an intentional protective boundary. UI may show both stale-draft and conflict panels when a user starts another edit before resolving the stale draft; consider reducing duplication in future polish.
- V104 did not change the other V102 UX features; comprehensive browser UX evaluation of image fitting, flashcards, Workbench layouts and MCP image-upload is reserved for independent acceptance as agreed.
- Pygbag graphical execution on live production remains unverified.
- PR is **not ready to merge solely on this tldraw repair**, and remains draft pending wider PR #83 acceptance.

## Safe continuation

Inspect this report, `docs/implementation/pr83-v102-browser-findings-v103-commission-20261104.md`, `AGENTS.md`, the latest PR branch source and exact V104 native commit. For the next independent UX acceptance, use the existing synthetic technical Project, avoid resetting its Notes/history, exercise image import and canvas presentation in the live browser, then review the broader V102 polish. Avoid deploying a replacement unless a confirmed issue needs a targeted fix.
