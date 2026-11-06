# Minamo Lab Integration — proposed production continuity contract

**Status:** Planning document, 6 November 2026. **No implementation or deployment authorization is implied by this document.** Companion: [A1–A4 evidence and handoff](2026-11-06-visual-lab-a1-a4-evidence-handoff.md).

## Decision in brief

**Recommended path:** Finish owner review of A4 in the existing separate Visual Lab; then selectively integrate its **reversible, opt-in view** into Minamo’s actual protected native Site source, preserving Classic and the existing six layouts. Extend Minamo’s **existing** server and MCP Project contracts in narrowly scoped increments. Test the complete loop on labelled TEST Projects in the real application.

**Do not** build a second, production-shaped MCP/backend inside the Lab. That duplicates data/security/transaction logic, invites divergent interfaces and still cannot prove true production GPT continuity. The Lab should remain a fast, isolated presentation and synthetic-scale test bed; only verified designs and appropriately adapted components cross the boundary.

The integration is **not** a wholesale source copy: Lab code and fixtures are not production-native equivalents. Pin and inspect both sources first, and follow the reconciliation guidance in [V116 public/native differences](../V116-PUBLIC-SOURCE-RECONCILIATION-2026-11-05.md).

## Core behavior to protect

A Project is the current coherent collection of learner-directed work, not a transcript or an automatically extended calendar of lessons. The learner and GPT can continue, correct, rearrange or archive parts. Real saved revisions remain recoverable but do not dominate the reading experience. No interface claims a topic was understood or an exercise completed merely because content was generated, viewed or saved.

Preserve stable Project, section and part identities; six native layouts and rich artefacts (Japanese ruby/TTS/reveal/cards, code, Python Canvas, drawing, imagery); persistent Notes; manual edits; ACLs; atomic compare-and-swap (CAS), receipts and rollback. Keep owner-directed updates the only mutation authority. Do not introduce forced GPT handoffs, checkpoints, mandatory session objects, or an unbounded append-per-chat policy.

A4’s Lab selector allows comparison with old modes. That is not permission to add a whole-Project layout switcher to production: root AGENTS.md’s existing UI restriction remains operative until the owner explicitly revises it. Design a discreet opt-in/feature switch and optional true-history affordance, then seek owner acceptance.

## Proposed stages and boundaries

### Stage 0 — Owner acceptance and version pin

- Finish A4’s visual/interaction feedback on Japanese and coding, at 1080p and 4K, with responsive/mobile and accessible interaction checks.
- Record which specific A4 choices are accepted, optional, or rejected; especially left/right panel behavior, part-level history, topic grouping, controls, and whether any production view toggle is exposed.
- Capture exact live Lab source/deployment, protected native Minamo version, public main SHA and current tool schemas. The latest *reported* A4 private source commit is **1a1edd1dc9697dc7f04481e4390443a48bcfb4b2**; recheck.
- Identify the real current server stores, Project revision and edit/CAS paths before proposing schema migration.

**Exit:** a bounded scope and reversible behavior contract. No writes to production learner data.

### Stage 1 — Selective, reversible production view integration

- Implement only the chosen A4 presentation within protected native source through a reviewed diff, with a safe fallback to the existing Project presentation. Public GitHub changes and native Sites publication are separate workflows; reconcile before releasing.
- Replace Lab fixture-specific **a3-*** part-ID grouping with a generic grouping/index layer for arbitrary Projects. Prefer a derived view over rewriting stored records; preserve order and references.
- Derive current topics using explicit section/part metadata where it exists, and safe deterministic defaults otherwise. A future explicit group/reorder operation may be useful, but do not silently move or merge user-authored data.
- Consolidate visible flashcards **without deleting underlying card parts**. Preserve which original part each card belongs to for editing, history, image permissions and contextual lookup. Keep stable IDs for deep links and highlight targets.
- Provide separate readable measure and full-width rich-element behavior; avoid huge empty 4K margins and giant stretched canvas. Preserve 1080p and 390px behavior, Notes overlay, keyboard focus and TTS/furigana semantics.
- Optional compact latest-change and on-demand history use actual Project revisions; the default page must remain legible without consulting history.

**Exit:** current material renders in the native Site from genuine persisted Projects, with fallback and no content loss, using explicitly labelled TEST fixtures first.

### Stage 2 — MCP and server-side Project-edit contracts

Start with a schema inventory of the **actual live native** tools and current Project JSON, receipt and revision machinery (including changes made under #83). The following describes *desired capabilities*, **not existing tool names or verified signatures**:

| Capability | Required semantics |
| --- | --- |
| Read current snapshot | Exact Project revision plus stable section/part IDs, type, display order, visibility, title and current body/artefact references as permitted. Supports bounded selection of relevant sections/parts. |
| Read history and structural diff | Real saved revisions, timestamps, changed section/part IDs, type of operation, and safe human-readable summaries; bounded paging and direct deep-link targets. No inferred learning activity. |
| Scoped write | Explicit add, revise, supersede, reorder, hide/archive/restore as appropriate, addressed by stable part/section ID. Patch only intended fields, preserve unrelated content. |
| Concurrency and idempotency | Expected Project revision, unique operation ID and server receipt; atomic CAS; duplicate requests return the original receipt, not another revision. |
| Conflict response | Report current revision and affected IDs on mismatch. GPT must re-read, inspect the changed material, and request/attempt a valid updated patch; never blind overwrite. |
| Provenance and permissions | Trusted server timestamp/actor; optional origin/session label *only when actually supplied* and non-authoritative; owner permissions and user intent are checked on each operation. |

An *illustrative* edit request, not a proposed exact API schema:

- Project ID: a known, authorized Project;
- Expected revision: **12**;
- Operation ID: unique, stable across retries;
- Target: existing stable section and part IDs;
- Action: **revise** one explanation and **add** a related practice part;
- Return: committed revision **13**, exact affected IDs, receipt, conflict details if rejected.

This enables GPT to continue in a later chat: **read the current Project and its actual recent changes → understand the requested modification → make a bounded update with CAS → verify the stored result**. It does *not* require a handoff transcript, and ChatGPT chat messages are not automatically treated as Site events. Distinguish user-authored instructions, GPT-generated material, manually edited material, and genuinely executed code where available. “Lesson 10” in a synthetic fixture is never evidence of ten authentic learner interactions.

Use the existing server-backed Project JSON composition, safe nested asset access, owner authorization, Note transactions and receipts. Prefer extending known functions/contracts over inventing a parallel content store or a second revision source. Preserve backwards compatibility with pre-A4 Projects and clients, and keep existing tool definitions until a migration plan is tested.

### Stage 3 — History, summaries and scalability

- Initially derive part-level diffs from **existing persisted Project versions** and return a bounded window (recent N, cursor for older). Measure actual cost and size before adding derived caches or new schema.
- Stable part identity, content hashes/typed diffs and explicit replacement/supersession relationships should let the UI answer “what changed?” without repeatedly showing obsolete content. A summary is *about a saved edit*, not a fabricated account of a GPT discussion.
- If measured performance requires precomputed summaries, store/cache them as derivative data linked to revision/operation ID and rebuildable from the authoritative Project state. Do not create a second canonical history.
- For sprawling Projects, group by topic/task and show one current version; permit focused older revisions on demand. Archive/supersede remains non-destructive and reversible unless the owner deliberately deletes something.
- Avoid patch-on-patch duplication: GPT should review related existing parts before adding another grammar table, repeated instruction, or new flashcard deck; explicit revisions or merged *presentation* can often suffice.
- Optimize only after measurements on realistically large, varied Projects (text, Japanese, code, tables, 30+ cards, drawing/image references). Guard query/payload limits and avoid fetching all history into the initial viewport.

### Stage 4 — Production-shaped, multi-chat TEST acceptance

Use real GPT/MCP tools and protected native Site on **explicitly labelled disposable TEST Projects**, not simulated conversation labels, before any default switch. Do not repurpose a genuine learner Project or overwrite personal Notes.

A bounded suggested matrix:

1. Japanese, **10–20 genuine sequential GPT chats**. In each chat, independently retrieve current Project, respond to new user-directed practice/correction, apply a small scoped update and independently read back what persisted. Include corrections to old explanations and new card/image material.
2. Computing, **10–20 genuine sequential GPT chats**, continuing Python-ball fundamentals: actual code, examples, tables, Canvas where appropriate; differentiate authored code from code demonstrably executed. Check content remains current and usable after many updates.
3. Interleave manual UI edits with MCP writes; force a stale-revision conflict, a duplicate operation retry and a partial invalid patch. Confirm no lost update, duplicate card, silently altered Note, or false-success receipt.
4. Reopen from a new ChatGPT conversation with no prior conversational context except user intent; verify the server’s read contract supplies enough current context to continue naturally.
5. Navigate saved revision diffs to exact changed parts, including reordered/hidden/superseded items; exercise flashcards, ruby/TTS and Python Canvas, and check image/drawing references persist. Do not claim tldraw/Pygbag correctness without focused tests.
6. Inspect desktop 1920 × 1080, 4K-class 3840 × 2160 (respect browser zoom/DPI), narrow/mobile, keyboard-only; measure scroll/search burden and content/interaction performance at sessions 1, 5, 10 and 20.
7. Toggle back to Classic/revert the candidate view without data conversion; verify Project revisions, direct edits, Notes, permissions and non-TEST material unchanged.

**Acceptance evidence:** actual tool request/receipt/revision IDs for TEST data (redacted in public reports), before/after Project part counts, scoped diffs, distinct observed errors, screenshots of key widths, and an owner UX verdict. No inference of practice completion. Each test reports whether it was simulated, written, read back, executed or browser-verified.

## Release and MCP coordination

Follow [fast Sites workflow](../SITES-RELEASE-WORKFLOW.md) and root AGENTS.md. Do the narrowest relevant checks first: typecheck/build and focused update/CAS/permission/UI tests for actual changes; manual representative browser smoke and rollback. **Do not silently run the comprehensive legacy regression suite**; its periodic/substantial opt-in policy is intentional.

Deploy through the native Site’s current verified workflow only after owner authorization for that change. Keep the production content-preservation invariant. Public PR merging alone does not deploy native Sites. If MCP tool schemas are added or changed, document compatibility, confirm the Site is published first, and coordinate any necessary ChatGPT plugin reinstallation with the owner at the right point—not speculatively in this documentation stage.

## Risks and stop conditions

- **Native/public drift:** stop if the exact source baseline cannot be established or a bulk public-file copy would overwrite newer native behavior.
- **Data or authorization risk:** stop if CAS, ownership, nested assets, Notes protection, or rollback cannot be guaranteed.
- **Unresolved user product choice:** optional history/whole-Project toggle requires owner decision; do not silently override AGENTS.md.
- **MCP tool mismatch:** inspect actual signature before writing any adapter. Refuse blind edits using guessed operation formats.
- **History becoming clutter:** a ten-session timeline is a diagnostic, not default furniture. The current Project must remain primary.
- **Testing illusion:** synthetic seeding cannot stand in for fresh independent GPT↔MCP chats.

## Suggested subsequent commissions

1. **Review-only:** owner and independent learner acceptance of Lab A4, including coding record and 4K/mobile/furigana; classify changes as must-have/later/reject.
2. **Native preflight:** compare pinned Lab/native/public sources and actual MCP/Project JSON/receipt contracts; submit a limited implementation diff plan and risk assessment.
3. **Implementation:** port the approved, reversible presentation, then extend existing Project read/patch/history contracts only as necessary.
4. **Acceptance:** real independent multi-chat MCP TEST series with conflict, rollback and preservation checks; then decide if the new view should become a default.

## Definition of done for this planning PR

A future chat can identify **where the Lab is**, **what A1–A4 proved**, **which experiments are fictional**, **what production source is authoritative**, **which product decisions are pending**, and **an incremental implementation/verification route**—without assuming the Lab is already wired into production. This PR should remain a **draft, docs-only** handoff until the owner chooses the next commission.
