# Minamo Project reader — first presentation slice

Status: **Draft development brief; implementation not yet started.**

Baseline: `main` after [PR #10](https://github.com/frekland/minamo/pull/10) merge `811222cc6391e824cd15d658b86a85113d726963`. PR #10's deterministic reading projection, canonical identity guarantees and usable routine MCP authoring are complete and accepted. Do not repeat the V177 source audit, reconcile Sites, or redesign MCP schema.

## Purpose

Build one genuinely coherent Project reading experience plus a **relationship-aware, source-anchored** way to consult related evidence, translation or explanation without losing the passage being read. Comparison is a deliberate interaction rather than merely styling two arbitrary documents in columns. Avoid trying to cosmetically distinguish six entire Project layout patterns. A single Project may include prose, related source excerpts, tables, language components, runnable code and exploration without choosing one rigid template.

The **Project and canonical content stay authoritative**. The model supplies educational material and explicit relationships; the reader supplies ergonomic presentation. This is a frontend experience change and therefore does require desktop and mobile visual acceptance after deployment.

## Existing implementation: narrow starting points

- `app/project-reading.tsx`: common `ProjectReading` component; currently selects one visible layout and topic, uses `projectLearningMap`, renders canonical content via `Reader`, includes desktop section tabs, a mobile section selector, context-related links, contributions and per-topic edit actions.
- `app/project-reading.css`: the common responsive reading layout and navigation. `pc-reading-${pattern}` is present in the reading class name, but the initial audit found the six patterns visually near-identical in the normal reader.
- `app/project-sections.tsx` / `app/project-sections.css`: existing editing and legacy arrangement semantics; preserve existing authoring/edit interactions rather than porting the legacy six-pattern templates wholesale into the new reader.
- `lib/project-learning-map.ts` and `lib/project-reading-topics.ts`: share the now-tested exact destination, context, purpose, reference and topic projection between website and MCP; do not create a rival learning hierarchy.

Inspect the current implementations before making changes. Existing responsive behaviour, global Japanese furigana, language TTS, contribution controls, code/diagram/interactive parts and reader scroll state must not regress.

## Implementation scope — one coherent slice

### 1. Improve the default reader, preserving the content contract

Present a focused reading surface with consistent hierarchy for Project sections, topics, context, related material and passage content. Reduce redundant headings, controls and navigation clutter where grounded in actual observed UI. Keep exact topic and deep-link selection, preserved source/section identity, and clear edit affordances.

The default reader must handle mixed authored content without requiring the owner or GPT to pick one of six whole-Project visual patterns. Avoid new mandatory educational classifications or auto-generated achievement/checkpoint metadata.

### 2. Add one real page/context-level capability: source-anchored related reading

Keep the user's **primary passage** clearly in view while allowing an explicit second, related passage to be consulted in a contextual pane. For suitable content, this becomes a side-by-side comparison at desktop widths and a stacked disclosure/view at narrow widths. Examples: a saved Japanese message with its explanation, code with an associated observation, or a research source with a declared interpretation.

- Reuse the existing canonical `sectionId`/`partId`, topic/context IDs and author-declared relationships. Never generate duplicate canonical content or another learning hierarchy.
- Make the secondary passage **opt-in** and easy to close; the primary reading location stays authoritative for the current topic, deep link, saved location and `onVisibleTopic`. Do not infer a study goal, automatically switch modes or generate mastery/progress records.
- Distinguish **Read** (one focused passage) from **Inspect related material** (source-anchored context) and **Compare** (two visibly related exact passages). These are contextual affordances, **not** three mandatory top-level tabs or a new Project-wide mode taxonomy.
- Provide purposeful labels explaining the declared relationship, rather than a generic unexplained “compare” button. Keep the source and interpretation/provenance clear without suggesting either is verified.
- Use the same Reader's proven content components where safe; retain ruby/furigana, TTS, code/table legibility, internal links and existing contributions/annotation affordances on the primary passage. A secondary presentation must not break or impersonate unavailable interactions; provide exact navigation back to the full original if a rich interaction cannot safely run there.
- The secondary passage should never become an unguarded edit surface or make writes merely by opening a view.
- This first slice is **within the same existing Project and current rendition**. Existing external-reference links continue to open their canonical destinations; do not build a new cross-record fetching, permissions or rendering subsystem.

#### Deterministic relationship and eligibility policy

PR #10 already validates exact page `source` and `relations` targets, `continuation`, page `purpose`, `contextId` and external `references`. Its internal `relations.kind` values are `explains`, `practises`, `corrects`, `continues` and `related`—**not** `translates` or `contrasts`. The reader must not presume a relation type that is not stored.

1. Candidate links may come from an explicit page `source` pointer or `relations[].target`. Resolve exact canonical `sectionId`/`partId` to a visible local topic containing the target. Build incoming/reverse discovery only from explicit saved relationships; a reverse link does **not** assert the reverse semantic direction. Show the declared direction and kind accurately.
2. Use purpose/title only for presentation labels and grouping **after** a real link resolves. A shared `contextId`, proximity, `source`/ `translation` purpose labels or matching text alone does not prove an eligible comparison.
3. Exclude hidden destination topics, hidden blocks, unavailable parts, unresolved targets and duplicate self-pairs. Respect PR #10's hidden-origin routing to visible destinations. On failure, retain the normal reader and offer ordinary exact navigation if one exists; do not display empty panels or invented pairings.
4. A user may **deliberately select** another visible passage from the same explicit context to compare, but label it as a user-chosen pairing, not as a semantically established relationship. This is optional and must not turn every context into a cluttered pair-picker.
5. `continuation` indicates a saved next destination, **not** evidence of comparison eligibility. External `references` remain exact links; do not treat them as local in-Project passages without a genuine resolver and rights checks.

Prefer a small tested pure helper derived from `projectLearningMap` for candidate resolution and labels, rather than storing new inferred relationships or expanding the MCP contract.

#### Rendering and state isolation

The current `Reader` owns anchors, section/part DOM IDs, selection/annotation handlers, TTS, interactive instances and return navigation. **Do not naïvely render two identical full Reader trees with duplicate DOM IDs or conflicting selection, focus, scroll restoration, editor actions or contributions.**

Keep one primary authoritative Reader. Implement an explicitly scoped secondary rendering strategy (or a read-only exact-passages preview with a link to open its full native reader) appropriate to the current component architecture. Test identical canonical sections appearing in both views. A relationship selection or closing the secondary view must not silently rewrite the primary URL/anchor, chosen topic or last-opened state.

If safely preserving a particular secondary rich interaction requires a broad Reader refactor, defer only that secondary interaction and use an exact “Open full passage” action; **do not compromise the existing primary Reader**. Browser keyboard focus, accessible labels and single-column mobile fallback are required.

The interactive runnable workbench is the **next candidate**, not part of this commission, unless it can be enabled entirely through existing components without broad scope.

### 3. Responsive experience and interaction details

Implement against desktop and narrow/mobile views. Ensure readable tables, code blocks, topic navigation and secondary-pane controls without horizontal page overflow or nested scroll traps. Maintain accessible keyboard/focus and screen-reader labels, sensible back/forward or deep-link behaviour, and reduced-motion preferences. Secondary presentation should visually identify its source and relationship, stack cleanly on mobile, and offer a clear close/back action without displacing the primary canonical reading location. Keep the UI calm and compact: reuse the existing Minamo typographic scale and avoid mode banners, duplicated headings or permanent empty placeholders.

Do not make Project editing, Library, Notes or global navigation redesigns in this reader slice.

## Preservation and architecture boundaries

- No migration, database schema change, canonical text rewrite, new Project record hierarchy or competing MCP contract.
- Preserve live Project content, editions, revision protection, external references, work threads, library links, learner contributions and Note ownership.
- Respect PR #10's exact destination sorting, hidden-origin routing, duplicate canonical-placement prevention and exact reference admission.
- Reuse existing Reader and Minamo design tokens. Keep changes concentrated in reader presentation and any small shared UI helpers/tests.
- Treat `overview` placement of differing `educationalPurpose` material as valid structural behaviour; presentation modes should not introduce server-side automatic re-placement.
- Do not invent artificial lessons, learner accomplishments, required exercises or learning progress records.

## Acceptance: real experience, not only local snapshots

Use isolated **synthetic** Japanese, computing and research Projects already available from PR #10, or create specific synthetic fixtures if needed. Never modify genuine personal Projects or Notes as test material.

- **Default reader:** exact route, section/topic navigation and mixed prose/table/code/interactive components all render correctly; canonical passage identity and content preserved.
- **Source-anchored compare:** opt-in presentation shows the primary canonical passage and an exact explicitly related secondary passage; direction/kind of the declared relationship is labelled correctly; no copied canonical content; closing returns to ordinary reading at the same primary passage.
- **Eligibility:** test valid outgoing `source` and `relations` references, explicit reverse discovery, same-context material with no relation (must not be paired automatically), manually selected user pairing (clearly labelled), hidden destination/hidden block, unavailable or missing target, self-reference, `continuation`-only metadata, and exact external links that must remain links.
- **Dual-view isolation:** test two passages in the **same canonical section** for duplicate DOM anchors/IDs, selection and annotation behaviour, focus, scroll, `onVisibleTopic`, primary topic state, return navigation, TTS and contribution rendering. Do not claim all secondary interactions work unless personally exercised; safe read-only secondary fallback plus exact full-reading navigation is acceptable.
- **Desktop + mobile:** examine actual deployed UI at desktop and mobile-sized viewports; check reading, compare stacking, tables/code wrapping or scoped scrolling, no page-wide overflow and usable controls.
- **Japanese scenario:** view an original saved exchange while consulting its explicitly linked translation or grammar explanation, preserving primary furigana and TTS and accurately labelling the source relationship.
- **Computing scenario:** consult an explicit observation/explanation alongside source code without losing the original code, legibility, or existing interactive tools.
- **Research scenario:** view an original excerpt and declared interpretation side by side; make source and interpretation provenance intelligible, with no invented causal or evidential endorsement.
- **MCP compatibility:** a Project created or added to through the already-accepted routine append contract remains readable. No new schema work is needed.
- Regression tests targeted to changed UI/state behaviour and the exact mapping it consumes.

## Work efficiency / release process

1. Implement one bounded frontend slice on this existing draft PR branch.
2. Avoid rebuilding or retesting the unchanged PR #10 backend baseline. Run focused UI/reader tests; one typecheck and one production build after changes stabilise.
3. Commit and push actual code, tests and supporting design notes to this PR. No unrelated refactor.
4. Deploy to the **existing Minamo Site** only after locally qualifying the change, preserving application identity and user data.
5. Inspect the actual deployed reader in desktop and mobile contexts; fix implementation-specific failures, regroup corrections and redeploy only if needed.
6. Record the precise GitHub application commit, native Sites source and deployment receipt, plus tested/untested acceptance. Do **not** merge this PR without owner review.

## Deliverable and deferred work

The first implementation should make one familiar reader substantially more pleasant and provide **one genuinely different source-anchored relationship interaction**, rather than implementing six cosmetic templates or a generic two-column document widget. It should feel like working *with* linked learning material, not navigating between copies of unrelated pages. Deferred: runnable workbench mode, research-wide multi-source comparison, broad navigation redesign, new rendering metadata and further visual systems. Record evidence before choosing the following slice.
