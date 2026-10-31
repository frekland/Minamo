# Minamo live UI/UX audit — 31 October 2026

**Status:** Read-only, owner-authenticated Cloud Browser field audit of the existing Minamo Site, reconciled against the V70 review/V72 independent acceptance. **No application or learner records were changed.** This is an observed screen and interaction sample, not a human usability study, exhaustive regression suite, formal accessibility audit or deployment attestation.

**Current source context:** Public [Sites V86 release evidence](../releases/2026-10-31-sites-v86-observation-adversarial.md) records a successful V86 deployment (native source `f5c604062f7a6829f3121424d6223a8424615523`). Browser interaction was performed on the existing authenticated Site on 31 October. The browser did not independently attest the running Worker SHA; treat “V86” as the documented deployment identity, not a cryptographic browser measurement. The reviewed public source tree was `8f40c760d22157ea2e56b2d81a1c74951270bfe7` (tree SHA, not commit SHA).

**Safety and evidence:** The browser could see owner-private data. Only screen structure, generic labels, course examples and explicitly fictional TEST ONLY fixture facts are transcribed here. No real Note bodies, real Project titles, owner identity, private record links, private screenshots, account details, tokens, backup counts or production logs are included. The audit did not save answers, run code, change preferences, open a restore candidate, create/delete records, reset/advance the fixture, send GPT requests or alter a deployment. Screenshots were inspected in the browser but are intentionally not embedded in this public repo.

## Evidence vocabulary

- **LIVE / reproduced:** An interaction and outcome observed directly in the current hosted browser, with a repeat where important. Proves the bounded visible behaviour only.
- **LIVE / partial:** The named view or path worked, but other states, devices, persistence or failure conditions were not exercised.
- **LIVE / interpretation:** A visual/interaction concern inferred from a visible screen. Its actual effect on learner comprehension needs task-based comparison.
- **HISTORICAL / unverified now:** Earlier owner feedback, V70 issue, V72 independent sample or source/test report, not newly proven fixed or broken.
- **ASSURANCE GAP:** An omitted test or acceptance boundary; not evidence of an observed production failure.

## Task-by-task observations

| Task | Current result | Exact bounded observation |
| --- | --- | --- |
| Resume an evolving Project | **LIVE / partial + interpretation** | Open the owner-only **TEST ONLY Mood-to-Music** Project from Home/Projects. The introduction truthfully states the later move from objective mood scoring to personal labels. Once saved-work lookup settled, **Continue** targeted the last-opened personal-label Step. Steps still lead the page as a linear list, so reconstructing the decision chronology requires opening Step/Question/Recent work. The interim “Checking saved work”/first-step label before loading is **not** counted as a durable defect. |
| Inspect latest versus historical Question evidence | **LIVE / interpretation** | Project → **Develop personal labels** → the linked TEST ONLY refresh-persistence Question. A long technical question appears as the first large heading, followed by a compact guide title and earlier S03/H checkpoint. The right Recent work area includes later labelled Note editions; the prominent checkpoint still describes the older state. This is an information-hierarchy/current-synthesis problem, **not** evidence that the old checkpoint was falsely rewritten, that the later experiment succeeded or that saved revisions were corrupted. |
| Inspect checkpoint details and source | **LIVE / partial** | **Review saved work** opened a checkpoint modal with provenance and older actions. From the Question, a linked synthetic Library Article with a section target landed at the expected personal-label passage; Project/Step return affordances were visible. Precise passage navigation passed in this sample. |
| Find filtered saved work | **LIVE / reproduced** | **Your work → Flags → search** for a guaranteed nonexistent, audit-only text. Empty results said **“No matching saved work”** and offered **“New Note”** alongside **“Clear filters”**. The Note CTA is off-task for a learner seeking Flags. Earlier V72 UX-01 remains visible. No Flag was created or edited. |
| Read N5 course examples | **LIVE / reproduced** | **Library → Japanese — JLPT N5 → N5-02 → Topic and comment**. Kanji examples in normal explanatory prose (e.g. `私は学生です`) lack inline furigana. Further down, separate structured reading blocks have pronunciation controls and the vocabulary table has kana. This is a prose coverage gap, **not** a blanket statement that Japanese pronunciation support is absent. Earlier V72 UX-02 remains visible. |
| Browse Library lists and related links | **LIVE / partial + interpretation** | A Subject list exposes both clickable titles and “Open [title]” links to the same destination, while Preview is distinct. In a short synthetic Article the “Related content” list uses multiple large “Links to this material” cards, including edition/section/part-style metadata visible in the UI. These add scan/keyboard density; neither is a broken link. |
| Global search and dismissal | **LIVE / reproduced twice** | Start on the N5-02 Article, open header **Search**, enter `netcat`, then select **Close search** without opening a result. The overlay closes but the main area shows a **Search results** page even though the browser URL still identifies the N5-02 Article. A reload of that unchanged URL restores the Article. Repeated the sequence after reload and saw the same mismatch. Library Netcat and saved-work results themselves populated with type/source cues. **High-confidence current navigation bug, no data loss observed.** |
| Reopen a Note | **LIVE / partial** | Bottom **Recent Notes** → choose a clearly TEST ONLY Note. It opened in the Notes dock with a visible inline title, edit area and Saved revision state. Hide Notes preserved the tab; the Notes bar remained available across navigation. The Note was **not** edited, so autosave/conflict/draft retention was not verified. |
| Enter Practice | **LIVE / partial** | **Practice & review → Activities → N5-12 reading**. The Activity retained a Practice breadcrumb and exposed Task, Explore and Saved answers tabs. Task presented source links, choice inputs and disabled Check/Save before a response. No response was entered, checked or saved; fault persistence is untested. |
| Find Tools | **LIVE / partial** | **Practical tools** displayed Python/SQL/Regex/Unicode/Web tabs, an explicit “no Kali connection” boundary and a saved-Runs count described as **loaded**, with a Your work link. No execution, local draft edit or Run save occurred. |
| Find Help/recovery | **LIVE / partial** | Settings had Article and Workspace categories; Help exposed task-targeted Note, conflict, backup, study language and GPT topics plus shortcuts. Data and recovery separated backup, restore and local drafts with inactive inspection before activation. No restore, backup creation or failure injection. |
| Responsive Project inspection | **LIVE / visual sample** | Authenticated same-origin viewport harness showed the synthetic Project at **320, 390 and 768 CSS px × 844 px**, plus the normal ~1363px desktop browser. Title, continuation and Project actions wrapped/stacked without obvious clipping in these sampled first screens. CSS iframe, **not a physical phone, touch/zoom/keyboard/contrast/screen-reader pass**. The historical 320px *cross-space prompt* defect (UX-04) was **not** re-tested. |

## Current finding set

These stable IDs are the canonical current register. Reproduction and suggested acceptance are in [UX register](REGISTER.md).

| ID | Priority / kind | Current evidence | Summary |
| --- | --- | --- | --- |
| UX-LIVE-01 | P2 bug | LIVE / reproduced twice | Closing search replaces article content while retaining its Article URL |
| UX-LIVE-02 | High product priority; not a proven implementation bug | Owner feedback + LIVE / interpretation | Evolving Project lacks a compact, attributable current-state/change view integrated with work |
| UX-LIVE-03 | P2 design/temporal hierarchy | LIVE / interpretation | Question foregrounds a long technical heading and old checkpoint above more recent linked evidence |
| UX-LIVE-04 | P2 content/accessibility | LIVE / reproduced | N5 explanatory prose omits inline kanji readings (V72 UX-02) |
| UX-LIVE-05 | P2/P3 action relevance | LIVE / reproduced | Empty filtered Flags offers New Note (V72 UX-01) |
| UX-LIVE-06 | P3 scan/keyboard density | LIVE / sampled | Repeated title and Open links to the same Library destination (V72 UX-03) |
| UX-LIVE-07 | P3 progressive disclosure | LIVE / sampled | Related-content cards expose verbose provenance/relationship metadata |
| UX-VERIFY-01 | P2 historical responsive concern | HISTORICAL / unverified now | V72 UX-04 cross-space message cramped at 320px; current Project is **not** that state |
| UX-VERIFY-02 | P2 assurance gap | HISTORICAL / unverified now | V72 UX-05: Activity 503 test omitted exact reflection-draft retention assertion |

**No new P0 or confirmed P1 runtime failure emerged in this read-only sample.** This does not downgrade the owner's high-priority product concern or independently re-accept 60 earlier fixes. The sampled Site is functional in many basic entry and reading paths while still presenting meaningful orientation and navigation problems.

## Explicit exclusions / follow-up evidence

1. **No write/recovery faults tested:** Notes autosave/conflict/revision races, 503 retention, permanent Trash, backups, restores, local draft recoverability and cross-account access controls.
2. **No physical or assistive-technology acceptance:** real mobile, touch targets, IME, keyboard-only complete journeys, screen reader, 200–400% zoom, colour contrast and motion preferences.
3. **No longitudinal human outcome comparison:** owner feedback is firsthand but historical; a fictional model using a Site is not evidence of a real person's understanding. A new integrated projection needs goal-based before/after trials.
4. **No cross-space prompt retest:** 320/390 Project view is not the historical UX-04 mismatched-language Subject prompt.
5. **No production instrumentation claim:** Site V86 observed-MCP test facilities and canonical state diffs are separate. UI navigation observations do not verify MCP causal authorship, source-code execution or learner outcomes.
6. **No screenshots in public:** authenticated viewport images could include private content, so this report supplies navigable steps and observations rather than unaudited image assets.

## Historical reconciliation

The [60-row V70/V72 crosswalk](V70-V72-CROSSWALK.md) retains *all* original IDs, Sol dispositions and Terra's evidence limits. A historical “Resolved” is **not** promoted to “verified on V86”. All new IDs above are live or assurance observations; there is no assertion that the 60 old issues are all still open.

Relevant enduring product decision: [Learner-experience redesign strategy](../LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md). Related public tracking: [Project/context #14](https://github.com/frekland/Minamo/issues/14) and [optional visual acceptance #18](https://github.com/frekland/Minamo/issues/18). 
