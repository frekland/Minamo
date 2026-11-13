# Minamo Project reader — first presentation slice

Status: **Draft development brief; implementation not yet started.**

Baseline: `main` after [PR #10](https://github.com/frekland/minamo/pull/10) merge `811222cc6391e824cd15d658b86a85113d726963`. PR #10's deterministic reading projection, canonical identity guarantees and usable routine MCP authoring are complete and accepted. Do not repeat the V177 source audit, reconcile Sites, or redesign MCP schema.

## Purpose

Build one genuinely coherent Project reading experience, then one **functional**, optional mode for related evidence/translation/explanation. Avoid trying to cosmetically distinguish six entire Project layout patterns. A single Project may include prose, related source excerpts, tables, language components, runnable code and exploration without choosing one rigid template.

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

### 2. Add one real page/context-level mode: compare related passages

When a context already contains explicit linked topics or passages appropriate for comparison (for example Japanese source and translation, a source and its explanation, or two research viewpoints), provide a clear opt-in compare presentation. Reuse the **existing exact** context/topic IDs and relationships, rather than copying text or inventing semantic associations.

- The comparison must visibly present two selected, exact passages side by side at desktop widths and stacked at narrow widths.
- Users must be able to return to ordinary reading quickly; do not silently switch modes based on a model-inferred intention.
- Preserve existing reading features inside each presented passage (e.g. ruby/furigana and TTS, source links, annotations/contributions where supported).
- If no eligible explicitly related pair exists, the default reader stays intact: no empty compare UI and no artificial pairs.
- Do not build a new cross-record reader/data-fetching subsystem merely for this first slice. Defer unsupported external or cross-rendition cases with a clearly stated limitation.

The interactive runnable workbench is the **next candidate**, not part of this commission, unless it can be enabled entirely through existing components without broad scope.

### 3. Responsive experience and interaction details

Implement against desktop and narrow/mobile views. Ensure readable tables, code blocks, topic navigation and comparison controls without horizontal page overflow or nested scroll traps. Maintain accessible keyboard/focus and screen-reader labels, sensible back/forward or deep-link behaviour, and reduced-motion preferences.

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
- **Compare:** opt-in mode displays two explicitly related existing passages with correct identities and content, returns cleanly to default, and degrades gracefully when no comparison is eligible.
- **Desktop + mobile:** examine actual deployed UI at desktop and mobile-sized viewports; check reading, compare stacking, tables/code wrapping or scoped scrolling, no page-wide overflow and usable controls.
- **Japanese:** furigana and pronunciation/playback survive; **computing:** code and interactive reading remain usable; **research:** exact source/interpretation relationships remain understandable.
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

The first implementation should make one familiar reader substantially more pleasant and provide one genuinely different comparison behaviour, rather than implementing six cosmetic templates. Deferred: runnable workbench mode, research-wide multi-source comparison, broad navigation redesign, new rendering metadata and further visual systems. Record evidence before choosing the following slice.
