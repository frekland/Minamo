# Minamo UX findings register

**Canonical status date: 31 October 2026.** This is a maintained catalogue of **current evidence**, not a count of all unfixed app bugs. Read the [live Cloud Browser audit](2026-10-31-LIVE-AUDIT.md) for scope and reproducibility, the [60-row historical crosswalk](V70-V72-CROSSWALK.md) for V70/V72 claims, and the [decision roadmap](ROADMAP.md) before implementing.

**1 November D1 reconciliation:** [The existing-capability and gap audit](2026-11-01-d1-existing-capability-gap-audit.md) maps current UI/source/test coverage against the full learning cycle and separates autonomous follow-up from owner UX feedback. It adds **no newly reproduced bug IDs**; continue to use the numbered findings below for defects and the [superseding design decision](../PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md) for commissioning. Avoid misreporting projectless Notes/Questions, Home continuation, GPT context choice or Activity Workbench layouts as wholly absent.

## Triage semantics

- **P1** blocks a critical real task or risks data/continuity; **P2** materially impedes a common task; **P3** adds avoidable friction or a low-risk presentation issue. These are proposed triage levels, subject to owner validation.
- **Reproduced** = current hosted browser behaviour directly repeated. **Sampled** = one bounded interaction or screen. **Interpretation** = reasoned UX concern visible in the UI, with learner impact still needing validation. **Historical only** and **assurance gap** are not current bug confirmations.
- An owner-reported strategic product failure is a *valid requirement* even if this browser pass cannot measure the learner's understanding. Do not convert it into a feature specification without a comparative task test.
- “Fixed” requires a reviewed change, a reproducible before/after path and independent hosted acceptance on the relevant state/device. “Closed” is not synonymous with “not reproduced in one sample.”

## Findings needing action or comparison

### UX-LIVE-01 — Closing search leaves URL and displayed page inconsistent

- **Priority:** P2; **state:** Reproduced twice in current authenticated Site, desktop ~1363px.
- **Entry:** Library → Japanese — JLPT N5 → N5-02 Article → header Search.
- **Steps:** Type `netcat`; click **Close search** without choosing any result. Observe the main view and browser URL. Reload the unchanged URL.
- **Observed:** Search results replace the Article in the main workspace, but the URL continues to designate the N5-02 Article. Reload displays N5-02. Search results themselves load and are usable.
- **Expected:** Dismissing the global search restores the exact pre-search Article/scroll context without a URL divergence, **or** makes the deliberate Search results navigation explicit with a matching history/URL entry. Back/Forward, reload and focus must agree. Do not silently render two different route states under one URL.
- **Impact:** Confusing return, broken deep-link expectation, back/reload discontinuity; **no save/data loss observed**.
- **Acceptance:** Browser test on a real mounted Article: open search, type a query, dismiss via Close and Escape, assert visible Article and URL/history consistency; separately test an explicit result/library navigation and a cold reload. Preserve current working search result typing/source cues.
- **Related:** Historical L05 sampled search result labels but did not cover overlay dismissal; new finding, not a claim that L05 “reopened”.

### UX-LIVE-02 — Project needs a learner-visible current investigation projection

- **Priority:** High product priority; **state:** Owner-observed requirement corroborated by LIVE structural sample, **not a confirmed P1 bug**.
- **Entry:** Owner-only TEST ONLY Mood-to-Music Project, final K/epoch 3.
- **Observed:** A revised introductory summary mentions the switch to personal labels and a settled Continue link returns to the last-opened Step. But the dominant hierarchy remains static ordered Steps with linked Questions; more recent evidence appears on separate Question/Recent work surfaces, while prior checkpoints remain foregrounded elsewhere. One glance does not give a concise, attributable *what changed / current position / open uncertainty / evidence / next action* projection.
- **Interpretation:** The learner must do synthesis across surfaces. This matches first-hand owner feedback and the [strategy](../LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md), but the browser cannot measure genuine confusion or prove an untested replacement design superior.
- **Desired outcome:** One bounded integrated Project slice presenting current state, major changes, the latest saved evidence and uncertainties, with drill-down to original Step/Question/Note/source and a clear way back. Distinguish learner report, observed tool result, verified source and uncertain hypothesis.
- **Acceptance:** Goal-based cold return: find current direction, latest decision and why, one abandoned path, the exact source behind a claim, one unresolved question and the next meaningful action without losing place. Compare old/new on the same versioned fixture and 320/390px plus desktop. Do not require new taxonomy, session rituals, mastery scores, graph/maps or a schema by default.
- **Related:** Public [#14](https://github.com/frekland/Minamo/issues/14), strategy and earlier owner feedback. Do not treat a single successful GPT continuation as Site UX acceptance.

### UX-LIVE-03 — Question hierarchy obscures current versus historical evidence

- **Priority:** P2 design hypothesis; **state:** LIVE synthetic screen sample and interpretation.
- **Entry:** TEST ONLY Project → Develop personal labels → question about refresh persistence.
- **Observed:** A long technical first heading consumes the first view; a shorter guide title follows. The saved S03/H checkpoint remains prominent while later labelled v7-related Note editions appear in Recent work. **This is not proof that v7 worked**, nor that the old checkpoint is corrupt.
- **Desired outcome:** A clearly dated/as-of checkpoint and a compact current evidence/change summary, with links to the exact newer/older editions. Long formal question text should remain accessible without dominating the decision view.
- **Acceptance:** In K, distinguish old S03/H report from later v7 Note; label latest *reported* state versus independently verified results; locate the original edition and return. Test truncation/heading density at narrow widths.
- **Related:** UX-LIVE-02; do not fix with ungrounded auto-summary.

### UX-LIVE-04 — N5 prose kanji lacks furigana

- **Priority:** P2; **state:** Reproduced in live N5-02; earlier V72 UX-02.
- **Steps:** Library → Japanese JLPT N5 → N5-02 → **Topic and comment**; inspect examples such as `私は学生です`, and compare the later structured worked-reading controls and kana vocabulary table.
- **Observed:** Explanatory prose has no inline readings. Separate controlled reading has pronunciation support. Do not describe *all* Japanese text as unsupported.
- **Desired outcome:** Accurate kanji readings/furigana on beginner explanatory examples and appropriate table text, no romaji, with author/source review.
- **Acceptance:** Language-review the sampled prose; show correctly aligned furigana at desktop/mobile/zoom, avoid duplicate screen-reader speech, retain exact edition/passage anchors and structured reading controls. Expand sample to other N5 Articles before estimating content-wide impact.

### UX-LIVE-05 — Flags empty state directs users to New Note

- **Priority:** P2/P3; **state:** Reproduced live with safe zero-match query; earlier V72 UX-01 (original V70 N03 was declared resolved in broader terms).
- **Steps:** Your work → Flags → search `no-matching-flag-ux-audit-20261031`.
- **Observed:** “No matching saved work” plus **New Note** and **Clear filters** despite selecting Flags.
- **Expected:** Explain that Flags/annotations start from a selected passage; offer relevant reading/search route or clear-filter, not an unrelated kind of record. Keep New Note for appropriate Note/all-work contexts.
- **Acceptance:** Empty Flags, Annotations, Notes, no-results query and truly zero-work cases each name their own scope and provide a usable next action, no dead ends and no accidental creation. Test keyboard/phone.

### UX-LIVE-06 — Duplicate Library title and Open links

- **Priority:** P3; **state:** Sampled live; earlier V72 UX-03.
- **Observed:** Subject and Article list cards contain a clickable title plus separate **Open [title]** link to the same target, while Preview is distinct.
- **Interpretation:** Repetition adds visual noise and keyboard stops; it might help some touch users, so removal needs a discoverability check.
- **Acceptance:** Prefer one clear primary native title link if testing supports it, preserve Preview as a distinct action and ensure modified-click, keyboard focus, accessible names and touch targets work at 320/390px.

### UX-LIVE-07 — Related-content UI overexposes technical metadata

- **Priority:** P3; **state:** Sampled on a short TEST ONLY Article; design interpretation.
- **Observed:** Many large “Links to this material” cards and edition/section/part-style relationship details compete with a short article. Exact source provenance is useful; its current foregrounding creates density.
- **Desired outcome:** Prioritise intelligible source title, relationship purpose and return destination, with detailed immutable edition/anchor metadata available on demand.
- **Acceptance:** A reader can choose the relevant link and preserve exact original anchors; detailed metadata remains inspectable, but is not repeated as primary card copy. Compare scan/focus count and narrow layout.

## Historical items requiring *verification*, not reopening by assertion

| ID | Origin | What remains to prove |
| --- | --- | --- |
| UX-VERIFY-01 | V72 UX-04, 320 CSS viewport | Cross-space prompt for a Computing Subject while Japanese selected: readable stacked explanation and both actions, no clipping/overflow, destination and focus retained at 320/390px; physical phone separately. The 2026-10-31 Project viewport sample is **not** this condition. |
| UX-VERIFY-02 | V72 UX-05, source-assessment gap | Isolated 503/visibility/refocus Activity test must enter distinctive reflection text and assert its *exact value* before/after transient failure, while preserving separate confirmed-identity-redaction assertions. **No production data should be fault-injected.** |
| UX-VERIFY-03 | V70 60-row acceptance limitations | Re-execute affected high-risk recovery, draft, keyboard, cross-space and full responsive paths on disposable synthetic state. The 53/5/2 historical dispositions are not a present-tense 60/60 hosted sign-off. |

## Explicitly working in the sampled path

- After loading, the Project **Continue** link chose the last-opened personal-label Step; the temporary loading state is not filed as a bug.
- A synthetic Library section link landed on its precise passage; Project/Step return controls were present.
- Recent Notes reopened a TEST ONLY Note and Hide Notes retained the dock tab; **not** autosave acceptance.
- Practice Activity displayed source links, Task/Explore/Saved answers and disabled save/check for an empty response.
- Tools named its Python/network isolation boundary and counted saved Runs as **loaded**, not total.
- Help and recovery offered discernible task sections; **not** failure-mode or recovery-action acceptance.

## Register maintenance protocol

For each new report: supply exact Site release evidence/observed date, account type and fixture phase, path/viewport, action sequence, *visible* expected/actual, sanitized source identity, severity rationale, impact, confidence, reproduction count and limits. Link any private evidence without copying private content. Before changing status, compare against the same scenario and use a separately reviewed hosted check after deployment; code tests alone do not mark a live defect fixed. File focused implementation PRs/issues by **problem cluster**, not one ticket per historical row or screenshot. Do not conflate a UX interpretation with a storage corruption allegation.
