# Minamo V2 — Text-first, lossless GPT manuscript authoring

**Owner engineering commission — 21 October 2026**  
**Canonical repository:** `frekland/minamo-v2`  
**Implementation home:** this PR branch, to be extended by Work/Sites  
**Target:** the existing owner-private Minamo V2 Site only

## 0. Purpose and boundaries

Build a low-friction, **text-first publishing pipeline** in which GPT writes genuinely useful educational prose, code, challenges, references and purposeful diagrams **without handcrafting Minamo's internal persistence JSON**. Minamo's Worker must faithfully compile this material into its current canonical Journey, Investigation and Library readings, preserving the original full manuscript and giving usable saved pages.

**This PR currently provides a source-mapped engineering design, Work handoff, and a real standalone intake module with tests. It does NOT implement or deploy the full publisher.** Work should extend this same PR with the complete feature rather than creating another design or prototype PR. Do not touch the existing original Minamo or `cyber-learning` projects. Genuine V2 records remain protected.

**No new paid inference.** GPT in the user's existing ChatGPT session remains the writer and can undertake a second editorial review there. Minamo's server performs deterministic compiling, safe adaptation, bounded retrieval, link resolution and atomic D1 writes. Do **not** require OpenAI API credits, Workers AI, Vectorize, AI Gateway, remote embeddings, third-party inference, or new hosting. Do not claim a GPT Sites Worker can invoke the user's ChatGPT-plan model as a free server API.

**Owner-agency rule:** complete this scoped implementation and independent acceptance in one Work/Sites run without asking for routine approvals. An MCP reinstall/reconnect may be requested *only* if actual installed tool discovery demonstrably remains stale. Preserve owner-only hosting, source rights, exact reading identity, generation fencing, recovery and genuine learner evidence boundaries.

## 1. What failed in the real V2 RPG test

A previous owner-directed rebuild exposed excess schema work, author-supplied editorial justifications, 500-character purpose metadata contrasted with a longer creative request, 14 separate Trash operations, avoidable diagram validation rejections and substantial content that was still formulaic. In the final saved Journey, some `learningShape.stages[].outcome` values contained **questions rather than intended outcomes**; the schema accepted them.

The bad diagram example was a **physical map with bidirectional edges**, submitted as `flow-v1`, which only admits DAGs. `state-v1` supports cycles but is not a correct generic representation for every room map. The subsequent workaround was a symptom of an overloaded GPT-facing interface. PR #15's atomic package publisher *did* work; its canonical, revision and source safeguards should be retained.

Our previous RPG regeneration was **not an unbiased quality comparison**: the author had already inspected the original. Use fresh, held-out prompts for honest acceptance.

## 2. Source map — build on what exists

| Current source | Required action |
|---|---|
| `lib/manuscript-intake.ts` (included here) | Pure tested first-pass intake. Preserve verbatim source and spans; **not** a full Markdown grammar or completed publisher. |
| `lib/note-markdown.ts` | Existing source-preserving Markdown precedent. Do not confuse its limited codec with full educational Markdown. |
| `lib/author-input.ts` | Existing canonical text derivation and explicit mismatch rejection. Add a **higher-level compiler in front**; don't weaken admission. |
| `lib/contracts.ts` | Backward-compatible source-edition / rich presentation contracts. Preserve existing content projections. |
| `lib/diagrams.ts` and `app/flow-diagram.tsx` | Keep `flow-v1` DAG and `state-v1` explicit trigger rules. Add safe `graph-v1` for genuine cyclical/general directed relationships if justified. |
| `lib/learning-validation.ts` | Preserve stage IDs/relationships; distinguish a true outcome from a prediction/question. Only deterministic warnings are automatable. |
| `lib/editorial-policy.ts` | Preserve no-fake-evidence and source-rights boundaries. Agent-supplied `whyNotDuplicate` cannot serve as semantic proof. |
| `lib/authoring-package.ts` | Reuse **actual D1 atomic batch**, preconditions, prospective renditions, generation/revision CAS, receipts, replay and rollback. No loop of partial commands. |
| `lib/domain-handler.ts` and `worker/index.ts` | Add and register a small authenticated HTTP/MCP manuscript entry point, with updated installed-tool capability claims. |
| `lib/domain.ts`, `lib/generations.ts`, `lib/reading-links.ts` | Keep per-owner scope, exact source/context/rendition and safe recovery semantics. |
| `app/reader.tsx`, `app/journey-route.tsx`, `app/investigation-workspace.tsx`, `app/learning-links.tsx` | Rich original reading, deep links and exact return, keyboard/touch, Notes, Flag and annotation compatibility. |
| `docs/SOURCE-SYNCHRONISATION.md` | Sites native Git and GitHub are separate. Compare trees for implementation release; GitHub design PR alone does not deploy. |

Review `AGENTS.md`, `STATUS.md`, issue #1, `docs/IMPLEMENTED-ARCHITECTURE.md`, `docs/learning-experience/IMPLEMENTATION-EVIDENCE.md` and the already-integrated requirements from PR #14. Do **not** execute PR #12 or independently pursue PR #14's open draft. Do not launch a broad UX overhaul.

## 3. Ergonomic GPT-facing input

Expose **`publish_minamo_manuscript`** and optional read-only **`preview_minamo_manuscript`** with equivalent authenticated HTTP routes.

```ts
type PublishManuscript = {
  purpose: string;                  // short request-scoped label, <= 500 chars
  operationId: string;              // immutable idempotency key
  expectedGeneration: string;       // exact generation / CAS
  manuscript: {
    version: 1;
    brief: string;                  // FULL owner prompt, not truncated metadata
    documents: Array<{
      key?: string;                 // optional local cross-document reference
      role: 'journey' | 'investigation' | 'article' | 'area';
      title?: string;
      markdown: string;            // substantial original authored content
    }>;
  };
  existing?: Array<{
    family: 'article' | 'journey' | 'area';
    id: string;
    rev: number;
    purpose: 'reuse' | 'targeted-update';
  }>;
};
```

Default authoring **must work in one submit call**, with preview optional rather than an added approval requirement. No agent-authored block IDs, canonical text projections, internal DB identities, complete nested link manifests, one-article-per-stage quotas, or hundreds of metadata fields. The full original brief remains a first-class stored source input and may exceed the current 500-character purpose limit.

The server returns a compact transaction receipt with exact new refs/revisions, deep links, source-edition digest, warnings and operation recovery key. A failed or interrupted response must be recoverable via `read_minamo_operation`, not force a repeated reconstruction of the entire manuscript.

Allow explicit same-bundle relationships expressed through **short local document keys** where the author intends a semantic relationship. Server resolves target refs and canonical renditions. Existing-record links require exact permitted identities, or return bounded candidate choices; no guessing semantic equivalence from a matching title.

## 4. Deterministic server authoring pipeline

1. **Admit intention and scope.** Authenticated owner, generation/revisions, operation identity, allowed roles, full original brief, UTF-8/Unicode validity and size. No writes during preview. Reuse the included `inspectManuscriptSubmission()` as a safe front door; it retains all original source and UTF-16 positions, including CRLF, emoji, unknown Markdown and code fences. Its structural scan is not a substitute for a Markdown AST.

2. **Lossless rich parsing.** Use a well-tested compatible Markdown AST parser (e.g. `remark-parse` if dependency/runtime tests permit), with raw-source spans retained. Support headings, prose, nested emphasis, numbered/bulleted lists, escaped punctuation, language-tagged code, tables, links and safely declared diagram definitions. Do not execute user HTML, JavaScript or arbitrary embedded SVG. Unsupported source remains **visibly and safely recoverable**, with a diagnostic. Do not silently drop content.

3. **Canonical safe rendering.** Convert recognised constructs into current safe `sections.parts` and typed structures. Preserve the source separately. For rich inline formatting extend the reader and canonical projection so **visible selectable text and canonical UTF-16 text agree exactly**, while styling has its own source-map annotations. Existing historical rendition hashes must not change. Verify selections across emoji, punctuation, lists, table cells, code and rich spans.

4. **Safe mechanical adaptation.** Derive internal stable IDs, table TSV, canonical metadata, legal reference cards, stage ordering and targets server-side. The server may repair representation but **not fabricate educational content, hyperlinks, source permissions, learner observations, node labels or relationships**. If semantic meaning is ambiguous, retain full source and explain the limitation; don't guess.

5. **Diagram semantics.** Add a safe `graph-v1` format permitting cycles and bidirectional edges. Retain `flow-v1` only for DAGs and `state-v1` for genuinely trigger-labelled state transitions. A room map need not be a state machine. Preserve accessibility via textual alternative, zoom and mobile/keyboard operation. For unsupported Mermaid, retain the original fenced code as a faithful fallback with a warning; a tested safe subset converter is optional and must preserve semantics.

6. **Coverage/links.** Query current eligible D1 data and exact concept entries first. Existing bounded literal search can serve the initial design; D1 FTS5 could be investigated if clearly useful and supported, but **must not become a blocking dependency or another project**. Show candidates with current IDs/revisions and selected sections. GPT's authoring judgement decides genuine reuse; server never silently declares two topics equivalent. Derive cross-manuscript refs and verify `sourceContext` and destination identity using existing domain rules.

7. **Versioned raw-source preservation.** Store immutable authored-source editions and their full brief **in the same guarded publication transaction** as compiled records and receipts. The authored source belongs to the authenticated owner; the source digest binds content/keys and target revisions. Subsequent edits to canonical blocks must not rewrite history or falsely represent the original manuscript as the current authored edition. If there is no safe same-transaction source store yet, add a scoped D1 table/migration; **do not treat a dangling R2 upload as an atomic D1 commit**. Minamo's current Source rights and owner-private storage still apply.

8. **Atomic publish/recovery.** Feed compiled proposals to the current `authoring-package` transaction, or reuse its authoritative guarded operations through a narrow internal adapter. No sequential creates with partial commits. Inject failure on a later member and assert zero partial records, history, source editions, activity and receipt. Identical retry/replay must commit once; changed payload using an old operation ID rejects.

9. **No honest quality claims from schema alone.** Deterministic checks can flag suspicious stage metadata, repeated body text, absent examples, mis-typed links, empty explanations or obviously fabricated observations. They **cannot prove a technical explanation teaches well**. Keep such findings distinguishable from hard permission and structure errors.

10. **Return a bounded useful result.** Exact refs and deep links, warnings/unsupported-format notices, source archive status and a durable operation ID. Preserve full data in the owner's record, not in logs or huge MCP response bodies. Do not truncate oversized submissions: return a truthful limit with a resumable owner-scoped continuation strategy if measured requirements demand it.

## 5. Educational review without paid server inference

The ChatGPT session is the authoring/review intelligence. Within Work, use a **separate editorial pass** to challenge the material for technical correctness, genuine explanatory depth, prerequisite order, runnable isolated examples, practical challenges, sources, distinct Journey versus Library roles and worthwhile optional Investigations. Prefer targeted changes to the source before publication. A same-model second pass is helpful but **not independent external proof**; don't mislabel it.

Then assess the **actual saved reader**, not just a JSON proposal. A learner-review pass should browse the result cold, follow an authentic example and give source-specific criticism. The implementing agent must correct real regressions. Automated green tests and an attractive screenshot are not substitutes for usefulness.

The server itself should enforce hard provenance/security contracts and show grounded editorial risk signals without demanding per-record agent self-certification. The intended principle is:

> GPT teaches and reviews. Minamo compiles, connects, preserves, validates and displays faithfully.

## 6. Integration sequence — implement all within one Work commission

**A. Intake** — validate and extend the included pure scanner; add lossless Markdown AST/fallback and tests. Keep unsupported content visible. Check structure with a real long-form GPT example.

**B. Reader bridge** — safe rich formatting and new `graph-v1` through current canonical reading and React components; verify preserved selection, Notes, Flags, annotations, mobile, source links and exact back/forward.

**C. One-call publisher** — new small MCP/HTTP tools + actual Worker path wiring, generated IDs, relationship resolution, immutable raw-source editions and D1 atomic transaction. Include correct source/provenance and operation-status replay.

**D. Coverage and honest diagnostics** — candidate existing references, constrained quality checks, small targeted response diagnostics and optional GPT editorial loop; no new inference service.

**E. Integration and release** — local typecheck/build/unit tests, actual Worker/D1/MCP security and concurrency suites, authenticated saved-page desktop/mobile review, real installed MCP-tool discovery and recoverable exact-ID synthetic cleanup. Once all gates pass, follow `docs/SOURCE-SYNCHRONISATION.md` for matching native/GitHub trees, CI, merge and owner-private V2 deployment. Report actual identities and evidence.

Do not stop after an architecture memo, scaffold or self-graded demo; complete the working integration when feasible, with a precise source-mapped blocker otherwise. No routine owner checkpoints. Only request host plugin reinstallation if installed tool definitions are demonstrably stale after deployment.

## 7. Mandatory acceptance matrix

| ID | Independent demonstration |
|---|---|
| M01 | Full original brief over 500 characters saved and read back intact; no forced metadata summary replacing it. |
| M02 | Raw Markdown source preserved exactly, including CRLF, headings, emoji, tables, lists, links, code fences and unsupported syntax; genuine rendered formatting remains readable. |
| M03 | Correct canonical/display mapping and retained UTF-16 passage capture through emoji, Markdown inline spans, tables, Notes and Flags; historical records untouched. |
| M04 | A rich multi-document Journey / Investigation / Library submission publishes in one friendly call without GPT-built `sections.parts` or manual IDs; preview optional. |
| M05 | Bidirectional room graph rendered as a generic graph, not rejected as a DAG or misrepresented as a state machine. Unknown diagrams retained visibly with a clear warning. |
| M06 | Within-package refs and source-stage contexts resolve to the actual target IDs/renditions; no guessed backlinks or unauthorised existing-record changes. |
| M07 | Full owner auth, scope, source rights, no arbitrary HTML/JS, no untrusted remote import, no invented real learner execution or achievements. |
| M08 | Failure in member 11, D1/gen/rev races, replay/changed-payload conflict and missing-source persistence all prove truly atomic rollback. |
| M09 | Distinguishable educational risks: the specific bad `outcome`-as-question fixture and repetitive shallow-reference fixture are challenged by GPT review; machine signals never misrepresented as semantic certainty. |
| M10 | No new paid model/API, Vectorize or Workers AI dependency. Record token/tool/rejection overhead before versus after using actual installed tools. |
| M11 | `pnpm run typecheck`, `pnpm run build` and `pnpm test` plus auth/Worker/MCP/reading/recovery/security regressions pass with real counts and evidence. |
| M12 | Authenticated actual saved desktop and 390px/320px view, usable stage/reading return, code copy and exact selection; clean up only exact synthetic IDs. |
| M13 | Native source and GitHub tree synchronised, tested owner-private deployment, actual installed new MCP tools and immutable receipt recovery. |

## 8. Fair learner-quality benchmark

Use **three or more fresh, heterogeneous prompts**, selected after the design is implemented and not tailored to its known fixtures. Include a practical coding project, a conceptual computing question and a genuinely open Investigation. Keep prompts unchanged between old/new workflows where possible. Compare like-for-like model/effort, track differences honestly, and separate authoring prompts from evaluator instructions.

Record: number of GPT/MCP calls and rejected submissions; repeated/rewritten bytes; genuine time/effort where measurable; published rich content versus submitted source; correct technical examples; clarity of learning steps; independent Library usefulness; non-fabricated Investigation questions; mobile interaction; and accessible final reading. Have a reviewer who did not inspect the implementation critique the saved pages. Do not count arbitrary numbers of articles, paragraphs or diagrams as success.

**Release standard:** materially less mechanical authoring work **and** at least no regression in real teaching usefulness. If content is merely published more quickly but remains shallow, the work is unfinished.

## 9. Strict exclusions

No standalone paid service, GPT API, vector infrastructure, new Site, original Minamo/cyber-learning changes, private learner corpus in Git fixtures, broad UI redesign, bulk migration/deletion of genuine records, hidden background agents or execution of unrelated PRs. Scope-safe bulk replacement/Trash can be planned later; do not derail the central manuscript ingestion improvement.

This PR's only implemented code to date is the **unwired pure intake module and its six focused tests**. See `WORK-SITES-HANDOFF.md` and `PROTOCOL-EXAMPLES.md`. Do not claim any runtime publisher or deployment merely from this design PR.

