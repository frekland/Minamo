# Owner scope expansion — Capability Foundry at full Pro capacity

**Owner direction, 25 October 2026:** PR #38's first commission was too conservative. The owner has substantial Pro Standard usage and a refresh today; ChatGPT Work can tackle a very large engineering programme in chunks. **Do not cap the work at four foundational capabilities, a handful of finished prototypes, or research-only speculative notes.**

This document **supersedes limiting language** in README, WORK-COMMISSION and EXPERIMENTS such as "a few finished foundations", "Cohort 3 research-only" and "stop after first cohort". It does not supersede privacy, source authenticity, security or the owner-only release gate.

## Execution philosophy

- **Explore broadly, implement deeply, iterate, and keep going.** This is a compute-heavy research-and-engineering marathon: inspect, compare, prototype, execute, falsify, fix, integrate, benchmark, document, and start the next valuable packet. The initial 24 ideas are a *starting menu*, not a cap.
- **Chunk aggressively.** Divide work into independent coherent packets, record reproducible boundaries, then advance without asking for approval after each. If time/context/tool limits interrupt execution, write a precise continuation handoff and working source state so a new Work instance starts immediately.
- **Independent specialist agents.** Assign research, implementation, architecture, security and accessibility, and independent learner-UX challenges across bounded file ownership. Use their results to revise the architecture; avoid simulated independent review through agents merely rephrasing one conclusion.
- **Bank tested code, not just plans.** Aim for a **double-digit set of working demonstrations where feasible**, multiple deep integrated dormant modules, and source-linked dossiers for many more. These are ambitions, not quotas: exact evidence and successful cases matter more than manufactured breadth.
- **No arbitrary stop.** Do not stop after initial Python + Japanese + maths success. Keep adding high-value capabilities in order of proven reuse, while shared work passes its safety and regression gates.
- **Do the hard parts now.** A future Plus/Sol Light task should primarily perform constrained registration/activation/integration, not design engine isolation, Unicode mapping, data persistence, package management or permission models.
- **Substantial architecture refactoring is in scope on draft branches when needed.** Avoid reckless rewrites, but do not let artificial narrowness prevent an extensible shared platform.
- **Keep source fresh.** Verify current main/head as of execution and current PR #37 provenance; do not infer release from old STATUS, historical PR text or sample outputs.

## Broad exploration, beyond the existing 24 experiments

Build a scored opportunity map, looking for **reusable subject-agnostic affordances** and adjacent educational use cases. Research and attempt worthwhile modules across the following tracks.

### A — Japanese, other languages and linguistic literacy
Native word/compound ruby + okurigana + vertical/horizontal writing; original-base-text selections; hide/reveal; bilingual parallel passage; per-word authored glossary; part-of-speech and grammar markers; Japanese tokeniser proposals; author-verified corrections; kana/kanji component/stroke and licensed dictionary resources; speech pronunciation and segmented audio; voice availability; slow/repeat; IPA/mora/pitch (source-limited, no false confidence); Chinese pinyin/zhuyin; Korean glosses; Arabic vowelisation/RTL/bidi; multilingual parallel reading; optional spaced/retrieval practice without automatic learning achievements; controlled export to external practice files. Include candidate corpora/dictionaries with real licence/size scrutiny.

### B — Maths, symbolic thinking and science
KaTeX vs MathJax4 vs native MathML, MathLive equation editing, accessibility/speech, equation capture/anchors; rich mathematical formulae in ordinary Reader/Notes/Manuscript/MCP; symbolic algebra via SymPy, numerical libraries and actual computed Run; parametric diagrams, coordinate geometry and JSXGraph; calculus/integrals/derivatives/vector fields, matrices, probabilities, chemistry/unit dimensions, stepwise reasoning, proof/AST traces and visual debugging. Render a mathematical statement without claiming to have proved it.

### C — Python and multi-language code artefacts
Offline Pyodide scientific wheels with hashed pinned dependency manifests, NumPy, Matplotlib, pandas, Pillow, SciPy/SymPy as feasible; typed outputs for stdout/stderr, plots, tables, SVG/PNG and other file artefacts; explicit execute vs view; execution snapshot, cancellation and provenance; notebook/IPYNB import; Python animation and tiny 2D games. Display external Rust/Go/Bash/C/Java/JS language code, error, build, test and terminal traces faithfully; real in-browser execution only for a demonstrably safe separately bounded engine. AST, code-step and test-failure timelines; useful Kali/HTTP/packet exploration as owner-supplied evidence, not app-run machine captures.

### D — Interactive graphics, simulation and 3D
Three.js/glTF model viewer, camera/lighting/animation, programmatic parameter scenes, mobile and WebGL/GPU failure; safe 2D Canvas sprite games, Sudoku/retro RPG visuals; graph/tree/state/flow algorithms, cellular automata, physics, fractals, terrain, shaders/WebGPU optional; molecular/protein chemistry, electronics/circuits, geometry, scientific simulation and GIS if useful. Pygbag/Pygame/React previews **only** in appropriately isolated hosts—otherwise bank as offline/external workflows with verified toolchain and safe display of outputs.

### E — Data, audio, media and exploratory research
CSV/TSV/JSON/SQLite/Parquet as appropriate, interactive charts, linked tables, statistical visualisation; Observable Plot/Vega-Lite/Plotly/Recharts/D3 comparisons; Cytoscape, network topology and graph layout; spectrogram/waveforms, MIDI/notes, pitch timing, data sonification, music and song-analysis displays; diagrams, source documents, data provenance, controlled static SVG, screenshots and presentation of code generated artefacts. Identify further useful formats and test their actual browser/Worker feasibility.

**Explore and rank at least five genuinely new candidates beyond these**; more welcome. Explain discarded ideas rather than silently omitting them. The aim is general capability for future projects, not a single themed mini-app.

## Foundational platform — invest heavily

A typed and versioned Artefact Platform should make later modules easy to add: admitted format/schema, immutable canonical source, owner/source/media rights, provenance, metadata + binary outputs, navigation/Notes/Journey/Investigation links, data and capture snapshots, static fallbacks, lazy React renderer, lifecycle/disposal, safe execution isolation, source-correct deep links and MCP authoring/readback. Preserve the existing D1/R2/CAS/recovery authority and UTF-16 rendition exactness; never invent parallel durable queues or identity.

Build a **developer/lab-only interactive specimen gallery** with runnable good/bad fixtures, mobile/desktop/a11y states and regression cases. Each adapter supplies schema, renderer, fallback, static source, security tests and activation guidance. Support composite artefacts (e.g. Python source+plot+tabular data; Japanese text+ruby+audio; mathematical equation+computed proof; algorithm source+timeline).

Don't let shared contracts become speculative architecture. Actually integrate at least several slices with current Reader/Notes/Tools via isolated synthetic D1 and run browser acceptance.

## Recommended autonomous work packets

0. **Audit baseline and establish lab:** current source/site, actual tests, file ownership and security, golden fixtures, baseline bundle/browser performance where measurable, engineering continuation file.
1. **Shared contract/SDK:** schema/registry/versioning, correct provenance and source mapping, lifecycle/disposal, static fallback, safe artefact gallery, tests and typed errors.
2. **Japanese deep slice:** ruby authoring, rendering, exact quote/copy/Flag/Annotation, history, multiple modes, Notes, typed GPT/manuscript, mobile; extend to glossary and multilingual text where verified.
3. **Maths deep slice:** TeX/MathML safe reader and rich Note authoring, mathematical editor, source-accurate citations, mobile and accessible reading, optional interactive geometry.
4. **Scientific Python slice:** offline wheel packaging, live plot/image/table outputs, safe saved Run/asset readback, cancellations and fallback; SymPy and scientific extension experiments.
5. **Data and algorithm views:** charts, tables, traces, tests, algorithms, network/CLI evidence, user-supplied vs observed Run separation.
6. **3D, 2D and game work:** real Three.js viewer + validated models + disposal; safe 2D Canvas, algorithms and small game demonstrations; investigate compiled Pygbag/React external hosts.
7. **Language/media and science extensions:** voice, audio segments, bilingual/vertical script, symbols, molecular/circuit/music/GIS visualisations, other strong opportunities found in exploration.
8. **Cross-module integration:** ensure Notes/Reader/Journey/MCP consistency, replay, permissions, source rights, recovery, old source and Unicode, multi-mode selection.
9. **Independent review/remediation:** separate security, a11y, performance, teaching and API/Light-model-handoff assessments; fix and rerun.
10. **Bank for activation:** fully source-linked reports, measured fixtures/screenshots, architecture and manifest, versioned reusable modules, dependency ordered activation dossiers and copyable Light tasks.

**Packets are not strict sequential phases:** run independent research/prototypes concurrently; integrate by module boundaries. After any successful packet, deliberately evaluate deeper iterations or next candidate—do not stop merely because one happy path passed. Run targeted tests at each iteration and the full suite at integration boundaries.

## Reporting and durable continuity

At each meaningful packet boundary update the working branch's continuation file with branch/commit SHA, successful/failed tests, output/artefact paths, blockers, next practical command and release constraints. Create separate draft implementation PRs if path ownership or reviewability justifies it; link them from PR #38. Keep genuine learner data out of GitHub; synthetic fixture cleanup must be evidenced.

Deliver a status matrix for every candidate with states IDEA, RESEARCHED, RUNNABLE_STANDALONE, INTEGRATED_DORMANT, DEPLOYABLE_PENDING_OWNER_ACCEPTANCE, RELEASED (only if explicitly authorised). Distinguish actual browser execution vs static source vs unit test, virtual phone vs physical Pixel, test-authenticated synthetic principal vs real owner Site, imported output vs Minamo-observed Run.

A successful module's activation dossier must include exact tested source ref/path, API/schema, fixtures, dependencies and licence/SBOM, assets and bundle/latency/memory measurement if available, permission/CSP assumptions, negative cases, fallback/rollback and a **self-contained small Sol Light follow-up prompt**. If a module cannot be activated by Light without redesign, do the expensive work now or mark it honestly as requiring a powerful model.

## Limits deliberately unchanged

No merge to main, no production Sites save/deploy, no access-policy changes, no unrequested cost-bearing services, no modifications to authentic learner records or original Minamo. No assumption that arbitrary JS or Python packages can run safely under current CSP. No fake observed execution or automatic checkpoints/learning mastery. Do not execute unrelated PR #12 or modify frozen persona PR #36. Maintain exact retained text/history, owner rights, source permission/revocation, recovery and accessible fallback. Do **not** treat this as prohibiting broad draft-branch changes: the owner wants ambitious production-quality code prepared for later release.

## Desired outcome

A **large, practically reusable engineering portfolio** spanning languages, maths, graphics, programming, scientific/technical subjects and cross-cutting artefact representation. Prioritise meaningful completed tested work, not conservative scope management or arbitrary maximums. Continue through the strongest opportunities in one Work session, persist durable handoffs at boundaries, and leave a robust activation backlog for later Plus/Light work.
