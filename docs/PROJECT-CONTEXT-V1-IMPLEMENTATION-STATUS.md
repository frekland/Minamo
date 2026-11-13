# Project context v1 — implementation status

## Scope and decisions

This work builds on PR #7 / V175 (`1fdfb8bd5f5a66b820921009def67a0cf6e519f9`) in PR #9's `feature/project-context-reader-mcp-v1` branch. It keeps the existing canonical Project sections, part IDs, layouts, reader, Notes, learner contributions and saved editions as the source of truth.

- **Content-first Project view:** the shared exact topic projection feeds both `Explore project` and the MCP outline. The regular reader, section navigation, original rendering, interactive parts and authored cross-layout placements remain available. Existing Projects without named reading pages use a read-only compatibility projection; there is no migration or inferred lesson category.
- **Relationships:** reading pages carry explicit purpose, provenance, source, internal exact passage relations, exact external reference identity and explicit continuation. External destination `{family,id,rendition,sectionId,partId}` is separate from source page `{blockId,pageId,contextId}`. Canonical material is not duplicated to make an index.
- **Targeted authoring:** `update_project_learning_material` adds new typed parts to one exact existing Project section and page, with optional internal relations, continuation and external references. It does not rewrite existing parts. `append_project_learning_material` remains available for a genuinely new topic. Both use the existing atomic Project update pipeline, owner preferences, CAS and operation receipts.
- **Notes ownership:** GPT Note writes fail in the shared command layer and in the Project batch and learning-update services. The Note pin and learning-update write tools are not advertised. Reading an eligible Note and ordinary learner Note create/edit/pin remain supported. No existing Note is changed by these rules.
- **History and continuity:** `read_project_changes` returns bounded itemised metadata changes for Project title/description/cover, favourites, layout sections/blocks/locks, reading-page metadata and exact record relationships. An explicit saved continuation remains distinct from last-opened UI state, save history and learner-supplied evidence. No mastery, execution, or progress is inferred.
- **Large reads:** the outline is metadata-only and capped at 180 KB; exact reading is bounded to eight pages and 85 KB, with clear errors instead of silent truncation. The shared projection has a large synthetic fixture.

## Automated verification

Automated checks exercised Japanese language material, a computing activity and research relationships; existing Project compatibility; missing/unavailable relation targets; large named topic maps; targeted preview/apply/replay; exact source and destination identities; preservation of old text and historical revision; itemised metadata history; Note write denials and normal learner Note writes; and the existing Project map/edit paths.

`pnpm run typecheck` passed; `pnpm run build` completed; the focused Project/MCP/UI and neighboring Note-ownership regression selection passed 57/57 tests. A `pnpm test` full-suite run was started but interrupted before completion after failures appeared across unrelated Activity, continuity and build-artifact suites; it is **not** claimed as passing and those unrelated failures were not triaged here. Automated source, component and deterministic fixture results do **not** establish live MCP behaviour or visual/browser acceptance.

## Acceptance boundary and environment

No live MCP call or browser acceptance was performed in Work. The dedicated handoff and browser checklist are separate documents. Production and genuine learner Projects were not changed.

No safe Visual Lab deployment was made. Sites currently resolves the recorded Minamo project identity to production V175 (`daf07483cbbc737de4283317271af5dca3776bb0`), while the legacy PR #99 material identifies that same recorded identity/URL as a private V165 Visual Lab and its saved V165 source (`f0c314a0004ff1c42101431134a8d2d19117870e`) is not the PR #9 baseline. The available Sites record does not expose a separately reconciled Lab target/archive. Deploying would risk replacing production or Lab data/capabilities, so the candidate remains reproducible from the PR branch.

## Remaining risks

- Cross-device visual density, keyboard/focus behaviour, screen-reader output, TTS/furigana and interactive controls still need the browser acceptance checklist.
- A normal ChatGPT conversation must verify tool discovery, current owner admission, preference enforcement, retained editions and real client retry/error presentation.
- The implementation's explicit subject/context metadata depends on authors supplying truthful relationships; absence is shown as absence rather than guessed.
