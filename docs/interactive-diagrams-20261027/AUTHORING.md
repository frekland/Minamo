# Authoring educational diagrams

Use the ordinary `publish_minamo_manuscript` tool and original Markdown. A `minamo-diagram` JSON fence is compiled into a canonical diagram; optional `preview_minamo_manuscript` with `detail:true` returns the exact proposed record. Read relevant existing coverage before publication. A diagram is optional and should explain something useful.

An ordinary static figure needs only nodes and connections:

```minamo-diagram
{"format":"flow-v1","nodes":[{"id":"input","label":"Standard input"},{"id":"process","label":"Process"}],"edges":[{"id":"read","from":"input","to":"process","label":"read bytes"}]}
```

For exploration, add `presentation:{"version":1,"mode":"explore","orientation":"auto"}`. Nodes and edges can include a `description` (1–2000 characters) and an exact `reference:{"family":"article","id":"actual-id","rendition":"actual-rendition","sectionId":"actual-section"}`. Retrieve real references; never invent record or edition identities. References open through ordinary Minamo permission checks.

For guided changes, use explicitly authored steps:

```minamo-diagram
{"format":"flow-v1","nodes":[{"id":"input","label":"Standard input"},{"id":"process","label":"Process"}],"edges":[{"id":"read","from":"input","to":"process","label":"read bytes"}],"presentation":{"version":1,"mode":"guided","orientation":"TB","initialStep":"waiting","description":"Authored model, not observed execution.","steps":[{"id":"waiting","title":"Before input","explanation":"The process is waiting for input. No bytes have been read in this model yet.","activeNodes":["process"],"activeEdges":[],"visibleEdges":[]},{"id":"receiving","title":"Input is available","explanation":"The model now highlights the local read from standard input.","activeNodes":["input","process"],"activeEdges":["read"],"prediction":{"question":"Does reading local input prove network delivery?","answer":"No. A local read and remote delivery are different events."}}]}}
```

Supported bounds: 1–12 nodes, at most 20 edges, 2–20 guided steps, 120-character single-line labels. Orientations: `auto`, `TB`, `BT`, `LR`, `RL`. Layout: `layered` or `radial`. Flow diagrams reject cycles; use `graph-v1` for ordinary cycles, or `state-v1` for trigger-labelled transitions. Grids retain their existing contract.

Every step requires stable `id`, `title`, `explanation`, `activeNodes` and `activeEdges`. Optional `visibleNodes`, `visibleEdges` and `nodeLabels` change the presentation without changing canonical identities. Omitted visibility means all eligible items; an edge needs both endpoints visible. Use authored edge IDs; older unnamed edges use `edge-N`, zero-based in source order. `initialStep` chooses the initial and reset step. Previous/Next follow the explicitly authored array; Reset clears selection and prediction reveal. Static/explore modes reject steps rather than inventing behavior.

Unknown fields, executable content, invalid identities, hidden active items and malformed predictions are rejected with actionable errors. An invalid explicit interactive manuscript is rejected, while unsupported legacy Mermaid remains exact readable code with a diagnostic. No HTML, CSS, event handlers or user-supplied JavaScript is accepted.

For a bounded existing-diagram revision, read the exact current article and use `apply_minamo_command` with `action:update`, exact `family/id/expectedRev`, and one `patchBlock` targeting the existing section/part with `changes:{diagram:...}`. Canonical text is derived by the server; surrounding blocks remain untouched. Bounded diagram-only metadata is not misclassified as a wholesale prose replacement. Other large editorial replacements retain their manuscript/package guard.

After publication, use `read_minamo_record` for the complete saved diagram and interaction metadata. Use `read_minamo_manuscript_source` with the exact publication operation ID for immutable original Markdown. Retrying an uncertain publication must use the identical operation and payload; read its operation receipt first.
