# Data/audio continuation boundary

Working source: `research/foundry-execution-20261025`, baseline GitHub main `c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c`; local source-import parent `cf3ea9f7ccca2267b6f95f11f8a86bf56e1ca19f`. Final durable GitHub commit is supplied by parent programme. Tested source hashes: `measurements.json`; do not mistake the import-parent SHA for this uncommitted implementation.

Completed: strict table imports, safe derivative CSV export, table/chart, external trace/redaction, notebook safe projection, FFT/waveform/spectrogram, PCM16 WAV, MIDI/sonification, dataset diff/missingness, seeded percentile bootstrap, five shared SDK adapters and lazy React viewers. No dependencies added. 35 tests pass; isolated10.98MB CSV benchmark and source hashes saved. Root owns gallery and whole-repository acceptance.

Next command:

```sh
node --test tests/foundry-data-audio.test.mjs tests/foundry-data-ui.test.mjs tests/foundry-data-platform.test.mjs
```

Then root should run full typecheck/build/tests and browser acceptance. Browser cases still needed: mobile data-source input, chart point keyboard slider, notebook omitted HTML, trace reveal/redaction, explicit audio Play/Stop/unmount and exported WAV/MIDI file readback. Physical Pixel/TalkBack, authenticated owner media/save/readback and actual private asset revocation are unverified and not authorised for genuine records. Dedicated large-file worker and full image decode/staging remain activation prerequisites beyond simple text viewers. Shared-registry lifecycle/permission tests do not certify real owner identity.

Changed files are `lib/foundry/data-core.ts`, `data-platform.ts`, `audio-core.ts`, `audio-platform.ts`; `app/foundry-data-demo.tsx`, `foundry-audio-demo.tsx`; `tests/foundry-data-{audio,ui,platform}.test.mjs`, `foundry-data-benchmark.mjs`; this directory and activation F04/F08/F10/F11/F19. No core production file, permission, package lock or durable record changed.
