# Capability Foundry — proposed architecture and invariants

**Research contract, not implementation approval.** Grounding: lib/contracts.ts, lib/domain.ts, lib/reading-inline.ts, lib/manuscript.ts, app/reader.tsx, lib/note-rich-codec.ts, app/note-markdown-view.tsx, lib/tool-runtime.ts, public/tools/python-isolate.js, docs/SECURITY-BOUNDARIES.md, docs/TOOLS-RUNTIME.md and PR #37 merged main on 2026-10-25.

## Why a renderer registry, not twelve new tools

Existing Minamo already distinguishes current/immutable reading, Note prose, media bytes, Experiments, executed Runs, authentic checkpoints and supplied evidence. Preserve that schema and create **adapters** for presentation, not an alternate app. Keep initial renderer registry purely client-side, lazily loaded, without a second durable queue. Extend existing records only where there is a justified validated semantic addition, using current guarded domain/MCP authoring.

### Proposed envelope for research/prototype

The following is a candidate **versioned internal interface**; it does not exist in current contracts and must be proved before admission:

~~~json
{
  "contract": "minamo.capability.v1",
  "kind": "math/tex",
  "canonical": {
    "format": "tex",
    "source": "\\frac{1}{2}",
    "encoding": "utf-8"
  },
  "display": {
    "renderer": "math-typeset",
    "options": {"displayMode": true}
  },
  "provenance": {
    "classification": "authored-content",
    "execution": "not-executed-by-minamo"
  }
}
~~~

Other proposed kind identifiers: text/ruby-spans, python/output-bundle, data/tabular, chart/spec-v1, graph/spec-v1, scene3d/declarative-v1, scene3d/glb, trace/timeline-v1, audio/segment-v1, external/build-preview-v1. **Do not** store loose type labels or arbitrary script/XML/HTML as a render instruction. Kind/version must have exact bounded schema, strict unknown-field handling or explicit forward compatibility, and an offline/no-JS fallback.

Render registration is an internal feature, not a security decision. Server admission independently validates the whole payload, owner/asset rights and immutable rendition; permitted execution is a separate capability. Renderer metadata never authorises external fetches or owner reads.

### Suggested adapter interface

~~~ts
type CandidateRenderer = {
  kind: string;
  contractVersion: 1;
  canDisplay: (admitted: unknown) => boolean;
  load: () => Promise<unknown>; // private trusted built module, only on deliberate use
  fallback: (admitted: unknown) => string; // safe, meaningful static text
  dispose?: () => void; // release GPU/worker/observers/URLs
  tests: string[]; // actual conformance fixtures
};
~~~

This is a sketch to stress-test against the implemented architecture. It is not a licence to copy it into production unchanged. An adapter may not construct arbitrary URL fetches, ingest private record IDs, mutate D1, keep a private automatic save queue, or treat rendering as execution.

## Two fundamentally different content types

### I. Authored reading extensions (F01/F02)

Japanese reading and maths affect the **canonical Reader and writing contract**. Treat ruby as inline annotation metadata on a base text, not an alternate text node that changes selection. Treat equation display as a *whole-equation semantic part with exact immutable source* unless a proven selection mapping exists. Reader, Home/search, excerpts, Flags, Annotations, source revision history, Notes/source editor, Workspaces in Classic/Focus/Task and MCP must agree on one canonical source.

- Ruby base text is the authoritative canonical UTF-16 string. Reading/meaning/pinyin/mora metadata are attached to validated base-text ranges. Display/read hide toggles do not change stored source or create learning activity. Search by reading can be indexed separately but label a match as reading metadata.
- All range boundaries are valid UTF-16 surrogate boundaries; no silent NFC/NFKC conversion or inferred moving anchors. Where tokenizer/grapheme boundaries add value they are **additional** validation, not a replacement for current exact offsets.
- Render ruby with native ruby/rt/rp semantics, retained base text as ordinary DOM text, accessible controls outside quotation mapping, no generated HTML. Japanese ruby segmentation may be word/compound-level rather than one kanji at a time.
- One user-corrected reading must be retained exactly in the authored revision. Machine proposed readings carry source/uncertainty and are not silently promoted.
- Maths source is literal LaTeX or admitted MathML with explicit serializer rules, bounded parser limits and trusted rendering disabled. Visible formula and accessible representation are independent from parser input. Search can match original source with an honest source label, not claim semantic equation search.
- Inline maths and display blocks are different; mixed prose/code fences must not be erroneously transformed. Respect currency ($5), shell variables, source backslashes and old Markdown.
- A captured selection spanning ruby/punctuation must still produce the **base characters** exactly. For formulae, use explicit full-expression capture/copy-as-TeX until a robust partial mapping exists; do not fabricate quote offsets from rendered DOM.

### II. Executed or supplied computational artefacts (F03 onward)

Execution occurs only after a deliberate Run in the isolated engine, never by preview, scrolling, opening a saved Run or importing an artefact. Source and output snapshots remain immutable; parsed display objects are untrusted observations. Imported screenshots/results are **supplied artefacts**, never Minamo-observed computations.

Proposed result manifest:

~~~json
{
  "contract": "minamo.run-outputs.v1",
  "inputDigest": "<sha256 of exact captured input>",
  "runtime": {"engine": "python", "version": "Pyodide 0.28.3"},
  "status": "completed",
  "outputs": [
    {"kind": "text/plain", "inline": "4\n"},
    {"kind": "image/png", "assetRef": "<private validated asset>", "alt": "Plot of x squared"}
  ],
  "provenance": {
    "origin": "browser-observed",
    "observedAt": "<server or recorded timestamp>",
    "executionReceipt": "<actual saved Run identity>"
  }
}
~~~

Again this is conceptual: the current Run output is a string and the current private image stage+attach workflow is bound to owned records. Do not imply that generating PNG bytes in an iframe grants the asset store permission to accept them. Implement size/MIME/pixel limits, owner-aware staging, atomic saving, uncertain-operation recovery, revocation and complete encrypted backups through existing authorities. Avoid client-controlled “observed” classification without a verified execution receipt. A reported external run is a supplied artefact, even if correct.

## Isolated execution, not just iframe decoration

Current Python uses an opaque-origin sandboxed iframe with dedicated Worker, restrictive CSP, source-checked message token, finite runtime watchdog and no network. The original finite Web mode prohibits arbitrary JS. Never weaken this to display a React project or Three.js scene.

A possible separate *trusted declarative scene renderer* can run locally with validated numeric/material/geometry inputs and explicit renderer source. By contrast, arbitrary imported HTML/JavaScript, Pygbag builds and React bundles are executable code: they require a separate isolatable preview origin or a demonstrably terminable execution host, strict per-origin credentials, no owner API access, no external fetches, bounded GPU/CPU/memory, honest browser/device support and user activation. If isolation cannot be proven on Sites/Workers, bank as **external/local preview handoff**, not a false safe in-app execution engine.

Cross-origin isolation/COOP/COEP is not just a switch; it affects frames/resources and must be tested against owner-private Site authentication. Do not set shared headers globally based on assumptions or enable SharedArrayBuffer accidentally.

## Pyodide scientific package bootstrapping

Current source script copies pyodide.js, pyodide.asm.js, pyodide.asm.wasm, python_stdlib.zip, pyodide-lock.json into trusted local runtime; only those trusted paths are fetched. Official 0.28.3 package index lists numpy/pandas/matplotlib/sympy, but importing them immediately is **not** possible under this default resource policy.

Research an offline wheel+dependency resolver and pinned, hashed asset manifest generated at build time. A trusted controller maps only predefined package filenames to local ArrayBuffers, never caller URLs, and loads only an explicit allowlist. Measure first-load MB, cold/warm latency, peak memory and Android browser crashes before a release decision. Cap captured image/figure count and bytes; close figures and revoke object URLs on disposal. A genuine plot test must execute code and compare output signature/image dimensions, not just see expected markup.

Source standard output/exception, figures, tabular data and warning streams should be separately typed and bounded. Failed or interrupted runs must not leak a stale earlier figure or report success. Every output attaches to the exact immutable captured input and its code/results provenance.

## Core compatibility and security gates

1. **Exact reading:** Article/Area/Journey/Investigation/Note original plain text and immutable rendition/capture equality remain unchanged; mixed CJK, emoji, combining marks and vertical ruby tested.
2. **Revisioned writing:** Guarded expected revision + operation identity + uncertain receipt replay; no edits on initial load, browser render, view switch or Note reopen.
3. **Private rights:** Same owner and generation fence, per-asset admission/revocation, retentions, Trash and recovery; rendering/thumbnail/toggle never bypasses rights or regrant revoked data.
4. **MCP admission:** Existing typed catalogue compatibility; each new shape has accurate server descriptions, targeted updates, validation errors, no unknown/invalid shape cliff; refresh installed clients only after owner-approved release.
5. **Input threats:** injection/XSS in LaTeX, ruby readings, SVG/GLB metadata, CSV injection in exports, Markdown fences, oversized nested data, compressed archives, package/wheel supply chain, path escapes, copy and selection changes.
6. **Output threats:** malicious high-CPU loops, GPU resource exhaustion, unbounded animation, giant plots, renderer network access, external URLs, phishing within preview, generated content falsely elevated to evidence.
7. **UI/accessibility:** Progressive enhancement, laptop and 390px Android layouts, reduced motion, keyboard/focus, screen reader/MathML, ruby toggles, zoom, high contrast, slow devices, Android voice availability.
8. **Perf:** baseline current bundle/idle memory first; one dormant module has near-zero cost until opened; lazy import and disposal verified. Keep tabs/Notes and all three workspace modes alive as currently intended.
9. **Reproducibility:** No transient CDN import at runtime. Pin runtime/dependencies/fonts/assets/NOTICE and source hashes, test lockfile and security advisories. No font redistribution without compatible licensing.
10. **Failure semantics:** unsupported device => accessible static fallback; invalid data => exact source retained, actionable warning; canceled compute => terminated/explicit status, no automatic retry.

## Recommended engineering sequence

**A — Research lab**: Map actual entrypoints; record baseline; isolate candidate renderers in disposable local routes; build exhaustive read-only fixtures and threat tests; compare alternatives, record negative results.

**B — Canonical-content prototypes**: Proof of native ruby spans, real maths, Note rich/source round-trip, matched search, Flag and Annotation on base text; retrieve via typed MCP in local synthetic D1. No production record touched.

**C — Results/runtimes prototypes**: F00 envelope and media limits; Pyodide offline wheels with real NumPy/Matplotlib PNG/SVG and SymPy; chart; GLB; trace; mobile watchdog/memory. Report actual executions separately from unrun cases.

**D — Independent challenge**: Security, a11y, pedagogical and data-integrity reviews with fixes; fresh producer/consumer mental-model and API checks. Cross-device tests with actual viewport/browser; physical Pixel acceptance owner-only.

**E — Bank**: Each module gets sample, frozen schema, tests, exact changed paths, release toggle, rollback, known conflicts and Light-model handoff. Never merge/release based only on lab work.

## Non-goals of the first wave

- Full-fledged Jupyter notebook backend/kernel, remote compiler farm or service-owned execution of imported code.
- GPU generative media, arbitrary embedded third-party websites, automatic internet/package access.
- Invisible tracking/review schedules, scores, inferred learner mastery, automatic checkpoints.
- Auto-filled Japanese furigana without editable provenance; pronunciation or speech grading without real evidence.
- Replacing all Notes with longform documents, rewriting existing learner records, or polluting Home with synthetic Runs.
