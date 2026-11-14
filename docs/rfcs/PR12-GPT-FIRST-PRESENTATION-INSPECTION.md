# PR #12 — GPT-first composition and first-class presentation inspection

**Status:** Owner feedback and revised product/engineering requirement after live V186 evaluation (2026-11-14). This document supersedes any implication that V186's manual `AccumulationStudio` composer is the target end-user experience. The existing capture, discovery, rights, revisions, and exact-reference arrangement machinery remains a useful experimental foundation, not an endorsed frontend.

## 1. User-visible product correction

**Original intent:** GPT should select, structure, author connective explanations where appropriate, and **compose fluid, coherent, visually excellent Minamo workspaces** from accumulated material to satisfy a user's request in an ordinary ChatGPT conversation. The user opens a ready-to-use experience and engages with it. They should not have to search, select, group, order, assign source edition policy, or manually construct a manifest as the routine workflow.

**Observed failure:** V186's `app/accumulation-studio.tsx` makes `Explore & compose`, `Saved experiences` and `Retain material` prominent, followed by individual source cards, search/add/remove, purpose/title fields, per-item `Group`, `Edition policy`, `Connective note`, move up/down, and source-update management. `app/composition-reading.tsx` then pages through 1/2/4 separately boxed canonical Reader parts. `lib/accumulation-contract.ts` currently limits overall presentation to `reading`/`practice`/`compare`. This is a **reference editor and source reader**, not the fluid GPT-composed workspace that was commissioned. The live owner assessment calls the UX clunky and burdensome, substantially behind the established Home and Project visual/interaction quality.

**Do not attempt to solve this by cosmetic padding adjustments alone.** Avoid presenting source reference controls, pin/follow, provenance JSON or schema fields as the normal learner UI. Retain safe advanced editing/debug views only if useful, secondary and unobtrusive.

## 2. Replace composition-as-a-form with GPT-first authoring

- **Primary flow:** user states a natural learning/working purpose in ordinary ChatGPT; GPT uses MCP discovery and existing context to choose eligible authentic material, distinguish learner attempts from generated teaching, craft appropriate connective material, and persist a purpose-built **presentation plan** and arrangement through a validated, revisioned capability. User opens the result on Minamo without manual assembly.
- **Frontend baseline:** take the current `app/home-landing.tsx`, `app/project-sections.tsx`, `app/project-reading.tsx` and six native Project patterns as the **minimum standard for visual maturity, responsive navigation and interaction**, not as rigid templates. Reuse shared rich components, Japanese ruby/TTS, cards, diagrams, tables, notes/links and reading semantics. Permit genuinely different supported responsive layouts composed from bounded typed components.
- **Experience contract:** exact canonical source refs and source policies belong to the durable data model; declarative composition structure should express a coherent screen/section/component hierarchy, reading flow, optional interaction, purpose, context and derived wording. It must **not** copy original source content into arrangements or rely on injecting unrestricted model HTML/CSS/JS. Server enforces schema, source rights, revision/CAS, bounded richness and deterministic rendering. GPT can choose layouts and connect material; it cannot override auth or fake attribution.
- **Refinement:** user can request change through GPT (“focus on my mistakes,” “make it more conversational,” “use a side-by-side contrast”), with model inspecting the actual existing presentation and saving a new deliberate version. Existing arrangement and exact sources remain recoverable; don't automatically regenerate every load.
- **Interface:** initially keep as an opt-in experimental experience through Settings, with Stable Minamo default. Normal learner view should focus on **reading, doing and returning**, with optional small “Ask GPT to refine this”/“Open in GPT” handoff rather than a permanent assembly form. Don't add a second confusing prompt editor inside the Site merely to mirror ChatGPT.

## 3. GPT must be able to inspect Minamo's presentation through ordinary MCP

**Critical requirement:** GPT should not need Work, a Chrome extension, Cloud Browser, a developer tool or direct live browser control merely to know **what an owner-facing Minamo view contains and how it is presented**. Existing `get_project_composition`, `get_project_learning_reading` and `read_minamo_arrangement` return canonical and arrangement data. They do **not** report the actual rendered hierarchy, responsive layout, visible controls, state or pixel-level appearance. The current WebMCP `document.modelContext` tools are browser-page-bound and do not replace an independent connected MCP inspection capability.

Implement a **read-only, owner-scoped presentation inspection contract** accessible to a standard ChatGPT conversation through the installed Minamo MCP connector (provisional name `inspect_minamo_presentation`). It should distinguish two complementary evidence types, never silently substituting one for the other:

### A. Reproducible presentation model (available with Site closed)

A deterministic **actual rendering-plan projection** for an exact eligible Home/Project/arrangement view or selected saved edition, produced from the same validated component/layout decisions as the frontend—not a separately invented narrative description. This can report what the UI *should* render, not pretend to measure a currently displayed screen.

Include, where available:
- view/experience identity, stable/experimental variant, component/schema version, exact record/arrangement revisions/renditions, current source eligibility, saved arrangement evolution and source references;
- hierarchical document structure: page title, navigation, sections, visual layout roles, content ordering, supporting resources, user-purpose labels, component types (e.g. cards, dialogues, rich table, notes, code), controls/interactions and deliberate collapsed/expanded defaults;
- representative **bounded, actual on-screen text** and honest provenance, not raw entire Project payload or a giant JSON dump; links to exact canonical source refs;
- clear disclosure that this is the **planned/derived view**, not browser-observed pixels.

Prefer deriving this projection from declarative presentation components shared with the frontend renderer, so UI and MCP cannot drift into two separate definitions. Validate schema and source rights on every read.

### B. Observed live view snapshot (available when the Site can capture a view)

Add a lightweight, owner-authorised inspection bridge in the deployed Site. When the owner enables presentation inspection (e.g. in Settings), the client can submit a bounded short-lived snapshot of the **actual rendered page state** to the authenticated Minamo backend for the same independent MCP tool to read. Avoid forcing the user to repeatedly open a developer browser or paste screenshots.

A meaningful live snapshot should capture:
- page route, selected experimental variant, exact content/arrangement revision, UI build/version, capture time, viewport width/height and effective breakpoint;
- what is **actually displayed**: visible headings, source titles, interactive parts and current card/dialogue state; collapsed panels, selected tab, open overlays and loading/error states;
- DOM-derived accessible role/name hierarchy, reading order, visibility, selected controls and meaningful links/actions;
- measured element bounds, scroll/content extent, overflow/clipping/collision evidence and a limited set of computed typography/spacing/layout properties sufficient for responsiveness checks;
- where technically feasible, **a genuine visual screenshot/image of the rendered content**, returned through a supported owner-authenticated MCP image/asset path, with viewport and source version. This is the only way to verify pixels, visual polish and screenshot-level issues. Investigate actual Site/browser/MCP image-output capabilities before promising it. Browser security may require user consent for screen capture; a DOM snapshot or render-model JSON **must never be labelled as a screenshot**. If no verified image capture route is available, report that limitation and provide honest structured inspection, not fake visual certainty.

Snapshots must report **observed vs planned**, freshness, device/viewport, active vs last-known status, and missing evidence. Do not claim to see the owner's currently open screen if the Site is closed, the active device is unknown, a capture has expired, or a screenshot is unavailable. The Site's existing local Settings experiment preference cannot by itself tell a server tool which UI was actually open on a particular device.

### C. MCP usability and scope

- Use a compact client-visible typed schema (e.g. exact target/current eligible snapshot, optional viewport/device identifier, detail `summary`/`structure`/`visual` and safe result bounds). Do not expose opaque arbitrary untyped objects or the raw HTML/DOM wholesale.
- Reuse canonical owner/rights/generation fences; verify that snapshots do not leak revoked or unrelated owner content. Bound payloads, minimise screenshot retention, capture only the Minamo content/view rather than unrelated browser tabs, and make the owner control opt-in/expiry.
- Expose genuine **user-facing semantics**, not internal database metadata as the primary response. Source provenance, exact links and technical diagnostics can be optional detail.
- Accept actual variant/state: a saved arrangement in `practice` and an open flashcard answer are different visible experiences from the saved `reading` plan and a closed card.
- Verify the operation in a **fresh ordinary ChatGPT conversation without browser connection or Work**, after a connector refresh where necessary, and cross-check its claims against the actual deployed Site and screenshot/browser reference during engineering acceptance.
- The tool is **read-only**; it does not grant GPT screen control, source editing or permission to mutate a user-facing view by inspection.

## 4. Why this needs to be in the platform, not a special developer workflow

GPT-as-composer requires a feedback loop:

1. **Orient:** discover relevant canonical learning/work material and user purpose.
2. **Compose:** select/layout content and save a validated, deterministic experience.
3. **Inspect:** use ordinary MCP to read both the intended presentation structure **and, when available, a recent observed rendered view**.
4. **Critique:** identify unnecessary UI machinery, poor hierarchy, repetitive source frames, inaccessible or overfull regions, interaction issues and responsive problems.
5. **Refine:** revise the experience when asked and inspect the new result, while preserving original source fidelity.

This does not mean a model can infer precise visual appearance from JSON. Real pixels require an image evidence path. Both planned and observed structure should still be useful in standard chat, independently of Work-only browsing capabilities.

## 5. Implementation sequence and acceptance gate

1. **Design review before UI iteration:** compare current Home/Project designs against V186 `AccumulationStudio` and `CompositionReading`, using actual code and deployed visual evidence. Identify precisely which normal-user controls should be removed from the main path, which internals can remain advanced-only, and what expressive layout/interaction capabilities the existing readers already supply.
2. **Presentation inspection minimum viable vertical slice:** for current saved arrangement **Playing, listening and talking about music**, provide a deterministic rendered-hierarchy/interaction model via MCP, and an owner-authorised on-Site actual-state capture with provenance. Include at least one established Project view and Home to demonstrate parity rather than overfitting experiments.
3. **Visual evidence path:** investigate real screenshots/image delivery to a normal MCP client. Implement if technically justified and supported; otherwise document the precise limitation and don't equate DOM geometry to pixel inspection. Preserve real browser inspection for calibration and special cases, not as the *only* way GPT can inspect ordinary Minamo composition.
4. **GPT-first workspace iteration:** build one convincing, cohesive rich learning experience from the existing Japanese data using the shared presentation plan. It must have the visual design maturity of existing Minamo and **must not require manually assembling it in the website**. Add more variants after evidence from this first model.
5. **Acceptance:** from a new ordinary ChatGPT conversation, ask for the user-visible composition of a known saved workspace; verify the MCP correctly reports structure/state, source attribution, actual presentation variant and recent captured viewport, and does not claim screenshot detail without screenshot evidence. Ask GPT to revise the experience to a new intention, save and open it on Sites, inspect again. Test stable/experimental fallback, no source mutation, owner/rights/revision isolation and mobile/desktop width cases.
6. **Record findings** in PR #12 with exact deployed version, source reconciliation, tested MCP catalogue and what remains unverified; keep draft/unmerged.

**Definition of success:** in an ordinary GPT chat the owner can ask “How is my Minamo music workspace presented, and can you make it less cluttered?” GPT can inspect a trustworthy representation of what Minamo renders, propose or apply an explicitly requested rich composition revision through established safety rules, and verify the new deployed experience **without depending on a Work browser session**. The normal Minamo view should remain substantially more like an expertly composed Home/Project than an exposed administrative reference editor.
