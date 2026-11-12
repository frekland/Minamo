# Audio and bounded reference enrichment evidence

This is source/local/installed-MCP evidence from the PR52 implementation. It does not claim an application deployment, hosted browser playback, physical microphone capture or native-speaker certification. The integrated release receipt supplies final source and production identities.

## Listening and optional recording

`lib/practice-audio.ts` defines a finite `listening` Activity block: exact attached private audio ID/revision/SHA-256/duration; independently exact transcript family/ID/rendition/section/part/text; authored full-phrase or finer audio/text segments; language and labelled provenance. Segment times, budgets, Unicode boundaries and saved interaction types are validated. The server helper independently checks current attached-media eligibility and exact transcript text; shared domain integration adds source and media commit guards and rights-aware projections.

`PracticeAudio` is mounted in the ordinary Activity host. It checks private media and the exact transcript before use and again before revealing or comparing text. It provides selected-segment replay, loop, speed, native playback fallback, concealed transcript/translation, IME-safe typed dictation, comparison without proficiency claims and optional local-voice synthesis with explicit no-voice fallback. Hiding/navigating/disposal stops owned playback and speech. Exact dictation and segment/disclosure/comparison state save deliberately through existing immutable Attempt operation receipts; owner/generation/Activity-edition draft keys preserve pending operations.

`PracticeRecorder` is integrated into the existing private media attachment form used by Notes and canonical authoring. Only an explicit action requests a microphone. Capture is bounded to 60 seconds/12 MiB of native recording; local native decoding averages at most two channels and converts to bounded mono 16-bit PCM WAV already admitted by the server. The local preview supports stop, discard and download. Selecting the recording feeds the ordinary explicit upload, attachment and parent-save workflow. Hidden pages stop capture; navigation stops media tracks, preview playback and object URLs. Denied/unavailable hardware leaves file attachments and typed practice available. No recording reaches the server automatically, and no ChatGPT Live audio or automatic transcription is assumed.

Two licensed human-recorded greeting fixtures were retrieved from their primary Wikimedia file descriptions, downloaded and converted from Ogg Vorbis to 16000-Hz mono PCM WAV without editing speech. Their byte hashes, durations, exact transcripts, source/author and CC-BY-SA-3.0 attribution are pinned in `tests/fixtures/practice-audio/manifest.json` and its README. Japanese こんにちは is 0.90475 s; Mandarin 你好 is 1.0565625 s. The combined converted volume is 62,918 bytes. The entire phrase spans one segment; no per-word timing is invented. These are meaningful short-phrase specimens, not qualification of long recordings or pronunciation scoring.

## Actual local validation

The targeted command `node --test tests/practice-audio.test.mjs tests/practice-audio-domain.test.mjs` passed **12 tests, zero failures, zero skips** before the final integrated release checks. A subsequent native-player fallback adjustment reran the seven pure/render tests successfully; the release owner must include the domain suite in the final integrated run.

- Seven pure/render tests: finite/Unicode segment admission; exact retained transcript; initial no-autoplay/no-transcript-leak render; bounded recording conversion producing server-admitted WAV; Greek NFC comparison without flattening French/Swedish distinctions; exact named listening interaction facts; licensed speech byte/provenance verification.
- Five actual local Worker/D1/R2 test results: private speech upload/attachment/publication and foreign denial; incorrect revision/hash/timing/transcript rejection; exact saved synthetic dictation Attempt and immutable replay; complete post-new-write checkpoint/stage/activate retaining both audio bytes and exact Attempt inputs; retained source editions followed by source Trash/audio revocation withholding derived transcript/translation.

The local checkpoint restore operates only on synthetic isolated storage. No production restore, genuine source revocation or learner progress write occurred in this track. Browser codec decoding, microphone permission prompts/capture, real voice output and physical device behavior remain separate qualification surfaces. PCM conversion tests establish the converted container and bounds, not that hardware capture occurred.

`scripts/practice-audio-live-acceptance.mjs` provides the release owner a narrow synthetic production acceptance bridge. Its only inputs are explicit `publish`/`cleanup`, the exact Minamo origin, a stable `pr52-audio-` prefix, generation and supported Sites bearer through hidden stdin. It validates pinned fixture hashes, uploads through the existing private media endpoint and creates two synthetic source/Activity pairs. Output is an exact cleanup ledger and browser links. Cleanup accepts only synthetic records with that exact prefix and moves them to recoverable Trash; assets stay recoverable with their parents. This script has passed syntax validation; its presence is not a claim that it ran against production.

## Permanent reference revision ledger

These are explicitly authorised permanent editorial improvements, not disposable synthetic records. No Notes, Attempts or formal progress were created by this editorial work. Current library text and original manuscripts are held by the normal Minamo store; private corpus prose is not copied into this repository.

| Article ID | Before | Final | Final rendition |
| --- | --- | --- | --- |
| `ms-d1d80ff32edfb4d1cbcec753f4e8e00e16da87bc` | record/catalogue 1 | record/catalogue 3 | `r-c760b8e77951450d201cbe5d515507933f711fc914f3899c33668a5fb5a8fc17` |
| `ms-8e8c84a668ce9b91d2615dffbfd9bb737227787e` | record/catalogue 1 | record/catalogue 3 | `r-b63e2432fa81d9bd3830b1a09d5b5baefc72c7a14e0a0dffdca768bc0feba399` |

The first guarded manuscript operation, `pr52-permissions-privilege-enrichment-20261026-v1`, created revision 2 of both Articles. Its two diagrams returned explicit fallback warnings because the installed Mermaid subset did not support decision braces. After exact readback, operation `pr52-permissions-privilege-enrichment-20261026-v2` changed those node declarations to the supported subset, republished both Articles/catalogues as revision 3 and returned **zero warnings**. The final manuscript source digest is `8a77e4b27030bd3a549fc6541bdb77e67b2ea96a9796e47959200d00ac1a67ed`. Intermediate revision 2 remains retained deliberately.

Final installed-MCP reads verified eight independently useful sections per Article, one actual native graph/flow each, safe complete `mktemp` examples, explicit identity/mode/traversal/execution distinctions, predicted-output/error interpretation and direct primary further reading. The old fixed `/tmp/bandit-private-demo.txt` example is absent from current prose. Original revision-1 sections were retrieved by their exact prior renditions and compared unchanged; historical editions remain available rather than being overwritten.

| Existing command identity | Exact final explanation section |
| --- | --- |
| Permissions `reference-1` / chmod | `s5` — Change only the intended bits with chmod |
| Permissions `reference-2` / id | `s3` — Read the process identity with id |
| Permissions `reference-3` / namei | `s6` — Follow each pathname component with namei |
| Privileges `reference-1` / id | `s3` — Real and effective identity with id |
| Privileges `reference-2` / stat | `s5` — Inspect ownership and mode with stat |
| Privileges `reference-3` / ps | `s4` — Inspect the particular process with ps |

All six final catalogue targets were read back against the matching final rendition. Existing Article, command and subject-area identities were preserved; the two references explicitly link to each other rather than creating duplicate Articles. External claims were checked against GNU Coreutils `chmod`, `id`, `stat` and file-permission manuals; Linux man-pages `path_resolution(7)`, `credentials(7)` and `execve(2)`; util-linux `namei(1)`; and procps-ng `ps(1)`, retrieved through Firecrawl.

The private scratch creation/mode inspection produced `-rw------- 600` locally. The execution environment is a restricted UID-0 container: dropping to another identity was disallowed and its `ps` could not inspect the requested self process. Therefore the references label ordinary-user denial/process output as predictions and explain container limitations; no non-root denial or process row is falsely reported as observed. This did not alter system identities, privilege settings or genuine learner files.
