# V88 hosted 3×3 acceptance, three-layer reconciliation and Project Workbench evidence

**Execution:** 31 October–1 November 2026 UTC. **Scope:** TEST ONLY, owner-gated synthetic fixtures in the existing Minamo Site. **Companion:** [three-layer protocol](three-layer-reconciliation-protocol.md), [#12](https://github.com/frekland/Minamo/issues/12), [#17](https://github.com/frekland/Minamo/issues/17), [#18](https://github.com/frekland/Minamo/issues/18), [#51](https://github.com/frekland/Minamo/issues/51), [implementation PR #64](https://github.com/frekland/Minamo/pull/64).

## Verdicts — keep distinct

| Gate | Outcome | Boundaries |
| --- | --- | --- |
| V88 implementation and release | **PASS** | PR #64 merged at 2026-10-31 23:00:54 UTC; native Site V88 deployment succeeded at 23:03:32 UTC, build SHA `ea255bce9a5d849e96c46383188af2a1cb21fd1c`, environment revision 9, MCP enabled, owner access unchanged. Focused implementation checks 4/4, native tests 24/24, CI passed (from PR/release evidence). |
| Hosted 3×3 controller/source binding | **PASS for fixture availability and read-only identity/provenance checks** | Nine distinct current-epoch synthetic Projects; 124 registered records; source-file hashes and committed setup receipts; no reset. This is not nine independently judged GPT dialogues. |
| Representative three-layer reconciliation | **PASS, bounded to declared test attempts and canonical synthetic state** | 14 contemporaneous model-submitted attempt/result pairs, 11 defensible server-observed matches, three explained intentional exclusions during multi-observer ambiguity; one *additional server-only diagnostic read* explicitly disclosed below. No shared cryptographic per-dispatch ID, host-complete transcript or all-path D1 proof. |
| Hosted cloud-browser experience | **Observed, not learner-quality PASS** | Direct signed-in Site inspection of ordinary Project, Question, source and return surfaces; synthetic corpus allowed controlled comparison. No real learner study or comparative prototype test. |
| Genuine independent cold-context GPT/MCP coverage | **NOT COMPLETE** | This evaluation ran in one continuing GPT conversation with accumulated context. An owner-gated hosted fixture and a new transcript run are not independent fresh ChatGPT sessions. Do not reclassify this as nine cold-context runs. |

## Exact fixture matrix and isolation checks

The controller's legacy Mood-to-Music V3 baseline remained separate (`mood-to-music`, no persona, phase K, epoch 3, revision 21). The nine overlay variants below each had generation `legacy@0`, epoch **1**, controller revision **1**, `pending:false` on controller listing, a committed exact-source load receipt and `syntheticOnlyWaiver:true`. Each `inspect` reported preserved historical revisions and synthetic-only setup cleanup, distinct run prefixes, exact pinned source-file SHA-256 hashes and no existing output identity collision. `libraryRecoveryVerified:false` is the declared synthetic waiver, **not** an independently passed Library recovery test.

| Project / fictional persona | Phase | Synthetic Project ID suffix | Registered records | Project rev | Registered continuation basis |
| --- | --- | --- | ---: | ---: | --- |
| Mood-to-Music · intermittent weekend prototyper | F | `m2m-weekend-v1-r1-project` | 16 | 4 | checkpoint / personal labels |
| Mood-to-Music · provider-documentation sceptic | K | `m2m-docs-v1-r1-project` | 20 | 4 | recent Note / provider Question |
| Mood-to-Music · privacy-led interface reviser | F | `m2m-privacy-v1-r1-project` | 16 | 4 | checkpoint / personal labels |
| Retired HTB Cap · command-log investigator | F | `htb-cap-command-log-v1-r1-project` | 11 | 3 | recent Note / service Question |
| Retired HTB Cap · packet/model explainer | F | `htb-cap-packet-model-v1-r1-project` | 11 | 3 | recent Note / capture Question |
| Retired HTB Cap · interrupted sparse recorder | K | `htb-cap-sparse-return-v1-r1-project` | 14 | 4 | recent Note / instance Question |
| Automatic Plant-Screamer · breadboard-first tinkerer | F | `plant-screamer-breadboard-v1-r1-project` | 11 | 3 | recent Note / audio Question |
| Automatic Plant-Screamer · careful calibrator | K | `plant-screamer-calibrator-v1-r1-project` | 14 | 4 | recent Note / calibration Question |
| Automatic Plant-Screamer · shared-space pragmatist | F | `plant-screamer-shared-space-v1-r1-project` | 11 | 3 | recent Note / behaviour Question |

All IDs in the table have literal prefix `TEST-ONLY-`. Sources: Mood-to-Music V3 manifest/seed plus per-persona overlay, Cap shared replay/subject plus overlay, Plant shared replay/subject plus overlay. The controller exposes the complete `fixture-files/1:<sha256>...` pins; checks compared the current pins, not hard-coded historic generations. Phase K was intentionally selected in three variants to test long-return information architecture; the other six were phase F. No further phase transitions or resets were performed. This verifies namespace/provenance distinctions and available evidence selection; it does **not** prove independent behavioural quality for every persona or exhaustively test every cross-target security rule.

## Coordinated three-layer experiment

- Scenario `retired-htb-cap`, persona `command-log-investigator`, fixture `retired-htb-cap/1`, phase F, epoch 1, generation `legacy@0`, source overlay hash starting `37059c10ae8e`.
- Persistent GPT-submitted run `TEST-ONLY-v88-cap-command-r1-reconcile-20261031`, session `S01`, model label GPT-6.1-Sol and Site V88 **model-reported**, transcript **open**, revision 28, 28 immutable entries. Each of 14 declared tool attempts was appended **before** dispatch, followed by the actual result. No prompt text or raw private payload was copied.
- Separately started observer for exactly that run/session, later **paused at revision 5**. It recorded 12 server-received synthetic-scoped events (10 successes and 2 errors). These are best-effort, not ChatGPT-host-attested. The two errors were `record_unavailable` and `invalid_flag_target`.
- All pairings below use tool name, order, time and actual outcome. The current contract offers no shared per-call correlation token.

### Call-by-call ledger

All times are **UTC, 2026-10-31**, and all elapsed times come from Minamo's server; `—` means no qualifying server event attributable to that model entry.

| Submitted step (attempt/result sequence) | Actual attempted tool / outcome | Observed call ID prefix, received HH:MM:SS, elapsed | Classification / canonical scope |
| --- | --- | --- | --- |
| A1 (1–2) | `query_minamo_records` success, synthetic discovery | — | **Expected exclusion**: another matching observer armed; broad discovery cannot safely bind to one run. A later single-observer D4 confirmed capture. |
| A2 (3–4) | `read_minamo_record` success | `ba32651e`, 23:33:49, 637 ms | **Corroborated**, Test A unchanged. |
| A3 (5–6) | `read_minamo_record` nonexistent synthetic Note → `record_unavailable` | `988efe8c`, 23:34:03, 134 ms | **Corroborated server error**, Test A unchanged. |
| P0 (7–8) | exact synthetic Article/bookmark preflight success | `67fe9b61`, 23:34:57, 928 ms | **Corroborated**; inactive, target rev 0. |
| P1 (9–10) | `preview_minamo_command` malformed record target → `invalid_flag_target` | `631bbf15`, 23:35:11, 0 ms | **Corroborated server error**; no write. |
| P2 (11–12) | corrected `preview_minamo_command` success | `b00c2d95`, 23:35:54, 775 ms | **Corroborated**; no write. |
| B1 (13–14) | `apply_minamo_command` Flag activation success | `40844168`, 23:36:33, 1,836 ms | **Corroborated**; synthetic bookmark added active rev 1 and 200 operation receipt. |
| B2 (15–16) | exact Article readback success | `72ee6de4`, 23:36:48, 880 ms | **Corroborated**; active rev 1. |
| X (none) | extra exact synthetic Article read used as pre-cleanup diagnostic | `2a32f7ce`, 23:37:09, 888 ms | **Server-only diagnostic**. It was outside the declared paired script and lacks contemporaneous Markdown. Do **not** fabricate a retroactive attempt or count it as a matched pair. It is attributable by surrounding workflow/time, but host-dispatch linkage remains unproved. |
| C1 (17–18) | `apply_minamo_command` Flag deactivation success | `333a5d0e`, 23:37:26, 1,823 ms | **Corroborated**; inactive bookmark rev 2 and 200 cleanup receipt. |
| C2 (19–20) | exact Article readback success | `6f088332`, 23:37:42, 874 ms | **Corroborated**; inactive rev 2. |
| D1 (21–22) | `query_minamo_records` synthetic discovery success | — | **Expected exclusion**, two observers armed. |
| D2 (23–24) | `get_minamo_workspace` synthetic discovery success | — | **Expected exclusion**, two observers armed. |
| D3 (25–26) | exact synthetic record read success | `dc367bee`, 23:39:17, 635 ms | **Corroborated** despite multiple observers: explicit namespace target binds. |
| D4 (27–28) | `query_minamo_records` success after other observer paused | `2e2a46ba`, 23:40:43, 1,069 ms | **Corroborated single-observer positive control**. |

The two armed observers were this Cap run and a pre-existing unfinished Mood-to-Music weekend smoke run `TEST-ONLY-v88-host-m2m-weekend-smoke`. The latter was **paused without changing or sealing its incomplete transcript**, preserving the genuine unfinished attempt. Discovery exclusion is enforced by `lib/test-observation.ts` to avoid cross-persona attribution; the standalone discovery positive control demonstrates eligibility without that ambiguity. No observer is left armed.

### D1/canonical checkpoints

| Checkpoint | D1 namespace version before → after | Canonical result | Observed calls in interval |
| --- | --- | --- | --- |
| `TEST-ONLY-v88-cap-A-readonly` | 7391 → 7391 | 26 unchanged, **zero changes** | 2 record calls, including real error; broad discovery excluded |
| `TEST-ONLY-v88-cap-B-activation` | 7391 → 7397 | exact synthetic bookmark **added active rev 1**; unique activation operation receipt 200; 26 other objects unchanged | apply + read, both success |
| `TEST-ONLY-v88-cap-C-cleanup` | 7397 → 7403 | same bookmark **active rev 1 → inactive rev 2**; distinct cleanup receipt 200; 27 other objects unchanged | apply + read, both success |
| `TEST-ONLY-v88-cap-D-discovery` | 7403 → 7403 | **zero changes**, 29 unchanged | 1 exact read; broad calls excluded |
| `TEST-ONLY-v88-cap-E-single-observer` | 7403 → 7403 | **zero changes**, 29 unchanged | 1 discovery call, captured |

The Flag target was the synthetic Article `TEST-ONLY-htb-cap-command-log-v1-r1-reference`; its Article revision remained 1. Activation operation `TEST-ONLY-htb-cap-command-log-v1-r1-v88-flag-activate2`; cleanup operation `TEST-ONLY-htb-cap-command-log-v1-r1-v88-flag-cleanup`. Both retain canonical receipts. Exact readback after cleanup found `active:false`, target revision 2; the controller inspect retained both receipts. No unrelated canonical learning or authored-record mutation appeared in these checkpoint diffs.

**Bounded PASS interpretation:** Every *declared* transcript attempt is classified, and every server-observed event is classified; the scripted mutations/error/readbacks and canonical snapshots agree. Three missing broad-discovery observations have a verified policy explanation, not a hidden-host conclusion. The extra server-only diagnostic **reduces completeness of the model ledger**, and a stricter requirement of exhaustive conversational transcript capture would be **PARTIAL**, not PASS. The present protocol explicitly permits disclosure of unmatched items and does not require host-complete capture. No finding supports claiming that the model captured all ChatGPT tool calls or that call volume measures learning quality.

## Information-architecture lessons from the same corpus

### Nine-way read-only continuation experiment

`manage_minamo_test_scenario compare-continuation` uses the **same continuation resolver** twice: ordinary mode excludes synthetic learning records by design; the owner-gated registered-fixture mode admits the exact synthetic namespace. Ordinary resolution selected `start` / the first curriculum Step in **9/9**. Registered-fixture resolution selected **recent Note in 7/9**, **checkpoint in 2/9**. This is controlled evidence about projection behaviour, **not** a defect finding for real learner accounts: ordinary exclusion is deliberate and must remain.

| Different information need | Corpus example | Implication to test in Workbench |
| --- | --- | --- |
| The experiment to do next can be newer than a checkpoint | Weekend Mood-to-Music checkpoint targets personal labels, but newer Note says labels seemed to persist **without a refresh** | Surface next verification and its source separately from checkpoint destination; avoid equating \"latest checkpoint\" with latest meaning. |
| Contradictory evidence has different authority | Plant breadboard case reports `play(1)`, but audible output was absent and physical wiring/power unverified | Display learner report, command, simulated result and physical observation with distinct confidence/authority labels and exact source links; never auto-promote inference. |
| Simulated state is not calibrated material reality | Plant careful calibrator rejects a universal \"15% moisture\" claim; dry/wet raw ADC bands and hysteresis are proposed, while sensor drift remains untested | Show current decision, rejected former framing and unresolved real-world validation together. |
| Source and consent constraints can stop a build | Mood documentation sceptic's provider Question, source notes and privacy boundaries | Put externally contingent claims and consent/source revision beside the current work, not buried in a Step sequence. |
| Returning after an interruption is not a curriculum restart | HTB Cap sparse recorder has an expired instance, sparse Notes and a new instance Question | Highlight ephemeral vs durable observations, last known safe boundary and one next action without inventing unseen work. |
| Local context and social consequences interact | Plant shared-space pragmatist's noise/behaviour Question | Connect implementation choices with shared-space constraints without scoring persona or imposing taxonomy. |

### Actual V88 cloud-browser observations

Directly inspected the signed-in hosted Site's Project list, Mood-to-Music weekend Project/Question/linked Note and Library source, Plant breadboard and careful-calibrator Project views. These are **browser observations**, not scripted server traces or actual learner outcomes.

1. Each synthetic Project page visibly carries an explicit TEST ONLY warning. Ordinary Project pages primarily show a title, authored summary, **\"Start first step\"**, Step list and nested Questions; the current concern or most recent Note is not prominent at the entry point. A late-revision Plant Project summary itself acknowledges the revised calibration direction, yet the primary action still reads \"Start first step / Parts and safety\" because synthetic saved-work history is excluded by design.
2. Multiple Mood-to-Music persona Projects have nearly identical display titles in the global Project list; internal unique IDs and provenance are safe, but the visible card does not identify the variant, current phase or recent distinguishing issue. This is principally a **test-corpus discoverability** friction finding.
3. Question → linked recent Note → related Library passage/source and back-to-Question is a useful existing affordance worth preserving. The \"Recent work\" sidebar can become extremely narrow, forcing a long Note to wrap into a tall one-word/two-word column. The default Project page lacks an equivalent coherent, source-linked \"where I left off\" panel.
4. Separate Project map, Resources, Steps, Questions and recent Notes give access to records, but navigation across them makes it costly to maintain a single selected focus. The corpus has enough canonical source relationships to trial a derived current-focus projection before assuming another authoritative table is required.

**Proposed first Workbench experiment (not authorised implementation):** over the identical nine source-pinned fixtures, compare (A) a visible Work/Questions/Evolution perspective switcher retaining one selected source, draft and return path, and (B) a fluid contextual page that exposes question/history/source around the same selected work. Both must provide actual Note writing/persistence, explicit learner-authorised GPT update, revision-specific evidence, uncertainty and independent resume. Measure exact source claim fidelity, wrong/missing revisions, return-path loss, steps/backtracks and mobile layout. Do not let the UI invent project status, infer learner ability or silently commit AI summaries. See [#51](https://github.com/frekland/Minamo/issues/51) for owner commission gates.

## What is *not* concluded

- **Independent cold-context sessions:** none established in this continuing chat; all nine fixture loads and comparisons are real hosted operations, but they are not nine fresh GPT conversations. A fresh-chat suite with exact source pins and per-run evidence is still needed.
- **Substantive persona fidelity:** the nine retained authored histories and distinct return cues were source/identity checked; their long-turn conversational usefulness has not been independently judged with external cold contexts.
- **Host completeness:** no ChatGPT host-attested dispatch trace, no proof of calls rejected before server receipt. Model Markdown and server-side observer have declared narrower scope.
- **Privacy:** synthetic-only guards, owner access and diff isolation were exercised; no physical-byte/all-path D1 audit or exhaustive production failure-injection test was performed.
- **Learning quality:** no real learner participation, measured gains, external hardware execution or HTB machine access. Fictional reports and supplied terminal captures are not independently run facts.

## Safe state and follow-up

- Temporary synthetic Flag **inactive** after exactly one authorised activation and deactivation; tombstone, revisions and both operation receipts intentionally retained.
- Cap observer **paused**, weekend observer **paused**; incomplete weekend Markdown left open without inventing a result. No uncontrolled observer remains armed, no fixture reset, no change to access/retention or private Site configuration.
- Nine overlay Projects remain loaded for future bounded Workbench comparison; their synthetic prefix and owner-gated setup provenance are intact. Existing real learner data and authored content were not deliberately modified.
- Next acceptance gate: genuine fresh ChatGPT/MCP conversations with independent context for representative and then remaining variants, preserving this already tested source-pinned corpus. Only then claim cold-context coverage; compare a Workbench vertical slice under a separate commission.
