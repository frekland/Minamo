# Capability Foundry — independent challenge

Review date: 25 October 2026. Reviewer is a separate specialist agent from the module authors. Scope is the isolated research branch; no hosted authentication, production learner data, physical device, screen reader or production write was used.

## Architecture findings

| ID | Severity / state | Evidence and required outcome |
| --- | --- | --- |
| C01 | High, integration constraint communicated | `app/reader.tsx` capture compares mapped DOM `textContent` with canonical source and obtains offsets with `Range.toString().length`; retained-highlight restoration also walks all text nodes. Native `rt`/`rp` makes these disagree with original base text even when CSS hides readings. Both capture and restore must use one verified base-only walker; decoration endpoints must reject. A canonical-source-only quotation assertion is insufficient proof of DOM selection. |
| C02 | High, integration constraint communicated | `lib/domain.ts` `validateRichPart` and the part-kind union deliberately reject new keys/kinds. A standalone renderer is not persisted/MCP integration. Prefer default-undefined Reader display hooks plus exact, ephemeral synthetic sidecars until server admission and recovery are deliberately extended. |
| C03 | Medium, integration constraint communicated | `lib/note-rich-codec.ts` compatibility checks document/visible-text equivalence, not literal Markdown source bytes. Typed maths/ruby declarations need their own exact no-op source preservation and explicit fallback, including CRLF, backslashes, fences and legacy dollar/shell prose. |
| C04 | High, open author remediation | Scientific controller's pre-raster figure check uses figure DPI, but `savefig(...dpi=100)` uses a different target. A 100-inch figure at DPI=1 passes the original check then rasterises 10000×10000 before host admission. Validate at actual save DPI before rasterisation, bound total pixels and close figures on every exit. Sent to Python author; final state recorded below. |

## Safe dormant integration boundary

`Reader`/`RichReadingPart` may accept an optional display hook with default undefined, imported only from a developer-only synthetic fixture. A sidecar binds exact family, ID, rendition, section, part and source digest and can decorate **only the already eligible projected part**. It may neither retrieve records nor grant rights. Existing canonical paragraphs remain base text. Maths can use an existing code part containing exact TeX and a nonmapped mathematical view, with a mapped exact-source details block for full-expression capture.

Local D1 tests should store and read ordinary records, revisions, Notes, Flags/Annotations through existing shared domain commands. Sidecars remain lab-only ephemeral metadata; claim `INTEGRATED_DORMANT` for the Reader/Notes display hooks exercised in that fixture, while explicitly marking metadata persistence, manuscript authoring and client MCP catalogue activation as unfinished. Invalid/revoked/unavailable/trashed/stale inputs must hide the sidecar rather than display its retained source fallback. Rights cannot be derived from a hash or client provenance field.

## Review evidence levels

Source audit performed for Reader capture/restoration, `reading-inline`, strict domain part validation, manuscript compiler, Note view/rich codec/content compiler and recovery source/media permission floors. Existing recovery intersects current source/asset rights and permanent revocation floors; new renderers should reuse this authority rather than introducing another durable table or save queue.

Module implementations are arriving concurrently. Each later review entry must identify commands, actual test results and limitations; no passing status is inferred from author reports alone.

## Executed independent challenges — packet 2

- `node --test docs/capability-foundry/review/adversarial-platform.mjs` first reproduced **two failures**: sparse-array prewalk bypass and private fallback restored after revocation during failing lazy load. Root fixed both; reviewer reran the unchanged independent harness and **2/2 pass**. No huge array allocation or actual private source was used.
- `node --test tests/foundry-python.test.mjs tests/foundry-math.test.mjs` **23/23 pass** at this boundary. These are local Node/schema/typesetter tests, not browser Pyodide or assistive-technology evidence.
- Python C04 pre-raster check verified in corrected source: fixed output DPI100 is used to calculate edge/pixel budgets before `savefig`; figures close in `finally`. Result UI labels figures from failed runs as partial. Remaining release limitation: a disposable Worker/iframe and30-second watchdog bound duration but do not impose a hard browser/WASM heap quota. The reported roughly640MB Node RSS is not Android memory acceptance.
- Data reviewer found aggregate-budget bypass through forged direct table objects and sparse-array structures, despite bounded text import. Data author added shared source/aggregate/density admission with regression fixtures. Independent rerun pending final stable track.
- **C05, high mathematical correctness:** independent BigInt cross-product oracle disproves an “exact” rational elimination snapshot for `[[1,"998999999997/999999"],[1,"998999999996/1000000"]]`. Original Number intermediate products rounded during cancellation before the final integer budget check. Actual returned second-row fraction was `-1734376736/1736109375`; exact unreduced result is `-999000999996/999999000000`. Sent to maths author for BigInt-intermediate or pre-operation-safe-integer rejection and regression test. Current state pending author remediation.

## New finite-engine implementations

Root authorised reviewer to implement `lib/foundry/novel.ts`, `app/foundry-novel.tsx` and `tests/foundry-novel.test.mjs`. N01 byte/UTF16/UTF8/base64, N02 supplied unified diff and N05 sRGB/contrast engines are actual implementations, with5/5 local tests passing. They are not independent review of the reviewer's own code: root or another agent must assess them, and browser gallery acceptance remains root-owned. N03/N04/N06 remain researched-only. Activation dossiers are under `activation/N01.md`, `N02.md`, `N05.md`.

## Executed independent challenges — packet 3

- `node --test docs/capability-foundry/review/adversarial-math.mjs` now **1/1 pass** after maths author guards exact arithmetic. It accepts either a mathematically exact BigInt-comparable rational or an explicit bounded exact-arithmetic rejection; it never accepts the prior silently rounded fraction.
- `node --test tests/foundry-data-audio.test.mjs tests/foundry-data-ui.test.mjs tests/foundry-visual.test.mjs tests/foundry-language.test.mjs tests/foundry-novel.test.mjs` **69/69 pass**, including repaired data aggregate/sparse-array admission and visual extreme-coordinate fit. These are actual local deterministic/SSR/Three-object tests; no GPU/browser coverage is implied by them.
- **C06, medium visual correctness, fixed:** admitted large scene bounds could place camera/object beyond fixed far plane. Visual author normalised only the disposable render group, retained source coordinates and tested extreme vertices/scales against real Three objects. The independent suite above passes the new regression.
- Python asset fetch uses `credentials:'omit'` unlike existing same-origin runtime loader. Owner-private hosted asset dispatch compatibility remains unverified. Transfer authenticated-fetched bytes into the opaque frame rather than giving credentials to the runtime if release integration needs correction.
- **C07, medium provenance UI, remediation requested:** scientific result data retains exact `capturedCode`, but demo originally displayed only mutable editor code and output/hash. Selecting a new example during/after a run could visually pair output with a different source. Root requested to show a separate immutable captured-source view and disable sample switching during execution.
- Reader hook is default undefined and imported only by developer-only lab. It rejects unavailable/trashed/source-excerpt paths before calling display adapters. Exact synthetic fixture identity/text match is appropriate for dormant integration, not a general persistent metadata format. The bridge's mode selector initially changed only a data attribute; it is **not** actual Classic/Focus/Task Workspace acceptance and should be labelled accordingly.

## Final independent finding disposition

| Finding | Final disposition |
| --- | --- |
| C01 ruby base/capture mapping | Dormant bridge places canonical `data-reading-part` ranges only on base-character spans; `rt`/`rp` stay outside those mapped spans. Standalone language DOM mapper handles base-only copy/selection. Root reports actual browser DOM probes; this review independently audited the source and exercised domain exact-capture tests. |
| C02 strict persisted schema | Preserved. Display hooks and lab source Notes reuse existing record authority; no new canonical part/MCP type is falsely claimed. Persistent annotation metadata authoring remains a later integration task. |
| C03 Note source equivalence | Original Markdown remains authoritative; typed declarations retain exact source. Ordinary Note visible projection remains LF-normalised by its existing versioned codec, and must not be described as raw Markdown byte offsets. |
| C04 Python raster allocation | Fixed at target DPI before rasterisation; final figure close retained. |
| C05 rational trace rounding | Fixed with BigInt intermediate reduction and bounded final fractions; independent oracle passes. |
| C06 large scene camera clipping | Fixed through disposable normalised render group; independent real-Three extreme-fit regression passes. |
| C07 mutable editor/result provenance | Fixed: immutable captured source is shown separately, source-change warning retained, sample selector disabled during execution. |
| C08 final empty CSV record | Found by independent seeded probes; fixed by explicitly quoting empty export fields. Minimal CSV/TSV test added and unchanged reviewer corpus passes. |
| Platform private fallback on rejected load after revocation | Fixed and independently repro-tested2/2 with sparse-array admission. |
| Direct table aggregate/sparse structures | Fixed in shared table admission and independent cross-track tests. |
| Private science asset requests | Same-origin authenticated fetch restored in trusted host; only bytes cross opaque boundary. Hosted authenticated acceptance still unrun. |

Final executed reviewer commands:

```sh
node --test docs/capability-foundry/review/property-probes.mjs docs/capability-foundry/review/adversarial-platform.mjs docs/capability-foundry/review/adversarial-math.mjs
node --test tests/foundry-data-audio.test.mjs tests/foundry-data-platform.test.mjs tests/foundry-python.test.mjs
```

Results: **7/7 independent review tests** pass, including500 seeded CSV cases,1000 random byte vectors,300 generated unified hunks,100 independent Floyd–Warshall graph oracles, the rational cancellation counterexample, sparse-array rejection and revocation-during-load failure. The second targeted suite passes **38/38**. These overlap earlier suites and must **not** be added as unique test counts. Root's final whole-suite report is authoritative for unique totals and final exact source identity.

### Acceptance judgement

The reviewed modules provide useful dormant research infrastructure. No unresolved material defect from this review remains in the latest inspected fixes, but this is **not** production-release approval. The expensive unresolved scientific-runtime problem is hard browser/WASM memory isolation and physical Android behaviour. Screen-reader maths/ruby behaviour, real owner-private asset dispatch, genuine Workspace Classic/Focus/Task interaction, production catalogue activation and complete persistent metadata admission require their respective bounded acceptance/integration tasks. Root-owned browser evidence must state exact tested routes/actions and cannot be replaced by this source/Node review.

N01/N02/N05 were authored by this reviewer after root delegation, so they require root/other-agent review; their local property/oracle tests are implementation evidence, not an independent authorship review. N03/N04/N06 remain researched-only. No authentic learner data, production rights or live Site state was changed by this review.
