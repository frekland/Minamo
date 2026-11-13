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

`pnpm run typecheck` passed and `pnpm run build` completed (with the existing large-chunk and externalization warnings). The focused Project/MCP/UI, source-rights, authoring-boundary and retired-route regression selection passed **55/55 tests**. The adjacent Question and Library manuscript route selection passed **26/26 tests**. Three stale assertions were updated: a legacy batch test invoked a Note write as GPT; a retired-route test expected `record_minamo_learning_update` in the advertised catalogue; and a preferences test used Note mutation as its read-only preview/restore positive control. They now test owner website Note writes, server denial of GPT Note writes, and permitted Question authoring instead.

The full `pnpm test` run completed with **1,496 passed, 241 failed, 4 skipped**. The relevant retired-checkpoint test file passed in that run, as did PR #9's Project-map, targeted-authoring, Note-denial, history and UI tests. The remaining failures are spread across older Activity/Attempt, checkpoint-continuity, catalogue and UI-contract suites; this broad historical suite is not passing. It was not rerun against the baseline commit, so these failures are reported without claiming they are baseline-only or caused by PR #9. Automated source, component and deterministic fixture results do **not** establish live MCP behaviour or visual/browser acceptance.

## Acceptance boundary and environment

The current native Minamo production source was fetched read-only as V175 and compared with PR #9's V175 PR #7 base. The 1,625 identical shared files include all application/runtime paths; the only two shared-file differences are later documentation receipts. The 92 native-only files are documentation/evidence artifacts, with no omitted application source. See the manifest and verifier in the V175 reconciliation document. The current Site is the former Visual Lab; no separate Lab deployment target is available.

No live MCP call or browser acceptance was performed in Work. The dedicated handoff and browser checklist are separate documents. No Site version was saved or deployed, no production settings or database were changed, and no production learner records were read or changed. The candidate is source-only on the PR branch for subsequent authorized deployment.

## Remaining risks

- Cross-device visual density, keyboard/focus behaviour, screen-reader output, TTS/furigana and interactive controls still need the browser acceptance checklist.
- A normal ChatGPT conversation must verify tool discovery, current owner admission, preference enforcement, retained editions and real client retry/error presentation.
- The implementation's explicit subject/context metadata depends on authors supplying truthful relationships; absence is shown as absence rather than guessed.
