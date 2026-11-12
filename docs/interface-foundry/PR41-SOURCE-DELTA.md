# New source evidence: PR41 combined foundation exists — integrate/harden, do not duplicate

**Observed from connected GitHub, 25 October 2026.** PR41 opened while this Interface Foundry commission was being authored. This file supersedes vague earlier language treating PR40's frontend as entirely hypothetical. Treat these statements as verified **source and task-reported evidence**, not a claim of hosted browser/device acceptance.

## Latest key source refs

- PR41: https://github.com/frekland/minamo-v2/pull/41
- Current inspected head: 8e7dd6067c258c72741f66a31368c52ad6eb9458 (may move as its Work task continues).
- Implementation starts cleanly from current main and selectively imports PR39 Foundry source. PR41 reports exact common tested tree 35f83453d76e71e3e7b78c2d7ecf207b35abfd5c.
- PR41's self-report: TypeScript and production build passed; full suite 950 passed, 1 existing absent-Rust skip, 0 failed. Real GitHub starter/submission/diff readback; real challenge generator red/green tests and local synthetic MCP/D1/Attempt continuity. This remains **reported task evidence**, not independently rerun by this research commission.

## Real PR41 UI components, not future concepts

- app/activity-studio.tsx (~23k source): real client Activity view, source file tree, copy and checked ZIP download, attempt/hint operations, generation-aware reads and expected RecordData. It is not a missing page.
- app/activity-studio.css (~7.6k): component layout, file tree, text/terminal/hints/attempt affordances and responsive rules. Uses its own --as-* palette, fixed CSS roles and several separate UI surfaces.
- app/learning-atlas.tsx / app/learning-atlas.css (~7.8k CSS): actual four-lens React Flow and semantic list UI, fixed inspector, mobile alternative, custom --atlas-* token system. Native app structure exists.
- app/learning-atlas-canvas.tsx and app/learning-atlas-canvas-sdk.tsx: optional tldraw 5.5.2 all-synthetic development-only custom record cards, gated by license/host/privacy decision.
- app/workspace.tsx (~92k): dynamically mounts Activity and Atlas in the ONE existing Workspace, and retains shared Reader and Notes authority. Do not recreate the shell or duplicate Notes in a new component tree.
- app/preview-activity/page.tsx is DEV-gated and returns notFound outside DEV. The existence of an internal preview route does not prove a working browser harness.

## Main documented release/UI gap

PR41's RELEASE-READINESS.md explicitly says the managed preview returned a seemingly healthy URL, but cloud Chromium reached ERR_CONNECTION_REFUSED even after a documented routing repair. No new integrated Activity/Atlas **screenshots, browser gestures, keyboard/touch, note overlay, source selection or desktop/phone layout acceptance** are claimed. This may be an environment/browsing problem rather than a UX defect; prove the cause, and use a correct isolated browser test harness if necessary. Do NOT declare UI acceptance from SSR, typecheck, pure domain tests or PR39's historical gallery screenshots.

This is a high-priority engineering closure task for the Interface Foundry, not a footnote. It likely provides more immediate value than building an additional new renderer.

## Precise frontend consolidation opportunities to test, not assume

1. **Token convergence:** app/activity-studio.css currently defines its own accent/border/dim palette and several hard-coded colors. app/learning-atlas.css defines a separate palette and gradient. Compare them with existing --mn-* tokens and calm charcoal/blue style. A unified design system would ease later module activation and reduce CSS drift.
2. **Information hierarchy:** Activity Studio currently has a vertically organised set of prompt, source, hints and Attempt regions, and a file-tree/code grid. Real usability at 1024px with side-docked Notes or 390px with mobile keyboard needs testing. The proposed adaptive slot/recipe host may be better than adding more layers within a single scrolling activity. Do not rewrite until actually compared.
3. **Atlas semantics:** Four existing lenses and accessible list/card fallback are already substantial. Need *real* navigation/interaction tests, source rights after revocation, keyboard/touch/pan/zoom, readable inspector and absence of stale canvas text, not another hypothetical node-graph design.
4. **Data/action authority:** Activity and Attempt use existing owned experiment/run companion semantics according to PR41. Frontend design must adapt to exact actual schemas/URLs/action responses, not create a competing activity record store.
5. **Mobile and accessibility:** CSS has focused controls and mobile media queries, but those are not physical Android/IME/assistive evidence. Test actual semantic source and code selection with full-height Notes.
6. **Performance:** existing code uses lazy Activity/Atlas imports. Preserve them and measure delta. The tldraw SDK is DEV-only with no persisted board yet; don't bundle/license-enable production without review.
7. **Preview routing:** establish a browser-accessible full-workspace synthetic preview that faithfully exercises current owner-scope/Worker/domain and is compiled out of production. A fake identity route is not authorised in production. If cloud preview routing still fails, use tested local Playwright/CDP browser environment, record exact alternative and limitation.
8. **Light integration:** PR41 has strong domain/MCP but no unified UX recipe/slot/fixture developer kit. Build on its actual source and prove the first new activity component can use it with limited source edits.

## Updated priorities for the next Work task

**FIRST:** freeze PR41 actual code + repair/bypass preview harness limitation safely, obtain real screenshots/DOM interaction evidence and identify frontend defects; address the existing Activity/Atlas acceptance release blocker.

**SECOND:** use those real existing interfaces as baseline, compare functional improved layouts, design system tokens, responsive Notes integration and pattern registry in an independent Work branch. Preserve PR41 source correctness and ownership.

**THIRD:** fully implement production-ready reusable UI framework, well-tested component stories/visual regression, future Light activation; produce clean draft staging PR and distinct owner-visible design options.

A Work run may begin independent research/design work before PR41's final head is frozen. **Do not concurrently mutate the PR41 source branch.** Combine only from its immutable finished source tree and document it accurately.

## Release and licensing

- PR41 is draft, not merged/deployed; production remains owner-private V27 according to its release report.
- Owner release task should review both backend PR41 and Interface Foundry UI integration, choose appropriately gated package, and perform authenticated/physical device acceptance.
- tldraw production SDK license domain, key and telemetry are not validated; freeform canvas remains separately gated and is not a reason to withhold safe four-lens semantic Atlas.

