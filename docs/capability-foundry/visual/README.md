# Visual, algorithm and game capability packet

Status: runnable standalone trusted engines, dormant lab UI and SDK adapter. No production registration, private assets, durable learning state or Site change. Branch: `research/foundry-execution-20261025`, based on exact GitHub PR38 source `d92330ace36ed43fa005cda18db0edee4fc3d6e8` (main content at `c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c`). Parent programme will record the final committed implementation SHA; precise tested files are additionally hashed in MEASUREMENTS.json.

## Completed implementations

| Capability | API | Demonstration | Evidence and limits |
|---|---|---|---|
| Strict scene geometry | `validateVisualScene`, `VisualScene` | Original illustrative water-like geometry | Finite bounds, unknown-field/accessor rejection, clones, mesh/vertex budgets; this is no chemistry computation |
| GLB geometry subset | `decodeGeometryGlb`, `makeTriangleGlb` | Actual generated 396-byte GLB2 triangle, decoded from binary positions | Header/chunk/UTF8/buffer/accessor validation; rejects all URLs, textures, extensions, hierarchy, animation, sparse/interleaved geometry. Deliberately not a general glTF importer |
| Three.js viewer | `buildVisualGroup`, `mountVisualScene` | Explicit Open 3D, orbit/zoom, GLB toggle, invalid-version probe | Real geometry/material allocation and exactly-once disposal tested under Node. Actual GPU/browser evidence is owned by programme acceptance; no fabricated GPU test |
| Artefact SDK adapter | `visualSceneAdapter`, `visualSceneArtefact` | `scene/geometry-v1` | Source hash, canonical/payload equality, source/Run authority denial tested; lazy Three loading and teardown. No asset-store or Run authority created |
| Weighted graph stepping | `graphTrace` | Dijkstra vs BFS, rewind, exact distance/parent table | Golden weighted/hop results, disconnected nodes, invalid edge/weight/ID/budget cases |
| Bounded 2D game | `createMaze`, `moveMaze` | Keyboard/touch maze | Actual legal-path completion, immutable wall hit, state validation; no arbitrary learner JS |
| Cellular automata | `lifeStep`, `initialLife` | Step/restart a glider | Blinker period, glider translation, dead exterior and budget oracles |
| Basic physics | `bounceStep` | Step or advance one simulated second | Semi-implicit Euler; gravity/restitution. 10,000 actual steps bounded. No particle interactions or claim of precision physics |
| Fractal | `mandelbrot` | Canvas image with iteration control | Determinism, symmetry, finite sample/iteration budgets. Non-escape before a finite limit is explicitly not proof of set membership |
| Circuit response | `rcCharge` | Resistance slider with analytical RC chart | Independent numeric constants at τ and 5τ, monotonicity and invalid parameters |
| Molecular positions | `parsePdbAtoms` | Supplied PDB ATOM/HETATM coordinates to trusted scene | Fixed-column coordinates, malformed/size/atom budgets. No inferred bonds, structure quality or scientific annotation |
| Sudoku exploration | `sudokuTrace` | MRV placement/backtrack timeline and 9×9 board | Actually solves fixture; validates givens and every final row/column/box; snapshots and budget abort. First solution, uniqueness unassessed |

## Security and lifecycle decisions

The useful commonality is bounded data plus trusted engines. There is no arbitrary expression, shader, HTML, URL, package or script slot. Renderers have no owner identity, application API handles, storage calls, file writes or fetch imports. glTFLoader is intentionally not used: even a valid general glTF file can describe external images/buffers and expand into unexpectedly expensive resources. Our parser first narrows a small GLB geometry subset and only emits admitted numbers and colors for Three primitives/buffer geometry.

GLB max2MB; JSON chunk256KB; 128 meshes; combined24,000 vertices; index and expansion bounds. No URI or extension accepted anywhere in its admitted subset. Every node is a single mesh with bounded translation/positive scale. Scenes do not contain cycles because hierarchy itself is unsupported. Generated primitives have fixed tessellation. Real WebGL allocation remains device-dependent; failure returns the static source, and explicit closure/unmount disposes every geometry/material, renderer, context, resize observer and event listener. The disposable group is normalized to a unit bounding extent before camera fitting; exact source coordinates remain unchanged. This fixes the independent challenge finding that admitted large scales could lie beyond a fixed far plane. Aspect-aware projection retains fit on narrow canvases. The viewer is on demand: no rAF animation loop remains idle in the background.

The SDK adapter uses the existing proposed registry authority callbacks; admission is never an asset or execution permission. Canonical `scene-json` is independently revalidated and compared to the visible payload. A receipt-required claim needs trusted `verifyRun`; source-backed display needs trusted `canRead`. This packet has no D1/R2 schema or permission change. Production integration must pass existing current-rights checks, not replace them with booleans from caller input.

## Measured verification

Run from checkout root:

```sh
node --test tests/foundry-visual*.test.mjs
node docs/capability-foundry/visual/benchmark.mjs
```

23 tests passed on Node24.22.1/Linux x64 at packet close. See `MEASUREMENTS.json` for exact content SHA256 and reproducible synthetic timings. This is real Node execution and Three CPU object construction, not authenticated hosted acceptance or GPU proof. Parent runs whole-repository typecheck/build/test and browser lab acceptance.

Standalone esbuild splitting (external React, minified) measured the Three chunk at about541KB /137KB gzip. This is an isolated prototype bundle measurement; it is not a browser transfer count, full app baseline or idle heap claim. Three is loaded only by explicit 3D activation, and the entire track is lazy under the dev-only gallery. Source timings do not predict a Pixel's frame time.

No production records were created. All state lives in local React component instances or in-memory tests. There are no synthetic persistence cleanup receipts because this packet never wrote persistent records. Unmounting the track discards all local state.

## Primary-source research and alternatives

Retrieved25 October2026:

- [Three disposal manual](https://threejs.org/manual/en/how-to-dispose-of-objects.html): geometries/materials/textures require explicit disposal; removal from a scene does not release GPU resources. Used no textures in this subset.
- [Three GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html): Context7 `/mrdoob/three.js` returned actual upstream parse/dispose/animation-loop APIs. A general loader was rejected in favor of a smaller parser, preserving zero resource URL surfaces.
- [Khronos glTF2 specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html): GLB headers/chunks, accessor/buffer layouts; this implementation documents an intentionally narrower accepted subset, not glTF conformance.
- [Official Pygbag](https://github.com/pygame-web/pygbag): browser/WASM packaging and async-aware loop, runtime/CDN options, local build tooling. A browser packager does not supply Minamo's required owner isolation/CPU termination.
- [Sandpack bundler](https://sandpack.codesandbox.io/docs/advanced-usage/bundlers): external subdomain bundler and dependency CDN; no claim that its published performance numbers are ours. Not installed or activated because its execution/network/host policies are outside this packet.
- [MDN iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe): nested context/sandbox/permissions; a frame restriction is not a demonstrated CPU/time/resource governor. Arbitrary imported React/Pygbag has no safe in-app runner here.

Dependency: exact `three@0.186.1`, MIT, LICENSE SHA256 recorded; `@types/three@0.186.0` is compile-time only. No original fonts, models, dictionary, image, audio or texture assets redistributed. The synthetic GLB and game/graph/math fixtures are original code data.

## Deferred or rejected

| Idea | Decision |
|---|---|
| Arbitrary Pygbag/Pygame app in private origin | RESEARCHED, deferred. No in-app runner built. Keep local packaging and safe supplied screenshots/recordings/source until separate-origin execution and termination are proven |
| Sandpack/React live runner | RESEARCHED, deferred. No dependency or provider added. External origin/CDN and CPU/network behavior require separate engineering, not a flag flip |
| Full textured/compressed/skinned glTF | Reject for current subset. Needs codec/image/extension/resource budget and lifecycle work, not silent acceptance |
| Arbitrary GLSL/WebGPU shaders | Deferred. Trusted fixed shaders only from Three material engine; untrusted shader/runtime cannot be justified from a pretty demo |
| General Graphviz/Mermaid HTML/SVG import | Not implemented. Existing Minamo safe native diagrams remain preferred; graph snapshots are typed numbers/labels rendered by trusted JSX |
| Physics scientific claims from visual plausibility | Rejected. The supplied numerical methods are documented approximations and independent numeric oracles test only defined behavior |

## Activation order

1. Reuse `graphTrace`, maze/automaton/Sudoku as trusted locally stepped adapters; they need no package/runtime authority.
2. Activate one `scene/geometry-v1` adapter at an existing artefact surface behind default-off flag, passing current source/Run authority and lifecycle.
3. Add controlled file-to-GLB subset admission through existing asset rights (separate small task); never pass source URLs into a loader.
4. Consider PDB coordinate display only after explicit current source rights and unit/element clarity; do not imply protein interpretation.
5. Keep arbitrary external code runners deferred to a high-capability security engineering commission.

See activation/F05,F06,F07,F13,F14,F15,F16,F21,F23.md for bounded follow-ups. Full production admission, canonical record changes, private media staging and physical-device/screen-reader acceptance remain release work. No merge/deploy is authorised.
