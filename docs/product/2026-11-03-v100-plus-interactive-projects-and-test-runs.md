# V100+ product direction — flexible Projects, interactive learning artefacts and owner-directed TEST runs

**Status:** proposal for review/implementation commission, 3 November 2026. **Baseline:** deployed Minamo V100, PR #80 merged. This document proposes the next changes; nothing here is already implemented merely because a dependency or schema field exists.

## 1. Owner decision and product outcome

Keep the newly useful, clean, fast V100 learner experience. Deepen it in three ways:

1. **Compose what matters.** A Project can foreground, reorder, collapse, pin and hide material without becoming a complex page builder. GPT and the learner can adjust the same canonical Project through natural conversation and light direct editing.
2. **Learn by doing.** Render a small, vetted family of meaningful interactive artefacts directly alongside explanatory Notes, sources, code and observations: image-backed flip flashcards, a drawing board, and working browser Python visualisations first. Explore packaged pygame-ce experiences and tldraw without committing to either as a universal engine.
3. **Test anything on demand.** The owner can ask GPT for a fictional Project and arbitrary dated learning history, choose the stopping point and depth of inspection, then return, extend, keep or explicitly delete it. Reuse Minamo's existing MCP observation, GPT transcript and canonical state-diff evidence when useful. Do not impose fixed fixture matrices, personas, epochs or A–K states on ordinary testing.

The separate genuine simulation Project for the owner and Evie is **not** a disposable test. The existing **TEST — Simulation Playground (Six-Layout Walkthrough)** (ID: test-simulation-playground-layouts-20261103) is the exploratory gallery. Preserve it and both kinds of existing content.

The six V100 patterns — Dashboard, Notebook, Workbench, Board, Research and Guide — are useful **visual recipes**, not six exclusive learning stages or a claim to cover all domains. Prefer flexible composition plus suitable artefacts over multiplying rigid page templates.

### Evidence and existing implementation

| Area | Observed in V100/public main | Missing or unverified |
| --- | --- | --- |
| Project composition | Six patterns, ordered sections, slots/blocks and exact record references; bounded atomic Project/MCP updates. | Learner-facing section/block rearrangement, folding and favourites are not yet an intentionally simple everyday flow. |
| Project operations | lib/project-service.ts already accepts moveBlock, setBlockVisibility and setLayoutLock, CAS and explicit override protections. lib/project-composition.ts already represents hidden blocks and slots. | Pin/favourite/collapse semantics, clear outline/navigation, and unobtrusive controls for these existing operations. |
| Rich reading | Reader supports code, diagrams, tables, images/media, reference cards, excerpts, math/inline material and canonical selection. | Rich running artefacts and learner-manipulable surfaces, with safe saving and accurate text/source fallback. |
| Dependencies | package.json includes pyodide 0.28.3, tldraw 5.5.2, three, Recharts and CodeMirror. | A package on disk is not a shipping renderer. Check runtime bundling, licence, size and safe integration first. |
| Real walkthrough | Independent V100 desktop review: section reading, direct edit, MCP update and reload persistence worked. | Mobile unverified; copy bytes and code execution unverified; long-page navigation cumbersome; code/table alignment has room for improvement. |
| Testing infrastructure | Historical hosted fixed scenarios, GPT-submitted transcript, server-observed MCP and D1 state-diff evidence. | Small natural-language test runs with optional depth, a recoverable run inventory and explicit exact-scoped cleanup. |

Sources: [PR #80](https://github.com/frekland/Minamo/pull/80), [V100 learner review](../reviews/2026-11-03-v100-simulation-playground-learner-review.md), [three-history evidence](../acceptance/2026-11-01-three-s06-cross-project-workbench-comparison.md), [release notes](../releases/2026-11-03-pr80-candidate.md). Earlier V88/V89 contracts are historical evidence, not requirements to revive an unwanted UI.

## 2. Flexible composition: small controls, meaningful freedom

### First useful slice

- **Outline:** a compact expandable list of section headings, with anchored jumps and clear current location on a long Project. On small screens it must not consume a permanent sidebar.
- **Section actions:** rename, move up/down, collapse/expand, optionally hide/show and bring to top. Reordering remains meaningful in a single-column mobile view.
- **Block actions:** move within a section or to another compatible slot/section, hide/show, pin as a Project highlight and favourite for quick access. Hidden content is not deleted or silently omitted from canonical retrieval.
- **Pin/favourite distinction:** pin changes the Project's prominent display; favourite is a quick-navigation preference. Neither implies learning progress, mastery or evidence quality. Do not confuse with existing pinned Note windows.
- **Widths and emphasis:** initially offer a few bounded choices (full, split, compact), retaining semantic reading order; avoid arbitrary coordinates, nested drag surfaces or a general CSS editor.
- **GPT parity:** every durable change should be expressible through the existing natural-language Project update path, with precise section/block references and readable layout capabilities. A learner should be able to say, “Put our experiment at the top, hide the long reference list for now, and make the flashcards easy to find.”

This is a *disclosure-first* interface. Place advanced options behind one simple “Arrange” or contextual menu; keep the default V100 reading view calm. Keyboard-accessible Move up/down and Select destination should work before any optional drag-and-drop. Avoid duplicating arrangement controls on every reading part by default.

### Persistence and invariants

Separate **canonical shared Project composition** (what appears for this Project, changed by an explicit save/MCP update) from **local viewing state** (temporary accordion openness, scroll and perhaps individual reading preferences). If favourites are later shared across devices, make that choice explicit rather than accidentally binding personal preferences into the shared Project.

Reuse the current validated composition and revision/CAS/operation-receipt machinery where possible. Add only fields for missing durable semantics; retain a deterministic adapter for older Projects. Movement must not rewrite a canonical Note/Article, change an exact reference's revision or displace an unsaved Note draft. A hidden block must remain recoverable and visible to authorised editor inspection. An invalid destination should fail atomically with an understandable correction.

### Are six patterns enough?

**As fixed layouts, no:** a history course may want a timeline/map, a language Project an image/audio card deck, an art Project a canvas and gallery, and a computing Project a running simulation. **As arrangement starting points, probably yes for now.** More expressive reusable content blocks and light composition controls are the higher-value extension. Revisit a new top-level pattern only if a real Project cannot be represented cleanly in the six existing patterns even after these additions.

## 3. A small catalogue of genuine interactive artefacts

### Shared artefact contract (bounded, not an arbitrary-code plugin system)

An interactive item is a typed, versioned Project reading artefact with its canonical authored definition, stable ID, a plain-text summary/fallback, accessible instructions, optional original assets, and optional learner-created output. It lives among normal Project sections and should be re-usable in Notes/Library only where rights and ownership permit. Preserve normal revision, export, rendering fallback, exact-read and recovery behavior.

Start with explicit whitelisted renderers and strict schema validation, not model-authored HTML/JS or an enormous generic runtime. GPT creates/edits the declarative data through existing guarded Project operations. A separate **trusted code artefact** path may execute code only through a bounded sandbox, with conspicuous Run/Stop/Reset and an explicit owner choice. Generated material cannot call authenticated Minamo APIs or retrieve tokens.

A renderer needs:
- canonical text for quoting/search/accessible fallback; text-only export that stays intelligible;
- permission-aware image/media references, alt text, source labels and image failure fallback;
- stable IDs, version and per-artefact revision behavior; explicit saving, not false claims that a local animation has been persisted;
- a compact mobile presentation and keyboard/touch support; no infinite reflow or uncontrolled focus capture;
- a clear distinction among the **authored example**, **current in-browser state** and **saved learner observation**.

### Concrete V1 examples to put in the TEST Project

| Renderer | Interactive behaviour | Learning example and storage |
| --- | --- | --- |
| **Flip flashcards** | Front/back reveal, image on either side, optional code/diagram/audio later, keyboard/touch Next/Previous, shuffle. | Evie-friendly “What makes the ball move?” cards plus a non-computing set (Japanese vocabulary or history artefacts). Save cards and images; flipping alone does not assert mastery. |
| **Drawing / explanation board** | Pen/erase/shapes, move, undo/redo, clear, save/restore; attach an exported image and short explanation to a Note or Project. | Draw the predicted path before a run; annotate a historical map or a science diagram. Compare predicted vs observed drawing without marking either as objectively correct. |
| **Python-to-Canvas lab** | Editable or read-only Python, explicit Run/Stop/Reset, output canvas, status/stdout/errors, two or three adjustable variables and a reproducible seed. | Animate balls bouncing or falling into targets. Show the link between a simple variable and the visual change, including an optional adult code view. |
| **Parameter explorer** | Sliders/toggles for a trusted simulation or simple graph, immediate labelled feedback, reset and save observations. | Gravity/speed/bounce, harmonic motion or probability; a general physics/explanation artefact, not a game-engine rewrite. |
| **Packaged pygame-ce demo (feasibility)** | Run a prebuilt, separately hosted browser bundle in a constrained embed with focus controls and restart. | Compare a tiny pygame-ce ball simulation to the Canvas lab. Distinct packaging route, not an import into the Pyodide worker. |

The owner specifically wants to see **all plausible first-level examples actually populated** in the named TEST gallery before committing to a universal design. The implementation commission should deliver working examples, not screenshots or empty placeholder panels. Use a small, meaningful range of subjects to challenge domain neutrality.

### Practical runtime decisions

**Pyodide:** already a dependency. First prototype in a Web Worker to keep long-running Python off the UI thread; output to Canvas through a narrow controlled message/drawing protocol or transferable canvas where viable. For genuinely untrusted authored code, a Worker by itself is **not** a security boundary: design a credential-free sandboxed iframe/origin, explicit resource/time/output limits, controlled package availability, restricted network access and kill/restart lifecycle. Investigate Site runtime CSP/bundling and mobile memory before broad enablement. Initially ship a curated example with a small supported Python drawing API; do not promise all Python packages or desktop GUI capabilities.

**pygame-ce:** [Pygbag](https://pygame-web.github.io/wiki/pygbag/) packages pygame-ce for browser delivery using its own WebAssembly runtime. Treat a Pygbag-produced artefact as a separately built, versioned, isolated web package, not as arbitrary Python pasted into Pyodide. Prototype one known-good bundled demo and measure footprint/loading before considering an editor or general hosting flow.

**Drawing:** a lightweight bounded Canvas is enough to establish usefulness and persistence. [tldraw](https://tldraw.dev/) is an excellent optional spike because the dependency is present; verify its storage/export, keyboard/mobile ergonomics, integration isolation, and [production licence/key conditions](https://tldraw.dev/sdk-features/license-key) before shipping. A production commercial use licence is not implicitly granted by the installed npm package.

**Flashcards:** build as native React UI, not embedded remote HTML. Images on both sides, genuine focus/reveal behaviour, readable alt text, optional audio/source later. Stored cards must survive a reload and be editable by GPT and by a learner.

**No false affordances:** a code box is not automatically executable, a “Copy” toast is not clipboard verification, and a drawing not saved is not a durable Note. Label runtime capabilities and failures honestly. Existing Reader passage/citation affordances should continue to work for accompanying explanatory text.

### Deferred explicitly

- No bespoke level-B physics/particle simulation platform, arbitrary game development framework or general-purpose unsafe HTML/JS executor.
- No full Python package manager, server-side arbitrary Python execution or unrestricted browsing from code artefacts.
- No mandatory tldraw adoption, pygame-ce editor, built-in grading engine or “mastery” score.
- No new Project type hierarchy merely because artefacts differ across domains.

## 4. TEST runs: natural language, minimal machinery, evidence only as deep as needed

### What the owner can say

“Create a TEST Project about restoring an old radio. Give it three weeks of fictional history, five Notes, ten annotations, a wrong diagnosis in week one, three explicit dashboard edits, a corrected hypothesis and a couple of linked sources. Stop before the final repair. I want to inspect the page myself.”

That should be enough. A run may instead be about language revision, art, maths, science, home networking or any future subject. The owner may then say: “Show it in the browser”, “Continue one week”, “Check MCP and D1”, “Add a flashcard lesson”, “Keep it for Evie and me to explore” or “Show exactly what would be trashed.”

### Minimal lifecycle

1. **Create on demand.** GPT uses normal, authorized Minamo creation/update tools to construct ordinary rich learning records and explicit links. Clearly label the Project and generated records as TEST/synthetic, with a unique run ID and a simple inventory of exact created IDs and revisions. Record the user's scenario instruction and chosen fictional date span. No preinstalled fixed fixture is required.
2. **Stop at any owner-defined point.** This is just the chosen end of generated history, not a special persisted phase machine. Return a short human-readable summary of created material and what remains deliberately unresolved.
3. **Inspect or extend.** The owner and GPT use the same genuine Project/Note UI and MCP tools, optionally with independent browser review. Direct edits and further Notes remain ordinary revisions. Reopen the existing run without reset.
4. **Choose evidence depth.** Quick inspection might only read back the canonical records; a UX run adds browser screenshots/interactions; a deep integrity run adds the GPT-submitted transcript, server-observed MCP activity and before/after canonical D1 state diff. The owner chooses what to verify, not a mandatory persona matrix.
5. **Keep indefinitely or explicitly remove.** Do **not** auto-expire, auto-trash or reset when a test ends. Offer a clear run inventory with “Review records / Continue / Preview cleanup / Trash this TEST run”. Trash only exact run-owned objects after a visible scope preview and explicit confirmation. Prefer recoverable soft trash where supported; never delete sources referenced by genuine work or unrelated records.

An implementation might use one tiny TEST run manifest (run ID, owner, created IDs, optional linked revisions, brief natural-language purpose, and optional evidence pointers) plus existing record semantics. **Do not** recreate the nine-variant controller, phase/epoch machinery, mandatory fixture set or parallel hidden assessment status database. Store the manifest in the simplest existing suitable structure if it already provides safe ownership, rather than designing a new subsystem by reflex.

### Non-negotiable safety/truth conditions

- Synthetic/TEST exclusion must be consistent across ordinary retrieval routes, including general workspace/context searches. The [historical V83 smoke](../acceptance/2026-10-31-v83-production-browser-continuation-isolation-smoke.md) found inconsistent exclusion. An explicitly selected TEST run is allowed to be read; routine learner continuation must not silently mix in fictional runs.
- Exact owner and cross-tenant admission checks; never test destructive cleanup on real Projects. One run's manifest must not accidentally claim an externally referenced original Note/Article.
- Distinguish **authored fictional event date** from **actual record creation/edit timestamp**; prior synthetic runs showed those diverging. Use source links/revisions rather than inventing operation receipts or verified physical outcomes.
- The GPT Markdown transcript contains model-submitted events, the server observer contains qualifying received calls, and D1 diff attests persisted state. They are separate partial perspectives; no claim of complete host-level tracing without a separately verified host recorder or exact correlation.
- A failed save must not be reported as success. Test the error/partial-failure path in a bounded way when it is relevant.
- The user decides test *topic*, *amount of history*, *stop point*, *question to inspect*, and *evidence depth*. Neither model nor app automatically imposes a syllabus or gate.

**Old fixtures:** retain historical V88/V89 acceptance reports and tooling as archival/research material. Deprecation of rigid routine testing does not require wiping evidence or breaking an already working controller before a replacement exists.

## 5. Implementation proposal — thin vertical slices, not one giant rebuild

| Slice | Deliverable | Focused acceptance |
| --- | --- | --- |
| **A. Composition/navigation** | Section outline; hidden/collapsed/reordered blocks via unobtrusive direct controls and MCP; limited pin/favourite semantics. | Use existing TEST Project; reorder and hide then restore by UI and GPT, reload and compare canonical sections/Note/source revisions; narrow-screen and keyboard check. |
| **B. Activity gallery** | Genuine image flip cards; basic persistent drawing board; curated Python Canvas experiment with clear Run/Stop/Reset and fallback. Populate named TEST Project. | Run, change one variable, stop/restart; flip image card; draw/save/reload; verify actual rendered UI, no silent lost drafts, export/recovery and accessibility. |
| **C. Flexible TEST history** | Natural-language generated run label/inventory, arbitrary stop point, selective deeper tracing, keep/continue and previewed explicit cleanup. | Create a different-subject three-week history with Notes/annotations/edits; inspect at chosen stop; continue, keep through reload; preview exact deletion without affecting real content. |
| **D. Optional artefact feasibility** | One prepackaged pygame-ce/Pygbag demo; short tldraw-vs-lightweight Canvas comparison, including licensing and mobile footprint. | Decide by actual Site execution and owner usefulness. No promise that either ships unless evidence justifies it. |

Slices may be grouped in a release if safe, but each should leave Minamo usable. Reuse existing React/Reader and Project validation rather than constructing a separate application inside every section. Provide example content to judge with the owner and Evie before expanding the artefact catalogue. Large performance costs or unsupported runtime security require narrowing the slice, not accepting a hidden risk.

### Baseline and verification guardrails

- **V100 production is the stable baseline.** No destructive data migration, access-policy change, auth reset, cross-space content rewrite or unrelated Home/Library redesign.
- Main source and protected Sites/native source may differ; reconcile deliberately at implementation time. Do not assume an npm dependency present in public main is already enabled in the Site runtime.
- Preserve Note autosave/pins, direct edits, revision CAS, semantic MCP continuity, source rights, exact anchors, independent record identities and recovery/export.
- Keep focused TypeScript/build checks, directly affected safety tests and brief live browser verification. Full suite, nine-persona campaign and broad deployment gate are **not** default requirements under current owner policy.
- Include a real narrow viewport check with a verified method, or mark it genuinely unverified; do not treat a desktop screenshot as mobile evidence.
- No release until an artefact shown as interactive **actually works** in the deployed Site.

## 6. Decisions for the owner after seeing examples

1. Which of these artefacts most improve a real learning session, versus creating novelty or visual clutter?
2. Should personal favourites and collapsed state follow an account across devices or remain view-local?
3. Is the lightweight drawing board enough, or does tldraw's deeper editing justify licensing/footprint?
4. Is pygame-ce a useful specialized import format, or do Python Canvas + native React controls cover the actual need?
5. Do Projects benefit from another named pattern, or only more composable blocks?

These are deliberately choices **after** working examples and a real TEST walkthrough. This draft PR authorizes no code changes, data deletion, test-run reset or deployment.