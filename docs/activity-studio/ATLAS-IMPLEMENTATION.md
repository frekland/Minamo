# Learning Atlas implementation and local evidence

This is dormant engineering for PR40. It is not a deployed feature, an installed MCP acceptance receipt or a physical-device result. Root integration owns final source/commit identities and full-suite results.

## Implemented contract

`lib/atlas/service.ts` exports `atlasQuerySchema` and `getLearningGraph(env, scopedOwner, input)`. The authenticated handler supplies the current generation namespace; caller-supplied owner/authority/generation fields reject. The default query excludes synthetic records. Four lenses share one read-only `minamo.learning-graph.v1` projection:

| Lens | Presentation and authoritative basis |
|---|---|
| Journey route | Deterministic columns, authored Journey stages and exact saved links; no completion inferred |
| Knowledge constellation | Kind clusters and current Article catalogue concepts with exact section/part/rendition destinations |
| Evidence river | Chronological reference cards, existing current-rights Learning Developments and optional map; dates establish sequence only |
| Project galaxy | Project-centric clusters including typed Activity and Attempt companions on existing experiment/run records |

SQL selects bounded identities from the existing owner-scoped `v2_records`, including bidirectional saved links around an exact focus. Every returned record is re-read through the current domain permission projection. No full corpus is loaded into a browser or alternate graph database. One page admits at most 60 selected records plus its focus, 120 display nodes and 240 edges. Node identities and layout remain deterministic; no force simulation or random placement runs.

The cursor binds owner namespace, generation, namespace mutation version, focus, lens, page size, synthetic filter and proposals. Changed state returns `graph_changed`; no stale page is appended or silently re-scoped. The UI clears previous graph projections during fresh reads and failures, aborts superseded requests, rejects stale generation responses, and revalidates on focus, visibility and every 30 seconds while visible. No graph text is persisted in browser storage.

Saved link destinations are independently checked against their exact retained rendition and current source rights before projection. Missing target/part or revoked/trashed Source has no guessed replacement. Independent Notes survive unavailable origins. Graph nodes contain titles and identities, not copied body/excerpt/output payloads. Every edge retains its actual saved reason, basis, source revision and exact destination. A default missing reason is labelled explicitly as an unelaborated saved relation.

Optional typed GPT proposals require 1–4 current owned revision-matched evidence references. Their edges are `accepted:false`, `basis:gpt-proposal`, visually dashed and labelled unaccepted. The UI can dismiss one in the current view. These operations write no relation or progress. Admitting a durable relationship remains the existing deliberate revision-guarded authoring operation; a freeform arrow cannot perform it.

## UI and optional canvas

`app/learning-atlas.tsx` defaults to a mounted, generation-scoped `LearningAtlas({scope,focus?,endpoint?,initialLens?})`. The root Workspace lazy-loads it behind the server flag. It uses actual `@xyflow/react` 12.12.0. `AtlasView` is the controlled presentation adapter for synthetic fixtures. A source preview panel explains each selected node and its saved relationships. Exact source anchors remain ordinary canonical links.

The four modes retain equivalent semantic reference cards, native keyboard buttons/links, visible focus indicators, filter controls and a mobile map opt-in. The interactive map is not mounted on initial SSR/mobile, avoiding hidden canvases with zero-width measurement or unnecessary graph work. Reduced motion disables the refresh animation. The phone layout uses a readable single-column reference stack; CSS emulation is not physical Android acceptance.

`app/learning-atlas-canvas.tsx` is a lightweight development/all-synthetic gate. It lazy-loads `learning-atlas-canvas-sdk.tsx`, an actual tldraw 5.5.2 custom record-card `ShapeUtil`. Card props retain only a record identity and dimensions; labels and links resolve from the current graph React context. Revoked cards are removed. The proof allows freehand SDK drawing but has no persistence key, cloud sync or authoritative relation mutation.

`lib/atlas/canvas.ts` validates layout-only snapshots: current generation, at most 120 unique current identities, finite bounded coordinates and dimensions. Titles, excerpts, URLs, arbitrary metadata and nonfinite geometry reject. Reopen revalidates the current graph; missing identities are omitted rather than cached source content restored. The current canvas proof retains snapshots only in component memory; it is not a production durable whiteboard feature.

An actual negative SSR experiment found that importing the full SDK before the gate left the Node test process alive after assertions. Splitting the heavy SDK into a permitted lazy mount fixed this: the two UI tests now exit normally in approximately 0.7 seconds.

## Executed tests

`node --test tests/atlas-projection.test.mjs tests/atlas-ui.test.mjs` covers deterministic lens layouts, exact retained links, no invented causation, revoked/Trash exclusion, strict untrusted query rejection, coordinate/identity-only canvas revalidation, escaped hostile literal titles, accessible SSR fallback and production SDK refusal.

`node --test --test-name-pattern='real synthetic' tests/atlas-domain.test.mjs` passed eight tests/subtests using compiled domain code and real disposable Miniflare D1/R2: bidirectional saved links, no-write projection, foreign-owner denial, synthetic defaults, retained rendition identity, five unaccepted proposals with one omitted/rejected and no history write, stale proposal evidence rejection, an earlier explicit checkpoint kept distinct from a later short Note intention, cursor scoping, namespace mutation conflicts, source revocation and Trash.

The separate scale test inserted **10,000 original synthetic records into real local D1**. The observed first 60-node page took **74 ms** and returned **20,649 serialized bytes**; seeding took 26,717 ms. Two pages returned 120 disjoint node identities. This measures this local container and query, not hosted latency, device GPU/CPU or an entire 10k-node client layout. Source is `tests/atlas-domain.test.mjs`; root final full suite should retain its own fresh measured diagnostic.

The final Atlas-scoped TypeScript check passed. Root owns final build and production-disabled compiled Worker checks. Browser screenshots, focus/keyboard gestures, current private hosting, actual Pixel/TalkBack and installed MCP acceptance must be reported separately with their actual evidence level.

## Technology decisions and primary sources

- React Flow: selected for controlled typed record navigation, accessible focused nodes and deliberate pan/zoom; fixed node dimensions and deterministic layout avoid unneeded ELK/dagre dependencies. Official [accessibility](https://reactflow.dev/learn/advanced-use/accessibility), [SSR configuration](https://reactflow.dev/learn/advanced-use/ssr-ssg-configuration) and [keyboard props](https://reactflow.dev/api-reference/react-flow) were retrieved through Context7.
- tldraw: distinct optional freeform role, not a semantic graph database. Official [licence-key documentation](https://tldraw.dev/sdk-features/license-key), fetched through Firecrawl, requires production host coverage and describes development behavior and telemetry. Installed SDK 5.5.2 `@tldraw/editor/src/lib/license/LicenseManager.ts` confirms development tracking suppression and production evaluation/watermark tracking with SDK version, licence ID/type/SKU and page URL. The older community summary differs; release must assess the **pinned SDK and actual licence type**, not assume hobby telemetry is absent.
- Cytoscape/Foundry graph traces remain algorithm visualizations, not replacements for saved record navigation. Konva would duplicate the current freeform proof without a separate demonstrated need. No global animation or DnD dependency is required for the implemented Atlas.

No key was requested, exposed, committed or production-validated. The optional freeform SDK remains development-only until owner host/licence/privacy/asset acceptance and a deliberate durable layout/recovery feature are implemented and tested. This does not block the semantic Atlas.

## Honest remaining limits

This source implements all four semantic lens presentations and a local optional SDK proof. It does not claim a persisted production freeform canvas, screen-reader/physical-device approval, a global proficiency map, natural-language semantic inference, current hosted acceptance, or installed catalogue refresh. The evidence river reuses the existing Learning Development eligibility projection for at most four current investigation/stage targets and four checkpoints each; this is a bounded window, not a complete reconstruction of all history. Exact Development read metadata and target-rendition links remain inspectable, and Notes never overwrite checkpoint next actions. Release evidence must preserve these distinctions.
