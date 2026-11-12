# Interface Foundry — implementation architecture and explicit ownership

**A typed presentation framework over real Minamo, not an alternative application.** All interface/API names here are candidate contracts requiring source inspection and working trials against the latest PR40 integration branch. They are not currently installed public MCP features.

## 1. Layering and authority

Existing product hierarchy:

    Authenticated Sites / per-owner D1-R2 / revision receipts / generation/rights
         ↓ (validated current/retained records, renderable source and relations)
    One Workspace + Reader + Notes + layout/presentation preferences
         ↓
    Task/reading/Atlas/activity contextual presentation
         ↓
    Trusted Foundry renderer adapters and finite, explicit local execution

**New Interface Foundry should live inside layers 3–4, not create a new authority.**

- Data/permissions: server-owned, current generation/rights/family/source edition, never inferred from a visible card. Old version and revocation handling precede render.
- Learning semantics: separate authored reading, learner Note, reported output, observed Run, proposed GPT interpretation and formal Development. A UI animation never emits a learning checkpoint.
- Workbench state: ephemeral current pane, selected file/tab, local scroll/zoom, section disclosure, revealed hint state (if purposely persisted, via the canonical approved Activity/Attempt API). This state is not authoritative evidence.
- Writing: retain exactly one Notes coordinator and rich editor/atomic save path. Do not instantiate another NotesPanel per Activity tab, shell mode, graph view or media player. Existing Note flights/retry/tab scopes remain unchanged.
- Navigation: exact current/retained source IDs/sections/parts/selection, existing history, eligible deep links, task and Journey context. A layout change may only alter presentation.
- Execution/media: the Foundry renderer can display outputs; only a genuine sandbox with explicit user Run and receipt can claim execution. Graphics/audio/other Workers initialize on deliberate use and dispose on close.
- Security: GPT-authored Activity manifests are data-only. Server selects validated component kinds and admitted actions; no user-supplied React component names, arbitrary JSX, CSS, event handlers, URL fetches or code execution.
- Synthetic QA: local fixtures remain in dev-only routes/isolated D1 and do not pollute production Home/Continue.

## 2. One adaptive contextual workbench, not new global modes

The existing Classic/Focus/Task modes determine the overall navigation/reading emphasis. A new **contextual workbench** composes existing activity, article, plot, code or learning graph within the same authenticated Workspace:

    ┌──────────────────────── current workspace ───────────────────────┐
    │ Current Journey › Investigation › Activity · source/revision    │
    ├───────────────┬───────────────────────────┬──────────────────────┤
    │ Optional      │ Primary content           │ Optional contextual  │
    │ library/task  │ reader / code / exercise  │ controls & evidence  │
    │ trail         │ graph / plot / canvas     │ tests / properties   │
    ├───────────────┴───────────────────────────┴──────────────────────┤
    │ Copy / open / Run deliberately / GitHub / test / Notes status    │
    └──────────────────────── existing persistent Notes controller ───┘

This is an example of *roles*, not a forced 3-column layout. At 1100 CSS px with a docked Note and code, the UI may need one large content pane plus a compact stacked inspector. No user should be forced to work in three 250-pixel columns. Let content, available container width and presentation preference determine layout; a narrower viewport replaces side panels with accessible sheets/segmented content, not tiny miniature desktop.

Candidate slot vocabulary:
- context-trail: exact task, source edition, why this belongs here, exit/return destination;
- primary: reading, task instructions, code, diagram, plot, game or atlas;
- supporting: associated canonical reading, docs, related queries and prerequisites;
- inspector: controls/properties and a context-focused summary, not a second source of truth;
- evidence: test output, terminal, source/diff, CI, observed/supplied badges and recovery;
- guidance: progressive hints and reflection, spoiler-safe by server admission;
- note-invocation: open existing persistent Notes controller with correct current source/attempt link;
- operations: deliberate user Run, download, GitHub, compare, submit and retry with honest status.

UI should decide prominence based on the chosen **presentation recipe**, available data and viewport, not on a language model's ad hoc CSS. A user can deliberately pin/expand the panel that matters.

## 3. Versioned view recipes vs Foundry artefact formats

Foundry PR39 provides a versioned SOURCE/ARTEFACT registry. Interface Foundry provides a separate versioned **COMPOSITION/INTERACTION** contract. It must not duplicate source-format validation or renderer code.

Candidate recipe descriptor (research; do not treat as current Minamo MCP schema):

    {
      "schema": "minamo.presentation.v1",
      "pattern": "debug-and-repair",
      "patternVersion": 1,
      "title": "Why does this receive loop stop early?",
      "slots": [
        {"slot": "primary", "kind": "code-file-tree", "sourceRef": "starter"},
        {"slot": "evidence", "kind": "test-report", "sourceRef": "tests"},
        {"slot": "guidance", "kind": "hint-ladder", "sourceRef": "hints"},
        {"slot": "supporting", "kind": "linked-reading", "sourceRef": "library"}
      ],
      "actions": ["inspect","copy","open-locally","show-hint","open-note"],
      "preferredFocus": "primary",
      "fallback": "accessible-text"
    }

The **server admits** known schema, pattern ID and version, allowed slots/actions, the actual Activity/Attempt rights and source references. It gives the client an eligible view model. Each action maps to a hard-coded trusted handler or existing domain operation. Unknown or outdated content degrades to a readable static source/unsupported-message view, retaining the original input rather than silently replacing it. No arbitrary remote component dynamic import.

The **client registry** maps allowed pattern to a predictable React layout with tested responsive cases. A recipe may nominate a role; it cannot bypass Notes, owner rights, source revocation, execution isolation, hidden solution policy or the existing system's exact passage mapping.

Example TypeScript conceptual interfaces (not yet code):

    type PresentationPattern =
      | 'read-and-annotate'
      | 'predict-explore-compare'
      | 'debug-and-repair'
      | 'build-and-iterate'
      | 'source-and-diff'
      | 'data-investigation'
      | 'language-practice'
      | 'spatial-lab'
      | 'learning-atlas';

    type PresentationContext = {
      source: CurrentEligibleSource;
      task?: CurrentJourneyOrInvestigation;
      activity?: CurrentActivityEdition;
      attempt?: CurrentAttempt;
      permittedActions: KnownAction[];
      display: PresentationPreferences;
    };

    type RegisteredPattern = {
      pattern: PresentationPattern;
      version: number;
      admit: (descriptor: unknown) => AdmissionResult;
      compose: (context: PresentationContext) => ReactComponent;
      fallback: StaticAccessibleView;
      fixtures: NamedFixtureSet;
    };

Do not copy these concepts into production without proving they fit the actual PR40 contracts and existing Workspace renderer. Materialise the smallest robust abstraction through code and tests, not a universal arbitrary page-designer DSL.

## 4. Navigation and state guarantees

- Current Identity = record family/id/revision/rendition, optional exact Journey stage/Investigation/Activity/Attempt. A switch from code to Library/Atlas or Classic→Task must retain this identity and source coordinates; no heuristic retargeting.
- Editing = separate unsaved local editor drafts, server receipts, sequence, operation IDs and generation scope. One Note editor persists while switching patterns, pane sizes, modes and browser routes. Activity-specific editor drafts do not share keys with Notes or other Activity identities.
- Concurrent/rejected save = original payload and operation retained, a visible calm status and single explicit recovery action. Stale results cannot overwrite newer or different sources.
- Permission revoke/Trash = make a view inert and hide restricted content across graph thumbnails, canvas cards, terminal/plot previews, screenshots and old editions; retain permitted own prose. Do not preserve a cached source for convenience after denial.
- Focus and selection = mobile native text handles/desktop Shift+Arrow, exact canonical code/CJK/math source copy, reader Flag/Annotate toolbar, restore focus after popover/sheet/notes.
- Browser Back/Forward = restore eligible route/view and semantic reading anchor, not just raw scrollTop in a changed layout. Layout preferences are device-local, separate from owner learning records.
- Terminal/Run = xterm-like replay displays a supplied log; it is not a shell. Opening a saved experiment or a chart does not rerun code.
- Visible labels = "Reported by learner", "Observed in browser Run", "Verified CI for commit", "Illustrative example", "Suggested by GPT", "Formally recorded learning"; avoid anonymous green ticks or success decoration.

## 5. Responsive and input behaviour

Test at desktop/laptop, 1280, 1024, 768, 390, 360, 320 CSS widths, actual height constraints, landscape and Android IME keyboard. Use **container queries/layout measurements** for panel decisions where possible, not a single viewport cutoff. Observe Safari/Firefox/Android native differences in actual browser when possible.

Desktop:
- Wide reading measure, navigation modest, code/diff/tests truly usable at 100% zoom, optional inspector and expandable primary; keep no more panes simultaneously than their usable minimum widths.
- Existing Notes dock bottom/top/left/right with drag/resize/focus/minimise/reopen and tabs; avoid overlays over source or terminal controls.
- Multi-file code tab, code/terminal compare and diagnostic view can use split/dock primitives but should not imitate an entire IDE.

Mobile:
- Content first, one useful main viewport; secondary panes through clearly labelled tabs/sheets; no horizontal page overflow from MathML, SVG/GLB, code, data tables or rubies.
- Full-height Notes sheet, explicit open/minimise/reopen, keyboard safe-area/pointer controls and screenshot/attachment remains usable. OS native text-selection must not be hijacked by drag/graph gestures.
- Friendly 44px+ touch targets where appropriate, no hover-only actions or tiny graph nodes without focus/list alternative.
- For Japanese: correct line breaking, furigana reveal/IME and sensible tap targets without corrupting canonical selection.
- For maths: zoom/scroll large formula within an accessible region without clipping, exact source copy and speech fallback.
- For games/audio: deliberate start and pause, resource cleanup, paused on background/resume, reduced-motion and low-resource fallback.
- For tldraw/Atlas: optional canvas, switch to semantic list/navigation when direct manipulation or GPU is unsuitable.

## 6. Design system source

The current Minamo token vocabulary (--mn-* CSS variables, neutral charcoal, muted blue/cyan), typography/presentation controls and existing Base UI/Radix/react-resizable-panels components are initial authority. Audit/normalize them, don't create a competing theme layer. Build semantic tokens (surface/background/border/text/accent/selection/status/terminal/source/provenance), component tokens and limited densities/dark/contrast behavior. Avoid decorative bright gradient dashboards and overloading every label with badges.

Reading and code have different goals:
- Long-form prose: readable measure/leading/heading hierarchy, real paragraphs and citations.
- Code: monospace, clear syntax/file identity, line numbers/errors, readable diff, predictable selection/copy without renderer stealing focus.
- Maths: accessibly typeset expression with exact source copy and appropriate scrolling/zoom.
- Japanese: native ruby and kana/kanji readability, vertical/parallel as explicit variants, IME correctness.
- Visual/media: bounded canvas, alt text/static fallback and simple controls.
- Evidence: typography/status that distinguishes fact from reported/illustrative inference without requiring a colored card for every item.

Keep consistent micro-interaction states: idle/loading/empty/no rights/failed/cancelled/save pending/saved/revoked/stale/partial. Prefer a calm inline status with descriptive text and retry, not modal alerts on routine operations.

## 7. Performance and security engineering

- Lazy-load adapters, editors, MathJax/KaTeX, WebGL, sound, graph, screenshot and sample projects only on user activation/need. Do not load heavy libraries by importing all pattern registries into the Home root.
- When a pattern closes, reliably dispose Worker, AudioContext, WebGL, pointer observers, ResizeObserver, blobs/timers; define explicit cleanup tests. A renderer should not keep stale source after permissions change.
- No model-authored JSX, CSS, HTML, arbitrary animation configuration, remote icon URL or unvalidated dependency list. Component name/action IDs strictly allowlisted.
- No auto execution when a preview enters viewport, no mic recording on open, no importing of untrusted GitHub code into an authenticated JS origin.
- No new persistent client mutation queue; reuse current D1/R2 CAS/replay and one Notes writer, keep isolated display-state preferences local.
- Measure current Home/minimized app baseline before adding dependencies, choose a bound based on evidence and ratchet CI. Feature-disabled views must be absent/unloaded in the default production bundle.
- Development-only specimen routes must be 404/excluded in a production-compiled Worker unless explicitly private and reviewed.

## 8. Acceptance as future feature adapter

Given a previously unregistered but **already admitted and trusted Foundry format**, a small agent should be able to:
1. Pick an existing named pattern and slot(s), attach source/permission-aware renderer through a narrow documented API, add at most limited code/tests.
2. Confirm desktop + 390px + keyboard/Notes preservation + disabled fallback automatically through shared fixtures.
3. Publish a new illustrative synthetic Activity in local D1, read via MCP and show in actual Workspace without inventing a route, component tree, loading indicator, Back/Forward implementation or save semantics.
4. Create a draft PR with evidence without modifying theme/Reader/Notes core or asking the model to decide anew whether to use React Flow vs tldraw.

If this cannot be done without major architectural exploration, the interface-foundry platform is **not ready for Light** and the underlying Pro task should fix the missing interface before claiming completion.

