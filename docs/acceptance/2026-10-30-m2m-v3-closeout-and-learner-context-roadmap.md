# Mood-to-Music V3 closeout and next learner-continuity experiments

**Decision record: 30 October 2026.** This is an orientation and backlog reconciliation, **not** a new acceptance test, production fix, scenario transition, transcript seal or Sites release. Historical reports and issue comments remain intact.

**Product-design continuation:** The longer-term goal is a coherent, active learner-visible Project environment, not only a better GPT read. The [recovered experience strategy, prior-art study gates and UX implementation method](../LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md) are the companion handoff after the #14/#17 test foundation; visual-agent acceptance remains deferred until an integrated candidate has value to compare.

## 1. What the six-session run established

The TEST-ONLY Mood-to-Music V3 S01/F–S06/K sequence completed, including separate independent cold-context reviews. The final review is **PASS within the bounded synthetic conversational-continuity scope**. It supports recovery of changing Project direction, canonical history, author-owned Notes, explicitly authorised updates, historical C01, annotations/Flags, source-vs-execution uncertainty and a useful next activity. It does **not** attest learner comprehension, exact full host ChatGPT traces, the real browser, provider integration or Site usability.

Final reported canonical state: **mood-to-music/3**, generation **legacy@0**, phase **K**, controller revision **21**, epoch **3**, no pending transition; transcript **TEST-ONLY-m2m-r3-s01-v77-20261030**, **open**, revision/eventCount **40/40**. Preserve the run, records and transcript; do not reset, seal or replay against the live fixture without a distinct decision and exact preflight.

Reports, including executing and independent evidence:
- [S01/F, #20](https://github.com/frekland/Minamo/pull/20), [S02/G, #21](https://github.com/frekland/Minamo/pull/21), [S03/H, #22](https://github.com/frekland/Minamo/pull/22).
- S04/I block [#23](https://github.com/frekland/Minamo/pull/23), failed retry [#25](https://github.com/frekland/Minamo/pull/25), source fixes [#24](https://github.com/frekland/Minamo/pull/24) and [#26](https://github.com/frekland/Minamo/pull/26), recovery/independent review [#27](https://github.com/frekland/Minamo/pull/27) / [#28](https://github.com/frekland/Minamo/pull/28).
- [S05/J executing #29](https://github.com/frekland/Minamo/pull/29) / [independent #30](https://github.com/frekland/Minamo/pull/30); [S06/K executing #31](https://github.com/frekland/Minamo/pull/31) / [independent #32](https://github.com/frekland/Minamo/pull/32). The latest [#16 run comment](https://github.com/frekland/Minamo/issues/16#issuecomment-6532281970) supersedes older pending-status banners.

All eleven evidence PRs remain unmerged at this checkpoint. Their historical findings should be retained, not overwritten or recast as eleven distinct product bugs.

## 2. Owner decisions for the next increment

1. **Preserve the imperfect synthetic React application.** Its storage/consent/clear edge cases and mistakes are part of a plausible fictional learner's evolving work, not a mandate to perfect v7 or to report a confirmed Minamo storage defect. Future replay should test whether changed Minamo architecture recovers, contextualises and handles that work faithfully. Do not silently revise accepted fixture versions.
2. **Prioritise reusable synthetic-model architecture before additional subjects or visual acceptance.** Prove the next evidence/diagnostic increment against the existing rich Mood-to-Music corpus; only then consider the separately selected HTB Cap and Plant-Screamer fixtures and isolated fictional User variants.
3. **Defer visual/UI model testing (#18).** The owner has already documented serious Project continuity, navigation and orientation shortcomings. Do not consume agentic visual-testing resources to repeatedly reconfirm this. Reopen visual experiments after an evidenced learner-context/data-model improvement creates a meaningful comparison target.
4. **Treat assessment language as a product-design defect to investigate.** Internal MCP guidance uses mastery/understanding framing, and genuine user feedback describes unsolicited “not mastered” disclaimers. Keep evidence-integrity safeguards but remove needless evaluative framing from ordinary save/read interactions. Neither affirmative nor negative mastery claims should be inferred from checkpoint existence.
5. **Improve MCP ergonomics for actual use as well as for testing.** Reduce redundant round trips/over-fetch, explain receipt namespaces and validation errors, preserve CAS/idempotency, and distinguish the user's deliberate “update Minamo” request from the individual domain writes needed to fulfil it. Do not introduce a mandatory Learning Session or general assessment model.

The product objective remains: open a Project, understand **where the work stands, what changed and why, what evidence is trustworthy, what remains uncertain, and how to continue**. Static stages, detached progress summaries and technically correct links do not by themselves satisfy that requirement.

## 3. Separate three evidence problems

| Concern | Existing home | Smallest useful next experiment |
| --- | --- | --- |
| **External code/test execution provenance** | [#11](https://github.com/frekland/Minamo/issues/11) | Select one pinned v3/v4 or v7 source claim. Attempt verification with the current GitHub connector, exact commit/path, source digest and available matching-CI or local command/log/exit receipt. Report precisely whether the claim is merely reported, source-verified, execution-evidenced, independently reproduced or unknown. Do not add a new artifact schema/runtime before observing the gap. |
| **MCP call/error/latency provenance** | [#17](https://github.com/frekland/Minamo/issues/17), stage 2 | Synthetic-only server-observed event metadata: run/session correlation, tool, timing, status/error, affected record or operation IDs, exact source/contract version. No raw owner Notes, tokens or arbitrary tool payload dumps. Distinguish server-received calls from model-submitted narrative and unobservable host/client failures. |
| **Canonical state-diff and learning-record meaning** | [#17](https://github.com/frekland/Minamo/issues/17), stage 3, with [#14](https://github.com/frekland/Minamo/issues/14) | Compare authorised pre/post Project/Question/Development/Library/Note relationships and revisions for a known event; prove what changed, what was preserved, whose statement it was, and what remains uncertain. Identify missing synthesis or write-contract limitations with exact source records and receipts. |

Do not merge these into one “missing transcript” defect. A model-submitted append-only transcript is an effective first layer, but it is not passive MCP instrumentation. An immutable source hash is not a test-execution receipt.

For the recovered product-philosophy, prior-art comparisons, and owner-observed UX problem statement, start with [Product context and prior-art lessons](../PRODUCT-CONTEXT-AND-PRIOR-ART.md). The architectural diagnosis below is motivated by those unresolved user-facing problems; visual/UI testing is deliberately deferred until there is a meaningful model improvement to compare.

## 4. The next actual product experiment: learner-context architecture diagnosis

The existing [resume projection](../../lib/learning-perspective-view.ts) explicitly returns the latest eligible checkpoint, **not a semantic synthesis** of an evolving Project. The [Project projection contracts](../../lib/project-contracts.ts) expose ordered Steps, linked Questions and a continuation pointer. This supports faithful individual reads but is a plausible explanation for disconnected, overly stage-led presentation; the cause and remedy still require targeted diagnosis.

### Baseline, without changing data

Use canonical Mood-to-Music states and the accepted K history to ask:

- Which currently authoritative direction, decisions, reasons, corrections, contradictions, Notes, Question status, source claims and evidence links are *actually stored*?
- Which parts can a normal MCP caller retrieve through one coherent Project-context read, and which require separately finding and stitching together records? Count calls, latency, extra IDs, failed/retried operations and context volume.
- Does latest-checkpoint selection obscure newer User preferences, abandoned options or older reasoning? Does an ordered stage plan wrongly dominate ongoing work?
- Can the same facts be reconstructed from F/H/K-style historical states without leaking later scripted answers? Is provenance sufficient to distinguish a learner report, GPT interpretation and independently observed result?

### Competing minimal remedies, evaluated before selecting one

1. **Derived read-side context projection:** a concise, source-linked temporal account of current direction, meaningful changes/reasons, relevant evidence, conflicts/open Questions and next possibilities. Reuse authoritative records; no silent rewriting or new mandatory taxonomy.
2. **Relationship/temporal contract improvements:** if the existing source records cannot express an essential link, authorship, supersession or uncertainty distinction, identify the precise missing field/invariant before a migration.
3. **Write-side orchestration improvement:** if explicit conversational updates require excessive fragile calls, examine a narrow transactional/bundled operation after measuring current tool choreography; retain receipts, revision guards and record ownership.

Test the smallest candidate on the **same versioned fixture**. Compare factual context fidelity, old/new decision visibility, source/evidence status, user authority, tool calls/latency, omitted or duplicated information and recovery behaviour. A clean API response that merely reproduces checkpoint prose is not success.

**Exit gate before new scenarios or a Project UI commission:** an evidence-backed diagnosis; a small reviewed server/MCP improvement or a reason no change is needed; deterministic state/provenance comparison plus independent cold-chat usefulness; explicit residual gaps. Do not infer learner mastery or design the UI prematurely.

## 5. Backlog routing

| Issue / PR | Current disposition |
| --- | --- |
| [#7](https://github.com/frekland/Minamo/issues/7) | Controller foundation already merged; eligible for issue closeout after review. |
| [#12](https://github.com/frekland/Minamo/issues/12) / [#15](https://github.com/frekland/Minamo/pull/15) | Rich V3 corpus delivered in a draft source PR. Next: preserve and generalise only the scenario/event contract needed for repeated architecture experiments; additional subjects remain later. |
| [#14](https://github.com/frekland/Minamo/issues/14) | Explicit update/C01 and fresh-chat continuity tested. Next: learner-context representation, MCP efficiency, authority and exact readback; Site UI segment deferred. |
| [#16](https://github.com/frekland/Minamo/issues/16) | Six-session bounded acceptance complete. Index and de-duplicate follow-ups; preserve transcript pending separate archival decision. |
| [#17](https://github.com/frekland/Minamo/issues/17) / [#19](https://github.com/frekland/Minamo/pull/19) | Stage-1 append/read works on hosted Site but remains unmerged as public source. Stage 2 server-observed traces and stage 3 canonical diffs are the next test architecture increments, **not** a generic framework. |
| [#11](https://github.com/frekland/Minamo/issues/11) | Focused external artifact/verification experiment, no premature general code runner. |
| [#13](https://github.com/frekland/Minamo/issues/13) | Useful reference quality and linked content; later presentation comparison after model/context work. |
| [#18](https://github.com/frekland/Minamo/issues/18) | Optional visual runner **explicitly deferred**; preserve arbitrary-phase/post-interaction targeting design. |
| [#24](https://github.com/frekland/Minamo/pull/24) / [#26](https://github.com/frekland/Minamo/pull/26) | S04 corrective source working in V79; integrate through reviewed stacked PRs and final-head verification. |
| [#4](https://github.com/frekland/Minamo/pull/4) / [#5](https://github.com/frekland/Minamo/issues/5) | Separate Cloudflare hosting; not part of this learner-context increment. |
| [#9](https://github.com/frekland/Minamo/pull/9) / [#10](https://github.com/frekland/Minamo/issues/10) | Recovery/export issue intentionally deferred. |
| [#1](https://github.com/frekland/Minamo/issues/1) | Public-release checklist wording/status requires separate housekeeping; not this test's gate. |

Public source integration stack remains **#26 → #24 → #19 → #15 → main**, subject to a deliberate review and final-head checks. The eleven documentation PRs may be merged/archived separately without changing historical reports. A GitHub merge is not a Sites deployment.

## 6. Immediate handoff

1. Review and incorporate this index; cross-link the relevant existing issues instead of creating duplicate defects.
2. Consolidate the public source stack and acceptance documentation with source/CI verification, **no automatic Sites deploy or synthetic reset**.
3. Commission one bounded synthetic-only **#17 stage-2 observed MCP trace** and **stage-3 state-diff design/pilot**, while collecting a read-only baseline of current #14 context-retrieval and MCP-call cost.
4. Use that evidence to select the smallest learner-context/data-projection experiment.
5. Repeat the Mood-to-Music model under the reviewed architecture before introducing new subjects; reserve optional visual assessment until a meaningful interface hypothesis can be tested.

This plan is about **using a synthetic learning model to discover and improve Minamo's own architectural limitations**, not polishing the fictional React program or maximising acceptance-test counts.
