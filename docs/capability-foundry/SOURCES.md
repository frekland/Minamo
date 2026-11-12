# Source notes and evidence ledger — 2026-10-25

Purpose: record **verifiable primary sources** for an engineering research bank, not assert that dependencies have been installed or benchmarked in Minamo. Public documentation can advance; freeze exact versions, SBOM, hashes and licenses during each later implementation study.

## Existing Minamo verified code (private repository)

- https://github.com/frekland/minamo-v2/pull/37 — merged 2026-10-25, receipt claims owner-private production V27; notes/terminal/continuity release. GitHub main inspected after merge.
- docs/IMPLEMENTED-ARCHITECTURE.md, docs/TOOLS-RUNTIME.md and docs/SECURITY-BOUNDARIES.md — Vinext/React/Cloudflare, owner and generation isolation, exact reading and browser tool limitations.
- lib/contracts.ts — versioned reading families, PassagePart (no ruby/math fields), canonicalReadingParts, current tool capabilities, typed command/MCP.
- lib/manuscript.ts — GFM/remark AST compiler with intentionally restricted structured parts; unsupported inline syntax preserved and warned.
- lib/note-rich-codec.ts, lib/note-content.ts, app/note-markdown-view.tsx — ProseMirror/markdown Notes, exact terminal capture, code/source edit fallback.
- public/tools/python-isolate.js, lib/tool-runtime.ts, scripts/prepare-tool-assets.mjs — network-denied trusted stdlib Pyodide, isolated Worker, finite Web runtime and text output. Third-party wheel package hosting has not been implemented.
- Existing three-mode workspace and explicit revision/capture/recovery rights must be reused.

## Japanese / multilingual

1. W3C introduction: https://www.w3.org/International/questions/qa-ruby.en.html — ruby/furigana used primarily as small pronunciation annotation alongside Japanese base text.
2. WHATWG: https://html.spec.whatwg.org/dev/text-level-semantics.html — ruby and rt semantic structure.
3. MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby , https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rt — widely available native ruby and annotation markup.
4. W3C Japanese Layout Requirements: https://www.w3.org/TR/jlreq/ — East Asian typographic requirements, word/compound, layout and orientation; actual browser consistency still to measure.
5. Kuroshiro: https://github.com/hexenq/kuroshiro — furigana/okurigana and hiragana/romaji conversion; docs show multiple analyzers and note limits of direct kana-to-romaji conversion. Library MIT (verify the exact release).
6. Kuromoji.js: https://github.com/takuyaa/kuromoji.js — browser-oriented morphological tokenizer with gzipped dictionary files; parent package Apache-2.0, but exact dictionary assets/seed data license and redistribution need separate audit. Do **not** blindly copy external dictionaries to product.
7. Unicode UAX #29: https://www.unicode.org/reports/tr29/ — grapheme/word segment boundaries; app canonical quote offsets are UTF-16, not code-point/grapheme indices.
8. Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/lang — BCP 47 language selection (e.g. ja-JP), availability/voice/accent depends on device/browser. Speech recognition has more limited support and is explicitly a future research candidate, not a verified grading system.

## Mathematical writing / computation

1. KaTeX: https://katex.org/docs/options and https://katex.org/docs/security — trust false, bounded maxExpand/maxSize, htmlAndMathml, strict error treatment, security considerations. Do not turn trust on for arbitrary external sources.
2. MathJax v4: https://docs.mathjax.org/en/v4.1/basic/accessibility.html and https://docs.mathjax.org/en/v4.1/options/accessibility.html — accessibility, speech/Braille, explorer behavior changed from v3; verify exact configured components.
3. MathLive: https://mathlive.io/mathfield/guides/react/ and https://mathlive.io/mathfield/guides/virtual-keyboard/ — editable mathfield, React integration and virtual keyboard; not a replacement for canonical data/Note authority.
4. Native MathML: https://developer.mozilla.org/en-US/docs/Web/MathML — browsers have MathML Core support; fine-grained accessibility, formatting and editing still require current browser tests.
5. JSXGraph: https://jsxgraph.org/docs/ — interactive geometry and graph/function plotting, no general arbitrary-expression runtime admission implied.

## Browser computation and visual tools

1. Pyodide pinned version for this app: https://pyodide.org/en/0.28.3/usage/packages-in-pyodide.html — official 0.28.3 package list includes NumPy, Matplotlib, pandas, SymPy and others. This means **available to be loaded with appropriate assets**, not automatically bundled in Minamo.
2. Pyodide package loading: https://pyodide.org/en/0.28.3/usage/loading-packages.html — identify exact package and dependency loading from official versioned distribution, design pinned local asset copies. Current Minamo sandbox denies network.
3. Web Workers/OffscreenCanvas: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas — worker-side drawing where applicable, but feature compatibility must be measured.
4. Three.js: https://threejs.org/docs/pages/OrbitControls.html and https://threejs.org/docs/pages/GLTFLoader.html — camera control/glTF handling; documentation explicitly notes bitmap/resource disposal.
5. Cytoscape.js: https://js.cytoscape.org/index.html — browser graph and network visualisation, core MIT; test diagrams for graph-data integrity.
6. Observable Plot: https://observablehq.com/framework/lib/plot — concise charts from tabular data; do not infer all chart types are accessible by default.
7. Pygbag: https://github.com/pygame-web/pygbag — browser game packaging; test specific versions and modern browser/mobile. Real larger-game compatibility has open reported failures; cannot promise all desktop Pygame projects work.
8. Cross-origin isolation: https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated — COOP/COEP/Permissions-Policy can enable shared memory but affect iframes and resource policy; **not** silently enabled for Minamo owner-private Site.
9. Web Speech API support: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/lang — synthetic speech is not correctness-certified or evidence of spoken proficiency.

## Open research / deliberately unverified

- Exact locked dependency versions and licenses for proposed KaTeX/MathJax/MathLive/Three.js and all assets (not installed here).
- Kuroshiro v2/analyzer maturity, Japanese dictionary corpus licences/size and production accuracy by language expert; machine-generated readings do not merit source-of-truth status.
- 390px actual device layout, physical Android/TalkBack, Windows/NVDA, offline TTS voices, fallbacks and fonts.
- Worker/WASM heap/time/asset costs for cold/warm plotting, SymPy, WebGL, SVG maths and interactive canvases under actual private Site CSP.
- Feasibility of safely previewing arbitrary bundled Pygbag/React projects inside a private owner Site, including CPU termination and network restrictions.
- Real accessibility comparison of KaTeX, MathJax and native MathML under the actual user journey.
- Licensing/redistribution of imported textbook corpus, sounds, dictionary files, scientific data and fonts; rights must be checked case by case.
- Learner benefit: no controlled evidence of improvement merely from a successful visual/interactive prototype.

Each experiment should append a **dated verification result** with precise dependency/environment and no source claim upgraded from possibility to fact without evidence.

## Executed-work additions

Current exact source/primary-source ledgers also live under language/RESULTS.md, math/ENGINE-COMPARISON.json, python/SCIENCE-SBOM.json, data-audio/RESULTS.md, visual/README.md and review/OPPORTUNITIES.md. Those distinguish actual code/runtime results from documentation claims.

- https://github.com/pyodide/pyodide/blob/main/src/js/pyodide.ts and https://github.com/pyodide/pyodide/blob/main/docs/usage/working-with-bundlers.md — Context7 primary source confirms browser packageBaseUrl is separate from Node-only packageCacheDir. Exact pinned0.28.3 browser test supplied decisive compatibility evidence.
- https://github.com/paulmillr/noble-hashes — official implementation/API read through Firecrawl; pinned2.4.0 MIT sha2 module provides identical SHA256 for HTTP-only local previews, with independent native vectors. No skipped integrity check.
- Official GitHub advisory pages for all8 baseline findings are linked and freshly verified in review/DEPENDENCY-ADVISORIES.md; raw pnpm audit retained. No known-vulnerability count suppressed.
- performance/BUILD-COMPARISON.json contains actual baseline/current build manifests/source hashes; browser screenshots and textual receipts are under browser/. Physical/hosted acceptance remains distinct.
