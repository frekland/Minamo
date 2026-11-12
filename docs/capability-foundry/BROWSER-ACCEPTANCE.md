# Actual browser acceptance and limits

Environment: cloud Chromium155 on Linux; developer-only Sites-managed preview `http://terminal.local:4173/capability-foundry`. Desktop viewport1363×936. Narrow test uses a390×844 outer iframe,388×842 inner browsing viewport (373px content width with scrollbar), not a physical Android emulator. No authenticated production record was read or written. Synthetic production-like identity exists only in isolated D1 tests. Exact source ref/hashes: BANK-RECEIPT.md and SOURCE-MANIFEST.json.

| Case | Actual observation |
|---|---|
| Lazy gallery | Nine tracks load only on selection; ordinary Home/production routes separate. Unload switches unmount prior track. |
| Ruby DOM |9/9 deliberate native Range probes passed: decoration exclusion, nested marks, kana, partial compound, element boundaries, supplementary/combining text, surrogate-split denial, stale text denial and restore. Native DOM textContent includes readings; base mapping deliberately excludes them. |
| Language device state | Japanese ruby/hide/reveal/vertical layout, Mandarin and Arabic fixtures available. Browser reports no eligible local voice, so Speak disabled. No synthetic pronunciation or proficiency claim. Narrow Japanese vertical layout has no page-level horizontal overflow. |
| Mathematical DOM |5/5 native namespace/source/decoration/injection checks passed desktop and narrow child viewport. Real KaTeX equations and finite native MathML rendered. Source editor, calculus, exact matrix trace and probability controls present. No screen-reader speech/navigation claim. |
| Existing Reader + Notes | Actual Reader renders paragraph base with ruby sidecar and separate mathematical code source. Existing “Select without dragging” Japanese passage → Annotate opened quotation `今日は日本語を勉強します。` with no readings inserted. No Save clicked; empty draft cancelled. Existing Markdown Note displays real formula while original fenced code remains. Fixture presentation selector is cosmetic; it is NOT actual Classic/Focus/Task Workspace acceptance. |
| Shared SDK | All12 real adapter fixtures admitted in browser with fallback lengths, without renderer activation. Ruby adapter mounted via registry; synthetic revocation returned false and emptied host/source/fallback. Data table adapter mounted3 exact rows and numerical chart. Rights callback is an explicitly synthetic model, not hosted owner auth. |
| Scientific plotting | Actual offline NumPy+Matplotlib ran in opaque iframe/Worker, completing about5753ms in this observed run. Source SHA256 `48a44ec8c728543c24fb8abc8a133ae74426004885bd6d7d2f3547f5e06a7af9`; numerical integral0.33340000000000003,6-row table, generated PNG640×480. Exact captured code displayed separately from editable source. See browser/python-plot.txt. |
| Symbolic browser computation | Actual separate offline SymPy run completed6033ms and returned exact1/3 plus TeX and table. Input SHA256 `ea7e646fcc890bc4c78c0d34f099689e102b9b86279cc7f8503c864ff88cd6b6`. Snapshot and screenshot: browser/python-symbolic.*. |
| Deliberate browser cancellation | Infinite-loop preset was explicitly cancelled after13417ms, status interrupted, captured source/hash retained, result contains no table/PNG and no automatic retry. Parent removed opaque runtime. Node watchdog tests separately terminate infinite Worker at5s. |
| Browser-specific Python corrections | First attempt found unavailable randomUUID/subtle on HTTP-only preview: reused existing random client identity and identical native/lazy noble SHA256 fallback (independent vectors tested). Node cache proof did not cover browser packageBaseUrl: explicit fixed offline base corrected and bootstrap errors now fail visibly before source execution. No integrity bypass or runtime CDN network granted. |
| Three.js | Trusted real module import attempted. Cloud browser lacks WebGL; static source/unavailable fallback observed, then close/dispose. Actual GPU scene rendering, orbit quality and physical GPU lifecycle remain UNVERIFIED. Geometry/GLB/disposal engine tests are real Node tests, not GPU-render claims. |
| Graph | Actual Dijkstra SVG/table stepped to “Settled A”: B5, C1 and unreached later nodes; source trace remains inspectable. |
| Data | Table/scatter rendered6 supplied rows; notebook displays2 cells with stored count7 explicitly reported and imported text/html omitted. Malformed ragged CSV rejected while last admitted table retained. Seeded bootstrap calculated mean6.5 and95% interval[3.7975,9.9],1000 resamples/seed42 with model assumptions. |
| Audio | Narrow waveform/spectrum/spectrogram rendered from declared PCM;440Hz tone peak437.5Hz at7.81Hz finite-bin resolution. Explicit Play/Stop controls accepted without alert. No microphone, soundfont or automatic playback. This does not verify audible fidelity, codec hardware or pronunciation. |
| Narrow overflow | Language, maths and audio reported document scrollWidth373==clientWidth373. Local long code/table regions may scroll; not whole-page overflow. No physical touch,200% browser zoom, Firefox, NVDA or TalkBack acceptance performed. |

## Evidence files

- `browser/math-desktop.jpg`: actual mathematical DOM probe result.
- `browser/math-narrow.jpg`: real child viewport with passing mathematical probes.
- `browser/three-fallback.jpg`: actual WebGL unavailable fallback, not a rendered model.
- `browser/reader-capture.txt`: exact Reader annotation quotation snapshot; screenshot retains surrounding context but dialog placement is clipped in this standalone lab wrapper.
- `browser/python-plot.txt`: actual source/input hash/output snapshot.
- `browser/python-symbolic.txt` and `.jpg`: actual computed exact result with captured input.

One full-page screenshot request timed out; no full-page file is claimed. Viewport screenshots succeeded. Runtime timing is one local observation, not a benchmark of hosted latency or a promise for Pixel hardware. CPU watchdogs do not provide hard WASM memory quotas. Physical mobile and owner-private asset dispatch remain explicit future acceptance tasks.
