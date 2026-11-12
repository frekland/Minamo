# Minamo V2 — Interface Foundry: reusable UX, interaction patterns and future-proof frontend integration

> **Verified concurrent implementation update:** Read [PR41-SOURCE-DELTA.md](PR41-SOURCE-DELTA.md) first. A combined PR41 already contains real Activity Studio and four-lens Atlas UI but its release report states managed-browser acceptance was blocked by preview routing. This Interface Foundry must inspect/harden/reuse PR41 (not rebuild it), establish actual integrated browser evidence, unify reusable patterns/tokens and deliver the Light-ready frontend SDK on a separate staging branch. No merge/deploy authority.

**Owner commission · 25 October 2026 · research and engineering bank.**

## The actual problem

The owner expects many new capability engines (Foundry PR39) and GPT-authored Activities, GitHub challenges and Learning Atlas experiences (commission PR40). The expensive missing piece is NOT necessarily another standalone frontend: Minamo already has production Classic / Focus / Task modes, a canonical Reader, direct Flags and Annotations, four-way persistent multi-Note docking and responsive navigation. PR39 contains nine developer-only galleries; PR40 is explicitly tasked to implement Activity and Atlas interfaces.

The missing capability is a **systematic, unified, exceptionally usable frontend integration framework** that ensures each future tool/learning activity can be displayed, controlled, edited, examined and linked without commissioning a fresh multi-agent UI/UX design exercise.

**Foundry 1:** instruments and source-bound renderers.  
**Foundry 2:** GPT Activity Cartridges, attempts, test/source/GitHub interchange, Learning Atlas.  
**Interface Foundry:** the reusable, attractive, coherent product experience in which all such capabilities live.

The ultimate economic test: after Pro expires, a lower-effort model should be able to add a supported activity component or a feature-specific view through one documented renderer/layout registration and a bounded test suite, not build a new product UI or reopen unresolved design decisions.

## Source-grounded product baseline

Source checked on GitHub, 25 October 2026:

- Current main from merged PR37: V27 private production. app/workspace.tsx owns navigation, direct routing, source/edition/selection, context, search and exact task. app/layout-workspace.tsx provides three modes and semantic read-position restoration. app/notes-panel.tsx owns one persistent multi-Note state and guarded saving, four-way docking and responsive full-height mobile sheet.
- PR34 and PR33: Classic/Focus/Task share actual Workspace, Reader and Notes. Mode switches preserve source, exact passage, in-flight Note writing, recovery; responsive tests at 320, 390, 768 and 1280 existed. Old research images are useful baseline, not a new release authority.
- app/workspace-presentation.css uses one shell; existing responsive and Notes-dock logic must be reused or intentionally consolidated. app/presentation-settings.tsx owns text size/width/wrapping/motion/device preferences, not learning progress.
- PR36 multi-persona study: Minamo was credible as a reasoning/context layer, while external editor/terminal/notebook remained the primary practical environment. Finding decisive reasoning, clear entry, quality resource authoring and reduction of administrative friction matter more than gratuitous simulation.
- PR39 is a 146-file unmerged DRAFT stacked on PR38. Includes 12 renderer adapters and nine developer-only galleries, but not necessarily normal product admission or all physical browser modes. Source/manifests and ACTUAL runtime evidence are in PR39 bank.
- PR40 is RUNNING separately; it is meant to integrate Activity Studio and Atlas, and close hard backend/MCP/schema gaps. Do not race its app/Reader/Notes changes. Work on isolated UX research and pattern prototypes now; integrate against its completed verified staging code, not against imaginary interfaces.

## Product direction

Preserve the owner's calm neutral-charcoal interface with muted cyan/blue accents. It should feel **modern, technically capable, inviting and unusually pleasant** without becoming a dashboard of cards, oversized labels, perpetual animations or permanent administrative controls.

The interface should celebrate the learning work: a Japanese reading should read like a good textbook; a mathematics explanation should have spacious, accessible equations; code should be inspectable with a real file hierarchy; a graph or 3D model should have room; an attempted bug hunt should make predictions, tests and what to do next obvious. Yet Notes and source context remain immediately accessible.

**Do not invent a fourth/fifth global workspace mode.** Classic, Focus and Task remain the stable host. Implement a small set of contextual **Activity presentation recipes** inside them: read, explore, build, debug, compare, review and canvas. Changing a recipe should not navigate away from the current Investigation or recreate the Note editor.

**Prefer three high-quality foundational outcomes:**
1. A genuinely reusable **adaptive Workspace Activity Host** with interoperable slots, responsive layouts, safe lifecycle, source/attempt/provenance and persistent Notes.
2. A real **Minamo Design System + Component Laboratory** covering typography, interactive editor/terminal/tests, charts/maths/CJK, panels, controls, saved states, source identity, accessibility and theme tokens, documented with working examples.
3. A **UX engineering toolchain and activation SDK**: golden realistic fixtures, deterministic visual/interaction regression, code/design contracts, source templates, documentation and a measured test proving a smaller agent can add capabilities without reinvention.

These are high-effort work today. Afterwards Light should mostly wire slots and templates using documented contracts.

## What the user should eventually experience

### Practical code project

The learner selects an existing Investigation, opens a partially built project Activity; the screen naturally offers task/questions, browsable starter files, actual test evidence, hints, supporting resources and GitHub/local start. One panel can expand code or terminal output. Switching to a referenced Library explanation and back retains exact task, Notes, editor draft and current source edition.

### Japanese reading

A full-width comfortable passage with readable ruby, independent show/reveal preference, inline grammar/gloss cards and a small optional interaction. Mobile has touch-friendly words and exact selection/Flag/Annotate. A user can read without seeing an Activity dashboard. Notes is a quick open full-height sheet, not a constant half-screen.

### Mathematics and science

Proper math has an accessible source and readable rendering. A plotted simulation may expand to use screen width, with controls and parameter changes in an adaptive dock. Exact code/observed output, provenance and the learner's own short Notes are one navigation step away.

### Learning Atlas

A structured Journey/Library graph uses the SAME contextual card, current permission, navigation and typography primitives as activities. Desktop offers spacious graph + optional inspector. Mobile uses an equivalent focused list/branch or deliberate canvas, not microscopic unlabeled dots. tldraw freeform mode is optional and separately licensed/rights-guarded.

## Work boundary and concurrency

This PR is a **docs/fixtures research commission** based on current main, and must not mutate PR39 or the current PR40 implementation task. New Work may research/prototype in its own branch, reading PR39/PR40 but without overwriting their developing shared modules. For final integrated code, consume the verified PR40 combined staging branch after it exists, use a clean branch and reconcile conflicts. Do not merge or deploy in this commission.

Read [SYSTEM.md](SYSTEM.md), [PATTERN-CATALOGUE.md](PATTERN-CATALOGUE.md), [DESIGN-LAB.md](DESIGN-LAB.md), [VALIDATION.md](VALIDATION.md), [LIGHT-HANDOFF.md](LIGHT-HANDOFF.md), [WORK-COMMISSION.md](WORK-COMMISSION.md), [SOURCES.md](SOURCES.md) and the proposed typed recipe examples under examples/interface-foundry/.

**The success metric is future integration friction and actual learner UX**, not the raw number of decorative components. Build real code and comparative prototypes in draft implementation PRs; do not finish at a PDF mood board or a static gallery.

