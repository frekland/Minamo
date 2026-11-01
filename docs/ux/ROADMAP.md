# Minamo UX improvement roadmap — evidence-led, not implementation authorisation

> **Design direction superseded 1 November 2026:** For Project/Workbench scope and commissioning, use [the broadened product-design discovery decision](../PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md). The individual reproduced bugs and assurance tasks below remain valid where current; the proposed single Project-current-state slice is **not** the predetermined next product design. D1–D3 broader activity/prior-art/owner discovery now precedes a selected implementation slice.


**Decision input, 31 October 2026.** Use with [live audit](2026-10-31-LIVE-AUDIT.md), [register](REGISTER.md), [V70/V72 crosswalk](V70-V72-CROSSWALK.md) and the enduring [learner-experience strategy](../LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md). This document proposes **what to validate and in what order**. It does **not** authorise a new schema, product redesign, production release, real-data experimentation, Site fixture reset or automatic visual-agent deployment.

## Priority order and why

| Order | Work cluster | Evidence and proposed boundary | Acceptance before “done” |
| --- | --- | --- | --- |
| **A. Small, high-confidence correction** | Search-close state/history integrity — UX-LIVE-01 | Reproduced twice; one focused navigation/focus fix; preserve result search | Mounted Article→search→Close/Escape→Article URL and content agree; Back/Forward and reload agree; hosted smoke retest. |
| **B. Small interaction/content corrections** | Flags empty CTA (05), beginner furigana (04), duplicate Library entry (06), related metadata disclosure (07) | Current visible concerns; solve independently in small reviewed PRs, language-review all ruby | Type-appropriate empty states, accurate N5 readings without romaji, native keyboard/touch links, precise anchors preserved; compare scan/accessibility. |
| **C. Core product experiment** | Project current-state projection (02) with Question chronology hierarchy (03) | Highest owner-reported value, but requires a comparative learner task; not solved by a bigger payload alone | Same versioned synthetic K Project, cold return tasks, evidence/provenance/uncertainty, drill-down/back, responsive 320/390 and desktop; owner judgment and traceable results. |
| **D. Assurance closure** | 320px cross-space prompt, Activity 503 draft-retention assertion, recoverable Notes/keyboard/IME/physical mobile | Old V72 issues and untested V86 paths; no claim they currently fail | Isolated synthetic failure tests, exact draft-value assertions, keyboard/focus/zoom/device task matrix; owner/private data isolated. |

These can overlap in development, but the **strategic experiment should not be specified as a UI implementation until the comparison task and desired information model are agreed**. It is fine to fix the high-confidence search issue independently.

## Proposed integrated Project slice (research specification only)

Use the existing **TEST ONLY Mood-to-Music** state at a versioned late phase; do not advance/reset it during documentation work. Offer a *projection* from existing committed records, not a mandatory new kind of Note/Session/score:

1. **Where I am:** one concise current question/direction and explicit “as of” state, not a checklist masquerading as progress.
2. **What changed:** a few pivotal decisions including abandoned objective scoring and new personal labels; attribute to exact earlier/later editions and mark unverified claims.
3. **What supports it:** relevant original Note/code/Activity/Library passage and provenance; no fabricated external provider evidence, no conflation of reported v5/v6/v7 behaviour with verified execution.
4. **What is uncertain:** one or two open questions and potential next checks.
5. **Continue:** a clear next action and one-click return to the Project position after opening evidence, writing, or talking with GPT.

Possible map/timeline/current-state cards are candidate layouts for comparison, **not decisions**. The product strategy explicitly cautions that an activity feed, graph or checkpoint card alone is insufficient. Start from the owner-observed questions and compare at least one alternative interaction with the existing linear Project view.

### Suggested task-based acceptance matrix

| Task | Starting state | Evidence to record | Pass condition |
| --- | --- | --- | --- |
| “You have returned after ten days. What is the current direction?” | Cold Project landing, K phase | First meaningful view, selected evidence, time/backtracking if measured | Learner identifies personal-label direction without treating the old objective mood premise as current. |
| “What changed, and why?” | Same Project | Prior/current editions, distinction between reported and verified | Can identify at least one abandoned hypothesis, relevant saved supporting text, uncertainty. |
| “The refresh report changed; what actually happened?” | Project→Question | Exact S03/H and later v7-related Note provenance | Separates old checkpoint from new saved report; does not assert a test result that was not observed. |
| “Open the original passage and return to where you were.” | Project/Question evidence | Source/anchor and return route | Exact original edition and relevant passage accessible; return preserves position/context. |
| “Continue with an actionable next experiment.” | Current Project | Clear next step, optional GPT context contract | Learner knows what they can do now; no invented save/score/progress. |

For each, record objective task completion, navigation choices and confidence of observation separately from the reviewer's design opinion. Use actual learner evaluation for strong comprehension claims. A simulated persona’s experience is a proxy, not emotional evidence.

## Verification and publishing gates

- **Source/provenance:** Pin public change SHA, native Sites transfer SHA, published version and hosted browser acceptance separately. GitHub merge is not a Site deployment.
- **Scope:** Keep TEST ONLY fixture and any isolated disposable test store distinct from real owner learning. Use read-only exploration for production until separately authorised.
- **Accessibility:** At least 320/390/768/1280 CSS plus keyboard-only, screen reader, zoom/contrast and actual touch where available; record untested platforms honestly.
- **Persistence:** Verify Notes and Activity draft exact values across the controlled 503/reload/conflict cases, with synthetic content and safe failure injection only.
- **Regression:** Link an issue/PR to current UX-LIVE ID and acceptance, then update the register after deployment. A reported fix, a unit test or a screen screenshot by itself is not a hosted verification.
- **Privacy:** Sanitise screenshots/URLs and do not publish any genuine Note content, owner identity, logs, tokens or private record identifiers.
- **Historical trail:** Preserve all 60 V70 IDs and the 5 deliberate deferrals; close or reclassify only from explicit new evidence.

## Non-goals

No redesign-by-decree, no mandatory status taxonomy, no “AI understands it so Site is done” shortcut, no implicit automatic saves, no fabricated learning scores, no initial requirement for a new Project schema or external SaaS, no assumption that the optional visual runner in [#18](https://github.com/frekland/Minamo/issues/18) is the next commissioned deliverable.
