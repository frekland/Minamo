# Minamo V2 — Integrated Educational Architecture and MCP Editorial Commission

**Owner-directed, source-mapped implementation specification · 21 October 2026**  
**Canonical code repository:** `frekland/minamo-v2` · **target:** existing owner-private Minamo V2 Site · **status of this PR:** planning/engineering instructions only, not implementation.  
**Entry point for Work:** `docs/learning-experience/WORK-SITES-HANDOFF.md`.

## 0. Mandate, precedence and strict scope

Implement one coherent correction to Minamo V2's **educational model, authoring governance, navigable learner experience, reusable Library and MCP workflow**. This replaces the mistaken pattern of "one long Journey plus one shallow Library article for every stage". It is NOT a mandate to add more text, create dozens of new items, rebuild the Site, or complete general V2 backlog.

**The owner's clarifications are binding:**
1. GPT should not be left to invent what a Library or Investigation means. **A versioned MCP/editorial policy must arbitrate substantive new content**, with explicit reuse-versus-create and record-role decisions, verifiable gates and meaningful feedback; a tool that only validates JSON is insufficient.
2. "No Mermaid" meant **a lack of useful diagrams/visual explanation generally**, not a demand to install Mermaid. Preserve and improve native graphics; choose appropriate safe diagram codecs only where they genuinely teach.
3. The **MCP optimisations in PR #14** are part of this same design: server-derived canonical content, bounded atomic packages, correctly placed relationships, concise previews, actionable errors, discovery and rendered authoring previews. They must not independently accelerate publication of pedagogically poor material.

**Execution authority:** use the **current** code and this document as the implementation baseline. Read `AGENTS.md`, `STATUS.md`, `docs/SOURCE-SYNCHRONISATION.md` and selected source/test files. This focused commission supersedes the instruction to execute unrelated issue #1 tasks during this Work run. Do **not** execute PR #12 or the merged semantic-retrieval work; do not resume unrelated recovery/media/upload tasks, general UX audits, or old V1 projects. Original `frekland/Minamo` and `frekland/cyber-learning` are read-only.

**PR coordination:** PR #14 is a **draft documentation-only proposal** at the observed baseline (two files, no runtime changes). Treat its commission as an *input specification*, not a parallel implementation. Implement the combined, reconciled requirements in **this integrated commission branch/PR**; do not independently execute or merge PR #14. Before touching overlapping files, check whether PR #14 acquired engineering changes, and reconcile those selectively without simultaneous edits or duplicated APIs. Leave PR #14 intact unless the owner separately requests closing it. This plan resolves scope conflicts in favour of **educational policy and learner outcomes**.

**Deliverable:** complete the implementation, tests, independent learner-quality corrections, verified merge and owner-private V2 deployment in one continuous commission once the release gates genuinely pass, with an honest acceptance package and staged *proposal-only* content migration. This direction supersedes earlier review-only/no-merge/no-deploy language **for this scoped application release only**. Do not automatically rewrite or delete genuine V2 learning records. Local synthetic fixtures are permitted.

### 0.1 Continuous agentic completion — authority and interruption rule

**The owner has authorised one end-to-end Work/Sites execution, not five requests for approval.** Phases A–E are internal engineering checkpoints, not pauses for owner acceptance. Independently plan, implement, reconcile changes, test, visually inspect, challenge results, repair defects, retest, complete the PR, and—when the release gates are verified—merge and publish the application to the existing owner-private V2 Site. Use delegated/subagent specialist review where available, with one agent accountable for the integrated result. Do not repeatedly ask the owner to choose routine implementation details, review intermediate screenshots, supply annotations, approve individual phase transitions or authorise ordinary fixes. Keep progress reporting concise and milestone-based; do not flood Work with per-file messages.

**The one anticipated owner action is an MCP plugin reinstall/reconnect or fresh-client confirmation if host-side propagation of changed tool definitions genuinely requires it.** Prepare, publish and verify every server/site change possible before requesting this. Make one precise request naming the plugin and required UI action, then resume the same commission after confirmation and prove the installed client can use the actual changed contract **through real test-only authoring and browser inspection of saved hosted V2 content**. Never claim source `tools/list` proves installed-client acceptance, and do not demand a reinstall unnecessarily. If the host prevents continuation across that interaction, persist a complete exact-head/receipt/checkpoint handoff for resumption without resetting completed work.

An unforeseen hard technical/security/access blocker is not permission to bypass rights or invent acceptance. Fix it independently if safely possible; otherwise retain verified work and explain the exact blocker. Lack of owner aesthetic feedback is **not** a technical blocker. Never silently broaden authority to production-content migration, external systems, private-data deletion or the excluded PRs.

### 0.2 Agent accountability for the finished learner experience

**Completion is an independently convincing learning experience, not feature coverage, screenshots, number of articles, or green CI alone.** The implementing agent owns quality from the initial design decisions through the final deployed experience. It must detect and correct poor interaction/educational choices without relying on the owner to find them afterwards.

- **Protect simplicity and feel:** compare working early V2 checkpoints (especially PRs #2, #6 and #10) against the actual redesigned journey/Library experience as evidence of usable patterns, not as an instruction to restore obsolete layouts. Prefer clear next action, immediate context, compact visual hierarchy, responsive reading and low cognitive load; eliminate needless panels, forms, repeated summaries and navigation hops.
- **Prove value independently:** in addition to scripted Sudoku/RPG fixtures, have a reviewer/agent unfamiliar with the implementation independently create and follow a *new, small* synthetic learning request, inspect reference usefulness, ask an open Investigation question, navigate across surfaces and judge whether each step genuinely helps them learn. The reviewer must be free to fail the design for confusion, redundancy, misleading explanations, weak sources, ugly/dense rendering or hollow examples.
- **Challenge the pedagogy:** assess depth, accuracy, useful code/commands, source provenance, visual explanatory value and generalisation between different projects—not simply presence of a diagram or link. Keep personal evidence empty until genuinely observed.
- **Close the loop:** maintain a concise findings → severity → corrective changes → re-test record. Fix significant confusion, misleading content, inaccessible paths, bad mobile reading and avoidable navigation friction before calling the commission complete. Reinspect actual rendered results after fixes. Do not relabel a known major defect as “needs owner judgement” to pass a gate.
- **Preserve established good behaviour:** test direct text-selection Flag/Annotate, saved annotations/Flags, rich Notes docking/continuity, retained exact-reading links, source permission floors, sensible visual density and responsive behaviour. Preserve V2's valid technical improvements without repeating its regressions.

The owner may later add browser annotations, but **they are optional feedback after the agent has performed its own critical review**, not a prerequisite for implementation or an excuse to defer quality accountability.

## 1. Verified baseline and failure diagnosis

### 1.1 Source and observed content (recheck on execution)

- At planning: GitHub `main` commit/tree `28a5558867dbbe90f934aead941a74273194452a`; independent Sites-native Git may differ. The installed V2 workspace declared `minamo-v2-2026-10-21.10` and generation `legacy@0`; this does **not** prove any newer release or client catalogue.
- Owner-private corpus observed via V2 read-only tools: **two project Journeys** (Sudoku GUI Solver, retro zombie-cat RPG), **22 project-specific Library articles** (ten Sudoku, twelve RPG), **two project-labelled Library areas**, and **zero Investigation records**. Existing personal telemetry material is separate and must be preserved.
- Some Library articles already contain code blocks and official documentation **link-only** references, and exact concept entries; saying "no code or sources exist" would be inaccurate. They are nonetheless insufficiently deep, badly organised, hard to discover and often a shallow parallel of a Journey.
- `app/workspace.tsx` uses a single responsive workspace for eight views. `app/reader.tsx` renders all Journey sections in one canonical reading with a basic "In this reading" section anchor list. A reading TOC is not a learner roadmap.
- `app/learning-links.tsx` groups Library articles by existing `area` links and shows large connection grids. With only two project-based areas the result is two project folders, not cross-project conceptual knowledge. `LearningConnections` deduplicates by `family:id` so distinct context/destination links to one target may collapse.
- `lib/contracts.ts` has `Journey`, `Investigation`, `Article`, `Area` all as generic `WorkspaceRecord` with `body`, `sections`, `links`. There is **no first-class stage/route or Investigation prompt semantics** in the persisted contract.
- `lib/domain.ts` and `lib/domain-handler.ts` validate owned records, parts, links, references, CAS, receipts, operations and editions; `lib/contracts.ts` has up to 40 `ConceptEntry` per Article with exact case-aware aliases. Editorial principles in `docs/core-learning-experience/CORE-LEARNING-EXPERIENCE.md` are **not an active V2 policy preflight/enforcement contract** for GPT editorial writes.
- `lib/diagrams.ts` plus `app/flow-diagram.tsx` safely render explicit bounded `flow-v1` acyclic graphs (desktop SVG, accessible phone cards) and preserve literal legacy diagrams. They do **not** support every visual relationship (cyclic state changes, a 9×9 grid, sequence of events). `app/reader.tsx` uses exact canonical diagram text/UTF-16 identity.
- `app/concepts.tsx` offers exact term/alias matches anchored into canonical Articles, but no sufficiently useful categorised command/function/API reference experience.
- Existing Flags, annotations, owner Notes, exact retained captures, source/asset eligibility and navigation must remain intact.

### 1.2 Root cause, not a cosmetic defect

The application treats its learning families as mostly differently labelled generic readings. The authoring client then fills Journeys and Library articles from the same stage outline, while the MCP domain approves structurally valid records with no enforced editorial discrimination. More writes/better schema validation alone will produce a **larger, tidier version of the same mess**. A wall of headings, tables and shallow summaries is not transformed into educational richness by adding cards or arbitrary diagrams.

The fix spans **policy → distinct structured purposes → contextual navigation → substantive reusable content → rich safe presentation → reliable publishing/verification**.

## 2. Product contract: three distinct jobs

| Surface | Question it answers | Durable content it owns | Must NOT become |
|---|---|---|---|
| **Journey** | "What am I building; what should I try next?" | Project overview, stable ordered stages, objectives, evidence checkpoints, optional paths, current-stage navigation and links to relevant reusable topics/Investigations | A huge scrollable textbook or a list of finished achievements |
| **Investigation** | "Why does this happen; how can I find out?" | One clear open question, optional hypotheses, suggested experiments and intentionally empty learner evidence/thinking space, links to multiple Journeys/topics | A pre-filled account of discoveries or mandatory assignment |
| **Library** | "What is this concept, function, command or mechanism, and how can I apply it elsewhere?" | Canonical cross-project topic explanation, code/syntax, meaningful diagrams, pitfalls, discriminating examples, authoritative source links, indexed entries | One lightly reworded article per Journey stage |

`Area` is a **cross-project subject grouping** (e.g. Python data structures, algorithms, desktop UI, testing), not a mandatory duplicate folder for each project. Articles can belong to multiple areas; group discovery must not require duplicating content.

The same "Python dictionaries" explanation can serve Sudoku, RPG and future projects. Project-specific design decisions stay in their Journey/Investigation. Source references remain visible and relevant where they substantiate a claim; they do not become unrelated filler.

## 3. Core architectural decision — typed learning surfaces over shared canonical reading

**Prefer small, backwards-compatible extensions**, not a separate learning engine or a new database for each UI screen.

### 3.1 Contract proposal

Extend `WorkspaceRecord` / `RecordData` in `lib/contracts.ts` with an optional versioned, family-specific **learning presentation contract**, discriminated by kind. Work may refine naming, but must preserve these semantics:

```ts
type LearningShape =
  | { version: 1; kind: 'journey';
      stages: { id: string; sectionId: string; title: string;
        intent: string; outcome: string; checkpoint: string;
        optional?: boolean; prerequisites?: string[];
        // Source-context links point to this stage, not a guessed target section.
      }[];
    }
  | { version: 1; kind: 'investigation';
      question: string; mode: 'suggested' | 'active';
      provenance: 'gpt-prompt' | 'owner-created';
      // Prompts are not user observations.
    }
  | { version: 1; kind: 'library-topic';
      subject: string; reusableBeyondProject: boolean;
      // The content remains in canonical sections/code/concepts.
    }
  | { version: 1; kind: 'area';
      subject: string; categoryPurpose: string;
    };
```

- Keep current `body`, `sections`, `concepts` and links as the **only authored reading text**. `stages[].sectionId` points into an existing `Journey` section; do NOT maintain duplicate editable stage prose in metadata.
- Stable stage IDs are owned by the Journey and do not change when titles are edited. Ordered lists are explicit; stage order is not inferred from creation timestamps or headings.
- Exact retained passage editions/hashes: new shape must participate in current-edition semantics where it affects reading. Use a versioned `renditionFor` projection for new shapes without altering old rendition hashes or rewriting saved `sections`/`PassageAnchor`. Regression-test historical records before storing new shape.
- Existing Journeys without `learningShape` remain fully readable. Offer non-mutating adapter navigation derived from existing sections; upgrade only through explicit, CAS-guarded owner-authorised edits.
- Investigation suggested prompts contain no filled-in hypothesis, observation, evidence result or achievement. The learner can open a suggestion and deliberately begin work, without an automatic write or false progress.
- If a simpler existing data representation satisfies all of these semantics, use it; do not add unnecessary schema fields merely to match the example.

### 3.2 Persistence

`v2_records` already stores structured JSON; prefer adding validated optional fields there before proposing new tables. Add a Drizzle migration only for truly needed indexed policy/receipt/relationship storage, with explicit ownership and recovery/export inclusion where appropriate.

Do not store copied HTML, generated screenshots, a second Markdown mirror, or a separate client-only progress truth. Indexed views may be derived, bounded and safely cached; canonical record text and activity remain in D1.

## 4. MCP editorial policy must arbitrate authoring

**This is the highest-priority systemic correction.** An author's judgement must be guided and audited by a **versioned server-owned policy**, not hidden exclusively in `AGENTS.md` or recalled only when a particular GPT remembers to ask.

### 4.1 Policy service and active authoring path

Implement `lib/editorial-policy.ts` (or equivalent) and a read-only `get_minamo_editorial_policy` MCP operation + authenticated HTTP equivalent:

```ts
type EditorialPolicyResponse = {
  policyVersion: string;
  applicability: 'gpt-learning-authoring';
  families: { journey: PolicyRole; investigation: PolicyRole;
              article: PolicyRole; area: PolicyRole };
  coverageProcedure: string;
  visualAndReferenceGuidance: string;
  safetyBoundaries: string;
  sourceUseRules: string;
};
```

Use a documented versioned policy definition, optionally owner-revisable only by a dedicated explicit, revision-guarded settings pathway; do not invent standing editorial authority from a Flag, an Annotation, an existing article or a search result. Record actual effective policy version in preview/receipt. Do not add background maintenance or an autonomous editorial bot.

**One authoring cycle**:

1. **Intent:** owner requests a project or question; GPT retrieves current editorial policy. State which type(s) of records are needed and why.
2. **Coverage:** scoped `query_minamo_records` / concept-match lookup of relevant existing topics and aliases; read promising Article **sections**, not only titles. Return bounded records and current revisions. "Same title" is a possible candidate, not evidence of conceptual equivalence.
3. **Decision:** for every proposed piece, declare `reuse-link`, `targeted-improve`, `create-distinct`, `suggest-investigation` or `no-write`; cite exact existing references and concise independent value. For Library additions, explain why this belongs in lasting reference coverage rather than a Journey stage.
4. **Compose:** propose Journey route, Investigation questions and canonical Library topics with specific source links, code/command examples and appropriate visuals. Separate GPT-authored illustration, checked external sources and owner-observed evidence.
5. **Editorial preflight:** a shared server validation operation checks structure, rights, specific linked records, overlaps, role differentiation and record-level metadata. It returns `block`/`needs-review`/`advisory` findings with exact paths and remediation. Do not block valid owner writing or force a new approval for routine safe narrow edits.
6. **Owner-directed commit:** once valid and within granted task scope, apply through the same guarded domain; read back and verify real rendered content, links and current policy version. An older policy version must require a fresh preview, not silently publish.
7. **Reflect:** record what was authored and what still needs human judgement; never mark tasks or Investigations complete from a save.

Sample manifest addition (conceptual, to refine against PR #14 package shape):

```ts
type EditorialIntent = {
  policyVersion: string;
  requestPurpose: string;
  coverage: { examined: { family: 'article' | 'area' | 'journey';
                         id: string; rev: number }[] };
  decisions: { recordKey: string;
    role: 'route' | 'open-question' | 'canonical-reference' | 'subject-area';
    action: 'reuse-link' | 'targeted-improve' | 'create-distinct'
          | 'suggest-investigation' | 'no-write';
    whyNotDuplicate: string;
    distinctEducationalValue: string;
  }[];
  sourcePlan: 'verified-official-links' | 'link-only-references'
              | 'original-no-external-claims';
};
```

**Important boundary:** no deterministic validator can prove that an explanation teaches well. Distinguish machine-checkable contract failures from evidence-based editorial warnings and a human/model judgement rubric. Do **not** disguise an LLM's self-attestation as proof of quality. Require meaningful distinctions, show closest existing coverage, and give explicit warnings when a Library mirrors a Journey, but do not equate similarity with duplication.

### 4.2 Enforce the policy where it matters

- Apply to **substantial new GPT-originated Journey/Investigation/Article/Area publication and wholesale replacement**, including old `apply_minamo_command` paths once the new policy-capable client is available. It must not be bypassable merely by choosing another GPT tool name.
- Use the authenticated server-determined actor (not a caller-supplied `actor`), `policyVersion`, current owner scope and a server-authoritative preview/commit recomputation. A preview token is not a bearer access grant or an authorisation substitute.
- Stage rollout: advisory in local tests → enforced for new GPT learning-package publication after current client compatibility is established. If a legacy installed writer cannot send the required editorial information, return an actionable `editorial_preflight_required` error rather than silently allowing poor large-scale new content. Maintain compatible read and small edit paths; owner-authored private Notes and free writing must remain frictionless.
- For a strong pattern such as twelve Journey stages each generating a same-purpose article and nothing reusable across projects, return a `journey_library_mirror` finding with affected record identities and a proposed consolidation route. That finding should block unreviewed bulk publication or require an explicit owner override, never automatically delete records.
- Incomplete source claims, "tested" results without evidence, unadmitted excerpts and false observed Runs remain hard security/evidence failures. Absence of a diagram or arbitrary article length is **not by itself** a rejection; diagram usefulness is judged by the content need, not a media quota.
- Preserve policy revision and editorial decision/provenance in secure operation metadata/audit, not noisy learner-facing boilerplate. Never expose private content in diagnostics/telemetry.

### 4.3 Editorial golden tests

Use real representative drafts in **local synthetic fixtures**:

- **Reject/revise**: an input Journey with ten companion Library articles that only repeat each step, area titled after the project, no independent concept coverage and no Investigation opportunities.
- **Accept**: one navigable Journey + reusable Library references to Python collections, Tkinter, recursion, search and testing + a small number of genuinely open optional Investigations, purposeful visuals and verified visible links.
- **Accept reuse**: RPG stage reuses a canonical Python dictionary/reference topic introduced for Sudoku; no duplicate page.
- **Reject fabricated evidence**: a suggested Investigation whose prose claims successful experiments or a pre-completed learner checkpoint.
- **Accept sparse mode**: a genuinely simple new topic can contain only the right explanation/example, without forced diagram/table.
- **Allow no-write**: content already covered sufficiently; return an exact link and helpful next step rather than publishing a new article.

## 5. Journeys — usable project routes, not books

Build a **Journey-specific view** in `app/workspace.tsx` and focused new components (e.g. `app/journey-route.tsx`) while retaining the same `Reader` for exact canonical material and capture.

### Required experience
- **Overview:** purpose, what the eventual working artefact does, expected environment, simple architecture visual, concise stage route and a clear **Start / Resume stage** action. Do not show a ten-article connection wall as the landing content.
- **Stage screen:** one current stage with (a) what/why, (b) concrete practical task, (c) suggested prediction/test/evidence, (d) directly relevant 1–3 links to *specific* reusable Library passages, (e) optional Investigation prompts, (f) previous/next stage. Longer background stays in Library.
- **Route/navigation:** stable stage IDs in a deep link (e.g. `?view=journeys&family=journey&id=...&stage=stage-id`), direct jump menu and explicit route map. Desktop may show persistent compact outline; on phone show a labelled stage switcher/breadcrumb. The user must be able to open a reading and return to **the same Journey stage** without scrolling/searching.
- **State:** "last opened" is navigation, **not completion**. Avoid automatic achievement, scores, streaks and rigid gates. Any optional "done" marker must be an explicit user action and not evidence that a test ran; first release may omit completion entirely.
- **Branching:** Investigations optional and linked to the exact relevant stage. A single Investigation may serve two Journeys; do not force duplicated investigations.
- **Compatibility:** old reading route and old anchors still work; old `sections` may be adapter-mapped without rewriting until reviewed. Deep-linking to a retained reading should preserve the edition and exact selection, not relocate captured text to a newer stage.

**Implementation caution:** currently `app/reader.tsx` renders all `article.sections` in one column and has a general-purpose `rn-contents` TOC; this can remain the article reader but must stop masquerading as full Journey navigation. Do not solve this with more accordion text or a visually decorative progress bar.

## 6. Investigations — genuine open inquiry

Use existing `family:'investigation'` and its multiple `links` rather than introducing a separate experiments product.

- Show a dedicated **Explore** entry point on the Journey stage; list a handful of valuable optional questions, but do not show blank or fake completed investigations as if genuine learner records exist.
- A suggested prompt shows one question, why it matters, **possible ways to investigate** (prediction, controlled input, source research, reasoning test), selected canonical links, and an obvious **Start investigating** action. No fabricated hypotheses/observations/conclusions.
- The active Investigation workspace should distinguish: **Question → tentative prediction/hypothesis → planned trial → actual observation/evidence → interpretation / open questions**. These are optional editable affordances, not mandatory wizard pages or separate progress achievements.
- Keep actual evidence in owner Notes/Run references or explicitly labelled repository links with honest execution provenance. A GPT explanation is not an observed Kali session. Allow reuse of the same Library explanation across different Investigations.
- Link from an Investigation back to the originating Journey stage(s), the reference topics, and personal Notes; no automatic transclusion of private prose into another record.
- Suggested prompts are GPT-authored original material (not a learner's completed Investigation). Visibly distinguish `suggested` from `active`; creating/opening a suggestion cannot count as observed practice.

**Golden starter inquiries** (original prompts, *not solved outcomes*):
- Sudoku: *Why can a conflict-free partial puzzle still be unsatisfiable?* and *What information must backtracking undo when an earlier guess fails?*
- Tkinter: *What makes an interactive window stop responding during a long callback?*
- RPG: *Why does modelling rooms as a graph help when routes can loop?*

## 7. Library — independent technical reference and command discovery

### 7.1 Reorganise by concepts, not generated stage order

Rework `LibraryIndex` in `app/learning-links.tsx` into reusable **subject-area → topic → entries/source** browsing. Initial subject areas should be broad and applicable across projects, for example **Python language/data**, **Algorithms and problem-solving**, **Desktop interfaces**, and **Testing and software engineering**. These are examples, not an enforced universal taxonomy.

A canonical Article should give:
- One **substantial independent explanation** of the idea/mechanism, what assumptions it makes and when to use it.
- Concrete **syntax/code and commands with behaviour explained**, not a redundant exercise copied from a stage. Code is copyable and labelled illustrative until tested.
- A **meaningful** diagram/board/state/process visual where the concept warrants it, with human-readable alternative/fallback.
- Common traps and contrasting examples (e.g. list aliasing versus independent row copies).
- Visible **primary external reference(s)** or relevant exact source, labelled honestly as linked-only, inspected and/or permitted excerpt. Source cards should sit near the claim they support when appropriate, not only an unexplained "Further reading" appendix.
- Useful related Topics, Investigations and Journeys, presented as bounded purposeful links (avoid a wall of every backlink).

Substantial reference coverage should allow a learner to arrive directly from search and understand the topic **without reading the originating Journey**.

### 7.2 Canonical function, command and API entries

Build on the existing `ConceptEntry` / `ConceptEditor` rather than creating a second competing index. Add a backwards-compatible `kind` (default `concept`; alternatives `python-function`, `shell-command`, `api`, `language-syntax`), optional `signature` / `usage`, `environment`, `examplePartId` and eligible source/ref metadata when useful. Each entry is **an index into an existing Article section/code block**, never a duplicate mini-article.

- Retain case-sensitive exact term/alias semantics and existing ambiguity results; never normalise away shell flags, Python punctuation or UTF-16 distinctions.
- Add a browse/search surface for "Concepts", "Functions & APIs", "Commands", filterable by environment. A direct term lookup should show the signature, a concise meaning, one safe short example and **Open full explanation**.
- Initial verified examples: `python3 -m tkinter`, `python3 -m unittest`, `ttk.Entry`, `root.mainloop()`, `grid()`, `list.copy()`, `set.difference()`, `random.Random`, `json.load`. Choose correct names and contextual documentation, not fabricated syntax.
- Quick copy should copy **the original exact authored code** with clear context; never auto-execute a command by clicking its reference.
- A new Journey may link to an existing command/function entry by exact identity. No need to produce a separate stage-specific article.

### 7.3 Source integration, rights and provenance

Use official/reference material where appropriate (for the Sudoku pilot, Python's documentation for `tkinter`, `ttk`, `unittest`, language data structures/control flow; for RPG, `random`, `json`, `pathlib`). Recommended foundational URLs are link-only until their current target is actually retrieved/inspected and should not be described as verified text prematurely:

- `https://docs.python.org/3/library/tkinter.html`
- `https://docs.python.org/3/library/tkinter.ttk.html`
- `https://docs.python.org/3/library/unittest.html`
- `https://docs.python.org/3/tutorial/datastructures.html`
- `https://docs.python.org/3/library/random.html`
- `https://docs.python.org/3/library/json.html`

Authoring policy must distinguish a link, source inspected and documented, admitted licensed excerpt, GPT-original explanation, and actual learner execution. Preserve Source revocation and permission floors, and never import whole copyrighted pages merely because linked publicly. Do not claim a repository commit was executed merely because a URL exists.

### 7.4 Library navigation at scale

- One clear subject-area index, topic discovery, exact command entry lookup and obvious return path to current stage/Investigation.
- Reverse relationships must not be silently collapsed when two different source-stage connections point to the same target. Index by meaningful **relation identity/source context**, not merely target `family:id`.
- Support multi-area membership, targeted queries and pagination; no assumption that the first workspace page contains the full corpus.
- No manual mirror-writing of backlinks or copying source text to populate an index. Use authoritative relationships and bounded server projections.

## 8. Visual learning: diagrams, code and sources without decoration

### 8.1 Extend safe diagram capability where explanatory needs justify it

**Do not require Mermaid.** Continue using existing `flow-v1` (exact DAG, branch fidelity, accessible phone cards) for valid acyclic processes. Add **two bounded structured codecs** as the pilot's minimum if evidence confirms no equivalent implementation exists:

1. `grid-v1`: labelled 9×9 or other bounded grid for Sudoku cells/regions, coordinate highlights and candidate reasoning; pure semantic table/grid DOM plus accessible row/column descriptions and canonical text projection. No editable gameplay renderer required.
2. `state-v1` (or equivalently bounded state/transition representation): named states and explicit labelled transitions **including cycles**, suited to GUI states, RPG world transitions and solver recursion/rollback. Render safely with understandable nodes and edges, plus a complete accessible transition list.

A bounded sequence/call-tree diagram may be added only if the pilot demonstrates a need not satisfied by the first two; no arbitrary DSL/parser installation simply to boost diagram counts. If evaluating Mermaid later, document CSP/XSS/sanitisation, client bundle, SSR/hydration, canonical text and accessibility consequences before admitting it. Never execute submitted HTML/SVG scripts, arbitrary iframes or remote Mermaid render services.

Preserve existing `flow-v1`/legacy authored diagrams and previously saved selections. Codec versions define deterministic canonical text, stable block identities and safe readbacks; the web reader, MCP projection, editor preview, history and export must agree.

### 8.2 Reader/editor design requirements

- A relevant visual belongs beside the explanation it makes clearer, with title/legend, accessible text alternative, zoom/enlarge when helpful and a clear return to reading.
- Code blocks use the existing CodeMirror syntax support and code-copy affordances; small textual explanations and comments should clarify **why** rather than flood with finished project code.
- Figures, concise callouts and visual architecture help break dense text; do not add decorative cards, empty graphics, forced tables or arbitrary "one diagram per article" rules.
- Test 320 px and 390 px viewports, desktop, keyboard focus, zoom, selection and horizontal overflow. Do not let diagram overlays or table scrolls break saved Flag/Annotation mapping or Notes docking.
- Rendered authoring preview must show the same canonical representation as the committed reader. It must not create a fake selected passage before there is a retained edition.

## 9. Integrate all MCP optimisation requirements from PR #14

These are **dependencies of correct educational authoring**, not a competing feature branch.

### 9.1 Canonical author-input compiler
- Shared `lib/domain.ts` + `lib/contracts.ts` + `lib/domain-handler.ts` pipeline derives canonical `PassagePart.text` from valid structured table, diagram and eligible image/media metadata when omitted on `create`, replacement, `insertBlock` and `patchBlock`.
- Explicitly supplied conflicting text must reject with a field-specific `noncanonical_*` error. Keep existing old representations byte-for-byte, including old UTF-16 table cell maps and rendition hashes.
- Do not invent a diagram structure from legacy prose or fetch/extract media bytes.

### 9.2 Bounded **atomic** learning-package authoring
- Shared owner-scoped preview/apply exposed to web and MCP, not a loop around twelve single-record writes.
- A manifest can create/update a Journey, original Articles, Areas and optional **suggested** Investigations together, with explicit internal IDs/dependencies and reciprocal, purposeful relationships. Initial target supports 12-record Sudoku-shaped fixture; suggested cap 16 records, 64 relationships within measured 220 KB budget (adjust only with documented evidence).
- Preflight **first**: policy role/coverage, canonical blocks, current owner/Source eligibility, internal/external link/rendition resolution, per-record revision/generation CAS, budgets, server-determined provenance. Then one actual D1 atomic transaction for records, histories, activities and operation receipt.
- Atomic means invalid or stale member produces **zero partial writes**; tests must inject failed member #11, stale target, generation swap and transaction failure. Same operation ID/payload converges to one result, mismatch rejects; uncertain result inspectable through `read_minamo_operation`.
- Responses default to compact receipt refs/revisions/deep links and concise quality diagnostics; no huge full-body echo. Optional owner-authenticated detailed preview. No auto-creation of true practice observations.

### 9.3 First-class **source-stage → target-passage** relationship
- Current `RecordLink.sectionId/partId/rendition` are *destination* coordinates. Do not reinterpret them.
- Add stable contextual relation identity and explicit source `{family,id,sectionId / stageId}` separated from target `{family,id,optional rendition,optional sectionId/partId}`. Allow package-internal targets whose prospective rendition is compiler-derived. Existing target pinned editions remain guarded.
- Show the link inside the *right Journey stage/Investigation*; if that section moves or disappears, validate and give an actionable repair rather than silently relocating. Preserve all old record-level links and saved history.

### 9.4 Compact, actionable tooling
- Reuse bounded literal/concept queries to discover existing coverage; no semantic-index/embedding/project #12 work.
- Separate small purpose-specific authoring schemas: policy read, focused coverage suggestions, package preview/apply/status; preserve existing `apply_minamo_command` for compatible legacy/narrow edits.
- Return validation codes **with precise paths**, e.g. `records[3].data.sections[1].parts[2].reference.url`, without echoing secret/private source text. Distinguish shape, policy, stale revision, wrong owner/source eligibility and missing external links.
- Policy must be enforced in **all substantial GPT educational creation paths** after safe client rollout, not only in one shiny new tool. Preserve user manual editing, owner authority and current read paths.
- Read-only rendered preflight with actual components and safe links, never a dummy aesthetic mockup.
- Confirm actual **installed** GPT plugin catalogue after an authorised release; source `tools/list` alone is not client acceptance.

### 9.5 Security boundaries inherited unchanged
Owner private identity and D1 namespace; current generation and permission-floor fences; revision guards and idempotent receipts; retained editions; exact UTF-16 selectors and source revocation; Notes drafts; source and asset rights; browser/nonbrowser test separation. Nothing from this package grants unattended editorial maintenance.

## 10. Existing Sudoku/RPG content: remediate, don't multiply

**Do not delete or wholesale rewrite the observed private corpus in the implementation PR.** It contains GPT content but may have been read/Flagged/annotated or externally linked; previous editions and return links must survive.

After the new UX/policy works on synthetic data:

1. Build a read-only **editorial coverage inventory**: family/ID/rev, title, true explanatory scope, referenced syntax/concepts, external sources, related Journeys, overlap candidates, existing personal capture dependencies. The existing 22 stage-shaped articles are **candidates** for restructuring, not automatically redundant.
2. Propose an **owner-reviewable disposition** for each: retain and deepen as a canonical topic; reuse as project-specific context in Journey/Investigation; consolidate into an already-owned topic through versioned targeted edits; mark an obsolete article as **superseded** with a visible canonical successor; or leave unchanged. Do not collapse different genuine concepts just because their titles look similar.
3. Provide a mapping from every existing Journey stage to retained/new canonical article sections and optional genuine Investigation prompts. Prefer reusing the same reference from both projects rather than creating a second article.
4. Preserve family/ID/rev/rendition history, Flags and annotations, Notes, return links and source permissions. "Superseded" is **not Trash**: allow safe direct old links and clear newer-canonical navigation. Do not silently rewrite existing historical captures or delete personal records.
5. Require a versioned preview with prospective before/after screenshots on desktop/mobile and a concise diff. Production migration is a **separately authorised owner decision**, not implicit in an engineering build. No mass delete, schema reset or activating recovery over real data.

### Suggested initial canonical topic coverage

**Sudoku:** nested lists and coordinate mapping; sets and candidate elimination; Sudoku constraints; recursion and backtracking; Tkinter event loop/Entries; unit tests.  
**RPG reuse and additions:** dictionaries and structured state; text command parsing; state machines and graphs; `random.Random` and reproducible choices; `json`/`pathlib` persistence; tests.  
**Avoid:** ten generic Library pages that say "Stage n teaches X; now try X."

## 11. Acceptance walkthrough — demonstrate learning usefulness

**Golden owner-style task:** "I want to learn to build a Python Sudoku GUI Solver. Create a Journey, relevant Library references and optional Investigations." The following **observable** actions must work:

| ID | Required result |
|---|---|
| EDU-01 | From a fresh account/demo workspace the owner sees one coherent Journey with a visible *Start* path, stage list, stage objective and previous/next; no initial 10-article wall |
| EDU-02 | Open Stage 3, enter an Article's exact relevant section, return to **Stage 3** on desktop and Pixel-class phone; no lost Notes, selection or stage |
| EDU-03 | Stage offers a relevant Investigation question; entering it exposes prediction/experiment opportunities, **zero pre-filled observed results** and a route back |
| EDU-04 | Library browses independently by reusable topic, and the same "Python dictionaries" Article is reached appropriately from Sudoku and RPG contexts without copies |
| EDU-05 | Searching `python3 -m tkinter`, `ttk.Entry` and `list.copy()` reveals an accurate canonical syntax/command entry, explanation, appropriate example, and relevant official source |
| EDU-06 | A meaningful board/grid visual and a cyclic algorithm/state visual render correctly, with complete labelled source, responsive layout and accessible textual alternative; no insistence on Mermaid |
| EDU-07 | External source link explicitly states owner/reference, what it adds and source-use state. Unretrieved links are not claimed verified; missing/revoked references do not leak content |
| EDU-08 | GPT proposes the old pattern (Journey stage + shallow same-stage Library article repeated ten times); current policy preflight raises explicit role-mismatch/duplication guidance rather than silently publishing |
| EDU-09 | GPT proposes reusable topic additions and question-led Investigations; policy returns accepted/needs-review decisions grounded in inspected existing coverage, including `no-write` where appropriate |
| EDU-10 | Applying one bounded synthetic 12-record package saves all records/relations/receipt atomically; failed member or stale generation yields none; same operation retry is safe |
| EDU-11 | Rich code, table and diagram metadata round-trip through real MCP + web without redundant author-supplied canonical text; explicit contradictory text rejects with exact field path |
| EDU-12 | Existing V2 retained Sudoku/rich passage renditions, Flag/Annotate actions, Note docking, source rights, concepts, other Journeys and recovery tests remain intact |
| EDU-13 | Read-only proposed before/after coverage map for all 22 existing stage-shaped articles, with a reversible documented migration and **no live modifications** |
| EDU-14 | Actual 320px, 390px, desktop and keyboard navigation review; manual browser evidence distinguishes synthetic fixture UI from authenticated deployed-owner acceptance |
| EDU-15 | `pnpm run typecheck`, `pnpm run build` and `pnpm test` pass with source-mapped regressions; avoid claiming a new installed MCP schema until confirmed in a live installed client |
| EDU-16 | Navigation/accessibility test with an empty corpus offers a coherent create/start path; larger paginated corpus doesn't silently hide the right result or double-render incoming relationships |
| EDU-17 | Independent *unscripted* learner/authoring challenge beyond the rehearsed Sudoku/RPG golden paths demonstrates an understandable route, independent practical reference depth, optional honest inquiry, reuse and effective retrieval. Reviewer records meaningful shortcomings and the implementing agent fixes and reruns failures rather than requesting owner instruction |
| EDU-18 | Critical visual/interaction comparison with useful earlier V2 patterns proves the new experience is simpler and more navigable, not merely more feature-complete. Real desktop/phone evidence demonstrates no regressions in Flag/Annotate selection, exact return, Notes continuity, code/visual legibility and focused Journey/Library discovery |
| EDU-19 | **Mandatory post-deploy installed-plugin/live-site quality gate:** installed ChatGPT Minamo V2 MCP authors a new bounded TEST ONLY Journey/reference/Investigation package into the *actual* private V2 namespace; server policy, preview, atomic save/receipt, live readback and deep links work; an independent reviewer examines the *saved content in the authenticated production website* on desktop/mobile viewport, identifies pedagogical and UI shortcomings, and agent fixes/redeploys/repeats material failures |
| EDU-20 | **Mandatory reversible live test cleanup:** exact test record IDs/revisions/operation receipts and read-only genuine-content baseline captured before writing; agent recoverably Trashes only its synthetic PR15 records, verifies no active synthetic content/remnant relationships, and proves genuine records/settings unchanged; durable tombstones and receipts are disclosed rather than erased |

At least one **independent critical teaching review** must try to use the Journey and Library without reading the engineering implementation notes. Include the separate unscripted authoring/learner challenge from EDU-17, not just a rehearsal of the supplied fixtures. The review must be capable of failing for actual confusion or lack of educational value, not just missing elements. Record findings, fix significant issues and retest within this same run. Later owner preference feedback remains welcome, but is not a mandatory quality gate or an excuse to stop an otherwise executable commission.

## 12. Implementation sequence and deliverable boundaries

Keep a single integrated branch/PR, with coherent commits and no unrelated work. Work can parallelise **non-overlapping** focused code reviews, unscripted learner assessment and fixtures; integrate all writes centrally. **Continue automatically from phase to phase and repair problems as they emerge; do not wait for new owner input.**

### Phase A — baseline and educational policy (blocking foundation)
- Reconcile actual latest main/native V2 source, PR #14 changes (if any), Site/client generation and contract, issue #1 constraints.
- Reproduce old mirrored Journey/Library failure as *local synthetic* fixtures; capture source-mapped audit and baseline visual proof.
- Implement the versioned policy service, role differentiation, coverage/preflight decisions and actionable feedback. Test negative/positive rubric cases **before** enabling a bulk publisher.
- No actual production learner writes.

### Phase B — typed roles and navigation
- Add versioned optional Journey stages, Investigation prompts and cross-project subject-area contract with old-record fallback.
- Build a clean Stage view, overview/next/previous/breadcrumb/return context and Investigation explorer using the existing reading and Note infrastructure.
- Verify keyboard, phone/desktop and exact history/Flag/Annotation continuity.
- A stage may be a one-screen task, not a tiny summary of an article.

### Phase C — substantive Library and rich visual/reference model
- Extend canonical topic/command index and subject navigation; correct relationship identity and multi-area refs; integrate source card semantics.
- Add only the **necessary** safe diagram codecs, preserve old diagrams/canonical offsets, and verify genuine visual use in representative pages.
- Build a small, *substantial* canonical Sudoku+RPG shared reference fixture. Do not create a 22-page wall.

### Phase D — integrated MCP authoring from PR #14
- Implement the canonical compiler, owner-scoped atomic package/receipt, source-stage links, compact previews and diagnostics under the same policy and current generation/CAS/security.
- Deliver small discoverable tools and real rendered authoring preview. Test old-client compatibility and what installed clients actually expose.
- Prove bad "Journey mirrored into Library" package receives editorial findings and cannot circumvent policy through the old GPT authoring path.

### Phase E — holistic tests, independent quality challenge and safe content remediation proposal
- Execute EDU-01..EDU-18 **before release** against actual V2 component/domain/Worker/Miniflare implementations, including browser and responsive checks and a fresh unscripted learning challenge. After verified application deployment, **EDU-19 and EDU-20** separately require an installed-MCP-to-hosted-website content test and verified recoverable cleanup.
- Produce a source-mapped **22-item current content disposition map**, reversible staged rewrite examples and visual before/after comparisons. Leave live items unchanged.
- Run typecheck, build, full tests, GitHub CI and exact native/GitHub source-tree reconciliation according to `docs/SOURCE-SYNCHRONISATION.md` when appropriate.
- Commit implementation, tests, fixture content and evidence to this single PR and provide a concise summary with what is verified/unverified.

### Mandatory post-deploy acceptance — installed MCP → saved content → real website

**These are final acceptance gates distinct from pre-release verification.** Once EDU-01..EDU-18, security/recovery regression checks, source reconciliation, CI and independent local/browser teaching review pass, autonomously merge and publish the scoped application to the existing owner-private V2 Site. Verify live source/hash, owner access, private-record preservation and fallback. **Deployment is not commission completion.** Perform EDU-19 and EDU-20 against that actual hosted release, not a mock, local fixture, direct HTTP substitute or server `tools/list` alone.

1. **Safe baseline and manifest:** Read deployed version/generation, real installed ChatGPT Minamo V2 plugin tool names/schema, and existing owned collection IDs/revisions to establish a read-only genuine-content baseline. Before writing, verify that existing guarded recoverable Trash/cleanup can target exact test record IDs. Reserve unique obvious `TEST ONLY — PR15` IDs/titles and immutable operation IDs. Keep an exact test ledger; do not use existing personal records as scratch space.
2. **Author through the installed client:** An independent agent unfamiliar with the implementation selects a fresh, bounded technical learning request beyond the rehearsed Sudoku/RPG examples, such as a Python CLI log summariser. Use the **actual installed Minamo V2 MCP tools exposed to ChatGPT** for editorial policy, literal coverage discovery, preview and atomic application. Save a small coherent package (for example, one Journey, two substantial reusable Library Articles, one genuine optional unanswered Investigation, and an Area only if justified) with specific contextual links, meaningful code/command reference, useful visual where appropriate and honestly labelled external sources. Confirm receipts, canonical/edition readbacks, actual policy arbitration and cross-context reuse. Existing coverage may yield a `no-write` decision. Direct Worker/HTTP calls may supplement but cannot replace installed-plugin proof.
3. **Review the actual saved website:** Using the authenticated cloud browser, open the exact saved deep links in the *owner-private production V2 Site*. Independently judge first action, stage navigation, technical-reference depth, code copying, useful diagrams and source links, optional Investigation with **no invented observations**, commands search and exact return to the originating stage. Test real desktop and 390px responsive/Pixel-class viewport, keyboard paths, Flag/Annotate/Notes continuity **without changing genuine marks or Notes**. Capture truthful rendered evidence; viewport emulation is not proof of physical Android acceptance.
4. **Fix and repeat:** Give the independent reviewer authority to fail for shallow/repetitive content, policy bypass, misleading claims, confusing information architecture, unattractive density, unusable navigation or broken interactions even if CI passes. Resolve significant defects in code, authored policy or UX; run affected regression/CI checks, safely redeploy and repeat the **installed-MCP-to-real-hosted-page** workflow. Do not outsource ordinary educational judgement to owner annotations.
5. **Recoverable cleanup and verification:** Only after readback and review, recoverably Trash/retire the *exact recorded TEST ONLY PR15 records* in a safe dependency order using authenticated guarded CAS/current-generation operations. Verify there are no active test records or orphaned test relationships and compare all genuine record IDs/revisions and protected settings against the baseline. Do not hard-delete, reset D1, activate recovery, bulk-clean by title pattern, erase tombstones/receipts, or modify anything not created for this exercise. Report remaining immutable history/receipts and any cleanup inability precisely.

**Explicit narrow owner authorisation:** A bounded live post-deploy creation/inspection/targeted correction/recoverable cleanup of uniquely identified synthetic PR15 records **in the actual private V2 workspace** is approved for this acceptance test. Pre-release engineering fixtures remain local/synthetic. This does **not** grant authority to rewrite, Trash, consolidate or migrate any of the existing 22 Library articles, genuine Journeys/Investigations, Notes, Flags, annotations, Runs, learner evidence, source permissions, settings or unrelated data.

**Plugin reinstall exception:** If changed MCP definitions require a genuine user-side reinstall/reconnect, first complete and verify all possible server/app work, then request only that intervention and continue in the same Work commission. If the installed plugin or authenticated browser remains unavailable, document exact version/manifest/checkpoint and mark EDU-19/20 **blocked/unverified**, not passed. Never substitute a pretend installed-client run or assert completion. Distinguish separately in the final report: application deployment, installed plugin acceptance, hosted learner-quality pass, test cleanup, and untouched private corpus.

## 13. Source map and code ownership

| Responsibility | Current source / likely change |
|---|---|
| Editorial policy, preflight, evidence classification | **New** `lib/editorial-policy.ts` and bounded tests; integrate `lib/domain.ts` and `lib/domain-handler.ts` |
| Typed learning role and commands/contracts | `lib/contracts.ts`, `lib/domain.ts`, `db/schema.ts` migration only if needed; `lib/generations.ts` guard |
| Journey route and stage UI | `app/workspace.tsx` + new focused `app/journey-route.tsx` / CSS; reuse `app/reader.tsx` and `lib/reading-links.ts` |
| Investigations | Existing `investigation` family and general Reader; small focused `app/investigation-workspace.tsx`, without pretending to have observed Runs |
| Library subject index, reusable links | `app/learning-links.tsx`, `app/concepts.tsx`, `lib/reading-links.ts`, `lib/domain.ts` query/context; no duplicate record ownership |
| Commands and function entries | Existing `ConceptEntry` / `app/rich-authoring.tsx` / `app/concepts.tsx`, bounded extended schema |
| Diagrams and canonical source | `lib/diagrams.ts`, `app/flow-diagram.tsx`, `app/diagram-authoring.tsx`, `app/reader.tsx`, optionally additional safe codecs/components |
| Atomic authoring packages and validation | PR #14 engineering spec, `lib/domain.ts`, `lib/domain-handler.ts`, `lib/contracts.ts`; owner-scoped D1 operation/revision tables |
| Source/reference rights | Existing `lib/domain.ts` source admission, `app/source-reference.tsx`, `docs/SOURCE-SYNCHRONISATION.md`; no new remote import |
| Regression test foundation | `tests/domain-rich-integration.test.mjs`, `tests/domain-diagrams.test.mjs`, `tests/domain-concepts.test.mjs`, `tests/domain-reading-families.test.mjs`, `tests/gpt-context.test.mjs`, `tests/reading-interactions.test.mjs`, `tests/security-rich-content.test.mjs`, `tests/interaction-regression-integration.test.mjs`, `tests/built-worker.test.mjs` and dedicated new policy/package/route tests |

**Maintainable result:** educational policy and direct learner workflow are primary. Atomic MCP authoring and richer rendering are supporting infrastructure. Do not reverse that dependency again.

---

## Implementation authority summary

- **Implement and complete autonomously:** all phases A–E, independent educational/UX quality challenges, corrective iterations, verified PR merge, safe owner-private V2 app deployment, **EDU-19 installed plugin → live saved content → hosted browser assessment and EDU-20 guarded cleanup**, after any genuinely necessary owner plugin reinstall.
- **Do not separately execute:** PR #14's old isolated handoff or PR #12 semantic search, or unrelated issue #1 backlog.
- **Do not touch:** original Minamo/cyber-learning, genuine production learning records, source permissions or unrelated deployment surfaces; only the verified scoped V2 application release and bounded recoverable PR15 TEST ONLY live exercise are authorised.
- **Do not claim:** article count or passing schema tests means educational usefulness, installed MCP contract parity without client verification, physical-device confirmation, genuine Python execution, owner aesthetic endorsement or remediation of untouched private articles.

