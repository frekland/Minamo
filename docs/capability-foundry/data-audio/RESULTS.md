# Data, notebook, trace and audio engineering bank

Executed 25 October 2026 against GitHub baseline `c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c`, local research branch `research/foundry-execution-20261025`. Parent programme records the final publication commit. Exact tested source SHA-256 values and measured fixtures are in [measurements.json](measurements.json). This is dormant laboratory code; no production records, permissions, source editions or Runs changed.

## Implemented and executed

| Capability | State | Actual proof | Limits |
| --- | --- | --- | --- |
| CSV/TSV/JSON source-exact tables | RUNNABLE_STANDALONE; shared SDK adapter dormant | Quotation/CRLF/BOM, strict rows, primitive JSON, export injection, malformed inputs, sparse arrays and aggregate budgets tested | 12 MiB source, 50k rows, 64 columns, 1m cells; gallery input smaller |
| Interactive scatter/table | RUNNABLE_STANDALONE; SDK adapter dormant | SSR escaping, numeric omission, linked point slider, source table fallback | 5k plotted pairs, 100 preview rows; no automatic sampling |
| Supplied CLI/HTTP trace | RUNNABLE_STANDALONE; SDK adapter dormant | Ordered events, exit codes, monotonic supplied timestamps, explicit redaction, false computed provenance rejection | Heuristic redaction requires manual inspection; not a packet capture engine |
| Read-only nbformat4 importer | RUNNABLE_STANDALONE; SDK adapter dormant | Source/string-array preservation; stored counts only reported; HTML/SVG/JS omitted; PNG signature/IHDR/pixel checks | PNG remains staged candidate, not decoded or admitted to private media; no execution or attachments |
| PCM/WAV/FFT/spectrogram | RUNNABLE_STANDALONE; SDK adapter dormant | 1000 Hz sinusoid FFT oracle, waveform RMS, WAV quantisation/roundtrip and malformed chunk tests | Mono PCM16 WAV only; 192k sample limit; no calibrated SPL or pronunciation scoring |
| MIDI/data sonification | RUNNABLE_STANDALONE | Deterministic SMF0 header/track, declared tempo/note data, positive note-off duration and bounded inputs | Explicit mapping to notes; no external MIDI device/soundfont; no mood inference |
| Dataset change and missingness | RUNNABLE_STANDALONE | Unique-key exact diff, null/empty/zero/false distinctions | Identical columns required; changes do not identify causes |
| Seeded bootstrap/histogram | RUNNABLE_STANDALONE | Constant/small-enumerated oracle, deterministic seed, bin conservation and resampling budget | Percentile method is educational; not SciPy BCa parity or a statistical recommendation |
| DuckDB/Parquet | RESEARCHED, deferred | Official WASM source inspected | No pinned browser package, worker/network/supply-chain proof; reuse existing SQLite engine before new SQL authority |

Commands executed:

```sh
node --test tests/foundry-data-audio.test.mjs tests/foundry-data-ui.test.mjs tests/foundry-data-platform.test.mjs
node tests/foundry-data-benchmark.mjs
node node_modules/typescript/bin/tsc --noEmit --pretty false
```

The track suite passed **35 tests** at this boundary. Typecheck passed after all current shared modules settled. Root programme owns final whole-repository checks and browser gallery acceptance. SSR and Node tests are not browser, physical Pixel, TalkBack, authenticated Site or D1/R2 save/readback evidence.

## Measurements and a correction driven by evidence

`measurements.json` records Node v24.22.1/Linux synthetic measurements, not promises for Android. The 10,984,286-byte/30,000-row CSV initially took approximately 819 ms with a 366.7 MB heap delta. Inspection identified character-by-character concatenation retaining many string ropes. The parser now slices original source spans and only joins escaped-quote pieces. A subsequent run took approximately 161 ms and a 33.4 MB heap delta. GC and concurrent agent work affect these figures; heap delta is not peak RSS.

The measured 128-frame/1024-bin spectrogram took about 28 ms and a 1000×1000 bootstrap about 8 ms. Minified stand-alone browser bundles excluding existing React were about 23.4 kB/9.2 kB gzip for the data track and 10.3 kB/4.2 kB gzip for audio. These are isolated esbuild measurements, not the final Vinext network chunks. Shared platform limits are deliberately stricter: 65,536 canonical source units, 262,144 total JSON bytes and 20k nodes. A large standalone table cannot silently enter the registry.

## Shared SDK and lifecycle

`data-platform.ts` exports `dataTableAdapter`, `dataChartAdapter`, `dataNotebookAdapter`, `dataTraceAdapter` and matching `*Artefact` constructors. `audio-platform.ts` exports `audioAnalysisAdapter` and `audioAnalysisArtefact`. Each canonical source is hashed, reparsed, and compared to the visible payload before fallback or lazy activation. Source rights and Run authority are inherited from `ArtefactRegistry`; no adapter provides its own identity, receipt, storage or permission callback.

Imported table/chart/notebook/trace data cannot be elevated to computed provenance, even when a caller supplies a claimed receipt. Computed structured outputs belong to existing saved-Run output admission. Audio samples must be exact Float32 values; origin and provenance agree. All React mounts return `root.unmount()`. Audio playback is explicit, with context/source cleanup on Stop and unmount; source loading never plays or records audio. No raw HTML, external URL, script, microphone, owner credential or fetch is accepted by these adapters.

The native SVG/table approach was selected for small educational charts because all values remain in an ordinary table and a point slider supplies keyboard access. Recharts is already installed and remains a sensible future choice for zoom/brush-heavy plots. This track did not install Observable Plot, Plotly or Vega-Lite merely to compare their documentation.

## Primary sources examined

- [RFC4180](https://www.rfc-editor.org/rfc/rfc4180): quotation, double-quote escapes, CRLF, explicit header interpretation. Parser intentionally also accepts LF/CR records without changing source.
- [Official notebook format](https://nbformat.readthedocs.io/en/latest/format_description.html): multiline source/string arrays, cells, MIME bundles, execution counts. Import is deliberately a safe projection, not a complete notebook validator or execution engine.
- [Recharts accessibility source](https://github.com/recharts/recharts/blob/main/storybook/stories/API/Accessibility.mdx), consulted through Context7: keyboard layer and default accessibility in v3. Installed Recharts version is existing repository dependency; no added dependency.
- [Observable Plot accessibility](https://observablehq.github.io/plot/features/accessibility): SVG root/mark ARIA options; these do not replace an exact table alternative or prove screenreader acceptance.
- [MDN createBuffer](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBuffer): frames/rates and generated audio buffers.
- [Web Audio 1.1 draft](https://www.w3.org/TR/webaudio-1.1/): overview only; retrieval was truncated, so this is not claimed as an exhaustive normative review.
- [SciPy bootstrap](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html): percentile method versus basic/BCa, sample resampling and assumptions. The local teaching implementation is explicitly percentile, not a reimplementation of SciPy's default BCa.
- [DuckDB WASM overview](https://duckdb.org/docs/stable/clients/wasm/overview.html), redirected to current versioned docs: research only. No exact bundle/version/Android benchmark claimed.

## Integration and remaining work

Use the shared registry and existing owner-aware admission before exposing these in ordinary Reader/Notes/Tools. Current code is a local gallery + dormant SDK registration bank. Durable tables/notebooks/audio must use existing source/media revisions, CAS, operation receipts, Trash/recovery and private asset admission; this track adds no record family or hidden queue. No genuine data was copied into fixtures. All fixtures are synthetic local source; cleanup requires only closing the lab and discarding local browser state.

See [F04](../activation/F04.md), [F08](../activation/F08.md), [F10](../activation/F10.md), [F11](../activation/F11.md) and [F19](../activation/F19.md). Full source integration of a new media format or large file worker is still a separate capable-engineering task; the small Light tasks below activate bounded views against already admitted data.

## Independent property-review correction

The independent reviewer found a one-column final empty-string row could be lost when export emitted only a final newline. CSV/TSV export now explicitly quotes empty fields, preserving the distinction between an empty final record and a record terminator. The minimal regression and the independent500-table property harness both pass. The full track suite now has35 tests; the separate reviewer harness passes4/4 (500CSV,1000byte encodings,300diffs,100graph-oracle cases). Source hashes/measurements were regenerated after the fix.
