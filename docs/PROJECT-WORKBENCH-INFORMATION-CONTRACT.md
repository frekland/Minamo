# Integrated Project Workbench — evidence-grounded information contract and comparison gate

**V89 research specification · 1 November 2026 · owner decision still required before a replacement UI or schema migration.**

Read with [V89 live baseline](acceptance/2026-11-01-v89-workbench-research-baseline.md), [#51](https://github.com/frekland/Minamo/issues/51), [Workbench handoff](PROJECT-WORKBENCH-IMPLEMENTATION-HANDOFF.md), [redesign strategy](LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md) and [current architecture](ARCHITECTURE.md). This contract is an **implementation hypothesis constrained by checked canonical evidence**, not a new authoritative database, a deployed feature or a tested visual prototype.

## Product outcome and non-negotiable boundary

A returning learner should enter **one Project** and answer: what is the live concern, what changed and why, what evidence supports or challenges it, what remains uncertain, what was last *reported* versus independently verified, and what small learner-chosen action is useful next? The same selected material, draft, source revision and return context must survive moving between Work, Questions and Evolution responsibilities. These responsibilities are complementary; they need not be tabs.

A learner's original Project, Notes, Questions, sources, revisions, author/speaker indicators, retained source anchors and deliberate saved changes remain canonical. Current focus, a turning-point list and proposed next actions are **derived, inspectable projections**. They cannot silently rewrite history, create an authoritative status table, infer mastery/certainty, publish AI conclusions or turn fictional terminal/hardware reports into verified operations.

## Evidence-to-diagnosis matrix

This matrix uses the exact V88 current-epoch synthetic records and latest Note readbacks, plus browser observations only where explicitly stated. Categories: (1) missing canonical data, (2) relationships/anchor gaps, (3) weak derived projection, (4) MCP retrieval/context selection, (5) UI presentation, (6) navigation/writing friction, (7) GPT interpretation errors. No actual nine-way independent GPT behavior has been tested, so category 7 entries below are **risk cases**, not observed GPT failures.

| Persona / observed record | What exists, where, and how it is connected | Current retrieval and learner display | Diagnosis and justified first change |
| --- | --- | --- | --- |
| Weekend Mood-to-Music: `note-weekend-log` rev1 + storage Question | Note states mood switch was **not** refresh; linked to Question, Project `personal-labels` section and pinned Article `personal/p`; older checkpoint targets personal-labels | Exact Note and root Project context retrieve it; registered continuation selects **checkpoint**. Browser Question shows Note in Recent Work, but Project first action is Step 1 | **3,5,6:** show the latest experiment and checkpoint as distinct claims; preserve Q→Note→Library→Q return selection |
| Provider sceptic: `note-docs-return` rev1 | Later Note linked to provider Question and `note-docs-audit`; original provider claims, offline decision and source uncertainty retained | Exact read and registered recent-Note continuation succeed; root Project context returns nine direct relations but omits this later Question-linked Note with `relatedTruncated:false` | **3,4:** bounded two-hop Question-mediated closure and an unsupported-claim source ledger; no new table for already stored Note |
| Privacy reviser: `note-privacy-assumption` rev1 | Labels remained visible; no refresh or localStorage inspection. Links to consent Question, Project section and pinned Article rights passage | Exact read works; registered continuation chooses earlier checkpoint. Individual UI interaction not tested | **3,5; 7 risk:** juxtapose predicted persistence, consent concern and actual missing verification; never label storage proven |
| Cap command-log: `note-cmd-return` rev1 | Two supplied HTTP 200 outputs from uncertain target instances, linked to service Question and Article HTTP passage | Exact Note read and recent-Note registered continuation; individual UI not tested | **3; 7 risk:** represent supplied command/outcome separate from exploit inference; invite bounded instance/request comparison |
| Cap packet/model: `note-model` rev1 | Browser→GET→200 sketch lacks cookies, auth, timing and capture identity; linked to capture Question and HTTP passage | Exact read and recent-Note registered continuation; individual UI not tested | **3; 7 risk:** sketch vs captured packet must be explicitly different evidence kinds; do not invent a pcap |
| Cap sparse return: `note-restart` rev1 | New Note links instance Question and expired-instance Note; the Project itself revises aim to fresh permitted instance/no spoilers | Exact read and registered recent-Note continuation succeed; root Project context returns seven direct related items but omits latest Note, with `relatedTruncated:false` | **3,4,5:** show current permission/expiry boundary and ask for new instance; temporal and multi-hop closure matter more than curriculum resume |
| Plant breadboard: `note-quick-wiring` rev1 | Reported `play(1) sent` and physically silent speaker, no measured supply/UART/SD evidence; linked to audio Question and pinned UART passage | Exact read and recent-Note registered continuation; individual UI not tested | **3; 7 risk:** visible multi-layer evidence: command submission, speaker observation, unknown wiring/power; never infer cause |
| Plant calibrator: `note-cal-next` rev1 + revised Project rev4 | 15% wish superseded by raw counts/bands/hysteresis; real sensor drift and watering response untested; Note links calibration Question and hysteresis Note | Exact read, Project context and recent-Note continuation succeed; browser Project body reflects pivot but prominent CTA remains Parts and safety | **3,5:** current decision + rejected premise + outstanding measurement on entry; simulated firmware ≠ hardware calibration |
| Plant shared-space: `note-noise` rev1 | Reported social objection, now repeat/mute policy matters more than threshold precision; links behaviour Question and pinned human-use passage | Exact read and registered recent-Note continuation; individual UI not tested | **3,5:** practical/social constraints are first-class contextual evidence, without skill scores or project-management taxonomy |

**Corpus-wide inference:** no sampled scenario proves a missing Note or lost source anchor. Root Project `get_minamo_context` currently tends toward direct relations, whereas newer Notes may be reachable through Questions/older Notes. That is a **projection/retrieval** limitation to test first. Do not imply every Note should always be loaded: bounded coverage and relevance are mandatory. Conversely, record-level `actor:user` is insufficient to attribute every quoted utterance in a Note (a seeded `note-pivot` mixes lines labelled scripted GPT and learner); more granular claim/speaker provenance may eventually need a domain extension.

## Current contracts and implementation reuse

Evidence in `lib/project-contracts.ts`:

- `ProjectOutline.version=1` provides Project identity/rev/rendition, Steps, linked Questions, relation coverage and continuation.
- `ProjectContinuation.basis` is exactly `checkpoint | recent-note | start`; it identifies a destination, **not** a full temporal synthesis with contradiction/causal support.
- `ProjectResources.version=1` returns source-linked Articles/Areas with section/part destinations and link provenance.
- `app/journey-route.tsx` selects a fallback by saved checkpoint, most recent eligible Note, last opened step on this device or first Step. Ordinary synthetic exclusion is intentional. Contextual Question links initially carry Project/Step return context, but that navigation context can be dropped by subsequent Note/Library backlinks.
- `get_minamo_context`, exact record reads, `query_minamo_records`, Note editor/coordinator, existing Reader annotations, section/part/rendition anchors, revision-safe domain writes and explicit MCP command receipts are strong reuse candidates.

The current `ProjectOutline` and Project route are **not** required to remain the final Workbench taxonomy. They are a measurable compatibility baseline. Do not resurrect a graph/Atlas UI merely because the relationship graph exists.

## Proposed source-grounded read contract (v0, experimental)

Not a mandated DB schema. A server **read projection** can be assembled from current canonical records and existing scoped permissions, with an explicit derivation/version and coverage boundary.

```ts
type CanonicalRef = {
  family: 'journey'|'investigation'|'article'|'note'|'annotation'|'flag'|'source'|'experiment'|'run';
  id: string; rev: number; rendition?: string;
  anchor?: {sectionId: string; partId: string; start?: number; end?: number};
};
type EvidenceItem = {
  ref: CanonicalRef;
  speaker: 'learner'|'gpt'|'source'|'unknown';
  kind: 'reported-observation'|'supplied-output'|'source-assertion'|
        'verified-operation'|'hypothesis'|'decision'|'interpretation';
  recordedAt?: string; reportedEventAt?: string;
  detail: string; caveat?: string; verifies?: CanonicalRef[];
  // no 'verified-operation' without a scope-matching independent receipt
};
type CurrentConcern = {
  text: string; supporting: CanonicalRef[]; contradictedBy?: CanonicalRef[];
  unresolved: string[]; possibleNextActions: Array<{text:string; reasons: CanonicalRef[]}>;
  // proposed wording; never silently committed or given ungrounded certainty
};
type DecisionChange = {
  before: CanonicalRef[]; after: CanonicalRef[];
  reason: CanonicalRef[]; contradictions?: CanonicalRef[];
  interpretation?: string; explicitlyAuthored: boolean;
};
type ProjectWorkbenchRead = {
  version: 0; generation: string; project: CanonicalRef;
  current: CurrentConcern | null; evidence: EvidenceItem[];
  changes: DecisionChange[]; questions: CanonicalRef[];
  sources: CanonicalRef[]; checkpoints: CanonicalRef[];
  coverage: {complete:boolean; searchedDepth:number; omitted: number; reason?:string};
  generatedFrom: CanonicalRef[]; projectionVersion: string;
};
```

**Rule 1 — evidence before interpretation.** Every focus sentence, change, next option and contradiction must cite exact eligible record revisions and, when available, exact reading passages. A derived concern may be empty/uncertain. `verified-operation` requires a separate scope-matching receipt, never merely a user-reported command, supplied terminal text, a source file or a tool read.

**Rule 2 — event time is not record time.** In the V88 replay, many `createdAt` values are 31 October fixture-load timestamps, while fictional events in Note bodies refer to 1/6/26/28 October and 13/23 November. Do not sort a historical timeline solely by synthetic creation timestamps or silently parse prose dates as verified chronology. Use revision/recording order and explicitly authored event date as distinct, with provenance/uncertainty. A durable structured event-time extension is a *possible future* model change, requiring evidence/migration planning.

**Rule 3 — bounded causal closure.** Starting at Project, collect direct outgoing/incoming links and bounded Question→Note/Note→Note relations, with exact source/revision and deterministic ordering. Never infer a Note is relevant merely because its title resembles the Project. Exclude unrelated learning and other personas; enforce principal/owner/synthetic-admission rights before aggregation. Return truncation/coverage and a way to open omitted exact records. Under no circumstances broaden ordinary synthetic admission outside the owner-gated test comparison.

**Rule 4 — no hidden authoritative summary.** Derive the current concern from explicit learner history and source coverage; label GPT interpretations as interpretations and offer a review/correction route. Cache may be disposable, invalidated on relevant revision/links/permissions; it must not become the sole source of truth or an unreviewed generated checkpoint.

**Rule 5 — stable exact anchors.** Project/Question/Note/Article links preserve family, ID, revision/rendition, section/part, UTF-16 selection range where applicable, relation, return context and any source-rights restrictions. Historical revisions remain reachable even after a later decision supersedes them.

## Client interaction contract (shared by both candidate approaches)

```ts
type WorkbenchNavigationState = {
  projectId: string;
  selected: CanonicalRef | null;
  perspective: 'work'|'questions'|'evolution' | null;
  returnStack: Array<{selected: CanonicalRef|null; perspective: string|null; scrollKey?: string}>;
  drafts: Array<{noteId?:string; anchor?:CanonicalRef; localDraftKey:string; dirty:boolean}>;
  sourcePreview?: CanonicalRef;
};
```

- Treat this as **UI state**, not a new learner-record table. Restoration across a normal browser reload should preserve the selected item and draft through the real existing draft coordinator; use stable URL/route state for shareable exact selections and back/forward.
- A change of perspective must preserve selected source/revision, writing context, pending autosave/conflict and logical return position. Test direct incoming links, cross-Record backlinks and browser history, not only route entry from Project home.
- Embed the real Note editor through current identity/rights, auto-save, expected-revision/CAS, operation ID, conflict handling and readback. `Note on this passage` should be contextual and deliberately committed; no synthetic mock may count as persistence acceptance.
- GPT suggestions appear as proposed writing/updates with provenance and exact evidence; durable Minamo updates require explicit learner request/confirmation and canonical receipt plus readback. No automatic capture of unsaved chats.
- User controls disclosure. Uncertainty and original source are never hidden behind an inferred ability score or automatic rearrangement. On mobile, preserve readable primary work, a predictable evidence/Question affordance, draft continuity and return path without narrow sidebars.

## Identical task comparison: two genuinely different candidate interactions

Both must use the **same data, real Note operations and selected-object identity**. This is a *design task model*, not observed prototype performance.

| Scenario task | Candidate A — explicit Work / Questions / Evolution | Candidate B — fluid contextual workspace |
| --- | --- | --- |
| Weekend: identify newest untested refresh experiment despite checkpoint | Work shows current experiment and checkpoint separately; Question lens preserves selection | Current focus shows experiment, expands storage Question and older checkpoint in place |
| Provider sceptic: find earliest unsupported claim and actual source | Switch to Evolution to compare positions, then source reader; keep Question selected | Expand provenance trail alongside provider concern, then source reader |
| Sparse Cap: return without replaying expired instance or spoiling | Work opens permission/instance boundary; Evolution shows last valid evidence | Current investigation exposes expired-instance boundary first with optional history |
| Plant calibration: why 15% was abandoned and what to measure | Evolution exposes before/after with exact Notes; Work supplies next bench task | Inline turning-point disclosure under current calibration evidence |
| Cross-record Note/Library detour then return and write | Selected item and Note dock persist across perspectives/reader | Source/Question/Note appear in context with explicit close/return control |

### Candidate A: explicit perspectives

**Strengths:** predictable access to history/uncertainty; clear orientation for long histories, screen readers and keyboard; easier controlled comparison. **Failure modes:** mental fragmentation if tabs carry different selections, repeated summaries, mobile navigation cost; renaming existing Steps/Questions/Activity would fail the contract. **Proposed test:** switch Work→Evolution→Questions while a pinned Library passage is open and a dirty Note exists; verify no context or draft loss.

### Candidate B: fluid contextual workspace

**Strengths:** keeps a live concern, evidence and writing in one place; could reduce Question→Note→Library backtracking; fits non-linear practical projects and sparse records. **Failure modes:** hiding important older decisions, unpredictable auto-reorganisation, overwhelming nested disclosure, ambiguity about how to get back. **Proposed test:** open contradictory source inside current work, reveal why the old decision changed, then return to the exact selected Note; verify explicit disclosure controls and history visibility.

**Recommendation at this stage:** *do not declare a visual winner*. First implement a deliberately plain, reversible **shared functional vertical slice** on an isolated experiment route/flag, using real Minamo Note persistence and source revisions. Compare A and B as interaction alternatives around the same contract and the same difficult corpus tasks; they may differ in navigation structure and presentation, not data authority. If forced to prioritise research, trial B's contextual return path first as a challenge to the verified current-page detour, with A as a predictable control. This is a hypothesis awaiting owner UX judgement, not a release decision.

## Smallest meaningful experiment and test gates

1. **Read-model spike, synthetic-only:** in local/disposable D1, create a bounded Project context projection that retrieves the docs/sparse latest Question-linked Notes, retains exact pins, avoids unrelated/cross-persona records, lists coverage and never leaks to ordinary synthetic-excluded views. Golden-source assertions for all nine variants; negative rights/generation/conflict tests. Compare exact claims, missing/extra records, payload bytes and calls—not merely raw call counts.
2. **Plain real-persistence slice:** behind a reversible experimental route on a reviewed branch (not replacing live Project), open the weekend return, inspect a specific old decision and linked source, write a synthetic Note with real CAS/receipt/reload/conflict/recovery, switch perspective, preserve source and dirty draft, return. Extend to sparse Cap and careful calibrator before broader fidelity claims.
3. **A/B comparison on common tasks:** source-claim correctness, unsupported-assertion count, revision misattribution, actions/backtracks to evidence, lost return paths, edit persistence/dirty-draft loss, keyboard/focus and true 320–390px viewport. Log actual observation vs model inference separately.
4. **Independent GPT/MCP continuity gate:** nine authenticated fresh chats; each sees only its persona pin and exact current prompt, reconstructs independently, records provenance, and only saves when explicitly authorised. Pair declared attempts with server-observed calls/D1 diffs when appropriate. Host-completeness must stay qualified.
5. **Owner review before replacement:** evaluate lived usefulness, naturalness, accessible mobile focus and preserving proven Reader/Notes/source paths. Only then consider a substantial Project/Step/Question route/domain change. Any schema migration requires identity/revision/anchor mapping, backward-read/rollback, synthetic preservation test and separate explicit owner approval.

### Work that can be done without a schema migration

- Improve *derived* Project context closure, exact evidence links, continuation/current-concern display and return-stack semantics.
- Add source/provenance badge vocabulary tied to existing record/receipt scope, with explicit unknowns.
- Reuse Reader, linked Question/Library passages, Notes draft coordinator, revision-safe writes and MCP source-bound tools.
- Improve synthetic persona labels in owner-visible test list without changing real Project titles (test fixture discoverability).

### Changes that need deeper analysis or separate approval

- Speaker/claim-level structured provenance or explicit event-time capture if anchors to existing Notes cannot reliably represent the distinction.
- First-class semantic decision/contradiction relationships only when the nine-case read spike proves current links inadequate; maintain backwards compatibility.
- Any production D1 schema migration, replacement Project route, automatic GPT save, live Site deployment or real learner-data edit: **not commissioned here**.
- Final selection of A versus B and mobile interaction hierarchy: **owner judgement** after functional prototype observation.

## Acceptance does not mean a green-only matrix

A candidate fails if it invents physical execution from supplied bytes, calls a sketch a capture, labels a guess as verified, loses exact old source/revision, puts an expired lab instance back in focus, hides privacy/consent constraints, requires new status administration, loses a dirty Note, or produces a pretty but unpersisted mock. These are realistic negative cases derived from the nine versioned synthetic histories.
