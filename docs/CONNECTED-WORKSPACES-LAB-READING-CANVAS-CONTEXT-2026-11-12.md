# PR #99 — reading, Canvas and selected context slice (12 November 2026)

Baseline: owner-private Visual Lab V160, source c143716f631f3ae4d94d3c72810d5fd75103d9fb. Reviewed the PR's fresh-conversation MCP acceptance report and three subsequent visual review comments independently. Production remains V149. Public/private source reconciliation remains an owner-deferred integration gate. PR #99 must stay draft and unmerged. Tldraw is explicitly deferred because the working licence is production-only.

## Implemented

- Python Canvas no longer serialises frames into console stdout. The isolated runtime returns a separate, bounded 1 MiB drawing payload. The existing 20,000-character console limits, opaque origin, no-network runtime, time limit and 120-frame/600-command validation remain. Invalid or oversized drawing payloads fail closed. Execution failure uses a short explanation with technical details on demand; it cannot enable saving a failed result.
- Off-grid slider defaults retain their authored value instead of the browser silently snapping the control to another value. Their range accepts continuous values; aligned definitions retain their authored step. The spoken value includes the exact current value and unit.
- All collapsed Note cards use the same bounded prose excerpt, including Notes containing terminal placements. Expanded Markdown and retained terminal material remain available in the full reader.
- Questions show concise source excerpts and expand long prose, tables, code and interactive sources on demand. Exact source rendering, observations, contributions and Open section remain available.
- A long Library introduction returns an actual bounded excerpt instead of replacing the whole preview with instructions to open it. This is passive preview prose, never a selectable canonical passage or a substitute for an exact citation.
- Home masthead and generic Project covers consume less space. Project list mode retains a one-line description; the selected presentation is visible. Initial unknown Project counts say Loading. The header displays the current scope beside its icon.
- Explicit standalone selected context no longer appends unrelated workspace-wide continuity evidence. Selected receipts, exact histories and saved relationships remain. Blank reads still discover recent independent work; explicit Project/Question focus still reads its evidence. Global evidence cursors cannot be reused for standalone selection. This does not infer a relationship from co-selection.

## Evidence before deployment

The live V160 ball model reproduced the exact JSON parse error at position 19986 with untouched gravity 350 and bounce 0.78; its accessible range had incorrectly reported 0.8. A live MCP read of the standalone framing decision Note returned unrelated Radio Island and Cherwell annotations in evidence.items, independently confirming the review finding.

Focused tests: 15 passed across working-context-read, canvas-transport, record-display and project-work-threads-c4. Canvas transport runs actual bundled Pyodide through the controller runtime, retaining a valid 120-frame payload larger than 39,000 characters despite truncated stdout; it also verifies the 1 MiB rejection and normal console-only runs. Context tests retain cross-owner, unavailable editions, CAS and pagination negatives. Typecheck passed. Build and deployed browser/MCP acceptance are recorded separately in the PR after publication.

## Still requires broader acceptance or implementation

Connection presentation and exact provenance disclosure remain too dense; global search ordering and title matches need further work. Questions need a dependable return-in-context affordance. Long Project reopening, Japanese repetition/furigana/audio placement, flashcard control hierarchy, Notes dock reading/editing and Settings explanations remain review items. Packaged-game external runtime loading, actual mobile widths, recovery and settings-change acceptance require further verification. Existing eight stale Home/Continue assertions were not run or repaired by this slice. No broad full-suite pass is claimed. No new learner observations, achievements or external scientific results were created by this implementation.
