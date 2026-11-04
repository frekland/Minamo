# PR #83 — V105 Project UX polish, release checkpoint and live acceptance

Date: 4 November 2026. This is an append/update handover on draft, unmerged PR #83.

## Deployment checkpoint — committed before browser verification

- Starting production: **V104**; protected native source `16713e81d9952673b2e57ad744941b690cae4390`; public PR head `0e87f34c9d290a67c036f87c8354fd13cd727e0c` at task start. V104 was retained throughout preparation.
- V105 protected native source commit: `565d6e90157ae4db5569eae892c045ff7ef1e25f` (`Polish PR83 project chrome, image fitting, sidebar and furigana controls`).
- GitHub PR branch: `design/v100-plus-flexible-projects-artifacts-test-runs-20261103`. Five matching source files pushed as public branch commits, ending with `9fff78baa85a07a9ffaac3a61cde41ae7bff51ca` before this report. Public/native commit hashes intentionally differ; the changed file contents were synchronized.
- Site ID: `appgprj_6ad8a4e85eb48191accd6e78976b47e3`.
- Saved V105 ID: `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_872213e747808191bc825a056fb04cd8`.
- Production deployment ID: `appgdep_6aeb033c0fec8191989b844b65e069c4`, status **succeeded**; URL: https://minamo.jscymru.chatgpt.site.
- Access readback before deployment: `custom` access, revision `1`, owner role. No access-policy/auth/DB migration, reset or deletion.

## Changes (bounded to the V102 browser findings and owner screenshots)

1. `app/workspace-chrome.css`: removed the sidebar's `margin-top:auto` and 50px top padding that left a large blank area between **Your work** and **TOOLS**, and tightened desktop link spacing. Addresses the owner screenshot of forced sidebar scrolling.
2. `app/project-sections.css`: reduced the very large Project h1, section h2/h3 hierarchy and excessive block/Workbench/Board padding; made Contents links compact understated pills; constrained table/pre overflow and narrowed responsive gaps.
3. `app/project-sections.tsx` and CSS: section width and fold controls are accessible Lucide icon buttons with `aria-label`, `title`, and pressed/expanded states; visually condensed per-block width/edit, record favourite, and Project Edit controls while retaining accessible names and keyboard focus styles. Textual arrangement editing stays visible when explicitly requested.
4. `app/project-cover.css`: on the *full Project page*, show the whole image with `object-fit:contain` and a bounded responsive height; keep existing independent cropped catalogue-thumbnail presentation. Cover editor preview now respects image containment.
5. `app/project-sections.css`: limited existing flashcard presentation improvements (readable scale, image fit, compact toolbar, soft elevation). Deliberately no npm flashcard replacement, schema or persistence changes.
6. `app/semantic-reading.tsx`: for Japanese passages, the existing pronunciation toggle now says exactly **Show furigana** or **Hide furigana**. Other languages retain **Show/Hide pronunciations**.

These changes are presentation-only; the six Project layouts, existing rich components, Python and drawing state machinery, MCP contracts and retained user records were preserved.

## Pre-deployment verification

- `pnpm typecheck`: **PASS**.
- `pnpm build`: **PASS**, finished Vite/vinext production build (existing nonfatal chunk/route-analysis warnings).
- `node --test tests/pr83-polish-components.test.mjs tests/pr83-polish.test.mjs tests/pr83-interactive.test.mjs tests/semantic-rendering.test.mjs tests/project-cover-dismissal.test.mjs`: **8 passed, 1 runner failure**. The failing legacy `semantic-rendering.test.mjs` did not execute an assertion; Node 24 direct ESM import of `katex/dist/katex.min.css` produces `ERR_UNKNOWN_FILE_EXTENSION`. The other eight passed. Esbuild warned of preexisting duplicate cases in `lib/domain-handler.ts`, outside this UI scope.
- No browser interaction claims were made at the deployment checkpoint; browser observations follow below as they become available.

## Live Cloud Browser verification

Pending at initial V105 deployment checkpoint. Test the Project fixture `test-simulation-playground-layouts-20261103`, Japanese passage, favourite, section expand/fold, block expand/edit, flashcards, full cover and sidebar viewport. Save/reload only bounded edits and keep other records intact. Record browser outcomes honestly; the current deployment must remain running even if an issue appears.

## Unchanged outstanding scope

- tldraw V104 rectangle save/reload/edit/conflict tested in the preceding report; image-in-canvas and extended gesture coverage remain outside this polish pass.
- Pygbag actual live graphical output is still deferred/unverified. Avoid a generic packaging service.
- Independent comprehensive UX critique, mobile testing, flashcards at scale, and owner review remain necessary before merging PR #83.
