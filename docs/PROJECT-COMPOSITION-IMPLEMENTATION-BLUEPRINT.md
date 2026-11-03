# GPT-composed Projects — implementation blueprint (draft)

**3 November 2026 · planning only · no application code or database migration in this PR.** Read the [product/experience brief](PROJECT-COMPOSITION-DESIGN-BRIEF-2026-11-03.md) first. V91 is the production baseline; V92–V98 are retained experiments, not implementation authority. This blueprint can be edited before the owner commissions code.

## Architecture in one sentence

GPT supplies **content and typed composition decisions through MCP**; Minamo owns **canonical data, validation, atomic writes and polished native layout rendering**. Project Stages are optional components of a larger composition, not the root schema of all learning.

## Reuse, don't replace

Verified existing source seams in the public application (reconfirm actual current branch before code edits):

- lib/contracts.ts — WorkspaceRecord, revisioned journey learningShape/stages, RecordLink, ContentPatch, operation receipts. Existing stages reference canonical section IDs; links may carry stage/section context.
- lib/project-contracts.ts and lib/learning-work.ts — read-only Project/Step/Question and continuation projections; retain eligible exact source relationships but do not require their old hierarchy as the new UI.
- lib/domain.ts, lib/domain-handler.ts, worker/index.ts — shared web/MCP validation, owner admission, read/write tools, CAS/operation handling.
- app/journey-route.tsx, app/project-context-client.ts, app/notes-panel.tsx, app/reader.tsx, app/learning-activity.tsx — existing Project, Note, source and Activity components/recovery. Prefer small reusable display adapters; keep the authentic Notes save coordinator.
- db/, drizzle/ — current revisioned D1 records; do not add a second disconnected authoritative history, summary or mastery store.
- docs/SITES-RELEASE-WORKFLOW.md — owner-authorised rapid Sites publishing, changed-path verification and reversible saved versions.

Existing preview/apply command, atomic authoring package and relationship support are donors; their raw whole-record editing API is not an adequate learner-facing Project-composition contract. A semantic MCP update should not require GPT to reconstruct an entire Journey with sections and links merely to reposition a block.

## Two coordinated models

**Canonical learning content:** existing owner-scoped records, evidence, renditions, timestamps, Notes, Activities, sources and revision history. May be created/revised through existing validated domain operations.

**Project composition:** a separate *versioned presentation document* describing how eligible content and short attributed editorial framing are arranged. It does not certify understanding or become the source of truth for original Notes.

Proposed contract sketch (to refine after bounded domain inspection):

~~~ts
type ProjectComposition = {
  version: 1;
  project: {family: 'journey'; id: string};
  compositionRev: number;
  sections: ProjectSection[]; // ordered; no arbitrary nested layouts
  blocks: ProjectBlock[];
  preferredFocusId?: string;
};

type ProjectSection = {
  id: string;
  pattern: 'dashboard'|'notebook'|'workbench'|'board'|'research'|'guide';
  slots: Array<{
    id: string;
    role: 'primary'|'secondary'|'sidebar'|'history'|'freeform';
    blockIds: string[];
    collapsed?: boolean;
  }>;

};

type ProjectBlock = {
  id: string; // stable across reorders and small revisions
  kind: 'text'|'record-ref'|'code-output'|'table'|'media'|'question-task';
  title?: string;
  refs?: Array<{family: string; id: string; rev?: number; rendition?: string}>;
  content?: unknown; // bounded kind-specific data, not arbitrary HTML
  layoutLock?: 'position'|'content'|'both'; // not a Note-to-page pin
  hidden?: boolean;
  provenance?: 'learner-authored'|'gpt-interpretation'|'source-derived';
};
~~~

Design choices:
- Inserting, moving or GPT-recomposing a layout section changes only the versioned composition manifest, **not source content**. Preserve a server-side revision history and exact recovery path accessible to GPT/MCP on explicit request; **no learner-facing layout switcher or restore screen**.
- The Project is a **flat ordered list of sections**; each section's native template owns its internal responsive slots. No arbitrary nested section/layout tree in the initial implementation. Six different rich patterns still combine on one Project page.
- Missing/denied record refs render an honest unavailable state; never silently substitute a different source edition or leak private metadata.
- Content ref blocks should reuse canonical record IDs and exact editions; avoid content copies where an existing record is suitable.
- GPT-composed prose is bounded, clearly distinguishable from evidence, and may be edited/corrected independently.
- Stable block IDs, automatically preserved direct learner edits, internal GPT-managed layout locks when explicitly requested, and a minimal structural diff prevent chaotic rearrangement. **Do not expose layout-lock, move/hide or arrangement controls on every block.** Note-to-page pins are a separate explicit relationship.
- Implementation may choose a validated Project metadata extension or a narrowly scoped D1 sidecar after inspecting actual record/command semantics. There is no pre-approved new status/Work table.

## Existing Projects → new sections, without a separate fallback UI

Current owner Projects are mostly a description plus ordered Stages. When no `ProjectComposition` exists, derive or initialise the new flat section representation deterministically: an introductory rich-text block plus an ordered **Guide** section containing the existing Stage text/sections and eligible links. Keep IDs, source editions, anchors, cover assets and old Step deep links intact. Do not automatically promote unlinked historical Notes or claim complete coverage.

Implement the smallest safe **idempotent adapter or initialisation path** after checking the real Journey/Stage schema; avoid a second legacy Project viewer, a bulk destructive migration, or requiring GPT to rewrite each existing Project. Thereafter existing and newly created Projects use **the same content renderer**. The first end-to-end candidate must demonstrate an existing Project as well as a GPT-created one.

## Six layout implementations, not six superficial skins

Build a shared semantic component/layout renderer with responsive primitives (single-column, split, mosaic, flowing journal, board, guided sequence), then make all six named patterns meaningfully distinct. These are **insertable section patterns** in a flat ordered Project, not competing whole-Project modes or recursively nested layout trees. Each new section opens ready for direct content entry.

| Template | Rendering/interaction focus | Small-screen requirement |
| --- | --- | --- |
| Dashboard | Current focus and selected significant content receive prominence; secondary panels compact | Single useful leading action/content, no card wall or horizontal overflow |
| Notebook | Mixed narrative, code/output and notes as an intelligible sequence | Full readable text, dates and source anchors, not compressed cards |
| Workbench | Related material side by side, e.g. code plus output plus interpretation | Sensible tab/stack order, source and draft context retained |
| Board | Distinct visually grouped strands/cards without compulsory statuses | GPT composes group/order; direct content edits and accessible reading order; **no initial drag, drop or keyboard rearrangement subsystem** |
| Research | Readings, source refs, questions, comparisons and uncertainty adjacent | Source-to-question transitions clear and reversible |
| Guide | Optional stages/steps using stable IDs, links and source blocks | No forced completion, easy skip/branch and return |

For every pattern: semantic headings, keyboard navigation, focus recovery, meaningful empty states, layout locks, predictable link destinations and no project-level backend/debug jargon. Use existing design tokens; avoid creating a second CSS system. No invented learning achievements.

## Direct editing, modest Home/Projects-overview refresh and optional imagery

The owner authorises **small quality-of-life improvements to both existing landing surfaces**, not a wholesale redesign. Keep Home and the Projects overview as distinct routes with their basic function intact; the persistent Notes dock is already global.

### Minimal but worthwhile Home and Projects changes

- **Home:** remove the synthetic test fixture banner from normal learner display, empty Recorded-work/coverage explanations, unnecessary empty panels and duplicated oversized navigation shortcuts. Make limited spacing/hierarchy improvements only; do not invent new recommendations, statuses, progress dashboards or a second Notes link.
- **Projects overview:** retain the existing directory with the shared **All/Computing/Languages/Other** header icon cycler, a simple device-local **Cards/List** toggle, fully clickable Project rows/cards, readable titles, optional short descriptions and optional thumbnails derived from existing covers. Remove obsolete New Project / Create with GPT actions and unrelated Independent questions link. No sorting/favourites/status/creation management system or wholesale directory redesign.
- Keep TEST ONLY fixtures accessible through explicit developer/test navigation, not everyday discovery. Retain records.
- **Wider app:** remove redundant handoff, task-pinning, record-management and empty context wrappers where present in Library/Articles, Projects/Steps, Practice/Activities, Your Work and Tools. Preserve useful article contents/TOC/diagrams/code, legitimate navigation, tools, Notes and existing Practice behaviour; **no substantive Practice/Activity redesign**. Confirm the Notes dock leaves a practical reading area at observed desktop/mobile sizes using the existing resizable system.
- Other Home and Projects-overview product architecture remains a separate future design question.

### Compact global learning-scope switcher

- Retire the large Computing/Languages dropdown and all its extra menu items from the top bar. Use a single compact cycling icon button driven by existing scope state. Each activation advances All → Computing → Languages → Other → All and visibly replaces the icon; do not introduce an extra popover or control. Retain current-scope selection across ordinary navigation as before. Make the button keyboard-operable and ≥44×44 CSS px tap target with visible focus, an accessible current/next-state label and optional discreet hover tooltip.
- Find/reuse the **former Computing and Languages icon assets** if still legitimately available in native/history. Create matching original SVG icons for All and Other (Other may use varied circle/square/plus shapes inspired by the screenshot but not copied from a third-party icon). Align size, stroke/fill weight, theme tokens and contrast; no unlicensed Noun Project download or need for a new image-generation feature.
- Map All to unfiltered browse, Computing/Languages to their existing scopes, and Other to existing unclassified Projects. Do not create a new `other` database field or a second Projects selector. Language-specific navigation should remain discoverable in Projects/Library content rather than in a growing header menu. Avoid changing the underlying selected scope as a side effect of opening a Project.

### Projects overview: lean implementation contract

- Reuse the existing `learningScope` classification/filter logic (`computing`, `languages`, `unclassified`) for the three displayed categories plus All. **Other** is a friendly label for records outside the two named learning spaces, not a third independently maintained family schema. If a Project has both computing/languages scope it may appear under either filter, once in All. **Replace the global header's large dropdown** with one compact icon button cycling **All → Computing → Languages → Other → All**. The displayed icon is the selected state, changes immediately on click and uses the same scope/filter state throughout the app, including the Projects overview; no second page selector or additional backend preference.
- Cards and List render **the same records**, merely with different CSS composition. List is the sensible mobile default, Cards a restrained desktop grid default; one small toggle stores a device-local preference. No server preference, MCP command, reorder system or extra filters.
- Whole Project card/row must be a semantic accessible link with keyboard focus, not a `div` click handler or separate tiny Open button. Do not nest Edit buttons in the link; Project management happens inside the Project.
- Show title, at most a small optional thumbnail, and an optional **brief descriptive text** (~1–2 sentences/lines) about the Project's purpose. GPT authors this on creation, and the learner can edit it in the existing Project Edit interface; routine conversational updates **do not overwrite a directly edited description**. Do not synthesise achievement/progress summaries on view or append a new development card.
- Prefer the current Project `body`/introduction and `projectCover` as donors. For a distinct card description use at most **one optional field in the existing Project metadata/record contract** if the existing body isn't suitable; do not add a new table or second canonical description. Old Projects can show a short eligible authored excerpt or title alone. Derive a thumbnail crop from the private cover asset by default, without an independent directory-image management flow.
- Maintain one predictable existing ordering; avoid sorting controls, filters beyond the shared scope icon, statuses, progress, activity counters, extra Notes links and decorative placeholder images. Hide synthetic fixtures from ordinary browsing.

### Library: small discovery and reading improvements

- Keep the existing Library→subject→article hierarchy, canonical articles and current search capability. Catalogue subject rows/cards and subject-page article rows should be **fully clickable semantic links**, with clear title and optional existing short description; eliminate duplicate Open links/buttons.
- Search results should open matching articles directly. Use the existing search implementation rather than adding another filter/tool. Basic browser-back/query restoration is useful only if it follows ordinary URL/history state without a new store.
- Article top should be **one breadcrumb/back action, title, then actual content**. Remove GPT handoff/task-pin/record-management chrome, duplicate return controls, generic Related context and Activities panel *before the title*. Place genuinely relevant related content after the article or in a small optional disclosure.
- Preserve prose, headings, table of contents (compact/collapsible on mobile), diagrams, code/copy action, source attribution, rights, deep links and existing Notes docking. Keep keyboard/focus and mobile reading width comfortable. No new source schema, MCP commands, annotation system, recommendations, reading progress, Library view toggle or Practice/Activity overhaul.
- Focused smoke: Library search or subject → article opens with title/content visible → TOC/code remains usable → back works; check the dock doesn't make reading impractical. No broad Library/Practice acceptance suite.

### Low-chrome human editing is a first-class path

The composition renderer is a set of **refined layout templates with editable content**, not a read-only GPT painting. A concise Project menu or single Edit affordance toggles a local editing state. Normal viewing has no per-block toolbars; Edit state exposes inline title/text/media editing and light block controls when relevant.

Initial user-facing operations:

1. Rename an existing Project from its Project page, without changing its canonical ID or deep links. The list, page title and future MCP reads update consistently. Support the same rename from an explicitly authorised GPT/MCP update.
2. Edit eligible GPT-composed text, heading, code/output annotation, question, table, caption and image placement **inside existing template sections**. Offer one small **Add section** choice (Dashboard, Notebook, Workbench, Board, Research, Guide); selecting a pattern inserts that section into the Project **ready for immediate editing**. **No per-block move/hide/lock controls in the initial UI.** Learners directly rename/edit/add sections; GPT handles larger rearrangements and explicit “keep this here” instructions through MCP. No global switch-template, compare-layout or history/restore controls.
3. When an embedded block points at an original Note/Article/Activity or source edition, do **not** edit a copied rendering. Show the original source and route any real content edit to the canonical editor with permissions, exact revision and conflict handling. Some externally sourced or immutable blocks are inherently read-only.
4. **Default edit rule:** routine GPT updates preserve the learner's directly edited text **and its placement**, adding/revising other material around it. The learner may explicitly ask GPT to rewrite that exact text or restructure its placement; clarify once in natural language only if meaning is ambiguous. Do not freeze edited blocks forever, silently overwrite them, or add a visible lock/prompt-per-edit interface. Concurrent edits still use revision conflict checks.
5. Save via existing validated domain/CAS/receipt flow, show a short confirmation or specific conflict, and allow cancelling an uncommitted edit. Retain versioned composition receipts internally so **GPT can inspect and restore a specified earlier arrangement on explicit request**, with preview and confirmation for consequential content changes. No on-site timeline, revision selector or restore dashboard. Keep Notes autosave and draft recovery as-is.

The proposed `apply_project_update` should cover typed `renameProject`, `insertLayoutSection`, `editBlockContent`, `setMediaPlacement` and GPT-initiated `moveBlock`, `setBlockVisibility`, `setLayoutLock`, `restoreCompositionRevision` operations through internal validators. The latter structural operations should not require a visible Site control. The last operation is **GPT/MCP-only**, after selecting an exact prior composition revision and previewing the diff; it must not overwrite or delete original Notes/Articles. Native UI edits and GPT/MCP edits must converge on the **same canonical revision rules**; don't create a second unsynchronised client-only Project editor. Only expose additional public tools if actual host ergonomics demand them.

### Media roles and GPT-assisted creation

Reuse the existing `app/project-cover.tsx` / `lib/project-cover.ts` and private staged asset flow as the donor. Existing cover upload accepts PNG/JPEG/WebP up to 8 MiB and has alt/decorative state. Its current "Create image with GPT" action is a **copy-prompt dialog**: retire that handoff in the new learner experience.

Add optional native presentation roles, with **one image master able to serve more than one role**:

- `hero`: compact Project header/cover image with responsive wide crop, focal position and unobscured title.
- `thumbnail`: small Project directory image, square-ish crop and consistent visual footprint on mobile; default to a generated crop of the cover, permit separate asset override.
- `content`: existing media block inside layouts with caption, meaningful alt text or decorative indication.

Proposed first-pass capability metadata (refine visual geometry with real layout): `acceptedMime: image/png,image/jpeg,image/webp`, `maxBytes: 8 MiB` (reusing current validation), `preferredMaster: landscape at least ~1536×1024`, `heroCrop: wide ~2.2:1`, `thumbnailCrop: 1:1`, `safeArea: central subject; avoid important edge details`. Minamo must show actual responsive crop previews and allow focal-position adjustment. These are **generation/display guidance**, not grounds to reject all other valid image dimensions or create a second asset pipeline.

Expose concise role specs through `get_layout_capabilities`, allowing a GPT chat with image-generation support to produce coherent artwork suited to the Site (typically no baked-in text, suitable contrast/visual balance, optionally style/palette matching the Project). For attaching an image, prefer validated file/asset handoff through an available authenticated MCP upload path if the host supports it; otherwise the already existing private upload is a clear one-action fallback. The MCP server itself cannot assume it can generate an image or retrieve arbitrary ChatGPT media bytes. Do not use public hotlinks or arbitrary generated HTML as a media shortcut.

Model media placements as references to existing authorised assets plus role/crop/alt metadata. Choose whether this extends the existing Project cover property or the revisioned composition after a **bounded** compatibility inspection; never create two competing owner-image truths. Remove/replace assets visually without deleting the Project, its Note/source records or other referenced uses.

**Visual bar:** a Project with no image must still look good. A thumbnail is modest, not a giant poster; the cover is optional, not a new header obstacle. An explicit Edit/Appearance menu is sufficient—no persistent button cluster on every card or image.

## Learner-surface reduction and Note pins (owner refinement, observed V91)

A read-only cloud-browser inspection on a V91 Bandit Project Step identified visible **Pin task**, **Continue with GPT**, **Manage this record and saved learning**, Related context, and a default Recent work panel. The GPT dialog generates an elaborate exact-task copy request with a GPT-scope selector and "Open ChatGPT" link. This is redundant with natural GPT/MCP dialogue and pushes authored teaching material below application chrome.

**Remove these interfaces from the new learner surface**, not merely relabel them or bury them under a different "handoff" menu:

1. Remove `GptHandoff` entry points and associated copy/paste prompt, ChatGPT link, GPT scope and task continuation UI in Project/Stage, reader/Article, Question, Activity and Note pages. Retain source-aware MCP context reads and exact edition links, which serve GPT without an on-site handoff wizard. A compatibility module can remain internally only if a justified legacy use exists; no visible handoff action.
2. Remove **Pin task**, pinned task bars/chips/selectors and task-pinning URL-driven experience. Legacy `taskFamily/taskId/taskStage/taskRendition/taskClosed` deep-link inputs may be resolved safely for old links, but should no longer drive visible task state or leak into new normal navigation URLs. This removal must not touch the new Note-pin action.
3. Eliminate top/bottom wrapper clutter: repeated record-management actions, metadata warnings, redundant related-context panels, mandatory "Recent work" boxes when empty, generic status or backend disclaimers, and duplicated bottom continuation tools. Keep concise breadcrumbs, the real Project/reading content, useful adjacent navigation and the Notes dock. Reinsert actual evidence or work only where it enhances the chosen composition.
4. Treat historical operational prose such as "Checkpoint: do not save an achievement..." in existing authored Study guides as **legacy editorial/system text**, not new Project content to surface by default. Preserve exact original record/edition for inspection and do not automatically rewrite user-authored content. Never add achievement language as replacement chrome.
5. Review CSS/layout and small-screen/keyboard behaviour across page families to ensure removal produces more breathing space, not blank placeholder panels or a new overflow toolbar.

**Note-to-page pin contract.** Reuse the existing persistent `app/notes-panel.tsx` (which already has `currentReadingLink`, `currentCaptureLinks`, `optionalTaskLink` and a Notes autosave coordinator). Add a single clear pin control on the *open Note*, with current-page target resolved from canonical navigation context. Do not create another Notes data editor or repurpose "Pin task".

~~~ts
type NotePagePin = {
  id: string; // stable relationship identity
  note: {family: 'note'; id: string};
  target: {
    family: string; id: string; // server-validated family and canonical ID
    rendition?: string; stageId?: string;
    sectionId?: string; partId?: string; blockId?: string;
  };
  createdAt: string;
};
~~~

This is a **relationship shape**, not approval for a new table. Prefer an extension of the Note's current revisioned link semantics or validated relationship operations; choose actual storage via a short source check. A Note can have many NotePagePins, and a target can have many Notes. Each association is unique for (Note, exact target); attaching twice is idempotent and unpinning one preserves every other pin and the Note body.

- UI: a pin icon on the persistent Notes dock for the active Note; **show the page indicator only if eligible Notes are pinned**, and show the Note's destination list only on demand *inside the dock*, with individual unpin actions and links. No empty pin panel, always-visible destination list, Note-body duplication or automatically expanded related-record list. The current-page target is derived at action time, not from a stale task pin or browser history. Handle the unsaved Note by sequencing its existing save coordinator and the relationship write; no second write pipeline.
- Semantics: user click or explicit conversational GPT instruction only. Reading, route changes, Note opening, section insertion or GPT recomposition cause no implicit pins. Exact source editions and stable Stage/section/Project-block anchors are preserved where applicable. Pins survive reorder/template changes; missing/denied targets are marked as unavailable rather than silently relinked.
- MCP read: existing source-aware `get_minamo_context` / `get_minamo_learning_context` and new `get_project_composition` expose relevant Note-pin relationships under the same owner/rights filters. Reading a Note exposes its eligible target list; reading a page/Project exposes Note associations, target identities, titles and exact edition/anchor when needed. Do not mistake an ordinary citation/context link or recent navigation for an explicit pin.
- MCP write: a small typed `set_note_page_pin` (attach/detach), or an equally explicit extension of `apply_minamo_command`, shares a single validated domain path with the UI. Require exact Note and target, expected Note revision (or validated relation revision), immutable operationId, idempotent receipt and owner permission. If a Note save is still in flight, the pin waits or fails visibly; never report success before the server has committed.
- Distinguish **layoutLock** (a GPT-composed Project block should stay placed/unchanged) from **NotePagePin** (the learner deliberately attached a Note to a page). Neither should use or depend on the removed task-pinning state.

## MCP contract and conversation rules

Suggested new commands, intentionally few:

1. **get_project_composition** — exact current Project, composition revision, eligible linked material and bounded content/coverage, including layout locks, eligible Note-to-page associations and unsupported blocks. On an explicit restoration request, allow a bounded view of eligible earlier composition revisions and exact revision retrieval.
2. **get_layout_capabilities** — versioned template registry, block capabilities, limits and rendering affordances; short enough for GPT to use without a huge tool schema.
3. **preview_project_update** — **optional risk-based** read-only preview for large rearrangements, consequential replacement, ambiguous restorations or destructive operations. Validate proposed records/links, structural changes and permissions, and return a concise diff. **Do not require this call before every ordinary 'Update Minamo'.**
4. **apply_project_update** — for ordinary authorised bounded updates, **validate and commit directly in one call**, with immutable operationId and applicable expectedProjectRev/expectedCompositionRev/source revisions; support typed create/update/explicit restore actions; write canonical content and composition together or not at all. A create operation allocates a new canonical Project ID and its initial composition atomically. A scoped restore operation targets an exact earlier composition revision. Return receipt, changed refs and Project URL.

A routine GPT update should be one visible request followed by one committed receipt; do not create a habitual preview-then-confirm interaction. For potentially destructive/meaning-changing operations, GPT uses the optional preview and obtains owner clarification. Avoid turning these into ten specialised public MCP tools. **A conversational “create a Project for this investigation” is first-class**, without requiring the learner to open the Site or create a blank shell first. An explicit “put this Project back how it was before the TCP reorganisation” should let GPT inspect bounded composition history, preview an exact structural restoration, ask if meaningful content changes would be involved, then commit the appropriate revision without rolling back unrelated canonical Notes. No on-site revision picker is needed. Implement internal validators per block, slot and operation. Rely on existing auth and record-admission boundaries. If a multi-record atomic transaction is not compatible with the current code, prove it in a **short source spike**, then adjust the contract before pretending the new surface is atomic.

### User intent

- **"Update Minamo"** is sufficient instruction to produce a bounded useful update *based on the current chat and admitted Minamo context*. GPT may choose what was done, problems, sources, code and possible next actions, plus appropriate layout changes. It must not fabricate facts, mark mastery or silently trash originals.
- A conversation is not itself a host-visible server transcript. GPT supplies selected meaning and artifacts in the tool call; record whether claims are user-reported, source-derived or independently observed.
- Preserve existing positions and explicit layout locks unless a meaningful content change justifies movement. Group/consolidate repeated developments; do not generate duplicate "learning update" cards.
- If user asks **"How should I lay this out?"**, GPT can propose alternatives with an optional typed recommendation result, and present choices naturally. ChatGPT-host rich interactive controls are an enhancement, **not required** or assumed to be forceable by the MCP server.
- Broad ordinary update consent does not cover removing historical evidence, unwinding rights or destructive changes. Ambiguous targets or major semantically consequential edits require explicit clarification.
- On uncertain network response retry identical operationId/payload and read receipt; do not start another save or silently claim success.
- Tool descriptions should have neutral evidence-first language, removing UI concepts "Checkpoint" and "Saved Learning" while preserving any necessary backwards-compatible internal APIs.

### Proposed request shape (illustrative)

~~~json
{
  "projectId": "networking",
  "expectedProjectRev": 12,
  "expectedCompositionRev": 3,
  "operationId": "unique-retry-stable-id",
  "intent": "owner-requested-conversational-update",
  "contentChanges": [
    {
      "kind": "note",
      "text": "Learner-reported investigation of TCP resets; causes not yet verified.",
      "relatedRefs": ["article:tcp-states"]
    }
  ],
  "compositionChanges": [
    {
      "op": "upsertBlock",
      "id": "tcp-failures",
      "kind": "question-task",
      "title": "Why do connections fail?"
    },
    {"op": "focusBlock", "id": "tcp-failures"}
  ]
}
~~~

JSON above is not an already-implemented API. Specific schema, value/size limits, source refs and relation operations must be selected and validated in code; do not expose an unbounded contentChanges:any write escape hatch.

## Required safeguards, implemented narrowly

- Same signed-in principal and rights-check path as ordinary Notes/MCP. No new sharing, external content import or unauthorised source extraction.
- CAS against both Project and composition state, conflict reporting, immutable receipts, idempotent retry and reversible prior layout.
- Atomic cross-record writes or explicit stop-and-revise if not feasible; no partial Project visible as a successful update.
- Old Journey/Step/deep links and saved Notes continue to open. Stages retain stable IDs when merely reordered; hide/archive view state rather than deleting linked evidence.
- Keep original section/rendition anchors and user text, even when GPT changes presentation.
- Prompt injection in Notes/source material must not become authority for MCP writes.
- Disallow arbitrary generated HTML, script, server execution or source-rights bypass. Future code execution belongs in a separate controlled runtime.
- No fabricated achieved/completed/verified status from chat descriptions. No learner-facing "Checkpoint", "Saved Learning" or backend/provenance chatter.

## Build plan — lean, deployable iterations

**A. Complete learner loop first.** Make **ordinary GPT chat → MCP create/read/update → canonical content + composition write → live Project rendering** work end-to-end before a candidate is judged usable. Resolve storage/atomicity via one bounded source inspection, implement the flat ordered section schema, **adapt an existing description/Stages Project into Guide**, and render meaningful inline text/Notes/code in at least Dashboard and Notebook; do not create another record-card wrapper. Remove GPT handoff/task-pin chrome. Include only the modest Home/Projects-overview cleanup specified above; no wholesale redesign. A no-GPT-create candidate is not an acceptable milestone because the Site has no Project-creation wizard.

**B. Complete six rich layouts, direct editing and the bounded Projects overview.** Deliver Workbench, Board (without drag/reorder controls), Research and Guide on the same ordered-section framework, alongside Dashboard/Notebook. Support responsive internal slots, direct Project rename/inline editing, **Add section → choose pattern → enter content**; no whole-Project switch/comparison, per-block move/lock UI or revision screen. Add optional Project cover and derived thumbnail, one brief editable description, existing-category filter and local Cards/List toggle. Keep internal revisions for GPT-led restoration. Test actual mixed inline content, not a grid of links.

**C. Refine the already-working conversation and secondary features.** Complete multi-page Note pinning/MCP readback (conditional indicators and on-demand destinations), GPT-assisted history restoration and image transfer where supported; finish a compact Library subject/article navigation and chrome cleanup plus other shared-chrome removal without rewriting Practice/Activities; refine design advice and the six layouts from actual use. Try ordinary owner-requested conversations (freeform, code/terminal, language or hardware, interrupted return) and improve promptly. **GPT creation and routine updating belong to A, not C.**

This is an implementation order, not a mandate to wait for completion of huge suites between every Sites version. Authorise and publish reversible candidate increments as soon as a native build and directly relevant invariants pass. Owner usability feedback determines what to improve.

## Tests and release policy — deliberately short

Under [SITES release workflow](SITES-RELEASE-WORKFLOW.md):

- **Docs-only PR:** check links/structure and write the PR. No package install, build, full suite or Site deployment.
- **Routine UI/layout candidate:** production build, focused changed-path smoke/assertions, check protected native source identity and audience/bindings, deploy and check published URL/status. Full pnpm test, full Playwright suites, nine synthetic histories and long acceptance reports are **not** release gates.
- **MCP persistence/atomic command change:** focused disposable-D1 transaction tests (success, CAS conflict, duplicate retry, denied owner, partial failure) plus build; no unrelated full corpus.
- **Auth/schema/recovery/permission change:** verify the directly affected safety invariants and stop on failures. Do not use the fast policy to justify unreviewed destructive migrations or identity changes.
- **After deploy:** one short authenticated Project read/write and MCP receipt readback, where relevant; note skipped checks honestly. If a serious issue occurs, revert to an immutable saved Sites version. Do not run hosted learner scenario controllers or broad corpus acceptance by default.

A brief release receipt is enough: public/native pins, focused checks, deployed version, audience/bindings unchanged and known limitations. Do not make a 30-minute full test run, broad public/native diff, multi-model handoff or cloud-browser marathon mandatory for routine owner-requested iterative production updates.

## Acceptance is product usefulness

Initial success is a coherent **end-to-end GPT-created and GPT-updated** Project page showing real learning content inline, not generic record/link cards. The Projects overview must then show title, editable purpose description, optional thumbnail and accessible Cards/List/category navigation without adding a management interface; Library must become easier to enter and read without a new content system. Verify in a **short targeted UI observation** that the handoff dialog, task-pin controls and redundant top/bottom chrome have disappeared, while meaningful reading and Notes remain reachable. Measure: unnecessary navigation, time to find current work/related evidence, unnecessary generated blocks, layout stability, correctness of unchanged originals, ability to add/fill a layout section without a wizard, simple user edits and a Project directory reflecting title/thumbnail changes; no Home/Projects landing redesign. At the owner's request, bespoke learner scenarios should be trivial to specify and run (e.g. five particular transitions, a long planning conversation, code review, or live JLPT N5 grammar chat), but no owner-as-test fixture or scripted scenario replay is automatic. For image/editing, test a rename from the Project overview, a Stage/description Project adapted into the same renderer, a direct edit preserved on a routine GPT update but revisable on explicit request, upload/replace/crop of a cover with a derived thumbnail, and a Project without an image. For Board, confirm grouped presentation without drag controls. Short browser observation should confirm reduced Library/Article chrome and usable Notes dock space; do not launch a Practice/Activity testing programme by default. For Note pins, a focused case is sufficient: pin the same Note on two different pages, read the associations in MCP, recompose a Project, unpin one and verify the Note and the other pin persist. Collect owner feedback early on the deployed candidate. Do not count schema pass or synthetic test count as proof of a better learning experience.

## Open decisions for the draft PR

- Presentation document storage and transaction integration.
- Exact block registry and each template's internal slots within the **flat ordered section model**; nested template trees are deferred.
- Initial layout defaults and how GPT chooses/inserts/rearranges sections in an explicitly requested update, without an on-site whole-Project layout switcher.
- Exact single-menu Edit/View interaction, compact Add section pattern chooser, native source edit handoff, and how explicit learner edits survive later GPT recomposition.
- Bound MCP revision-history read/preview/restore semantics, including how to distinguish restoring a past *composition* from editing canonical learner content.
- Hero/thumbnail crop defaults and exact existing private asset role extension; do not add a custom image subsystem unless required.
- Reuse the existing learning-space category state and Project intro/cover metadata for the directory; at most one optional short-description field and device-local view toggle. Preserve full-card accessibility.
- Reuse existing Library search/subject/article components for content-first navigation; no new Library data/MCP layer.
- Project composition and GPT-managed preservation flags are owner-scoped server state, not an additional device-local layout preference or visible lock UI. Explicit Note-page pins are persisted shared relationships.
- How a user sees meaningful changes without a "Saved Learning" area.
- Host optional rich recommendation UI versus always-conversational choice.
- Minimal idempotent conversion/read adaptation of old description/Stages into the Guide section schema, preserving deep links/editions; compatibility handling for retired task-pin query parameters and handoff entry points.
- Which page identities/anchor depths are pinnable on day one, and the lightest validated Note relation storage compatible with existing Notes autosave.

No coding, migration, merge or Sites publication is authorised by this document alone.
