# Minamo V89 — E1–E6 live integrated acceptance ledger

**1 November 2026 · production Cloud Browser and isolated-D1 negative controls · not a blanket acceptance verdict.**

## Release and scope

- Deployed URL: <https://minamo.jscymru.chatgpt.site>.
- Sites project `appgprj_6ad8a4e85eb48191accd6e78976b47e3`, saved version V89 `appgver_9a00865bf15481919b6e38edd6f8d3cc`, successful deployment `appgdep_6ae78bcf6df88191ba65960897a23474`, native release `d8cfcca8b1fbf0be646a69a1794dd6caeb649e25`.
- Baseline and native test/build/release inventory: [V89 release receipt](2026-11-01-sites-v89-contextual-learning.md). This ledger extends the earlier *read-only* smoke after the owner's instruction to **run E1–E6**. A real authenticated Cloud Browser was used at desktop 1363 × 936; local negative controls used isolated D1. The public draft PR #78 is **not merged**.
- Existing learner fixtures, access policy, external invitation, Notes and authored learning material were **not modified**. Two new, clearly labelled synthetic test Notes were created; the E4 test Note was updated to revision 2. Both remain in the hosted workspace and were not trashed.

## Verdict matrix

| Gate | Outcome | Observation and remaining boundary |
| --- | --- | --- |
| **E1 — standalone Note** | **PASS for required live mechanics** | Home → Notes → New/Blank Note, no Project selected; created, saved revision 1; closed editor tab without deletion; searched Your Work, reopened exact rendition, same body. Result was **Unlinked**. The optional later explicit link was not attempted. |
| **E2 — Mood K return** | **PASS for tested scenario mechanics; owner usefulness not signed off** | Synthetic Mood Project showed separately dated newer Notes, older Stage checkpoint, conflicting historical versions and partial coverage. A subsequent bounded page revealed evidence the first page did not show. Exact Note source/read/Project return worked. Prepared an *optional* selected-source GPT request without launching GPT or writing a record. No unverified v7 execution was asserted. |
| **E3 — Cap and Plant K** | **PASS for tested scenario mechanics** | Both Projects surfaced newer authored Notes ahead of Steps despite no saved checkpoints. Cap retained sparse lab uncertainty rather than claiming a flag; Plant distinguished synthetic/deterministic readings from unverified physical calibration. Coverage warnings stayed visible. |
| **E4 — Article/Activity/Note/return** | **PARTIAL PASS** | Source-qualified N4 Article → linked Activity worked at retained editions. Activity → new Note was Saved r1, source-associated, searchable and exact-reopenable. A subsequent edit followed by immediate Article navigation became Saved r2 and survived reload. Activity → exact Article → original filtered Practice, native Ctrl-click new tab, browser Back/Forward and reload were observed. Original Question/Step/selected Article passage → Activity → Note → same passage as one continuous chain and cross-tab unsaved-edit race were **not** fully replayed. |
| **E5 — mobile/keyboard/assistive** | **PARTIAL; mobile and assistive blocked/unverified** | Browser keyboard Tab moved focus through labelled contextual actions **Flag → Annotate → Note from passage**; observed at 1363 px desktop. No 320 px or 375 px viewport emulation or independent screen-reader/assistive session was available in this Cloud Browser. No narrow/mobile pass is claimed. |
| **E6 — revocation/denial/partial/multi-target** | **PARTIAL; isolated negative controls PASS, hosted destructive/second-principal cases unverified** | Live Project evidence explicitly identified incomplete coverage and offered another bounded read; selected GPT preview named deferred records/details and `lastSeenByGPT: unknown`. A focused isolated-D1 suite verified cross-principal non-disclosure, revoked Question path suppression, retained old editions, denial after source revocation, multi-target Notes, stale item/target cursors and truthfully partial pages. No live permission revocation, second-account login, live source rewrite or concurrent race was performed. |

## Persistent synthetic evidence

**E1 Note:** `TEST ONLY E1 — free Note capture 2026-11-01`.

- Record `note/74851e00-75bd-4bc0-80dd-6422cdf5fc8e`, revision 1; retained rendition `r-059a93d5b8bfb916b33d3c226d819245da212753d5116d3305bb0c683c98a9fa`.
- Exact body included `[E1-20261101-A]` and an ordinary plant-watering reminder marked *synthetic*. No Project was selected or implicitly linked. Your Work showed **Unlinked** and exact text after closing the Notes tab and searching.

**E4 Note:** `TEST ONLY E4 — activity anchored Note 2026-11-01`.

- Record `note/d09a7359-7271-4eab-a1f9-d7e9f666fe7a`, Saved revision 1 initially; retained r1 rendition `r-292c5e2ea277fcfd9e048467d4530a95d73ca686b27084630cb59375d2931b5a`. It reopened at the requested exact title passage with original body `[E4-20261101-A]`.
- The Notes editor said **Created about: N4-16 — N4 bridge — Polite, respectful and humble Japanese — reading**. Your Work included that Activity and related Japanese N4 Project/context in the saved Note result.
- Updated the *same synthetic Note* with `[E4-20261101-FLIGHT]`, immediately navigated Activity → Article, observed **Saved · revision 2**, reloaded, reopened the dock, and verified revision 2 body still contained both markers. This tests navigation during the autosave window, not an arbitrary forced network failure.
- The record is retained intentionally as evidence; no deletion was performed.

**E4 source pair:**

- Japanese N4 Article `article/ms-a22a300dc10e78aeed9437f7eb3f5af439f1d786`, exact retained source edition `r-b907a8994c7b1b050ab83a9cb912748bdb1a6167506124eaaa4024c3e255629c`.
- Linked reading Activity `experiment/jlpt-jp-n4-16-reading-20261027`, edition `r-172873a8f035a25eaa890e3d78be329a32abc4089044e393e09fd7ecc3843753`.
- The Article's *Activities for this Article* section displayed a transient **Checking linked Activities…** state, then populated the N4-16 link labelled **Linked to this source edition · Retained source edition**. Clicking that link and then **Back to source edition** returned an URL pinned to the exact r-b907… Article edition; Back/Forward preserved the exact Activity/Article identities. A Ctrl-click on Activity's source link opened a second real browser tab with the origin/Practice return encoded. Practice returned to `practiceQuery=N4-16`.

## Negative-control suite — separately scoped from hosted acceptance

Executed on the candidate workspace with permission for temporary isolated databases:

```text
node --test tests/contextual-continuity.test.mjs \
  tests/contextual-source-first.test.mjs \
  tests/contextual-source-activities.test.mjs \
  tests/contextual-navigation.test.mjs \
  tests/contextual-note-anchor.test.mjs \
  tests/note-capture-context.test.mjs \
  tests/source-reference-permission.test.mjs \
  tests/source-permission-integration.test.mjs

43 tests; 43 passed; 0 failed; 0 skipped; 16.8 s.
```

These tests exercise isolated simulated principals and fixture mutations; they do **not** alter hosted records or demonstrate live two-account rights transitions. The initial sandboxed run failed before assertions because `/tmp` was read-only (`EROFS` creating temporary fixture directories), was interrupted, and was rerun successfully in the permitted writable test environment. Existing CJS `import.meta` warnings appeared; assertions passed.

## Explicit release gates still open

1. **E4 complete chain:** one live Article e1/p → X → deliberate Note from the exact passage → source e1/p and original Question/Step route; test a genuine delayed/in-flight autosave and an unrelated new-tab path without cross-instance state loss. The synthetic Activity-level Note and navigation legs verified above are narrower.
2. **E5:** actual 320 px and 375 px mobile layouts, keyboard focus/selection/navigation throughout E1–E4, and a separately recorded assistive technology evaluation.
3. **E6:** a second authenticated principal, live source revocation/revised-edition/denied-edge race under controlled fixture authority, and per-record multi-target visibility. Do not change existing production rights/fixtures as a substitute for an isolated environment.
4. Owner's qualitative usefulness judgment for Mood/Cap/Plant and an optional actual GPT continuation (the preview alone is not a conversation-quality pass). Measure real production read latency separately.

**Decision:** V89 is deployed and the principal E1–E3 flows work in the tested browser scenarios; **integrated E1–E6 acceptance is still incomplete**. Do not merge PR #78, widen audience, delete test evidence, mutate existing fixtures or claim an overall E1–E6 PASS on this ledger.
