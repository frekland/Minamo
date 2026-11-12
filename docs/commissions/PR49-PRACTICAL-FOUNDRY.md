# PR49 practical Foundry implementation

The ordinary Activity Workbench now supports six additional explicitly selected, source-bound views. They reuse the existing text adapter, exact SHA-256 admission, current-rights activation checks and disposal lifecycle. Omitting `viewId` still displays ordinary prose; these features introduce no arbitrary imported code execution or developer-gallery route.

| View ID | Existing banked engine | Accepted exact source | Deliberate controls |
| --- | --- | --- | --- |
| `source.diff-v1` | N02 `readUnifiedDiff` | One bounded textual unified diff | Previous/next/first hunk; text fallback |
| `algorithm.graph-v1` | F05 `graphTrace` | Strict versioned graph JSON | Previous/next/first BFS or Dijkstra step; distance/frontier/parent table |
| `game.maze-v1` | F06 `createMaze`/`moveMaze` | Strict versioned rectangular maze JSON | Native directional buttons and reset; accessible cell/position descriptions |
| `game.sudoku-v1` | F05 `sudokuTrace` | Strict versioned 81-cell source and maximum 500 steps | Previous/next/first solver state; explicit budget/uniqueness caveats |
| `systems.life-v1` | F23 `lifeStep` | Strict versioned binary grid JSON | Next generation/reset; dead exterior; maximum 256 deliberate steps |
| `math.contrast-v1` | N05 relative luminance | Strict versioned foreground/background colour JSON | Deliberate colour input/reset; numerical ratio and readable text sample |

The existing `source.bytes-v1` inspector also shows exact UTF-8 Base64 and UTF-16 hexadecimal units. Separate NFC/NFD comparisons report whether a normalized representation would differ, without normalizing or replacing the canonical source or anchors.

All six new views use `text/plain-v1` artefacts in `source` or `explore` slots. The strict source grammar is checked at Activity admission and again when the selected renderer mounts. Source text enters `textContent`, with no remote imports, expression evaluator, filesystem access, local storage, microphone, or background timer. Controls create only renderer-owned in-memory state and never save an Attempt or checkpoint. Every listener is removed on disposal. Runtime authority is inherited from the existing host; the view itself grants no read permission.

`lib/interface-practical.ts` contains exact source examples and pure validators. `lib/activity/practical-foundry-examples.ts` creates nine original TEST ONLY complete Activity cartridges: Bash quoting diff, weighted graph, route maze, Sudoku reasoning, colour contrast, finite Conway Life, Unicode storage units, table/chart/read-only notebook composition, and a supplied TCP event illustration. The sources and provenance distinguish authored examples from observed external execution. This factory does not publish anything.

These examples form an integration capability, not a production content population or learner progress claim. Production publication/browser acceptance and task-owned cleanup are recorded in the parent release receipt after they actually occur.

## Executed checks

`node --test tests/interface-extension.test.mjs tests/pr49-practical-foundry.test.mjs` passed 14 cases. The suite executes native-DOM activation for every enabled build-time view, exact UTF-16/Base64 comparison, strict malformed/extra/executable source rejection, BFS versus weighted distance behavior, explicit Sudoku budget handling, deterministic Life oscillator/generation cap/reset, source hash/fallback preservation, zero listener retention, and source revocation/late-load disposal inherited from the existing SDK.

The new integration test uses the real compiled domain and isolated Miniflare D1/R2, not a JavaScript storage map. All nine original Activity cartridges passed typed MCP preview/publication, immutable operation replay and exact edition/source readback; a foreign synthetic owner was denied; all nine were moved to recoverable Trash. Zero Run records and zero learning Developments were created. Fixture disposal happened in `finally`.

These checks are local synthetic evidence. They do not certify actual Sites authentication/dispatch, production renderer gestures, physical Android, TalkBack, or measured hardware performance. The parent release carries those separate results and limitations.

## Deliberate gates retained

The offline scientific Python runtime, tldraw freeform canvas, arbitrary imported JS/React/WebContainers and optional heavy GPU/audio remain outside this activation. Data charts and read-only notebooks reuse their existing admitted adapters; notebook code remains inert. No new library/runtime dependency was added.
