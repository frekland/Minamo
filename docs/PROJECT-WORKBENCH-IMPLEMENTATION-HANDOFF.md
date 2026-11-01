# Project Workbench: build approach and fresh-chat handoff

> **SUPERSEDED DESIGN COMMISSION SEQUENCE — 1 November 2026:** The owner's [broadened product-design discovery decision](PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md) is authoritative for future Workbench/learner-experience work. This historical handoff's mandatory Work/Questions/Evolution perspectives, fixed A/B alternative set and requirement to complete nine cold-context acceptance chats before product discovery are no longer design gates. Begin with D1–D3 discovery and explicit owner/GPT responsibility split; keep the real-persistence vertical slice, source/rights/privacy/recovery invariants, and separate implementation authorisation. The sections below are retained as historical engineering lessons, **not a fresh-chat execution plan**.


**Owner decision · 31 October 2026 · Planning/commission handoff, not implementation authority.**

Read with the [learner-experience redesign strategy](LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md), [source-inspected prior art](research/2026-10-31-prior-art-code-reading.md), and live issues [#51](https://github.com/frekland/Minamo/issues/51), [#12](https://github.com/frekland/Minamo/issues/12), [#14](https://github.com/frekland/Minamo/issues/14), [#17](https://github.com/frekland/Minamo/issues/17) and [#18](https://github.com/frekland/Minamo/issues/18).

**Purpose:** Make the next Project-experience effort a real, evidence-led working product experiment. Prior visual/UX attempts repeatedly yielded attractive concepts, reports, components or passing tests without convincing the owner that Minamo was a natural place to understand and continue evolving work. This handoff specifies a different development and acceptance method. It supersedes earlier advice to treat active investigation, questions and history as competing product concepts, or to require alternative implementations to retain the current information architecture.


> **V89 research checkpoint — 1 November 2026:** [Current hosted 3×3 read-only baseline and independent-session limitation](acceptance/2026-11-01-v89-workbench-research-baseline.md) and [source-grounded Workbench information contract/A–B comparison gate](PROJECT-WORKBENCH-INFORMATION-CONTRACT.md) now exist. The Site remains V88. Nine source-pinned fixtures and canonical latest Notes were reinspected; genuine fresh ChatGPT/MCP conversations are still **0/9**, because the available separate browser ChatGPT session was unauthenticated without Minamo MCP. Do not treat this research as Gate 1 cold-context acceptance or a working Workbench prototype. A new root-Project-context finding is that Question-linked return Notes can be absent from the direct Project related projection even with complete direct-result coverage; trial bounded relation closure before a schema change. The live Question→Note→Library→Question navigation also loses the original Step return parameters on a specific backlink path. Continue with the functional, isolated, real-persistence slice only after the missing accepted gates and owner review.

## 1. What we are trying to build

A **single Project Workbench** with complementary perspectives on:

- **Work:** what the learner is actually investigating or making, with actions and writing available in context.
- **Questions:** uncertainties and lines of inquiry, provisionally answered, reopened or set aside, connected to the wider purpose.
- **Evolution:** consequential turning points, earlier positions, new evidence, changed interpretations, contradictions and unresolved matters.

These are **functional perspectives, not prescribed tabs or databases**. Evidence inspection, exact source navigation, writing and explicit GPT/Minamo updates must work across them. A change of perspective should preserve a meaningful selected object, its revision/anchor, draft context and return path. Prototype alternatives may use explicit lens switching, fluid contextual disclosure or controlled adaptive presentation. Do not preselect final layout, visual tokens, route taxonomy or information model.

**Success is not “three good-looking views.”** It is a learner who can enter an organically changing inquiry, understand where it stands and why, examine original material, think or write at the point of interest, change perspective and return, and deliberately commit an update that a fresh GPT can later recover accurately.

## 2. Preserve capabilities, not today's information architecture

**Non-negotiable invariants:**

- Retain original learner-authored material, exact source/reading anchors, revisions, timestamps, authorship, uncertainties and historical corrections. Never rewrite a learner Note to make a derived view cleaner.
- Preserve principal/owner-scoped authentication, source rights, validation, revision-safe writes/idempotency, recoverability, privacy and synthetic isolation.
- Preserve actual Note draft/autosave/conflict behaviour, reading and annotation capabilities, and deliberate user authority over durable GPT/MCP updates; replicate or improve capabilities before retiring old UI.
- Distinguish learner report, GPT interpretation, pinned source, independently verified execution and a successful persistence receipt.
- No compulsory assessment/mastery/progress judgements, hidden unsaved-conversation ingestion, mandated taxonomy, or ungrounded “current understanding” claims.

**Explicitly open to fundamental redesign:**

- Project information architecture, navigation, hierarchy, Steps, Questions, Activity, Library relationships, content placement and the very meaning of “Project home.”
- Read projections, contextual selection model, domain links and—in a justified, reviewed migration—the underlying data model and MCP contracts.
- Whether the interface uses lenses, contextual disclosure, a different flow or a substantially rebuilt Project surface.

The current code is a valuable baseline, **not a design constraint**. A new read projection is initially a diagnostic *candidate*, not a mandated abstraction that forces the UI to fit existing Steps. Alternative prototypes must share canonical evidence and comparable tasks, but need not share identical information architecture if one genuinely better structure requires a migration.

Any proposed persistent schema migration must include a concrete mapping of existing record identities/revisions/anchors, backwards-compatible reads or a migration/rollback plan, preservation tests on synthetic histories, and an explicit owner decision. Do not perform production migration as part of a design sketch.

## 3. What prior attempts teach us

- The [24 October workflow A/B laboratory](https://github.com/frekland/minamo-v2/blob/research/workflow-ux-lab-20261024/docs/workflow-ux-lab/README.md) used real Reader/editor components and browser comparisons, but its [prototype guide](https://github.com/frekland/minamo-v2/blob/research/workflow-ux-lab-20261024/docs/workflow-ux-lab/PROTOTYPE-GUIDE.md) labels save/conflict and some working-set behaviours as simulated. It did not establish a fully persisted, authenticated, longitudinal Project experience.
- The [review programme #60](https://github.com/frekland/minamo-v2/pull/60) and [unified Projects work #92](https://github.com/frekland/minamo-v2/pull/92) improved or specified meaningful navigation and technical fidelity, but did not establish that the Project as a whole was an active, coherent inquiry.
- Current [Project contracts](../lib/project-contracts.ts) and [Project route](../app/journey-route.tsx) still organise important paths around Steps, Question links and a continuation target. Their existence is not proof of a defect, but a shell redesign alone cannot be assumed to provide the missing causal/evidential picture.

**Working inference, not a proven sole cause:** earlier evaluations often demonstrated component correctness or polished task-centred layouts while leaving the integrated live persistence, changing meaning and user experience insufficiently tested. More screenshots and a larger review matrix alone will not fix that.

## 4. Required sequence and authority

### Gate 0 — Verify the live baseline and finish the existing testing foundation

In a fresh chat, **first check** current public main, latest relevant PRs/issues, actual #14/#17 state, scenario/controller provenance and Site/staging deployment identities. Dated issue banners can be stale. Establish which tracing, canonical before/after comparison, exact replay and registered-fixture isolation are truly implemented and accepted. Do not silently assume outstanding stages are complete or reopen finished work.

### Gate 1 — Complete the existing 3 Projects × 3 variants corpus

Reuse the architecture in [#12](https://github.com/frekland/Minamo/issues/12), not new ad-hoc histories:

| Project | Variant 1 | Variant 2 | Variant 3 |
| --- | --- | --- | --- |
| Mood-to-Music | Intermittent weekend prototyper | Provider-documentation sceptic | Privacy-led interface reviser |
| Retired HTB Cap | Command-log investigator | Packet/model explainer | Interrupted sparse recorder |
| Automatic Plant-Screamer | Breadboard-first tinkerer | Careful calibrator | Shared-space pragmatist |

The canonical Mood-to-Music V3 longitudinal baseline is already built and tested within its recorded scope. The nine **local-only** persona replays are implemented through [weekend #57](https://github.com/frekland/Minamo/pull/57), [documentation sceptic #58](https://github.com/frekland/Minamo/pull/58), [privacy-led #60](https://github.com/frekland/Minamo/pull/60), [retired Cap #61](https://github.com/frekland/Minamo/pull/61) and [Plant-Screamer #62](https://github.com/frekland/Minamo/pull/62). They do not establish hosted persona selection, complete three-layer MCP/controller receipts or 3×3 learner-experience acceptance. Use isolated, causally plausible narrative variants and shared versioned scenario/fixture/controller/transcript/receipt contracts, **not nine copied curricula**. Confirm source/learner-authorship boundaries, exact state replay, cross-variant isolation and realistic changing-direction material. Fixture implementation is separately scoped under #12; it is **before** the Workbench prototype commission.

**Agreed accelerated execution method:** Follow [the fast, gated 3×3 corpus development workflow](TESTING.md#fast-gated-development-of-the-33-fictional-corpus-owner-decision-31-october-2026). Work in one **draft PR per Project subject**, make separately reviewable commits for each persona, and use existing targeted tests during iteration. Promote a completed subject PR to ready-for-review for its full CI build/regression/browser gate; do not rerun an identical full suite after each persona or duplicate the full main-push check after an already-green fixture-only PR. A manual final cross-subject gate and all provenance/hosted-authority limits still apply. This is a change of *verification cadence*, not permission to weaken test contracts, accelerate into Workbench UI, deploy a Site or mutate genuine learner data.

### Gate 2 — First Project Workbench commission: reality check and information contract

Only after the applicable foundation and 3×3 corpus are accepted, inspect the *actual* Project UI, domain, routes, persistence and MCP/read contracts. Determine:

1. Which learner tasks/current interpretations/turning points can be justified from existing canonical records, and exactly what supporting source/revision proves each?
2. Which meaningful relationships are absent, ambiguous or too expensive to retrieve?
3. Which existing components, operations and safeguards should be reused unchanged?
4. Which information architecture, model relationships or read/write contracts must change to support a genuinely coherent workbench?

Produce a source-grounded **gap-to-decision table**, a minimal representation of the necessary behaviours/data, and tests against at least one adversarial changed-direction state. Do **not** default to adding a generic “project summary” or a second authoritative store. If a claimed change of understanding lacks record support, display uncertainty or propose an explicit reviewable capture path; don't let GPT fabricate a plausible history.

**Gate:** evidence-backed information contract and decision on reuse/adaptation/rebuild. This is not acceptance of a UI.

### Gate 3 — Build one deliberately plain, genuinely functional vertical slice

Build *within the actual Minamo application*, on a small reviewable branch behind a controlled experimental entry point/flag. Preserve a working baseline route and rollback path. Reuse the real authorised domain/D1/API operations, Reader, source links, Note coordinator and relevant MCP behaviour; replace those components only with explicit engineering justification.

Prove **one complete difficult workflow** before adding design polish:

1. Open a Project after an interruption; understand the current work and honest uncertainty.
2. Inspect a previous claim/decision, its exact old version and later supporting or contradicting evidence.
3. Follow a contextual Question and source passage without losing the selected context.
4. Write through the **real** Note editor/persistence path; verify commit receipt/revision, reload and conflict/draft behaviour.
5. Change Work/Questions/Evolution perspective, return to the same item and preserve the editing state.
6. Explicitly request a GPT/Minamo update, confirm durable readback and recover it through a fresh authorised conversation.

**No simulated save/conflict/backend state may count as a passing functional prototype.** Mocks can support isolated tests only if clearly labelled. A public staging preview is not automatically equivalent to a protected Sites identity/MCP end-to-end test; verify each boundary separately. Never deploy or mutate a genuine learner account without explicit authorisation.

**Gate:** actually perform the workflow in a real interactive browser with correct storage and provenance. Reject or revise immediately if it feels fragmented, even if typecheck/build/tests pass.

### Gate 4 — Compare implementation alternatives on the same truth

Once the first vertical slice works, explore at least two ways of delivering the **same hybrid responsibilities**, e.g. explicit lens-based workbench versus fluid contextual workspace. A controlled adaptive variant is optional. They can differ materially in information architecture and presentation; they must use comparable canonical histories, genuine operations, source fidelity and task objectives.

Avoid two independently copied applications with divergent saving, identity, privacy or failure behaviour. Share trustworthy infrastructure where it makes sense; allow structural differences where the experiment requires them. The experience should not collapse into renamed Steps/Questions/Activity tabs.

### Gate 5 — Evaluate across the 3×3 corpus and get owner acceptance

Goal-based, non-prescriptive tasks should cover:

- First-glance orientation after a gap, with no invented current state.
- A consequential changed direction and its actual rationale/source revision.
- Cross-perspective selection, source lookup, writing, draft/reload/conflict and a useful return path.
- Contextual GPT update with honest receipts and independent new-chat continuity.
- Sparse Notes, source uncertainty, privacy-led behaviour, physical experiment claims and technical terminal/code evidence.
- Narrow mobile early; later desktop, keyboard, focus, long content and failure states.

Capture actual actions/backtracking/time only when observed; separate canonical correctness, server/MCP retrieval, UI behaviour and model judgement. Use optional [#18](https://github.com/frekland/Minamo/issues/18) visual agent tests as **proxy** observations and genuine owner use for final product judgement.

**Failure is informative:** If a candidate loses drafts, hides essential history, repeats summaries, creates admin chores, invents evidence or feels unnatural, it fails. Do not approve because its screenshot looks polished or its tests are green. Refinement, rejection and even substantial rebuilding are expected options.

## 5. Commission discipline

Do **not** commission the whole roadmap at once. Each stage receives a bounded task, exact source baseline, test/acceptance contract, defined review surface and stop conditions. The next stage is authorised **only after evidence and owner judgement** from the prior gate.

**Separate authorisations are needed for:** broad data/schema migrations, fixture reset, authenticated Site deployment, production learner-data mutation, external paid competitor access and consented telemetry. A merged public GitHub PR does not mean a Sites version was published.

No redundant private/public implementation streams. The public repository is the shared development source and evidence home; protected Site release uses the separately guarded workflow in [SITES-RELEASE-WORKFLOW.md](SITES-RELEASE-WORKFLOW.md) when expressly commissioned.

## 6. Fresh-chat entry point

Start a new execution chat with this reading order:

1. This document, then [#51](https://github.com/frekland/Minamo/issues/51) and the [redesign strategy](LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md).
2. Current [#17](https://github.com/frekland/Minamo/issues/17), [#14](https://github.com/frekland/Minamo/issues/14), [#12](https://github.com/frekland/Minamo/issues/12) and [#18](https://github.com/frekland/Minamo/issues/18), including the latest comments/PRs (not only dated body banners).
3. [Architecture](ARCHITECTURE.md), [testing guide](TESTING.md), current Project/domain/Notes/MCP source and relevant exact acceptance receipts.
4. Historical [A/B lab](https://github.com/frekland/minamo-v2/pull/32) and [review](https://github.com/frekland/minamo-v2/pull/60) as lessons, **not implementation authority**.

**First report:** current source/deployment and testing-gate status; what is already complete; the smallest next authorised engineering tranche; evidence/rollback/test plan; and whether that tranche touches only synthetic fixtures or later product architecture. Ask before expanding into a full UI rebuild, schema migration or deployment. Do not recreate the scenario controller or design a new UI when the missing prerequisite is an earlier gate.

**Owner's guiding principle:** *Preserve proven capabilities and trustworthy learner history, but freely reconsider Minamo's information architecture and domain model when a better user experience demands it.* The next generation of Project UX should be ambitious and functional, not another isolated demonstration.
