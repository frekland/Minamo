# Reusable UX pattern catalogue — real learner jobs, not arbitrary website templates

This catalogue is a **design-and-engineering backlog**. Later Work must implement representative patterns using the real shared Workspace/Reader/Notes and actual PR39/PR40 content rather than inventing independent mock data services. Every pattern maps to a bounded typed presentation recipe and the same secure source/attempt authority.

## Core design grammar

Each pattern has:
- user intent and entry point (which Journey/Investigation/Library/Activity/Atlas source, exact edition and destination);
- primary information hierarchy (what must be visible before scrolling);
- optional supporting context and the affordance to reveal/hide it;
- allowed trusted slots and explicit user actions;
- desktop, laptop, narrow/mobile and keyboard/screen reader arrangements;
- empty/loading/error/stale/revoked/unsaved/offline/partial/large-content states;
- state and evidence semantics: what interactions remain presentation-only vs create explicit attempt/Note/Run;
- accessibility fallback and source-copy/Flag/Annotate invariants;
- realistic fixture + tests, screenshots and a single Light-model registration example.

### Pattern P0 — Focused Reading + Context

**Use:** Article, Journey stage, Japanese passage, technical explanation. Reading first, tight section navigation, secondary current task/return, exact Flag/Annotate, comfortable typography. Optional inline math/ruby/media. Notes button persistent and contextual; avoid a large companion panel on narrow devices. Existing Focus mode is the correct host, not a redesigned reader.

Desktop: source measure and short contextual trail; code/media may expand within source. Phone: strong heading, at most one compact orientation line, full-width passage, native selection, minimal floating note entry and full-height sheet.

Failure states: withdrawn Source excerpt shows correct unavailable marker; exact retained edition still eligible. No quote remapping based on currently displayed decoration.

### P1 — Activity Overview / Start Local

**Use:** new goal-first generated challenge; answer “what am I trying to do, why, how do I begin?” before asking the learner to understand a wall of artefacts. Show short problem, requirements and first concrete step, links to relevant reading, environment prerequisites and choices to inspect/starter/download/GitHub. Keep internal test-oracle private.

Desktop: overview plus concise optional source/test cards. Mobile: compact actual first action, one modal/sheet for setup, not an overwhelming scrolling dashboard.

Avoid automated teaching/progress claims and labels like “complete” when the task was merely opened.

### P2 — Debug & Repair (flagship)

**Use:** partially broken Python/Rust/JS/SQL project with verified failing baseline, learner prediction and deliberate hint ladder.

Desktop: task strip; substantial multi-file code/diff pane with tabs/file hierarchy; switchable test/terminal/diagnostic dock; hints and supporting reading as collapsible right/bottom inspector; quick contextual Note. One file may maximize without destroying Note/attempt data. Preserve version labels Starter vs Attempt vs Current, not silently replace code.

Mobile: one primary pane, labelled segmented Code / Tests / Hints / Reading, a clear GitHub/Local action; terminal horizontal scroll/copy; Notes full-height existing sheet. Hide actual solutions *server-side*, never via client CSS.

Evidence labels: expected to fail vs actually executed; test result from verified CI vs learner-supplied stdout; hint revealed is not mastery.

### P3 — Build & Iterate

**Use:** developing Mood-to-Music, React component, Sudoku GUI, Retro RPG, scientific script, music generator.

Desktop: practical goal and current stage context, preview/output as appropriate, file/diff inspector, external local GitHub handoff and exact next action. Separate “Open local project” from “Run inside Minamo”; no false claim of arbitrary code execution.

Mobile: focus on one artifact/playable finite demo or repo/reflection, not an unusable full IDE. No duplicated persistent code editor unless user explicitly opened an Activity workspace. External GitHub jump/link clear and returns to exact stage.

### P4 — Predict → Explore → Compare

**Use:** experiment across Python/regex/SQL/networking/math/audio. Four clear steps: inspect scenario → make provisional prediction → deliberately run or inspect supplied observation → compare and reflect. Source and test identity pinned.

Desktop: split or toggled before/after with a difference highlight. Phone: stepper/cards with previous/next and persistent prediction; never auto-evaluate the user's natural-language prediction as mastery. Failed or cancelled Run visible without stale plot labelled successful.

### P5 — Interactive Maths / Scientific Board

**Use:** geometry, function plotting, symbolic calculation, cellular automata, 3D scientific scene.

Desktop: spacious canvas/plot/figure as primary; parameter controls in low-width inspector; optional equation, code, source citations and actual execution receipt; step/rewind/restore. Some maths may need embedded horizontal scroll or zoom and accessible semantic fallback.

Mobile: full-width simple figure with deliberate control drawer, no always-visible 3 column stage; slider/input semantics and alternate numeric controls; GPU/render fallback as readable source/equation/table. Preserve unit, bound, sign and symbolic-vs-numeric distinctions.

### P6 — Language Reading + Discovery

**Use:** Japanese kanji/furigana and grammar, Chinese pinyin, bilingual materials, listening. The default should remain real readable text, NOT a mobile quiz with a sentence hidden inside cards.

Desktop: comfortable width Japanese text, show/reveal reading preference, exact word explanation popover, sourced grammar/translation in aside on demand; optional audio controls after gesture. Reader source and Note remain available.

Mobile: native ruby wraps, tap/keyboard or separate accessible list reveal, popover placement above Android keyboard, long-press selection does not invoke unwanted game gestures, support device Japanese IME and correct code points. When meaning ambiguous, present alternatives and provenance, not pretend the model selected one authoritative reading.

### P7 — Data Detective

**Use:** CSV/TSV/SQL/DuckDB datasets, graphing, stats, anomaly detection.

Desktop: data table and chart linked by a stable source digest; query/result controls, filters, explanatory Notebook/Note, optional diff between expected and observed. Note which transform is demonstrably run vs illustrative.

Phone: change between chart/table/query, accessible data table, retain filters within the same dataset and external dataset/source permission. No chart/visual-only access to numeric facts.

### P8 — Algorithm / Graph / Game Lab

**Use:** BFS, Dijkstra, queue, sorting, state machines, finite game path, 2D/3D.

Desktop: state/canvas, step/run/pause/reset, selected code/span or legend, consistent controls and replayable seed; external local project option if untrusted app code. Atlas source links by meaning, not merely graph node title.

Phone: focused state, accessible node list, discrete stepper and simplified controls; no pan gesture capturing native reading selection. Animation respects reduced motion and work continues without GPU.

### P9 — Interactive Code Walkthrough

**Use:** guided inspection of existing real source, novice code explanation, error trace, review/refactor quest.

Desktop: stable source lines, chosen highlight/focus linked to short explanatory prose, keyboard next/previous step and predictable scroll. Code Hike-style authoring may compile to data-only trusted annotations. Real code must remain copyable and line numbers correct across file editions.

Phone: one source block at a time and one explanation, no scroll-driven highlight requiring difficult gestures. Deliberate step control alternative to Scrollama.

### P10 — Audio/Music Workbench

**Use:** time-coded MIDI/notes, Tone.js rhythm, waveform/pitch plots, Strudel code. One explicit Start/Stop sound action and clear mute/volume controls. Avoid autoplay/mic permission on open. Show beat timing/visual trace as source-bound values; sound rendering not evidence of its educational interpretation.

Phone: touch tempo/note controls; audio background/pause and lifecycle; static beats/table/symbols when audio not supported. Browser voices may be unavailable.

### P11 — Learning Atlas Context

**Use:** navigate Journey route, find cross-domain Library connections, evidence chronology, project Galaxy and optional tldraw canvas.

Desktop: structured graph + inspector/context aside; sources have current exact links and edge reasons, optional focus search/filter, switch to list; freeform tldraw optional, with its own canvas layout storage and license gate.

Phone: related-context list/tree with optional canvas, not a microscopic 2000-node mini-map. No graph-derived mastery, no hidden rights leak in thumbnails or old canvas snapshots.

## Cross-cutting affordances that must be implemented once

- **Context header:** exact task/source edition, why here, navigate back, task next action when actually saved; avoid stacking full headers inside every component.
- **Common status/provenance:** factual labels authored / supplied / observed / verified external / provisional / not attempted / denied; semantic shape+text not color alone.
- **Safe action strip:** Run (when available), inspect source, copy, open locally, GitHub, review test evidence, open Notes; permissions-aware disable reason.
- **Hint drawer:** tiered concept/strategy/mechanic and explicit full solution reveal with server-enforced entitlement; no hidden client payload.
- **Source inspector:** read original, retained edition, code lines, exact selection/Flag/Annotate, safe retry and source return.
- **File/diff/terminal:** no second pseudo-shell authority, replay exact supplied output with source classification; shared scrollbar, copy and line wrapping.
- **Scalable visual host:** chart/math/CJK/code/audiovisual/2D/3D/graph all have loading, unsupported, stale, user-activation and teardown states.
- **Compare/review:** side by side where wide; stack/segment where narrow; original input never silently overwritten by output.
- **Interactive task state:** current prediction/selected option/focus/scroll belongs to that Activity/Attempt, not global session/Note.
- **Rich writing/Notes:** existing persistent host, drafts/CAS/conflicts, dock/minimise/reopen and context capture. No forced long Note or compulsory checkpoints.

## Default information hierarchy and constraints

Every opened Activity should answer without extensive scrolling:
1. Where am I? (short contextual locator)
2. What is this? (clear title/task)
3. What can I do now? (one prominent valid action, not six equal CTAs)
4. Where is the actual material? (code/reading/plot/view)
5. Where can I capture a thought? (existing Notes with correct context)
6. How can I get back to my project? (exact return)

Power-user shortcuts and advanced controls are progressive disclosure, not always-on chrome. Do not insert a giant tutorial banner ahead of source content.

## Pairwise regression scenarios

Test combinations of pattern + mode + note dock + narrow/wide + source rights + pending write. Pairwise selection controls combinatorial explosion, but always run catastrophic edge combinations (Task + right Notes + code/terminal + 1024px; phone keyboard open + Notes + ruby selection; retained edition + revoked source + Atlas; dormant heavy renderer disabled + fresh Activity with unknown kind).

The pattern catalogue is an initial **testable hypothesis**, not evidence that the owner prefers one visual arrangement; Work must compare real code prototypes, record rejected approaches and improve the final choice.

