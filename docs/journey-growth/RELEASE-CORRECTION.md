# Search coverage correction and release gates

The global Search previously treated an empty bounded eligible scan as a completed empty search even when the server returned a continuation cursor. An older eligible Article or Note beyond the roughly 2 MB scan budget could therefore be hidden behind “Nothing here matches yet”.

Search now follows at most three empty scan windows per action. It stops as soon as useful records or definitions arrive. When coverage remains incomplete, it says that older saved work remains unsearched and offers “Search older saved work”. Loaded results accumulate through the existing revision-aware merge. Definitive empty results require completed coverage and no outstanding cursor, loading state or error. Cancellation, replaced queries and owner/workspace generation changes fence every automatic request and response. The server's exact matching, eligible projection, rights checks and stable cursors are unchanged.

The regression uses 95 irrelevant long Notes followed by an older matching Article and Note. The first scan returns zero matches with incomplete coverage; two automatic reads find both older matches. Other targeted cases cover the three-window bound, useful-result stopping, definitions, complete emptiness, cursor non-advancement, errors, cancellation and generation changes.

Local full validation: 737 tests, 736 passed, zero failures, one Rust-toolchain skip; typecheck and production build passed. The reviewed PR baseline had 732 passing tests in CI, including Rust execution. Final CI must supply that same toolchain and pass all 737 before release.

## Performance

The eligible projected-record path introduced in PR #37 materializes candidate content and applies rights-aware readable-text matching. Compared with the previous SQL title/body prefilter it spends more CPU and transfers more JSON internally, especially for sparse queries in long Notes. In the isolated 97-record regression the first scan used eight prepared queries, examined 77 candidates (about 1.82 MB raw JSON), and took 166 ms; a narrowly equivalent ASCII SQL prefilter for that independent-prose fixture returned two candidates/588 bytes in 17 ms. These are local fixture observations, not hosted latency estimates or a claim that raw SQL is equivalent for restricted content, Unicode or rendered Markdown.

Each server request remains bounded; one client action makes at most three sequential requests (roughly 6 MB of scan work), with cancellation and explicit continuation after the bound. No semantic search, external index or new infrastructure is introduced. A very large sparse corpus still requires deliberate continuation. Hosted-scale latency remains an operational limitation, not evidence of completed coverage.

## Recovery and acceptance boundary

Release requires an available verified protected checkpoint, unchanged owner-private access and exact GitHub/native source-tree identity. Recovery activation and storage replacement are not part of release. After semantic terminal captures are written, a code-only rollback must retain a compatible reader: reviewed PR commit `14fa9a9e11ac594cf4a15ea64af99d225b4ee172` (tree `8374e1746004d4e20ac1c5065103cc2ec7975f38`) supplies that fallback. Do not deploy the older V26 reader as a shortcut or restore learner storage.

Production acceptance uses inventoried synthetic records with recoverable Trash cleanup and compares the original record identities, revisions and renditions. Server catalogue and authenticated browser/MCP acceptance are distinct from the owner's subsequent genuinely fresh installed-plugin conversation and physical Android checks. Final deployment identifiers and actual acceptance results belong in the release receipt on PR #37.
