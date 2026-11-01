# Retired HTB Cap — independent S06/K tutor continuation and bounded reconciliation

**1 November 2026 · TEST ONLY · documentation-only acceptance evidence · no Site release**

This is one fresh ChatGPT conversational execution for the **fictional learner**, not a retrospective reviewer or physical HTB test. The tutor response was written and logged before consulting the V89 research baseline. **Overall: bounded implementation/safety PASS; source-history and continuity useful with qualifications; three-layer per-call attribution PARTIAL; strict blindness PARTIAL; real learner UX NOT TESTED.**

## Exact hosted identity and safety

| Field | Verified value |
| --- | --- |
| Scenario / persona | `retired-htb-cap` / `interrupted-sparse-recorder` |
| Fixture version | `retired-htb-cap/1` |
| Generation / epoch / controller | `legacy@0` / `1` / revision `1` |
| Current state | Phase `K`, fictional request session `S06`, unchanged after test |
| Registered Project | `TEST-ONLY-htb-cap-sparse-return-v1-r1-project`, rev `4` |
| Registered records | 14; no registered synthetic Flags or checkpoint IDs |
| Rights | Owner-only TEST-ONLY tools; `syntheticOnlyWaiver:true`; `libraryRecoveryVerified:false` under the synthetic waiver |
| Controller setup | Committed load receipt `TEST-ONLY-v88-nine-cap-sparse-load-k-20261031`; no indicated pending transition |
| Transcript / observer run | `TEST-ONLY-htb-cap-sparse-return-v1-r1-s06-20261101-cold-02` |
| D1 checkpoint | `TEST-ONLY-cap-sparse-s06-readonly-20261101-02` |

The full source pin verified both at fixture inspection and run/observer creation:

`fixture-files/1:2436ad99ca346ff9d5df3802765d9c1a5349d2a89aaadd824c5c79b17840b384:3ad961fe355b981515f7f3737d2e8985144404cf49d4b83c459070cc13781ca8:4036b7f05ee5628d4e6a49f1527adc2cb21e56fb6b8c1b57076752021f7eae63`

These are SHA-256 fixture-file pins for `tests/project-scenarios/shared/subject-replay.mjs`, `tests/project-scenarios/retired-htb-cap/subject.mjs` and `tests/project-scenarios/retired-htb-cap/variants/sparse-return.mjs`, respectively, **not** a native Site commit hash.

No `load`, `advance`, `reset`, learner record mutation, Flag test, actual HTB access or deployment occurred. Instrumentation created one immutable model-reported transcript and one server observer, with a before/after D1 metadata checkpoint.

## Independent canonical reconstruction and actual tutor decision

These findings came from exact Minamo record/context/revision reads, not fixture source code or acceptance outcome tables:

1. **Original purpose:** a permitted, bounded retired Cap single-machine investigation; learn to distinguish service observations, HTTP evidence, hypotheses and verified results without a walkthrough. The retained Project rev 2 preserves that starting aim.
2. **What was supplied, not executed by this GPT:** a fictional 6 October Note contains `nmap -sV LAB_TARGET`, reported exit 0 and `80/tcp open http`, but no exact instance identity, timestamp or full log. A fictional 12 October Note describes a supplied `GET /` / `HTTP/1.1 200` excerpt with a page title; it is not an independently captured pcap, authenticated request or exploit proof.
3. **Changed decision:** the learner's 26 October Note and retained Project rev 3 retract the inference that visible HTTP means exploitable machine. The historical mistaken inference remains available; no exploit, credential or flag is demonstrated.
4. **Interruption and uncertainty:** on fictional 4 November, an old tab failed to connect; expiration was inferred, **not confirmed from platform status**. Project rev 4 changes the immediate goal to checking a fresh authorised instance and recording provenance. The current sparse Note rev 3 acknowledges missing details; operation receipts confirm Note revisions 1–3, although their earlier full bodies were not retrieved by exact rendition. A 23 November Question-linked Note specifically requests authorisation checks before commands, and no spoilers.
5. **Small, learner-controlled next action:** ask whether an authorised new instance is running and what the platform reports about its status/start time; if none, merely verify that status. Do not scan an assumed/stale address. The tutor did not require the learner to share an address.

The fictional user request is canonical `read_minamo_test_transcript action:turn, sessionId:S06`. The actual tutor response is immutable transcript **event 13**; the independent preliminary judgement is **event 14**, logged before the V89 research baseline was opened. The tutor did not save a Note or checkpoint.

## Retrieval and Workbench findings

- Broad `scope:resume` discovery by “HTB Cap” was **ambiguous across three separately registered personas with identical displayed titles**. The exact inspected selector prevented cross-persona contamination; a learner-facing variant-specific current concern would aid synthetic test discoverability.
- Exact Project `get_minamo_context` returned seven direct related records with `relatedTruncated:false`, but **omitted** the current `note-restart` and `note-expired` reachable through the instance Question. The broader `get_minamo_learning_context scope:journey` and exact Question target successfully retrieved them. This is a **bounded relationship-closure/projection issue**, not missing canonical data or byte truncation.
- The generic Project continuation returned `basis:start` / “Start first step” even though current Question-linked writing points to instance permission. This is **expected synthetic-exclusion behaviour** in the ordinary continuation path, not proof that ordinary learner Projects restart incorrectly. It nevertheless illustrates why a future Workbench must distinguish a first Step from current concern.
- Source revisions were preserved: Project rev 2 (original intent), rev 3 (correction), rev 4 (current focus), pinned Article passage/rendition, Question revs and Note revision receipts. One static chronology can mislead: synthetic database creation times clustered at fixture load, whereas fictional event dates were authored in Note text.
- Classify `reported-output`, `reported-observation`, `hypothesis`, `learner-retraction`, `source-claim` and `verified-operation` distinctly. A timestamped dashboard confirmation would be a learner-supplied observation, not a Minamo-verified HTB operation.

**Workbench consequence:** test a provenance-aware, permission-bounded two-hop Project→Question→Note context projection (including linked Note→Note), with explicit coverage/omission and exact revision destinations. Its first view should offer *current concern + changed decision + evidence uncertainty + one optional next action*, retaining original Steps, Notes, source anchors and revisions. No new authoritative status table or schema migration is justified from this test alone.

## Three-layer reconciliation

- **A — GPT-submitted Markdown:** 15 immutable events, transcript revision 15, status **open**. Includes fixture-defined S06 turn, intended read batches/results, actual tutor response, preliminary judgement, and a post-judgement ledger. Attempts T01–T02 were separate event segments; T03–T18 were individually enumerated *inside grouped segments*. Thus exact per-call dispatch identity is not independently attested.
- **B — server-observed MCP:** 18 qualifying read calls, all successful; `read_minamo_record` 9, `get_minamo_learning_context` 3, `get_minamo_context` 1, `read_minamo_operation` 5. All have same-tool/same-window model-reported counterparts. Repeated/concurrent same-tool rows only pair analytically by tool, order and time; there is **no shared per-call correlation token**.
- **C — canonical D1:** before `2026-11-01T09:44:14.152Z`, after `2026-11-01T09:51:06.192Z`, namespace version **8104** at both points; **36 unchanged entries, zero changes**. The state diff is authoritative for captured D1 metadata, not external lab execution.
- Observer status after reconciliation: **paused**, revision 1. Scenario still K/epoch 1/controller revision 1.
- Excluded controls: scenario/list/inspect, test-transcript and observation controls, and GitHub reads. Validation errors while learning the run-start, fixture-turn, append metadata and bounded observation paging contracts were corrected; they did not qualify as learner-read observer calls and made no canonical learning changes. No unmatched qualifying server call by **count/tool**, no server error in the eligible interval.
- **Limits:** GPT Markdown is model-submitted, server observation is best effort/filtered and cannot see host dispatches that never arrive; a D1 diff cannot prove individual call causality. No claim of complete ChatGPT host tracing.

### Observed call IDs and bounded model-side pairing

The ID mapping below is **analytical**, not cryptographic or host-attested. T01/T02 and T03 are distinguishable by tool/window; repeated same-tool calls remain order-only pairings.

| Attempt | Tool | Server call ID | Server result |
| --- | --- | --- | --- |
| T01 | `learning_context` | `4acc944f-a27b-4d1c-97da-cddb2c7061f2` | success (22072 ms) |
| T02 | `record` | `d861ee7c-cf7d-4ac7-b497-45897c9a6e9d` | success (643 ms) |
| T03 | `context` | `014ba91d-7624-48fe-9c50-a69ae011bbc5` | success (1044 ms) |
| T04 | `learning_context` | `4a8c3cf5-4aec-4a2c-9cf2-26d63ec43ac7` | success (15899 ms) |
| T05 | `learning_context` | `83d1ef71-17bf-4532-8931-dc674b1c5a02` | success (4620 ms) |
| T06 | `record` | `a87c5820-33f5-42a4-8798-9910e19acfdd` | success (639 ms) |
| T07 | `record` | `08cd389d-d7d0-46b4-b3a8-e4690f9ac3e8` | success (619 ms) |
| T08 | `record` | `a2b25504-44a5-47d9-a740-7f2604dedb82` | success (633 ms) |
| T09 | `record` | `ed66c218-ad26-431d-a8d7-6a21ca257cc1` | success (879 ms) |
| T10 | `record` | `bcae9c2a-b726-43cb-87d0-4ef62c34b9ea` | success (627 ms) |
| T11 | `record` | `376790d4-d040-4e19-bd2f-9b6137de2559` | success (633 ms) |
| T12 | `record` | `811f9d34-48c2-41db-9532-34f5a70897f9` | success (650 ms) |
| T13 | `record` | `a9aab3fe-6e95-4e95-88a9-2e5683fc394e` | success (642 ms) |
| T14 | `operation` | `f5f93bb7-734c-410e-bc33-d0ddab4086af` | success (124 ms) |
| T15 | `operation` | `e47aebba-25b3-4af4-a84d-60418913a135` | success (123 ms) |
| T16 | `operation` | `1631d367-0413-45c5-8b03-0e0c670e8be8` | success (129 ms) |
| T17 | `operation` | `1275e3ef-7707-4aba-839b-b79bf51eedf4` | success (128 ms) |
| T18 | `operation` | `215df35d-0436-4a1f-8d8a-8214de61d5f8` | success (125 ms) |

These private TEST-ONLY run/checkpoint IDs are reproducible evidence selectors within the authenticated Minamo owner tools, **not public URLs**. The public report publishes only sanitised metadata, not private tool inputs, user identities, session tokens or actual learner records.

## Seven separate verdicts

| Gate | Verdict | Why |
| --- | --- | --- |
| Hosted implementation correctness | **PASS (bounded)** | Exact source-bound S06 controls, canonical reads, observer, transcript and unchanged D1 state; no unverified deployment assertion |
| Source and historical-revision fidelity | **PASS with limitation** | Original/current Project revisions, exact Note/Question/Article references and revision receipts; earlier full sparse Note editions not independently read |
| Genuine cold-context coverage | **PARTIAL** | Fresh ChatGPT turn and canonical reconstruction, but the mandatory Workbench contract had a scenario-specific example visible before canonical reads; it was not adopted as evidence, yet strict exposure-free blindness is not provable |
| Three-layer reconciliation | **PARTIAL** | 18/18 tool-count/window matches and empty D1 diff; grouped Markdown event rows and no shared dispatch ID prevent exact pairwise attestation |
| Conversational usefulness | **PASS for fictional task** | Correctly asked permission/instance status before commands; preserved retracted inference, missing proof, spoiler boundary and learner autonomy |
| Information architecture | **CONFIRMED retrieval gap / design hypothesis** | Exact latest Question-linked Note missing from direct Project projection but recoverable; safe bounded closure test warranted |
| Actual learner experience | **NOT TESTED** | No independent learner interaction or fresh browser/mobile/navigation usability measurement in this conversation |

**Independence qualification:** the required information-contract document contained an illustrative sparse-Cap summary and was opened before canonical reconstruction. The tutor judgement was based on canonical Minamo reads and logged before consulting the dedicated V89 research baseline, but this is a method limitation of the prompt sequence and must not be concealed.

## Follow-up boundary

Compare this result with the independently executed Mood-to-Music and forthcoming careful-calibrator Plant-Screamer tests across source fidelity, unsupported inferences, retrieval coverage, practical tutor usefulness, instrumentation and Workbench effects. Do **not** generalise from one fictional history to a final Workbench design or implement the Workbench automatically.

Related: [three-layer protocol](three-layer-reconciliation-protocol.md), [Workbench information contract](../PROJECT-WORKBENCH-INFORMATION-CONTRACT.md), [V89 research baseline](2026-11-01-v89-workbench-research-baseline.md), [issue #12](https://github.com/frekland/Minamo/issues/12), [issue #17](https://github.com/frekland/Minamo/issues/17), [issue #51](https://github.com/frekland/Minamo/issues/51).
