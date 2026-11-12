# Source and evidence ledger — Interface Foundry research, 25 October 2026

Purpose: distinguish **actual repository evidence**, **current public design/tool documentation**, and **provisional UX hypotheses**. These links do not prove that Storybook, Ladle, Figma, tldraw, external paid screenshots or any new UI kit is installed or used.

## Current and prior Minamo, inspected through connected GitHub

- Existing main after PR37: https://github.com/frekland/minamo-v2/pull/37 ; app/workspace.tsx, app/layout-workspace.tsx, app/notes-panel.tsx, app/workspace-presentation.css, app/presentation-settings.tsx, lib/contracts.ts. Source establishes existing Classic/Focus/Task, one Notes host, source/edition handling, owner settings and CSS, not preferences measured from human users.
- Three-mode production integration: https://github.com/frekland/minamo-v2/pull/34 ; docs/three-mode-workspace/RELEASE.md. Actual production viewport/browser acceptance across 320/390/768/1280, consistent one Reader/Notes; physical device/IME/AT not established.
- UX lab with real D1/R2/Notes: https://github.com/frekland/minamo-v2/pull/33 ; docs/multi-layout-lab/README.md and DESIGN-CHALLENGE.md. Distinct Focus/Task/classic roles, source identity preservation, semantics vs raw scroll, optional panel views and mobile adaptation. It is research history, not automatic release authority.
- V1/V2 interaction regression review: docs/ux-regression-review/V1-V2-INTERACTION-REGRESSION-REVIEW.md. Owner-reported direct Flag/Annotate, note docking/multi-tab and response to V2 loss of useful V1 interactions. Later releases have fixed many issues; don't re-open known-resolved findings merely because historical document lists them.
- Independent seven-persona study: https://github.com/frekland/minamo-v2/pull/36 ; docs/blind-persona-evaluation/REPORT.md and assessment/UX-ASSESSMENT.md. Agent simulations, no genuine user effectiveness claim; emphasized precision of context, discoverability, external practical tools and capture overhead.
- Foundry source: https://github.com/frekland/minamo-v2/pull/39 ; docs/capability-foundry/RESULTS.md, BANK-RECEIPT.md, ACTIVATION-QUEUE.md and app/foundry-gallery.tsx (nine lazy dev-only tabs). The UI is a lab, not the production product; report says real browser proof for a subset, physical device and native semantic publishing remain qualified.
- Active Activity Studio / Learning Atlas commission: https://github.com/frekland/minamo-v2/pull/40 ; docs/activity-studio/WORK-COMMISSION.md, PRO-PHASE-GAP-CLOSURE.md, ATLAS.md. PR40 being executed concurrently; new UX work should inspect its latest code when available and not mutate its original research branch. Commit refs/status must be established at task start.

## External references — isolated stories, testing and accessibility

- Storybook React/Vite: https://storybook.js.org/docs/get-started/frameworks/react-vite — component isolation and development/testing docs; compatibility with actual Minamo Vinext transforms must be proven.
- Ladle: https://ladle.dev/docs/ and https://ladle.dev/docs/stories/ — Vite-native React component lab with independent story routes. Source claims regarding startup/bundle are vendor marketing, not our app benchmarks.
- Playwright visual comparison: https://playwright.dev/docs/test-snapshots — screenshot baselines should be generated and compared on a stable OS/browser/font environment.
- Playwright ARIA snapshots: https://playwright.dev/docs/aria-snapshots — accessibility tree expectations complement interaction assertions, not human screen-reader tests.
- Storybook accessibility: https://storybook.js.org/docs/writing-tests/accessibility-testing — axe-backed addon can flag certain automated WCAG issues, not certify accessibility or comprehension.
- W3C WCAG2.2: https://www.w3.org/TR/WCAG22/ — focus, target size, reflow/zoom, contrast and meaningful accessible operation guidance; target rules have nuances and exceptions, do not reduce them to one unverified pixel number.
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/ — keyboard/dialog/tabs/combobox/tree interaction patterns.
- MDN container queries: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries — responsive child component layout based on own container, useful with dynamic Notes docks; actual Vinext/browser CSS environment needs testing.
- Base UI documentation: https://base-ui.com/react/overview/about — accessible headless primitives already present in package.json; no need to create parallel base-button/dialog/popover APIs without measured benefit.
- INP responsiveness: https://web.dev/articles/inp — use actual input-to-paint responsiveness on interaction-heavy scenes; first-load alone is insufficient.
- MDN VisualViewport: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport — Android dynamic keyboard/viewport behavior, with browser caveats.
- Browser native CSS reduced motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion — opt out of unnecessary animation.

## Technology selection principles

- Prefer current installed Base UI/Radix, React Hook Form, CodeMirror, Recharts, Lucide and react-resizable-panels when a real job fits them. An additional framework is justified by a tested missing ability, not popularity.
- Select **one main component-lab strategy** after actually running a representative source-bound Note/Reader component and Storybook or Ladle. Pure isolated stories do not prove D1/React ownership.
- Local Playwright/ARIA snapshot and real Worker/D1/R2 integration fixtures are default. Remote Chromatic screenshots may involve private source upload and cost, requiring separate approval; no assumed SaaS.
- Use React Flow/tldraw only for appropriate graph/spatial roles and lazy-load; tldraw has licensing/key/host requirements to verify separately.
- A proper adaptive layout need not dynamically infer task type with AI. Typed recipe plus container width/explicit user preference is usually a more trustworthy control path.
- Avoid presenting static screenshots from reference sites as the current Minamo or claiming that native app performance transfers from framework docs.

## Unknowns to be resolved by actual Work prototype/testing

1. How much PR40's implemented Activity/Atlas frontend already supplies; current code must be inspected **when stable**, not assumed absent.
2. Actual story library compatibility with React 19 / Vinext / Vite 8 / existing global CSS and Notes/Reader imports.
3. Production style token reconciliation and whether specific current themes/surface containers can be consolidated safely.
4. Subject-specific reflow for code, ruby, math, wide datasets, live plots and graphs at 390px with Android keyboard and a persistent Note sheet.
5. Feasibility of source-safe declarative Activity presentation recipes through the finished PR40 MCP and renderer registry, including unknown-variant fallback.
6. Measured default bundle/performance impact of adding story infra and chosen pattern modules; developer/test dependencies must not leak to production.
7. Real owner preference across functional variants, distinct from AI critic impressions; physical device/IME/AT tests remain human/device gates.
8. True Light-model feasibility shown by actual constrained task trials with only an interface activation dossier, not full project history.

Do not upgrade an unverified hypothesis to a current-state claim in a release report.

