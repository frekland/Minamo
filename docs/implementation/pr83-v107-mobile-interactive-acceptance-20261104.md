# PR #83 — V107 mobile and interactive-content acceptance

Date: 4 November 2026. **Acceptance-only continuation.** Draft PR #83 remains unmerged; production stays at **V107**. This report adds evidence to `pr83-v105-ux-polish-live-verification-20261104.md`; it does not supersede V104 tldraw conflict tests or the V105–V107 implementation trail.

## Verified baseline and method

- Existing production URL: https://minamo.jscymru.chatgpt.site; Sites latest version **107** at start. Current site access **custom**, access-policy revision **1**. No publish, auth/access change, schema migration, reset or cleanup in this pass.
- Browser: authenticated Chrome extension on the user's existing browser, with temporary viewport overrides of **320 × 700**, **375 × 812** and **768 × 1024**. This tests CSS viewport sizes and pointer/keyboard interactions, **not physical Android/iOS touch, on-screen keyboards or platform-specific browsers**. The viewport override must be reset at finish.
- Test Projects only: `test-simulation-playground-layouts-20261103` (layout/rich content) and `test-pr83-release-20261103` (interactive artefacts). Existing Project history, notes, flashcards and drawings retained. No genuine learner achievement inferred.
- Sources: authenticated visual screenshots and interaction in the live Site; DOM/layout readback; targeted `get_project_composition` Minamo MCP readback for the exact technical Project. Do not interpret browser interaction as independent execution outside the Site.

## Mobile/tablet results

| Area | Result | Evidence and judgement |
| --- | --- | --- |
| 320px main viewport/overflow | **PASS with issue** | Page `documentElement.scrollWidth === innerWidth === 320`; no body horizontal scroll. Main content, icon actions and floating Notes remain inside viewport. Long simulation h1 uses **32px** type and reaches **192px / five lines**, consuming most first-screen space. **P2**: reduce narrow h1 scale and max-width pressure. |
| 375px Project page | **PASS with issue** | Main width 375, no document overflow. Same long h1 is **32px**, roughly **154px / four lines**. Mobile section icons stay accessible. |
| 320px navigation | **PASS** | Drawer opens/closes. Home, Projects, Library, Practice & review, Your work, Tools and Trash are visible in the opened drawer, with no former large spacer. |
| 320px cross-learning-space interstitial | **FAIL — P1** | A deep-linked unclassified synthetic Project initially collided with persisted Computing scope. The prompt's message and two actions compressed into an awkward multi-column card, splitting words and making the primary action difficult to scan. The button **Switch to Unclassified and open this material** did work when clicked, but presentation is poor. Use a stacked responsive message and full-width primary action at narrow widths; preserve scope semantics. |
| 768px Notebook/Project layout | **FAIL — P1** | Sidebar remains open at ~**208px**; main has ~**560px**. Within the first Project section, `What we're exploring` is **334px** wide but adjacent `Current focus` receives only **159px**, wrapping text into a vertical strip. Collapse split/side placements when the **available main column**, not just window width, is too narrow. Other ordinary blocks are ~509px. No document horizontal overflow. |
| 768px block width control | **PASS** | `Expand Our hypotheses` changed to `Restore width of Our hypotheses`, table visibly widened; clicking Restore returned the accessible control and `pc-block` class to the normal, non-expanded state. This closes the earlier inconclusive Playwright restore-click concern. |
| 320px Japanese furigana | **PASS** | `Hide furigana` toggled to `Show furigana`, readings disappeared visually; toggling back restored them. Ruby/translation controls remain within viewport, although action buttons wrap vertically. |
| 320px code/diagram page | **PARTIAL** | Rich page remained document-width constrained; overlong syntax-highlight spans extend past the viewport inside their code scroll region, not the document. Full diagram navigation, code copy/wrap and touch pan were not exercised in this pass. |

## Interactive content results — actual live Project

| Feature | Result | Evidence |
| --- | --- | --- |
| tldraw, 320px | **PASS** for drawing persistence | Existing drawing loaded. Selected **Draw**, dragged a short new freehand stroke, saw Undo enable, clicked **Save drawing** until status **Drawing saved.** Five exact `[data-shape-id]` values persisted unchanged through full page reload (`shape:0alhyANcha9sGaj6cCSMo`, `shape:3-M3tPmusn2D5Jm-Ld6ND`, `shape:P6BUeVAvTWdn49YaXfQwN`, `shape:my7Vo9x6MzdawP0PXKagP`, `shape:vxwGwSD_c4QrqoYFqUzU8`). This adds one synthetic stroke to `test-pr83-drawing-state-20261103`; do not reset. |
| tldraw camera on small view | **UX concern — P2** | 267px-wide canvas and toolbar fit the 320px viewport, but previously saved rectangles appear partly off the right edge when the desktop camera is reused. Consider a bounded fit-to-content/zoom affordance on viewport change that does **not** reset document state or overwrite chosen camera. Do not generalize this to a data-persistence defect. |
| Python Canvas, 320px | **PASS** | Run loaded bundled Python and completed; screenshot showed a blue circle on white visual output. A later Run → **Stop** returned **Stopped.**, and running again returned **Completed with these captured inputs.** This confirms recovery after manual Stop, not the 20-second hard timeout. |
| Python parameter explorer | **PASS** | Keyboard ArrowRight changed `Radius` **24 → 25**. Run completed and blue-circle output updated. Expanded **Save observation**, entered a clearly labelled TEST-only factual observation, clicked **Save to Project**, and saw **Observation saved in this Project.** No Note was created. |
| MCP Project readback | **PASS** | `get_project_composition('test-pr83-release-20261103')` returned current Project revision **10** with `parameters` section containing callout part `observation-60d08f5e5e98a0d20e22ed0ef63fbe55` and typed JSON input `radius: 25`, source `parameters/parameters-part`, original definition digest, seed `7`, classification `browser-reported`; all other native sections retained. |
| Native parameter explorer | **PASS** | `Amplitude` **70 → 71** via keyboard slider; displayed sine-wave visual output updated at 320px. The value was not saved to the Project. |
| Image-backed flashcards, 320px | **PASS** | Expanded saved Flashcards section and revealed Card 1 answer. Both private Minamo logo images (question and answer) loaded after prior reload; asset had natural width **1448px**. The card fitted 320px and toolbar wrapped to two rows without page-level horizontal overflow. Temporary card flip did not record mastery. |
| Pygbag packaged pygame-ce | **NOT TESTED — no admitted live asset** | The technical Project's `package` section is an explanatory paragraph only, not an `interactive.type='pygbag'` part. Therefore there was no Run/Stop frame to exercise. Repository `tests/pr83-pygbag-standalone.html` contains the supported upstream 0.9 loader/Python 3.12 envelope, but this run did **not** upload and attach it or establish graphical runtime success. A separately authorized, confined synthetic upload+attach/run is necessary. |
| tldraw private image import | **NOT TESTED** | This pass drew and saved a stroke but did not upload or import a private image into the canvas. Asset ownership and post-reload rendition remain unaccepted. |

## Scope, limitations and recommended follow-up

1. **P1 — fix the 768px split-layout breakpoint** based on the actual content area after sidebar width. Require reasonable minimum reading-column widths; if unavailable, stack Project blocks to one column. Test at 320, 375, 768 and 1024px.
2. **P1 — fix narrow cross-space prompt** as a readable vertical card with one clear primary action and a secondary Home action. Test around 320px.
3. **P2 — reduce mobile Project h1 scale**, refine the 320px slider width and Python controls if polishing in the same bounded CSS pass. Keep semantic labels and real focus states.
4. **P2 — improve tldraw default camera fit at mobile width**, without remounting/resetting content. The new stroke persisted; preserve it and all earlier shapes.
5. Separate controlled acceptance for **private image insertion into tldraw** and **existing supported Pygbag HTML**. Do not build an all-purpose package pipeline or upload personal materials. Test actual browser graphical output/reload/Stop and document exact outcome.
6. Physical Android/iOS touch, virtual keyboard overlap, mobile Safari, long-running Python timeout and broader concurrency are **outside this viewport-emulation check**.

**Verdict:** Core mobile interaction and persistence are working in the sampled synthetic Project, but responsive UX is **not fully accepted** because of two observable P1 layout failures. Do **not** merge PR #83 yet. Keep V107 live; no deployment was required for this read/test/record pass.
