# Search performance and mobile sheet — PR67

Implemented over V44, preserving the released diagram system and Atlas retirement.

The header search uses a compact top-aligned native dialog on mobile, with a fixed input and independently scrolling results. Opening it closes mobile navigation. Empty input has no redundant explainer. Escape, initial input focus and return to the search trigger use native modal semantics. Visible viewport resize/scroll bounds follow the on-screen keyboard; the native dialog maximum width is explicitly reset. Desktop retains its ordinary inline search. Debounce is 200ms; cancellation and generation guards remain intact.

Library result membership/count reads are batched. Global canonical-reference and Library reads run concurrently. Current Article catalogue heads are prefetched in rolling windows of at most 32, and bounded candidates share learning-scope lookups. Library projection avoids repeating its independently validated joined catalogue overlay. Caches are request-local; current source-rights projection, destination validation, ranking, matching, scan limits, continuation and epoch checks remain authoritative. No corpus prefilter, persistent index, learner write, or search-history write was introduced.

Reproduce the isolated measurement with `node scripts/benchmark-search.mjs /tmp/minamo-search-benchmark.json` from the repository root.

## Local measurement

Real domain HTTP handler with Miniflare D1/R2, isolated TEST-ONLY owner; 372 independently authored synthetic records (180 Articles, 180 Notes, 12 areas). Five queries: nc, quoted TCP connection, ordered byte stream, saved intention, no-match-probe. Each endpoint has five first samples and 25 repeat samples. Dispatch wall time includes local Worker/DB communication; prepared-statement counts include all reads in the handler. This is not production latency, cold-cache latency or Cloudflare Worker CPU.

| Endpoint / repeat phase | V44 p50 / p95 ms | Final p50 / p95 ms | Median prepared statements before / after |
|---|---|---|---|
| Global query | 218.06 / 273.04 | 88.19 / 94.80 | 234 / 25 |
| Library | 143.03 / 173.43 | 28.86 / 33.41 | 188 / 8 |

PR67's original metadata-only batching did not materially improve the full-scan paths. Request-local catalogue/scope batching addresses that additional repeated work. Timing varies by host; SQL-count regression tests are the deterministic acceptance guard.

Browser QA uses the existing development-only Interface laboratory and synthetic domain transport, with real iframe document widths. At 320px, empty sheet is 304px wide and 124px high; populated sheet remains inside the 844px viewport with a scrolling result region. At 390px and 420px height, the compact empty sheet fits without horizontal overflow. Escape restores the search trigger. Tablet uses desktop inline search and Ctrl K focuses it. Physical Android IME, screen-reader hardware, production p50/p95 and Cloudflare CPU were unavailable; visualViewport integration is not a claim of physical-device acceptance.

All synthetic measurement fixtures are isolated and disposed by the test fixture; no hosted learner or Netcat record is modified. V44 remains the production rollback reference.

## Verification receipt

Typecheck and complete production build passed. The complete `pnpm test` run covered 1,270 tests: 1,265 passed, four existing skips, and one compiled-worker startup failure because build output was being replaced concurrently. After the build completed, all five compiled-worker test files were rerun sequentially against that output: 31/31 passed, including the originally failing Activity/MCP workflow. This resolves the only failure; it is not a claim that the initial full-suite command exited successfully. The focused batching/sheet check also passed 5/5. The benchmark script was rerun successfully and retained the same 25/8 median prepared-statement counts. No remote CI result is claimed.
