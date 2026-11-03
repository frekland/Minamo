# GPT-composed Projects — implementation blueprint (draft)

**3 November 2026 · planning only · no application code or database migration in this PR.** Read the [product/experience brief](PROJECT-COMPOSITION-DESIGN-BRIEF-2026-11-03.md) first. V91 is the production baseline; V92–V98 are retained experiments, not implementation authority. This blueprint can be edited before the owner commissions code.

## Architecture in one sentence

GPT supplies **content and typed composition decisions through MCP**; Minamo owns **canonical data, validation, atomic writes and polished native layout rendering**. Project Stages are optional components of a larger composition, not the root schema of all learning.

## Reuse, don't replace

Verified existing source seams in the public application (reconfirm actual current branch before code edits):

- lib/contracts.ts — WorkspaceRecord, revisioned journey learningShape/stages, RecordLink, ContentPatch, operation receipts. Existing stages reference canonical section IDs; links may carry stage/section context.
- lib/project-contracts.ts and lib/learning-work.ts — read-only Project/Step/Question and continuation projections; retain eligible exact source relationships but do not require their old hierarchy as the new UI.
- lib/domain.ts, lib/domain-handler.ts, worker/index.ts — shared web/MCP validation, owner admission, read/write tools, CAS/operation handling.
- app/journey-route.tsx, app/project-context-client.ts, app/notes-panel.tsx, app/reader.tsx, app/learning-activity.tsx — existing Project, Note, source and Activity components/recovery. Prefer small reusable display adapters; keep the authentic Notes save coordinator.
- db/, drizzle/ — current revisioned D1 records; do not add a second disconnected authoritative history, summary or mastery store.
- docs/SITES-RELEASE-WORKFLOW.md — owner-authorised rapid Sites publishing, changed-path verification and reversible saved versions.

Existing preview/apply command, atomic authoring package and relationship support are donors; their raw whole-record editing API is not an adequate learner-facing Project-composition contract. A semantic MCP update should not require GPT to reconstruct an entire Journey with sections and links merely to reposition a block.

## Two coordinated models

**Canonical learning content:** existing owner-scoped records, evidence, renditions, timestamps, Notes, Activities, sources and revision history. May be created/revised through existing validated domain operations.

**Project composition:** a separate *versioned presentation document* describing how eligible content and short attributed editorial framing are arranged. It does not certify understanding or become the source of truth for original Notes.

Proposed contract sketch (to refine after bounded domain inspection):

~~~ts
type ProjectComposition = {
  version: 1;
  project: {family: 'journey'; id: string};
  compositionRev: number;
  layout: LayoutNode;
  blocks: ProjectBlock[];
  preferredFocusId?: string;
};

type LayoutNode = {
  id: string;
  pattern: 'dashboard'|'notebook'|'workbench'|'board'|'research'|'guide';
  slots: Array<{
    id: string;
    role: 'primary'|'secondary'|'sidebar'|'history'|'freeform';
    blockIds: string[];
    collapsed?: boolean;
  }>;
  children?: LayoutNode[];
};

type ProjectBlock = {
  id: string; // stable across reorders and small revisions
  kind: 'text'|'record-ref'|'code-output'|'table'|'media'|'question-task';
  title?: string;
  refs?: Array<{family: string; id: string; rev?: number; rendition?: string}>;
  content?: unknown; // bounded kind-specific data, not arbitrary HTML
  pinned?: boolean;
  hidden?: boolean;
  provenance?: 'learner-authored'|'gpt-interpretation'|'source-derived';
};
~~~

Design choices:
- A layout switch changes the composition manifest, **not source content**. Keep a revision history and exact restoring/preview path.
- Nested patterns and repeatable slots permit mixed sections without a bespoke page for every discipline.
- Missing/denied record refs render an honest unavailable state; never silently substitute a different source edition or leak private metadata.
- Content ref blocks should reuse canonical record IDs and exact editions; avoid content copies where an existing record is suitable.
- GPT-composed prose is bounded, clearly distinguishable from evidence, and may be edited/corrected independently.
- Stable block IDs, pinned/locked regions and a minimal structural diff prevent the Project from chaotically rearranging each update.
- Implementation may choose a validated Project metadata extension or a narrowly scoped D1 sidecar after inspecting actual record/command semantics. There is no pre-approved new status/Work table.

## Six layout implementations, not six superficial skins

Build a shared semantic component/layout renderer with responsive primitives (single-column, split, mosaic, flowing journal, board, guided sequence), then make all six named patterns meaningfully distinct.

| Template | Rendering/interaction focus | Small-screen requirement |
| --- | --- | --- |
| Dashboard | Current focus and selected significant content receive prominence; secondary panels compact | Single useful leading action/content, no card wall or horizontal overflow |
| Notebook | Mixed narrative, code/output and notes as an intelligible sequence | Full readable text, dates and source anchors, not compressed cards |
| Workbench | Related material side by side, e.g. code plus output plus interpretation | Sensible tab/stack order, source and draft context retained |
| Board | Flexible strands/cards without compulsory statuses | Scan/reorder with accessible alternative to drag |
| Research | Readings, source refs, questions, comparisons and uncertainty adjacent | Source-to-question transitions clear and reversible |
| Guide | Optional stages/steps using stable IDs, links and source blocks | No forced completion, easy skip/branch and return |

For every pattern: semantic headings, keyboard navigation, focus recovery, meaningful empty states, pinned sections, predictable link destinations and no project-level backend/debug jargon. Use existing design tokens; avoid creating a second CSS system. No invented learning achievements.

## MCP contract and conversation rules

Suggested new commands, intentionally few:

1. **get_project_composition** — exact current Project, composition revision, eligible linked material and bounded content/coverage, including pins and unsupported blocks.
2. **get_layout_capabilities** — versioned template registry, block capabilities, limits and rendering affordances; short enough for GPT to use without a huge tool schema.
3. **preview_project_update** — validate proposed new records/links, block/layout changes and permissions; return a concise structural/content diff, conflicts and likely visual effects. Read-only.
4. **apply_project_update** — one owner-directed transaction with immutable operationId, expectedProjectRev/expectedCompositionRev and any required exact source revisions; write canonical content and composition together or not at all. Return receipt, changed refs and Project URL.

Avoid turning these into ten specialised public MCP tools. Implement internal validators per block, slot and operation. Rely on existing auth and record-admission boundaries. If a multi-record atomic transaction is not compatible with the current code, prove it in a **short source spike**, then adjust the contract before pretending the new surface is atomic.

### User intent

- **"Update Minamo"** is sufficient instruction to produce a bounded useful update *based on the current chat and admitted Minamo context*. GPT may choose what was done, problems, sources, code and possible next actions, plus appropriate layout changes. It must not fabricate facts, mark mastery or silently trash originals.
- A conversation is not itself a host-visible server transcript. GPT supplies selected meaning and artifacts in the tool call; record whether claims are user-reported, source-derived or independently observed.
- Preserve existing positions and pins unless a meaningful content change justifies movement. Group/consolidate repeated developments; do not generate duplicate "learning update" cards.
- If user asks **"How should I lay this out?"**, GPT can propose alternatives with an optional typed recommendation result, and present choices naturally. ChatGPT-host rich interactive controls are an enhancement, **not required** or assumed to be forceable by the MCP server.
- Broad ordinary update consent does not cover removing historical evidence, unwinding rights or destructive changes. Ambiguous targets or major semantically consequential edits require explicit clarification.
- On uncertain network response retry identical operationId/payload and read receipt; do not start another save or silently claim success.
- Tool descriptions should have neutral evidence-first language, removing UI concepts "Checkpoint" and "Saved Learning" while preserving any necessary backwards-compatible internal APIs.

### Proposed request shape (illustrative)

~~~json
{
  "projectId": "networking",
  "expectedProjectRev": 12,
  "expectedCompositionRev": 3,
  "operationId": "unique-retry-stable-id",
  "intent": "owner-requested-conversational-update",
  "contentChanges": [
    {
      "kind": "note",
      "text": "Learner-reported investigation of TCP resets; causes not yet verified.",
      "relatedRefs": ["article:tcp-states"]
    }
  ],
  "compositionChanges": [
    {
      "op": "upsertBlock",
      "id": "tcp-failures",
      "kind": "question-task",
      "title": "Why do connections fail?"
    },
    {"op": "focusBlock", "id": "tcp-failures"}
  ]
}
~~~

JSON above is not an already-implemented API. Specific schema, value/size limits, source refs and relation operations must be selected and validated in code; do not expose an unbounded contentChanges:any write escape hatch.

## Required safeguards, implemented narrowly

- Same signed-in principal and rights-check path as ordinary Notes/MCP. No new sharing, external content import or unauthorised source extraction.
- CAS against both Project and composition state, conflict reporting, immutable receipts, idempotent retry and reversible prior layout.
- Atomic cross-record writes or explicit stop-and-revise if not feasible; no partial Project visible as a successful update.
- Old Journey/Step/deep links and saved Notes continue to open. Stages retain stable IDs when merely reordered; hide/archive view state rather than deleting linked evidence.
- Keep original section/rendition anchors and user text, even when GPT changes presentation.
- Prompt injection in Notes/source material must not become authority for MCP writes.
- Disallow arbitrary generated HTML, script, server execution or source-rights bypass. Future code execution belongs in a separate controlled runtime.
- No fabricated achieved/completed/verified status from chat descriptions. No learner-facing "Checkpoint", "Saved Learning" or backend/provenance chatter.

## Build plan — lean, deployable iterations

**A. Functional composition foundation.** Resolve storage choice and typed schema with one bounded source inspection. Add composition read/preview/apply semantics and a shared renderer using the six initial content primitives. Make Dashboard and Notebook useful with *real* mixed content; do not add fake data families.

**B. Layout breadth.** Complete Workbench, Board, Research and Guide using the same shared blocks/slots. Support nesting/mixed sections, responsive behaviour, pinning, layout comparison and restoration. Test the same Project across alternatives.

**C. Natural GPT update.** Finish MCP capability discovery, bounded conversational content/structure update, optional design advice and a concise receipt. Try live ordinary conversations (including a freeform Project, code/terminal work, language or hardware content, and an interrupted return), revise ergonomics promptly.

This is an implementation order, not a mandate to wait for completion of huge suites between every Sites version. Authorise and publish reversible candidate increments as soon as a native build and directly relevant invariants pass. Owner usability feedback determines what to improve.

## Tests and release policy — deliberately short

Under [SITES release workflow](SITES-RELEASE-WORKFLOW.md):

- **Docs-only PR:** check links/structure and write the PR. No package install, build, full suite or Site deployment.
- **Routine UI/layout candidate:** production build, focused changed-path smoke/assertions, check protected native source identity and audience/bindings, deploy and check published URL/status. Full pnpm test, full Playwright suites, nine synthetic histories and long acceptance reports are **not** release gates.
- **MCP persistence/atomic command change:** focused disposable-D1 transaction tests (success, CAS conflict, duplicate retry, denied owner, partial failure) plus build; no unrelated full corpus.
- **Auth/schema/recovery/permission change:** verify the directly affected safety invariants and stop on failures. Do not use the fast policy to justify unreviewed destructive migrations or identity changes.
- **After deploy:** one short authenticated Project read/write and MCP receipt readback, where relevant; note skipped checks honestly. If a serious issue occurs, revert to an immutable saved Sites version.

A brief release receipt is enough: public/native pins, focused checks, deployed version, audience/bindings unchanged and known limitations. Do not make a 30-minute full test run, broad public/native diff, multi-model handoff or cloud-browser marathon mandatory for routine owner-requested iterative production updates.

## Acceptance is product usefulness

Initial success is a coherent Project page that evolves after several natural GPT chats without making the learner organise records. Measure: unnecessary navigation, time to find current work/related evidence, unnecessary generated blocks, layout stability, correctness of unchanged originals, and ability to switch templates. Collect owner feedback early on the deployed candidate. Do not count schema pass or synthetic test count as proof of a better learning experience.

## Open decisions for the draft PR

- Presentation document storage and transaction integration.
- Exact block registry and permitted nesting.
- Initial layout defaults and when GPT may switch patterns automatically.
- Per-user/device versus shared layout/pin state.
- How a user sees meaningful changes without a "Saved Learning" area.
- Host optional rich recommendation UI versus always-conversational choice.
- Compatibility treatment for previous learning-developments data and older Project routes.

No coding, migration, merge or Sites publication is authorised by this document alone.
