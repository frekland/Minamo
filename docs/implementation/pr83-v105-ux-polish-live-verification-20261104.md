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

### V105 visual finding and corrective V106 deployment

The first authenticated Cloud Browser screenshot at **1363 × 1023** showed the intended improvements: sidebar Tools sits immediately after Your work with no forced sidebar scroll; the Project title is now one line at a restrained font size; section controls use compact symbols, and the Project Edit action is a pencil. However, the per-block **Edit this block** label still wrapped vertically inside its narrow button. V105 was therefore an *interim* deployment, not accepted.

Correction: `app/project-sections.tsx` now renders real Lucide Maximize/Minimize and Pencil/Close icons with explicit `aria-label` and `title`, retaining `aria-pressed`, Esc focus return and editing behaviour. `app/project-sections.css` removed the pseudo-element/text-hiding trick. `tests/pr83-polish-components.test.mjs` now locates the accessible Edit action by label. A fresh full production build was generated **after** these source changes, preventing a stale archive.

- Focused four-test-file run: **8/8 passed**; `pnpm typecheck` and **new** `pnpm build`: **PASS** (same known nonfatal warnings).
- V106 native published source: `1bb6f9249aa49ae3d5468d01b25f84b672fb29a2` (local pre-workflow commit `3641774e1c37d79b15ec81eb1f1f6a09ddc0d7d3`).
- Public PR branch code sync commits: `1e8d3d9be4164d6a15d4e36f6722047083b43db6`, `d0094dd3c8f91aea3bcde9c1ef9e08d09db525d6`, `e2a67b128600724cc58cd1b85b8c2e4fafb907c8`.
- Saved **V106**: `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_9587b9bc0dc88191a2da5bedf734a9aa`.
- Production deployment: `appgdep_6aeb04e08d88819191c08678d8de2846`, **succeeded** at https://minamo.jscymru.chatgpt.site. Access policy preserved.
- Japanese toggle live DOM text on V105 verified as `Hide furigana` (state enabled), with correct space; live contents of the test Project retained.

**V106 post-deployment browser acceptance still pending at this checkpoint.** Test the Project fixture `test-simulation-playground-layouts-20261103`, Japanese passage, favourite, section expand/fold, block expand/edit, flashcards, full cover and sidebar viewport. Save/reload only bounded edits and keep other records intact. Record browser outcomes honestly; the current deployment must remain running even if an issue appears.

### V106 acceptance and bounded V107 flashcard finish

Authenticated Cloud Browser on V106 (desktop 1363 × 1023) tested actual learner content:

- **PASS** sidebar: TOOLS, Practical tools and Trash are all adjacent to Your work and visible without a nested sidebar scrollbar in the observed desktop viewport.
- **PASS** Project hierarchy: the two-line, huge simulation Project title became one restrained line; section titles are readable and compact; section expand/fold buttons and block edit/maximize are icon-only with accessible names. Fresh screenshot showed no vertically wrapped labels.
- **PASS** section collapse/reopen: first section's `aria-expanded` became `false`, block hidden; reopening restored content.
- **PASS** scoped block maximize: `Our hypotheses` received `pc-expanded` and its button became `Restore width of Our hypotheses`; the table visibly expanded across the available width. Subsequent Playwright clicks on that restore control timed out despite a visible match, so the reversal was *not* independently accepted in this pass. The component test covers restoration without remount.
- **PASS** direct edit and Cancel: opening `Edit Our hypotheses` showed Project Save/Cancel controls; Cancel returned to read mode without a write.
- **PASS** Japanese: live button toggled from `Hide furigana` to `Show furigana`; a desktop pointer click restored `Hide furigana`. The passage text and kanji remained visible.
- **PASS** image-backed flashcards: in `test-pr83-release-20261103` opened the collapsed Flashcards section, flipped card 1 to answer, navigated to card 2, returned to card 1 front. Both front/back private images completed loading with natural width `1448`, and were visibly rendered and contained in the card. No save was attempted or needed.
- **PASS** full Project cover: `test-sudoku-20261103` presented the *whole* generated Sudoku illustration with its large text and grid intact; lateral letterboxing is intentional. MCP `query_minamo_records` independently located the existing synthetic Project at revision 10, unchanged; it was not recreated or edited.
- **Observed, not changed:** TEST fixture retained older drawing-draft recovery UI from V104. No draw/save operation was repeated here. An attempted Projects catalogue load showed ordinary Project tiles, but the Sudoku synthetic thumbnail was **not directly viewed** in the bounded catalogue session.

The remaining visual defect in this pass was the flashcard toolbar's loud bright-blue, chunky buttons on a dark surface. Targeted CSS uses neutral controls with a subtle accent on the reveal action, without changing flip/navigation logic or installing a dependency.

**V107 release checkpoint (committed before final V107 browser inspection):**

- Change: `app/project-sections.css`, local pre-workflow commit `bcca5aba6065f981c3e3e372609e5a4654177566`; public PR source commit `70cc259f4e8daedbbec26d78ec3c8afdf4de322b`.
- `pnpm typecheck`: **PASS**; fresh `pnpm build`: **PASS**. Four relevant focused test files had passed **8/8** on V106; CSS-only V107 did not change JS, test state or schemas.
- Protected published native source: `1b151ed60e7572ea428176b3b1a78e65f44e4057`.
- Saved **V107** ID: `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_cf6cecb651fc81919ec05889d91d67f0`.
- Deployed version `appgdep_6aeb077370d4819198f5183b8a243838`: **succeeded**, https://minamo.jscymru.chatgpt.site. No auth/access, DB, Project/Notes/Library or MCP change.

### V107 post-deployment browser verification and final disposition

An authenticated Cloud Browser re-opened the existing `test-pr83-release-20261103` technical fixture on the actual **V107** Site. The Flashcards section opened, and the first card flipped from question to answer (`Card 1 of 2 · Answer`). Browser-computed styles confirmed the change was genuinely live, rather than just in source: **Previous/Next/Shuffle/Reset** have neutral dark backgrounds (`rgb(45, 45, 45)`) and legible light text, and the Reveal/Show-question action uses a muted, complementary accent rather than the earlier bright blue blocks. The front/back image loading and flip/navigation behaviour had already been directly verified on V106, and V107 changed styling only. This is a bounded **PASS** for the V107 flashcard visual refinement and continued flip action; it is not a fresh upload or persistence test.

Site control-plane readback after deployment: latest version **107**, V107 deployment **succeeded**, live URL `https://minamo.jscymru.chatgpt.site`, MCP enabled; access mode still **custom**, policy revision **1**, owner and existing external viewer retained. There was no user-data reset, Notes/Library mutation, migration, cleanup or access change during this polish run.

**Acceptance status:** V105–V107 sidebar/title/control/flashcard polish is accepted at the observed desktop viewport, subject to the limitations below. PR #83 must **remain draft and unmerged** for independent owner/Sol review. Keep **V107** live. Production/native source is `1b151ed60e7572ea428176b3b1a78e65f44e4057` and the synchronized public source change is `70cc259f4e8daedbbec26d78ec3c8afdf4de322b`; the public PR's later report commits are documentation-only.

## Unchanged outstanding scope

- tldraw V104 rectangle save/reload/edit/conflict tested in the preceding report; image-in-canvas and extended gesture coverage remain outside this polish pass.
- Pygbag actual live graphical output is still deferred/unverified. Avoid a generic packaging service.
- Independent comprehensive UX critique, mobile testing, flashcards at scale, and owner review remain necessary before merging PR #83.
- V106 block maximize was seen to work, but the Playwright restore click timed out despite a matched visible locator; a component-level reversal test passed, but browser re-restoration was not independently confirmed. This may be an automation-control issue rather than app failure and should not be silently marked accepted.
- V107's final visual comparison confirmed CSS and flip state, but image upload, deletion, concurrent refresh and actual persistence across reload were **not** re-run as part of the V107 CSS-only change. The Sudoku cover was directly seen in the full Project page, not its catalogue thumbnail. Narrow/mobile layout was not accepted in this session.
