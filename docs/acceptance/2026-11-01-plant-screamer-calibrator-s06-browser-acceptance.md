# Automatic Plant-Screamer / careful-calibrator — S06/K hosted MCP and browser acceptance

**1 November 2026. TEST ONLY. Documentation/evidence report; no UI, schema, policy, deployment or learner-data edits.**

This is the third of three owner-requested fictional conversational acceptance sessions, accompanied by a directly operated desktop Cloud Browser investigation. It is **not a clean, uncontaminated blind test**: during the initial operational-document read, the Workbench contract's prepared evidence matrix was unintentionally displayed before canonical reconstruction. The answer and judgements below were subsequently reconstructed and supported by fresh connected Minamo record reads, with the conversation recorded before comparative browser critique. This contaminating exposure must be considered when interpreting cold-context independence.

This report is a new run, not a revalidation of earlier V89 outcome claims. Related [three-layer protocol](three-layer-reconciliation-protocol.md), [Workbench contract](../PROJECT-WORKBENCH-INFORMATION-CONTRACT.md), [#17](https://github.com/frekland/Minamo/issues/17), [#18](https://github.com/frekland/Minamo/issues/18) and [#51](https://github.com/frekland/Minamo/issues/51).

## Exact hosted identity and safety

| Field | Verified readback |
| --- | --- |
| Scenario / persona | automatic-plant-screamer / careful-calibrator |
| Fixture | automatic-plant-screamer/1 |
| Hosted generation | legacy@0 |
| Controller / prompt | epoch 1, phase K, controller revision 1, S06 |
| Source pin | fixture-files/1:2436ad99ca346ff9d5df3802765d9c1a5349d2a89aaadd824c5c79b17840b384:fa155fbf34dbcda1c35568b16eefbbea0dad9788c724620c790dd8403c153096:eb1d65dd2f4ed206d733ad31bb5c4d3cf79996e0ea583f388e68bce4b0f76ce0 |
| Shared replay SHA-256 | 2436ad99ca346ff9d5df3802765d9c1a5349d2a89aaadd824c5c79b17840b384 |
| Plant foundation SHA-256 | fa155fbf34dbcda1c35568b16eefbbea0dad9788c724620c790dd8403c153096 |
| Calibrator overlay SHA-256 | eb1d65dd2f4ed206d733ad31bb5c4d3cf79996e0ea583f388e68bce4b0f76ce0 |
| Canonical fixture | 14 registered current synthetic records; Project rev 4; calibration Question rev 4; raw-series Note rev 3 |
| Access and transitions | Owner-authenticated synthetic-only controller; syntheticOnlyWaiver true, libraryRecoveryVerified false; committed load receipt; no pending transition observed |
| Mutations | No scenario advance/reset/load, no Flag activation, no learner Note/Question/Project/Library/checkpoint edits |

The fixture source SHA-256 hashes are not Git commit SHAs or running-artifact attestations. The Site build version was not independently attested in this session.

The exact S06 fictional turn was retrieved through read_minamo_test_transcript action:turn: reconstruct canonical Notes, Questions, annotations and revisions; distinguish report from independent verification; identify changed decision, uncertainty and a small next experiment; do not save anything without a new request.

## Canonical reconstruction — findings before prepared comparison

1. **Original aim and boundary.** The earlier Project edition (retained rev 2) describes capacitive analogue soil probe → ESP32 → DFPlayer Mini with original/licensed sound. The 1 October Note labels “scream below 15%” as a wish without calibration, known pinout, SD/audio rights verification or powered bench proof.
2. **Early supplied observation.** The 6 October Note contains a fictional, user-supplied serial excerpt of dry-pot 2870 and damp-pot 1720 raw ADC counts; sample rate and board configuration are unspecified. It reports a sent DFPlayer play command but no sound, initially blamed on firmware. There is no independent power, SD, wiring, speaker, physical soil or audio verification.
3. **Correction and changed decision.** The 12 October noisy sequence is explicitly made-up simulation input. The 26 October pivot Note and retained Project rev 3 reject the universal percentage and choose labelled raw-count experiments plus hysteresis/cooldown; the first guess and silence assumption are preserved, not rewritten. Current Project rev 4 (13 November fictional event date) prioritises documented raw bands and re-arm behaviour.
4. **Later model versus physical evidence.** The 9 November hysteresis Note uses a synthetic sequence [2750, 2810, 2780, 2820, 2750, 2900, 2210, 2810] and illustrative dry=2800 / wet re-arm=2400. This is deterministic state-model reasoning, not a selected physical threshold. The raw-series Note is rev 3 and explicitly retracts any impression that its first CSV was measured; canonical operation receipts confirm prior updates to rev 2 and rev 3, but this run did not retrieve the exact content of raw-series rev 1/2.
5. **Current request.** The 23 November fictional return Note asks for one real bench measurement, and explicitly rejects claimed moisture accuracy or a tested plant. Drift, supply/ADC attenuation, exact soil/probe conditions, watering recovery, real hardware availability and audible playback remain unresolved.
6. **Pinnable sources.** The original fictional Article's ADC, UART and shared-space passages are present at a fixed rendition. Two retained user annotations anchor exact character selections in the ADC passage, reminding the learner that raw counts are device-dependent and must be reported with conditions.

**Model retrieval defect:** Project get_minamo_context returns direct Project/Question/older Note relations with relatedTruncated:false but omits the latest note-cal-next and revised note-raw-series. The calibration Question's get_minamo_context retrieves both among its recent linked Notes; exact read_minamo_record also succeeds. Thus these Notes are **not missing canonical data**. The gap is a bounded Project-level relation-closure/projection problem, with a possible one-/two-hop remedy. Do not infer unbounded automatic expansion.

**Time provenance:** synthetic replay record timestamps are on 31 October while the fictional authored event dates extend to 23 November. In the browser, “From your Note revision 1 · 31 Oct” was displayed beside “23 November” in the Note body. A derived evolution timeline must keep record time separate from authored event time, not silently sort either as ground-truth chronology.

## Actual fictional tutor continuation — appended before browser critique

> Welcome back. Your Plant-Screamer started as a low-voltage idea: a capacitive soil probe feeding an ESP32, with a DFPlayer Mini playing a short original or licensed sound when the plant seemed dry. The original “scream below 15%” target was a wish, not a calibrated measurement.
>
> The important change was to stop treating that percentage as a physical fact. You shifted toward *raw ADC counts under labelled conditions*, and a dry-trigger/wet-re-arm rule with hysteresis so noisy readings do not repeatedly trigger a scream. The older Project edition and 26 October correction preserve that decision; the current Project and calibration Question carry it forward.
>
> What we actually have is much narrower than a working device: an earlier *supplied fictional* serial excerpt reported 2870 for a dry pot and 1720 for a damp one, without a known sampling rate or board settings. The later 2800 dry / 2400 wet re-arm thresholds and noisy count sequences were synthetic state-model exercises. They can help reason about code behaviour but do **not** validate soil moisture, sensor drift or a real threshold. The reported DFPlayer command followed by silence has not been independently traced to firmware, wiring, power, SD card or speaker.
>
> Your latest Note asks for the next real calibration observation. The key unresolved question is whether a real probe, in your actual soil and ADC configuration, produces sufficiently stable and distinguishable raw counts over time—including after watering. Nothing saved yet answers that.
>
> If the board and low-voltage pinout are safely ready, I'd start with **one dry-condition baseline**, with the audio module disabled: collect ten time-stamped raw ADC readings from the same labelled pot over about a minute. Note the ESP32/ADC attenuation, supply, soil/probe placement and time. Keep the counts as counts; don't convert them to a moisture percentage or select a final trigger threshold yet. If the hardware is not ready, we can first make that little observation sheet and check the pinout. Which would you prefer?

**Pre-browser judgement, stored as a model-submitted session note:** The response identified the source-bound pivot from guessed percentage to raw counts/hysteresis, refused to claim physical validation, identified current uncertainty about actual stable readings and offered one conditional, learner-controlled baseline experiment. The stored caveat explicitly disclosed the premature exposure to the prepared contract matrix and incomplete old raw-series bodies. This is a substantive but qualified conversational usefulness result, not a learner-outcome measurement.

## Three-layer reconciliation

- **A — GPT-submitted transcript:** single new source-bound run TEST-ONLY-plant-screamer-calibrator-v1-r1-s06-20261101, fixture automatic-plant-screamer/1, S06, epoch 1. Started open; verified **38 immutable events**: one fixture user turn, 17 tool-attempts before dispatch, 17 actual tool-results, one tutor response, one preliminary-judgement note and one post-browser observation note. Two initial start attempts failed input validation before run creation; the corrected start succeeded. No transcript sealing.
- **B — server observer:** same run/source/session, started armed and paused at observer revision 1. **17 qualifying server-received successes**, no errors or unmatched events: get_minamo_context ×2, read_minamo_record ×13, read_minamo_operation ×2. Quota 600, not reached. Controls, transcript writes, browser UI/API interactions and pre-run identity checks are expected exclusions, not missing observed calls.
- **C — canonical D1:** checkpoint TEST-ONLY-plant-screamer-calibrator-s06-canonical-20261101. Before 10:04:54.447Z and after 10:17:32.035Z; both phase K, controller rev 1 and namespaceVersion 8104; **0 changes among 36 scoped metadata items**. Final inspect retained epoch 1, phase K, revision 1 and all 14 registered records. No Flag test was repeated.

### Per-call matching ledger

| Declared steps | Submitted attempts and actual result | Independently observed | Classification |
| --- | --- | --- | --- |
| PCTX, calnext, rawseries, hyst, calq, ref, firstparts, firstread, noisy, pivot | 10 intent-before/result-after pairs, successful | One get_minamo_context and nine read_minamo_record successes in the matching time windows | Corroborated at tool/order/time level, not cryptographically attributed |
| projectold1, projectold2, annfoundation, annadc | Four intents recorded before one parallel dispatch batch; four successful results appended after | Four read_minamo_record successes at 10:09:59–10:10:19Z | **Ambiguous pairing** among four input identities: observer omits selectors |
| qctx | One intent recorded before a later parallel dispatch; success appended afterward | One get_minamo_context success at 10:11:32Z | Corroborated at tool/time level |
| rawopH, rawopK | Two intents before the parallel batch; two successful receipt reads | Two read_minamo_operation successes at 10:11:40 and 10:11:46Z | **Ambiguous pairing** between H and K operation IDs |
| Synthetic controller/transcript/observation controls; Cloud Browser actions | Explicitly outside qualifying observer predicate | No expected per-call observer events | Expected exclusions |
| Unmatched observed events | None | 0 | None |
| D1 canonical comparison | No learner-record mutation attempted | No change | Corroborated bounded no-change interval |

Observed calls carry server-generated callId, timing and tool name, **not the model's selector/entry ID or a shared dispatch token**. A matching count therefore does not prove exact individual call attribution or host completeness. Formal **three-layer verdict: PARTIAL**, because six calls in concurrent batches are not uniquely pairable despite aggregate 17/17 coverage and the unchanged D1 diff. No server failure test or Flag mutation was performed.

## Directly observed Cloud Browser UX — authenticated desktop only

Browser Chrome cloud session; actual CSS viewport **1363 × 936**, DPR 1. The owner-visible synthetic fixture was clearly labelled. The eight screenshot captures are retained in the private research conversation; they are **not posted to this public repository** because collection/home screens also show non-synthetic owner workspace titles. A reproducible interaction trace follows.

| Route/action | Direct observation | Consequence |
| --- | --- | --- |
| Projects collection → exact calibrator Project (1 click) | Three Plant variants have identical visible titles and duplicated TEST ONLY wording; persona is not displayed | Synthetic-selection ambiguity; not automatically a genuine-user naming defect |
| Project overview | Corrected summary rejects universal 15%, but dominant CTA is “Start first step — Parts and safety”; current return Note absent | Project landing favours historical stage order over most recent concern |
| Project → calibration Question (2 clicks total) | Question shows current, specific uncertainty and a Recent work sidebar with latest Note, raw-series rev 3, hysteresis, annotations and older pivot | This already offers strong evidence-in-context; preserve the renderer and explicit links |
| Question → latest Note (3 clicks total) | Exact fictional Note read, but URL no longer carries returnJourney/returnStage; related Question link also omits both | Explicit “Back to Step” disappears on the Note→Question detour; linked Project card still recovers exact calibration Step in one click |
| Question → ADC Library passage (one more click from Question) | Exact Article rendition, section adc, part p; highlighted “ADC readings” and “device-dependent raw counts” annotation marks; Saved marks shows text | Source/anchor fidelity is strong; passage is discoverable with a task button |
| Library task button → Question | Returns to exact calibration Question; task identity retained but original Step-return parameters remain absent | Partial return-path recovery, not preservation of full Project working stack |
| Question linked Project → calibration Step | “Recent work” also displays the latest Note and source-linked prior work from the Question via stage context | The useful two-hop relation logic already exists in the **human stage view**, even though root MCP Project context omits it |
| Project map and Resources | Map depicts Step sequence and direct Question branches, not temporal turning points. Resources offers the pinned Article at exact ADC section/part | Useful topology/source routes; neither explains why the decision changed |
| Raw-series Note → Manage | Shows generic “Recent changes” list, no directly demonstrated previous Note-body edition switch | Historical revision bodies are not proven discoverable from this path; do not claim absence across the whole app |
| Note → Edit note | Opened real Notes writing dock with Saved, revision 1, existing text, formatting/terminal/image controls; closed without changes | Genuine editing controls visible, but autosave, refresh, CAS, collision and durable write were not tested |
| Browser back/forward | Moved Question ↔ Note successfully | Browser history works on tested route, despite loss of explicit contextual return metadata |

No viewport resize/device emulation was exposed through the supported Cloud Browser controls. A cropped desktop screenshot is not mobile emulation; **narrow layout and mobile acceptance are untested**. This was an agent-operated inspection, not human usability research with actual participants.

## GPT/MCP versus learner-facing UI

| Learner question | GPT/MCP experience | Browser-observed experience |
| --- | --- | --- |
| What matters now? | Needed calibration Question/exact Note beyond Project root context | Project summary knows pivot, but latest 23 Nov concern sits in stage/Question Recent work, not prominent entry |
| What changed and why? | Retained Project revs 2→3→4 and dated Notes support the story | Older Note visible after entering calibration, but no first-class before/after decision trail |
| Is the threshold proven? | Explicit sources segregate synthetic state-model values, supplied fictional serial excerpt and missing physical evidence | Individual Note and source warnings are intact; no consolidated evidence-status display at Project entry |
| What is one next experiment? | Tutor can infer a dry baseline with conditions, conditional on safe hardware availability | Current Note asks for it, but primary Project action still restarts Parts and safety |
| Can I inspect and resume? | Exact question, Note and Article reads succeed | Three clicks to latest Note; exact source marks work; Note detour loses Step-return state; browser history works |

**Diagnosis by layer:** no sampled missing canonical Note or missing Article anchor. There is a weak root Project relation projection, missing temporal/causal decision view, synthetic-specific identical list labels, and observed route-state loss. GPT made no unsupported claim that the physical plant or firmware ran. The browser did not test all legacy renditions or true narrow layout. The UI can be attractive and individually navigable while still poor at the first returning-learner decision.

## Separate verdicts

| Area | Verdict | Boundary |
| --- | --- | --- |
| Hosted implementation correctness | **PASS, bounded** | Exact synthetic controller, source-matched transcript/observer and read-only records function; running artifact attestation not performed |
| Canonical source/revision fidelity | **PASS for sampled pinned reads; PARTIAL overall** | Exact Project rev 2/3/4, Article and annotations; raw-series rev 2/3 receipts, not all historical bodies |
| Genuine cold-context coverage | **PARTIAL / compromised** | Fresh Minamo reads and response recorded before browser, but prepared evidence matrix was inadvertently exposed first |
| Three-layer reconciliation | **PARTIAL** | 17/17 qualifying aggregates; 0 D1 changes; six input-to-call matches ambiguous, no host-complete trace |
| Conversational usefulness | **PASS, provisional** | Source-grounded, autonomy-preserving single next experiment; no actual learner evaluation |
| Information architecture | **NEEDS WORK** | Project landing/Project root omit return concern and cause; stage/Question existing contextual work is strong |
| Browser-observed learner UI | **PARTIAL** | Actual authenticated 1363×936 desktop navigation and editor inspection; exact anchor works, Step-return context drops; mobile/edit persistence untested |

## Workbench consequences and next gate — recommendation only

1. **Reuse, do not discard** the canonical revision/rendition/source anchors, linked Question Recent work, exact passage annotations, real Notes editor and explicit task/source links. The stage/Question already demonstrates relevant two-hop closure.
2. Build a **bounded, provenance-aware current-concern read projection** at Project entry, grounded in Question→Note/Note→Note links, with derivation version, omitted/coverage counts, exact source refs and permission/generation isolation. Avoid introducing a second authoritative “learner state” table simply to make this view.
3. Represent one **before → correction → current decision → unresolved evidence** trail with exact Note/Project revisions and speaker/evidence status. Distinguish synthetic model tests, supplied outputs and verified external receipts. Keep authored event time separate from persistence timestamps.
4. Preserve the selected Project/Step/Question, source rendition, Note draft and return stack through Note/Library detours, including browser back/forward. The proven context-loss reproduction should become a shared functional test.
5. Do not simply add four tabs. Compare two truly different interaction implementations on the **same canonical slice**: an explicit Work/Questions/Evolution perspective model and a fluid contextual work surface, each with inspectable evidence and real Note persistence. A plain, reversible vertical slice is more informative than a high-fidelity static mock.
6. **Next task, not executed here:** structured side-by-side comparison of the three independently attempted S06 histories: Mood-to-Music / provider-documentation-sceptic; Retired HTB Cap / interrupted-sparse-recorder; this Plant-Screamer / careful-calibrator. Compare exact source/revision fidelity, unsupported inferences, root/deeper retrieval, useful autonomous tutor actions, triple-layer tracing, available directly observed UI routes, differing social/technical uncertainty, and common navigation/projection failures. Then choose the smallest Workbench experiment which handles all three without corpus expansion.

No other persona was run; no Workbench implementation, schema migration, UI change, test Flag mutation or deployment was attempted. This documentation PR should remain open for review because independence and exact per-call matching are qualified.