# Minamo V2 — Full-Capacity Interface Foundry: autonomous UX engineering commission

> **Verified concurrent implementation update:** Read [PR41-SOURCE-DELTA.md](PR41-SOURCE-DELTA.md) first. A combined PR41 already contains real Activity Studio and four-lens Atlas UI but its release report states managed-browser acceptance was blocked by preview routing. This Interface Foundry must inspect/harden/reuse PR41 (not rebuild it), establish actual integrated browser evidence, unify reusable patterns/tokens and deliver the Light-ready frontend SDK on a separate staging branch. No merge/deploy authority.

**Authoritative owner commission.** Build a reusable, unusually polished, robust and extensible frontend system so that future GPT/Plus/Sol Light tasks can introduce supported learning activities and visual artefacts WITHOUT another expensive, open-ended UI/UX programme.

Repo: frekland/minamo-v2  
Current owner-private Site: https://minamo-v2.jscymru.chatgpt.site/  
Foundry implementation (banked draft): https://github.com/frekland/minamo-v2/pull/39  
Activity Studio + Learning Atlas (currently under separate execution): https://github.com/frekland/minamo-v2/pull/40  
This research commission: current branch research/interface-foundry-20261025.

Read and execute README.md, SYSTEM.md, PATTERN-CATALOGUE.md, DESIGN-LAB.md, VALIDATION.md, LIGHT-HANDOFF.md, SOURCES.md and examples/interface-foundry/recipe-specimens.json.

## Product mission

**Work on the interface *platform*, not an arbitrary visual redesign.** Minamo already has a working shared Classic/Focus/Task Workspace, canonical Reader, rich Notes, docking, exact history/selection, Library and Tools, and PR39 has numerous optional renderer demos. PR40 is implementing the domain-side Activity and Atlas. What remains expensive is the system making these and future capabilities part of ONE delightful daily-use app.

Deliver:
- a coherent visual/component design system founded on the owner's neutral charcoal / subtle cyan-blue look;
- a small set of high-quality, responsive contextual workbench **presentation patterns** for activities, code, media, maths, CJK languages, data, graphs, practical tasks and Library reading;
- a stable versioned data-only UI recipe/slot/renderer interface composing trusted components with current source/attempt rights and familiar Notes/return/navigation;
- real desktop/Android-sized interaction variants and a component/story/screenshot regression lab;
- a frozen, actionable template library and SDK allowing later Light to register/enhance a safe capability or GPT to author a new activity via MCP **without any code changes** when it uses existing components;
- measured visual, accessibility, source/privacy, bundle, performance and learning-friction evidence, independent critical review and corrections;
- a code-integrated, default-off, release-ready staging candidate when PR40's combined backend becomes stable, prepared for separate owner approval.

This is a **substantial multi-agent design-engineering and implementation programme**, not a static style guide or a speculative “interface ideas” document. Continue exploring useful variants and refinements after initial success. Maximise *reusable completed engineering* rather than screenshots or arbitrary package counts.

## Scope, concurrency and release boundaries

- **PR40 is actively running. Do not edit its work branch, overwrite its files, merge PR39, or rely on uncommitted/unstable interfaces.** Independently research/refine UX and build initial component/story prototypes on your OWN draft branch. Read PR40 implementation as an immutable frozen source snapshot when available; then construct a separate integration branch on a known verified PR40 source ref, reconciling conflicts explicitly.
- Existing production V27 and current GitHub main are not presumed to contain PR39 or PR40. Check actual current source/site state. A draft PR never means feature live.
- No GitHub main merge, Sites production save/deploy, production MCP refresh, private access expansion, paid SaaS, genuine learner-data mutation, new untrusted executable browser runtime or uncontrolled repo changes. Research/lab/local synthetic D1/R2 work is broadly authorised.
- Avoid introducing an unrelated site redesign or fourth/fifth global mode. Classic, Focus, Task, Reader and persistent Notes remain the shared product architecture; changes need evidence and regression protection.
- Owner should review substantive visible UI design decisions before release. Work can freely iterate prototypes/flagged integration and testing without routine prompts.
- No permission leak, copied revoked source, auto Run, fake checkpoint, spoofed CI, unapproved file/voice access, or hidden solutions in learner UI/client asset bundles.

## Work packet 0 — Trace live source and freeze integration facts

Read current GitHub main, PR34 mode release evidence, PR32/33 UX research, PR36 seven-persona UX report, PR39 source manifests and PR40's newest executable implementation if available. Confirm:
- one true Workspace and Reader/Notes owner, stable scope/revision/selected source;
- exact supported Foundry adapter/media/run/visual schemas, default build and dev-gallery paths;
- Activity/Attempt/MCP/Atlas data surfaces actually present (not merely commissioned);
- current theme, presentation variables, four Notes dock states, capture/annotation UX, direct links, saved tasks and History;
- pre-change bundle, idle page/render and test baseline.

Create a file/feature ownership map, dependency/branch merge plan, source SHA and a durable CONTINUATION.md. Identify where genuine UI work is needed vs duplicating PR40.

## Packet 1 — Independent research, visually ambitious yet controlled

Run distinct specialists: interaction, information architecture, visual design, engineering, accessibility, language/math typography, mobile/IDE integration, performance, pedagogical challenge. Develop and critique **several genuinely different functioning layouts** using source-aware fixtures, not screenshot-only mood boards.

Study task-first vs artefact-first vs read–try–reflect vs dockable power-user vs one-content phone patterns. Test whether the learner immediately knows what they are investigating, where their code/reading actually is, how to start locally, where hints and test evidence are, and how to open a short linked Note. Select a coherent restrained pattern set with documented rejected alternatives.

The baseline design is calm/modern with muted accents and useful typography. Novel visual interactions are welcome when materially helpful, not innovation for its own sake.

## Packet 2 — Build one canonical design system and component library

Audit existing --mn-* tokens, Base UI/Radix controls, react-resizable-panels, CodeMirror, Recharts, Lucide, Reading typography and layout prefs; unify/extend where justified. Build production-grade:
- semantic colors, accessible focus/motion, layered surfaces, density/spacing, typography scales and icons;
- context/header/breadcrumb, information/provenance status, loading/empty/error/denied states, source/edition pills, inline actions;
- responsive dock/tab/sheet, code file explorer and code/test/diff/terminal split views, math/CJK viewers, data/plot/graph hosts and media controls;
- reusable hint/reflection, prediction/compare, stepper, GitHub/local project action, trusted renderer fallback and safe recovery panels;
- navigation/scroll/selection fidelity and standard open Notes/context capture action;
- explicit contrast, 200% zoom, keyboard, touch, IME and reduced-motion behavior.

Do not replace existing Note editor, Reader or ownership. If a shared refactor is required, demonstrate no regression in source identity, history, drafts and CAS.

## Packet 3 — Implement adaptive Activity Workbench (flagged)

Build a reusable, trusted **presentation recipe and slot system** aligned with PR40's final actual Activity/Attempt schema and PR39's source renderer registry. Runtime layout decisions depend on pattern, actual available content, container width, user action/preference and permission. GPT supplies only bounded, admitted declarative recipe/data; no arbitrary React/JSX/CSS/HTML or user-authored callbacks.

Production patterns to implement and test: read-and-annotate, activity overview/start local, debug-and-repair, build-and-iterate, predict/explore/compare, mathematics/science board, Japanese/other language reading, data detective, game/algorithm, code walkthrough, sound lab and Atlas. Integrate on real original Workspace in Classic/Focus/Task; no 12 new global pages.

Workhorse desktop should support code with legitimate file/diff, collapsible test/terminal, context and quick Note. Responsive phone should show one content surface plus well-labelled secondary tabs/sheets; no microscopic three-column code editor. Preserve one persistent Notes coordinator, source edition and context across layout, mode and route switches.

## Packet 4 — Actual Foundry content integration

Use PR39's working source-backed math/ruby/data/graph/audio/Python/visual adapters and PR40's Activity/Atlas as data sources. Test at least six *complete multi-component experiences*, not just isolated viewers:
1. Python bug hunt with starter files, test evidence, progressive hints, GitHub action, current Investigation/Library and Note;
2. Japanese passage and grammar/furigana with exact source selection, reveal and optional audio;
3. mathematical/physical exploration with source TeX, figure/parameter controls, actual-vs-illustrative Run distinction;
4. data detective CSV/chart/query/diff/source;
5. small game/graph/3D interactive experience with keyboard/phone/static fallback;
6. Learning Atlas graph/context and evidence timeline with actual link rights and one optional tldraw canvas proof.

Additional high-value demonstrations (Rust refactor, audio sequencer, code animation, source history, bilingual reading, learner notebook) encouraged. Prefer production-style source/attempt/Note integrity to shiny isolated components.

## Packet 5 — Component Development + UX testing laboratory

Compare **Storybook React/Vite, Ladle, and existing dev-only Workspace routes** against real Vinext Vite8/React19, CSS, Reader/Notes and Foundry modules. Choose one practical approach (or a small explicit hybrid). Build enough real stories with controls to exercise all significant states, including long technical content, Japanese/RTL, math, code/terminal, unknown block, denied source, revoked asset, pending notes and narrow phone.

Use local Playwright screenshot regression and ARIA snapshots, scripted click/type/drag/selection flows, pinned fonts/browsers, Playwright interaction tests and automated a11y checks. No cloud screenshot SaaS required. Dev specimen route must compile to 404/exclusion in production. Local D1/R2 must be used for persistence claims.

Create one documented command for future contributors to verify their feature's component states, desktop/390px screenshots, exact source/Notes/permissions and normal production build. Make failures actionable rather than “test failed”.

## Packet 6 — Responsive/device and accessibility hardening

Real 320/360/390/430/700/768/1024/1280/1440 layout tests, reduced available height from Android keyboard, 200% zoom, high contrast, RTL/CJK/long math/data, mouse/keyboard/touch/IME, responsive Notes, device rotation where testable.

Test unsafe UX collisions: drag canvas stealing native selected-passage handles; Notes overlapping test actions; mode switch changing source; code editor retaining unsaved text in wrong Activity; hint spoilers in accessibility tree/DOM; animated charts stealing focus; xterm clipboard corrupting CRLF; WebGL/audio/Python resources staying alive after navigation.

Visual check + functional/semantic tests + actual data readback. Simulated phone is NOT physical Pixel; define exact owner device acceptance checklist. Test a screenreader or use ARIA audits honestly, never claim broad assistive-technology certification from axe alone.

## Packet 7 — Performance, packaging and resilience

Heavy optional Foundry/Activity/Atlas engines should not reach Home/default reading bundle when inactive. Lazy imports, trusted source gating, browser runtime lifecycle, workers/GPU/audio cleanup, dynamic asset opt-in, no unconditional 50MB Pyodide science download, clear unsupported fallbacks. Establish a measured load/interaction budget from actual current Site and preserve a reproducible delta. Use real INP-like interaction measurements where possible, not only total JS bytes.

Test object/JS/DOM memory leak after repeated open/close and source revocation; context switch under pending autosave; offline/401/409, stale MCP client, wrong owner/generation, old editions and a revoked source. Never fabricate successful Run or learner progress.

## Packet 8 — UX challenger study and correction loop

Independent evaluators, including 7 prior technical personas plus Japanese, maths, music and mobile/accessibility tasks, receive **blinded realistic app builds and short tasks**, not an upfront claim which variation is best. Freeze all variants/test goals before assessment. Capture genuine browser actions/time/viewport/error and state. Simulated agents aren't human participants.

Evaluate ease of first-use, relevance/reading quality, navigation overhead, code/editor usability and actual preserved work. Correct important findings and repeat. Compare with current V27 mode baseline and PR40's own UX to avoid redesigning a working path. The owner should receive distinctive reviewable screenshots and a recommended design, not 40 decorative variants.

## Packet 9 — Pro-to-Light handoff simulator (MANDATORY)

Construct actual compact developer SDK, type definitions, component/pattern example source, automated fixture generator or copyable templates, and a small activation module.

Test with at least **three independently fresh constrained agents**:
- publish a new synthetic GPT Activity with two registered components via real staged/local MCP, **no frontend code changes**;
- add or enable an existing Foundry renderer in one approved presentation slot (e.g. trace/bytes/data) with responsive fallback, using only a small code task;
- add a new independently tested visual presentation module to a bounded known slot, with no global Workspace or Notes refactor, and get local visual/MCP/permission tests green.

Give the agents only the activation dossier and frozen code ref/catalogue, not your reasoning. If they get stuck because design/source/React hooks are unclear, fix the SDK with Pro and rerun. Light-ready is an **empirically verified condition**, not marketing text.

## Packet 10 — Combined staging integration and precise release package

Do not stop at separate demo routes: create one coherent **draft implementation PR** based on the exact verified PR40 combined staging code (and PR39), with production-bound patterns and test infrastructure integrated behind default-off gates. Source/lockfile/Reader/Notes merge conflicts must be reconciled and tested. Where PR40 backend is still incomplete/ongoing, finish independent UX foundation, preserve exact handoff and mark the pending integration gate; do not overwrite unfinished work.

Deliver at least:
- INTERFACE-RESULTS.md: what is real/prototype/integrated/dormant/deployable/owner-acceptance and measured UX effectiveness;
- DESIGN-SYSTEM.md with tokens, semantic patterns, visual decisions and alternatives rejected;
- COMPONENT-CATALOGUE.md with exact trusted renderer/slot APIs and examples;
- PLAYGROUND.md with actual runnable dev route/lab and reproduction;
- VISUAL-ACCEPTANCE.md with desktop/mobile screenshots and ARIA/focus/pass/fail evidence;
- UX-REGRESSIONS.md mapping old V1/V2 and PR33/34 guarantees to automated tests;
- LIGHT-ACTIVATION.md with small copyable follow-up tasks + autonomous agent trial outcomes;
- RELEASE-READINESS.md with exact staged source SHAs, native Site source sync/rollback, bundle/binary, auth/MCP boundary and owner-device tests;
- CONTINUATION.md with precise source branches/hashes and immediate next steps.

No main merge, Site native deployment, installed production MCP refresh or genuine learner record mutation. The owner will separately authorise release after inspecting implementation and screenshot comparisons.

## Continuous engineering discipline

Use agents to execute independent chunks in parallel, not to continually restate plans. Carry out many meaningful prototype/experiment/critique/test cycles, keep exact source evidence and decisions, and continue to the next high-value problem after initial success. There is no arbitrary cap of 3 screens or 5 story fixtures. But **prioritise the shared integration seam and light readiness above cosmetic novelty**.

The desired result is an extensible Minamo where useful future GPT-generated Activities are automatically presented with polished existing UX recipes and lighter coding agents make modest targeted frontend registrations, not fresh redesigns.

**Execute working frontend engineering and honest acceptance, not just a design plan.**

