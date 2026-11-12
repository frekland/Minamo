# Technology landscape — composable activity engines and disciplined reuse

As-of 25 October 2026 research from official vendor pages, existing main package.json and draft PR39 source. Candidate statuses are **hypotheses pending runtime benchmarks**, not software installed in Minamo. Research/implement each promising library via lazy chunk or separate proof host; exact version, licence, lockfile, emissions, permissions and CSP must be verified for real deployment.

## Guiding architecture

A trusted **Activity Component Registry** consumes a typed, server-admitted safe manifest and delegates to finite rendering/adaptor components. GPT authors data, scenarios and exercise parameters through MCP, **not untrusted JavaScript/JSX or component code to run in Minamo**. The registry declares code/file/rich-text provenance, accessibility, supported browsers, render fallbacks, events to capture (only by deliberate learner save), security and resource lifecycle. Component discovery must be efficient for Sol Light and not pretend all engines are production-ready.

## Library scorecard: try deeply vs selectively vs duplication

| Tool | Role in Minamo | Verdict | Evidence/considerations |
|---|---|---|---|
| **React Flow (@xyflow/react)** | Structured Journey/Investigation/Library concept and prerequisite map; activity flow machine diagrams | **Deep prototype** | Typed React node/edge views, mini-map, custom cards; MIT. https://reactflow.dev/ |
| **tldraw SDK** (owner has licence) | Optional rich freeform Learning Canvas; cards, sketches and visual exercises with canonical record pins | **Deep prototype** | Verify allowed production domain/key, telemetry and licence expiry; do not put key in repo or assume free production. https://tldraw.dev/sdk-features/license-key |
| **dnd-kit** | Sorting, matching, graph ordering, kanji and algebra rearrangements with keyboard option | **Build template** | Toolkits for accessible drag-drop. https://dndkit.com/ |
| **XState** | Durable multi-step challenge/attempt UI transitions, interrupted resume and actor/event traces | **Prototype selective** | Excellent for complex branching and deterministic event logic; avoid new authority/queue for simple forms. https://stately.ai/docs/actors |
| **CodeMirror 6** (already installed) | Exercise multi-file view/edit, Python/JS/SQL syntax, safe excerpts and source mapping | **Keep default** | Existing Minamo ownership, Notes and runtime integration; leverage rather than replacing. https://codemirror.net/ |
| **Monaco Editor** | Optional VS Code-like multi-file/diff debugger studio | **Compare in lab** | Heavier distinct worker/editor subsystem; use only if proven multi-file/diff educational benefit over CodeMirror + Foundry N02. https://microsoft.github.io/monaco-editor/ |
| **Code Hike** | Annotated code walkthroughs, line focus, code tours and documentation pedagogy | **Prototype** | MDX-oriented compile pipeline; do **not** execute user-supplied/GPT MDX code in trusted origin. Consider source-bound precompiled data representation. https://codehike.org/docs |
| **Sandpack** | Embedded JS/React coding exercises, source editor + preview | **Research/isolated prototype** | Browser bundler may use external CodeSandbox infrastructure/CDN; no default private source leakage, untrusted preview only isolated. https://sandpack.codesandbox.io/docs |
| **WebContainers (StackBlitz)** | Full browser Node development/test server experience | **High-risk optional** | SharedArrayBuffer/cross-origin isolation and Android memory/browser support; do not globally alter Sites security headers to force it. https://developer.stackblitz.com/platform/webcontainers/browser-support |
| **xterm.js** | Beautiful replayable terminal panes, resize/copy/ANSI and learner-supplied transcripts | **Strong prototype** | It is terminal *presentation*, not a shell. No PTY or Kali access without separate authorised backend. https://xtermjs.org/ |
| **React Three Fiber (@react-three/fiber)** | React-oriented renderer for trusted bounded 3D/glTF scenes and parameterized simulations | **Prototype with PR39 Three** | Avoid parallel 3D authorities; compare R3F ergonomics vs existing Three implementation and GPU lifecycle. https://r3f.docs.pmnd.rs/ |
| **@pixi/react / PixiJS** | Performance-oriented 2D game/sprite/audio visual interactions | **Prove one game** | Powerful renderer; choose for games/animated sprites, not editable whiteboard shapes. https://pixijs.com/blog/pixi-react-v8-live |
| **react-konva / Konva** | Interactive 2D diagram, image/code annotation, collision/coordinate boards | **Prove one lab** | Browser-only React canvas, strong drag/hit testing and editable shapes. https://konvajs.org/docs/react/index.html |
| **tldraw vs React Flow vs Konva** | Three very different canvases | **Complement, not duplicate** | Semantic topology = React Flow; freeform note board = tldraw; spatial object interaction = Konva. Do not place all three in every Activity. |
| **Recharts** (already installed) | Conventional charts and lightweight data reading | **Keep default** | No new package without demonstrated need; PR39 already has source-bound charts. https://recharts.org/ |
| **Tremor** | Polished dashboard UI atop existing chart stack | **Mostly optional** | Evaluate as presentation kit, not new chart computation; limited pedagogical novelty beyond Recharts+existing components. Verify exact current architecture/licence before adoption. https://www.tremor.so/ |
| **Observable Plot** | Expressive statistical plots and grammar-based data investigation | **Prototype** | A concise chart grammar may make GPT publishing more reliable than ad hoc chart JSX. https://observablehq.com/plot/ |
| **Plotly / Vega-Lite** | Scientific charts with dense interactions, spec-based graphs | **Compare** | Bundle/accessibility/export/performance tradeoffs; don't install every graphing engine. https://plotly.com/javascript/ ; https://vega.github.io/vega-lite/ |
| **DuckDB-Wasm** | Advanced in-browser analytic SQL, Parquet/Arrow/CSV queries, data labs | **Strong lab, gated** | Distinct from existing SQL.js for analytical datasets; memory/network/extension restrictions. Offline manifests/worker, no privileged D1 access. https://duckdb.org/docs/stable/clients/wasm/overview |
| **SQL.js** (already installed) | Standard SQL/SQLite and smaller exercises | **Keep default** | Existing finite Worker; no second D1 or learner authority. https://sql.js.org/ |
| **Strudel** | Live-code rhythmic music patterns, highlight running pattern events | **Research isolated creative mode** | Live code evaluation and sampled sounds; host/isolation/licensing and audio lifecycle. https://strudel.cc/technical-manual/repl/ |
| **Tone.js** | Deterministic synthesizer, sequencer, waveform/timing activity, sound experiments | **Build bounded declarative tool** | Deliberate user-gesture playback; no auto microphone or autoplay. https://tonejs.github.io/ |
| **Web Audio API / AudioWorklet** | Low-level FFT/audio work, visualization and processing pipeline | **Build only if needed** | Worklet runs audio processing thread with CPU/privacy constraints. https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor |
| **React mic / @ducanh2912/react-audio-encoder** | Explicit user sound recording and encoding | **Later, audit versions first** | Mic permission, browser encoding, owner upload rights; recorder wrappers add little until genuine speech/music lesson demands them. Use native MediaRecorder feasibility first. https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder |
| **Motion (formerly Framer Motion)** | Delightful Atlas focus/mode transitions, code annotation movement | **Small targeted adoption** | Layout projection with reduced-motion; no constant animations disrupting learner text selection. https://motion.dev/docs/react-layout-animations |
| **Scrollama** | Scroll-driven tutorials and staged program-state explanations | **Optional template** | Useful for authored narratives, but keyboard/non-scroll equivalent and mobile longform view required. https://github.com/russellsamora/scrollama |
| **react-rough-notation** | Pencil-like emphasis, visually highlighted code concepts, guided hints | **Optional decoration** | Highlighting must be keyed to exact source, disabled/reduced-motion option and not be passed as evidence/status. https://roughnotation.com/ |
| **Lucide React** (already installed) | Consistent interface icons and Activity palette | **Keep, strict allowlist** | No arbitrary component name from GPT, remote icon injection or dynamic import of unknown modules. https://lucide.dev/ |
| **React Hook Form** (already installed) | Small typed activities with answers and rich composition forms | **Keep default** | Existing validation/form conventions with Zod. https://react-hook-form.com/ |
| **Formik / TanStack Form** | Alternative form state stores | **Low priority / compare** | Usually duplication; invest only if new form capabilities demonstrably require different architecture. https://formik.org/ ; https://tanstack.com/form/latest/docs/framework |
| **webhaptics / Vibration API** | Optional tactile feedback for touch games or interactions | **Tiny optional enhancement** | Browser Vibration API not baseline, opt-in nonessential feedback, never a correctness signal. https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate |

## High-value combinations (more useful than standalone demos)

1. **Bug Hunt Studio:** CodeMirror multi-file browser + Code Hike-style annotation layer + PR39 supplied diff + xterm.js transcript + controlled hints + git commit/CI evidence.
2. **Data Detective:** PR39 CSV/table + Observable Plot or Recharts, optional DuckDB-Wasm analytical query panel, reflection/compare. No data permanently stored twice.
3. **Visual Algorithm Quest:** React Flow graph + typed deterministic Dijkstra/DFS engine + Motion focus / reduced-motion static trace; tests and code challenge.
4. **Interactive Maths Board:** KaTeX/MathJax source, finite JSXGraph/typed plot or PR39 maths, prediction input, computed verification only when real SymPy executed.
5. **Japanese Language Playground:** furigana + glossary + native audio + drag/order activity, exact quote and user correction linked to Investigation.
6. **Retro Game / Visual Programming:** PixiJS sprites or React-Konva 2D shape board plus finite trusted level generator + local GitHub starter; no user JS in owner origin.
7. **Creative Music Lab:** Strudel-style pattern authoring in independently isolated sound host or declarative Tone.js rhythm board, MIDI/waveform from PR39, saved pattern plus learner note, playback after user gesture.
8. **Freeform Learning Atlas:** React Flow authoritative graph with tldraw opt-in annotated overlay/custom pinned cards; drawing is not the official relation database.
9. **Scrollytelling Code Lab:** Code Hike-like source annotations + Scrollama/Motion optional sequence of actual algorithm states; explicit keyboard/stepper alternate.
10. **UI Accessibility Workshop:** tldraw wireframe + local React component task + colour/contrast PR39 + source-linked review/test prompts and real-browser keyboard/ARIA checks.

## Honest external runtime boundaries

- Current Minamo **does not** execute arbitrary app JavaScript in its existing finite Web tool. A screenshot or supplied code bundle is not a live executable preview.
- Sandpack has an online bundler model; check outbound source/dependency privacy, security origin, service dependency, cache and package licence. Self-hosting is a separate engineering problem.
- WebContainers may require COOP/COEP/cross-origin isolated contexts; embedding and Android limitations can make them a poor fit for an owner-private application. Do not weaken the app session boundary.
- xterm.js has no shell on its own; printing a synthetic prompt must be labelled a simulation/supplied transcript.
- tldraw production requires an appropriate licensed host; user reports a licence but exact domains, version and permitted telemetry need verification before release.
- Browser audio synthesis and mic recording are deliberate, user-initiated and scoped. Never record microphone input by simply opening a lesson.

## Library selection and experiment rules

Research official version/current documented API with Context7/vendor docs, install in a **test branch only** and measure actual first-load, a11y, worker/CPU, Android-sized viewport and CSP. Prefer a single chosen solution for each coherent role, keep all others in the research bank with rejected alternatives. No app-global dependency for a dormant option. Pin lock/SBOM; note licensing/permission limitations, and always supply a static accessible fallback.

Give **each library experiment a runnable concrete teaching challenge** and at least one adverse test. “Looked cool in a gallery” is not acceptance. Integrate across current Journey/Investigation/Note/Library only after verifying source and execution authority. If a module can still only be integrated after a major schema or sandbox change, bank that bigger work honestly as Stronger-Model Required rather than a misleading Sol Light task.

