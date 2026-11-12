# PR52 cue compilation and recovery evidence

## Isolated Japanese conversion

PR #51 head `f8cb60dc1466e514df77cc2087e6c704a4a150e2` was read through GitHub into isolated scratch. No source unit was merged or published, no publication wave advanced, and no learner record/checkpoint was created by this conversion.

The ordinary `minamo-language` / ruby `minamo-semantic` manuscript compiler now accepts authoring-only `cues` with exact `expression`, supplied `reading`, optional 1-based `occurrence` (within matching context), exact `before`/`after`, and optional guarded `expectedStart`. It derives UTF-16 spans only when the occurrence is unambiguous. Readings are never inferred; source text is unchanged. Repeated expressions, missing text, stale coordinates, overlapping spans and invalid grapheme boundaries produce field-specific diagnostics. Invalid semantic declarations remain intact as literal source with visible preview warnings rather than losing content. A caller must resolve warnings before claiming annotated publication succeeded.

Read-only full-unit conversion executed for all 24 original units and all 325 cue requests. **291 cues resolved; 34 requests require contextual disambiguation.** Every diagnosed request has concrete candidate offsets and nearby context in the attached mechanical manifest. Those 34 were not guessed or silently applied to all repeated occurrences. All 24 full compiled units retained the exact canonical Japanese base text; source/canonical SHA-256 identities and compiled part counts are recorded in `PR51-ISOLATED-CONVERSION.json`. N5-09 has four unambiguous/three ambiguous cues; N4-11 has fourteen unambiguous cues. This is conversion evidence, not linguistic certification or production import.

Reproduce with the isolated PR51 pack directory:

```sh
node scripts/pr51-cue-dryrun.mjs /absolute/isolated/content-packs/japanese-jlpt-n5-n4
```

| Unit | Cues | Resolved | Ambiguity diagnostics |
| --- | ---: | ---: | ---: |
| n5/01-kana-and-greetings.md | 1 | 0 | 1 |
| n5/02-identity-and-possessions.md | 7 | 5 | 2 |
| n5/03-time-and-schedules.md | 11 | 11 | 0 |
| n5/04-places-and-existence.md | 10 | 8 | 2 |
| n5/05-daily-routine-and-verbs.md | 14 | 14 | 0 |
| n5/06-shopping-and-food.md | 6 | 4 | 2 |
| n5/07-describing-things.md | 10 | 7 | 3 |
| n5/08-transport-and-directions.md | 11 | 9 | 2 |
| n5/09-te-form-and-requests.md | 7 | 4 | 3 |
| n5/10-past-events-and-invitations.md | 12 | 11 | 1 |
| n5/11-wishes-and-simple-rules.md | 10 | 9 | 1 |
| n5/12-integrated-n5-reading.md | 19 | 16 | 3 |
| n4/01-plain-style-and-reporting.md | 14 | 12 | 2 |
| n4/02-ongoing-and-resulting-states.md | 19 | 19 | 0 |
| n4/03-reasons-and-contrast.md | 18 | 17 | 1 |
| n4/04-ability-and-nominalisation.md | 18 | 16 | 2 |
| n4/05-intentions-and-arrangements.md | 14 | 14 | 0 |
| n4/06-conditions-and-concessions.md | 15 | 13 | 2 |
| n4/07-obligation-and-permission.md | 15 | 14 | 1 |
| n4/08-giving-and-receiving-help.md | 13 | 12 | 1 |
| n4/09-experience-and-activity-lists.md | 16 | 16 | 0 |
| n4/10-preparation-and-result-states.md | 16 | 14 | 2 |
| n4/11-appearance-and-uncertainty.md | 14 | 14 | 0 |
| n4/12-integrated-n4-reading.md | 35 | 32 | 3 |

## Recovery defects and corrections

Baseline owner-private checkpoint verification failed before this release with `archive_integrity: An immutable manuscript edition failed source/target digest validation`. Read-only examination of the immutable `pr49-ja-launch-clarify-contrast-v2` publication confirmed valid document-level `learningScope` metadata. The normal writer admits/stores that field, but `validManuscriptEditionRow` rejected it in its field whitelist before reaching the digest check. The repair admits only typed scope metadata using the existing `validateLearningScope` and continues to require the exact original source/target digest. Unknown Source/permission fields, malformed scopes and mismatched digests remain rejected. No original manuscript, archive or live learner row is rewritten to make validation pass. The original baseline archive must be reverified through installed production MCP after deployment; isolated tests alone do not claim that live step.

Restore now also awaits exact scratch-submission validation, so edited file bytes with forged/stale hashes cannot reach activation. Existing and retained Activity/Attempt records remain deeply re-admitted at stage and again at activation. Each Attempt is compared with its preceding retained revision: individually valid-looking rewrites of old response/feedback/review identity and repinning an Activity edition are rejected as well.

Portable export previously redacted answer keys but did not recheck derived practice/listening/scenario/character source eligibility. It now withholds blocks whose exact source or media is unavailable under current export rights, and withholds dependent feedback/corrections/review/interaction projections while preserving independent learner input. Protected complete checkpoints retain original bytes and rights; portable JSON remains explicitly non-restorable and rights-aware.

## Actual isolated new-write rehearsal

`tests/practice-recovery-complete.test.mjs` uses the compiled shared handlers, real local D1/R2 and synthetic principals. It writes a prior-format Note, original exact source, Activity containing all four new block kinds, immutable response, provisional feedback, retained correction, deliberate review event, character recall, finite scenario choice, listening draft state, and exact edited-file submission. A 60-second 48-kHz mono PCM recording-volume fixture (5,760,044 bytes of synthetic silence, not speech/listening/performance evidence) exercises actual asset checkpoint/restore bytes.

The post-new-write checkpoint is verified, staged, activated in isolated storage, and reopened with identical identities, nested data and audio bytes. A tampered feedback-to-response revision rejects activation while preserving the original active Note. Feature-disable hides Activity/Attempt authority; re-enable retrieves the exact later saved data. The tested rollback target is current code with `MINAMO_ACTIVITY_STUDIO=0`, not a claim that an arbitrary older executable understands every new schema. Existing migrations are replayed into an empty isolated D1; prior-format Note compatibility is exercised alongside the new records. No new table was introduced: nested practice and submission data remain in existing current/revision/operation tables covered by recovery.

Additional real D1/R2 audio tests exercise two licensed human speech fixtures, exact transcript/media identities, post-write checkpoint/restore and source/audio revocation. Player/format acceptance, synthetic recording volume and real human listening fixtures are separate evidence bases. No physical microphone or device success is asserted here.

All fixture storage is disposed after tests; no production generation is activated for a rehearsal.

Targeted validation receipts: 22/22 passed across the five compiler/recovery/audio test files before the final chronology hardening; the changed complete-recovery test then passed5/5 with the additional individually valid rewritten-answer challenge. Source typecheck passed. The integration owner runs the final exact integrated suite/build and live original-checkpoint verification separately.
