# Minamo: learner-first product reset — implementation blueprint

**2 November 2026 · proposed design and code commission, not approved implementation.** Read [the repeated failure review](research/2026-11-02-repeated-learner-experience-failure-review.md) and the [independent cross-repository architecture review](research/2026-11-02-pr79-cross-repo-architecture-review.md) first. The latter identifies mandatory R1–R7 corrections integrated in this revision. This blueprint responds to the owner's repeated first-hand feedback; it is **not** another discovery programme, renamed Workbench, polished contextual wrapper or PR #78 continuation. No merge, learner-data write, schema migration, fixture reset, Sites publication or normal-route cutover is authorised by this document alone.

## Owner decision after comprehensive review — all seven corrections are mandatory

**2 November 2026, follow-up owner approval of the review recommendations.** P0 versus P1 indicates **engineering sequencing and risk**, not whether an item may be omitted. **All seven closure conditions C1–C7 below are required for the first accepted redesign.** An Increment A shell, an A+B technical milestone or a partial P1 implementation may be deployed as an explicitly incomplete opt-in engineering candidate, but **none is a completed product reset**. The commission is A+B+C as one integrated scope, with recorded checkpoints and the owner's final usefulness judgement. The owner approved updating this draft plan, **not** app coding, schema changes, PR merge, Sites deployment or learner-data mutation.

| Closure condition | Priority for engineering order | Mandatory accepted-product evidence |
| --- | --- | --- |
| **C1 Evolving work identity and lifecycle** | P0 | Create, find, change direction, link, archive and reopen a genuinely stage-free optional undertaking, including compatible old Projects and distinct authored Guides |
| **C2 Meaningful, evidence-grounded continuity** | P0 | Reconstruct recorded changes/reasons, corrections, competing ideas, unknowns and next intentions without inventing a settled state or merely listing latest Notes |
| **C3 One natural GPT update/read cycle** | P0 | Concrete transactional source-free and stage-free model, one authorised write, old/new reads, natural acknowledgement and independent fresh-chat recovery |
| **C4 Genuine Find and creation** | P1 | Rights-safe content-level cross-family retrieval, contextual Article↔Activity discovery and one ordinary missing-material request/create path |
| **C5 Usable site↔GPT handoff** | P1 | Reviewable exact context selection, platform-honest copy/open transition, independent tool reread, explicit save and exact return |
| **C6 External-work evidence** | P1 | One practical changing-work scenario with source-pinned external change, observation/report distinction, freshness, learner interpretation and correction |
| **C7 Architecture and workflow closure** | P1 | Explicit Guide/work classification, late Note association, complete read/write migration inventory, no old shell import, one canonical agent handoff and full task-based acceptance |

**Failure rule:** None of C4–C7 may be relegated to a post-release enhancement backlog. A clean three-tab redesign that cannot complete those loops is not an accepted Minamo redesign. These conditions strengthen R1–R7 from the cross-repository review rather than replacing them.

## 0. The change of premise

The new product is **a place to learn and think with material**. A Project, Stage, Investigation, Question, Article, Activity, checkpoint and relationship are existing *content/domain records*, **not required destinations or concepts in the learner's navigation**. Preserve their identities and history behind a compatibility adapter; freely replace their presentation and arrangement.

The smallest candidate navigation grammar is **Study / Find / Notebook**. These are pragmatic destinations to test in real use, **not a new ontology of learning or an immutable three-tab requirement**. If the same connected tasks demonstrate that this separation obstructs work, change the navigation without restoring legacy record-family tabs:

The learner's actual unit of experience is **working with something**—reading, investigating, practising, interpreting evidence, writing, changing direction and returning. This may have no named container. When a meaningful undertaking exists, it may be opened as an optional evolving context.

1. **Study** something: read, explore a question, practise, inspect an original or work through optional guided material in one coherent surface.
2. **Find** useful material: search or browse *reference, activities and guides* without understanding backend families, “investigations” or Project/Stage structure.
3. **Keep thinking**: write a Note at any time, optionally connect it to the source/task, return to it and recognise what was explicitly saved or changed.

There is no separate compulsory Project/Stage workflow; no Learning Atlas, map/graph, Work/Questions/Evolution mode, formal Session, mastery model or persistent “CurrentConcern.” **A Guide is optional authored teaching material; an evolving Project is optional work context and must not be reduced to a Guide.** Both may reuse historical Journey records, but they offer different interactions. A Guide is not the owner of the learner's activity. A Question is ordinary material one can inspect, discuss and connect, not an obligatory page type. A learner who never creates a Project must receive the full experience.

**Hard structural rule:** The new Study route must **not** render `app/journey-route.tsx`'s overview/Step list, `app/learning-home.tsx`, `app/working-context.tsx`, or the full legacy Reader/Activity Studio *as nested page shells*. Extract and reuse their genuine content and command coordinators. A contextual banner above the old page is an automatic product failure.

## 1. What a learner sees

### Navigation, simplified

| Primary destination | Purpose | Current records behind it |
| --- | --- | --- |
| **Study** (default) | Open the current/selected material or a quiet start screen; move between source, doing and writing without losing place | Any admitted record; drafts; selected passage; optional origin |
| **Find** | One search and browse entry across references, activities and optional guides | Library articles/areas, experiments, journeys, independent questions if useful |
| **Notebook** | Personal Notes, observations/Attempts, deliberate updates and locally retained drafts in one understandable chronology | Note, run/Attempt, learning-development, annotation/Flag when relevant |

Settings, Tools and Trash remain accessible secondary actions. **Opening a named area of work is a context-specific Study action, never a compulsory fourth primary tab or a static Guide outline.** The learner may continue a saved undertaking, switch among several, or work completely without one. The context is identified by explicit compatible records/links; never promote a mere visit or title match into a saved relationship. Learning-space/language selection remains, without exposing “unclassified” or record-family machinery on ordinary first-use screens. **Projects, Practice & review, Independent questions and Your work are removed as permanent primary tabs after acceptance**, not merely renamed and retained beside the new three.

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

### Study with an optional evolving area of work

A prior **Project** is not necessarily a sequence of learning material. It may be a developing software product, practical Kali investigation, piece of writing or experiment whose direction, evidence and external state change. Treat an old `journey` as a possible contextual anchor with its *authored outline available on demand*, not as the primary definition of present work. Avoid introducing a replacement compulsory “thread”, current concern or user-maintained taxonomy.

**Work identity and lifecycle (C1):** Work and an authored Guide are two *different purposes*, even where legacy records both use `journey`. The implementation must settle an explicit, learner-reviewable compatibility rule for existing ambiguous records; never silently classify all Projects as Guides or infer purpose from a title, visit, latest Note or GPT summary. New named evolving work must be creatable **without authoring Stages**. The learner can find it, attach or detach an original Note/Attempt/source with explicit confirmation, change its direction, revise current intentions, rename/archive it and return after a gap, while preserving old entries and links. No required threads, Session or progress bureaucracy. A one-off unlinked Note remains fully valid.

The current `LearningShape` for a Journey is Stage-oriented and the proposed `StudySelection.focus` previously allowed only `journey`/`investigation`. **Do not treat a presentation-only rename as fulfillment of C1.** First try a small compatibility adapter over canonical records and explicit links. If it cannot express the above lifecycle without manual Stage or taxonomy maintenance, propose the smallest optional versioned work-anchor/domain extension with D1 migration/rollback and historical deep-link handling; obtain separate migration approval before any hosted write. No new authoritative current-status store is needed. A work anchor is a grouping/identity, not an inferred truth about what has been achieved.

Opening such a context must let the learner answer five questions **only where original admitted evidence supports an answer**:

1. **Where did I actually leave off?** Show a concise excerpt of the latest relevant saved Note/Attempt/explicit update, with its author/time, not the last visited Step.
2. **What changed and why?** Show traceable decisions, corrections and source comparisons. If the reason was never saved, do not invent it.
3. **What do I presently know or disagree about?** Keep competing or superseded interpretations visible as separate dated claims; allow inspecting their original evidence.
4. **What remains unresolved?** Show open questions or uncertainty only when explicitly recorded, with source links; an incomplete read is not proof of no open questions.
5. **What can I do next?** Present the latest still-relevant *explicitly saved* next intention and useful directly linked material. Otherwise allow the learner to choose without a fabricated recommendation.

**External work and freshness (C6):** A software/practical undertaking may have an externally verified GitHub change, a learner-supplied terminal artefact, a reported action and a personal interpretation at different times. Present these as different things, each with the source, observation/claim status and last-checked time where available. ChatGPT may bring in evidence from authorised connectors; the Site need not become a repository, terminal or automatic sync platform. Never turn a remembered or agent-reported external status into live verified truth. The first product candidate must exercise an external change → interpretation → correction → later return, not postpone this to speculative future integration.

For example, returning to Mood-to-Music after a correction to a persistence assumption should expose the saved correction, why the earlier claim became doubtful, the provider/privacy uncertainty and any explicitly recorded next experiment. The original fixed Stage outline should never dominate this first viewport. A later external GitHub/worker status, if integrated, must carry **last-checked time and source**, and must not be confused with the learner's understanding or personally executed work.

This is a **lossless, bounded read projection**, not a secretly saved summary. An optional short human-readable synthesis may point to cited originals and label gaps. Where the source graph is partial or insufficient, show useful original entries and neutral choices without a coverage/contract panel. No fake “progress” is inferred from saves, navigation or generated prose.

### Study while an optional Guide is open

Old `journey` records may contain **guided material** as one optional use. They can also anchor an evolving area of work as described above. Do **not** universally rename every historic Project to a Guide; distinguish the author's purpose and preserve existing identity, revisions and deep links.

1. Open the Guide to its useful introduction or last *explicitly saved* linked work. A recent Note/Attempt/update is shown ahead of an old Stage list, with its actual source/time. When nothing has been saved, show the introduction and **Choose a topic from this guide**.
2. Authored Steps move into an optional **Guide outline** drawer or in-document contents. They retain original order and deep-link IDs but have **no authoritative “current Stage”** based on mere navigation.
3. Questions appear as linked content within the relevant passage and Notebook, not as compulsory sub-workspaces. An independent Question is allowed without a Guide.
4. Later Notes/updates can change what is foregrounded. Old checkpoints remain visible as historical source entries, never copied into multiple status panels.
5. A future Guide can be authored as simple material without constructing a rigid Project/Stage/Investigation tree. Do not create another compulsory thread taxonomy to replace Stages.

### Optional multiple-source thinking without a mandatory worktable

Keep one primary object in Study, but permit a bounded set of additional exact selections: two Article renditions, a historical Note, a supplied Attempt, conflicting claims or a code/source reference. Compare or inspect them within the same activity and retain each independent rendition, passage and provenance. The learner may deselect or rearrange a temporary comparison; doing so never writes a relationship. “Discuss with GPT” must carry the **actual explicitly selected set**, recheck rights and offer a review before Prepare/Copy/Open. If the set becomes unavailable after a tenant, generation, space or edition change, redact it; do not reuse stale excerpts. Neither a three-pane dashboard nor a persistent comparison object is required.

### When Find has no suitable material

Find must offer meaningful search across the admitted content of references, Activities, optional Guides and independent work, not merely concatenate separate title indices. Show directly useful source-to-Activity opportunities with correct exact/older/unpinned quality, pagination and scope. If useful material is absent, offer a natural request to **explore with GPT** or deliberately create a reference/Activity through existing guarded authoring commands—without exposing the advanced publication package as the ordinary learner's next screen. No automatic semantic link is saved based on a title resemblance.

### Actual Find and ordinary content creation (C4)

`Find` needs a server-backed retrieval contract, not one text field over title-only catalogues. Search canonical admitted text, headings, passages/code references and useful metadata across Articles, Activities, optional Guides and independently useful Questions/Notes as appropriate; preserve computing/language scope, editions, rights, generation, synthetic exclusion and truthful cursors/partial-page semantics. Rank by task-relevant meaning and exact authored relationship quality, expose the reason and direct destination, and keep related Activity offers beside eligible passages without pretending an unpinned or older connection is exact. A title match or co-visit is not permission to save a relationship. Use bounded server-side indexing/queries with tested performance; choose the specific search implementation during C4 technical preflight and test non-title queries against actual seeded content.

When nothing suitable exists, provide a learner-facing **Ask GPT for material** or **Create reference/activity** path that prepares or executes the existing authorised content commands with a readable preview and confirmation. Preserve source/rights and editorial safeguards, but never send an ordinary learner into a full publishing-package console just to explore a topic. Test the whole journey, not only the absence of a technical label.

### Activity in Study

- Open directly on **Task**, not a previously selected **Your attempt** tab. Existing Activity execution/choice/source-file engines are reusable; their large Studio shell and unrelated Reader duplicate are not.
- Task text gives a plain goal, prerequisites and next useful action. Internals such as `SHA-256` file bindings, “immutable source-browser” or illustrative-execution disclaimers are relocated to **Source details**, not shown above the exercise. Do not edit an immutable historical Activity silently: apply this presentation rule to its typed metadata and keep exact canonical content in optional Reader/details.
- **Your thinking** is a nearby Note/draft action, not a mandatory form with Prediction/What changed?/Next intention fields. Structured Attempts remain optional when the exercise actually needs them; saved Attempts preserve execution-authorship distinctions.
- A visible **Back to passage** returns to the exact selected source edition/passage. “Back to where I was studying” survives Activity → Note → source → another Article, refresh, native links and Back/Forward where origin is present.

### Browser ↔ GPT interaction contract (C5)

A button labelled **Discuss with GPT** must actually do something understandable. The #78 donor only prepares a selectable source brief, copies it and opens generic ChatGPT; that is a safe starting limitation, **not proven seamless integration**. From the selected passage, Activity, Note or multi-source set, review eligible exact identities and what will be passed; recheck source rights and generation at preparation. Where Sites cannot directly hand context into an already-connected GPT chat, expose one concise **Prepare and copy / Open ChatGPT** flow, explain that the learner pastes it with Minamo tools connected and that GPT re-reads admitted originals. Do not promise silent cross-app navigation, transcript capture or automatic persistence. On return, restore the precise study selection and make the explicit save/readback outcome visible without duplicated receipt or assessment prose.

Acceptance must exercise the real Site → ChatGPT/MCP → owner-authorised update → Site → genuinely fresh ChatGPT loop, including cancellation, changed access, stale selection, clipboard failure and a no-selected-record conversation.

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
| **H. No-anchor conversational update** | Discuss a new topic in GPT with no saved source or Project; say “Update Minamo”; authorise one atomic original entry and optional links; reopen in Notebook and a genuinely fresh GPT chat. | “Choose a Stage/Investigation,” manual Note-then-checkpoint coordination or a chat-only result. |
| **I. Evolving undertaking, not a Guide** | Reopen a named practical/software undertaking after a change of direction; see explicit changed decisions/why, evidence, unknowns and saved next action before a historic outline. | A static Guide curriculum plus chronological Notes without meaningful reconciliation; ungrounded external-status claims. |
| **J. Multiple competing sources** | Examine older/current reference editions, a Note and a supplied Attempt together, discuss the chosen set with GPT and return to exact original selections. | Selection discarded during handoff, silent relation writes, stale rights, compulsory three-pane administration. |

### Example first viewport, not a mockups-only acceptance

**No selection:** “What would you like to explore?” → Search, New Note, Try an activity, optional **Continue** entries if saved. No record types or evidence disclaimers.

**A changing Guide:** useful title → **Latest saved writing** (actual dated Note/update, not generated status) → one action to inspect *what changed* against an earlier source → study material → **Guide outline** only on demand. The original Stage plan cannot be the default first screen.

**Reading:** article title and explanation start immediately → local “Try a related activity” → “Note on this” stays at hand. A single contextual return control is present; no second full page heading or source-contract panel.

## 3. Read and state contract

### Client selection is not durable learner state

```ts
type WorkFocus =
  | { kind: 'legacy'; family: 'journey' | 'investigation'; id: string }
  | { kind: 'work'; id: string }; // only after a reviewed optional work-anchor decision

type StudySelection = {
  source?: { family: Family; id: string; rendition?: string; passage?: ReadingSelection };
  selectedRefs?: Array<{ family: Family; id: string; rendition?: string; passage?: ReadingSelection }>;
  focus?: WorkFocus; // optional named context, not a Stage or status assertion
  view: 'start' | 'material' | 'activity' | 'notebook' | 'find';
  origin?: ViewOrigin;                  // validated multi-hop return; never a saved relation
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
  work?: WorkContextProjection;         // optional admitted evidence join, not a status record
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

### Working-context read contract — the critical missing join

```ts
type GroundedClaim = {
  text: string;
  refs: SavedRef[]; // exact admitted original records/revisions
  basis: 'explicit-saved' | 'user-confirmed' | 'interpretive-proposal';
  asOf?: string; // external/source freshness when meaningful
};

type WorkContextProjection = {
  focus?: WorkFocus;
  entries: Array<{
    source: SavedRef; actor: Actor; savedAt: string;
    kind: 'note' | 'attempt' | 'update' | 'question';
    originalExcerpt?: string; detailsDeferred: boolean;
  }>;
  changes: Array<{ newer: SavedRef; earlier?: SavedRef; reason?: GroundedClaim }>;
  competing: Array<{ refs: SavedRef[]; interpretation?: GroundedClaim }>;
  openQuestions: Array<{ source: SavedRef; claim: GroundedClaim }>;
  nextIntentions: Array<{ source: SavedRef; claim: GroundedClaim; savedAt: string }>;
  internalCoverage: CoverageReceipt;   // gate assertions; never print raw in learner chrome
};
```

This is a **presenter input contract**, not a new D1 table. `SavedRef`/the other names above are proposed types to derive from existing record and LearningDevelopment receipts; verify the actual types before implementation. Build it from source-admitted read models on current `main` plus **explicitly selected** PR #78 donor modules. Use an independent Question-mediated frontier and validated two-hop paths where needed; a direct Project-root related response may omit newer Question-linked Notes even when `relatedTruncated:false`.

**Required read algorithm/oracles:** determine explicit scope and learning-space/owner/generation; gather bounded original candidates with pagination; traverse only typed admitted relationships; reconcile supersession and source editions while preserving conflicts; choose a practical recent excerpt without claiming completeness from a truncated scan; expose original destinations; return unknown/partial/deferred internally. “Latest”, “no work” and “what changed” may be asserted only with appropriate eligibility and coverage. The UI must not transform non-completion into an empty saved-work claim. The projection can offer an optional short source-cited explanation, but it must not silently create or persist a canonical “current understanding”.

**C2 derivation and negative oracles:** An existing `LearningDevelopment` can express typed decisions, reasons, corrections, next actions and supersession; an ordinary Note may contain only prose. Source timestamps alone cannot resolve that semantic difference. For every displayed claim, define its origin in the exact saved field or explicit relation and its source/revision. Free-text inference can be offered as a *reviewable interpretation* with explicit source citations, never upgraded to an observed learner decision, a durable link or a resolved question. If causal meaning is not actually encoded, display the pertinent originals and a natural invitation to compare/clarify rather than an invented “what changed” summary. No hidden automatic taxonomy, persistence or new status table.

The acceptance oracle must challenge: later Note versus older checkpoint; contradictory next actions; unlinked Notes that the user later associates; sparse records; separate work strands; source revisions and withdrawn/corrected developments; partial pagination; revoked permissions; and external facts that have not been rechecked. Assertions of “last”, “nothing outstanding” or “latest direction” require complete eligible scope, not one successful read page. Test the actual first viewport and source drill-down, not just `WorkContextProjection` array contents.

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

#### Additional requirement: no selected target at all

A stage-free `{kind:'record'}` target still forces an existing record. A learner might begin a fresh GPT conversation, learn something useful and say **“Update Minamo”** with no open Article, Note or Project. This must be a complete use case, not an error that asks for a formal Stage.

Define one high-level reviewable, idempotent command that can **atomically create an independently retrievable original Note/update** and its optional selected source relations, or use an equivalent compatible domain operation proved to deliver the same outcome. It must accept genuinely source-free content, preserve reported versus observed evidence, explicit decisions/corrections, uncertainty and caller identity, and return one natural acknowledgement. Do not require the user to coordinate a Note-create operation followed by a checkpoint operation. If a transactional versioned development is needed, specify and verify the complete v1/v2 read, supersession, index, rights, generation, rollback and MCP schema lifecycle on disposable D1. No migration of real records is implicit.

The independent fresh GPT readback must find a projectless update *without* relying on historical chat memory, an existing Project or a hand-maintained link. Canonical prose and source citations remain accessible from the Site.

### C3 pre-code transactional decision — resolve the source-free case exactly

The high-level source-free command is **not implementation-complete** while its persisted result is described as “a Note/update or equivalent.” Before code commission reaches the write-side increment, choose and document a single domain transaction and normalised read representation. **Preferred design for a disposable-D1 proof:** one owner-authorised, idempotent `recordLearningUpdateV2` operation atomically creates an original standalone Note and, when structured developments are recorded, a versioned Development linked to that Note; existing-target updates can point to a record without forcing a Stage. Present this as **one** saved entry in Notebook/Study, not duplicate Note and checkpoint cards. An alternative is acceptable only if it proves the same single-action capture, explicit semantic facts/decisions/reasons/next intentions, revisions, supersession, independent retrieval and rollback without an extra learner operation.

Audit every existing `primaryTarget.kind` and `target_key` assumption, not only `lib/learning-work.ts` and `lib/contracts.ts`. In particular, current `lib/project-context.ts` continuation and the #78-only `lib/continuity-evidence.ts` SQL project checkpoint targets onto Journey/Investigation; a new `kind:'record'` would otherwise be misread or omitted. Include MCP tool descriptions, generation/CAS/idempotency, operation retries, source-rights, D1 indexes/migrations if actually required, export/restore, legacy v1 reads, revisions, synthetic isolation and native/public tool parity. Test all of these on disposable D1 before requesting any real schema or data change.

## 4. Concrete code replacement map

| Existing seam | Required action | New responsibility / prohibited shortcut |
| --- | --- | --- |
| `app/page.tsx`, `app/workspace.tsx` | Add a temporary controlled `study` entry; after acceptance route ordinary signed-in traffic to Study. Keep old router only as rollback/compatibility, not inside new screens. | `app/study/study-app.tsx` owns the **single** new learner surface and source selection. No `WorkingContextHost + legacy page` composition. |
| `app/working-context.tsx`, `app/learning-home.tsx`, `app/continuity-sources.tsx` | Extract admitted read hooks and source card formatters, retire their existing Home/coverage panels from normal Study. **Do not promote newest record to settled current intention.** | `app/study/study-start.tsx` renders quiet actions; `app/study/study-work.tsx` renders optional source-attributed evolving work and human-readable competing changes. Tests assert banned notices absent. |
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

### Mandatory dependency and retirement manifest before coding

This blueprint originally referenced these **PR #78-only** modules as if present on public `main`: `lib/continuity-evidence.ts`, `lib/working-context-read.ts`, `lib/navigation-origin.ts`, `lib/view-origin-return.ts`, `app/working-context.tsx`, `app/continuity-sources.tsx`, `app/continuity-gpt-handoff.tsx`, `lib/continuity-gpt-brief.ts`. Direct GitHub readbacks on 2 November confirmed all eight were on `docs/contextual-implementation-blueprint` and absent on current `main`. Some such as `app/working-context.tsx` are **donors to dissect, not components to retain**.

Before implementing, produce a checked donor matrix with the **exact candidate SHA** (PR #78 head may have advanced), full import dependency closure, retained tests, current-main equivalent, extraction transformation and deletion/retirement decision for each selected seam. Start a fresh public-main feature branch; do not merge #78 wholesale or copy its `WorkingContextHost`. Assert a one-way dependency boundary: `app/study/*` may import content-level Reader/Activity/Note engines and audited data adapters, but **not** the full legacy route/app shells. Test the actual DOM for absence of Step roadmaps, duplicate headers, full Activity Studio shell and technical coverage banners.

## 5. Bounded implementation commission: three real product increments

**Do not first build another multi-week research system.** Use a fresh implementation branch from the current public `main`; cherry-pick/extract the **specific proven** navigation, read, relation and Notes fixes from draft PR #78 as needed. Do not merge #78 wholesale. Current V95 is a rollback source reference, not a product acceptance. Keep existing `.openai/hosting.json`, protected audience and native/public source parity rules; no Sites action is part of this blueprint.

**One integrated commission:** All C1–C7 are required across A+B+C. Checkpoints permit inspection and safe opt-in engineering deployment, but no incomplete checkpoint is a product acceptance. P1 is an implementation ordering marker only.

### Increment A — replace the learner shell and prove the simple learning loop (internal engineering checkpoint)

- Build Study/Find/Notebook layout and route compatibility. Real authenticated Study opens native Library content, one original Activity and the same real Notes persistence coordinator. No old wrapper or permanent Project/Practice/Your work tabs in this candidate.
- First screen with no saved work is useful and quiet. Article Task/Note controls sit beside actual material. Activity defaults to Task. Legacy guides appear only as optional Find content.
- Prove a genuine non-title Find result and an ordinary GPT content-request/creation path, not merely a combined catalogue. Record C4 gaps as explicit blockers to product acceptance.
- Implement T-A/T-B/T-F on disposable authenticated state **with actual D1 and browser**, including new tab, reload, source revision and dirty draft. Source hash/read-coverage strings have secondary disclosure only. Check mobile 390px and desktop before moving on.
- **Stop** if this still looks like a legacy page under a new header, or the learner must route via a Step/Question to do simple work. **A is not a product-success candidate on its own**; the hardest historical failures require B and a joined acceptance episode.

### Increment B — meaningful return and deliberate stage-free update

- Make recent saved Notes/Attempts/update sources useful from Study/Notebook, including contradictory and sparse cases. Implement the bounded `WorkContextProjection`, optional source-cited explanation, precise partial/unknown handling and optional evolving-work context without inventing a required Project or inferring current state. A Guide return shows latest *actual* linked work first, older checkpoint as history, optional outline. Implement a bounded related-source discovery link that respects exact/old/unpinned quality and scope.
- Complete the C1 stage-free evolving-work identity/lifecycle, with explicit historical Guide classification and late Note association; implement the C2 causal evidence provenance/negative oracles and C6 external-change return case.
- Add compatible versioned stage-free **and source-free** explicit update handling; atomically create a standalone original entry where no target exists. Keep a one-operation human-authorised update from GPT, independent fresh-chat readback and installed-client command exposure. Use real auth, CAS, idempotency, supersession, source revisions, rights and an independent new-chat MCP readback. Never require a Project to save or resume.
- Exercise C5 through a real platform-honest Site ↔ GPT handoff, including the independent read, consent and exact return. The existence of a copy button or a successful MCP transcript alone is not completion.
- Implement T-C/T-D/T-G/T-H/T-I/T-J against the already available historical/synthetic corpus **without re-seeding it in the normal learner account**. Show original evidence, not a fabricated assembled biography.
- **Stop** if the “current” view asserts stale or ungrounded state, still foregrounds fixed Steps, or requires manual taxonomy work.

### Increment C — first complete product-candidate evaluation, cutover, accessibility and retirement

**Product-candidate entry gate:** A+B form one coherent learner experience, including evolving-work return and independent projectless conversational save/resume. Do not award a product pass to A's shell or Note/Activity route alone. An owner-authorised opt-in engineering deployment may occur earlier under the fast Sites gate but must be labelled incomplete.

- Review actual desktop and 320/375/390px/physical mobile, keyboard, focus, IME, long Article, furigana, Activity and Note transitions. Fix a small number of evidenced issues, not another generic 60-item polish programme.
- **All seven C1–C7 must be demonstrably complete** before a normal-route/default product cutover. Do not postpone Find, GPT handoff, external evidence or architecture closure as post-release P1 polish.
- Compare the same tasks on V95 versus the new candidate: actions/backtracks, usable first content, source-return fidelity, draft retention, time only when actually measured, and owner preference after live use. No model-generated satisfaction score.
- Remove the permanent contextual/classic switch and duplicate old learner chrome **only after owner acceptance**. Old deep links use compatibility redirect/adapters; keep a bounded rollback route and source/version receipt. Legacy code is deleted or quarantined, not silently mounted in production.
- **Stop** if a real learning session is not clearly easier. Technical correctness is necessary but cannot overrule this gate.

### Non-waivable product acceptance versus deployment policy

The owner has separately waived the **full regression suite as a mandatory prerequisite to an authorised opt-in Sites deployment**. That remains valid. It does **not** mean the new Study route earns product acceptance from build/typecheck, a handful of focused tests, a successful publish or an agent's flattering browser walkthrough.

For any opt-in release: exact native source/build, focused critical invariants, unchanged access/bindings, recorded omitted checks, rollback and clear candidate labelling. For **merge/default-route cutover**: required source regressions, genuine authenticated browser end-to-end tests and explicit **owner usefulness acceptance**, including a narrow device, are non-waivable. A failed owner judgement returns to implementation, not another add-on panel.

## 6. Engineering acceptance matrix

Alongside the existing tests, require an **integrated episode** that begins without a Project, finds or creates useful material, attempts practical work, compares evidence, saves an explicit correction through GPT, then resumes in a fresh chat and returns to the precise source. The owner must be able to perform a changing-work return without navigating a static Stage roadmap. Preserve source rights and mobile keyboard/IME. Existing 3×3 histories are regression evidence, not a mandatory learner-facing fixture population.

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
| UX-N11 | Named evolving work | Saved decisions/changed direction/uncertainty from real linked entries surface ahead of old outline; no Guide-only reclassification, invented summary or forced work taxonomy |
| UX-N12 | Source-free GPT update | A fresh conversation with no selected record saves one explicit original entry transactionally; a second fresh GPT chat and Notebook recover it with correct source/author/permission semantics |
| UX-N13 | Multi-source context and handoff | Compare two distinct editions plus Note/Attempt; selections are carried into reviewable GPT handoff, revoked/old refs are independently checked; no co-visit link write |
| UX-N14 | Real discovery and new material | Relevant Article→Activity offered in context, old/unpinned quality distinguished, cross-family Find pagination truthful; absent material can be requested/created without authoring-console detour |
| UX-N15 | Complete owner learning episode | Narrow-device, evolving-work, practical external and language cases tested against V95; readable first content, useful continuation and owner acceptance are decisive |
| UX-N16 | New evolving-work lifecycle (C1) | Create a named undertaking without Stage; connect a Note/Activity/source, pivot, preserve competing/history, rename/archive/reopen; old Project and authored Guide remain distinguishable |
| UX-N17 | Causal continuity and late association (C2) | Explain an explicit correction/why from exact sources, decline unsupported inferred status, link an old unlinked Note with consent, preserve multi-strand and partial evidence |
| UX-N18 | External change and interpretation (C6) | Source-pinned external GitHub change, learner-reported terminal result and interpretation remain distinct and time-labelled; a later correction/return does not invent live status |
| UX-N19 | Full Find/creation and browser↔GPT cycle (C4–C5) | Non-title passage query → eligible Activity → Note → exact return; missing material request without authoring console; site-selected source copied/read by connected GPT, one authorised update, independent return |

Tests should assert **rendered user-visible state**, not only helper output. Add `tests/interface-browser/study-learner.spec.mjs` for complete navigation and recovery, `tests/study-read.test.mjs` for source/evidence selection and negative rights, and `tests/stage-free-update.test.mjs` for old/new target, CAS, supersession and independent readback. Use only disposable D1 and specifically authorised synthetic scope for mutations. Do not reintroduce test banners or scenario fixtures into ordinary learner discovery.

**Failure signals visible in the old product are explicit rejection assertions:** the primary DOM contains a Step roadmap or Project map before the selected material; duplicate top headings; Activity initially selects Your attempt; source hashes/coverage notices appear in primary task chrome; a Note opens a publishing package; the learner must navigate through Project/Question to reach a linked Activity; or an older checkpoint silently replaces a newer recorded intention.

## 7. Source, scope and handoff

- **Primary issue:** [#51](https://github.com/frekland/Minamo/issues/51); [sanitised owner feedback source](ux/2026-11-01-owner-firsthand-ux-feedback.md). Earlier internal feedback was compared without exporting private record links or contents.
- **Technical source donor, not product branch to merge:** [draft PR #78](https://github.com/frekland/Minamo/pull/78) at public head `3fc0a82fc5799e7325d750864956624742158f54` on 2 Nov. Verify latest ref at implementation time; do not pin mutable PR assumptions as fact.
- **Current observed candidate:** protected Sites V95, contextual opt-in, access unchanged. Its successful deployment, synthetic cleanup and focused regression results are **not** a passed Study experience.
- **Historical controls:** [V70–V72 reconciliation](ux/V70-V72-CROSSWALK.md), [V86 live audit](ux/2026-10-31-LIVE-AUDIT.md), [D3 study](research/2026-11-01-contextual-learning-interaction-study.md), [Project-stage root-cause audit](research/2026-11-01-project-stage-continuity-root-cause-audit.md), [site-release workflow](SITES-RELEASE-WORKFLOW.md), and [the V92–V95 contextual implementation draft](https://github.com/frekland/Minamo/pull/78).

**Closure rule for the next agent:** Do not remove C1–C7 from scope because of their P1 label. Present a checked implementation decision for work identity, causal projection and v2 update transaction; build the real content/find/GPT/external loop; record failure/unknowns plainly. Branch-specific `AGENTS.md` and this blueprint govern the proposed commission over historical D3/#78 instructions. At every checkpoint report *what the learner can actually do*, what is still incomplete, and whether the old shell is absent.

**Next coding-agent instruction, if owner commissions it:** start at Increment A in a fresh branch from `main`. Read this blueprint, its repeated-failure review, AGENTS and the exact touched code; trace the real Notes/Reader/Activity seams; build and demonstrate the *replaced* Study route. Do not start another research election, fork a separate Note save engine, add a compulsory taxonomy, merge PR #78, migrate real data or deploy without the requested gate. Treat A as a recorded engineering checkpoint within a subsequently owner-authorised A+B+C integrated commission: report visible learner outcome and which old UI was actually retired, then proceed to B unless a stated stop condition fails. Do not require a fresh generic design election or call A alone a successful product.

**Owner decision status:** The owner accepted all seven review recommendations for inclusion in this draft plan, including optional evolving work, causal read projection, multi-source thinking and projectless conversational update. This does not yet authorise implementation, merge, deployment or migration. Study/Find/Notebook is the initial navigation candidate, not a permanent ontology. This blueprint is a scoped commission brief with explicit pre-code C1/C2/C3 decisions; it is **not** a claim that those design decisions, application implementation or final usability have already been proven. Commission the architecture closure and A+B+C together, keeping safe checkpoint gates.
