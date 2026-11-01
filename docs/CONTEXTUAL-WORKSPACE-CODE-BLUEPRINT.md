# Minamo contextual workspace — substantial code implementation blueprint

**Status:** Owner-selected post-V91 implementation direction, 1 November 2026. **Blueprint only; not implemented or accepted.** Applies to draft [PR #78](https://github.com/frekland/Minamo/pull/78) and supersedes its incremental 1B/2A UI scope as the proposed final learner experience. Preserve already verified code where useful; do not merge, reset data, change access or publish on the strength of this document. Explicit follow-up coding and Sites release gates remain necessary.

**Source baseline inspected:** Public PR #78 head cfaff47d4bab5db85e43e3661f6bca3e76296e0a, deployed V91 receipt in docs/releases/2026-11-01-sites-v91-e4-e6-verification.md, current main e381ae24d0a5c9bf021f658ccb5fc7e8ff4613e9 at review. Recheck all identities at implementation time. Related authorities: AGENTS.md, docs/PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md, docs/CONTEXTUAL-LEARNING-INTEGRATED-IMPLEMENTATION-BRIEF.md (historical 1B/2A acceptance baseline), docs/PROJECT-WORKBENCH-INFORMATION-CONTRACT.md (research hypothesis), D1/D3 studies and the three-layer acceptance protocol.

## 1. Why a stronger application model is warranted

V91 implemented sound independent improvements: bounded scope:evidence retrieval, owner/generation/rights and retained-edition checks, exact navigation origins, explicit Note anchors, read-only source discovery and selected-source GPT requests. The full native suite passed 1,553/1,557 with four skips. The deployed browser passed narrowly specified E4/E5 routes, but those technical gates did **not** establish an effective integrated learner experience. Owner judgement and a fresh learner session found a familiar sequence of disconnected destinations:

Home → Library Article → Activity Studio → Notes → Project Step → Practice catalogue → Home.

The learner had to reconstruct one TCP inquiry from separate Note, Attempt and Flag cards, seek the most relevant Activity elsewhere, and manually assemble GPT context. A Project Step correctly did not invent a link to an Article-only Note, yet had no low-friction way to explore this adjacent material. A large Note dock and repeated reader/studio displays competed with content.

**Concrete source-discovery gap, not a generic UX preference.** Current Computing Article "Processes, TCP sockets and connection evidence" is revision 3, rendition r-a44697e0a3b1e9c33296880a91450eed443a5594498065a8fbc2c13b298fb642. Existing Activity "Bandit Parallel · Process, Listener, Connection" links to the Article without a pinned rendition. Activity "TCP observations — a stream is not a message" has typed refs to older Article rendition r-ab9f7de19780cd2f17977d6fbf83e5b5978d81bc679955493df5d598c54684b0. lib/practice-index.ts:sourceActivityMatch requires rendition equality and app/source-activities.tsx renders nothing when no exact matches. The right Activity exists but was not exposed in the current Article's new Activity list. Do **not** silently retarget either old or unpinned source relation; make provenance-limited discovery visible.

The failure is at the application-model boundary: better storage and navigation contracts were placed behind largely unchanged page destinations. Further cards, ribbons or one-off link patches are not an adequate final architecture.

## 2. Product model and invariants

**Organising unit:** a learner-controlled **working context**, centred on what they are doing or trying to understand now, including provisional, projectless, cross-Project and changing-direction work. A working context is first an interaction/read-state concept, **not** a mandatory durable Project, Inquiry or Episode record.

**Primary loop:** capture → select material → read/practise/compare/write in context → interrupt → reopen selected sources and saved evidence → deliberately choose next work. Projects supply optional authored routes and resources; they never automatically overrule later Notes, uncertainty or independent work.

**Invariants:**

1. Canonical D1/R2 records, revisions, actor, links, immutable reading renditions, UTF-16 passage selections, command idempotency, CAS, Trash/recovery and identity/scope remain authoritative. Do not duplicate content in a new summary database.
2. A browser navigation path, recent co-visit or text similarity is **not** a saved learning relation. Suggested links require explicit confirmation and domain command receipt/readback.
3. Keep distinct: learner report, GPT interpretation, supplied example/output, Minamo-observed command receipt, external independently verified operation and unknown. A terminal command claimed in a Note is not observed execution. Avoid mastery/progress/ability scoring.
4. No compulsory taxonomy, Project selection, current question, learning objective or status maintenance for blank Note capture.
5. Rights and old-edition constraints apply **before** presentation or GPT selection. An unpinned or old-edition relation is neither missing nor an exact-current link.
6. Explicit source selection controls GPT handoff; no silent chat capture or writes. The host may require a copy/open flow; do not claim a direct ChatGPT invocation unless supported.
7. One coherent working surface on mobile, keyboard and desktop; extra panels are optional and dismissible. Exact URLs/new tabs/back/forward must remain valid.
8. Synthetic history cannot leak into normal discovery, ordinary GPT context or unrelated owner work. Owner diagnostics can admit registered fixtures only with clear controls.

## 3. Three-layer architecture

| Layer | Authority | Existing substrate | Proposed change |
| --- | --- | --- | --- |
| Canonical learning data | D1 domain records and revisioned operations | lib/contracts.ts, lib/domain.ts, lib/domain-handler.ts, NotesPanel commands, Project/Activity/Reader models | Preserve in first substantial implementation; only propose a new persistent working-set type after a demonstrated user-controlled need and separate migration gate |
| Scoped contextual projection | Derived, read-only, invalidatable | lib/continuity-evidence.ts, lib/project-context.ts, lib/practice-index.ts, lib/atlas/project.ts, lib/learning-work.ts | Join relevant sources/attempts/Notes/checkpoints with bounded typed relationship paths and transparent link quality; expose reasons, exclusions and cursor coverage |
| Working interaction state | The learner's current selection, open material, transient navigation, draft and deliberate source bundle | app/workspace.tsx, lib/navigation-origin.ts, app/notes-panel.tsx, app/navigation-context.tsx | Introduce a real context host that keeps selection/source/Activity/draft and return origin across detours and browser history without creating learning records |

Data flow:

~~~text
D1 canonical records + retained editions + rights
       -> bounded contextual read projections (why linked, how certain, what omitted)
       -> contextual workspace (selected material, quick capture, optional comparison)
       -> explicit GPT source bundle / optional domain commands with receipts
~~~

A displayed "working thread" is a **view of authorised records and explicit selections**, not a newly asserted historical episode. If the learner elects to save a bundle, a later, separate decision may permit a minimal user-owned working-set record. Do not smuggle it into a cache or pretend local session storage is cross-device canonical truth.

## 4. Proposed TypeScript contracts (design targets)

These are **new proposed interfaces**, not claims about current exports. Final types should derive Family, RecordLink, ReadingSelection and LearningSpaceSelection from existing contracts.

~~~ts
type ExactRecordRef = {
  family: Family;
  id: string;
  rev?: number;                  // required when presenting a recorded historical claim
  rendition?: string;            // required for an exact saved reading/Activity edition
  selection?: {
    sectionId: string; partId: string;
    start?: number; end?: number;
    segments?: ReadingSelection["segments"];
  };
};

type WorkingSelection = {
  v: 1;
  primary?: ExactRecordRef;      // may be undefined for a blank capture
  selectedRefs: ExactRecordRef[]; // explicit learner additions, bounded; order retained
  origin?: ViewOrigin;           // temporary navigation only, never a persisted relation
  projectGuide?: { id: string; stageId?: string }; // optional, not priority claim
  draftKey?: string;             // opaque local coordinator key, not Note contents in URL
  activeMode: "capture" | "work" | "source" | "practice" | "evidence";
};

type RelationQuality =
  | "exact-part" | "exact-section" | "exact-edition"
  | "older-edition" | "unversioned-saved-link" | "saved-record-link"
  | "derived-bounded-path";

type ContextRelation = {
  from: ExactRecordRef;
  to: ExactRecordRef;
  quality: RelationQuality;
  reason: string;                // authored or source-computed, never fabricated causation
  path: RecordLink[];            // only admitted, source-attributed edges
  sourceRendition?: string;      // the pinned historical edition if one exists
  opensCurrentSource: boolean;   // false for old/unpinned relations
};

type WorkingContextRead = {
  contract: "minamo.working-context.v1";
  asOf: string; generation: string; snapshotVersion: number;
  focus?: ExactRecordRef;
  items: Array<{
    ref: ExactRecordRef;
    title: string; kind: string; actor: string; recordedAt: string;
    preview: { text: string; complete: boolean };
    destination?: string;
    basis: "authored" | "checkpoint" | "attempt" | "flag" | "source";
    provenance: string[];
  }>;
  relations: ContextRelation[];
  possibleActions: Array<{ kind: "read" | "practice" | "capture" | "compare"; target: ExactRecordRef; reasonRefs: ExactRecordRef[] }>;
  coverage: {
    completeWithinScope: boolean;
    moreRecords: boolean; moreRelations: boolean;
    nextCursor?: string; targetNextCursor?: string;
    gaps: string[];
    notice: string;
  };
  lastSeenByGpt: "unknown";
};
~~~

**Contract rules:**

- An exact historical claim requires an admitted specific revision/rendition. If only current head is admissible, mark it **current inspected edition**, not "same as when written".
- A broad saved link to Article ID without rendition can support a **related Activity** label, not "linked to this exact passage". An older pinned ref can support "uses earlier Article edition" with a safe open-earlier action. A denied/unavailable edition must remain unavailable; never substitute current prose.
- WorkingSelection is client state, versioned and strictly parsed; avoid embedding private Note text or owner identifiers in shareable URLs. The source URL itself retains exact family/id/rendition/selection; drafts remain in the existing coordinator.
- The read model may return several competing intentions and no preferred next action. PossibleActions are *source-grounded options*, not instructions or learner goals. Absence with partial coverage must never become "nothing left".
- Return selected evidence and separate relation paths, not duplicated giant snippets or an AI-generated biography. Cap payload size, identity scans, traversal depth, fan-out and time; use 409 on stale namespace/cursor and revalidate every owner/rights edge.

## 5. Read-side implementation — explicit code seams

### 5.1 Context graph/closure

Build an additive module, provisionally **lib/working-context-read.ts**, with bounded read-only entry points for: (a) recent eligible work without focus, (b) one exact selected Note/Article/Activity/Question, (c) optional Project/Step guidance, and (d) explicit multi-source comparison. Prefer separate narrow queries or a small discriminator to one enormous universal payload.

Reuse lib/continuity-evidence.ts:readContinuityEvidence (owner/generation snapshots, bounded candidate scan, Project→Question path admission, independent Notes/Attempts/Flags/checkpoints, coverage and 409 staleness), lib/project-context.ts:getProjectContext (authored Stage/Question outline and resources), and lib/learning-work.ts:getLearningContext (saved developments). **Do not interpret record updatedAt as the event time described within its prose.** Present dated recorded receipts and only separately authored event time if validated.

Project breadth must not stop at the root's direct related set. Safely follow bounded Project→Question→Note and Note→Note edges, validate each admitted target, report deeper work deferred by the cursor and never infer relevance from title similarity alone. Keep the current 12-target and 80-identity / 64-KiB evidence-budget constraints as initial upper bounds or justify adjusted limits empirically; version any cursor contract and test query cost.

Extract reusable admission/edge validation rather than having independent contradictory eligibility logic in Home, Project and GPT. Projection should expose both **why an item appeared** and **what was not searched**. Ordinary user routes must not toggle includeSynthetic based on URL alone.

### 5.2 Source-to-Activity discovery

Revise lib/practice-index.ts:sourceActivityMatch and browsePractice, and app/source-activities.tsx. Resolve **typed exact refs**, **saved unpinned generic refs** and **saved refs to old Article editions** as three distinct provenance categories. Every candidate must be owner/space/rights checked. For old refs, verify retained read rights and return an old-edition target; for unpinned refs, admit current visible Article identity as a broad relationship while explicitly omitting exact rendition/passage claims. Do not rewrite authored refs on read. Keep lexical search or title similarity out of the "linked" category; separate optional discovery suggestions if introduced.

Return a typed result with match class, source rendition if pinned, current/older status, exact Activity edition, explicit reason and pagination/partial notice. Render visible **Activity** actions on the Article (in reading orientation, not buried beneath generic Your work / Tool), and retain Tool identity only for genuine legacy tools. The relationship panel should show no false exactness. Include zero/one/many/denied/old/unpinned/cursor and non-Activity legacy controls. Make the current TCP Article a required browser oracle in addition to the established Japanese N4 exact-passage path.

### 5.3 GPT source bundle

Reuse lib/gpt-context.ts, lib/continuity-gpt-brief.ts and app/continuity-gpt-handoff.tsx to consume explicit selectedRefs from the working surface. Cap selected sources (current 1–6 default); preserve duplicate record identities with **different renditions** as different intentional selections. Check rights and exact source state at request/read time. GPT may challenge, compare, propose links/Note updates and ask for external evidence; only an explicit domain command can commit. Ensure requests say what is supplied/illustrative, deferred and externally unobserved.

A one-action host handoff is desirable **only if** the Sites host exposes a supported deep link/action with correct consent. Otherwise keep copy/open as an honest fallback and reduce repeated metadata ceremony. No invented embedded model API or background agent.

## 6. Front-end implementation — change the organising experience

### 6.1 New context host, not extra Home cards

Introduce **app/working-context.tsx** (or equivalent), **app/working-context-state.ts** and focused subcomponents such as ContextPrimary, ContextRelations, ContextEvidence, ContextGuide and ContextCapture. The names are proposals, not required public vocabulary.

App/workspace.tsx currently owns a very large coupled route/render tree and top-level Notes coordination. Treat it as a compatibility adapter and extract a **WorkingContextHost** responsible for selected object identity, source/Activity transitions, draft-preserving return, and contextual panels. Do not copy the entire Workspace file or duplicate record command handlers. One authoritative source of session selection; one existing NotesPanel command pipeline.

**First screen:**
- "Start writing" is a direct blank Note field/action, not a classification dialog. The initial saved Note may be projectless.
- "Resume" exposes a small number of recent eligible authored records and distinct older checkpoints with source reasons/uncertainty; no automatic current-intent claim.
- "Explore" offers Library, Practice and Projects as browsing alternatives. Test fixtures stay out of ordinary navigation.

**Active work screen:**
- A readable **primary object** (Note, Article, Activity, Question or Project Step), not three always-on panes.
- An unobtrusive related-material affordance which can open a source, Activity, adjacent Note, evidence history or Project guide without discarding the primary context.
- A compact writing surface that stays recoverable while inspecting sources. Use existing NotesPanel draft/flight/CAS coordinator and the deliberate optional-link UI. Explicitly show linked and merely selected material as different concepts.
- A compact return stack with exact source/rendition/passage/task cues. Closing a contextual peek returns selection and scroll; Back/Forward, new tab, refresh and browser interruption remain deterministic.
- Optional comparison mode for two or more **explicitly selected** canonical records, with separate provenance and no copied canonical data. This mode is earned by a real contradiction use case, not the default landing screen.

### 6.2 Project and Activity roles

Refactor app/journey-route.tsx so Projects are **guidance/resources inside the same working context**. Keep authored stages, step selectors, Project map, Questions, original content and deep links. Opening a Project prioritises eligible, source-grounded recent work; if no links are admissible, display honest uncertainty and an obvious step chooser. The previously visited Step is navigation history, never a learning claim. Moving from an Article-only Note to a related Project may offer "Open Project guidance" through admissible material paths, but **must not** display the Note as Project-linked without a saved or qualified derived path.

Refactor the interaction between app/reader.tsx, app/activity-studio.tsx, app/source-activities.tsx and PracticeLibrary: a reader can discover and open Activities in context, and Activity Studio owns execution/hints/attempt flow without duplicated full Reader content by default. Exact passage markup and annotation/Flag actions stay available behind a deliberate Reader mode. "Saved attempt" must not imply code execution; show "illustrative reflection" or equivalent when there is no observed run.

Library/Practice/Your work remain available as **indexes**, not mandatory context resets. Search results and modified/native links go through the same canonical navigation codec.

### 6.3 Responsive and accessibility behaviour

At desktop width use one dominant reading/work column and optional adjacent inspector, without the large bottom Notes dock obscuring half the material. At 320–390px present a linear primary view with an accessible context drawer and a full-width Notes surface; no hidden hover-only controls. Keyboard focus returns to the triggering action on closing Notes, context panels, Reader or Activity. Preserve IME/composition, unsaved text, selection and operation identity during route changes and temporary network failures. Use clear landmarks, names and source-label text; do not render long duplicated code/line-number blocks in the accessibility tree.

## 7. Navigation, draft and state boundaries

Reuse lib/navigation-origin.ts (ViewOrigin, routeDestination, extended UTF-16 selections), app/navigation-context.tsx and lib/note-capture-context.ts (only the actual source is an implicit capture link). The new WorkingSelection stores **which surface is open**, **what was explicitly selected** and **where to return**, but its mere existence causes no D1 write.

- Exact deep-link URL: family/id plus immutable rendition/selection and an optional validated origin; select without rewriting to current head.
- Local draft: NotesPanel owns draftKey, text, flights, autosave/uncertain acknowledgements and restart handling. A context-host unmount must not destroy them.
- Explicit canonical link: existing Note command with relation, expectedRev, operationId and readback; independently removable. A "suggested related" item is not equivalent.
- Cross-tab/owner/space change: fence context and cached reads. Do not expose old selected previews on 401/403/404/generation switch; temporary transport failures may show clearly stale same-scope receipts only.
- Error/discovery empty states: distinguish "none in checked scope", "more unscanned", "source edition unavailable" and "no saved relation". Preserve external URLs as metadata, never source-text authority.

**Optional durable working set — conditional gate.** Begin with versioned local/URL view selection and canonical Note links. During owner testing, ask whether cross-device resumption of a manually curated context is materially missing. If yes, propose a tiny explicit user-owned working-set family or revisioned preference with source IDs, pinned editions, ordering and optional label; no content duplication, no inferred membership, CAS/operation receipts, rights-safe readbacks, Trash/export/recovery, migration/rollback and privacy review. This **may** warrant a schema change; it is not preapproved by the blueprint. Do not make "save workspace" an organising chore.

## 8. File-level change plan

| Existing source | Proposed implementation responsibility |
| --- | --- |
| app/workspace.tsx | Decompose route/render branches into a backwards-compatible WorkingContextHost and record adapters; keep current auth, Notes commands, exact loading and deep-link routes |
| app/learning-home.tsx; app/continuity-sources.tsx | Replace the oversized newest-first card experience with a compact capture/resume/context choice; still expose every exact record and coverage via expansion |
| app/journey-route.tsx; app/learning-activity.tsx | Make Project Steps optional contextual guide and show source-qualified recent work without conflating Article-only Notes with Project relationships |
| app/reader.tsx; app/source-activities.tsx | In-context source reader, visible typed Activity actions and provenance labels; retain exact passage/Flag/annotation operations |
| app/activity-studio.tsx; app/learning-activity.tsx | Activity interaction as a selected work mode; one primary task display, explicit attempt/hint/run semantics, optional exact Reader |
| app/notes-panel.tsx; lib/note-capture-context.ts; lib/note-sync.ts | Reuse draft/flight/expectedRev and opt-in links; offer compact contextual editor without a second save engine |
| app/navigation-context.tsx; lib/navigation-origin.ts; lib/view-origin-return.ts | Canonical typed selection/return codec, history, native links, edited/denied source fallback |
| lib/continuity-evidence.ts; lib/project-context.ts; lib/learning-work.ts | Rights-scoped bounded source/evidence candidates, multi-hop Project→Question→Note closure and distinct dated checkpoints |
| lib/practice-index.ts; lib/atlas/project.ts | Typed and generic Activity link quality; old/unpinned relationship search and appropriate legacy identity |
| lib/gpt-context.ts; lib/continuity-gpt-brief.ts | Selected-context GPT package, exact secondary editions, coverage and explicit update-only behaviour |
| lib/domain-handler.ts; lib/contracts.ts | Additive read API/MCP contract only at first; schema/write commands only if optional saved working set receives separate approval |
| app/working-context*.tsx; lib/working-context-read.ts (new) | Single working interaction state and source-attributed projection; avoid competing authoritative "current" resolvers |

**Do not** implement a parallel full data layer, resurrect Learning Atlas as the UI, permanently couple the primary experience to Project/Stage, or introduce new mandatory taxonomy. Use current design tokens/navigation, but permit substantial page/layout reorganisation.

## 9. Coherent build sequence — one usable release, reviewable checkpoints

### A. Failing behavioural contract and source-read foundation

1. Pin exact public PR head and native Sites source; inventory existing data/migration and UI/API contracts. Preserve V91 rollback.
2. Add **red tests using real source shapes**: TCP current Article v3 + unpinned guided Activity + older-edition stream Activity; Project→Question→later Note; independent Note; explicit multi-target Note; temporary selected context versus saved link.
3. Implement link-quality discovery, safe owner/edition read projection and bounded multi-hop context selection. Add API/MCP shared validation and precise coverage/409 states; no new writes.
4. Verify source edition, access, pagination, query budget and synthetic exclusion on isolated D1. No UX PASS asserted.

### B. Substantial integrated contextual-workspace UI

1. Introduce WorkingContextHost and a shared working selection/return state; wire the existing Notes coordinator once. Deliver capture-first entry, single primary content, contextual related/source/Activity actions, optional Project guide, source evidence/history and deliberate GPT bundle.
2. Keep all old deep links resolving; use a reversible route/flag to compare the new composition with V91 without a data fork. The new route must use **actual canonical D1 saves**, CAS receipts, reload, edits and deleted/revoked-source failures—not mocked card state.
3. Verify a complete TCP episode, then Mood/Cap/Plant adversarial returns. Test keyboard/mobile/IME and multi-tab draft recovery during real context changes.
4. Consolidate duplicative Studio/Reader/Notes surfaces, prioritising a clear primary task; do not merely add another dashboard to the old pages.

### C. Comparative acceptance, cutover and cleanup

1. Measure the same tasks in V91 and the new context route: click/backtrack count, forced classification, time to relevant Activity/Note, lost exact position, wrong or missing records, source ambiguity, focus loss, draft loss, and what the learner judges confusing. No invented usability score.
2. If the new model does not reliably beat a simple Note + selected sources / existing V91 on the representative tasks, simplify it; do not ship an elaborate context-management ceremony.
3. After owner acceptance, route normal Home/Project/Article/Activity entry into the new composition while keeping safe compatibility links and rollback. Remove redundant old cards/surfaces only once their behaviours are covered; mark obsolete code for later deletion rather than doing a blind large purge.
4. Complete full source gates, exact native parity and separately authorised Sites deployment. PR #78 stays draft until product and technical acceptance; document the final code/host version and rollback.

This is a **substantial integrated candidate**, not a tiny isolated demo and not a four-prototype research programme. Checkpoints are for review and test speed; they do not independently satisfy the learner journey.

## 10. Acceptance scenarios and gates

| Case | Required observable result | Important negative control |
| --- | --- | --- |
| C1 — unplanned capture | Blank projectless Note saves immediately; remains selected through source search, reload, close/reopen; optional later relation is explicit | No forced Project/Question, no hidden silent link, no draft/flight loss |
| C2 — live Computing TCP | Current Article visibly offers exactly qualified current/old/unpinned related Activities; learner reaches listener/connection exercise, records a prediction and returns to the exact Article/optional Step | Never claim old/unpinned refs are exact current passages; do not label legacy Tool as new authored Activity |
| C3 — one episode's evidence | Note, Attempt, Flag and source appear as separate canonical receipts with explainable verified relationship paths; selected context survives reasonable detours | No inferred episode/goal, no "run executed" from a supplied Attempt, no wrong Project linkage |
| C4 — Mood K | Latest sceptical/changed-direction Note and older Stage checkpoint are accessible with distinct dates/revs; conflicting next intentions visible | Never select old checkpoint as authoritative current goal or fabricate provider v7 verification |
| C5 — sparse Cap / Plant K | Question-mediated recent Note and open unknown are discoverable with optional Project guide, no first-Step coercion; physical/supplied evidence separately labelled | No expired-instance inference, hardware observation claim, source leakage or proxy mastery |
| C6 — deep route | Project Step→Question→Note→Article exact passage→Activity→Note and back; native new tab, Back/Forward/reload preserve eligible selector and draft | No silent edition update, lost origin, navigation-to-saved-relation or arbitrary source selection |
| C7 — rights/coverage | Denied, revised, withdrawn, missing, multihop deferred and stale-cursor cases give precise partial/unavailable states | No cross-owner data, unverified completeWithinScope, revoked-source text, stale same-scope fallback on hard denial |
| C8 — UX/assistive | 320/375/390px and desktop, keyboard landmarks, focus, Escape, open panels, screen reader and reduced height are usable on the integrated route | No overlay blocking reading, code duplication in accessibility tree, IME loss or keyboard trap |
| C9 — GPT control | Chosen exact sources/editions and gaps appear in MCP context; suggested correction stays proposed until explicit saved command/readback | No automatic chat capture, source substitution, inferred completion or GPT-authored data mutation on navigation |

**Testing implementation:** Extend tests/contextual-continuity.test.mjs, contextual-source-activities.test.mjs, contextual-navigation.test.mjs, contextual-note-anchor.test.mjs and contextual-source-first.test.mjs with realistic source shapes. Add tests/working-context-read.test.mjs, tests/working-context-state.test.mjs, tests/working-context-ux.test.mjs and a browser flow under tests/interface-browser/ using real D1/Worker fixtures. Use the existing nine 3×3 histories as bounded corpus cases, not as substitutes for an authentic interactive journey. Preserve the three-layer transcript/observer/D1 distinction; do not call host-complete capture verified.

**Technical gates:** focused D1/SSR/rights tests during iteration; then full pnpm run typecheck, pnpm run build, pnpm test, required interface-browser and native Sites integration checks on the exact candidate. **Product gate:** owner performs at least the TCP/unplanned and one sparse/contradictory return in deployed protected browser and explicitly accepts the experience. A green suite is necessary, never sufficient.

## 11. Risk and cut-line register

| Risk | Mitigation / stop |
| --- | --- |
| Second authoritative "current concern" or inferred episode | Keep working state transient and selected; read projections retain reason paths, disputed alternatives and unknown; no AI-generated durable summary |
| Unpinned Article link silently becomes current-edition proof | Distinct link-quality classes; old-edition and unversioned labels with explicit rights-checked destinations; no write-on-read |
| Context query cost/size grows unbounded | Fixed depth/fan-out/bytes, owner-first SQL, typed admission, cursors, 409 version fences and measured D1 query budgets |
| Note editor is accidentally forked | One NotesPanel coordinator, same operation IDs and conflict recovery; E1/C6 forced interruption tests |
| Project/Stage legacy links break | Route adapter, exact family/rendition anchors, old URL browser fixtures and native/modified click tests |
| Synthetic fixture clutter and cross-persona leakage | Owner-only diagnostics entry, ordinary synthetic exclusions throughout Home/Projects/Context/GPT, explicit registered fixture controls |
| Mobile working surface becomes another dense Workbench | Single column, optional panel, compare only on demand, keyboard/assistive checks early; simplify on owner failure |
| GPT becomes an ungrounded session manager | Exact selected bundle, source/coverage receipts, no autonomous writes, clear host handoff fallback |
| Broad refactor endangers protected Sites | Preserve native manifest/identity/config/D1/R2, reconcile exact public/native sources and retain V91 rollback; do not deploy without explicit permission |

**Cut first if overloaded:** spatial/drag-drop worktable, auto-generated focus, ranking algorithm, semantic relation inference, automatic Studio execution, durable saved working sets, broad content rewrite. **Do not cut:** genuine projectless capture, context-preserving writing, source-qualified Activity discovery, rights/revision truth, recoverable draft, source-attributed return and owner-visible uncertainty.

## 12. Decision and handoff for the next coding chat

The owner has **chosen the stronger contextual workspace architecture direction** after the V91 learner experience exposed that incremental 1B/2A changes did not sufficiently connect real study work. This authorises updating the plan/PR documentation, **not** silently merging/deploying or migrating data. The next implementation commission should begin with the exact PR #78 head, current main and native Sites manifest; read this blueprint and current AGENTS.md; produce a short source-diff checklist and immediately implement the A regressions/read projection, then the substantial B interaction. Do not restart D1–D3 research or commission another large concept survey.

Open choices to resolve with implementation evidence rather than abstract design debate:
1. Is a local/URL WorkingSelection sufficient for natural restart, or is an explicit saved working set worth a separately reviewed schema?
2. Which relation qualities can be shown directly versus behind a compact "related material" disclosure at mobile width?
3. How much of current Home/Project rendering can be retired after the new route proves better without breaking deep links?

**Done means:** the user can genuinely study in one coherent context, leave, return, see exact evidence and choose what to do next—without a false memory or a compulsory filing ritual.
