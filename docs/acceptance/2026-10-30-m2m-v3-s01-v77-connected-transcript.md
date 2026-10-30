# Mood-to-Music V3 — first connected GPT/MCP transcript acceptance (S01/F, V77)

**Date:** 30 October 2026 (UTC)  
**Evidence status:** first executing-chat acceptance complete; independent cold-chat comparison and browser UI check pending  
**Scope:** synthetic owner-authorised TEST ONLY, not genuine learner data  
**Run:** `TEST-ONLY-m2m-r3-s01-v77-20261030`  
**Sources:** [run index #16](https://github.com/frekland/Minamo/issues/16), [transcript architecture #17](https://github.com/frekland/Minamo/issues/17), [fixture #12](https://github.com/frekland/Minamo/issues/12), [stage-1 PR #19](https://github.com/frekland/Minamo/pull/19)

This report is a **sanitised engineering/evidence index**, not a copy of the test transcript. The full nine-event, model-submitted ledger and exact fictional request are retained in Minamo's owner-only transcript facility. A cold reviewer should reconstruct canonical Project state **before** reading the ledger. No private account details, real Notes or credentials are included here.

## Baseline and progression

- Independently queried Sites: Minamo **V77** was the latest saved and successfully published version, with MCP enabled. Native deployed source commit: `52af42b8317d00571b5163fc655cb19f35d5144c`.
- Registered scenario: `mood-to-music/3`, server generation `legacy@0`, synthetic epoch **3**, initial phase **A**, controller rev **11**, no existing test transcript runs. Source/fixture pin `f7cc6dc54064b669929a384ea9464eb310b6d397`.
- Explicit owner authorisation covered registered synthetic fixture advancement only. Sequential controller advances **A→B→C→D→E→F** committed under five distinct TEST-ONLY operation IDs; controller revisions **12–16**. Historical phases A–E were **not** counted as observed GPT conversations.
- At **F**, the owner-only transcript `turn/S01` returned the exact versioned fictional User request: resume Mood-to-Music, inspect Project/Questions/Notes/Library, understand whether React labels survive mood changes, and create a genuinely useful Library reference on state, refresh and shared-device privacy without modifying User Notes or declaring evidence proven.
- The initial F snapshot had **no GPT-authored requested Library Article**, and the open persistence Question was revision 1.

## Execution and independent canonical evidence

| Operation / observation | Canonical result | Authority |
| --- | --- | --- |
| `append_minamo_test_transcript start` | New run reserved at phase F, epoch 3 | Server run identity |
| `append fixture.user-turn` | Exactly one S01 fixture-derived prompt | Versioned fixture, not host-delivery attestation |
| Project/Question/Note/Library discovery | Synthetic Project rev 4 before linkage; storage Question rev 1; relevant User Notes; existing fixture reference rev 1; separate JavaScript foundations reference rev 6 | Actual MCP read results |
| Editorial policy and React/MDN docs | Inspected before authoring | Source consultation, **not** execution evidence |
| Two manuscript previews | Final valid, zero advisory findings; no writes at preview | Read-only compiler feedback |
| `TEST-ONLY-m2m-r3-lib01-manuscript` | **Committed** original TEST-ONLY Library Article `ms-981d7783b0afc12486680fe1190a5441cccd8d5a`, rev 1; immutable source edition digest `9e4aac3d65abfac67b3fabd54e4f78f5b184f6322deff0ab276c7f202a5535d9` | Canonical publish and `read_minamo_operation` receipt |
| Exact Article readback | Synthetic=true; seven sections; worked React/storage examples, alternatives, privacy, official sources; links to Project and prior reference; three catalogue destinations; no structural findings | `read_minamo_record` |
| `TEST-ONLY-m2m-r3-link-lib01-project-20261030` | **Committed** explicit Project `personal-labels` stage → new Article relationship; Project advanced to rev **5** | Canonical relationship receipt and fresh Project readback |
| Scenario `inspect` retry | Phase F, epoch 3, controller rev 16; `requestedArticle` points to the generated Article rev 1 | Controller snapshot |
| Transcript readback | Final rev **9**, nine events, sequences 1–9 contiguous, S01 prompt=1/assistant-response=1, `incomplete=false`; run remains **open** | Transcript read API, model-report provenance |

The Article also has a reciprocal Article → Project link, so the underlying canonical relationship is present in both directions. **Browser-rendered navigation was not exercised**; the existence of records/links does not prove the UI click path.

The fictional Note reported labels remained while changing calm → energetic → calm, but explicitly said **no full refresh had been tested**. The supplied terminal capture claimed a successful build excerpt without a complete log, timestamp or proven checkout-to-output identity. The executing GPT neither adopted either claim as independently verified nor recorded a checkpoint.

## Observed friction, recording gaps and limitations

1. **Two failed transcript starts, then corrected success.** An initial start occurred while the fixture was at A; a second attempt at F still supplied disallowed start fields / a model label with spaces. Both returned `invalid_test_start`. Inspection of the published tool/source contract revealed that a start accepts only identity/labels, with a registered F–K phase and restricted label syntax. Retrying with valid parameters succeeded. **Interpretation:** operator/model invocation mistakes, not proof of a server bug. The generic validation message could be made more field-specific in a later small usability change. The failed attempts were truthfully recorded after successful run creation, since the recorder cannot start at A.
2. **Transient controller read failure.** One `manage_minamo_test_scenario inspect` returned MCP `-32603 Internal error`. A single read-only retry succeeded and recovered phase F/rev 16 plus the requested Article pointer. No logs or recurrence evidence were collected; **do not triage this as a confirmed persistent defect**.
3. **Project↔Library UI not observed.** Both canonical relationships and deep-link destinations exist; navigation through the rendered Site on desktop/mobile is **NOT TESTED**. This is a coverage gap, not a UI failure finding. Optional visual acceptance remains separately scoped in [#18](https://github.com/frekland/Minamo/issues/18).
4. **Learner execution not observed.** The fictional learner's refresh behaviour, source-to-build provenance, console output and privacy behaviour remain unverified by design. No labels or understanding were declared proved.
5. **Model-submitted transcript, not host-attested capture.** Events truthfully record submitted Markdown, the exact fixture prompt, intended response and reported MCP attempts/results, but do not provide automatic passive interception, full ChatGPT stream attestation, independent timings or exhaustive hidden failures. The API says `hostTranscriptAttested=false`. Server-side tracing is a deferred complementary layer, **not** a failure of stage 1.
6. **Pre-run chronological boundary.** V77 preflight, A→F advances and the two failed starts occurred before a valid F-phase run was available; they were captured as a transparent retrospective event rather than pretending to be individually timestamped server-observed trace entries.
7. **Independent cold reviewer still pending.** Same-chat readback and canonical receipt checks were performed; a separate, cold authorised ChatGPT conversation has **not yet** reconstructed canonical state blind and compared it with this transcript.

These are separate classes of evidence: operator call errors, one transient service error, explicit non-tested surfaces, and known architecture limits. None warrants claiming an unobserved defect or automatically expanding the implementation.

## Transcript coverage and safety boundary

Final `read_minamo_test_transcript` returned:

- `runId = TEST-ONLY-m2m-r3-s01-v77-20261030`
- `transcriptRevision = 9`; `eventCount = 9`; no missing committed sequences
- S01 `promptSegments = 1`, `assistantSegments = 1`, `incomplete = false`
- `status = open`, `epoch = 3`, `phase = F`, `hostTranscriptAttested = false`

The nine events consist of the fixture request, preflight report, contextual reads, authoring preview, publication result, canonical readback/link result, controller retry report, actual intended assistant response and a first-pass transcript-readback summary. Raw transcript detail belongs in Minamo, not GitHub.

The scenario controller created fictional User Notes during approved historical fixture progression; **GPT did not create, rewrite or assess User Notes** during S01. GPT wrote only the authorised synthetic Library Article and explicit synthetic Project relationship. No genuine owner learning records, checkpoint, reset or deployment were involved in this test.

## Assessment and next evidence gate

**First executing-chat stage-1 transcript acceptance: PASS, bounded.** A normal connected GPT session discovered an exact fictional turn, used ordinary MCP reads and publication, produced an original Article, preserved evidence uncertainty, recorded an intended response incrementally, and read back a durable chronological ledger with matching canonical receipts. This is **not** a claim of successful cold-context independent acceptance or visual acceptance.

**Next:** a distinct read-only ChatGPT session must (1) reconstruct the phase-F synthetic Project, revisions, Questions, Notes, Article, links and operation receipts **blind**, (2) only then discover this run using Minamo transcript `list/read`, (3) compare every claimed mutation and evidence boundary, and (4) report mismatches, omissions or inaccessible links without writes or fixture advancement. Keep source code and GitHub report out of the blind reconstruction phase. If it passes, S01 is ready for a deliberately authorised S02/G continuation in the same open epoch/run—**not** a reset.

No additional fixture or production deployment is warranted by this first pass.