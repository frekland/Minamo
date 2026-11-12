# Minamo V2 — Capability Foundry (research bank)

> **Owner scope expansion (25 October 2026):** Read [SCALE-UP-EXECUTION.md](SCALE-UP-EXECUTION.md) before proceeding. It overrides conservative caps in the original plan: execute many high-value independent work packets, use subagents, deliver real verified code/prototypes across languages, maths, graphics, games and scientific tools, then keep going. No merge/deploy or genuine learner-data mutation is authorised.

**Status:** Executed dormant engineering bank,25October2026. See [RESULTS.md](RESULTS.md), [BANK-RECEIPT.md](BANK-RECEIPT.md), [draft PR39](https://github.com/frekland/minamo-v2/pull/39) and [ACTIVATION-QUEUE.md](ACTIVATION-QUEUE.md). No production merge/deploy, genuine learner change or permission change. The original proposal/matrix below is retained as research context; exact implemented contracts are in `lib/foundry` and the receipt/source manifest, rather than the early sketches.

## Thesis

Use high-effort engineering now to make later low-effort activation of reusable capabilities viable. Minamo is a learning system, not a collection of unrelated toys: capabilities must preserve canonical reading, real learner reasoning, owner permissions, exact history, reproducible experiments, and provenance. A code artefact can be studied without having been executed by Minamo.

**Prefer:** one extensible evidence/presentation contract + independently activatable, feature-flagged adapters + real working fixtures + small integration instructions. **Avoid:** premature new record families, monolithic editor rewrites, executing arbitrary foreign JavaScript inside the private workspace, auto-generating fake learning evidence, huge default bundles, unexamined CDN/network requirements, AI/vectorization service dependencies.

## Baseline verified in source

At GitHub main after merged PR #37 (merge c40ebcc9; owner-private release described as V27 in PR receipt):

- React 19 / TypeScript / Vinext on Cloudflare Workers, D1 owner data and R2 private media, typed MCP adapters sharing the server domain (docs/IMPLEMENTED-ARCHITECTURE.md).
- Immutable rendition identities, current-eligibility read gates, UTF-16 exact quotation/Flag/Annotation anchoring, revision-guarded writes, recovery and protected media.
- Markdown manuscript/compiler + rich Notes/ProseMirror with terminal and image embedding; deliberately limited block schema. Current PassagePart has no native math/ruby kind.
- CodeMirror editor with browser Pyodide 0.28.3, sql.js, regex, Unicode and **finite** Web HTML/CSS engine (docs/TOOLS-RUNTIME.md); existing Python run outputs are strings only.
- The existing script scripts/prepare-tool-assets.mjs copies Pyodide core/stdlib/lock and SQLite files, **not third-party science wheels**. The sandbox controller denies network and terminates runs at 20s. Python plotting needs a separate offline package manifest, loading logic, memory measurement, and typed results.
- Docs and source were inspected; this PR does not assert installed-device, authenticated browser, synthetic-record or real-world learner acceptance.

## Prioritised bank (hypotheses; weights are provisional)

Scores: Educational breadth E, reuse across projects R, future low-effort activation L and confidence of offline-compatible implementation O: 1 low to 5 high. Higher aggregate indicates **worth investigating**, not a verified return or implementation estimate. Risk requires independent assessment.

| ID | Candidate | E | R | L | O | Priority / dependency |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| F00 | Versioned artefact/renderer registry and real fixture harness | 5 | 5 | 5 | 4 | P0, prerequisite |
| F01 | Japanese ruby/furigana plus general language annotations | 5 | 5 | 5 | 5 | P0, reading spans |
| F02 | Proper math rendering, authoring and accessibility | 5 | 5 | 5 | 5 | P0, reading/math blocks |
| F03 | Python multi-output protocol + offline plots/images | 5 | 5 | 4 | 3 | P0, safe runtime evolution |
| F04 | Structured interactive charts from bounded data | 5 | 5 | 5 | 4 | P1, F00 |
| F05 | Geometry, graphs and algorithm-state stepping | 5 | 4 | 4 | 4 | P1, F00/F02 |
| F06 | Typed preview host for small 2D games and graphics | 5 | 4 | 3 | 3 | P1, F00 sandbox |
| F07 | Three.js/glTF viewer and declarative 3D scenes | 4 | 4 | 5 | 4 | P1, F00 safety |
| F08 | CLI/test/effect timeline and externally reported Run traces | 5 | 5 | 5 | 5 | P1, evidence semantics |
| F09 | Language audio playback, segment replay and supplied transcripts | 4 | 5 | 5 | 3 | P1, source rights |
| F10 | Scientific table/data-file exploration | 5 | 5 | 4 | 4 | P1, F00/media limits |
| F11 | Jupyter/IPYNB read-only viewer/import mapping | 4 | 4 | 4 | 4 | P2, F00/F03 |
| F12 | SymPy symbolic result display + explicit computation provenance | 4 | 4 | 4 | 3 | P2, F02/F03 |
| F13 | 3D molecular/biological visualisations | 4 | 3 | 3 | 3 | P2, F07 |
| F14 | Network/protocol traces and timeline viewers | 4 | 4 | 4 | 4 | P2, F05/F08 |
| F15 | Browser packaged Pygame/Pygbag game previews | 4 | 3 | 2 | 2 | P2 high risk, F06 |
| F16 | Sandboxed React/JS project preview with built assets | 5 | 4 | 2 | 2 | P2 high risk, F06 |
| F17 | Auto-suggested readings/glosses and optional lexicon | 4 | 5 | 3 | 3 | P2, F01; uncertainty |
| F18 | Language retrieval practice/review scheduling | 4 | 3 | 3 | 5 | P2; learning scope, opt-in |
| F19 | Audio waveform, spectrogram, pitch and MIDI educational views | 4 | 4 | 3 | 3 | P2, F00/F09 |
| F20 | Chemistry equations/unit-aware scientific figures | 4 | 4 | 4 | 3 | P2, F02 |
| F21 | Safe imported static diagrams (Graphviz/Mermaid) | 4 | 4 | 4 | 4 | P2, existing diagrams |
| F22 | Bilingual parallel reading, vertical text and script-aware glosses | 5 | 4 | 4 | 3 | P1/P2, F01 |
| F23 | Reproducible self-contained packaged JS canvas simulations | 5 | 4 | 3 | 3 | P2, F06 |

**First investment portfolio:** F00, F01, F02, F03; then F04/F05/F07/F08 and F09. Do not attempt every module simultaneously before stable semantics, test harness and isolated prototypes exist.

## What to bank today

1. **Research briefs with evidence and rejected alternatives**: compatibility of candidate dependencies, licence/SBOM, footprint, privacy, versions, source hashes, offline fetching, cross-browser behavior and unsupported environments.
2. **Real runnable representative fixtures** for Japanese passages, accessible formulae, Python SVG/PNG/CSV, analytical chart, bounded 2D game, validated glTF scene, multi-language CLI trace and high-volume samples. Never pass example output as observed execution unless run.
3. **A versioned integration contract** (see ARCHITECTURE.md), including rendering, data access, permissions, lifecycle, fallbacks, recovery, canonical source and observed/supplied/illustrative semantics.
4. **Independent research/prototype tracks** sharing this contract. At least two independent engineering/security/accessibility challenges must be evidenced. Record uncertainty and abandoned approaches.
5. **An activation package per feature** small enough for a lower-capability model to finish: precise touched paths and exported functions, feature flag, dependency lock, sample payload, tests, known traps, rollback and a bounded task prompt.
6. **Actual quality gates**, not just code: desktop/390px Android emulation, performance/heap, keyboard/screenreader checks where available, conservative claims for physical hardware and fresh installed MCP.

## Deliverables in this PR

- [ARCHITECTURE.md](ARCHITECTURE.md): contracts, threats, exact-text integrity, staged integration.
- [LANGUAGE-MATH.md](LANGUAGE-MATH.md): detailed multilingual ruby and mathematical content programme.
- [EXPERIMENTS.md](EXPERIMENTS.md): experiment matrix and activation-package template.
- [WORK-COMMISSION.md](WORK-COMMISSION.md): long-form autonomous implementation/research commission for ChatGPT Work.
- [Source notes](SOURCES.md): verified official documentation and contested feasibility details.
- A no-dependency HTML typography fixture under examples/capability-foundry/: a **standalone illustrative fixture**, not Minamo integration or authenticated browser evidence.

## Decision boundary

**This PR is research-only.** No core app implementation, merge, production Site save, deployment or learner-data mutation is authorised by merely accepting this document. A later Work commission can add verified prototypes/latent adapters to its branch, with an owner-review checkpoint before main or production. No automatic switch-on just because the code is dormant.

## Principles worth protecting

- A successful feature must **reduce** learning friction; existing Journeys/Investigations/Notes must remain the organising structure.
- Source-code claims, execution receipts, imported outputs, author interpretations and formal checkpoints are separate.
- Baseline still useful without new renderers: plain text or immutable legacy reading must remain legible.
- The browser may not get elevated filesystem, owner credentials, unsafe arbitrary script or unbounded compute to display an artefact.
- Complexity is paid once in research/prototype; later tasks need precise limited surfaces rather than a second architecture discussion.
