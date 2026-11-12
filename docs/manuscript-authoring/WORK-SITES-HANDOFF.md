# Work/Sites handoff — implement lossless, text-first Minamo authoring

**Repository:** `frekland/minamo-v2`. **Source of truth:** the PR branch containing this handoff and `docs/manuscript-authoring/IMPLEMENTATION-COMMISSION.md`. **Target:** the existing owner-private Minamo V2 Site; not the original Minamo.

## Execute this task in full

Read and implement the engineering commission in `docs/manuscript-authoring/IMPLEMENTATION-COMMISSION.md`, using the new real `lib/manuscript-intake.ts` code and `tests/manuscript-intake.test.mjs` as the starting point. Extend **this same PR**, not another planning branch. The PR at hand is a design plus unwired parser scaffold, **not completed runtime functionality**.

### Establish the actual baseline

Read current `main`/PR head, issue #1, `AGENTS.md`, `STATUS.md`, `docs/SOURCE-SYNCHRONISATION.md`, the commission and affected current runtime modules. Verify current native Sites source/deployment identity, latest merged PRs and concurrent edits. Preserve the existing React/Vinext/Worker/D1/R2 foundation and owner-only controls. Prior work in PRs #14/#15 is reference/implementation precedent only: **do not separately execute PR #14, PR #12, or any unrelated issue**.

### Build the complete working path

1. Create **lossless rich Markdown ingestion**, preserving the full GPT-authored prose and complete original brief without cutting it to the 500-character audit purpose. Use tested source mapping and a robust AST parser; unknown syntax must remain safe and visible, not silently flattened. The new scanner is only an intake module; finish its integration.
2. Compile rich writing into the existing canonical Journey/Investigation/Library reader and its exact UTF-16/rendition semantics. Add a safe generic cyclical `graph-v1` where needed. Retain existing `flow-v1` and `state-v1` meaning, Notes/Flags/annotations and old historical readings. Do not execute arbitrary HTML/SVG/remote content.
3. Add a narrow `publish_minamo_manuscript` MCP tool plus matching authenticated HTTP route (and optional read-only preview). One call should accept the **original full brief + substantial Markdown documents**, construct stable IDs, structured parts, safe diagrams and links server-side, archive an immutable owner-private source edition and atomically publish. No agent-authored low-level schema, redundant canonical text or compulsory editorial self-certification. Reuse existing guarded D1 package/receipt/CAS machinery. Never silently update/delete genuine records.
4. Use existing server candidate discovery and deterministic editorial warnings. The composing and review intelligence is **ChatGPT within this Work run**, not a new paid/server inference API. Distinguish grounded lint from real semantic educational judgement; challenge formulaic shallow references and wrong learning outcomes.
5. Prove real no-loss source and rendered fidelity using fresh held-out learning prompts, not solely the previously analysed kitten RPG. Run source, Worker/MCP/D1, auth, Source-rights, rollback, Unicode selection and recovery tests; exercise **actual saved authenticated desktop and mobile pages**. Correct substantive teaching and interaction failures. Measure MCP friction *and* educational value.
6. Finish branch, typecheck/build/tests, exact native/GitHub tree sync, CI, review/merge and verified owner-private deployment under existing issue #1 authority, including installed new-MCP-tool verification. If the host catalogue is genuinely stale, request only a precise Minamo V2 reinstall/reconnect and resume. Exact-ID recoverably remove synthetic acceptance records, leave genuine learner records untouched.

### Mandatory constraints

**No paid external service or second model API**: no OpenAI API credits, Workers AI, Vectorize, AI Gateway, external embeddings or new hosting. No unrelated site changes, private learner records in Git, original Minamo changes, unsanctioned corpus migrations, invented terminal results, invented learning achievements or weakened source rights.

**One continuous agentic commission**, no routine owner approval checkpoints. Do not declare completion at the document/scaffold/green-CI stage. The implementing agent is responsible for independently convincing educational quality and actual reader usability, not just schema correctness.

### Final receipt

Report the updated PR, merged main/native Site commits and exact matching tree if achieved, production deployment identity, actual installed MCP version, test counts, real saved-page/390px observations, immutable source readback and operation recovery evidence, honest held-out learning-quality findings, tool-call/rejection counts and synthetic cleanup. If genuinely blocked, report the exact blocker and committed resumable state without pretending success.

**Acceptance:** full-quality GPT writing reaches Minamo faithfully and usefully, through a genuinely low-friction authoring operation, using only the existing ChatGPT plan and Minamo hosting.

