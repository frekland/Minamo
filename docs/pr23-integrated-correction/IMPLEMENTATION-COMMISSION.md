# Minamo V2 — Integrated critical-friction correction

**Owner engineering commission · 23 October 2026**  
**Repository:** frekland/minamo-v2  
**Implementation home:** extend this PR branch; base and production target are the current V2 main and the existing owner-private Minamo V2 Site  
**Evidence baseline:** [draft PR #23](https://github.com/frekland/minamo-v2/pull/23), including its dated field reports and [evidence register](https://github.com/frekland/minamo-v2/blob/docs/three-track-friction-observation-20261023/docs/friction-observation/EVIDENCE-INDEX.md)  
**Already integrated:** [PR #24](https://github.com/frekland/minamo-v2/pull/24) and [PR #25](https://github.com/frekland/minamo-v2/pull/25); last confirmed private release at commission creation was V19

**Initial state:** This PR initially contains the commission, not implementation or an assertion of tests/deployment. The owner's separate Work execution prompt authorises implementation, independent review, merge and deployment in one continuous run. Leave PR #23 itself open, draft, evidence-only and unmerged.

## 1. Mission and standard of success

Deliver a coherent, trustworthy and enjoyable Minamo V2 learning experience **before the owner's next substantial user-testing session**. Address the substantive outstanding friction recorded in PR #23: genuine rich Notes writing and calm save behaviour; precise, unobtrusive Flags/Annotations; usable saved learning and cross-context continuity; focused Journey/Investigation/Library navigation; strong practical educational material; and an MCP that materially improves **GPT tutoring, learner continuity and high-quality resource creation** while reducing avoidable operational friction. Treat MCP learning effectiveness as a **first-class product outcome**, not a secondary schema-polish task.

This is a **complete implementation and release commission**, not another assessment, architecture proposal, prototype, or request for the owner to perform testing in place of engineering acceptance. Quality is judged by the **rendered, integrated learner experience** as well as technical correctness. A green build and large test count alone do not establish completion.

**Commission outcomes and safeguards, not line-by-line solutions.** Work owns architectural, technical, educational and interaction decisions. Earlier suggestions (for example Tiptap, ProseMirror, CodeMirror, particular autosave strategies or a specific checkpoint UI) are candidates, not instructions to implement those technologies. Choose and revise solutions in response to code, history, tools and observed results. Reuse a proven implementation when appropriate; do not mechanically transplant V1 or rebuild V2 from scratch.

## 2. Scope: resolve causes, not incident numbers

First reconcile PR #23's *latest dated observations* against the actual current main, the installed Site, and implemented/owner-tested PR #24/#25 outcomes. Distinguish **already resolved, improved but incomplete, still failing, expected validation, quality concern, and untested**. Do not reproduce an old regression by blindly following an earlier screenshot or historic PR state.

The groups below describe desired results; they do **not** prescribe separate implementation phases or a component design.

| Concern and evidence | Required outcome |
|---|---|
| **Notes composition and save quality — C-20/C-21** | Natural live rich writing for headings, bullets, emphasis, quotes, links, code blocks and private inline images; credible editor-like code composition; preserve the good multi-Note/tab, docking, sizing and mobile behaviours. Writing and formatting must be clear while composing, without obligatory source-marker interpretation or preview toggling. Autosave must be unobtrusive under continuous writing yet reliably retained, acknowledged, conflict-aware and recoverable. |
| **Precise marking and touch interaction — C-04/C-18/C-19** | Flagged *exact words* are visibly but discreetly identifiable; overlapping Flag and Annotation records both remain discoverable, editable/unflaggable as applicable, without trailing per-paragraph icon/count clutter. Ordinary taps remain passive, including after a mark popup; deliberate selection is reliable on mouse, keyboard and Android native selection. Let the learner meaningfully Flag/Annotate relevant saved-learning text or its reliably identified underlying evidence, with stable provenance/revision semantics rather than bolting unsafe Reader anchors onto transient summaries. |
| **Learning continuity — C-15/C-16/C-17, B-12/B-13/B-14** | The learner can return to a Journey stage or Investigation and immediately see what was done, what was *actually evidenced*, working/provisional decisions and their reasons, what remains unresolved and the next useful action. Home/Continue and related Stage–Investigation views agree without duplicating checkpoints, misassigning primary targets or inventing completion. GPT-facing context/checkpoint ergonomics foreground this continuity so new chats are much less likely to restart settled-but-provisional discussions. Distinguish retrievable data from a model's interpretation: do not promise deterministically perfect GPT conduct. |
| **Navigation and learner-first interface — C-01/C-02/C-06/C-07/C-12/C-13, residual C-14** | A clear route from Journey overview to hands-on task, contextual reference and back; intelligible stage and subject/topic navigation, usable ongoing long-reading navigation on mobile, strong section hierarchy. Remove unwanted 'Reading options' and redundant GPT/editorial/status/checkpoint administration from *ordinary learning surfaces* rather than just adding nested disclosures. Keep legitimate owner controls findable in appropriate management contexts and preserve accessibility. |
| **Practical educational substance — C-05/C-11, A-05/A-09, B-15/B-16** | Learner tasks start doing and inspecting real programming, paced for a beginner, not repeated meta-instructions or a long speculative product-design detour. Library articles are reusable, technically substantive explanations with meaningful code, pitfalls, diagrams/media/references where useful—not copies of Journey steps. GPT-generated examples must distinguish fictional illustration from observed results and must not bias a purported evidence-based choice. Stage intent/outcome/checkpoint data should be accurate and usable; content-quality checks should detect important failures without pretending deterministic checks can certify pedagogy. |
| **MCP learning quality, continuity and resource creation — Track A, B-12–B-16, C-05/C-11/C-15–C-18** | Make GPT substantially more effective at authoring and improving rich, reusable, well-connected Journeys, Investigations and Library resources, and at retrieving and *using* learner decisions, reasons, evidence, misconceptions, practical attempts and next actions across sessions. Resource quality and tutor continuity are central MCP acceptance results, not just healthy writes or tool discovery. |
| **MCP server/agent efficiency — A-01–A-12 as applicable** | Investigate what safe mechanical work belongs server-side versus with GPT. Reduce unnecessary schema construction, preview/retry loops, read/write calls, response bulk and perceived latency, **especially during live learning**. Preserve intentional editorial gates, diagram/source safeguards, provider activation boundaries and correct rejections. A-10 had PR #24/#25 correction and installed-client verification; do not reopen without fresh evidence. Treat successful safeguards, caller mistakes and qualitative overhead separately from defects. |

**Preserve already successful outcomes.** PR #24/#25 introduced owner-positive CodeMirror 6 *reading*, passive paragraphs, connected mobile diagrams, simplified media/reader chrome and corrected MCP action guidance. Preserve them and their exact-source guarantees while addressing remaining issues. No unnecessary new music-provider integration, new AI backend, wholesale corpus rewrite, standalone code runner or unrelated feature backlog is authorised.

**Existing Mood-to-Music content is in scope, narrowly.** Work may make **targeted editorial improvements to the existing 15-stage Mood-to-Music Journey, associated Investigations and relevant Library material** where needed to deliver better authentic lessons and meaningful acceptance examples. Preserve established record identities, meaningful stage/section targets, related links, previously saved learning and recoverable editions. Reuse/improve existing references rather than duplicating Journeys or cloning Library topics. Keep research/provider claims current and sourced. Never fabricate the learner having run JavaScript, React, Spotify calls or an experiment.

## 3. MCP as learning and resource-creation infrastructure

**First-class requirement:** Optimise the integrated **learner ↔ GPT ↔ Minamo MCP ↔ Site** workflow for **educational quality, resource-creation capability and responsiveness** together. A faster validator, a successful publication receipt or a shorter context response is not success if the produced lesson is thin, useful learner reasoning is omitted, or GPT wastes the learning session repairing its payload. Conversely, do not impose needless editorial ceremonies or large context transfers on ordinary tutoring in pursuit of hypothetical quality improvements.

### 3.1 Two distinct workload profiles, with different success criteria

**Resource creation and revision — quality first, mechanical friction low.** GPT must be able to author or improve technically deep, engaging, original reusable Articles, practical Journeys, genuinely open Investigations, appropriate diagrams, example code, references, optional media and meaningful cross-record relationships. Rich source should compile and publish through efficient guarded operations, not require GPT to hand-assemble every internal ID, block, rendition, metadata field or separate relationship mutation. The server can normalize supported representations, resolve explicitly declared targets and source maps, offer relevant existing-content candidates, derive safe metadata, validate integrity and apply atomic updates with compact actionable results. More substantial inspection or validation is justified when publishing long-lived educational material; do not sacrifice completeness or novelty merely to minimise calls. Reuse and targeted improvement should remain easier than duplicating resources.

**Active GPT-guided learning — fast, focused and interruption-free.** A typical return to an exact Journey stage or Investigation should let GPT rapidly find the real current task, salient saved choices and *why*, relevant practical evidence and misconceptions, linked reference context and a high-priority next action. Prefer bounded, context-appropriate server aggregation and coherent tool responses over repetitive searches or verbose raw checkpoint/history dumps. Ordinary tutoring and reading need **no automatic writes, sessions or achievement inference**. An **explicitly requested** checkpoint should be a small, discoverable, robust action that captures meaning and preserves reasoning without an elaborate publication ceremony. Return useful responses quickly enough that Minamo helps rather than interrupts live teaching; investigate real latency and token/payload waste rather than assuming a single giant response is optimal.

### 3.2 Place responsibilities where they create quality and speed

Investigate the **current architecture** and decide where transformations, context assembly, deduplication, indexing, batching, validation, caching and source/revision coordination belong. The division below is a **reasoning principle, not a mandatory API design**:

- **GPT:** adaptive teaching, instructional depth, interpreting the learner's understanding, designing useful exercises, assessing semantic relevance, making provisional educational choices and deciding which authentic work warrants an owner-requested checkpoint.
- **Minamo server:** owner-scoped reliable retrieval and bounded context assembly, safe deterministic manuscript/metadata transformations, declared relationship/target resolution, schema adaptation, source/rendition mapping, revision guards, atomic transactions, useful validation, efficient operation receipts and recovery.
- **Minamo Site:** understandable learning perspective and history, navigation and access to underlying evidence without requiring GPT to reinterpret raw database records for the learner.

Do not turn deterministic server machinery into an unaccountable teacher, silently decide semantic equivalence, infer mastery, synthesise unsupported facts, auto-write learning records, or add a paid/background AI inference service. Do not force GPT to do mechanical schema chores the server can safely perform. When judgement genuinely depends on meaning, expose appropriate candidates, warnings and context for GPT to decide. Explore pragmatic solutions rather than requiring new infrastructure, endpoint names, model providers or a broad rewrite.

### 3.3 Preserve information quality while reducing MCP burden

Specific problems worth investigating—not dictated patches—include: author-side enum/schema discovery; stage intent/outcome/checkpoint extraction; Area membership and purposeful cross-links; preservation or graceful fallback of diagrams/code/media; efficient version-safe source edits; compact preview and commit receipts; context retrieval across related Stage and Investigation targets; decision/rationale/next-action checkpoint fidelity; and the difference between *retrieving* a checkpoint and **GPT actually respecting it**.

Guard against two failure modes:

- **Overly prescriptive publishing:** cumbersome mandatory fields, redundant approval-shaped previews, large schema errors and repeated revision/relink passes consume GPT effort and reduce time spent creating high-quality material.
- **Over-simplified publishing/retrieval:** stripped editorial checks, guessed links, shallow generated resources, oversummarised checkpoints or giant indiscriminate context responses worsen quality, provenance or live learning.

Find a deliberate balance appropriate to each workload. A small number of focused reads may beat a single excessive payload; a justified extra authoring check may be better than faster low-quality publication. No arbitrary call-count target or invented latency SLA is imposed.

### 3.4 Evidence Work must gather while implementing

Establish a **credible baseline and post-change comparison** for a few representative operations on the actual current system (or clearly marked equivalent safe fixtures), using realistic request/response paths, not fabricated performance numbers:

1. **Build/improve resources:** author or improve a bounded rich Journey/Article/Investigation set with linked reusable technical references, code, diagram/media where pedagogically justified; verify publication, real learner-facing richness, authoritative provenance and preserved existing identities.
2. **Resume and tutor:** retrieve a Stage checkpoint and linked Investigation context, including a provisional choice with rationale, a misconception or attempted task and the next practical exercise; evaluate relevance, omissions, redundant calls, response size, perceived/observed latency and whether the GPT continuation *uses* the context.
3. **Explicit checkpoint and revise:** capture a learning update without false achievement or transcript dumping; correct/reconcile one checkpoint or resource safely and check that related Site/GPT perspectives remain truthful.

Record, where observable, **MCP call count, round trips, elapsed latency, response size/token overhead, schema retries and meaningful learning output**. When precise timing/tokens are unavailable, state the limits and use honest comparative traces rather than invented benchmarks. Evaluate quality separately from speed: source-valid material must also be useful for a real learner; rapid retrieval must preserve decision and evidence fidelity. Prefer measured improvements to arbitrary infrastructure optimisation or elaborate cost studies.

**Do not stop at instrumenting or reporting these scenarios.** Implement improvements, rerun representative workflows, address material regressions, and include a concise, evidence-linked quality/efficiency trade-off in the final receipt. Preserve the installed-client discovery and MCP reinstall boundary in §5 below.

## 4. Use prior engineering evidence actively and selectively

The repositories have unusually rich implementation and regression history. Treat it as an **engineering knowledge base**, not an appendix or a requirement for an exhaustive preliminary audit.

When a significant problem is encountered, inspect relevant prior successes, failures and trade-offs in both **frekland/Minamo (V1; read-only reference)** and **frekland/minamo-v2 (V2)**. Compare actual implementations, contracts, historical commits, design decisions, PR reviews, user-observed regressions, corrective attempts and final acceptance evidence. Record only the important lessons shaping the solution.

Useful starting points (not a fixed research checklist):

- V2 **AGENTS.md**, **STATUS.md**, **docs/SOURCE-SYNCHRONISATION.md**, implemented architecture/security and current issue #1 authority.
- PR #23's evidence index and its **latest field notes**, especially V19 Android Flags/selection, saved-learning presentation, real cross-chat tutoring and Notes composition/sync.
- **docs/ux-regression-review/V1-V2-INTERACTION-REGRESSION-REVIEW.md** and relevant V1 Notes/reading controllers; review previous successful interaction patterns without importing V1's obsolete application structure.
- V2 learning-experience/continuity, manuscript-authoring, reader-polish and release evidence from PRs **#15, #18, #19, #24 and #25**, including corrections and known acceptance limits.
- Current functional source and tests around Notes, reading interactions, Learning developments/context, Journey/Investigation, Library/catalogue, manuscript parsing and shared MCP/domain validation.

Investigate historical context **just in time alongside real implementation**, delegate bounded source/history comparisons to subagents where beneficial, and avoid spending the commission rediscovering the entire repository or repeating past audits. Neither the latest implementation nor V1 nostalgia is automatically correct.

Use connected **Sites, GitHub, Context7, Stack Overflow for Agents (SOFA), Firecrawl** and other suitable resources when they materially improve a decision. Verify external claims against current official source and project contracts; don't blindly accept plugin snippets. Subagents can work on independent concerns, but a coordinating agent must own shared data contracts, UX consistency, integration and final accountability.

## 5. Authority and engineering freedom

- **Implement, integrate, test, independently challenge, correct, merge and deploy** the finished scoped work in **one continuous Work task**. Extend this commission's branch/PR with source, tests and concise evidence; do not open another planning PR or return only a recommendation.
- Determine an efficient execution order; prototype alternatives, parallelise genuinely independent work and revise designs in response to findings. Do not require owner approval for routine architecture choices, dependency selection, intermediate commits, reviews, corrections, merges or private V2 release.
- Make a source-grounded choice when the PR #23 wording and current behaviour differ. Preserve owner intent and report meaningful deviations rather than merely scoring incident IDs.
- **Owner intervention exception:** request a Minamo V2 MCP reinstall/reconnect only when actual tool/catalogue evidence shows it necessary, ideally at the relevant publication/verification boundary. State the precise reason and required action once; continue other feasible work and resume the same commission after confirmation. Do not ask for speculative reinstalls or repeated routine approvals.
- Keep the existing owner-private Site, authentication/storage identity and cost profile. No additional paid inference, external AI service or new hosting dependency is authorised. V1's Site/data and frekland/cyber-learning are **read-only**; do not execute PR #12 or any other unrelated outstanding PR/issue.
- **Real learner work is protected.** Do not silently edit, withdraw, delete or fabricate the owner's genuine Notes, Flags, Annotations, Runs or Learning developments. Testing writes must use distinguishable **synthetic** data with recoverable Trash cleanup and verified absence from active/Continue/Recent views. The preceding narrow editorial improvement authority does not permit rewriting genuine learning evidence.

## 6. Integrity and release invariants

Whatever implementation wins, maintain or improve:

- Owner-only authentication, owner-scoped private data/assets, existing source-use/permission checks and deliberate third-party media activation.
- Exact canonical record/rendition/section/part and UTF-16 selected-range identity, with safe retained historical editions, Unicode and overlapping annotations.
- Revision/CAS guards, idempotent operation receipts, uncertain-outcome recovery, conflict handling, local draft retention, private image asset identity and Trash/restore behaviour.
- GPT/learner provenance distinctions: user report is not observed execution; hypothesis is not a test result; reading or saving a checkpoint never automatically grants stage completion or mastery.
- Existing data/backward compatibility and an accessible keyboard/mobile interface. Substantial editor/serialization or Learning development targeting changes require migration/round-trip tests, not silent lossy conversion.
- Source synchronisation between GitHub and the **separate Sites native source**, with expected-head checks and exact GitHub/native **tree** correspondence before release. A merged GitHub PR does not itself prove a Site deployment.

Avoid replacing established checks with optimistic UI messages. Improve perceived responsiveness without weakening actual persistence or safety.

## 7. Acceptance: demonstrate realistic outcomes, not test counts alone

Use an efficient mix of automated tests, end-to-end interaction, hosted Site checks, current MCP tool readback and independent review. Work is accountable for **identifying and correcting defects revealed by its own testing**, not merely documenting them for another commission.

The following are representative must-pass experiences; agents may add cases or choose test mechanisms:

1. **Compose and recover Notes.** Edit a real-feeling synthetic Note with headings, nested lists, emphasis, quotations, links, fenced/language-aware code and embedded private images. Verify live appearance, save/reopen round-trip, image presence, undo/redo, switching Notes, docking, desktop/mobile keyboard and interruptions. Exercise rapid typing, offline/unacknowledged saves, conflict/stale revision and recovery. Confirm calm non-misleading status, no lost draft and no accidental remote image leakage.
2. **Mark exact passages.** Flag and Annotate separate and overlapping selections within one paragraph; preview/edit/delete/unflag the correct item without a trailing marker taking over. Verify passive taps after popup dismissal, native Android-like selection, mouse/keyboard selection, history/rendition changes, Unicode, retained drafts and accessibility. Test meaningful mark behaviour on saved learning or the legitimate evidence it represents.
3. **Resume authentic learning.** An explicitly saved **synthetic** stage checkpoint should produce an immediately useful Stage, Home/Continue and related Investigation experience, with established/provisional/open/next distinctions and direct evidence links. Correct or withdraw a checkpoint and verify that dependent views do not keep falsely authoritative stale summaries. Test that no checkpoint or completion is inferred from passive use.
4. **Fresh tutor handoff.** Exercise installed GPT/MCP learning-context retrieval with a previous provisional decision, its rationale, an actual attempt/misconception where supported, an unresolved question and an agreed practical next action. Verify that the relevant context is available **with minimal avoidable tool overhead** and that the resumed tutoring demonstrably draws on it rather than reflexively restarting product choices. Separate observed tool traces from unguaranteed model behaviour; do not label one agent example universal proof.
5. **Practical learning navigation/content.** Starting on mobile and desktop, reach a beginner JavaScript/React task in the existing Mood-to-Music Journey, open a genuinely informative independent Library reference, understand a useful code/diagram example, return to the exact task and find the right next action. Judge instruction quality and readability independently; check that displayed text/code and metadata match saved source.
6. **MCP educational authoring, efficiency and regression protection.** Prove that GPT can create or improve a genuinely substantive, reusable and well-linked resource with proportionate mechanical effort, discoverable checkpoint shapes/enums, meaningful catalogue/stage metadata and correct editorial/source protections. Test compact, relevant cross-session learning context and an explicit checkpoint in the live-tutoring path. Compare representative pre/post MCP calls, response bulk, latency and schema retries **alongside** content/tutoring quality, as §3 describes; avoid arbitrary targets and invented metrics. Verify legitimate guarded publication/updates, intended rejections, preserved diagrams/media/source rights and PR #24/#25 functionality. Check *installed* tool descriptions/runtime after deployment; source declarations alone don't count.

Run the repository-mandated typecheck, production build and full test suite, plus focused browser/interaction tests on relevant narrow/mobile and desktop layouts. Actual physical Android owner acceptance and third-party provider/network conditions cannot be claimed unless really exercised. Work's own credible simulated/mobile testing should precede further owner testing, not be replaced by a request for it. Test code/assets/privacy and accessibility as relevant.

Complete a **genuinely independent integration and learner-quality challenge** using another agent or separated review context where feasible. Review the rendered result and cross-feature risks, not just the diff. Correct material findings before declaring acceptance. Keep this proportionate; avoid ritualised multiple review passes without a practical reason.

## 8. Definition of done and reporting

Finish this scoped commission only after integrating and verifying a meaningfully improved experience. Extend **this PR** with the implementation and a concise final evidence report covering:

- Material solution choices and why (including reused/adapted/discarded V1/V2 lessons, without an exhaustive archaeology log).
- A PR #23 **finding-disposition map**: resolved/owner-positive preserved, materially improved, expected/invalid observation, and genuinely outstanding, with links to relevant source/tests and honest limitations. Don't silently mark untested items fixed.
- Test/build results, representative rendered learner workflows, independent review corrections, existing-content improvements, affected-record readback, synthetic cleanup and negative integrity tests.
- A concise MCP **learning-quality / authoring-friction / live-tutoring responsiveness** assessment: the before/after scenarios and available measurements, what safely moved server-side, what remains GPT judgement, achieved trade-offs and any verified limits.
- Exact merge commit, GitHub/native source identities and common tree, private deployment/version receipt, installed MCP verification and any real constraints requiring owner action.
- Residual issues stated succinctly and accurately. Do not conceal critical failure behind green CI. If an unavoidable external blocker prevents an outcome, report its precise impact and safe next action without manufacturing success.

**Operational target:** The owner should be able to resume actual beginner programming with GPT and Minamo after this work, without first having to undertake another round of interface triage, re-explain saved decisions, or worry whether ordinary writing and marking are being preserved.

---

**Commission-only preparation note:** No runtime code, learner records, original Minamo Site, deployment or tests were changed by creating this documentation-only PR.

