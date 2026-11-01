# D3 contextual learning — same-task interaction study (1 November 2026)

**Later owner disposition (1 November):** Choice **1B** (source-first continuation) and **2A** (repaired Reader→Activity with exact return) are accepted as the design direction. The owner prefers planning one **integrated larger build/deployment**, not this study's proposed tiny Article loop. [Current integrated implementation brief](../CONTEXTUAL-LEARNING-INTEGRATED-IMPLEMENTATION-BRIEF.md) supersedes the commissioning recommendation and the two questions at the end; preserve the original study as comparative evidence. No code or deployment is authorised by this banner.

**Status: proposed low-fidelity interaction design, not an implemented UI, tested usability outcome, schema decision, or Workbench commission.** Central issue [#51](https://github.com/frekland/Minamo/issues/51). Design authority: [owner decision](../PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md); [first-hand owner feedback](../ux/2026-11-01-owner-firsthand-ux-feedback.md). Evidence/rehearsal: [companion ledger and regression cases](2026-11-01-contextual-study-evidence-and-test-oracles.md). Builds on [PR #76](https://github.com/frekland/Minamo/pull/76), not a replacement for its independent audit and three appendices.

## Verdict before design detail

**Conditional preference: B's task-first *entry and context return*, built with A's repaired existing Reader/Notes/Practice, but not B's extra worktable or persistent intent object.** A field log remains the lower-complexity control. B has a plausible advantage for conflicting multi-source work and can make Projects guidance rather than a workflow prerequisite; neither advantage has been measured in a real learner task. The two known route/discovery defects are independent prerequisites under A or B. If task-first B cannot beat A on the actual return and Article workflows without increasing capture cost, choose A and stop.

**Exactly two conditions:**
- **A — Repaired existing Minamo.** Keep Home, Projects, Library/Reader, Practice, Your work/Notes and GPT handoff. Repair the known Step-return and Activity-discovery routes *conceptually* and introduce a provenance-safe, bounded “Since you were here” view in the relevant Project/Question. Repairs are hypothetical.
- **B — Contextual learning hybrid.** One global capture action; the currently opened **task or source** is the context, not a required Project. A compact, source-attributed “Continue here” selection can be entered directly from recent work. The learner may explicitly choose/revise a *view focus* without creating an Inquiry entity. Related Note, Article, Activity and optional Compare selected evidence all point at canonical records. Projects/Stages remain optional guidance. No autonomous persisted interpretation.

The field-log floor, common to both: **Capture → dated Note; later search/recent list → open Note; optional source/link and return.** No classification, extra screens, status vocabulary or GPT request is required to finish T1/T3. Any additional affordance must make T2 or T4 easier enough to justify its existence.

### Interaction grammar (proposals, not data model)

1. **Capture** = existing Note save. It may carry an optional exact origin receipt (source family/id, current or retained rendition, section/part/UTF-16 span; originating task and return path where authorised). No Project selection or forced link. When context absent, Note is unlinked *by choice*, still searchable.
2. **Work context** = transient visible place (current Note/Article/Activity/Question, optional task/Stage and return breadcrumb). This is not a factual learner intention. A link choice may become a canonical relation only through explicit learner action.
3. **Continue candidate** = read-only sourced claim from selected eligible Notes/Activity/Attempts/checkpoints and their exact revisions. It says “recorded,” “learner reports,” “inferred; review,” or “unknown,” never automatically “done.” Several candidates can coexist.
4. **Confirm/edit intention** = an *explicit* learner-written Note or supported existing edit, with revision-safe save/readback. A temporary focus choice only changes display; it does not create a learning record.
5. **Evidence comparison** = optional temporary selection of two or more canonical source references, shown as a linear list on mobile; no copying into board cards, no automatic backlink or persistent “current concern.” “Close compare” returns to previous reading/task.
6. **Guidance** = Project/Stage or Activity suggestions offered when relevant, dismissible/skip-able. Authored curricula remain findable; navigating a Stage never proves progress.

## T1 — Unplanned Note; zero Project decisions

Scenario: in the middle of another activity, the learner thinks “The explanation I gave for why birds sing may confuse territorial calls with mate attraction.” There is no Project. Save before deciding what the thought belongs to.

| Step | A — repaired Minamo | B — contextual hybrid |
| --- | --- | --- |
| First surface | Existing global floating **Notes / New Note**, wherever currently browsing. No Project dropdown required. | Persistent compact **Capture** action (on mobile a labelled action rather than a hidden gesture); selecting it opens the same real Note editor, with current origin if one exists. |
| Learner action | Tap New Note → type sentence → save. Optional “Link later” remains silent. Existing Notes/recent search returns this Note. | Tap Capture → type sentence → save. A nonblocking line says **No source attached · Connect later**. Dismiss it. No dialog, tag, Inbox triage or Inquiry title. |
| Source and connection | Unlinked Note remains valid. If saved while reading an Article, explicit context chip can later be accepted/discarded. | Note has **From: none** here. Later “Connect to…” can search a Note, Question, Article or Project; selecting a candidate shows exact target and whether this is a suggested/explicit link; only **Connect** writes a relation. |
| Resume after interruption | Recent Notes → note; no summary required. | Recent → note, or return to origin if one was captured. May display “related topic suggested”; never silently adopt it. |
| GPT boundary | On explicit selected Note handoff, GPT proposes whether it belongs to a topic; not saved. | Same; suggestion appears beside original Note and one deliberate **Review link** action; no hidden AI-generated Inquiry. |
| Failure cost | Existing Your work may remain disconnected from later reading; user has to search. | An extra “Where does this belong?” prompt at save time would make B **worse** than field log. A pile of accepted suggestions can become maintenance debt. |

**Low-fi first screen B (not a mock of deployed UI):** “New Note” → editable text field → “Save” as primary; beneath it “Source: none (optional)” and “Connect later.” Saving completes without any of those extras. Do not add a “What are you working on?” gate.

**Mobile/keyboard:** one visible primary action; Ctrl/keyboard navigation to New Note, descriptive field label, Save reachable in tab order; no hover-only attachment. A screen reader must announce saved/unsaved state. On a leave with unsaved text, both versions must expose truthful draft retention/leave semantics; do not assume existing autosave proves it.

## T2 — Mood return: later intent versus older checkpoint

Two *different* registered Mood histories are relevant, not one silently merged timeline:
- **Legacy Mood K** in [PR #75 ledger](2026-11-01-connected-episode-ledger-and-divergent-interactions.md): newer privacy/v7 Note versus older S03/H v6 checkpoint; v7 reload remains unverified.
- **Documentation-sceptic K** read directly in the [companion rehearsal](2026-11-01-contextual-study-evidence-and-test-oracles.md): Question-linked revised provider Note rev 3 and a later return Note rev 1, while an older provider Stage checkpoint points to an offline adapter. Public API documentation does **not** establish eligibility or actual authenticated response.

Task: resume after ten days, inspect what was actually written, select one useful next action and avoid treating an outdated checkpoint as live truth.

### A — repaired existing Minamo

1. **First:** Project heading and authored Steps remain prominent. Beneath current Stage, a *bounded* “Since the earlier checkpoint” strip says: “Newer Note: proposed v7 opt-in/clear test (reported, not run). Older checkpoint: v6 digest/browser check. More linked work may exist.” Each line carries date, Note revision and a **Read source** link.
2. Learner clicks newer Note; reads full words; **Back to Stage** still works even after a linked Question detour. Learner opens older checkpoint to check its precise scope and time.
3. Learner chooses **Open v7 Note** or **Open v6 checkpoint**. “Use this next” is an optional view selection; no automatic saved current goal.
4. If they type “Next: disable Remember labels, reload and compare,” it saves as an explicit Note or supported existing action. Save receipt/readback required; if no save, the proposed next action is merely a draft.
5. If Question traversal is partial, strip says **More connected work may be missing**; it cannot say “Your next task is X.”
6. GPT may compare *selected sources* and propose one browser test, labelling it a suggestion. It cannot assert completed v7 testing or overwrite the checkpoint.

**Cost:** learner enters via Project hierarchy and may still hunt a relevant Stage among five. Every Stage acquiring a “Since” strip risks dashboard proliferation. If the learner’s concern crosses Projects, A's bounded Project framing remains a substantial weakness.

### B — contextual hybrid

1. **First:** quiet **Continue** list of recent *authored* work, not a Project tile or generated project status. Example item: “Mood-to-Music · last linked writing: provider/privacy question · 2 newer Note sources; older checkpoint available · coverage partial.” Touching it opens the actual working source and a compact **What differs?** rail, not a new Workbench.
2. **What differs?** displays two *separate candidates*, e.g. “Try disabled Remember-label reload — later learner Note rev 2, unverified” and “Verify v6 source/digest — earlier checkpoint; historically saved.” Both have **Read original**. For the documentation-sceptic variant, it instead contrasts Note rev 3 “verify one narrow eligibility claim” with the older offline-adapter checkpoint; do not import privacy-v7 facts into that variant.
3. Learner selects “Examine later Note” → sees its exact edition. An optional **Focus on this for now** only pins a temporary *view* chip. If they choose **Record as next intention**, the app presents editable wording, target/source and explicit Save; absence of this choice leaves both candidates.
4. **Continue work** opens the Note/Article/Activity actually selected. “Project guidance” reveals the relevant authored Step if desired; it never forces Step 4 as the only next action.
5. **Compare** is initially absent, or a quiet “Compare two sources” action when multiple sources are visible. Selecting later Note + checkpoint shows their exact dates/authority, missing tests and a button back to the original working source. No auto-arranged canvas.
6. If the bounded read misses related work, banner **Checked linked Notes and checkpoint up to [as-of]; other paths or records may be missing** with **Inspect more**. Never “all caught up,” “misconception resolved,” or “you completed Stage 4.”

**Cost/rejection:** the Continue list itself can become a distracting dashboard and misleading “last seen” tracker; source update time is not last user interaction. A dynamic selection might be slower than simply opening the most recent Note. Reject B if it introduces mandatory intent categorisation or cannot expose the competing originals in one further action.

## T3 — sparse Cap, provisional Plant, and an unstructured non-technical case

**Cap K, current observed sources:** the restart Note rev 1 asks for a newly authorised instance before commands; the expired-tab Note rev 1 is a learner belief, not confirmed platform status; the older sparse Note rev 3 revises a mistaken inference. There is no checkpoint or verified flag.

**Plant K, current observed sources:** return Note rev 1 asks for one bench measurement; raw-series Note rev 3 concedes synthetic CSV and deterministic state checks, not physical calibration; an older “15%” was a wish, not an accuracy claim. No checkpoint.

**Additional control case (scenario only; NOT a stored fixture):** after reading about seasonal birdsong, a learner writes two free Notes separated by three weeks, changes a hypothesis and has never created a Project. This tests ordinary non-technical knowledge exploration without a Project or checkpoint.

| Learner action | A — repaired Minamo | B — contextual hybrid |
| --- | --- | --- |
| First | Cap or Plant Project/Stage with “Recent authored work — no saved checkpoint”; for birdsong, Your work → search by Note text/date. | Recent work source-first; Cap restart Note/Plant revised Note available without Stage; birdsong shows two dated Notes with **No Project** as neutral information, not a missing field. |
| Resume Cap | Click latest restart Note → inspect older unverified claim → return to Stage/Question; choose to ask which lab instance is currently permitted. | Open restart Note → **Context: interrupted instance** with link to old-address Note, clearly labelled belief; **Ask me for current instance** is shown as *authored intention*, not already authorised target. |
| Resume Plant | Click revised raw-series Note from Stage → find old first-parts Note and Activity if any; make a fresh measurement Note. | Open raw-series Note → see “synthetic model only” and linked older 15% wish. **New Note from this** copies *source receipt*, not fictional sensor data. |
| Resume birdsong | Search Notes by bird topic; second Note appears with date; make third independent Note. | Same two dated Notes first. Optional “Compare what changed?” opens two original Note editions; zero Stage and no invented Project or misconception score. |
| GPT | Suggests a safe observation on selected sources, but cannot infer instance validity/hardware calibration or a confirmed corrected belief. | Same, with explicit **Suggested, not saved** and exact source references. Learner can decline without losing context. |

**Unknown state is a feature:** No recorded hardware evidence ≠ no physical test ever; no saved checkpoint ≠ no learning; old instance inaccessible ≠ confirmed expiry; revised belief ≠ verified understanding. If a source relation is omitted, say “not found in the checked paths,” not “does not exist.”

**Mobile/keyboard:** Cap's useful action must be visible without expanding Stage map; Plant's two-source comparison must be an ordered, non-draggable list with source titles, date and buttons. Birdsongs can be completed with just opening/saving Notes. The source selection must be reversible without losing unsaved writing.

**Failure:** B loses if its contextual rail is longer than the actual sparse Note, if every alternative becomes a pinned focus, or if it prompts for a Project on a non-technical idea. A loses sufficiency if fixing two route bugs still makes Cap work subordinate to a fictional Stage rather than the current authorised observation.

## T4 — Article passage → its Activity → Note → exact original passage and task

Precondition: an eligible Article A edition e1 at section s, part p, UTF-16 span a–b; an authored Activity X with source relation to **A e1**; optional originating Question/Stage Q/S. A newer e2 may appear while the learner works. This is a design test scenario, not an executed end-to-end pass. Existing live evidence: an Activity relation exists but is hidden beneath collapsed **Your work** and labelled **Tool**; the legacy destination still opens Studio.

### A — repaired existing Minamo

1. In Library Reader at A e1/s/p, a **named “Activity: practise this article”** entry is visible near the reader task area (not only the footer). Zero eligible Activities means no false action; many means a list with distinctive names.
2. Learner selects Activity X; Studio displays its canonical source label **Article A · edition e1** and visible **Return to passage** action.
3. Learner opens **Note on this activity**; the editor shows “From Activity X / Article A e1 passage s/p” as *pending attached context*, separable from a manually confirmed canonical relation. Learner writes a tentative observation, saves, and sees the Note revision receipt.
4. Back from Note → X → **Return to A e1/s/p**; if initiated from Q/S, a separate **Back to originating question/step** remains reachable. Use native links, not only local component state.
5. If e2 superseded e1, show “Reading edition e1 · newer edition available”; offer open e2 explicitly without silently remapping span offsets. If e1 no longer permitted, show a safe “source edition unavailable” plus permitted fallback; never show leaked title/excerpt.
6. GPT can draft questions from the selected exact passage and saved Note; no background read of all Library, no implicit Activity pass.

**Cost:** bolting another button onto every Reader may clutter, and source↔Activity context may still feel separate from writing. But this path uses existing Reader, Note, Studio and return logic.

### B — contextual hybrid

1. In Reader the same visible **Practice this passage** action appears. A small “Working from [Article e1 / passage]” receipt remains in the context line.
2. Learner starts X from this passage. The context line becomes **Article A e1/s/p → Activity X**, with **Back to passage** always visible. If arriving from Q/S, a secondary breadcrumb to Q/S exists.
3. During Activity, **Capture thinking** opens Notes in place (drawer on wide view, full-screen on mobile). Learner writes a prediction/observation; origin receipt lists both X and A e1/s/p, and **Save Note** is one deliberate action. Source connection can be accepted or left as a local return receipt; do not silently create canonical links.
4. **Return to passage** closes the Note/Activity context and lands at A e1/s/p. The original Q/S origin is still a separate action. Optionally “Review evidence” opens selected Note next to A e1 *only if requested*; no board required to finish task.
5. Multiple eligible Activities show a compact choose-one action; none shows the current Article uninterrupted. On permission/edition drift, show a rights-safe explanation and fallback rather than an approximate silently substituted paragraph.
6. GPT suggestion appears only on explicit source selection, with source and revision; cannot save a mark/Attempt/Note without learner review.

**Key difference:** A locates affordances on existing separate pages; B carries a *single clear working origin* through reading, practice and writing. Both must pass the exact same route tests. If B needs a new workspace panel or persistent session object for this, it has not justified its complexity.

### Return-stack and draft edge cases for both

- **New tab / copied URL / reload:** URL or shareable return receipt includes authorised task origin and exact edition/anchor where feasible; no new-tab dependence on transient React state. A cold direct link without origin must not fabricate “Back to Stage.”
- **Browser Back/Forward:** nested source and activity histories remain intelligible, with visible return labels, focus restored to semantic heading/action. A source button must not overwrite browser history unexpectedly.
- **Unsaved Note:** cancelling leave returns to draft; confirming leave either retains a known local draft or explicitly discards it. No surprise auto-save and no unacknowledged loss.
- **Multiple source/Project relations:** return to where this task started, not whichever Project has the strongest lexical match. A Note linked to two Questions may still have one route origin for this navigation.
- **Mobile:** no mandatory side-by-side panels. “Return to passage,” “Save Note” and “Activity” are labelled, touch-sized, visible in linear reading order. A two-item comparison is a vertical list.
- **Keyboard/screen reader:** semantic links and buttons with precise names, focus after route, announcements for expanded choices and unavailable editions, no canvas drag/drop requirement.

## Decision comparison, not simulated usability scores

| Test dimension | Field-log floor | A repaired Minamo | B contextual hybrid | Real owner discriminator |
| --- | --- | --- | --- | --- |
| T1 capture actions before useful writing | Capture + type | Same existing Note path | Must be same; no added decision | If B asks for intent/Project, reject. |
| T2 competing intentions | Open several dated entries | Project “since” strip + sources | Source-first Continue + competing candidates | Which gets to original source and a useful next check with fewer detours? |
| T3 sparse/no Project | Natural chronology | Can retain Stage bias | Can bypass Project entirely | Is guidance truly optional rather than cosmetic? |
| T4 Article–Activity roundtrip | Requires Activity link repair | Source entry + exact return | Same plus continuous working origin | Does B actually reduce context loss beyond A? |
| Multi-source tension | Manual reopen | Per-record links | Optional source comparison | Is selection/compare worth extra work on real dense history? |
| Additional persistent state | None | Not assumed | **None by default** | Require evidence before adding Inquiry/CurrentConcern. |
| New UI cost | Low | Low/medium | Medium unless kept very small | Reject if more chrome than actual learning work. |

**No task completion time, satisfaction, assistive success or proposed UI pass was measured.** These are low-fidelity scripts. The only browser interaction in this study reopened the currently deployed synthetic Mood Project and observed its Steps as the primary visible content; it did not replay the multi-hop routes or mutate Notes. The [companion evidence](2026-11-01-contextual-study-evidence-and-test-oracles.md) and older audit distinguish recorded live failures from unrun tests.

### Narrow prior-art resolution

[Zotero's official reader documentation](https://www.zotero.org/support/pdf_reader) was directly re-read in this study: annotations added to Notes include source links/citations, and **Show on Page** returns to the PDF page *when supported*. This is **documentation evidence, not hands-on UX acceptance**. Its useful transferable interaction is a visible, exact *source → thinking → source* action; its limitations warn against promising perfect return after edition/reader change. No additional competitor survey was performed.

## Recommendations, assumptions and stop conditions

1. **Commission neither Workbench nor new schema now.** Repair/exact-test N01 and A01 as shared prerequisites later; use existing contextual href, reading positions and Activity provenance first.
2. **Keep Notes first-class and quiet.** Unlinked Note is successful, not incomplete; connection suggestion only when task-relevant, never mandatory.
3. **Design one source-linked Continue candidate, not a five-panel dashboard.** Show one or two recent *records*, explicit rival intentions and “coverage incomplete”; original sources always open. Do not call it GPT memory.
4. **Prefer temporary view focus; keep persisted intent as explicit learner writing.** Avoid a new Inquiry, Episode or CurrentConcern table unless evidence shows existing Notes and explicit relationships cannot represent a chosen intention.
5. **Use optional evidence comparison only for real contradictions or multiple sources.** Default to a vertical linked list; make an arranged worktable earn its extra selection/persistence/accessibility cost.
6. **Project/Stage as guidance, not owner of thought.** Still useful for authored sequences and novice structure, but no “current Stage” can overrule a later Note or require Project membership.
7. **Treat source, rights and uncertainty as interaction elements.** An exact reading receipt should be understandable to learners (“Article edition from 1 Nov” with inspectable details), not a wall of hashes. Permission and partial reads must degrade safely.

**Reject B** if (i) T1 requires more decisions than a plain Note, (ii) task-first Continue requires inferred permanent state or falsely claims complete retrieval, (iii) T4 is no faster/clearer than A after the common repairs, (iv) mobile and keyboard require manual arrangement, or (v) a new focus tool becomes a second Project administration chore. **Reject A as sufficient** if the same four task paths remain Project/Stage-dependent and still fragment learning after deterministic route fixes. **Reject an evidence board** if the learner spends more time selecting/arranging sources than reading or practising.

### Smallest useful future functional vertical slice — **proposal only**

**One authenticated Article → authored Activity → Note → exact Article edition/passage and originating task return**, plus a read-only *one-card* source-origin indication when reopening that Note. Use current canonical Note, Activity and Reader records and explicit save/readback. Test zero/one/multiple Activity, editions, permissions, browser new-tab/reload/history, dirty drafts, mobile/keyboard, and a deliberately unlinked Note control. No invented current-intention model, no cross-source board, no automated GPT write. Separate owner authorisation required for any code, synthetic fixture extension, real persisted test, Sites source parity/release or deployment.

Why this first: it addresses a reproduced discoverability/return break at a concrete learning action, exercises true persistence/relationship/rights invariants, and discriminates B's continuous context from A's repaired navigation. A subsequent *read-only* conflicting-Note return slice should be considered only if this source loop is usable.

## Two owner judgments after reading the flows

1. **When returning to Mood:** would you open **A: the Project Stage with a dated “since checkpoint” strip**, or **B: the most recent Note with two competing intention/source links and Project guidance tucked behind an optional action**? The actual choice is between *first actions*, not dashboard styles.
2. **When reading an Article:** is **A: a visible Activity link and a reliable “Back to passage”** sufficient, or does **B: a continuously visible Article → Activity → Note origin line** materially help you think without adding clutter?

If A answers both, shrink the hybrid to baseline repairs + optional Note context. If B wins one, build and test only that interaction, not an entire Workbench.

## Fresh-chat handoff

Use current main and [AGENTS.md](../../AGENTS.md), owner decision, this study and companion ledger; inspect the linked regression specification. Owner choice above remains open. **Do not reopen broad PR audits, implement a full Workbench, infer a persistent current concern, mutate fixtures/records or deploy.** Next permitted work: refine these low-fidelity scenarios or inspect them read-only; next *implementation* only after explicit owner commission, focused failing test plan and public/Sites source-parity gate.