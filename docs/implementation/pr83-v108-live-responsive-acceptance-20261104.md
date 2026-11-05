# PR #83 — V108 live responsive acceptance and remaining interactive gates

Date: 4 November 2026. Deployment checkpoint: `pr83-v108-responsive-release-20261104.md`. This is **actual live browser evidence**, not a blanket sign-off. PR #83 remains draft and unmerged; V108 stays deployed.

## Release and integrity

- Live: https://minamo.jscymru.chatgpt.site, Sites **V108**, native source `b589b8a4fabde277a08b16d68e06ad662d0ec0e7`.
- Authenticated browser interaction in Chrome extension; independent cloud-browser view also reached the same signed-in synthetic Project.
- Pre-release 7 focused tests, typecheck and build passed. Additional post-deployment `tests/pr83-drawing-attribution.test.mjs` and `tests/domain-images.test.mjs`: **13 passed, 0 failed**.
- Sites `get_site` after deploy confirms access mode **custom**, revision **1**, latest version **108**; no access changes made.
- Native source changes mirrored to public PR branch in `app/project-sections.css`, `app/workspace-chrome.css`, `app/project-drawing.tsx`, and a **bounded** edit to `app/workspace.tsx`. That last file had a pre-existing public/native difference; it was deliberately preserved on the PR branch.

## Responsive results

| Test | Observed result | Verdict |
| --- | --- | --- |
| 320px long Project heading | 24px rendered font, ~84px heading box (previously 32px/~192px); readable on three lines | **PASS** |
| 375px heading | ~26.3px font, ~91px height; no document horizontal overflow | **PASS** |
| 320px cross-space interstitial | On a synthetic Project in Languages scope, message stacks above a **237px-wide, 64px-high** primary switch button and secondary Home action. Screenshot confirms readable card; page width 320, scrollWidth 320. Switching to Unclassified also worked on technical Project. | **PASS** |
| 768px Dashboard with sidebar | Previously broken 159px secondary strip now full-width; tested first three Dashboard blocks each **508.8px**, `grid-column:1/-1`; sidebar remains ~208px. Screenshot confirms normal paragraphs and callout. | **PASS** |
| 1024px Dashboard | Spacious 8/12 primary (~497px) and 4/12 secondary (~241px) restored, with zero page overflow | **PASS** |
| 320px Python explorer controls | Each of three observed slider input widths **269px**, matching its parent; three Run/Stop/Reset toolbar rows have measured button height **45px**, fit without document overflow. | **PASS** |
| tldraw narrow initial camera | On the saved 5-shape technical drawing, .tl-canvas **267.2px** wide and each shape's rendered bounding box sits within its horizontal range, roughly **37–230px**. Before V108 some shapes were off-canvas. | **PASS** for initial camera framing; no new draw/save was executed this pass. |
| Navigation, flashcards, furigana | Earlier V107 dedicated acceptance passed. This V108 run confirmed existing technical flashcard front image natural width 1448px and exposed the card image; no new exhaustive re-run. | **Regression not detected in sampled view** |

The viewport sizes are **CSS emulation**, not physical iOS/Android touch or virtual keyboards.

## Remaining interactive content

1. **tldraw private image import → save → reload: BLOCKED / NOT VERIFIED.** The browser located the synthetic public Minamo logo, successfully bundled it as a temporary PNG for test-only import, and reached the tldraw Media file chooser. `fileChooser.setFiles` was **blocked by the Chrome ChatGPT extension**, which requires its setting **Allow access to file URLs** in Chrome extension details. No image was admitted, no saved drawing replaced, and no success is claimed. Respect the browser permission boundary; do not bypass it. To resume: owner enables that extension permission, then a bounded synthetic-logo import/save/reload/rights test can be run. Alternatively, owner manually uploads an explicitly synthetic PNG via UI.
2. **Pygbag packaged pygame-ce: NOT VERIFIED LIVE.** The technical Project's package section remains explanatory prose rather than an admitted `interactive.type='pygbag'` part. The repository contains `tests/pr83-pygbag-standalone.html` for the supported upstream 0.9/python3.12 standalone envelope, but no live upload/attach/run/graphical-output/stop occurred. This remains a separate synthetic fixture admission and real graphical runtime acceptance task; do not infer success from build/unit tests or implement a general packaging service.
3. **Physical touch, Safari/Android device, hard 20-second Python timeout and broader concurrency** were not retested and remain explicitly out of this scoped follow-up.

**Verdict:** The two V107 responsive **P1 issues are closed on live V108**; P2 small-screen title, controls and tldraw framing materially improved. The whole interactive-content commission remains **conditionally accepted** pending the two genuine media tests. Leave V108 deployed and PR #83 draft; no rollback, merge, deletion, reset or privacy-policy change.
