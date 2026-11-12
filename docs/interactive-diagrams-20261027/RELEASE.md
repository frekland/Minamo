# Educational diagrams and Atlas retirement — 27 October 2026

Baseline: native source `762d82871cb1b6d0f94d1b7ea4c41304128c0813`, GitHub main `bf1669d3e068731f696deab468287f43a208be60`, common tree `7b318fb8b2e0a4e084827f9b091cd0e1f86b371c`. Native Sites confirmed V41 and an owner-only access policy. The authenticated production browser also confirmed the old Atlas entry before changes.

## Delivered behavior

- One canonical `flow-v1` / `graph-v1` / `state-v1` / `grid-v1` contract, with optional version-1 presentation metadata. Existing identities and immutable editions remain readable. No migration or dependency change.
- Compact native SVG for ordinary diagrams; complete wrapping instead of truncated graph/state labels. Topological layers and strongly connected components support compact cyclic layouts. Stable barycentric ordering reduces crossings; reciprocal curves show both directions; label boxes avoid nodes and one another, using explicit leaders when displaced.
- Mermaid TB/TD/BT/LR/RL orientation is preserved. Automatic orientation adapts to the reading width; explicitly authored orientation is respected. Large figures retain readable geometry and horizontal exploration rather than forcing all text into one viewport.
- Explorable nodes/edges support keyboard selection, explanations, incident-relationship highlights and exact internal reading destinations. Guided diagrams have explicit step IDs, visible/active identities, temporary labels, commentary, initial/reset state and optional prediction/reveal. Their state remains local to the component; there are no Attempt, checkpoint, achievement or execution writes.
- React Flow is lazy-loaded only for an explicitly opened viewport. It supplies touch/pointer pan, pinch zoom, zoom buttons and fit controls around the same trusted native SVG. Ordinary reading does not capture scroll or mount an interactive editor.
- Expanded views use a full mobile sheet, a named native dialog, Escape, focus restoration and useful viewport controls. The ordinary Text alternative, Diagram details and Exact source disclosures are removed. Programmatic descriptions and exact canonical passage text remain; unsupported diagrams retain visible source and readable authored commentary.
- Native authoring retains exact metadata editing with the shared validator. MCP schemas, editorial policy and contract discovery describe ordinary static, explorable and guided authoring through `minamo-diagram` fences. Preview/publication share validation and retained editions carry the complete definitions.

## Atlas retirement

The Atlas entry, mount, product views, canvas UI, lenses, help paragraph, development specimen and promotional presentation pattern are removed. Legacy `view=atlas` links resolve to ordinary Library browsing and discard obsolete Atlas query controls. No Atlas graph request runs on ordinary workspace mounting.

React Flow, tldraw, generic graph/layout/canvas validation, typed relationships, IDs, provenance, source-rights projection and data-only graph retrieval remain. The graph tool no longer describes or gates itself as an Atlas product. Legacy Activity presentation tokens receive an in-memory ordinary reading composition; retained source records are not rewritten. Eleven active presentation patterns remain advertised. Genuine Notes, captures, Attempts, relationships and learning history are not migrated or deleted.

## Validation and active corrections

Typecheck and the complete supported production build passed. Full regression totals, source-tree reconciliation, merge and deployment identities are appended to the implementation PR after their actual results exist. No GitHub Actions rerun or paid provisioning is requested; local results are not remote CI success.

Focused real MCP/Worker/D1 acceptance covers static/explore/guided manuscript preview and publication, full canonical metadata, immutable manuscript source, retained prior editions, CAS conflicts, malformed states/references, owner isolation and recoverable Trash. Existing format and exact UTF-16 passage/annotation tests remain.

The cloud preview initially used a portable checkout profile. Configuring the supported managed-linux profile and restarting the daemon restored browser access. A fixture hydration mismatch was corrected by giving the embedded workspace its own dev-only route. Browser evaluation then exposed and corrected crossed output ordering, indistinguishable endpoint labels, reciprocal arrowheads and squeezed viewport control icons.

Actual cloud-browser checks used 320/390px iframe documents and 768/1280px tablet/desktop documents. Checked the five-node inline flow, guided Netcat inline/expanded views, all eight steps, prediction reveal, keyboard node explanation, zoom/fit, Previous/Reset/Escape and Focus/Task with Notes open. Inline containers reported `overflow-y: visible`, with `scrollHeight == clientHeight`; the desktop figures measured 212–436px high. Geometry regression coverage additionally checks dense forks/fan-in, cycles, long labels, grids and all orientation declarations.

Physical Android/TalkBack, real touchscreen gesture behavior, assistive-technology certification and a separate fresh human GPT conversation are not claimed. Browser viewport emulation is not a physical-device test. The diagrams model authored semantics; no Netcat command execution is claimed.

## Permanent content and disposable operations

The owner's existing Netcat article is revised only at section `s2`, diagram part `p3`, through an exact-revision MCP command after deployment. Its title, other teaching blocks, links, learning scope and nc/netcat catalogue remain intact. The previous rendition remains available. The new model teaches stdin/stdout, connection initiation, accepted TCP endpoints, byte directions, EOF, one-direction shutdown and final closure. It explicitly assumes OpenBSD-style `-N` at the relevant step and distinguishes the model from observed execution.

The live synthetic manuscript is explicitly TEST ONLY and will be moved to recoverable Trash after exact readback. Exact publication and cleanup operation identities are recorded in the implementation PR. Dev browser fixtures use original synthetic source and do not write production data.

## Rollback

Prior saved V41: `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_0e2040dc66088191a41fb53fad0eb01b` (deployment `appgdep_6adfd78922588191bc9a4602eff7709d`). No schema migration or environment/access change is needed. For a complete editorial rollback, first read the current Netcat revision and restore only its prior diagram from the retained pre-release edition under CAS; do not overwrite later edits or reset the catalogue. Then deploy the saved V41 artifact using the native private deployment operation. Source rollback is the baseline commit above; do not rewrite Git history.

## References consulted

- React Flow official accessibility and viewport guidance, retrieved through Context7: https://reactflow.dev/learn/advanced-use/accessibility and https://reactflow.dev/api-reference/react-flow
- OpenBSD Netcat manual, retrieved through Firecrawl: https://man.openbsd.org/nc.1
- SOFA read-only discovery returned no directly applicable React Flow/mobile layout evidence; no SOFA publication or unverified advice was used.
