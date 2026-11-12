# Minamo V2 — CodeMirror 6 and focused reader-friction correction

**Commission status:** documentation-only, awaiting Work implementation on **this PR branch**.  
**Canonical repository:** `frekland/minamo-v2`; base: current `main` at task start.  
**Evidence register (read-only study):** [draft PR #23](https://github.com/frekland/minamo-v2/pull/23).  
**Authority:** The owner selected CodeMirror **6** plus the small reader/UI/MCP items previously classified as easiest candidates, including the adjacent intrusive-flag treatment. This PR does **not** authorise other PRs, unrelated backlogs or corpus rewrites. The eventual Work execution commission may separately authorise merge/deployment.

## 1. Product outcome and implementation boundary

Restore an enjoyable, technically capable **reading** experience in V2, not V1's old SPA or obsolete DOM. In particular:

1. **Actual CodeMirror 6** read-only code presentation, resembling a developer editor with visible syntax, line numbers, copy, wrap and responsive behaviour.
2. Remove repeated reader capture prompts, paragraph-wide tap/focus outlines and redundant chrome, preserving precise contextual **Flag / Annotate**, keyboard accessibility and saved-mark management.
3. Render actual **connected diagrams on mobile** instead of replacing them with disconnected tall cards.
4. Make Library and Journey reading visually navigable: compact route chrome, clearly separated sections, clean media embeds, less intrusive flag styling.
5. Resolve one concrete MCP **command shape/error diagnostic** contradiction without loosening bookmark safety.

**Do not** implement a broader UI rewrite, an in-app executable programming IDE, semantic search, new product features, Notes overhaul, complete learning-continuity reform, automatic checkpoints, AI course rewriting, or new Spotify integration. Leave earlier/other findings open in PR #23.

The change is an **implementation** commission. Do not end with a plan, prototype, unit tests alone or a successful build that still produces the problematic mobile presentation.

## 2. Exact evidence coverage

| Scope | Finding in draft PR #23 | Intended change | Boundary |
|---|---|---|---|
| In | **C-08** | CodeMirror 6 read-only code viewer, proper syntax theme, line numbers, Copy and Wrap | Copy already worked; preserve it. No fake editable source |
| In | **C-09** | Graphical connected flow diagram visible at phone widths, usable pan/zoom/enlargement; text alternative retained | No claim canonical diagram records were corrupt |
| In | **C-03** | Remove persistent `Capture passage` buttons (including introduction/headings where redundant), and the empty utility space they create. Keep precise selection and a non-intrusive keyboard alternative | Do not replace repeated buttons with repeated hidden/tappable paragraph cards |
| In | **C-04** | Plain paragraph tap must not create a blue full-block focus outline or act like a clickable card; stop full-paragraph dotted/solid underline and repetitive saved counts for marks; preserve target-specific Flag/Unflag and mark preview/edit/delete | Distinguish focus outline on unmarked paragraph from actual flag styling |
| In | **C-12** | Deemphasise or collapse admin/provenance/GPT actions on Library readers | Preserve owner-only editing, history and version refresh |
| In | **C-10** | Simplify opt-in external-video surface without duplicated reference/consent prose | Never load iframe, remote thumbnail, preconnect or tracking before user activation |
| In | **C-01** | Compact global/reading chrome and make primary reading/next action prominent on mobile | Do not hide breadcrumb, context or auth |
| In | **C-14** | Strong section/code/example visual hierarchy and comfortable reading spacing | Avoid altering original canonical text |
| In (adjacent) | **C-02**, **partially** | Improve overview scan hierarchy within same reader chrome/layout work | Not a new authored-curriculum rewrite |
| In | **A-10** | Clarify MCP action-dependent command shapes and precise validation errors | `setFlag` target semantics remain unchanged |
| Out | C-05, C-06, C-07, C-11, C-13, C-15–C-17; A-01–A-09, A-11–A-12; Track B | No claim to resolve these | Some may incidentally feel better; evidence still open |

PR #23 remains an **evidence archive**. This PR is where proposed implementation and acceptance live. Its cross-reference must remain `planned / not verified` until independent post-change checking.

### Owner's additional visual clarification (23 October 2026, 16:49 UK time)

In a private Android Chrome screenshot of Stage 1, the owner identified a **blue rectangular outline surrounding an entire text paragraph after tapping**, repeated **Capture passage** text above paragraphs, and excessive blank space between these controls and the reading. The desired behaviour is **plain passive reading** plus deliberate user text selection to expose **Flag / Annotate** — *not* whole-paragraph pressable boxes or generic focus borders on touch. Treat this as a **clarification of existing C-03/C-04**, not a new finding or proof that an ordinary tap saved a flag. Do not upload the private screenshot to GitHub. The separate *earlier capture retained* warning shown below the paragraph concerns version-safe old quotations, and must remain functional.

## 3. Current source map (checked against main, 23 October 2026)

- [`app/reader.tsx`](../../app/reader.tsx): `RichReadingPart`, `partText`, `readingCapture`, contextual selection/marks, `rn-part-utilities` and repeated `Capture passage`, `rn-code`, `rn-contents`, provenance label, saved `ri-mark-trigger`. Maintains canonical rendition/part/UTF-16 anchors.
- [`app/reader-notes.css`](../../app/reader-notes.css): code `.rn-code`, section hierarchy, reader chrome. Its `@media(max-width:600px)` explicitly hides `.rn-declared-flow>.rn-flow-scroll` and shows `.rn-flow-mobile` cards.
- [`app/reading-interactions.css`](../../app/reading-interactions.css): `.rn-annotation-mark` and `.rn-flag-mark` underline rules, touch/selection controls. See [`app/reading-overlay.tsx`](../../app/reading-overlay.tsx), [`app/annotation-preview.tsx`](../../app/annotation-preview.tsx), [`app/bookmark-toggle.tsx`](../../app/bookmark-toggle.tsx) and [`lib/bookmark-targets.ts`](../../lib/bookmark-targets.ts).
- [`app/flow-diagram.tsx`](../../app/flow-diagram.tsx): already renders linked SVG diagram (`FlowFigure`, `rn-flow-scroll`) **and** adjacency card alternative (`rn-flow-mobile`). Other `state-v1`, `graph-v1`, `grid-v1` renderers present; don't regress them.
- [`app/workspace.tsx`](../../app/workspace.tsx): `v2-breadcrumb`, `v2-context-links`, primary `v2-reading-actions`, owner Edit, `Check for updates`, reading edition notice and route UI.
- [`app/journey-route.tsx`](../../app/journey-route.tsx), [`app/learning-experience.css`](../../app/learning-experience.css): overview/stage, roadmap and mobile compact-reader spacing.
- [`app/external-video.tsx`](../../app/external-video.tsx), [`app/external-video.css`](../../app/external-video.css), [`lib/external-media.ts`](../../lib/external-media.ts): opt-in provider player, link, sandbox/referrer, accessible unload. The provider request boundary is **intentional**.
- [`lib/domain.ts`](../../lib/domain.ts): `validateCommand` prohibits `target/active/expectedTargetRev` on actions other than `setFlag`, currently returning `Bookmark state fields belong only to setFlag.` even for apparently record-shaped `target` on `update`.
- [`lib/domain-handler.ts`](../../lib/domain-handler.ts): shared published `commandSchema` advertises a `target` without an action-discriminated condition; applies to MCP and web routes.
- [`app/note-writing-editor.tsx`](../../app/note-writing-editor.tsx), [`app/tools-panel.tsx`](../../app/tools-panel.tsx): **already use CodeMirror 6**; see current `package.json` dependencies. Reuse theme strategies, not their editing behaviour.
- Historical reference only: V1 [`app/reading-highlight.mjs`](https://github.com/frekland/Minamo/blob/main/app/reading-highlight.mjs) and [`app/reading-controller.mjs`](https://github.com/frekland/Minamo/blob/main/app/reading-controller.mjs) used highlight.js for read-only code, checking displayed plain text equivalence. **Implement CodeMirror 6 instead** as owner selected; retain this equivalence/property safety lesson.

Read [`AGENTS.md`](../../AGENTS.md), [`STATUS.md`](../../STATUS.md), [`docs/SOURCE-SYNCHRONISATION.md`](../SOURCE-SYNCHRONISATION.md) and present working tree before editing. If main has moved, reconcile rather than blindly overwriting newer changes.

## 4. CodeMirror 6 viewer — implementation contract (C-08)

### 4.1 Visible capability

Implement a small React client component (suggested `app/read-only-code-viewer.tsx`, exact name flexible) invoked for canonical `part.kind === "code"` from `RichReadingPart` and relevant read-only source/rendering surfaces. Requirements:

- V2's existing `@codemirror/state`, `@codemirror/view`, `@codemirror/language`, `@codemirror/lang-javascript`, `lang-python`, `lang-sql`, `@lezer/highlight` and `codemirror` are installed. No need for highlight.js and **do not add it**.
- For appropriate languages provide syntax highlighting including JavaScript/JSX, Python, SQL and known shell/JSON where supported; unknown languages show legible plain text without inventing syntax. Prefer scoped async loading to avoid large initial bundles.
- **Read-only** requires BOTH `EditorState.readOnly.of(true)` and `EditorView.editable.of(false)`; do not attach edit keys/history/commands that mutate the canonical document. Never save CodeMirror buffer state back to Minamo canonical records.
- Visible language label where known; accessible line numbers, text selection/copy, horizontal scroll by default and explicit **Wrap lines** preference, responsive width, dark charcoal/cyan theme with proper contrast, zoom/200% legibility, and no accidental page-level horizontal overflow. Use `EditorView.lineWrapping` or reconfiguration via `Compartment` if appropriate.
- Lifecycle: mount only on client, dispose via `view.destroy()`, handle text/rendition/language change by safe identity-scoped refresh, prevent stale late-load operations and memory leaks; avoid hydration/StrictMode issues. Render safe plain-text fallback if the CM client bundle fails.
- Copy uses the **original canonical `part.text`**, not highlighted markup, selection rendering, reordered lines or a transformed line-ending; preserve current successful `Copy code` and its recovery text-selection path.

### 4.2 Non-negotiable canonical selection / marks

V2 reader selection is **not** a generic editor selection. Existing mark/flag/annotation targets use `family/id/rendition/sectionId/partId/start/end` and UTF-16 source offsets, including multi-segment selections. The CM6 view MUST adapt to that model; simply mounting CodeMirror and allowing its built-in text selection is **insufficient**.

Engineering instructions:

1. **Bounded integration spike in the actual reader**, not a standalone demo: prove that a CodeMirror `EditorView` read-only selection (`view.state.selection.main.from/to`) maps to an exact `readingCapture` for the corresponding canonical part and rendition. CodeMirror 6 positions are UTF-16 code-unit offsets (documented in its migration guide). Account for selections in a single part, keyboard/native Android selection, existing marks and the parent `Reader` event handlers; never infer anchors from whichever DOM snippet happens to be visible.
2. Connect the selection adapter to the existing context-aware Flag/Annotate popover/operation handler. Do not create a second annotation store or write-on-select behaviour. Explicit user gesture only. If there is a whole-block fallback, it must be secondary and keyboard-accessible, not another permanent `Capture passage` row.
3. Render pre-existing annotation and Flag ranges as appropriately accessible CodeMirror decorations or another selection-compatible presentation, pinned to exact old rendition/UTF-16 offsets. Clicking/focusing the mark must open the existing preview/edit/delete/unflag flow. Handle overlaps and unavailable anchors without throwing or silently retargeting.
4. Test surrogate-pair emoji, combining sequences, tabs, line breaks (including `\r\n`), first/last code unit, multiline selection, long lines, copy-all, old rendition and re-render after updates. If CM document normalises a given input's line endings, **do not claim exact mapping**; implement a tested offset conversion or safe literal fallback for that case. No stale-offset reuse on a changed rendition.
5. If full `EditorView` integration genuinely cannot preserve the exact-selection contract without major regression, keep **CodeMirror 6 as the syntax engine**, using its Lezer/HighlightStyle tokenisation to decorate V2's existing canonical React text segments while retaining V2's capture mapping. Maintain line numbers/wrapping/copy via lightweight viewer chrome. This is a justified bounded fallback, **not** permission to switch back to highlight.js or ship a broken fake CodeMirror.
6. Add an explicit implementation-evidence decision: which mode shipped, why, what full-selection tests passed, known limitations. Never render a second hidden source that mismatches a visible one or creates duplicate focus/accessible text.

Reference: [CodeMirror 6 reference](https://codemirror.net/docs/ref/) and [migration/positions](https://codemirror.net/docs/migration/). The Work agent should re-check installed package versions/current APIs using Context7 rather than transcribing obsolete snippets.

## 5. Compact, clean reader actions (C-01, C-02 partial, C-03, C-12, C-14)

- Consolidate `v2-reading-actions` (Edit, Check for updates, GPT-related administrative actions) and reader `rn-reader-meta` provenance into a **small owner-actions overflow/disclosure** or similarly unobtrusive accessible navigation. Do not remove underlying owner editing, entitlement checks, version revalidation, disclosure of historical/current edition or ownership provenance. A meaningful update notice remains visible **when** a newer edition exists.
- Make mobile Journey entry emphasise **Start/Continue Stage** and current content above administration. Avoid repeated Journey title, large spacer gaps, redundant chips and wrapped action rows. Retain return navigation, breadcrumbs, contextual links and accessible location/state.
- In `app/reader.tsx`, **remove** conspicuous `Capture passage` and redundant `Capture this heading`/intro/description affordances from normal reading (do not merely rename them or replace with per-paragraph ⋯ menus). Eliminate empty `rn-part-utilities` rows and excess gaps where the only function was Capture; retain meaningful `Copy code`, `Enlarge diagram` and accessible mark actions. The normal interaction is **select actual text → Flag / Annotate**. A keyboard-only whole-passage alternative, if needed for accessibility, must be opt-in and unobtrusive (e.g. one reader-level action/mode), never a clickable/focusable tile for every paragraph. Preserve keyboard text selection, focus recovery and Android native selection; never rely on hover.
- Maintain one clear visual hierarchy for article headings, section titles, worked examples, explanatory notes and code, using existing semantic tags, safe typography, purposeful margins/borders. Compact ≠ microscopic; test mobile and 200% zoom.
- Do not rewrite personal reading content or Journey text to fake better section structure, and do not silently remove the saved Learn/Checkpoint mechanism or Stage navigation (C-06 is deliberately not in scope).
- The existing Library initial TOC may remain; long-page persistent navigation (C-13) is **not commissioned** here unless a minimal accessibility correction is necessary to keep the changes functioning.

## 6. Saved marks, flags and reader affordances (C-04)

- Distinguish **flag styling** from **ordinary paragraph focus**. `app/reader.tsx` gives paragraph parts `tabIndex={-1}`, and `app/reader-notes.css` has a broad `.rn-part :focus { outline: ... }` selector. On Android the owner observed a large blue rectangle after tapping ordinary text. Ensure passive paragraphs do **not** appear or behave as interactive cards: an ordinary tap without selecting text/pressing a real link/mark should not change visual state, create a full-block outline, or open any capture UI. Use deliberate focus affordances on *real* buttons/links, and retain appropriate visible focus for keyboard users and deep-linked/previously saved exact passages; do not globally turn off focus outlines or break accessible deep-link location.
- Deemphasise full-paragraph underlining from `.rn-reader .rn-flag-mark` / `.rn-annotation-mark`; give a restrained targeted text marker or subtle edge/icon affordance with focus/hover state. Avoid underlining an entire large paragraph on narrow screens. Keep distinctions between active Flag, annotation, focus and selection, with non-colour indicators and forced-colours behaviour.
- Remove repetitive inline `1 saved` text where it clutters prose; an accessible marker with a useful title/aria-label can expose count/details on interaction. Preserve direct mark preview, annotation edit/delete, Flag Unflag, overlapping marks and saved bookmark/annotation identity. **Do not mistake the unrelated `1 earlier capture retained` / old-rendition safety notice for saved-flag chrome:** retained annotations and revision warnings remain available and truthful.
- Do not change canonical spans, stored records, target hashing, revisions, bookmark identity, the two-action direct selection model or duplicate-suppression. Test touch and keyboard.

## 7. Mobile diagrams (C-09)

- Existing `FlowFigure` renders a proper linked SVG diagram. Stop automatically replacing this view with `rn-flow-mobile` adjacency cards at small widths. On Android/mobile, the **diagram itself must remain visible**, with contained horizontal pan/scroll and a clear discoverable enlarge/zoom affordance.
- Keep an accessible textual list of nodes/edges (`details` or visually hidden alternative as appropriate) and valid descriptive title/labels; avoid double screen-reader narration and giant permanent text cards.
- Preserve `flow-v1`, `state-v1`, `graph-v1`, `grid-v1` rendering and diagram source/expanded view; keep exact authored data and safe validation/fallback.
- Test visually at 320, 360/390, 768 and desktop widths, landscape and reduced-motion/keyboard. A page-width screenshot must show **connected arrows/nodes rather than separated cards**.

## 8. External-video surface (C-10)

- In `app/external-video.tsx` simplify the initial card to a concise original-video title/description, a prominent **Load player** action, compact one-time privacy notice and a direct Open on provider link. Avoid duplicated link-only metadata and nested instruction cards in the normal reading route.
- **Before clicking Load:** no provider iframe, remote provider image/thumbnail, remote preload/preconnect or request, even via CSS. The user must knowingly activate the third-party embed; current privacy boundary stays intact. Keep sandbox, allow attributes, accessible iframe title, unload and fallback link. If a first-party placeholder is used, make it local and non-tracking.
- Use existing safe metadata from `lib/external-media.ts`; no new remote scraping/provider calls. Verify failure fallback and no surprise autoplay.
- Keep optional teaching prose next to the video, but don't bury the actual play action under repeated provider mechanics.

## 9. MCP command-shape correctness (A-10)

Observed contradiction: the exposed preview/apply command schema advertises `command.target` for a record, but `validateCommand` treats `target` as exclusive to `setFlag` and returns the non-explanatory bookmark message for `action:"update"`. The correct existing regular-update shape is top-level `command.family`, `command.id`, `command.expectedRev`.

- Preserve `setFlag`'s desired-active-state, `expectedTargetRev`, passage/record targets, idempotent revision safety.
- Prefer **action-discriminated input schemas** in shared MCP/web registrations: for `create/update/trash/restore` advertise top-level `family/id/expectedRev` and no `target/active/expectedTargetRev`; for `setFlag` advertise `target/active/expectedTargetRev` and not unrelated record-edit data; `seed` remains special. If wrapper/library limits explicit `oneOf`, ensure published description/examples plainly distinguish shapes.
- At runtime reject unsupported mixed shapes with a **precise error identifying `command.target` and expected shape for `action`**, rather than the misleading bookmark-only explanation; avoid silently coercing a record target into an update because that changes contract intent.
- Verify exported MCP catalogue/schema **and installed connected client** after release; server source tests alone do not prove the agent sees refreshed tool definitions. Preserve exact legacy valid payloads, distinct errors, CAS, recovery and no unintended write on rejected requests.
- Add negative and successful preview tests, plus **no record mutation** on rejected preview; use existing tests near `tests/domain-bookmarks.test.mjs`, `tests/domain-http.test.mjs`, `tests/domain-targeted-patch.test.mjs`, relevant MCP envelope/contract tests.

## 10. Work execution sequence — one cohesive implementation

1. Establish `main`, current production/version/source trees, PR #23 evidence and this specific commission. Inspect affected source and tests; check current CodeMirror APIs with Context7. Do not start other PRs or issue #1's unrelated backlog.
2. Build the CodeMirror selection spike **inside** the existing Reader first; demonstrate source-exact capture, mark display, native/keyboard mobile behaviour and fallback decision before widespread styling changes. Reuse V2 dependencies.
3. Implement compact controls, flag styling, mobile diagrams, video presentation and section hierarchy in a coherent responsive design without a new navigation framework.
4. Correct A-10 published validator/schema/diagnostics with shared web/MCP tests.
5. Run automated tests, real browser screenshots/interactions and independent adversarial UX/technical review; fix actual failures in the same Work run. Reinspect representative Journey and Library routes with code, diagrams, videos and saved marks, not just synthetic DOM fragments.
6. Produce one concise implementation/acceptance receipt mapping each in-scope evidence ID to changed code, tests and actual observed post-change behaviour. If executing with explicit merge/deployment authority, follow `docs/SOURCE-SYNCHRONISATION.md` and release only the V2 owner-private Site with identical verified source tree. Installed MCP refresh/reinstall may require the owner's explicit step; only ask if genuinely necessary.
7. Leave PR #23 as an **append-only evidence ledger**; do not mark its incidents fixed based on tests alone or rewrite the original owner observations. A later dated verification note can link to receipts once real deployment/UX is checked.

**No planned sequence of separate owner approvals or multipass research commission.** Use your engineering judgment to complete the authorised change in one continuous Work task, except genuine access/permission blocks.

## 11. Required checks (minimum)

Run `pnpm run typecheck`, `pnpm run build`, `pnpm test`, plus focused browser and protocol tests. No claim of completion before all gates pass, or a limitation is explicitly explained.

- Exact code copy string equivalence including Unicode and newlines; viewer read-only against paste/delete/undo/programmatic doc mutation.
- CodeMirror selection maps to canonical UTF-16 source range and stored mark; Flag/Annotate and existing edit/delete/unflag work via mouse, keyboard, touch/Android.
- Re-render, old rendition, overlapping marks and retained draft recovery do not lose target identity or private content.
- No `Capture passage` buttons or tappable paragraph cards in ordinary reading, including paragraph introduction and heading; normal tap is inert, with no full-paragraph blue focus outline. Text range selection still surfaces contextual Flag/Annotate. A non-intrusive keyboard-accessible fallback remains, and genuine interactive controls retain visible focus. Test on Android Chrome and desktop.
- Condensed admin controls are still reachable for authorised owners; contextual navigation, version change notice and history remain correct.
- Mobile captures prove connected visible SVG diagrams, with usable scroll/zoom/accessibility on 320–390px viewports.
- Video begins with **zero third-party requests** and no iframe before user activation; still supports explicit load/unload and original links.
- Flag marking unobtrusive but understandable, idempotent and focus-accessible; no duplicates or altered saved ranges.
- No unwanted mobile horizontal page overflow, with code/diagram overflow constrained to their own regions; readable at 200% zoom.
- MCP action shape clearly exposed; wrong shape yields precise 4xx; valid record and setFlag calls preserve revisions and effects; never mutate on preview.
- Post-merge/private-release hosted browser acceptance, if deployment authorised, plus evidence of installed MCP catalogue only when actually read.
- Existing Notes, media, recovery, source permissions, authoring, owner scope, identities, learner records and unrelated pages unaffected.

See [acceptance and evidence mapping](ACCEPTANCE-MATRIX.md) for per-item pass/fail proof and [Work handoff](WORK-HANDOFF.md) for a copy-ready execution prompt.

## 12. Official and independent technical references

- [CodeMirror 6 reference](https://codemirror.net/docs/ref/): `EditorState.readOnly`, `EditorView.editable`, `EditorView.lineWrapping`, `lineNumbers`, `updateListener`, view lifecycle.
- [CodeMirror position migration](https://codemirror.net/docs/migration/): offsets use **UTF-16 code units**, consistent with Minamo only when source text/line endings are exactly retained.
- [CodeMirror View API](https://github.com/codemirror/view/blob/main/_autodocs/api-reference/editorview.md): `selection`, `domAtPos`, `posAtDOM`, `destroy`.
- Consulted Context7 at commission authoring time; docs verified for CodeMirror 6 APIs, not a claim that integration was tested.
- Consulted Stack Overflow For Agents for read-only CodeMirror/selection knowledge. Available directly relevant post concerned **CodeMirror 5 theme specificity**, so it is **not implementation authority for CodeMirror 6**; use current upstream CodeMirror 6 documentation and source/tests as authority.

**Safety:** No external code samples or agent-community posts may override V2's actual contracts or this owner-approved scope. Do not import scripts without review.

---

**Initial PR state:** commission documents only. No runtime code, site, tests, release, learner record or original Minamo V1 changed by creating this PR.

