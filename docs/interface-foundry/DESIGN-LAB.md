# Independent UX research and design-engineering laboratory

**Objective:** determine and implement repeatable, pleasant, deeply usable interaction choices while high-effort models are available. Do not conclude design quality from “modern” visual styling or from one approving reviewer. The user's historic V1→V2 regressions and PR32/33/34 modes provide concrete baselines, not nostalgia.

## Inspect before designing

- Actual latest production/site and GitHub source, including mode switcher, root navigation/search, Library/Article and Journey/Investigation detail, contextual Note creation, Flags/Annotations, recovery, rich content, tools, saved Run and model handoff.
- Existing PR32/33/34 UX lab and mode acceptance; do not redo working three-mode preservation.
- PR36 seven-persona evaluation: findings about first-use discovery, reading relevance, external editor dependence, hidden decision/intent in long contexts, and owner-facing activity.
- PR39 developer gallery and dormant component surfaces; inspect screenshot/DOM for maths, CJK ruby, code, charts, Three fallback, sound, Notes and source.
- PR40 latest implementation code and mock or live read-only Activity and Atlas if available. **It is being developed concurrently**; use exact frozen code ref and maintain separate file ownership. If unavailable, prototype against versioned synthetic adapter contracts, then rerun integration after PR40 freezes.

## Four independent expert lenses

### A. Product information architect

Assess task/source mental models, navigation hierarchy and naming. Prevent “Library in Journey”, “tool experiment in Notes”, “Activity vs Investigation”, “Checkpoint vs Attempt” semantic confusion. Design an unobtrusive context trail, predictable return, source ownership and efficient continuation. Do not add another full global nav category without demonstrating user value.

### B. Interaction/UI architect

Study panel layouts, responsive editor + preview + test + Notes flows, source selection and gesture capture, keyboard/touch, focus and reading-position restoration. Present **working alternatives** under shared state authority; compare real geometry and saved-state behavior, not static Figma frames alone.

### C. Visual/product designer

Create coherent real CSS/React designs on existing tokens: neutral charcoal/muted blue-cyan, refined typography for prose/code/math/CJK, quiet surfaces, restrained iconography, meaningful hierarchy, comfortable reading. Explore variant densities and editor chrome. Reject excessive gradients, neon dashboards, badge overload, unreadable tiny text, animation for status and card grids that dominate learning material.

### D. Learning/accessibility specialist

Evaluate the difference between helpful interaction and pedagogical theater. A hint should support a question without spoiling it, a test report must reflect provenance, a Japanese reading should remain a passage, a math visualization should not claim proof and a graph should not infer mastery. Test accessible alternatives and independent keyboard behavior, not just accessibility analyzer success.

## Divergent competing layout prototypes (real state, not screenshot-only)

Work must compare at least these **functional product concepts**, then converge to a small coherent set (not ship all as new modes):

1. **Context-first task workbench**: task + next action + one main pane, secondary inspector.
2. **Artefact-first exploration**: large code/plot/graph/game, context and notes as compact rails/sheets.
3. **Read–Try–Reflect sequence**: stepper or segmented perspective across explanation, task, experiment, evidence and Note.
4. **Dockable power-user workbench**: resizable code/terminal/preview on desktop, not necessarily exposed for all learners.
5. **One-content mobile workspace**: a focused primary screen with visible section controls/Notes and no desktop column miniaturisation.
6. **Atlas context surfaces**: structured graph/card/list and optional separate freeform tldraw, with source-rights and mobile fallback.

For each, use representative **real or synthetic-but-source-accurate data** from multiple candidate study fields. Record line-height, content visible above fold, number of navigation/copy actions, task identity clarity, response to pending Note edits, focus transitions, and render performance. Grounded comparative metrics matter more than a model calling something "slick".

Test at least two visual variants for the core desktop Activity and mobile Activity, including which sidebars/hints appear by default. New layouts must still be recognisably Minamo Classic/Focus/Task, not a cosmetic redesign of the main app.

## Direct workflow research cases

### Entry and onboarding
- User arrives with a vague goal (“build a small React music matcher”); discover Start a Journey/GPT handoff in one natural path without a full form.
- Returning user types existing Journey name in a new GPT chat, opens precise current task, latest Note intention and the Activity not previously tried.
- User opens a Library Article unrelated to any Journey; Reader and Notes function without artificial project/Activity scaffolding.

### Learning/practical flow
- Beginner opens a debugging exercise, locates task/source/tests/hints, copies commands and opens Notes with correct parent; no mandatory checkpoint.
- Experienced programmer inspects a large multi-file Rust refactoring challenge, source diffs and CI; does not suffer beginner-help scaffolding or tiny code window.
- Japanese beginner reads with furigana hidden, taps an ambiguous compound, reads a sourced gloss and returns to native text selection without losing IME/scroll.
- Maths/data learner expands a plot, adjusts a parameter, sees actual vs illustrative outputs, opens readable formula source and saves a Note.
- Biologist/data scientist inspects quality-control table and verified plot/trace, comparing actual source/data; numeric values remain accessible on phone.
- Game maker plays fixed maze and then opens GitHub starter in an external editor; Minamo doesn't pretend to be a full game IDE.
- Audio/music learner starts explicit playback, pauses and switches to Note; audio resources stop correctly and no mic permission was requested.

### Cross-device and recovery
- Desktop/Android user changes Classic → Focus → Task with same source/Note and preserves exact semantic reading anchor, code filename, hint level and pending Note writer.
- Resizing docked Notes during code+right inspector at 1024 width does not crush central code below usable minimum.
- Phone keyboard opens inside a full-height Note; save status, close, reopen and screenshot-attachment controls remain visible.
- Deep-link exact older source edition and selected phrase/terminal capture remains correct after layout changes or source revocation.
- GitHub commit changes underneath a paused Activity, returning user sees stale/review status not silently patched source; no automatic Attempt.
- An older installed MCP schema does not cause UI to display invisible unsupported blocks or silently flatten rich content.

## Blind-ish independent usability studies

Reuse the spirit of PR36 but improve its limitations:
- Freeze the evaluated build, input fixtures, starter goals and actual test instructions **before** giving any persona the app.
- Separate assessor agents from implementation/source/research as much as tool environment allows; record what priors leaked. Simulated personas are not human participants and are not evidence of learning gain.
- Rich persona backgrounds: final-year CS learner, novice teenager making games, experienced programmer adopting Rust, computational biologist, penetration tester, data scientist/quant analyst, Japanese beginner, mathematics learner and audio/music curious maker. Include accessibility/phone-first evaluator with concrete constraints.
- Run **unguided first-use** with short user goal, then a separate guided follow-through and local experiment. Record discoverability, misclicks, confusion, unnecessary actions, task completion, genuinely preserved Notes and errors.
- Test alternative screen layouts in randomized/counterbalanced order where feasible; no “this is the improved one” narrative and no model judging its own visual design alone.
- New activities should be representative and functional, not purely fictional summaries. Report what the agents actually saw, clicked, executed and saved.
- Independent a11y review must include keyboard/ARIA snapshots, contrast, zoom, reduced motion and semantic fallback; real screen-reader/physical Android remains separate owner/device gate.

## Anticipated controversies to resolve with experiments

- Does an extra Activity tab improve orientation, or should Activity be contextual under the selected Investigation?
- Should desktop show persistent task rail vs minimalist breadcrumb vs an inspectable task summary?
- Should code+test be side-by-side, stacked, or toggled as the pane narrows? What does Notes docking do?
- Should hints live beside code or behind a deliberate disclosure to avoid spoiling/overload?
- Which Activity types can share one shell vs require a distinct presentation pattern? Avoid building too many generic controls.
- Is a freeform tldraw canvas best housed under Atlas, within Task, or as an optional reader-side sketch? Must not split authoritative links.
- Do visual effects add comprehension or just distract? Is animation compatible with code selection and screenreader reading order?
- How to visually distinguish actual saved learner evidence from supplied/illustrative/generated text without covering the page in labels?
- Is a contextual "Open locally" affordance immediately understandable, or does GitHub handoff need a concise first-use explanation?
- Should the same user-entered draft survive switching from a small phone to desktop? Existing local draft scope is device-specific; don't promise synced drafts without implementation.

## Decisions and output quality

Produce:
1. **Product UX evaluation report** with exact evidence and independent critiques, including explicit rejected designs.
2. **Actual working React variants** using the real Workspace and component contracts where feasible, staged on independent implementation branch.
3. **Desktop and phone screenshot gallery** at realistic font/display settings with long Japanese/math/code/graph states, not only pristine empty pages.
4. **Measured interaction comparison** of workflows/geometry/scroll/navigation actions and resource impact, limitations labelled.
5. **Approved pattern/catalogue and token rationale** in code and screenshots, plus base UI component exemplars.
6. **Design-system rules for future agents** with anti-patterns, screenshot baselines and narrow API. Avoid relying on an agent interpreting vague design adjectives.
7. **Refined final product blueprint** for later deployment and PR40 integration, not automatic redesign of user-approved modes.

User approval of large visible restyling still matters. Deliver distinct, reviewable variant screenshots and a reasoned recommended default rather than quietly changing the whole app's appearance in a "dormant infrastructure" release.

