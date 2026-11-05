# PR #83 — V108 responsive follow-up deployment checkpoint

Date: 4 November 2026. **Production V108 successfully deployed.** Draft PR #83 remains unmerged. This checkpoint was committed immediately after deployment, before comprehensive browser acceptance, in accordance with the owner's handoff policy.

## Deployment identity
- Existing Site: https://minamo.jscymru.chatgpt.site
- Sites project: `appgprj_6ad8a4e85eb48191accd6e78976b47e3`
- Production version: **108**; saved version `appgver_3a7c02c81810819192090ecbd11272ef`
- Native source commit: `b589b8a4fabde277a08b16d68e06ad662d0ec0e7`
- Deployment: `appgdep_6aeb118c61f08191aff8fd33b1d08098`, status **succeeded**
- Existing custom access policy, authentication, existing Project and Note content, server storage and state were not deliberately modified. No reset, cleanup or migration was executed.

## Bounded code changes
1. `app/project-sections.css`: stack Dashboard primary/secondary/sidebar at <=940px, fixing the observed 159px reading column at 768px; smaller mobile Project headings; longer mobile slider widths and usable Python controls.
2. `app/workspace.tsx` and `app/workspace-chrome.css`: scoped `v2-space-return` notice, with stacked readable mobile prompt and full-width scope-switch button; route/scope behaviour unchanged.
3. `app/project-drawing.tsx`: after restoring an existing tldraw document, initially fit shapes into a canvas narrower than 520px. No saved document state changes from framing. Existing edits still require explicit Save drawing.

## Pre-publish verification
- `node --test tests/pr83-polish.test.mjs tests/pr83-polish-components.test.mjs tests/pr83-interactive.test.mjs`: **7 passed, 0 failed**.
- `pnpm typecheck`: pass.
- `pnpm build`: pass, with existing duplicate-switch-case and large chunk warnings, not new failures.
- V108 archive packed from the pushed native source; the Sites save and publish operations accepted it.

## Follow-on acceptance queued
- Visual browser checks at 320, 375, 768 and 1024 CSS pixels for Dashboard, cross-space notice, heading, Python slider/control, tldraw camera and regression of earlier flashcard/nav/furigana.
- Synthetic tldraw private-image add → save → reload and supported Pygbag HTML attach → Run → actual graphical output → Stop if accessible through existing tools.
- Record genuine results (and any blockers) in an appended acceptance report. No implied success from source tests.
- PR branch code mirrors to be reconciled with the exact native changes, without merging PR #83 or expanding unrelated scope.
