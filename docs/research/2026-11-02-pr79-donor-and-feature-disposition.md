# PR79 learner-first implementation checkpoint: donor boundary and feature disposition

**2 November 2026 · engineering evidence, not owner UX acceptance or release authority.**

## Source and donor boundary (D9)

- Public main at PR79 base: `e381ae24d0a5c9bf021f658ccb5fc7e8ff4613e9`.
- Historical PR78 donor head inspected: `3fc0a82fc5799e7325d750864956624742158f54` (`docs/contextual-implementation-blueprint`).
- PR79 application work started from its own docs-only head `1dea844`, not from PR78's application tree; the first remote code checkpoint is `5c249c3a583e7f4a94780ab0a373c9d00fe78866`. Existing PR79's binding learner-first documents and AGENTS direction are retained.
- **No #78 donor file or shell has been copied.** PR78's `app/working-context.tsx`, `app/learning-home.tsx`, `app/continuity-gpt-handoff.tsx`, `app/continuity-sources.tsx`, `app/view-origin-return.tsx`, `app/journey-route.tsx`, `lib/working-context-read.ts` and `lib/continuity-evidence.ts` are not new Study imports. Consequently their PR78-only type (`SelectedContextRef`), CSS, endpoints and test dependencies are **not transplanted**. A future donor must receive an exact transitive import/type/test inventory before use.
- Instead `app/study/study-app.tsx` composes current-tree `Reader` content, the existing `NotesPanel` save coordinator in an inline presentation, and an exported `StudyActivityTask` projection of the actual Activity engine. It does not render full `JourneyRoute`, `LearningHome`, `WorkingContextHost` or the old Activity Studio wrapper. `lib/study/read.ts` composes existing rights-checked canonical `readContext` and `getLearningContext`, rather than copying PR78 continuity projections.
- Current-tree generation-scoped requests, Note CAS/revision conflict, accepted RecordLinks, retained rendition/rights admission and D1 operation receipt mechanisms remain the authorities. New projectless GPT updates add a single guarded original Note + Development transaction; they do not rewrite an old Note or silently reinterpret an entire Work.

## Feature disposition (before any old-UI retirement)

| Learner capability | PR79 disposition | Evidence and outstanding proof |
| --- | --- | --- |
| Rich Article explanation, sections, text/code/diagrams and passage selection | **Reuse content engine** — current `Reader`, canonical retained reading target | Study server-rendered explanation and exact query links tested; real browser selection/diagram parity still needs owner episode |
| Notes rich text, attachments, image/video/terminal blocks | **Reuse coordinator**, inline NotesPanel, no second save engine | Current Note flights/autosave/CAS retained; source-chip freeze/removal unit tested; mobile/IME and all media flows not yet re-proven |
| Actual authored Activity, prediction, task, Attempt, Run/file evidence | **Reuse content engine** — `StudyActivityTask` and existing `ActivitySession` | Task-first Study SSR tested; authenticated attempt/Run and file-return episode still needed |
| Flags, annotations, exact source and return | **Reuse existing Reader primitives** | ReadingTarget/rendition/passage/capture routes tested; browser exact-return and source-revocation race remain |
| Retained revisions, source excerpt rights, private owner isolation | **Reuse existing domain admission**, extend exact claim-correction checks | Foreign/stale/unavailable claim anchors denied; revoked original redacts precise quotation; full three-mode source exercise pending |
| Find across personal Notes, Articles, Activities, Questions, Work | **Study replacement query UI** over server canonical search | Default synthetic/old-Journey filtering, cursor invariants and SSR tested; match relevance/body snippets and real owner corpus need checking |
| Optional Stage-free Work and meaningful return | **New Work identity and source-first projection** | Explicit 1/2-hop links, multiple attributed actions, claim reasons, original-first orientation, read-only Note comparison; late-link messy owner return pending |
| Legacy Journey and old exact routes | **Compatibility-only** for old identity; current Reader renders original text in Study and an explicit new-Work preview | Cursor/filter and direct-link regression tested; bounded Note-choice adoption leaves Journey/Notes revisions unchanged; messy authentic adoption and older external routes require browser verification |
| Japanese ruby, Chinese, language input and audio | **Reuse Reader/Activity**, no language-specific replacement | Renderer inherited; authentic mobile composition, furigana/audio/practice parity not verified |
| Learning-space selection, preferences, legacy visibility | **Reuse settings codec**, add Study legacy toggle | Server pagination and preference tests; narrow Settings layout/space switching needs browser test |
| Trash, private recovery, other device | **Reuse canonical persistence/recovery** | v2 Notes, Developments, exact correction anchors exported, staged and reactivated in disposable integration; actual Android interrupted draft/return unverified |
| Keyboard, screen reader, mobile layout | **Study CSS and native links**, retained content controls | SSR headings, labels and responsive rules; keyboard focus, IME and screen-reader owner test pending |
| Connected GPT/MCP reads and explicit writes | **Preserve old tools**; add projectless `record_minamo_learning_update` | Fresh independent target reads, idempotent replay, rollback and MCP tool call tested; unscripted real connected GPT episode not yet owner-verified |
| Site-only semantic *Record a change* | **Not accepted/complete** | Ordinary rich Note save works; a claim-aware optional semantic capture integrated with the same editor/receipt is still missing — do not substitute a second disconnected form |

## Cutover and rollback boundary

`/?view=study` is opt-in. The old default route and existing older Journey links are retained; no migration, old-record rewrite, owner-data cleanup, or deployment occurred. Removing that opt-in entry reverts UI exposure without a data migration; new `work` and v2 Development rows require the existing compatible server until individually archived. Do not switch the default route, deploy, merge PR79 or claim product acceptance on the basis of this checkpoint.

Remaining product blockers include: a real owner trial of content → task → Note → exact return, full Notes media/IME/mobile parity, a useful sparse and contradictory Work return, in-Site optional change recording through the established coordinator, the authentic older-Journey adoption episode with many late Notes, independent natural GPT fresh-chat exercise, comprehensive source-rights/race testing and owner judgement versus V95. C1–C7, L1–L5, M1–M5 and UX-N01–N29 remain binding.
