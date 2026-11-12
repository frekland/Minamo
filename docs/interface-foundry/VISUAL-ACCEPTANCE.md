# Actual interface acceptance and review gallery

This is local Chromium acceptance of the combined PR41 + Interface Foundry candidate, using isolated TEST ONLY records and the supported Sites preview. It is not hosted production, physical Android, TalkBack or a human preference study.

## Reviewable variants

| Working concept | What differs in actual code | Evidence |
| --- | --- | --- |
| Context first | Source plus a small current-task inspector when space permits; one pane when narrow | [Desktop](evidence/interface-variant-context-independent.jpg) |
| Artefact first | Large source/visual surface; guidance and context remain tabs | [Desktop](evidence/interface-variant-artefact-independent.jpg) |
| Read–Try–Reflect sequence | Explicit previous/next section controls, roving keyboard tabs and retained selected file | [Desktop](evidence/interface-variant-sequence-independent.jpg) |
| Dockable power workbench | Source beside optional Attempt form; keyboard-operable context-width control | [Desktop](evidence/interface-variant-power-independent.jpg) |

All four run inside existing Classic/Focus/Task and one persistent Notes host. They are prepared contextual alternatives; no fourth global workspace mode is added. Context first is the engineering recommendation. Owner visual preference remains a release decision. [Measured comparison](UX-COMPARISON.md), [original PR41 baseline](evidence/pr41-baseline-desktop.jpg), [final desktop](evidence/final-desktop.jpg).

## Executed browser evidence

- Existing PR41 Activity was published through real local MCP/D1, its concept hint deliberately revealed and an explicit supplied Attempt saved. This closes the earlier inability to reach integrated Activity/Atlas in a browser; it does not attribute the old connection refusal to a proven identical cause.
- All nine required widths were tested as actual iframe document viewports: 320, 360, 390, 430, 700, 768, 1024, 1280, 1440. The code source remained locally scrollable; the document did not acquire horizontal overflow. At 390 in Classic, the primary pane measured 333px and the code region about 278px. At 1280/1440 the context split engaged with usable primary widths. [Recorded geometry](evidence/RESPONSIVE-WIDTHS.json).
- Keyboard tab roving, Home/End, source-file selection, hint reveal/hide and status, source return and Browser Back were exercised. Hidden hints are server-redacted and their unrevealed text is absent from the UI payload.
- Classic → Focus → Task retained exact Note text and independent Attempt drafts. A selected source file and its exact rendition/part survived source navigation and return.
- Real old-edition acceptance showed Reader retained revision 1 together with Studio edition 1. Reading current then showed Studio edition 2 and its explicit selected view. The old record did not silently acquire a newly registered renderer. [Screenshot](evidence/reviewer-retained-studio-edition1.jpg).
- Three independent restricted-context trials performed new publication, banked bytes activation and a new finite-view registration. They exercised real typed MCP, exact readback, owner denial, source/lifecycle tests and zero automatic Run/checkpoint writes. Browser trials exercised desktop and 390px, actual byte values, finite keyboard controls, Notes and deliberate teardown. [Trial A](TRIAL-ZERO-CODE.md), [B](TRIAL-BYTES.md), [C](TRIAL-NEW-VIEW.md).
- Long Unicode Notes independently reproduced the update-depth crash before correction, then passed repeated long input, formatting/Undo, exact source, saved local D1 readback, three modes and actual 390×420 reduced-height modal/minimise/reopen. [Detailed receipt](NOTES-EDITOR-REGRESSION.md).
- An actual ruby-pane teardown crash was reproduced and preserved. The corrected owned inner-root lifecycle passed activation → pane departure for ruby, parallel text, data table, chart, trace, TeX, native math and PCM display, plus the custom signal ledger. [Independent review](INDEPENDENT-CHALLENGE.md).
- Atlas's four existing lenses, semantic cards, inspector focus/return, Enter/Space/Escape, filtering, same-query refresh and exact SPA source navigation were exercised against real local projections. Source/owner denial and revoked projections also have real D1/domain tests.
- A narrow byte-inspector overflow was measured and corrected. At 390 the final document width was 390; summary and controls stayed within that width while its 489px table scrolled inside its approximately 284px region.
- Notes-footer Manage Notes now stays in the canonical Workspace, selects the Notes filter and preserves one writer. [Saved writer and footer](evidence/reviewer-footer-notes-retained.jpg).

## Automated visual infrastructure and its limit

Pinned Playwright/axe tests cover representative six-subject desktop/390 screens, all required widths, four variants, keyboard/source/Notes, exact retained editions, footer/navigation and long writing. The local runner preflights the pinned browser and accepts only explicit local origins; it will not target production or silently overwrite baselines.

The current execution environment does not contain the pinned Chromium headless-shell executable. The runner therefore reports **NOT RUN** before application assertions. Earlier launch failures are not relabelled as app failures or passes. No pixel-diff/axe certification is claimed here. Actual Chromium actions above were executed through the supported browser tool; those screenshots and DOM evidence remain distinct from the portable automated regression suite. Approved portable screenshot/ARIA baselines must be captured and reviewed in a matching supported local Playwright environment.

## Remaining device and study qualifications

Physical Pixel touch/long-press/IME, real 200% browser zoom, assistive-technology operation, audio output/background behavior and GPU success remain explicit device gates. CSS contrast, forced-colors, reduced-motion and semantic tests complement those checks; they do not certify them. The independent role-guided exercises were source-exposed agent simulations, not a blinded human study. See the preserved friction and scope statements in the independent report. Large stress-fixture wishes are not implied successful merely because the bounded production projections and source-domain stress tests pass.

## Final content-coherence follow-through

After the independent critique, actual Chromium confirmed the corrected Data Detective at revision3: downloaded-source values A8/10, B9/20, Cblank/12 match the native table and selected count/total chart, with one omitted incomplete numeric pair. Both activated views were removed on changing to Hints. Exact canonical source now stays behind a deliberate disclosure. [Corrected data](evidence/data-coherence-corrected.jpg). This closes the specific integration-specimen mismatch; it does not turn the lab into an authored curriculum or a learning-outcome study.
