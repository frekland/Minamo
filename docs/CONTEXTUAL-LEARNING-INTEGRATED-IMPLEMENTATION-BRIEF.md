# Contextual Learning Experience — owner-selected integrated implementation brief

> **Post-V91 supersession notice (1 November 2026):** This document remains the **historical 1B/2A implementation and E1–E6 regression baseline**, not the accepted final learner-experience architecture. A real V91 learner session exposed continuing disconnected Home/Library/Activity/Notes/Projects/Practice flow and old/unpinned Article→Activity discovery gaps. The owner has now selected a substantial contextual workspace model, documented in [the new code blueprint](CONTEXTUAL-WORKSPACE-CODE-BLUEPRINT.md) and the canonical decision. Reuse the successful evidence/navigation/draft/MCP foundations; do not treat the old incremental UI requirements as the ceiling. PR #78 is still draft/unmerged. This notice plans future code; it does not authorise deployment or data/schema mutation.

**Decision recorded 1 November 2026. Status: approved product direction and planning baseline, NOT yet a production-code, schema, fixture-write or deployment commission.** Central tracking: [#51](https://github.com/frekland/Minamo/issues/51). Canonical design authority: [product-design discovery decision](PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md). Evidence and original task comparison: [D3 A/B interaction study](research/2026-11-01-contextual-learning-interaction-study.md) and [exact read-only MCP/regression ledger](research/2026-11-01-contextual-study-evidence-and-test-oracles.md).

## Owner choices and scale

The owner selected:

- **1B — source-first continuation:** open the most relevant recorded work and competing intentions directly. Project/Stage guidance is available when useful, not a compulsory doorway or authority over what is “current.”
- **2A — repaired Article/Activity:** a visible, correctly named Activity action in the existing Reader/Practice flow and reliable exact Article-passage/task return. Do not impose a permanent three-pane context strip or a new Activity worktable.
- **One substantial integrated implementation and deployment for hands-on evaluation**, rather than validating only a tiny Article→Activity→Note slice. This is the *preferred commissioning scope and release strategy*; the actual coding and deployment will be commissioned in a later normal chat. No work on live learner data or Site publication is authorised by this document alone.

Interpret these together: **a capture-first, source-first learning experience with truthful continuity, adaptable guidance and repaired use of existing reader/practice capabilities**, not a Project Workbench with new branding. It must be useful across source, Note, Activity and non-Project work.

## Product outcome, not a predetermined layout

A learner should be able to **capture → work/read/practise → interrupt → return → inspect evidence → choose their own next action**, with Minamo preserving source and navigation context but never impersonating the learner's intent. A source-first “Continue” may be a compact list/entry point, not a dashboard, generated biography or permanent “current concern.”

The implemented design may substantially reorganise Project/Stage entry and information architecture, provided authored content and canonical rights/revision evidence remain intact. Preserve proven capabilities, not the current hierarchy. Reuse the current Note, Question, Article, Activity, Project, source-rendition and relation models before proposing new persisted types.

### Five connected implementation workstreams — one testable experience

| Workstream | Required learner interaction | Scope boundaries and source candidate |
| --- | --- | --- |
| **W1. Truthful source-first Continue** | From Home/recent-work/task context, directly open recent *eligible authored* Note/Question/Activity; when competing intentions exist show dated source-linked choices, older checkpoint and unknown coverage; do not silently choose a “next action.” | Existing read models in lib/project-context.ts, lib/learning-work.ts, GPT context selection and MCP exact target reads. A nontransitive Project direct-related set is **not** complete when relatedTruncated is false. Source/revision receipts, bounded traversal and rights must be explicit. |
| **W2. Capture and connected Notes** | Start a Note anywhere, including no Project; save quickly. Optional origin/connection is visible and reversible; a Note captured during an Activity can be rediscovered from the originating source and returned to exactly. | Existing app/notes-panel.tsx, lib/note-capture-context.ts, local draft and revision-safe save. Do not add mandatory tagging, filing or AI-linked edges; distinguish navigation origin from permanent canonical relationship. |
| **W3. Adaptable Projects/Stages** | A Project offers relevant task guidance, authoring sequence and Resources, but its Stage count or suggested next Step cannot override a later learner Note or gate an unstructured task. Returning to Cap/Plant can start from the Note without a checkpoint. | Existing Project/Stage/Question surfaces remain available. Redesign entry/recent placement and context switching as necessary; preserve authored Stage definitions and no forced conversion to Inquiry/Episode. |
| **W4. Task-sensitive Library/Activity** | Find a relevant Article from current work; Reader visibly identifies eligible linked Activities, named “Activity” for authored Activity origin rather than generic Tool, while retaining appropriate legacy Tool identity. Follow Article e1/p→Activity X→Note N→exact A e1/p and originating Q/S/Practice. | Existing app/reader.tsx, app/learning-links.tsx, lib/practice-index.ts, record-origin labelling, lib/library-return.ts, lib/practice-return.ts and exact UTF-16 anchors. No bulk catalogue rebuild or unrelated authoring. |
| **W5. Working context and GPT control** | A compact, persistent *navigation* return cue across linked detours; clear source receipt and “Back to passage/task.” GPT can compare bounded selected sources and propose corrections/relations/actions, but never silently persist one. Mobile/keyboard paths remain linear and first class. | Reuse app/navigation-context.tsx, lib/project-return-context.ts, lib/layout-workspace.ts, reading positions and existing explicit MCP write/readback. Avoid a persistent CurrentConcern, autonomous summary, or copy of canonical evidence into new cards. |

**W1–W5 are not five separate feature launches.** They describe linked acceptance obligations for a single coherent candidate. They can be developed in reviewable commits/PRs, but acceptance must exercise the whole learner journey and the production release should not claim success from component-only passes.

### First-screen principles

- **Unplanned capture:** New Note text entry is first; context/link is optional and never blocks saving.
- **Return after a gap:** recent *recorded* work is first; multiple competing next intentions can both be seen/opened, with older checkpoint dated and uncertainties explicit. No generated “all caught up.”
- **Project opening:** a way into current work plus optional Stage/map guidance; current nominal Stage is not asserted as learner priority.
- **Article reading:** reading dominates, with an accessible Activity affordance only when authorised/eligible; no per-paragraph controls obscuring text.
- **Practice/Note:** exact Article edition/passage and originating task can be recovered after navigating through multiple linked records; a direct cold link does not invent a return origin.

An optional temporary two-source comparison may be built *only if* W1/W4 demand it to make conflicts intelligible. Default to a simple ordered source list. A persistent evidence board, drag/drop canvas, mandatory focus tag and new schema are **out of scope** absent separately reviewed need.

## Build in three coherent implementation increments, release together

### I. Trust and task navigation foundations

- Pin candidate source and existing Site-native version/configuration; identify public↔native differences before coding/release planning.
- Implement deterministic **read-only continuity candidate** assembly using current authorised Notes, exact Stage/Question relations, checkpoints and Activity/source links. Provide as-of, rights, depth/window/cursor/partial and source rendition; preserve competing candidates and status distinctions.
- Repair native return hrefs through Stage→Question→recent Note→Question and Article/Activity multi-hop. A route context is **view history**, not a permanent learning relation or source of new learner intent.
- Correct authored Activity semantic labelling/discovery from Reader, with zero/one/many/denied/old-edition cases.
- Turn N01–N07, A01–A06 and C-MOOD/C-CAP/C-PLANT etc. from the [unrun specification](research/2026-11-01-contextual-study-evidence-and-test-oracles.md) into actual focused tests once implementation is commissioned. Record red baseline failures, fix, then run green checks.

**Exit I:** source integrity/rights, complete-vs-partial coverage language, native href/return and Activity source resolution demonstrably work in isolated tests. No learner experience PASS yet.

### II. Integrated task-first UI

- Implement chosen **1B** source-first Continue, including a limited “why this surfaced” source receipt and competing suggestions. Do not make a five-panel return dashboard; direct learners into actual Notes/Articles/Activities.
- Integrate no-Project capture, contextual Note return and deliberately confirmed link use.
- Reorganise Project/Stage presentation enough that a learner can resume sparse/changed work without Stage-first selection, while retaining authored guidance.
- Implement chosen **2A** visible Activity action in Reader and robust exact return. No compulsory continuous Article→Activity→Note context chrome; add only minimal return cues that prove necessary.
- Linear 320–375px mobile layouts, focus/keyboard/navigation labels and local draft behaviour; avoid drag/drop and hover-only actions.

**Exit II:** the same four adversarial task scripts can be followed through *one integrated UI* with real canonical save/readback in an expressly authorised isolated environment. Tests of route and persistence do not by themselves establish owner usefulness.

### III. Integrated acceptance and release

- Run typecheck, build, affected targeted and full regression suites on the exact public candidate; isolated native browser/task tests with synthetic fixtures; negative rights, edition drift, CAS/draft and incomplete-read cases.
- Compare **source-first vs repaired baseline** on the same actual tasks. Owner checks whether capture remains effortless, return feels truthful, Projects no longer dictate work and Article→Activity truly stays connected. Do not assign synthetic satisfaction scores.
- Run appropriate registered K-fixture evidence checks for Mood (older checkpoint/competing Note), Cap and Plant (no checkpoint), plus one unstructured/non-technical Note without Project and an Article with eligible authored Activity. Existing Cap/Plant registered snapshots intentionally lack Activity/Attempt: use a separate synthetic Article/Activity fixture for the episode and keep no-Activity controls. Any hosted fixture mutation needs separate authorisation.
- Use [Sites release workflow](SITES-RELEASE-WORKFLOW.md) to reconcile public files with the *current* native Sites Git, preserve private config/assets/identity and D1/R2/MCP bindings, verify native HEAD and exact file manifest, then save/deploy to the existing Site *only under explicit release authorisation*. GitHub merge never equals Site deployment.
- Record the deployed Site version, public/native SHAs, exact tests, exploratory owner results, regressions, residual coverage and rollback candidate. Do not claim 3-layer host-complete observability or independent learner achievement from the synthetic controller.

**Exit III:** accepted *integrated release candidate* plus independently inspected deployed UX. If native divergence, rights, rev/anchor, drafts or targeted regressions fail, halt release. If owner finds the experience still fragmented, revise/revert; passing CI is not product success.

## End-to-end release acceptance contract

| ID | Task and expected observable result | Failure that blocks success |
| --- | --- | --- |
| E1 | Without Project selection, create a Note, save/read back exact revision, close, search/reopen and optionally connect it later. | Forced taxonomy, accidental link creation, lost draft or missing Note. |
| E2 | Resume Mood K: last relevant authored Note and an older Stage checkpoint are both discoverable; original editions, dates and conflicting next actions remain separate; GPT suggestion visibly optional. | Choosing old checkpoint as “current,” merging legacy and documentation-sceptic variants, claiming an unverified v7/API test passed. |
| E3 | Resume Cap and Plant K without checkpoints; show latest Note evidence, open issues and unknowns, not “Start first Step/no progress.” | Root-only omission hidden by relatedTruncated:false; invented lab expiry/flag or physical calibration. |
| E4 | From authored Article e1/p, find linked Activity X, open X, capture Note N and return exactly to A e1/p and original Q/S/Practice; survive native new-tab, Back/Forward, reload and edit interruption. | Activity hidden as Tool, lost origin, silent e2 remap, unexpected save/data loss. |
| E5 | Mobile narrow/keyboard flows through E1–E4 with named actions, predictable focus, no inaccessible hidden-only controls; real assistive check recorded separately. | Desktop-only experience, inaccessible comparison or route actions. |
| E6 | Source revoked/revised, denied edge, partial cursor, multiple Note→Question links: safe unavailable/updated state, truthful coverage, no private leaks or arbitrary task choice. | False completion, private metadata leak, silent changed-source quotation. |

Measure task detours and forced classification decisions, misattributed/omitted evidence, lost return origins, revision/rights errors and actual owner judgments. **Do not preassign numerical UX scores.**

## Risks, cut lines and rollback

- **Source-fidelity risk:** the biggest product risk is confidently joining incomplete or contradictory records. Prefer “I can show two sources; other relevant work may be missing” to a fictional current truth.
- **Interaction cost:** source-first entry can become another dashboard. If the learner has to maintain a separate focus system, shrink it to recent records and optional pinned existing Notes.
- **Navigation vs relationship:** recent context is not a canonical new link; a Note linked to two Questions may have one originating return for the *current* route. Test native links and direct entry.
- **Technical scope:** avoid schema migration unless specific acceptance cannot be met with existing records and transient view context. Any necessary migration gets independent backwards-compatibility, rights and recovery review.
- **Release:** one cohesive candidate does not mean one unreviewable mega-commit. Use a bounded PR stack/branch sequence and integrated pre-deployment gate. Preserve known-good deployed Site/native SHA for rollback; no broad database reset.
- **Cut if needed:** optional evidence board, automatic source suggestions, sophisticated adaptive Stage reordering and AI summarisation. **Do not cut** quick independent capture, uncertainty fidelity, exact source return, right-scoped links or mobile operation.

## Strong-model bounded architecture preflight (optional, recommended)

**Completed technical preflight:** [Source-pinned implementation blueprint](research/2026-11-01-contextual-learning-implementation-blueprint.md). Use its file/function mappings, minimal proposed contracts, dependency/test matrix and protected release/rollback plan for the coding commission. It recommends targeted integration rather than a new persistent learner-state schema or broad rewrite. This is documentation, not implemented behavior or a test pass; the selected 1B/2A direction remains unchanged.

Before starting implementation in normal chat, a strong coding/reasoning model (e.g. Sol 6.1 High) can perform **one bounded, source-pinned, documentation-only technical design review**: map the five workstreams to actual call sites/data contracts; challenge proposed reuse; identify the minimum read-model and route changes; produce a concrete integrated PR/test/deployment sequence and risk/cutline list. This is *not* another taste-based UX study or authority to implement. See [preflight task brief](research/2026-11-01-contextual-implementation-architecture-preflight.md).

The best use of stronger reasoning is **cross-surface integration and negative-case design**—finding where a seemingly local change breaks Note autosave, rights/edition retention, native hrefs or current Project continuation. It should show file/function-level evidence, alternative tradeoffs and “unknown until test,” not fabricate a comprehensive architecture or insist on a new schema.

## Commission boundary

This document records the selected design and preferred larger release scope. **No code, schema, learner-data mutation, fixture load/reset or Sites deploy is authorised merely by merging it.** The next implementation chat should explicitly commission the code/deployment scope and follow applicable repository, CI, protected-Sites, source-parity, synthetic isolation and owner-review gates.
