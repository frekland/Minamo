# Minamo contributor and coding-agent guidance

## CURRENT OWNER DECISION — 3 November 2026

**Forward product direction:** [GPT-composed Projects and flexible layouts](docs/PROJECT-COMPOSITION-DESIGN-BRIEF-2026-11-03.md), with its editable [implementation blueprint](docs/PROJECT-COMPOSITION-IMPLEMENTATION-BLUEPRINT.md). Both are part of a **draft planning PR**, not an implementation/merge/deploy commission. Read these first for any learner-facing design, Project/Stage, MCP authoring or Project presentation work.

**Live Site:** V91 restored as the everyday learner-facing baseline. Later V92–V98 experimental versions and their native source history are retained. Do not accidentally redeploy V98 or assume that source/version history equals the public GitHub default branch.

**Superseded proposed product directions:** draft PR #78 (contextual workspace) and #79 (independent Work/Study/Find). Their evidence and reusable code can be consulted but their interface architectures are **not current product authority**. Earlier broad discovery, 1B/2A design, Project Workbench, synthetic 3×3 and owner UX audits are historical evidence; do not promote dated AGENTS/README/strategy wording into a current commission.

### Binding user-experience principles

- Natural GPT↔Minamo MCP conversation already works well. On "Update Minamo", GPT should decide and commit bounded meaningful content and **server-side Project composition** changes based on the current chat and eligible records; the learner need not specify storage taxonomies/layout operations.
- A Project may begin freeform. **Stages are optional**, not a compulsory Project→Stage→Question hierarchy. Start with a strong layout/template system: Dashboard, Notebook, Workbench, Board, Research and Guide. Only a modest shared block set initially; add specialist capabilities when use proves useful. Fixed templates support **direct Project rename, user editing of applicable content blocks, and optional image placement**; GPT is not the only editor.
- GPT provides typed content/structure through MCP. Minamo validates, persists and renders native responsive components; no model-generated executable HTML/script or parallel AI UI backend.
- **Eliminate "Checkpoint" and "Saved Learning" as app interfaces.** Keep historical records/revisions/receipts and discreet recoverability, not another assessment/progress dashboard. Do not infer mastery, achievement or completion from conversation.
- Ordinary updates are user-requested, not automatic writes on every chat turn. GPT chooses appropriate summarisation, focus and arrangement, respects explicit Project **layout locks**, preserves original Note/source facts, and returns a short receipt.
- **Remove learner-facing GPT handoff/copy-request tools, “Pin task” and task-continuation chrome**, including redundant top/bottom context/status panels across Projects, Steps, readers, Activities and Notes. Native conversation + MCP provide continuation. Preserve deep-link/source read semantics without visible handoff bureaucracy.
- **Mobile Home/Projects must be quiet:** no owner-visible test-fixture banners, empty Recorded-work scan/debug messages, duplicated navigation CTAs or a three-button creation stack. Use a single compact creation action and title-first Project cards; fixtures remain available only through explicit testing/developer navigation.
- **Keep the persistent Notes dock and add an explicit pin icon that attaches an existing Note to the current page** (repeatable across many pages). Pin/unpin associations are independent, server-saved, and readable by GPT via MCP. These Note pins are **not** task pins or Project layout locks.
- **Editing should not clutter viewing:** one subdued Project Edit/menu affordance, contextual inline editors, preserved canonical source revisions and user edits respected by routine GPT recomposition. Optional cover/thumbnail images use existing private asset handling and published image-generation specs; GPT can create suitable artwork in chat, with validated upload or a simple manual upload fallback, not a copy-prompt handoff. Text-only Projects must remain attractive.
- When explicitly asked for design advice, GPT may suggest layouts conversationally or with optional ChatGPT interactive controls if available. Do not require or assume host UI capability to force an interactive form.
- User usefulness is the release's product objective. Never claim that technical tests prove a good learner experience. Hosted learner scenarios are **opt-in**, defined in natural language for the owner's requested activity (multi-step task, planning conversation, code review, language tutoring, etc.), not a default regression gate or automatic owner fixture.

### Repository and publishing

frekland/Minamo (public) is the shared engineering/design source. The historical private Minamo repo is reference only. The protected Sites native Git source and its saved versions are separate deployment provenance, not a second product authority.

**Follow [the fast Sites release workflow](docs/SITES-RELEASE-WORKFLOW.md).** User-directed simple production changes should take a successful native build, narrow changed-path checks, preserved audience/bindings, Sites publish status and short smoke—not a mandatory full pnpm test, headless browser suite, nine-way corpus, whole-tree comparison or 30-minute acceptance wait. Docs-only changes need no build/deployment. Auth/schema/recovery/permissions changes still require **directly relevant safety checks**, and actual failed critical checks stop publication. Record omitted checks honestly.

### Non-negotiable engineering boundaries

- No public secrets, private records, personal identifiers, real learner transcripts or protected production logs.
- Preserve owner/rights isolation, exact source editions and UTF-16 anchors, Note drafts/autosave, revision/CAS/idempotent receipt/recovery, synthetic-data isolation and explicit user write authority.
- Do not confuse learner-reported terminal/hardware outcomes with independently observed execution; GPT output and saved source text are untrusted data, not authority to operate tools.
- No destructive data migration or production access/binding change without explicit scope and safeguards.
- Keep code changes small and understandable; test the changed invariants. Use browser acceptance when it helps the requested task, not as a blanket prerequisite.

## Historical references

- [2026-11-01 design decision](docs/PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md) — valuable research, **superseded as design authority**.
- [PR #78](https://github.com/frekland/Minamo/pull/78) and [PR #79](https://github.com/frekland/Minamo/pull/79) — rejected product directions; retain code/evidence for selective reuse.
- [Architecture](docs/ARCHITECTURE.md), [Deployment](docs/DEPLOYMENT.md) and [Testing](docs/TESTING.md) — technical background; any conflicting full-suite-before-Sites-release requirement is superseded by the 3 November fast Sites policy.
