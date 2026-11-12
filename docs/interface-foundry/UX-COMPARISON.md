# Functional layout comparison and keyboard continuity

Observed in cloud Chromium on 25 October 2026 against the local synthetic full Workspace. The workbench implementation owner executed this exploratory comparison; it is **not a blinded independent usability study, human preference result or learning-gain claim**. Separate challenge and release reports carry the independent reviews and final frozen acceptance. The observations below remain narrower than physical Pixel/IME or assistive-technology acceptance.

## Same Activity, different working compositions

The same exact Python fragmented-message Activity edition and `chunked_reader.py` were used. The browser document was 1363 CSS px wide; the available workbench was 1021.59px. Existing Notes stayed minimized, and its saved synthetic Note and separate unsaved Attempt prediction remained available. Switching variants did not submit an Attempt.

| Working variant | Visible content allocation | Exact code viewport | Page overflow | Functional observation |
| --- | --- | --- | --- | --- |
| Artefact first | Source 1021.59px | 709.20px | None | Maximum source width; task remains one labelled section away |
| Context first | Source 715.13px + original task 306.47px | 479.34px | None | Original purpose and provisional question remain beside exact code |
| Read · try · reflect | Source 1021.59px | 709.20px | None | Previous moved Source→Task with focus on Task; Next returned to the same selected source file |
| Dockable workbench | Source 684.47px + Attempt 337.13px | 456.36px | None | Keyboard range input changed the Attempt allocation from 30% to 33%; existing prediction remained intact |

At real iframe document widths, the context-first layout also measured:

| Document width | Workbench | Primary source pane | Task pane | Exact code viewport |
| --- | --- | --- | --- | --- |
| 1280px | 944.41px | 661.09px | 283.31px | 438.83px |
| 1440px | 1093.22px | 765.27px | 327.95px | 516.95px |

The 900px split threshold is based on **available container width**, with at least 560px for primary and 240px for support. Focus and narrower containers use one content surface. Horizontal scrolling within exact code preserves long lines; it does not create whole-page overflow. This is a deliberate compromise for source inspection; Minamo does not become a replacement local IDE.

Review screenshots:

![Artefact-first source surface](evidence/interface-variant-artefact-independent.jpg)

![Context-first code and original purpose](evidence/interface-variant-context-independent.jpg)

![Functional section sequence](evidence/interface-variant-sequence-independent.jpg)

![Source plus explicit Attempt, resized using keyboard](evidence/interface-variant-power-independent.jpg)

Raw measured values: [interface-variant-metrics-independent.json](evidence/interface-variant-metrics-independent.json). Screenshots show actual source and actions after ordinary scrolling to material. They are not top-of-page geometry claims.

## Executed interaction evidence

1. Selected `chunked_reader.py`, then ArrowRight on the Source tab moved selection **and focus** to Hints. Only the guidance surface was mounted.
2. Revealing the first concept hint returned server text, kept the same enabled focused button, updated its expanded/busy state and announced the text. Hiding removed that text from the DOM. Returning to Source preserved the selected file.
3. Opened the canonical contextual Notes coordinator and entered original TEST ONLY prose. The current-edition synthetic Note remotely autosaved at revision 1.
4. Entered a separate TEST ONLY prediction in the existing Attempt fields. Classic→Focus retained Note text, prediction and active Attempt pane. DOM inspection found exactly one Notes writing owner and a single Focus content surface.
5. Focus→Task, selecting source, and following its exact Reader link preserved the same Note and file identity. The Reader exposed `starter-file-1` in the exact saved rendition, with canonical text identical to the displayed source. Browser Back returned to that file and pane.
6. Live layout changes preserved the Attempt prediction. Sequence Previous/Next and the power layout's keyboard width control performed their visible functions without generating a saved attempt or checkpoint.

An earlier synthetic Note was written while the lab fixture changed from edition 1 to 2 during HMR. Its exact-link save was rejected explicitly and the independent writing survived locally with a “Needs attention” state. The screenshots retain that synthetic rejected tab beside the later saved Note. This demonstrates retention, **not** successful save of the older connection and not a general source-history acceptance result. Final exact older-edition tests are tracked separately.

## Findings corrected during comparison

- **Wrong column allocation:** the DOM task pane came first, so default grid placement gave it the primary column and compressed code into the support column. Explicit primary-column/aside-column placement corrected this; the measured widths above are after correction.
- **Sequence accessible names:** CSS generated step counters polluted tab names. Real visual number spans are now `aria-hidden`; the meaningful tab names remain Task/Source files/Hints/Your attempt.
- **Mode detection:** the host originally matched its own layout-variant attribute when looking for the outer Classic/Focus/Task mode. It now targets the actual ancestor workspace and observes mode changes, so Focus reliably remains single-surface.
- **Source inaccessible above fold:** an early 1440×844 local fixture placed exact code at y≈890. The parent reduced Activity workspace action chrome; final screenshots deliberately expose the code through a normal source click/scroll. Above-fold budgets and phone geometry belong to the final acceptance report, not this exploratory snapshot.
- **Label precision in the lab:** wrapping select labels included option strings in their accessible names; the lab now declares explicit control names for stable keyboard/test targeting.

## Recommended selected system

Keep context-first as the dependable code-task default, with an explicit expanded-content action. The artefact-first composition offers useful extra width for long source or figures without losing context access. Keep sequence and dockable layouts prepared and testable: sequence adds deliberate navigation for people who prefer it; power layout adds substantial continuous form height and should remain optional rather than default. A permanent Attempt editor is unnecessary during ordinary reading or exploration.

These choices are engineering recommendations from observed geometry and actions. They do not establish the owner's preferred design or replace the independent challenger study. The four variants remain reviewable inside the same canonical shell; no new global mode, Notes owner or learning authority is introduced.
