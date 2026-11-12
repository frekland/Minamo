# Learning Atlas — visual navigation without invented learner proficiency

**Proposal: five linked ways to see the existing truth.** Do not turn Minamo into a gamified course checklist or a force-layout hairball. The Atlas is a *projection* of already-authorised Journey, Investigation, Library, Note, Source, Activity/Attempt and Development records, with explicit permission, chronology and provenance. A graph node is not a new learning milestone.

## Lenses / views

### 1. Journey Route — “Where am I going?”

A zoomable but restrained path through the currently selected Journey's authored stages and linked Investigations. Main route, optional branches, side quests/resources and self-selected next action. Distinguish:
- authored intended direction;
- genuinely recorded checkpoint/decision;
- recent Note intent after an earlier checkpoint;
- related optional Library resources;
- proposed follow-on Activity not yet tried.
No inferred green completion from visiting a page, running tests, opening an activity or reaching a branch. Clicking takes the learner to an exact existing Reader/Investigation/Note destination, not a duplicate summary.

Use React Flow for typed node/edge navigation and purposeful layout if it performs/accessibly tests well. A compact stepper/list/table is the mobile/keyboard fallback.

### 2. Knowledge Constellation — “How do these ideas connect?”

A cross-Journey concept network: reusable Library Area → Article → canonical concept/command → linked Investigations → examples and Activities. Selected central concept reveals why two areas connect, with link-level provenance:
- authored/owner accepted relationship;
- source-referenced relationship;
- GPT *suggestion* with confidence/explanation and review affordance;
- historical relationship from an immutable edition;
- unavailable/revoked source (withhold content).
A concept can appear in multiple contexts without duplicating original Article source. Think “TCP byte stream” linked to Python recv(), Bash netcat, packet captures, HTTP parsing and protocol testing, but only if links have genuine evidence/explicit acceptance.

### 3. Evidence River — “How did my thinking change?”

A horizontal/vertical chronological trace, not a skill score: prediction → supplied test output → misconception → correction → new question → deliberate checkpoint. Supports side-by-side code/diff, exact Note reference, retained Source and changed hypothesis. Older failed attempts remain visible; revisions do not quietly rewrite history. May be presented as a timeline/causal DAG to distinguish sequence from actual causation. A graph edge claiming “caused” must carry authored evidence, never be inferred from timestamps.

### 4. Project Galaxy — “What am I making?”

A project-centric network of Journey/stage, Investigations, activity cartridges, GitHub starter/submission commits, experiments, screenshots/plots/audio, linked Library and Notes. Distinguish a planned Activity, in-progress learner attempt and validated test result. Enable a simple focused “show code / run evidence / what next?” panel without opening a giant board. Suitable to Mood-to-Music, Sudoku GUI, Retro RPG and networking studies.

### 5. Freeform Learning Canvas — “Let me rearrange my understanding”

Use the user's licensed **tldraw SDK** where permitted (production host/domain/licence validated) as an optional board with semantic pinned cards, hand-drawn arrows, spatial groupings, sketches and annotations. This is a *user-authored canvas view* with separate recoverable layout snapshots, not a second authoritative database of Learning relations. Pinned record cards resolve current rights and click through to canonical source; freeform labels/art can exist without claiming records or mastery. A suggested concept relation becomes an official semantic link only after explicit review/admission to the existing relation domain.

Supporting variations to explore: course map, dependency DAG, “what changed this month”, future investigations radar, prerequisites vs applications, historical misconception map and command/reference atlas. Avoid dozens of tabs; use a clear mode switch and focused filters.

## Graph data and trustworthy links

Suggested intermediate projection (not existing schema):

~~~json
{
  "contract":"minamo.learning-graph.v1",
  "scope":{"journeyId":"example-only","generation":"resolved-server-side"},
  "nodes":[
    {"id":"investigation:example","kind":"investigation","title":"How do streams work?","destination":{"family":"investigation","id":"example"},"status":{"basis":"authored","value":"active"}},
    {"id":"concept:streams","kind":"library-concept","title":"TCP byte stream","destination":{"family":"article","id":"example-article","sectionId":"s1"}}
  ],
  "edges":[
    {"id":"e1","from":"investigation:example","to":"concept:streams","relation":"references","basis":"authored-link","accepted":true,"reason":"Explains why a recv call can be partial"}
  ],
  "truncated":false
}
~~~

This is a minimal illustration; actual destinations require current owned exact IDs, rendition and validated section/part. Each node/edge has a source identity and a current rights gate. Do not accept user-supplied owner/generation as authority. Query only eligible records and paginate by stable validated continuation scopes. Never silently substitute a similar-title destination.

Proposed edge vocabulary: requires, explains, applies, contrasts, investigates, tests, cites, contributes-to, followed-by, conjectured-link, correction-of and reused-in. Some are graph-only projections of current existing relations; don't persist new relation names without migrating server/MCP/editor with proper tests. For every edge, mark authored vs GPT suggested vs learner accepted vs derived by reproducible rule. “More frequently viewed” or “passed challenge” is **not** evidence of understanding. Graph aesthetics are presentation preferences, not learner-data facts.

Existing Minamo relationships, concept indexes, cross-linked Notes and checkpoint chronology are authority. Performance: server-projected bounded neighborhoods, scoped pagination and on-demand expand, clustering by Area/Journey, no loading the entire workspace into a giant d3-force run. Use stable low-noise auto-layout; do not animate position wildly every time a Note changes.

## Navigation and interaction detail

- Home/continue: small map preview or direct link to map, not a gigantic animated canvas replacing the proven workspace.
- Contextual right rail: node's purpose, meaningful links, saved next action, recent Note intention, authored resources, optional exercise ideas and exact deep-link.
- Click/tap node opens preview; double/open action navigates. Hover is not essential on mobile. Desktop pan/zoom with predictable controls; zooming never breaks text selection in a Note.
- Render accessible list/tree equivalent to any graph, keyboard traversal/Enter, focus ring and large-touch targets. 390px mobile shows a single focused branch/card stack + breadcrumb, optional pan canvas, not micro-text on hundreds of nodes.
- Filters: Journey/Area/Investigation, link type, authored/proposed, temporal window, evidence source, only your active project, hide synthetic. Remember view mode per device if beneficial, not as new learning state.
- Robust deep links: exact record/edition/section/part, source-correct History, back/forward, old edition indicator, no stale double-fetch resorting.
- Stable layout snapshots can be local device preferences where suitable; collaborative versioned tldraw boards (if added) need guarded D1/R2 and recovery rules without every drag gesture becoming a Note or Activity.
- Color is secondary to shape/label/position: muted blue/cyan against charcoal; focus/high-contrast and screenreader labels. Motion as gentle guide only; support reduced-motion and keyboard.
- Use existing CSS+Lucide icons by strict allowlist; no executable remote icon URLs or model-provided component names.

## Technology comparison study

### React Flow (@xyflow/react)

Candidate for **semantic structured Journey/Knowledge graphs**. Custom React nodes/edges, viewport/minimap and controlled node sets allow typed authoritative links and stable deep links. Pros: concept/card and dependency-oriented; no entire freeform editor needed. Test tens/hundreds/thousands nodes, focus order, keyboard, React 19, SSR/Vinext, owner-private content, layout algorithm (ELK.js vs dagre vs constrained original layout), stale links and phone performance.

Official: https://reactflow.dev/ and https://reactflow.dev/learn.

### tldraw SDK (the user owns an SDK licence)

Candidate for **freeform whiteboard and spatial explanation**, including GPT-authored provisional sketches, hand arrows and custom safe record-card shapes. Its production SDK requires a valid key with relevant host coverage; licence type controls telemetry. Verify actual key host/expiry and Site configuration **without putting a key in GitHub or exposing private data in research**. Hobby/trial licences may send limited telemetry, and release needs a privacy decision. Distinguish writable canvas snapshot from canonical learning records.

Official licence: https://tldraw.dev/sdk-features/license-key
Custom shapes: https://tldraw.dev/features/customization/custom-shapes-and-tools

### Cytoscape / existing Foundry graph views

Best for **algorithmic graph exploration** (e.g. Dijkstra/BFS), dense node-link analytics and layouts, not necessarily the learner's freehand workspace. Reuse Foundry F05 trace if it meets needs. Avoid installing Cytoscape, React Flow and tldraw all into Home by default; lazy per view.

### Motion (formerly Framer Motion), DnD Kit

Motion layout projection can animate user-selected focus transitions between a Journey graph and a detail panel, not animate every live edge or distract from reading. DnD Kit provides keyboard/screenreader alternatives to arrangement challenges. Both must honor reduced-motion, stop when hidden and preserve existing Notes focus.

## Proposed research and interactive demos

D1. **Sockets constellation:** start with existing real Library concept (TCP) and show Journey/networking Investigation/terminal Notes, a challenge starter and one user-submitted commit. Every edge has a reason and exact source ref. Contrast supplied external trace vs executed Python.
D2. **Learning corrections:** synthetic three-stage hypothesis and contradiction → wrong model → corrected model with temporal source pointers. A new Note after checkpoint appears, without rewriting old checkpoint next action.
D3. **Cross-domain project:** Mood-to-Music links optional Japanese vocabulary, statistics, music synthesis and React data visualisation only via explicit user/author links; do not fabricate concept mastery based on incidental overlap.
D4. **Large library:** 2,000–10,000 synthetic nodes with bounded server neighborhood queries, clustering, pagination, no inaccessible legacy orphan mapping; test local memory/latency.
D5. **Phone:** 390x844 equivalent cards and accessible navigation; compare with actual pan/zoom behavior, no horizontal overflow; 200% font, reduced motion, high contrast, Android touch emulation and actual device qualification.
D6. **Freeform sketch:** tldraw custom source-card shapes and re-link through exact eligible records, then revoke a source and prove canvas/history snapshots withhold inaccessible content. Check licence host before any deployment.
D7. **Proposed edges:** GPT proposes five candidate relationships with evidence; at least one is rejected and never writes authoritative relation. Existing accepted link persists with revision/history and no duplicate.
D8. **Accessibility:** evaluate structured graph via keyboard, screenreader if available, selection of original passage, focus restoration after popover, and equivalent list/tree on mobile.

## Deliberate non-goals

- An automatically inferred global skill graph, percentage mastery, daily streaks, learning “XP,” forced paths or a misleading graph of connections inferred from lexical coincidence.
- Storing all available Source text in browser/canvas caches after permission revocation.
- A constantly rearranging force simulation that hides resource names and crashes mobile.
- A new competing editor or graph database for authoritative Journeys/Library data.
- Treating a freeform visual arrow as an accepted semantic link without explicit user or editorial action.

## Ready-for-lighter-model activation test

Provide exact tested refs, typed graph projection/permissions, registered React Flow view and optional tldraw view with clear module boundary. A future Sol Light task should be able to wire one default-off Atlas tab to an existing exact graph query, choose a focus record, add a single filtering control and rerun provided tests, without inventing source matching, revision semantics or graph algorithms from scratch.

