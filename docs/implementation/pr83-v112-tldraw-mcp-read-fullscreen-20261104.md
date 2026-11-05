# PR #83 — V112 tldraw MCP read and fullscreen checkpoint (4 November 2026)

## Release identity
- Existing Site: https://minamo.jscymru.chatgpt.site
- Saved Sites version: **V112** (`appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_b579f3a295a88191802fcb7889c21e24`)
- Native source pushed and packaged: `60d8acef0f8331fe2c18277bdef1e8c61f54f561`
- Deployment: `appgdep_6aeb4ca3cb8881919107ce9aeca84bd3` — **succeeded**, MCP true, runtime environment revision 10
- Existing **custom** audience policy revision **1** was retained. No migrations, resets, asset revocations or real learner-record writes.
- PR #83 remains **draft and unmerged**; source is mirrored into its existing branch. The five changed/new implementation and test files were compared by Git blob SHA and matched the native V112 source; `lib/domain-handler.ts` also reconciles existing native-only V111 code drift.

## Stage 1 — implemented
1. `get_project_drawing` MCP tool: requires exact Project ID + directly declared Drawing Note ID. Checks owner identity, generation, current Project eligibility, Note rights and the immutable attached document. Bounded paged shape inventory (text, type, stable ID, coordinates, geometry, pages, bindings) and optional `expectedNoteRev` revision pin.
2. `includePreview:true` explicitly opts into a private **MCP image content block** from the Note's `drawing-preview` attachment. The raster is not copied into the JSON response. No remote URLs, public exposure or external model API. A missing/oversized/revoked preview is honestly reported, without changing the source document.
3. Authenticated browser tldraw Save now attempts a bounded JPEG rendering of the current canvas page and attaches it to the same Note revision as the immutable JSON snapshot. Failure to produce a preview **never prevents saving the canonical drawing**. Existing V111 drawings have no preview until they are edited and saved in V112.
4. Fullscreen toggle fills the mobile/desktop visual viewport and offers Exit fullscreen/Escape; it does not discard unsaved edits and does not require browser Fullscreen API support.

## Verification
- Focused `tests/pr83-interactive.test.mjs`: **6/6 pass**. New synthetic test verifies actual `/mcp` text + image blocks, exact persisted shape text, stale revision rejection and independent-other-owner denial.
- `pnpm run typecheck`: **PASS**.
- `pnpm run build`: **PASS** on the deployed source.
- The comprehensive `pnpm test` suite was started and was still running when V112 was deployed; **no full-suite PASS is claimed**. Previous duplicate-case build warnings are inherited and outside this specific stage.
- **Hosted UI acceptance remains outstanding:** confirm fullscreen operation/scroll on authenticated mobile and desktop, save a synthetic canvas, read its fresh preview via the installed MCP, and confirm image-backed rendering is accurate. The tool catalogue may require owner plugin reinstall/refresh. No claims about real user image contents are recorded.

## Stage 2 — owner-approved next commission in this conversation
Add bounded `apply_project_drawing_changes` MCP operations to create/reposition/style/edit/delete supported shapes by stable IDs, under exact Note revision + generation and existing atomic Note command receipts; keep image assets/private media, other shape IDs, original Note prose and unrelated Project content untouched. Read back from MCP, verify browser rendering, and **deploy as a separate version with its own PR checkpoint**. No autonomous unrequested edits, no whole-canvas replacements, no claims of learner achievement. Reuse native tldraw schema rather than adopting a separate chat/agent architecture.

## User action
After the V112 tool refresh, reinstall/connect the **existing Minamo personal MCP plugin** if the new `get_project_drawing` is missing. Then explicitly verify the live installed tool. Keep the same plugin and same Site; do not create a new app or change access.
