# Capability Foundry — executable experiment matrix and activation packages

> **Owner scope expansion (25 October 2026):** Read [SCALE-UP-EXECUTION.md](SCALE-UP-EXECUTION.md) before proceeding. It overrides conservative caps in the original plan: execute many high-value independent work packets, use subagents, deliver real verified code/prototypes across languages, maths, graphics, games and scientific tools, then keep going. No merge/deploy or genuine learner-data mutation is authorised.

This matrix converts promising ideas into experiments that could be banked for later implementation. A research label is **not** evidence of a functioning adapter. Every test report must say what actually ran, where, under which source tree and browser/runtime, including failures.

## Prototype experiments

| Ref | Exact synthetic challenge | Candidate technologies | Minimum verification | Stop/defer conditions |
| --- | --- | --- | --- | --- |
| E00 | Render/fallback/dispose 12 declared artefact variants using one registered contract | React lazy modules, TS/zod, existing D1 and media | Version/unknown kind errors, static fallback, rerender/cleanup, fidelity and permissions | Requires new storage authority, unknown union silently accepted |
| E01 | Japanese paragraph, furigana on 3 compounds, toggle/read/copy/Flag across words | Native ruby/rt/rp, current Reader exact spans | Exact quote + UTF-16 offsets across annotations, 390px, historic editions, keyboard | Annotation requires changing canonical text; accessibility unusable |
| E02 | 250 inline/display formulae plus equations embedded in Notes | KaTeX/MathJax, optional MathLive | XSS boundaries, keyboard, zoom, errors, maths source round-trip, a11y comparison | Untrusted external fetches, inaccessible source or clipping |
| E03 | plot x² and two noisy series with real Python, emit PNG + stdout + metadata | Pyodide 0.28.3 offline Matplotlib/NumPy wheels | Exact result provenance, PNG signature/dimensions, cancel/stale output, warm/cold/memory | Needs unrestricted Python package/network fetch |
| E04 | CSV time series and grouped scatter, zoom/tooltip then static table fallback | Existing Recharts first; compare Observable Plot / Plotly | Renderer removes cleanly, source data exact, keyboard, no untrusted script | Parser can execute script, row explosion |
| E05 | BFS/Dijkstra shortest path with reproducible step events | Cytoscape.js/typed SVG graph, trace manifest | Golden algorithm trace, can rewind steps, no claim Minamo executed algorithm unless true | Graph layout changes semantics, unbounded render |
| E06 | 2D maze with keyboard and touch, pause and resume | Trusted Canvas event engine, OffscreenCanvas if warranted | Touch game still responsive, frame cap, close/cancel, no owner network | Arbitrary JS hangs main thread, no secure termination |
| E07 | Orbit an object, show axes/mesh, load tiny validated GLB | Three.js OrbitControls/GLTFLoader | GPU fallback, disposal/GC, invalid GLB, huge geometry, mobile tap/rotate | Context leaks, unauthorized external texture load |
| E08 | Show external Kali/Bash and Rust CLI steps, exit codes and stdout as *supplied* | Structured trace/events, existing semantic terminal Notes | No fake execution, timestamps/ordering precise, separate terminal evidence provenance | Output reclassified as Minamo-observed |
| E09 | Japanese example phrase segment replay with optional Web Speech fallback | SpeechSynthesisUtterance ja-JP, current R2 audio | Availability disclosure, no autoplay, focus, no silent network dependency | No voice available, misrepresents synthesized accuracy |
| E10 | Load 10MB synthetic CSV/JSON subset with bounded table and row filtering | Browser streaming parser, existing SQL | bounded memory/time, encoded/escape CSV, exact file source | Unbounded parse/CPU or owner data leaked |
| E11 | Read Python notebook with markdown+code+stored image outputs; never execute on open | Notebook JSON read-only importer | source/evidence separation, attachment rights, unsupported output fallback | MIME/size unsafe, arbitrary HTML executed |
| E12 | Run SymPy integral, explicitly separate math display from computed answer | Offline Pyodide SymPy | Exact output+code hash; independent test oracle | Scientific package cannot load without violating sandbox |
| E13 | View PDB/glTF molecule geometry with source metadata | Mol*/3D viewer comparison; F07 | Real fixture file, rights, source provenance, GPU disposal | Unsupported codec, excessive resources |
| E14 | Time-ordered HTTP/TCP/packet explanation trace with opt-in redaction | Trace viewer + code/terminal evidence | No claim packets were captured by app; redacted secrets before saving | Private metadata disclosed; unsupported capture claims |
| E15 | Compile Pygame/Pygbag tiny game into browser bundle | Pygbag external build, isolated preview origin | Real generated bundle and Android responsiveness; no Minamo-owner API | Same-origin arbitrary JS, large runtime / invalid browser |
| E16 | Display a built React app with file-level source map | Sandpack vs prebuilt static artefact | Cross-origin isolation compatibility, module/CSP/CPU stop, no ambient credentials | Untrusted application code can reach owner API |
| E17 | Kuroshiro/Kuromoji reading proposals for ambiguous Japanese cases | Local dictionary with audited licences | Human-edited correction persists; server metadata aligns with base | False authoritative readings, network fetch, huge dictionary |
| E18 | Recall/reveal word after user opts into practice | Presentation-only state first, optional explicit learning events | No fabricated completion, independent Notes/context and checkpoints | Silent scoring/learning progress writes |
| E19 | Spectrogram of a tiny user-provided audio clip | Web Audio API, FFT in worker | Original asset permissions, no automatic microphone, reduced motion | privacy or codec/CPU failure |
| E20 | Plot coordinates/geometry with drag points and vector notation | JSXGraph + KaTeX/MathJax | Scientific correctness fixture, mobile touch, accessibility fallback | unpredictable scripted expressions |
| E21 | Compare declared flow/state diagrams with Graphviz/SVG renderer | Existing Minamo diagram engine vs WASM options | Only typed graph specs, no script/URL, exact source, keyboard | Native diagram coverage already adequate |
| E22 | Two-column bilingual reading and vertical CJK | CSS writing modes; native ruby | Bidirectional controls, overflow/print/phone, safe select, no forced gloss | corrupt base source or unfixable accessibility |
| E23 | Deterministic cellular automaton/physics widget | Validated parameters, fixed engine | Seeded output repeatable, step control, CPU disposal | Unbounded wall-clock or inconsistent claimed output |

## Initial cohort: deliberately ambitious but bounded

**Cohort 1 / highest leverage:** E00, E01, E02 and E03. Build these *real* shared-workspace prototypes with synthetic local D1/Worker where feasible. Deliver a first working vertical slice and acceptance evidence, not 100 pages of speculative diagrams.

**Cohort 2 / breadth:** E04, E05, E07, E08, E09, E22. Run independent micro-prototypes and select best integration points. Keep 2D games (E06) if an actually terminable host is feasible.

**Cohort 3 / further experimental implementation, not research-only:** E10–E21 and E23. Create as many additional working experiments and feature-flagged adapters as feasible, with independent security review and no merge or deployment. Search further afield for adjacent learning value: data sonification, differential-equation sliders, network state visualisation, structural bioinformatics, syntax trees, algorithms, simulations and terminal replay. Do not expand the shipped dependency surface without evidence.

These cohorts are sequencing hints, not a stopping limit. Continue across cohorts in parallel and expand the matrix under SCALE-UP-EXECUTION.md. At each packet boundary choose work by actual learner value per bundle/performance/security burden, not novelty.

## Standard measurements to report

- Env: source commit SHA/tree, locked package version, release channel, build, browser versions, viewport, device or emulator classification, auth mode, network assumptions.
- Correctness: exact input fixture, code/commands, output signatures, snapshot/hash, discrepancies, unsupported cases. No “tested” label from visual plausibility alone.
- Delivery: first-load bytes and transfer count per activated renderer, baseline JS unaffected at Home, lazy loading, render latency cold/warm, first output time.
- Resources: memory observed where measurable, GPU/Worker lifecycle, event handlers attached/detached, cancel/timeouts, repeat activation and navigation.
- Learning UX: Can a learner identify what they predicted, ran, observed, imported or merely viewed? Copy/source/passage links stable? Is it easier than a screenshot or local terminal?
- Device/a11y: desktop Chromium + Firefox when available, Android-sized viewport, touch vs keyboard, 200% zoom, long text, reader screen assistive tests where available.
- Safety: hostile/untrusted input fixtures, CSP/network attempts, MIME limits, selection/rendition fidelity, source/asset permissions/revocation, impossible-to-restart Run boundaries.
- Absence: any test not actually run must be explicitly marked unverified, especially physical Android, NVDA/TalkBack and authenticated hosted acceptance.

No invented timing or performance claim, no scientific “correctness” determined solely by model judgment, and no tool package pinned without actually resolving its version and licence.

## Mandatory activation dossier template

For each accepted experimental module produce docs/capability-foundry/activation/Fxx.md containing:

1. Problem and specific learner workflow with demonstrated improvement over current app (not a generic feature pitch).
2. Decision: chosen implementation and rejected competitors with precise evidence.
3. Runtime: source commit, pinned package/license/hash, generated assets, size/cold/warm latency, CSP and network.
4. Exact typed contract/schema and example output, canonical text, provenance, permission gates, fallback and version policy.
5. Implementation status: not started / standalone prototype / integrated behind flag / verified current main / released. State the actual level.
6. Touched paths and dependencies, working source branch/ref, unit/integration/browser tests with exact commands and fixture data.
7. Acceptance: keyboard/mobile/a11y, source-linked data readback, legacy Notes and authenticated action boundaries, negative/security cases.
8. Rollback/delete plan. Existing records and source bytes must not be silently removed/reinterpreted.
9. **Light-model activation task**, max one coherent unit: “Given ref X and exact file paths Y, enable module Z under flag Q, update tests T, stop at review. Avoid architecture rewrites, source migration, new service or production deployment.”
10. Confidence (proven / prototype / theoretical), blockers and what a human owner must still test.

## Reference example: small follow-up for a light model

~~~text
On a new branch from the release actually verified at task start, integrate
the already-tested F01 ruby Reader adapter from [exact branch SHA] into
existing Article reading only, behind default-off capability flag
learning.rubyAnnotations. Reuse the validated UTF-16 spans and source text;
do not alter stored article text, Note body format, Source policy or MCP
catalogue. Copy the E01 fixture and regression tests, including quote
through mixed ruby/kana and old retained edition. Test typecheck, build,
unit, and local browser viewport. Create a draft PR with before/after
screenshots and execution receipts. Do not merge or deploy.
~~~

If Light cannot execute from this small contract without guessing or new architecture, the banked package was not complete enough; revise the package while Pro is available.

## Research decision gates

- **GO**: working actual fixture, current domain compatibility, lossless source, renderer fallback, bounded resource/security evidence, downstream activation spec complete.
- **DEFER**: useful but resource/cross-origin/license/mobile constraints unresolved; keep isolated demo and notes.
- **NO-GO**: rights/security violation, non-isolatable execution inside private site, changes to core learning semantics without demonstrated benefit, fake observed evidence, or unreasonable complexity for likely usage.

## Sources

See SOURCES.md for primary docs and precise claims, and ARCHITECTURE.md / LANGUAGE-MATH.md for the deep design contracts.
