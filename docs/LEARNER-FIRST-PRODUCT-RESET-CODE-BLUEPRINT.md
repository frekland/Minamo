# Minamo: learner-first product reset — implementation blueprint

**2 November 2026 · proposed design and code commission, not approved implementation.** Read [the repeated failure review](research/2026-11-02-repeated-learner-experience-failure-review.md) first. This blueprint responds to the owner's repeated first-hand feedback; it is **not** another discovery programme, renamed Workbench, polished contextual wrapper or PR #78 continuation. No merge, learner-data write, schema migration, fixture reset, Sites publication or normal-route cutover is authorised by this document alone.

## 0. The change of premise

The new product is **a place to learn and think with material**. A Project, Stage, Investigation, Question, Article, Activity, checkpoint and relationship are existing *content/domain records*, **not required destinations or concepts in the learner's navigation**. Preserve their identities and history behind a compatibility adapter; freely replace their presentation and arrangement.

The smallest useful product grammar is:

1. **Study** something: read, explore a question, practise, inspect an original or work through optional guided material in one coherent surface.
2. **Find** useful material: search or browse *reference, activities and guides* without understanding backend families, “investigations” or Project/Stage structure.
3. **Keep thinking**: write a Note at any time, optionally connect it to the source/task, return to it and recognise what was explicitly saved or changed.

There is no separate compulsory Project/Stage workflow; no Learning Atlas, map/graph, Work/Questions/Evolution mode, formal Session, mastery model or persistent “CurrentConcern.” A Guide is an *optional authored sequence*, not the owner of the learner's activity. A Question is ordinary material one can inspect, discuss and connect, not an obligatory page type. A learner who never creates a Project must receive the full experience.

**Hard structural rule:** The new Study route must **not** render `app/journey-route.tsx`'s overview/Step list, `app/learning-home.tsx`, `app/working-context.tsx`, or the full legacy Reader/Activity Studio *as nested page shells*. Extract and reuse their genuine content and command coordinators. A contextual banner above the old page is an automatic product failure.

## 1. What a learner sees

### Navigation, simplified

| Primary destination | Purpose | Current records behind it |
| --- | --- | --- |
| **Study** (default) | Open the current/selected material or a quiet start screen; move between source, doing and writing without losing place | Any admitted record; drafts; selected passage; optional origin |
| **Find** | One search and browse entry across references, activities and optional guides | Library articles/areas, experiments, journeys, independent questions if useful |
| **Notebook** | Personal Notes, observations/Attempts, deliberate updates and locally retained drafts in one understandable chronology | Note, run/Attempt, learning-development, annotation/Flag when relevant |

Settings, Tools and Trash remain accessible secondary actions. Learning-space/language selection remains, without exposing “unclassified” or record-family machinery on ordinary first-use screens. **Projects, Practice & review, Independent questions and Your work are removed as permanent primary tabs after acceptance**, not merely renamed and retained beside the new three.

Legacy `?view=journeys`, `?view=investigations`, `?view=library`, `?view=practice` and `?view=work` URLs continue through a typed compatibility router. Their target content opens in Study/Find/Notebook with exact record, edition and passage selection. A deliberate temporary rollback entry may still render the old application during rollout; it is not a second promoted learner mode.

### Study start — no record selected

- **One main prompt:** “What would you like to explore?” Below it: search/find, **New Note**, **Try an activity**, and optionally a small *recently saved* list of original entries.
- If there are genuine recent Notes/Attempts/updates, show their authored title/excerpt, date and one action: **Continue**. Several separate intentions remain separate, not one inferred “current task.” Recent viewing alone is labelled *recently opened*, never a claimed saved advance.
- If none are eligible, **omit the empty continuation module entirely**. Do not display “no eligible sources,” “declared read,” “coverage,” “GPT last seen,” “snapshot” or “nothing mastered.” A local dirty draft can be shown as **Unsaved draft on this device** with an explicit reopen/discard choice.
- Do not require choosing a Project, intention class, topic, learner level, status or next action before writing.

### Study while material is open

The primary object occupies the first viewport: **article passage, Activity task, selected Question content, Note editor, or optional Guide introduction**. There is **one title** and one compact orientation line. At most three relevant nearby actions, chosen by context:

- **Note on this**: open the one real Note editor beside the material on desktop, full-width sheet on mobile. Show a simple “From [material]” chip, editable/clearable **before** an explicit saved link. The source stays visible/recoverable.
- **Try this** / **Read about this**: typed eligible Activity/reference action near the passage/task itself. Do not hide an Activity under “Your work / Tool,” and do not manufacture exact-current links from older/unpinned ones.
- **Discuss with GPT**: explicit source-selected handoff. A learner can inspect or deselect what is sent; preparing context does not silently message GPT or save any record.

The secondary **Related** action opens a compact list of useful titles with a human reason (“Practise this concept”, “Earlier Note”, “Different edition”). Full provenance/relation paths, hashes, ACL/snapshot details and coverage belong in a disclosure labelled **Source details** for people who request them. No repeated top-level “CURRENT MATERIAL · TYPE,” “Connections & history” panel or duplicated page wrapper.

On a long Article, excellent educational content, diagrams, code and headings remain intact. Contents navigation can be sticky/compact. Do not dilute useful teaching to make the interface look simpler.

### Study while an optional Guide is open

Old `journey` data becomes **guided material**, not a mandatory learning organisation system.

1. Open the Guide to its useful introduction or last *explicitly saved* linked work. A recent Note/Attempt/update is shown ahead of an old Stage list, with its actual source/time. When nothing has been saved, show the introduction and **Choose a topic from this guide**.
2. Authored Steps move into an optional **Guide outline** drawer or in-document contents. They retain original order and deep-link IDs but have **no authoritative “current Stage”** based on mere navigation.
3. Questions appear as linked content within the relevant passage and Notebook, not as compulsory sub-workspaces. An independent Question is allowed without a Guide.
4. Later Notes/updates can change what is foregrounded. Old checkpoints remain visible as historical source entries, never copied into multiple status panels.
5. A future Guide can be authored as simple material without constructing a rigid Project/Stage/Investigation tree. Do not create another compulsory thread taxonomy to replace Stages.

### Activity in Study

- Open directly on **Task**, not a previously selected **Your attempt** tab. Existing Activity execution/choice/source-file engines are reusable; their large Studio shell and unrelated Reader duplicate are not.
- Task text gives a plain goal, prerequisites and next useful action. Internals such as `SHA-256` file bindings, “immutable source-browser” or illustrative-execution disclaimers are relocated to **Source details**, not shown above the exercise. Do not edit an immutable historical Activity silently: apply this presentation rule to its typed metadata and keep exact canonical content in optional Reader/details.
- **Your thinking** is a nearby Note/draft action, not a mandatory form with Prediction/What changed?/Next intention fields. Structured Attempts remain optional when the exercise actually needs them; saved Attempts preserve execution-authorship distinctions.
- A visible **Back to passage** returns to the exact selected source edition/passage. “Back to where I was studying” survives Activity → Note → source → another Article, refresh, native links and Back/Forward where origin is present.

### Notebook

This is the **single personal-work surface** and the place Notes can be edited. Recent original Notes, explicit GPT updates, saved Attempts/observations and deliberately chosen links are visible in a meaningful chronology. Search across their actual text and title; group by an optional Guide or source only when requested.

An unlinked Note is a complete, valid entry. A Note linked to several things does not gain one invented “current Project.” Flags/annotations belong to their source; filters use kind-appropriate empty actions. Local drafts are clearly distinguished from server-saved revisions; test-only local drafts require a separate targeted, consented cleanup, never a blanket local-storage purge.

## 2. Concrete end-to-end learner scenarios

These are **interaction contracts for implementation**, not another list of questions to ask the owner.

| Task | Required visible sequence | Disqualifying result |
| --- | --- | --- |
| **A. Unplanned idea** | Study → New Note → type → save; reopen from Notebook. Zero mandatory classification or Project choice. | An authoring-package form, stage selection, mandatory question type, or disconnected editor. |
| **B. Reference → practice → thinking → source** | Open a reference, choose an eligible Activity near the relevant passage, work in the Task, open Note, save through existing CAS, return exactly to the source/edition. | Full legacy screens nested, lost origin, Activity hidden as Tool, duplicate Reader, unsaved draft lost. |
| **C. Changed direction after a gap** | In a formerly Stage-based Guide, open recent explicit update/Note first; see its date and author; reveal the older contradictory checkpoint and original reason with one action; choose a next source. | Static ordered Steps or an old checkpoint determine “current”; synthetic summary invents success. |
| **D. Sparse and projectless return** | Reopen two dated Notes/one Activity with no checkpoint or Guide. Show actual writing, and honest absence of a saved next intention without a technical caveat paragraph. | “No linked work” while the accessible Note is elsewhere; compulsory new Project. |
| **E. Language learning** | Find a Japanese/French article, use language-specific reading/diagram/pronunciation, practise and capture a Note, return with language and exact selection intact. | Computing-only assumptions, loss of furigana/IME, forced Project/Stage. |
| **F. Cold/empty and interrupted browser** | No data: simple actions, no empty evidence dashboard. Local dirty draft: explicit reopen; sign-in/permission change: no stale private text; save outage: recover exact draft. | “Declared scan” or old test fixture in ordinary UI; silent edit loss or stale-owner leakage. |
| **G. Deliberate GPT update** | From selected material or saved Note, request an update in GPT, review the proposed source-bound writing, authorise persistence, see one natural acknowledgement; independent fresh GPT retrieves it. | Assessment language, invisible write, user required to coordinate several raw MCP operations or Stage-only target. |

### Example first viewport, not a mockups-only acceptance

**No selection:** “What would you like to explore?” → Search, New Note, Try an activity, optional **Continue** entries if saved. No record types or evidence disclaimers.

**A changing Guide:** useful title → **Latest saved writing** (actual dated Note/update, not generated status) → one action to inspect *what changed* against an earlier source → study material → **Guide outline** only on demand. The original Stage plan cannot be the default first screen.

**Reading:** article title and explanation start immediately → local “Try a related activity” → “Note on this” stays at hand. A single contextual return control is present; no second full page heading or source-contract panel.

## 3. Read and state contract

### Client selection is not durable learner state

```ts
type StudySelection = {
  source?: { family: Family; id: string; rendition?: string; passage?: ReadingSelection };
  view: 'start' | 'material' | 'activity' | 'notebook' | 'find';
  origin?: ViewOrigin;                  // validated return only, never a saved relation
  localDraftKey?: string;               // device/session scoped, not a canonical fact
};
```

Use `lib/navigation-origin.ts` and `lib/view-origin-return.ts` for canonical route origin. A selected source, page visit, last-opened Stage or local return stack is **not** a saved link, learner intention, change of understanding or execution claim. Only an explicit domain operation may create a durable relation/update.

### A read for the user experience, not an audit response rendered verbatim

```ts
type StudyRead = {
  selected?: AdmittedSource;              // exact, permission-checked material
  recent: SavedEntry[];                   // original Note/Attempt/update, newest by saved time
  related: TypedOpportunity[];            // admitted source/Activity/guide choices
  updates: ExplicitUpdateCandidate[];     // timestamped, attributed, possibly competing
  guide?: { introduction?: AdmittedSource; outline: GuideEntry[] };
  internalCoverage: CoverageReceipt;      // for logic, diagnostics and detail disclosure
};

type StudyCard = {
  title: string;
  excerpt?: string;                       // original admitted text, not generated claim
  kind: 'writing' | 'activity' | 'reference' | 'guide' | 'question' | 'update';
  when?: string;
  action: { label: string; href: string }; // exact native destination
  secondaryDetail?: string;               // optional only
};
```

**Presentation rules:**

1. Return an empty `recent[]` cleanly; the UI hides the module. Do not turn coverage notice into the empty state.
2. Preserve distinct, possibly contradictory explicit intentions. Show original Note/Attempt/update and timestamp, never combine them into a single inferred learner “current” statement.
3. Show a short “Older version” or “Source unavailable” label only when that fact changes a relevant action. Full revision, source actor, relationship path, truncation, original code hash and rights receipt stay inspectable in details/diagnostics.
4. A Project/Guide is not privileged in evidence ranking. Use explicit source links, recency of *saved writing* and actual selected context; no semantic title-match relation write.
5. No text synthesized by the server is treated as a learner decision. Optional GPT-written synthesis becomes a separately identified, reviewable, saved update only after user authorisation.
6. Filter synthetic fixtures server-side by default; never rely on a title prefix, CSS hide or a diagnostic query flag alone. Respect owner, generation, learning-space, edition and source rights.

Start with `lib/continuity-evidence.ts`, `lib/working-context-read.ts`, `lib/learning-work.ts`, `lib/practice-index.ts`, `lib/project-context.ts` and `lib/catalogue.ts`. Build `lib/study/read.ts` as a **small orchestrator/presenter input**; do not duplicate D1 queries or create a second current-state store. A source-reason/detail adapter may reuse `SourceReceipt` and `ContextRelation` internally, but `app/study` must never print `coverage.notice` or raw contract labels.

### One necessary domain extension: stage-free explicit updates

Today `LearningWorkTarget` only admits `journey-stage` or `investigation`. That structurally forces an ordinary explicit “update Minamo” to attach to a Stage/Question. **Do not perpetuate that constraint in the reset.**

Add a backward-compatible versioned target to `lib/contracts.ts` and the `lib/learning-work.ts` validator/read/write paths:

```ts
type LearningTargetV2 =
  | LearningWorkTarget                                       // existing records stay valid
  | { kind: 'record'; family: 'journey' | 'investigation' | 'note' |
                            'article' | 'experiment'; id: string; rendition?: string };
```

An explicit update may be about a whole former Project, an independent Note, an Activity or an Article; it does **not** require a Stage. Keep `LearningDevelopment` revision, evidence, supersession, actor, time, permissions and idempotent operation receipts. Use a versioned schema/adapter for new targets; read old v1 events unchanged. It appears feasible to reuse the existing `v2_learning_developments.target_key` text index, but this is a **source-based expectation, not a migration-free guarantee**: prove query, uniqueness, old-event and rollback behaviour on disposable D1 before deciding. If a new table/index is genuinely required, stop for an explicit migration approval. No automatic rewriting or promotion of old checkpoints.

For a routine “update Minamo,” the client/GPT may use existing domain commands where sufficient; otherwise expose one small reviewable write adapter for a stage-free update. The learner must not need to select and invoke multiple low-level MCP operations or create a formal assessment. The write-side audit/evidence semantics stay strict; the acknowledgement reads like “Saved your update” with a source link, not a tutorial about persistence/mastery.

## 4. Concrete code replacement map

| Existing seam | Required action | New responsibility / prohibited shortcut |
| --- | --- | --- |
| `app/page.tsx`, `app/workspace.tsx` | Add a temporary controlled `study` entry; after acceptance route ordinary signed-in traffic to Study. Keep old router only as rollback/compatibility, not inside new screens. | `app/study/study-app.tsx` owns the **single** new learner surface and source selection. No `WorkingContextHost + legacy page` composition. |
| `app/working-context.tsx`, `app/learning-home.tsx`, `app/continuity-sources.tsx` | Extract admitted read hooks and source card formatters, retire their existing Home/coverage panels from normal Study. | `app/study/study-start.tsx` renders actions and actual original recent entries. Tests assert banned notices absent. |
| `app/journey-route.tsx`, `app/project-navigation.ts` | Extract authored Guide introduction/Step content as plain reusable material; stop rendering full Project overview/Step list as primary. | `app/study/study-guide.tsx` places real recent writing first and Guide outline on request. Stage-only deep links still select original content. |
| `app/reader.tsx`, `app/library-browser.tsx` | Separate content/selection/annotation renderer from Library catalogue and record wrapper; preserve exact code, tables, diagrams, text ranges, ruby. | `app/study/study-material.tsx` uses one heading and inline “Try/Note/Related”; `app/study/study-find.tsx` unifies reference/Activity/Guide discovery. |
| `app/activity-studio.tsx`, `app/source-activities.tsx`, `lib/practice-index.ts` | Extract actual Activity task/file/explore and results engines, keep authored older/unpinned source relationship semantics. | `app/study/study-activity.tsx` defaults to Task, uses local Note action, inline source return; moves hash/source-binding metadata to opt-in detail. |
| `app/notes-panel.tsx`, `lib/note-sync.ts`, `lib/note-capture-context.ts` | Keep **one** existing CAS/draft/flight/receipt owner; extract or re-skin editor only where necessary. Do not implement another save pipeline. | `app/study/study-notes.tsx` provides inline/side-sheet writing and `app/study/study-notebook.tsx` owns personal search/history. Retire the persistent bottom dock in Study. |
| `app/learning-links.tsx` and related context cards | Stop grouping Activities as “Your work / Tool”; hide provenance strings from primary cards. | `app/study/study-related.tsx` gives meaningful eligible action choices at source/passages. Source details retain technical provenance. |
| `app/continuity-gpt-handoff.tsx`, `lib/continuity-gpt-brief.ts` | Keep deliberate exact selections, rights recheck and explicit Prepare. Change only entry/copy/selection integration. | `app/study/study-gpt.tsx` offers “Discuss this” and “Update Minamo” without automatic writes or repetitive disclaimers. |
| `lib/learning-work.ts`, `lib/continuity-evidence.ts`, `lib/project-context.ts`, `lib/working-context-read.ts` | Reuse bounded reads/rights; add stage-free target, source-grounded ordering and typed admission where required. | `lib/study/read.ts` returns source-linked entries and opportunities, never a persisted generated status. |
| `app/workspace-presentation.css`, `app/working-context.css`, old modal/dock wrappers | Do **not** carry a second header or floating administrative panel into Study. | New local `app/study/study.css` has one dominant reading column, restrained actions and responsive sheets. |

The file paths under `app/study/` are **new proposed modules**. Before implementation, verify exports and extract content-level components with regression tests. Importing the *full* `JourneyRoute`, `LearningHome`, legacy `ActivityStudio` shell or `WorkingContextHost` into `study-app.tsx` is a failed implementation, even if appearance differs.

### Route and compatibility behaviour

| Input | New learner destination | Guarantee |
| --- | --- | --- |
| `/?` | Study start or explicit current selection | Does not invent last intention from navigation |
| `?view=library&family=article&id=...` | Study material | Exact edition/passage if provided |
| `?view=practice&family=experiment&id=...` | Study Activity | Original source/practice return |
| `?view=journeys&family=journey&id=...&stage=...` | Study Guide content | Authored Stage target survives without making Stages global navigation |
| `?view=investigations&family=investigation&id=...` | Study Question content | Independent Note/Question remains valid |
| `?view=work` or original Note link | Notebook / Study Note editor | Draft/committed revision and origin intact |

Do not lose copied link/new tab/reload/Back/Forward semantics by intercepting everything with local React state. Use one validated `StudySelection`/origin codec and native links; source or permission change fails safely and does not show an inaccessible old excerpt.

## 5. Bounded implementation commission: three real product increments

**Do not first build another multi-week research system.** Use a fresh implementation branch from the current public `main`; cherry-pick/extract the **specific proven** navigation, read, relation and Notes fixes from draft PR #78 as needed. Do not merge #78 wholesale. Current V95 is a rollback source reference, not a product acceptance. Keep existing `.openai/hosting.json`, protected audience and native/public source parity rules; no Sites action is part of this blueprint.

### Increment A — replace the learner shell and prove the simple learning loop

- Build Study/Find/Notebook layout and route compatibility. Real authenticated Study opens native Library content, one original Activity and the same real Notes persistence coordinator. No old wrapper or permanent Project/Practice/Your work tabs in this candidate.
- First screen with no saved work is useful and quiet. Article Task/Note controls sit beside actual material. Activity defaults to Task. Legacy guides appear only as optional Find content.
- Implement T-A/T-B/T-F on disposable authenticated state **with actual D1 and browser**, including new tab, reload, source revision and dirty draft. Source hash/read-coverage strings have secondary disclosure only. Check mobile 390px and desktop before moving on.
- **Stop** if this still looks like a legacy page under a new header, or the learner must route via a Step/Question to do simple work.

### Increment B — meaningful return and deliberate stage-free update

- Make recent saved Notes/Attempts/update sources useful from Study/Notebook, including contradictory and sparse cases. A Guide return shows latest *actual* linked work first, older checkpoint as history, optional outline. Implement a bounded related-source discovery link that respects exact/old/unpinned quality and scope.
- Add versioned stage-free explicit update target if v1 cannot do the work. Use real auth, CAS, idempotency, supersession, source revisions, rights and an independent new-chat MCP readback. Never require a Project to save or resume.
- Implement T-C/T-D/T-G against the already available historical/synthetic corpus **without re-seeding it in the normal learner account**. Show original evidence, not a fabricated assembled biography.
- **Stop** if the “current” view asserts stale or ungrounded state, still foregrounds fixed Steps, or requires manual taxonomy work.

### Increment C — cutover, accessibility and retirement

- Review actual desktop and 320/375/390px/physical mobile, keyboard, focus, IME, long Article, furigana, Activity and Note transitions. Fix a small number of evidenced issues, not another generic 60-item polish programme.
- Compare the same tasks on V95 versus the new candidate: actions/backtracks, usable first content, source-return fidelity, draft retention, time only when actually measured, and owner preference after live use. No model-generated satisfaction score.
- Remove the permanent contextual/classic switch and duplicate old learner chrome **only after owner acceptance**. Old deep links use compatibility redirect/adapters; keep a bounded rollback route and source/version receipt. Legacy code is deleted or quarantined, not silently mounted in production.
- **Stop** if a real learning session is not clearly easier. Technical correctness is necessary but cannot overrule this gate.

### Non-waivable product acceptance versus deployment policy

The owner has separately waived the **full regression suite as a mandatory prerequisite to an authorised opt-in Sites deployment**. That remains valid. It does **not** mean the new Study route earns product acceptance from build/typecheck, a handful of focused tests, a successful publish or an agent's flattering browser walkthrough.

For any opt-in release: exact native source/build, focused critical invariants, unchanged access/bindings, recorded omitted checks, rollback and clear candidate labelling. For **merge/default-route cutover**: required source regressions, genuine authenticated browser end-to-end tests and explicit **owner usefulness acceptance**, including a narrow device, are non-waivable. A failed owner judgement returns to implementation, not another add-on panel.

## 6. Engineering acceptance matrix

| ID | Test | Expected invariant and learner outcome |
| --- | --- | --- |
| UX-N01 | Study first-use, empty/non-empty and unsaved local draft | Meaningful start with no contract warnings; no test-only draft; one-action Note opening |
| UX-N02 | Article→Activity→Note→exact Article | Valid source/edition/passage/return after native link, reload, new tab and Back/Forward; one content column, no legacy shell |
| UX-N03 | Guide after changed-direction history | Later Note/update before outdated Step; two competing explicit intentions preserved; original evidence/old checkpoint available without synthetic “done” |
| UX-N04 | Projectless and sparse Notes | Personal work visible/searchable without Project, Stage, Question or checkpoint; no empty-record false claim |
| UX-N05 | Unified Find | Article, Activity and Guide results filtered by rights/space/synthetic; Activity near source, no “Your work / Tool”; title links not duplicated |
| UX-N06 | Genuine Note write + failure/recovery | Exact CAS/idempotent receipt, retained local draft, conflict UI, independent readback and no cross-owner stale text |
| UX-N07 | GPT explicit update | Human-reviewed stage-free update, compatible historical reads, source refs, owner scope, revision/supersession and fresh-chat replay; no assessment chatter |
| UX-N08 | Content/meta suppression | No `declared read`, `eligible sources`, `last-seen GPT`, `immutable source-browser` or hash receipt in *primary chrome/Task*; details remain available if requested |
| UX-N09 | Narrow/assistive | 320–390px content first, full Note sheet, touch/keyboard/IME/focus, language-specific ruby and controls; no obstructing dock |
| UX-N10 | Legacy compatibility and rollback | Existing links, old v1 checkpoints, retained editions, Flag/annotation anchors, Trash, access, synthetic isolation and rollback remain sound |

Tests should assert **rendered user-visible state**, not only helper output. Add `tests/interface-browser/study-learner.spec.mjs` for complete navigation and recovery, `tests/study-read.test.mjs` for source/evidence selection and negative rights, and `tests/stage-free-update.test.mjs` for old/new target, CAS, supersession and independent readback. Use only disposable D1 and specifically authorised synthetic scope for mutations. Do not reintroduce test banners or scenario fixtures into ordinary learner discovery.

**Failure signals visible in the old product are explicit rejection assertions:** the primary DOM contains a Step roadmap or Project map before the selected material; duplicate top headings; Activity initially selects Your attempt; source hashes/coverage notices appear in primary task chrome; a Note opens a publishing package; the learner must navigate through Project/Question to reach a linked Activity; or an older checkpoint silently replaces a newer recorded intention.

## 7. Source, scope and handoff

- **Primary issue:** [#51](https://github.com/frekland/Minamo/issues/51); [sanitised owner feedback source](ux/2026-11-01-owner-firsthand-ux-feedback.md). Earlier internal feedback was compared without exporting private record links or contents.
- **Technical source donor, not product branch to merge:** [draft PR #78](https://github.com/frekland/Minamo/pull/78) at public head `3fc0a82fc5799e7325d750864956624742158f54` on 2 Nov. Verify latest ref at implementation time; do not pin mutable PR assumptions as fact.
- **Current observed candidate:** protected Sites V95, contextual opt-in, access unchanged. Its successful deployment, synthetic cleanup and focused regression results are **not** a passed Study experience.
- **Historical controls:** [V70–V72 reconciliation](ux/V70-V72-CROSSWALK.md), [V86 live audit](ux/2026-10-31-LIVE-AUDIT.md), [D3 study](research/2026-11-01-contextual-learning-interaction-study.md), [Project-stage root-cause audit](research/2026-11-01-project-stage-continuity-root-cause-audit.md), [site-release workflow](SITES-RELEASE-WORKFLOW.md), and [the V92–V95 contextual implementation draft](https://github.com/frekland/Minamo/pull/78).

**Next coding-agent instruction, if owner commissions it:** start at Increment A in a fresh branch from `main`. Read this blueprint, its repeated-failure review, AGENTS and the exact touched code; trace the real Notes/Reader/Activity seams; build and demonstrate the *replaced* Study route. Do not start another research election, fork a separate Note save engine, add a compulsory taxonomy, merge PR #78, migrate real data or deploy without the requested gate. After A, report visible learner outcome and what old UI was actually retired before seeking approval for B.

**Owner decision requested only on this concrete plan:** approve or reject building the replacement Study/Find/Notebook route (and its explicit retirement of the Project/Stage/Investigation-led primary interface). This blueprint is implementation-ready enough for a bounded engineering commission; it is **not** a claim that its final product usability is proven before real use.
